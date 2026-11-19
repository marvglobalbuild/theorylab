from __future__ import annotations

import asyncio
import uuid
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any
from urllib.parse import quote

import httpx
from pydantic import BaseModel, Field

from app.core.config import Settings
from app.core.errors import AccessDeniedError, StorageIntegrationError, ValidationError
from app.storage.base import UserStoragePathGuard


def _require_uuid(value: str, field_name: str) -> str:
    try:
        return str(uuid.UUID(value.strip()))
    except (ValueError, AttributeError) as exc:
        raise ValidationError(
            f"{field_name} must be a valid UUID.",
            code="INVALID_UUID",
            details={"field": field_name},
        ) from exc


class AudioAssetRecord(BaseModel):
    """Persistent metadata record mirroring `public.audio_assets` in migration 0002."""

    id: str
    user_id: str
    bucket: str
    object_path: str
    original_filename: str = Field(min_length=1, max_length=255)
    mime_type: str = Field(min_length=1, max_length=120)
    size_bytes: int = Field(ge=1)
    duration_ms: int | None = Field(default=None, ge=1)
    detected_format: str | None = None
    sha256_checksum: str | None = Field(default=None, min_length=64, max_length=64)
    sample_rate_hz: int | None = Field(default=None, ge=8000)
    channels: int | None = Field(default=None, ge=1, le=16)
    codec_name: str | None = None
    bit_rate_bps: int | None = None
    bit_depth: int | None = None
    original_preserved: bool = True
    verified_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class AudioAssetRepository(ABC):
    """Persistence contract for user-owned `public.audio_assets` metadata rows."""

    @abstractmethod
    async def create_or_get(self, asset: AudioAssetRecord) -> AudioAssetRecord:
        """Persist an audio asset row idempotently (duplicate-safe for the owning user)."""

    @abstractmethod
    async def get_by_id(self, asset_id: str) -> AudioAssetRecord | None:
        """Fetch an audio asset metadata row by primary key UUID."""

    @abstractmethod
    async def find_by_storage_path(self, bucket: str, object_path: str) -> AudioAssetRecord | None:
        """Fetch an audio asset metadata row by unique (bucket, object_path)."""


class InMemoryAudioAssetRepository(AudioAssetRepository):
    """Task-safe in-memory audio asset repository for local execution and automated tests."""

    def __init__(self, allowed_bucket: str = "sonora-audio") -> None:
        self._lock = asyncio.Lock()
        self._allowed_bucket = allowed_bucket.strip() or "sonora-audio"
        self._by_id: dict[str, AudioAssetRecord] = {}
        self._by_path: dict[tuple[str, str], str] = {}

    async def create_or_get(self, asset: AudioAssetRecord) -> AudioAssetRecord:
        asset_id = _require_uuid(asset.id, "id")
        user_id = _require_uuid(asset.user_id, "user_id")
        normalized_path = UserStoragePathGuard.normalize_and_verify(
            user_id=user_id,
            bucket=asset.bucket,
            object_path=asset.object_path,
            allowed_bucket=self._allowed_bucket,
        )
        normalized = asset.model_copy(
            update={
                "id": asset_id,
                "user_id": user_id,
                "bucket": asset.bucket.strip(),
                "object_path": normalized_path,
                "mime_type": asset.mime_type.strip().lower(),
                "original_preserved": True,
            }
        )
        async with self._lock:
            existing_id_for_path = self._by_path.get((normalized.bucket, normalized.object_path))
            if existing_id_for_path is not None:
                existing = self._by_id[existing_id_for_path]
                if existing.user_id != user_id:
                    raise AccessDeniedError(
                        "You do not have permission to reference another user's audio asset.",
                        code="STORAGE_ACCESS_DENIED",
                    )
                return existing

            existing_by_id = self._by_id.get(asset_id)
            if existing_by_id is not None:
                if existing_by_id.user_id != user_id:
                    raise AccessDeniedError(
                        "You do not have permission to reference another user's audio asset.",
                        code="STORAGE_ACCESS_DENIED",
                    )
                return existing_by_id

            self._by_id[asset_id] = normalized
            self._by_path[(normalized.bucket, normalized.object_path)] = asset_id
            return normalized

    async def get_by_id(self, asset_id: str) -> AudioAssetRecord | None:
        try:
            normalized_id = str(uuid.UUID(asset_id.strip()))
        except (ValueError, AttributeError):
            return None
        async with self._lock:
            return self._by_id.get(normalized_id)

    async def find_by_storage_path(self, bucket: str, object_path: str) -> AudioAssetRecord | None:
        key = (bucket.strip(), object_path.strip())
        async with self._lock:
            asset_id = self._by_path.get(key)
            if asset_id is None:
                return None
            return self._by_id.get(asset_id)


