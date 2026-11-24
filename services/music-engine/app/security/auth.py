from __future__ import annotations

import uuid
from typing import Any
from urllib.parse import quote

import httpx
import jwt
from pydantic import BaseModel, Field

from app.core.config import Settings
from app.core.errors import (
    AccessDeniedError,
    AccountStatusUnavailableError,
    AuthenticationError,
)
from app.core.logging import get_logger

logger = get_logger("auth")

_ASYMMETRIC_JWT_ALGORITHMS = frozenset({"ES256", "RS256", "PS256", "EdDSA"})


class AuthenticatedUser(BaseModel):
    """Verified Supabase user identity extracted from a Bearer JWT."""

    id: str
    email: str | None = None
    role: str = "authenticated"
    claims: dict[str, Any] = Field(default_factory=dict)


def _validate_uuid_subject(sub: Any) -> str:
    if not isinstance(sub, str) or not sub.strip():
        raise AuthenticationError("Token subject ('sub') is missing.", code="INVALID_TOKEN")
    try:
        parsed = str(uuid.UUID(sub.strip()))
    except ValueError as exc:
        raise AuthenticationError("Token subject ('sub') is not a valid user UUID.", code="INVALID_TOKEN") from exc
    return parsed


class SupabaseAuthVerifier:
    """
    Verifies Supabase Auth Bearer JWTs safely across both symmetric and asymmetric Supabase
    project signing configurations:
      - `mode="auto"` (default): inspects the JWT header safely (rejecting unsigned/unsupported
        algorithms), verifies `HS256` locally when `SUPABASE_JWT_SECRET` is configured, and
        delegates asymmetric signing algorithms (`ES256`, `RS256`, `PS256`, `EdDSA`) to Supabase
        Auth `GET /auth/v1/user` when `SUPABASE_URL` + API key are configured.
      - `mode="remote"`: always delegates verification to Supabase Auth `GET /auth/v1/user`.
      - `mode="hs256"`: enforces local `HS256` verification via `SUPABASE_JWT_SECRET`.

    Also enforces fail-closed active profile verification (`public.profiles.account_status`)
    whenever `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured.
    """

    def __init__(self, settings: Settings, http_client: httpx.AsyncClient | None = None) -> None:
        self._settings = settings
        self._http_client = http_client

    async def verify_bearer_token(self, authorization_header: str | None) -> AuthenticatedUser:
        if not authorization_header:
            raise AuthenticationError("Missing Authorization header.", code="MISSING_TOKEN")

        parts = authorization_header.strip().split(" ", 1)
        if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
            raise AuthenticationError(
                "Authorization header must follow 'Bearer <token>' format.",
                code="INVALID_AUTH_HEADER",
            )

        token = parts[1].strip()
        user = await self._decode_or_introspect_token(token)
        await self._verify_account_active(user.id)
        return user

    def _remote_auth_configured(self) -> tuple[str, str]:
        supabase_url = self._settings.supabase_url.strip().rstrip("/")
        api_key = (
            self._settings.supabase_publishable_key.strip()
            or self._settings.supabase_service_role_key.strip()
        )
        return supabase_url, api_key

    def _decode_hs256_locally(self, token: str, jwt_secret: str) -> AuthenticatedUser:
        try:
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256"],
                audience=self._settings.supabase_jwt_audience,
                options={"require": ["exp", "sub"]},
            )
        except jwt.ExpiredSignatureError as exc:
            raise AuthenticationError("Authentication token has expired.", code="TOKEN_EXPIRED") from exc
        except jwt.InvalidTokenError as exc:
            raise AuthenticationError("Invalid authentication token.", code="INVALID_TOKEN") from exc

        user_id = _validate_uuid_subject(payload.get("sub"))
        return AuthenticatedUser(
            id=user_id,
            email=payload.get("email"),
            role=str(payload.get("role") or "authenticated"),
            claims=payload,
        )

    async def _introspect_token_remote(self, token: str) -> AuthenticatedUser:
        supabase_url, api_key = self._remote_auth_configured()
        if not supabase_url or not api_key:
            raise AuthenticationError(
                "Supabase authentication verification is not configured on the music engine.",
                code="AUTH_NOT_CONFIGURED",
            )

        headers = {
            "apikey": api_key,
            "Authorization": f"Bearer {token}",
        }
        try:
            if self._http_client is not None:
                response = await self._http_client.get(
                    f"{supabase_url}/auth/v1/user",
                    headers=headers,
                    timeout=8.0,
                )
            else:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    response = await client.get(f"{supabase_url}/auth/v1/user", headers=headers)
        except httpx.HTTPError as exc:
            logger.warning(
                "Failed to reach Supabase Auth endpoint (%s)",
                type(exc).__name__,
            )
            raise AuthenticationError(
                "Unable to verify authentication session with Supabase Auth.",
                code="AUTH_PROVIDER_UNREACHABLE",
            ) from exc

        if response.status_code in (401, 403):
            raise AuthenticationError("Invalid or expired Supabase session token.", code="INVALID_TOKEN")
        if response.status_code >= 400:
            raise AuthenticationError(
                f"Supabase Auth verification failed (HTTP {response.status_code}).",
                code="AUTH_VERIFICATION_FAILED",
            )

        try:
            data = response.json()
        except ValueError as exc:
            raise AuthenticationError(
                "Supabase Auth returned a malformed verification response.",
                code="AUTH_VERIFICATION_FAILED",
            ) from exc

        if not isinstance(data, dict):
            raise AuthenticationError(
                "Supabase Auth returned an unexpected verification payload.",
                code="AUTH_VERIFICATION_FAILED",
            )

        user_id = _validate_uuid_subject(data.get("id"))
        return AuthenticatedUser(
            id=user_id,
            email=data.get("email"),
            role=str(data.get("role") or "authenticated"),
            claims=data,
        )

    @staticmethod
    def _inspect_jwt_algorithm(token: str) -> str | None:
        """Parses the unverified JWT header algorithm if `token` is JWT-shaped; returns None if not a JWT."""
        if token.count(".") != 2:
            return None
        try:
            header = jwt.get_unverified_header(token)
        except jwt.InvalidTokenError as exc:
            raise AuthenticationError("Invalid authentication token.", code="INVALID_TOKEN") from exc
        if not isinstance(header, dict):
            raise AuthenticationError("Invalid authentication token header.", code="INVALID_TOKEN")
        alg = header.get("alg")
        if not isinstance(alg, str) or not alg.strip():
            raise AuthenticationError("Authentication token is missing an algorithm header.", code="INVALID_TOKEN")
        cleaned = alg.strip()
        if cleaned.lower() == "none":
            raise AuthenticationError("Unsigned authentication tokens are not permitted.", code="INVALID_TOKEN")
        return cleaned

    async def _decode_or_introspect_token(self, token: str) -> AuthenticatedUser:
        mode = self._settings.supabase_jwt_verification_mode
        jwt_secret = self._settings.supabase_jwt_secret.strip()
        supabase_url, api_key = self._remote_auth_configured()
        remote_available = bool(supabase_url and api_key)

        alg = self._inspect_jwt_algorithm(token)

        if mode == "remote":
            if alg is not None and alg != "HS256" and alg not in _ASYMMETRIC_JWT_ALGORITHMS:
                raise AuthenticationError("Unsupported authentication token algorithm.", code="INVALID_TOKEN")
            return await self._introspect_token_remote(token)

        if mode == "hs256":
            if not jwt_secret:
                raise AuthenticationError(
                    "Local HS256 JWT verification is enabled but SUPABASE_JWT_SECRET is not configured.",
                    code="AUTH_NOT_CONFIGURED",
                )
            if alg != "HS256":
                raise AuthenticationError(
                    "Authentication token algorithm does not match configured HS256 verification mode.",
                    code="INVALID_TOKEN",
                )
            return self._decode_hs256_locally(token, jwt_secret)

        # mode == "auto"
        if alg == "HS256":
            if jwt_secret:
                return self._decode_hs256_locally(token, jwt_secret)
            if remote_available:
                return await self._introspect_token_remote(token)
            raise AuthenticationError(
                "Supabase authentication verification is not configured on the music engine.",
                code="AUTH_NOT_CONFIGURED",
            )

        if alg in _ASYMMETRIC_JWT_ALGORITHMS:
            # Never force HS256 against asymmetric Supabase project signing keys (ES256/RS256/etc.).
            if remote_available:
                return await self._introspect_token_remote(token)
            raise AuthenticationError(
                "Asymmetric JWT verification requires SUPABASE_URL and a Supabase API key.",
                code="AUTH_NOT_CONFIGURED",
            )

        if alg is not None:
            raise AuthenticationError("Unsupported authentication token algorithm.", code="INVALID_TOKEN")

        # Non-JWT-shaped token: delegate only when remote Supabase Auth is configured without local secret.
        if remote_available and not jwt_secret:
            return await self._introspect_token_remote(token)
        raise AuthenticationError("Invalid authentication token.", code="INVALID_TOKEN")

    async def _verify_account_active(self, user_id: str) -> None:
        """
        Checks public.profiles.account_status when service-role PostgREST access is configured.

        Fail-safe policy (never fails open):
          - Active profile (`account_status == "active"`) -> allow.
          - Suspended, archived, or non-active profile -> HTTP 403 (`ACCOUNT_INACTIVE`).
          - Missing profile row -> HTTP 403 (`ACCOUNT_PROFILE_MISSING`).
          - Network error, timeout, non-200 HTTP response, or malformed payload ->
            HTTP 503 (`ACCOUNT_STATUS_UNAVAILABLE`) without leaking internal DB details.
        """
        supabase_url = self._settings.supabase_url.strip().rstrip("/")
        service_key = self._settings.supabase_service_role_key.strip()
        if not supabase_url or not service_key:
            return

        headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Accept": "application/json",
        }
        encoded_user_id = quote(user_id, safe="")
        url = f"{supabase_url}/rest/v1/profiles?id=eq.{encoded_user_id}&select=id,account_status"
        try:
            if self._http_client is not None:
                response = await self._http_client.get(url, headers=headers, timeout=6.0)
            else:
                async with httpx.AsyncClient(timeout=6.0) as client:
                    response = await client.get(url, headers=headers)
        except httpx.TimeoutException as exc:
            logger.warning(
                "Account-status verification timed out",
                extra={"user_id": user_id, "error_type": type(exc).__name__},
            )
            raise AccountStatusUnavailableError() from exc
        except httpx.HTTPError as exc:
            logger.warning(
                "Account-status verification request failed (%s)",
                type(exc).__name__,
                extra={"user_id": user_id, "error_type": type(exc).__name__},
            )
            raise AccountStatusUnavailableError() from exc

        if response.status_code != 200:
            logger.warning(
                "Account-status verification returned unexpected HTTP %s",
                response.status_code,
                extra={"user_id": user_id, "upstream_status": response.status_code},
            )
            raise AccountStatusUnavailableError()

        try:
            rows = response.json()
        except ValueError as exc:
            logger.warning(
                "Account-status verification returned non-JSON payload",
                extra={"user_id": user_id},
            )
            raise AccountStatusUnavailableError() from exc

        if not isinstance(rows, list):
            logger.warning(
                "Account-status verification returned unexpected payload type (%s)",
                type(rows).__name__,
                extra={"user_id": user_id},
            )
            raise AccountStatusUnavailableError()

        if len(rows) == 0:
            logger.warning(
                "Account-status verification found no profile row for authenticated user",
                extra={"user_id": user_id},
            )
            raise AccessDeniedError(
                "Account profile is missing or not active.",
                code="ACCOUNT_PROFILE_MISSING",
            )

        profile = rows[0]
        if not isinstance(profile, dict):
            logger.warning(
                "Account-status verification returned malformed profile entry",
                extra={"user_id": user_id},
            )
            raise AccountStatusUnavailableError()

        raw_status = profile.get("account_status")
        if not isinstance(raw_status, str) or not raw_status.strip():
            logger.warning(
                "Account-status verification returned missing or non-string account_status",
                extra={"user_id": user_id},
            )
            raise AccountStatusUnavailableError()

        normalized_status = raw_status.strip().lower()
        if normalized_status != "active":
            raise AccessDeniedError(
                "Suspended or archived accounts cannot submit or access music processing jobs.",
                code="ACCOUNT_INACTIVE",
            )
