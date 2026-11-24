from __future__ import annotations

from pathlib import Path
from urllib.parse import quote

import httpx

from app.core.config import Settings
from app.core.errors import AccessDeniedError, ResourceNotFoundError, StorageIntegrationError
from app.storage.base import StorageAdapter, StorageObjectInfo, validate_storage_object_path


class SupabaseStorageAdapter(StorageAdapter):
    """
    Supabase Storage REST adapter using server-side service-role credentials.
    Must only be called after UserStoragePathGuard verifies user ownership of `object_path`.
    """

    def __init__(self, settings: Settings, http_client: httpx.AsyncClient | None = None) -> None:
        self._base_url = settings.supabase_url.strip().rstrip("/")
        self._service_key = settings.supabase_service_role_key.strip()
        self._allowed_bucket = settings.supabase_audio_bucket.strip()
        self._http_client = http_client

    def _ensure_configured(self) -> None:
        if not self._base_url or not self._service_key:
            raise StorageIntegrationError(
                "Supabase Storage is not configured (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required).",
                code="STORAGE_NOT_CONFIGURED",
                status_code=503,
                retryable=False,
            )

    def _headers(self, extra: dict[str, str] | None = None) -> dict[str, str]:
        headers = {
            "apikey": self._service_key,
            "Authorization": f"Bearer {self._service_key}",
        }
        if extra:
            headers.update(extra)
        return headers

    @staticmethod
    def _encode_path(bucket: str, object_path: str) -> str:
        encoded_bucket = quote(bucket, safe="")
        encoded_object = quote(object_path, safe="/")
        return f"{encoded_bucket}/{encoded_object}"

    async def head_object(self, bucket: str, object_path: str) -> StorageObjectInfo:
        self._ensure_configured()
        encoded = self._encode_path(bucket, object_path)
        url = f"{self._base_url}/storage/v1/object/info/{encoded}"
        try:
            if self._http_client is not None:
                response = await self._http_client.get(url, headers=self._headers(), timeout=10.0)
            else:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.get(url, headers=self._headers())
        except httpx.HTTPError as exc:
            raise StorageIntegrationError(
                f"Failed to contact Supabase Storage: {exc}",
                code="STORAGE_UNREACHABLE",
            ) from exc

        if response.status_code in (400, 404):
            raise ResourceNotFoundError(
                f"Audio object '{object_path}' was not found in bucket '{bucket}'.",
                code="AUDIO_OBJECT_NOT_FOUND",
            )
        if response.status_code >= 400:
            raise StorageIntegrationError(
                f"Supabase Storage metadata request failed with HTTP {response.status_code}.",
                code="STORAGE_METADATA_ERROR",
            )

        payload = response.json()
        meta = payload.get("metadata") if isinstance(payload.get("metadata"), dict) else {}
        size = int(payload.get("size") or meta.get("size") or 0)
        content_type = payload.get("content_type") or meta.get("mimetype")
        etag = payload.get("etag") or meta.get("eTag")
        return StorageObjectInfo(
            bucket=bucket,
            object_path=object_path,
            size_bytes=size,
            content_type=content_type,
            etag=etag,
        )

    async def download_to_path(self, bucket: str, object_path: str, destination: Path) -> StorageObjectInfo:
        self._ensure_configured()
        info = await self.head_object(bucket, object_path)
        encoded = self._encode_path(bucket, object_path)
        url = f"{self._base_url}/storage/v1/object/{encoded}"

        destination.parent.mkdir(parents=True, exist_ok=True)
        try:
            if self._http_client is not None:
                response = await self._http_client.get(url, headers=self._headers(), timeout=60.0)
                if response.status_code == 404:
                    raise ResourceNotFoundError(
                        f"Audio object '{object_path}' not found.",
                        code="AUDIO_OBJECT_NOT_FOUND",
                    )
                if response.status_code >= 400:
                    raise StorageIntegrationError(
                        f"Failed to download audio from Supabase Storage (HTTP {response.status_code})."
                    )
                destination.write_bytes(response.content)
            else:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    async with client.stream("GET", url, headers=self._headers()) as response:
                        if response.status_code == 404:
                            raise ResourceNotFoundError(
                                f"Audio object '{object_path}' not found.",
                                code="AUDIO_OBJECT_NOT_FOUND",
                            )
                        if response.status_code >= 400:
                            raise StorageIntegrationError(
                                f"Failed to download audio from Supabase Storage (HTTP {response.status_code})."
                            )
                        with destination.open("wb") as f:
                            async for chunk in response.aiter_bytes(chunk_size=65536):
                                f.write(chunk)
        except httpx.HTTPError as exc:
            raise StorageIntegrationError(
                f"Network error while downloading audio from Supabase Storage: {exc}",
                code="STORAGE_DOWNLOAD_FAILED",
            ) from exc

        actual_size = destination.stat().st_size
        return StorageObjectInfo(
            bucket=bucket,
            object_path=object_path,
            size_bytes=actual_size or info.size_bytes,
            content_type=info.content_type,
            etag=info.etag,
        )

    async def upload_from_path(
        self,
        bucket: str,
        object_path: str,
        source: Path,
        content_type: str,
    ) -> StorageObjectInfo:
        self._ensure_configured()
        encoded = self._encode_path(bucket, object_path)
        url = f"{self._base_url}/storage/v1/object/{encoded}"
        payload = source.read_bytes()
        headers = self._headers({"Content-Type": content_type, "x-upsert": "true"})

        try:
            if self._http_client is not None:
                response = await self._http_client.post(url, headers=headers, content=payload, timeout=60.0)
            else:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(url, headers=headers, content=payload)
        except httpx.HTTPError as exc:
            raise StorageIntegrationError(
                f"Failed to upload artifact to Supabase Storage: {exc}",
                code="STORAGE_UPLOAD_FAILED",
            ) from exc

        if response.status_code >= 400:
            raise StorageIntegrationError(
                f"Supabase Storage upload failed with HTTP {response.status_code}.",
                code="STORAGE_UPLOAD_FAILED",
            )

        return StorageObjectInfo(
            bucket=bucket,
            object_path=object_path,
            size_bytes=len(payload),
            content_type=content_type,
        )

    @staticmethod
    def _is_not_found_response(response: httpx.Response) -> bool:
        if response.status_code == 404:
            return True
        if response.status_code == 400:
            try:
                body = response.json()
            except ValueError:
                body = {}
            if isinstance(body, dict):
                status_str = str(body.get("statusCode") or "").strip()
                err_str = str(body.get("error") or "").lower()
                msg_str = str(body.get("message") or "").lower()
                if status_str == "404" or "not_found" in err_str or "not found" in msg_str:
                    return True
        return False

    async def delete_object(self, bucket: str, object_path: str) -> bool:
        self._ensure_configured()
        clean_bucket, clean_path = validate_storage_object_path(bucket, object_path)
        if self._allowed_bucket and clean_bucket != self._allowed_bucket:
            raise AccessDeniedError(
                f"Storage bucket '{clean_bucket}' is not permitted for deletion.",
                code="BUCKET_NOT_ALLOWED",
            )

        encoded = self._encode_path(clean_bucket, clean_path)
        url = f"{self._base_url}/storage/v1/object/{encoded}"
        try:
            if self._http_client is not None:
                response = await self._http_client.delete(url, headers=self._headers(), timeout=15.0)
            else:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    response = await client.delete(url, headers=self._headers())
        except httpx.HTTPError as exc:
            raise StorageIntegrationError(
                f"Failed to delete object from Supabase Storage ({type(exc).__name__}).",
                code="STORAGE_DELETE_FAILED",
                status_code=502,
                retryable=True,
            ) from exc

        if self._is_not_found_response(response):
            return False
        if response.status_code >= 400:
            raise StorageIntegrationError(
                f"Supabase Storage delete failed with HTTP {response.status_code}.",
                code="STORAGE_DELETE_FAILED",
                status_code=502,
                retryable=response.status_code >= 500,
            )
        return True

    async def create_signed_url(
        self,
        bucket: str,
        object_path: str,
        expires_in_seconds: int = 300,
    ) -> str:
        self._ensure_configured()
        encoded = self._encode_path(bucket, object_path)
        url = f"{self._base_url}/storage/v1/object/sign/{encoded}"
        headers = self._headers({"Content-Type": "application/json"})

        try:
            if self._http_client is not None:
                response = await self._http_client.post(
                    url,
                    headers=headers,
                    json={"expiresIn": expires_in_seconds},
                    timeout=10.0,
                )
            else:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.post(
                        url,
                        headers=headers,
                        json={"expiresIn": expires_in_seconds},
                    )
        except httpx.HTTPError as exc:
            raise StorageIntegrationError(
                f"Failed to generate Supabase signed URL: {exc}",
                code="STORAGE_SIGN_FAILED",
            ) from exc

        if response.status_code == 404:
            raise ResourceNotFoundError(
                f"Audio object '{object_path}' not found.",
                code="AUDIO_OBJECT_NOT_FOUND",
            )
        if response.status_code >= 400:
            raise StorageIntegrationError(
                f"Supabase signed URL request failed with HTTP {response.status_code}.",
                code="STORAGE_SIGN_FAILED",
            )

        signed_path = str(response.json().get("signedURL") or "").lstrip("/")
        if signed_path.startswith("http://") or signed_path.startswith("https://"):
            return signed_path
        return f"{self._base_url}/storage/v1/{signed_path}"