class SupabaseAudioAssetRepository(AudioAssetRepository):
    """
    PostgREST repository persisting verified upload metadata into `public.audio_assets`.
    Requires `supabase/migrations/0002_music_intelligence_storage_and_jobs.sql`.
    """

    def __init__(self, settings: Settings, http_client: httpx.AsyncClient | None = None) -> None:
        self._base_url = settings.supabase_url.strip().rstrip("/")
        self._service_key = settings.supabase_service_role_key.strip()
        self._table = settings.supabase_assets_table.strip() or "audio_assets"
        self._allowed_bucket = settings.supabase_audio_bucket.strip() or "sonora-audio"
        self._http_client = http_client

    def _ensure_configured(self) -> None:
        if not self._base_url or not self._service_key:
            raise StorageIntegrationError(
                "Supabase audio asset persistence requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
                code="DATABASE_NOT_CONFIGURED",
                status_code=503,
                retryable=False,
            )

    def _headers(self, extra: dict[str, str] | None = None) -> dict[str, str]:
        headers = {
            "apikey": self._service_key,
            "Authorization": f"Bearer {self._service_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        if extra:
            headers.update(extra)
        return headers

    def _serialize(self, asset: AudioAssetRecord) -> dict[str, Any]:
        asset_id = _require_uuid(asset.id, "id")
        user_id = _require_uuid(asset.user_id, "user_id")
        normalized_path = UserStoragePathGuard.normalize_and_verify(
            user_id=user_id,
            bucket=asset.bucket,
            object_path=asset.object_path,
            allowed_bucket=self._allowed_bucket,
        )
        sanitized_bit_rate = (
            asset.bit_rate_bps if (asset.bit_rate_bps is not None and asset.bit_rate_bps > 0) else None
        )
        sanitized_bit_depth = (
            asset.bit_depth if (asset.bit_depth is not None and 8 <= asset.bit_depth <= 64) else None
        )
        return {
            "id": asset_id,
            "user_id": user_id,
            "bucket": asset.bucket.strip(),
            "object_path": normalized_path,
            "original_filename": asset.original_filename.strip()[:255],
            "mime_type": asset.mime_type.strip().lower(),
            "size_bytes": asset.size_bytes,
            "duration_ms": asset.duration_ms,
            "detected_format": asset.detected_format,
            "sha256_checksum": asset.sha256_checksum,
            "sample_rate_hz": asset.sample_rate_hz,
            "channels": asset.channels,
            "codec_name": asset.codec_name,
            "bit_rate_bps": sanitized_bit_rate,
            "bit_depth": sanitized_bit_depth,
            "original_preserved": True,
            "verified_at": asset.verified_at.isoformat() if asset.verified_at else None,
            "created_at": asset.created_at.isoformat(),
            "updated_at": asset.updated_at.isoformat(),
        }

    @staticmethod
    def _deserialize(row: dict[str, Any]) -> AudioAssetRecord:
        return AudioAssetRecord.model_validate(row)

    async def _request(self, method: str, path: str, json_body: Any = None) -> httpx.Response:
        self._ensure_configured()
        url = f"{self._base_url}/rest/v1/{path}"
        try:
            if self._http_client is not None:
                return await self._http_client.request(
                    method, url, headers=self._headers(), json=json_body, timeout=10.0
                )
            async with httpx.AsyncClient(timeout=10.0) as client:
                return await client.request(
                    method, url, headers=self._headers(), json=json_body
                )
        except httpx.HTTPError as exc:
            raise StorageIntegrationError(
                f"Failed to contact Supabase database: {exc}",
                code="DATABASE_UNREACHABLE",
            ) from exc

    async def create_or_get(self, asset: AudioAssetRecord) -> AudioAssetRecord:
        payload = self._serialize(asset)
        res = await self._request("POST", self._table, json_body=payload)
        if res.status_code == 409:
            existing = await self.find_by_storage_path(payload["bucket"], payload["object_path"])
            if existing is None:
                existing = await self.get_by_id(payload["id"])
            if existing is not None:
                if existing.user_id != payload["user_id"]:
                    raise AccessDeniedError(
                        "You do not have permission to reference another user's audio asset.",
                        code="STORAGE_ACCESS_DENIED",
                    )
                return existing
            raise StorageIntegrationError(
                "Supabase audio asset insert conflicted with an existing record.",
                code="DATABASE_WRITE_FAILED",
                details={"response": res.text[:300]},
            )
        if res.status_code >= 400:
            raise StorageIntegrationError(
                f"Supabase audio asset insert failed with HTTP {res.status_code}.",
                code="DATABASE_WRITE_FAILED",
                details={"response": res.text[:300]},
            )
        rows = res.json()
        return self._deserialize(rows[0] if isinstance(rows, list) and rows else rows)

    async def get_by_id(self, asset_id: str) -> AudioAssetRecord | None:
        try:
            normalized_id = str(uuid.UUID(asset_id.strip()))
        except (ValueError, AttributeError):
            return None
        encoded_id = quote(normalized_id, safe="")
        res = await self._request("GET", f"{self._table}?id=eq.{encoded_id}&limit=1")
        if res.status_code >= 400:
            raise StorageIntegrationError(
                f"Supabase audio asset query failed with HTTP {res.status_code}.",
                code="DATABASE_READ_FAILED",
            )
        rows = res.json()
        if not rows:
            return None
        return self._deserialize(rows[0])

    async def find_by_storage_path(self, bucket: str, object_path: str) -> AudioAssetRecord | None:
        encoded_bucket = quote(bucket.strip(), safe="")
        encoded_path = quote(object_path.strip(), safe="")
        res = await self._request(
            "GET",
            f"{self._table}?bucket=eq.{encoded_bucket}&object_path=eq.{encoded_path}&limit=1",
        )
        if res.status_code >= 400:
            raise StorageIntegrationError(
                f"Supabase audio asset query failed with HTTP {res.status_code}.",
                code="DATABASE_READ_FAILED",
            )
        rows = res.json()
        if not rows:
            return None
        return self._deserialize(rows[0])
