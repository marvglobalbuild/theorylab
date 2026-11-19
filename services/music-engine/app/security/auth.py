from __future__ import annotations

import uuid
from typing import Any

import httpx
import jwt
from pydantic import BaseModel, Field

from app.core.config import Settings
from app.core.errors import AccessDeniedError, AuthenticationError
from app.core.logging import get_logger

logger = get_logger("auth")


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
    Verifies Supabase Auth Bearer JWTs using either:
      1. Local HS256 JWT signature verification via SUPABASE_JWT_SECRET, or
      2. Supabase Auth REST verification (GET /auth/v1/user) when SUPABASE_URL is set.
    Also enforces active profile status when SUPABASE_SERVICE_ROLE_KEY is configured.
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

    async def _decode_or_introspect_token(self, token: str) -> AuthenticatedUser:
        jwt_secret = self._settings.supabase_jwt_secret.strip()
        if jwt_secret:
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

        supabase_url = self._settings.supabase_url.strip().rstrip("/")
        api_key = (
            self._settings.supabase_publishable_key.strip()
            or self._settings.supabase_service_role_key.strip()
        )
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
                response = await self._http_client.get(f"{supabase_url}/auth/v1/user", headers=headers, timeout=8.0)
            else:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    response = await client.get(f"{supabase_url}/auth/v1/user", headers=headers)
        except httpx.HTTPError as exc:
            logger.warning("Failed to reach Supabase Auth endpoint: %s", exc)
            raise AuthenticationError(
                "Unable to verify authentication session with Supabase Auth.",
                code="AUTH_PROVIDER_UNREACHABLE",
            ) from exc

        if response.status_code in (401, 403):
            raise AuthenticationError("Invalid or expired Supabase session token.", code="INVALID_TOKEN")
        if response.status_code >= 400:
            raise AuthenticationError(
                f"Supabase Auth returned HTTP {response.status_code}.",
                code="AUTH_VERIFICATION_FAILED",
            )

        data = response.json()
        user_id = _validate_uuid_subject(data.get("id"))
        return AuthenticatedUser(
            id=user_id,
            email=data.get("email"),
            role=str(data.get("role") or "authenticated"),
            claims=data,
        )

    async def _verify_account_active(self, user_id: str) -> None:
        """Checks public.profiles.account_status when service-role PostgREST access is configured."""
        supabase_url = self._settings.supabase_url.strip().rstrip("/")
        service_key = self._settings.supabase_service_role_key.strip()
        if not supabase_url or not service_key:
            return

        headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Accept": "application/json",
        }
        url = f"{supabase_url}/rest/v1/profiles?id=eq.{user_id}&select=id,account_status"
        try:
            if self._http_client is not None:
                response = await self._http_client.get(url, headers=headers, timeout=6.0)
            else:
                async with httpx.AsyncClient(timeout=6.0) as client:
                    response = await client.get(url, headers=headers)
        except httpx.HTTPError as exc:
            logger.warning("Could not query profile account_status: %s", exc)
            return

        if response.status_code != 200:
            return

        rows = response.json()
        if isinstance(rows, list) and rows:
            status = str(rows[0].get("account_status") or "active").lower()
            if status != "active":
                raise AccessDeniedError(
                    "Suspended or archived accounts cannot submit or access music processing jobs.",
                    code="ACCOUNT_INACTIVE",
                )
