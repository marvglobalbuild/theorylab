from __future__ import annotations

import re
from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path

from app.core.errors import AccessDeniedError, ValidationError

_SAFE_SEGMENT_RE = re.compile(r"^[A-Za-z0-9._-]+$")


def validate_storage_object_path(bucket: str, object_path: str) -> tuple[str, str]:
    """
    Validates bucket and object_path syntax for any storage operation (especially deletion).
    Prevents empty/root paths, path traversal (`..`), backslashes, null bytes, and unsafe segments.
    """
    clean_bucket = bucket.strip()
    if (
        not clean_bucket
        or "/" in clean_bucket
        or "\\" in clean_bucket
        or "\x00" in clean_bucket
        or clean_bucket in (".", "..")
        or not _SAFE_SEGMENT_RE.match(clean_bucket)
    ):
        raise ValidationError(
            "Invalid storage bucket name.",
            code="INVALID_STORAGE_PATH",
        )

    raw = object_path.strip()
    if not raw or raw.startswith("/") or raw.startswith("\\") or "\x00" in raw or "\\" in raw:
        raise ValidationError(
            "Invalid storage object_path format.",
            code="INVALID_STORAGE_PATH",
        )

    segments = raw.split("/")
    if any(seg in ("", ".", "..") or not _SAFE_SEGMENT_RE.match(seg) for seg in segments):
        raise ValidationError(
            "Storage object_path contains unsafe or disallowed characters.",
            code="INVALID_STORAGE_PATH",
        )

    if len(segments) < 2:
        raise ValidationError(
            "Storage object_path must include a filename inside the user's namespace.",
            code="INVALID_STORAGE_PATH",
        )

    return clean_bucket, "/".join(segments)


@dataclass(frozen=True, slots=True)
class StorageObjectInfo:
    bucket: str
    object_path: str
    size_bytes: int
    content_type: str | None = None
    etag: str | None = None


class UserStoragePathGuard:
    """
    Enforces strict per-user private storage isolation.
    All user-owned files must reside under `{user_id}/...` with no traversal segments.
    """

    @staticmethod
    def normalize_and_verify(
        user_id: str,
        bucket: str,
        object_path: str,
        allowed_bucket: str,
    ) -> str:
        clean_bucket = bucket.strip()
        if clean_bucket != allowed_bucket:
            raise AccessDeniedError(
                f"Storage bucket '{clean_bucket}' is not permitted for music processing.",
                code="BUCKET_NOT_ALLOWED",
            )

        _, normalized_path = validate_storage_object_path(clean_bucket, object_path)
        owner_prefix = normalized_path.split("/", 1)[0]
        if owner_prefix != user_id:
            raise AccessDeniedError(
                "You do not have access to audio files belonging to another user.",
                code="STORAGE_ACCESS_DENIED",
            )

        return normalized_path


class StorageAdapter(ABC):
    """Abstract storage interface implemented by SupabaseStorageAdapter and LocalFilesystemStorageAdapter."""

    @abstractmethod
    async def head_object(self, bucket: str, object_path: str) -> StorageObjectInfo:
        """Verify file existence and retrieve size/content_type metadata without fetching full payload."""

    @abstractmethod
    async def download_to_path(self, bucket: str, object_path: str, destination: Path) -> StorageObjectInfo:
        """Stream private audio object to a temporary local working file without altering the original."""

    @abstractmethod
    async def upload_from_path(
        self,
        bucket: str,
        object_path: str,
        source: Path,
        content_type: str,
    ) -> StorageObjectInfo:
        """Upload a generated artifact to private storage."""

    @abstractmethod
    async def delete_object(self, bucket: str, object_path: str) -> bool:
        """
        Delete an exact object from private storage.

        Returns True if the object existed and was deleted, or False if it was already absent
        (idempotent). Implementations must validate bucket/object_path strictly to prevent
        path traversal, root/directory deletion, or unauthorized deletion.
        """

    @abstractmethod
    async def create_signed_url(
        self,
        bucket: str,
        object_path: str,
        expires_in_seconds: int = 300,
    ) -> str:
        """Issue a short-lived signed URL for an authorized user-owned object."""
