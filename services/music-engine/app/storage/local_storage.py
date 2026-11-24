from __future__ import annotations

import mimetypes
import shutil
from pathlib import Path

from app.core.errors import ResourceNotFoundError, StorageIntegrationError, ValidationError
from app.storage.base import StorageAdapter, StorageObjectInfo, validate_storage_object_path


class LocalFilesystemStorageAdapter(StorageAdapter):
    """
    Local disk storage adapter for standalone development and automated tests.
    Preserves bucket/user_id object hierarchy without modifying source objects during reads.
    """

    def __init__(self, root_dir: Path) -> None:
        self._root_dir = root_dir.resolve()
        self._root_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_object_path(self, bucket: str, object_path: str) -> Path:
        clean_bucket, clean_path = validate_storage_object_path(bucket, object_path)
        bucket_root = (self._root_dir / clean_bucket).resolve()
        candidate = (bucket_root / clean_path).resolve()
        try:
            candidate.relative_to(bucket_root)
        except ValueError as exc:
            raise ValidationError(
                "Resolved local storage path escapes bucket root.",
                code="INVALID_STORAGE_PATH",
            ) from exc
        if candidate == bucket_root:
            raise ValidationError(
                "Storage object_path cannot target the bucket root.",
                code="INVALID_STORAGE_PATH",
            )
        return candidate

    async def head_object(self, bucket: str, object_path: str) -> StorageObjectInfo:
        target = self._resolve_object_path(bucket, object_path)
        if not target.is_file():
            raise ResourceNotFoundError(
                f"Audio object '{object_path}' was not found in bucket '{bucket}'.",
                code="AUDIO_OBJECT_NOT_FOUND",
            )
        guessed_type, _ = mimetypes.guess_type(target.name)
        return StorageObjectInfo(
            bucket=bucket,
            object_path=object_path,
            size_bytes=target.stat().st_size,
            content_type=guessed_type,
        )

    async def download_to_path(self, bucket: str, object_path: str, destination: Path) -> StorageObjectInfo:
        info = await self.head_object(bucket, object_path)
        source = self._resolve_object_path(bucket, object_path)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        return info

    async def upload_from_path(
        self,
        bucket: str,
        object_path: str,
        source: Path,
        content_type: str,
    ) -> StorageObjectInfo:
        if not source.is_file():
            raise StorageIntegrationError(
                "Source artifact file does not exist for upload.",
                code="UPLOAD_SOURCE_MISSING",
                status_code=500,
                retryable=False,
            )
        target = self._resolve_object_path(bucket, object_path)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        return StorageObjectInfo(
            bucket=bucket,
            object_path=object_path,
            size_bytes=target.stat().st_size,
            content_type=content_type,
        )

    async def delete_object(self, bucket: str, object_path: str) -> bool:
        target = self._resolve_object_path(bucket, object_path)
        if target.is_dir():
            raise ValidationError(
                "Cannot delete a directory path from local storage.",
                code="INVALID_STORAGE_PATH",
            )
        if not target.exists():
            return False
        try:
            target.unlink()
            return True
        except FileNotFoundError:
            return False
        except OSError as exc:
            raise StorageIntegrationError(
                f"Failed to delete object from local storage ({type(exc).__name__}).",
                code="STORAGE_DELETE_FAILED",
                status_code=502,
                retryable=True,
            ) from exc

    async def create_signed_url(
        self,
        bucket: str,
        object_path: str,
        expires_in_seconds: int = 300,
    ) -> str:
        await self.head_object(bucket, object_path)
        return f"local://{bucket}/{object_path}?expires_in={expires_in_seconds}"
