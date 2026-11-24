from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile, status

from app.api.dependencies import (
    get_app_settings,
    get_asset_repository,
    get_current_user,
    get_storage_adapter,
)
from app.audio.preservation import cleanup_workspace, compute_sha256, validate_uploaded_bytes_metadata
from app.audio.validation import probe_audio_stream
from app.core.config import Settings
from app.core.logging import get_logger
from app.jobs.assets import AudioAssetRecord, AudioAssetRepository
from app.schemas.audio import (
    AudioFormat,
    AudioSourceRef,
    AudioValidationResponse,
    StorageBackendType,
)
from app.security.auth import AuthenticatedUser
from app.storage.base import StorageAdapter, UserStoragePathGuard

router = APIRouter(prefix="/api/v1/audio", tags=["Audio"])
logger = get_logger("audio")

_MAX_SAFE_FILENAME_LEN = 180


def _sanitize_upload_filename(filename: str | None, detected_format: str) -> str:
    raw = (filename or f"recording.{detected_format}").strip()
    base = Path(raw).name
    cleaned = re.sub(r"[^A-Za-z0-9._-]", "_", base).lstrip(".")
    if not cleaned:
        return f"recording.{detected_format}"
    if "." not in cleaned:
        cleaned = f"{cleaned}.{detected_format}"
    if len(cleaned) > _MAX_SAFE_FILENAME_LEN:
        suffix = Path(cleaned).suffix[:16] or f".{detected_format}"
        stem = cleaned[: max(1, _MAX_SAFE_FILENAME_LEN - len(suffix))].rstrip(".") or "recording"
        cleaned = f"{stem}{suffix}"
    return cleaned


@router.post(
    "/validate",
    response_model=AudioValidationResponse,
    summary="Validate an uploaded audio file's type, size, header, and stream integrity",
)
async def validate_audio_upload(
    file: UploadFile = File(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
    settings: Settings = Depends(get_app_settings),
) -> AudioValidationResponse:
    raw_bytes = await file.read(settings.music_engine_max_file_size_bytes + 1)
    detected_format_str, size_bytes = validate_uploaded_bytes_metadata(
        data=raw_bytes,
        filename=file.filename,
        declared_mime_type=file.content_type,
        max_size_bytes=settings.music_engine_max_file_size_bytes,
    )

    workspace_dir = settings.temp_path / f"validate-{current_user.id}-{uuid.uuid4()}"
    workspace_dir.mkdir(parents=True, exist_ok=True)
    suffix = Path(file.filename or f"audio.{detected_format_str}").suffix.lower() or f".{detected_format_str}"
    temp_file = workspace_dir / f"upload_probe{suffix}"

    try:
        temp_file.write_bytes(raw_bytes)
        checksum = compute_sha256(temp_file)
        metadata = await probe_audio_stream(
            file_path=temp_file,
            detected_format=AudioFormat(detected_format_str),
            sha256_checksum=checksum,
            size_bytes=size_bytes,
            max_duration_seconds=settings.music_engine_max_duration_seconds,
            ffprobe_bin=settings.ffprobe_bin,
        )
        return AudioValidationResponse(valid=True, metadata=metadata)
    finally:
        cleanup_workspace(workspace_dir)


@router.post(
    "/upload",
    response_model=AudioValidationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Validate and store a private user-owned vocal audio recording without modifying it",
)
async def upload_private_audio(
    file: UploadFile = File(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
    settings: Settings = Depends(get_app_settings),
    storage: StorageAdapter = Depends(get_storage_adapter),
    asset_repo: AudioAssetRepository = Depends(get_asset_repository),
) -> AudioValidationResponse:
    raw_bytes = await file.read(settings.music_engine_max_file_size_bytes + 1)
    detected_format_str, size_bytes = validate_uploaded_bytes_metadata(
        data=raw_bytes,
        filename=file.filename,
        declared_mime_type=file.content_type,
        max_size_bytes=settings.music_engine_max_file_size_bytes,
    )

    asset_id = str(uuid.uuid4())
    safe_filename = _sanitize_upload_filename(file.filename, detected_format_str)
    bucket = settings.supabase_audio_bucket
    object_path = UserStoragePathGuard.normalize_and_verify(
        user_id=current_user.id,
        bucket=bucket,
        object_path=f"{current_user.id}/uploads/{asset_id}/{safe_filename}",
        allowed_bucket=bucket,
    )

    workspace_dir = settings.temp_path / f"upload-{current_user.id}-{asset_id}"
    workspace_dir.mkdir(parents=True, exist_ok=True)
    temp_file = workspace_dir / safe_filename

    try:
        temp_file.write_bytes(raw_bytes)
        checksum = compute_sha256(temp_file)
        metadata = await probe_audio_stream(
            file_path=temp_file,
            detected_format=AudioFormat(detected_format_str),
            sha256_checksum=checksum,
            size_bytes=size_bytes,
            max_duration_seconds=settings.music_engine_max_duration_seconds,
            ffprobe_bin=settings.ffprobe_bin,
        )

        stored = await storage.upload_from_path(
            bucket=bucket,
            object_path=object_path,
            source=temp_file,
            content_type=metadata.mime_type,
        )

        now = datetime.now(timezone.utc)
        asset_record = AudioAssetRecord(
            id=asset_id,
            user_id=current_user.id,
            bucket=bucket,
            object_path=stored.object_path,
            original_filename=safe_filename,
            mime_type=metadata.mime_type,
            size_bytes=stored.size_bytes,
            duration_ms=metadata.duration_ms,
            detected_format=metadata.detected_format.value,
            sha256_checksum=metadata.sha256_checksum,
            sample_rate_hz=metadata.sample_rate_hz,
            channels=metadata.channels,
            codec_name=metadata.codec_name,
            bit_rate_bps=metadata.bit_rate_bps,
            bit_depth=metadata.bit_depth,
            original_preserved=True,
            verified_at=now,
            created_at=now,
            updated_at=now,
        )
        try:
            persisted_asset = await asset_repo.create_or_get(asset_record)
        except Exception as persist_exc:
            rollback_deleted: bool | None = None
            rollback_error_type: str | None = None
            try:
                rollback_deleted = await storage.delete_object(bucket, stored.object_path)
            except Exception as cleanup_exc:
                rollback_error_type = type(cleanup_exc).__name__

            log_extra = {
                "user_id": current_user.id,
                "asset_id": asset_id,
                "object_path": stored.object_path,
                "error_type": type(persist_exc).__name__,
                "rollback_deleted": rollback_deleted,
                "rollback_error_type": rollback_error_type,
            }
            if rollback_error_type is not None:
                logger.error(
                    "Metadata persistence failed after storage upload and storage rollback also failed",
                    extra=log_extra,
                )
            else:
                logger.warning(
                    "Metadata persistence failed after storage upload; rolled back uploaded object (deleted=%s)",
                    rollback_deleted,
                    extra=log_extra,
                )
            raise

        backend_type = (
            StorageBackendType.SUPABASE
            if settings.music_engine_storage_backend == "supabase"
            else StorageBackendType.LOCAL
        )
        asset_ref = AudioSourceRef(
            storage_backend=backend_type,
            bucket=persisted_asset.bucket,
            object_path=persisted_asset.object_path,
            asset_id=persisted_asset.id,
            original_filename=persisted_asset.original_filename,
            declared_mime_type=persisted_asset.mime_type,
            declared_size_bytes=persisted_asset.size_bytes,
        )
        return AudioValidationResponse(
            valid=True,
            asset_reference=asset_ref,
            metadata=metadata,
        )
    finally:
        cleanup_workspace(workspace_dir)

