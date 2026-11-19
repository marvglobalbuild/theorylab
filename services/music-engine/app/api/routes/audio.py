from __future__ import annotations

import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile, status

from app.api.dependencies import get_app_settings, get_current_user, get_storage_adapter
from app.audio.preservation import cleanup_workspace, compute_sha256, validate_uploaded_bytes_metadata
from app.audio.validation import probe_audio_stream
from app.core.config import Settings
from app.schemas.audio import (
    AudioFormat,
    AudioSourceRef,
    AudioValidationResponse,
    StorageBackendType,
)
from app.security.auth import AuthenticatedUser
from app.storage.base import StorageAdapter, UserStoragePathGuard

router = APIRouter(prefix="/api/v1/audio", tags=["Audio"])


def _sanitize_upload_filename(filename: str | None, detected_format: str) -> str:
    raw = (filename or f"recording.{detected_format}").strip()
    base = Path(raw).name
    cleaned = re.sub(r"[^A-Za-z0-9._-]", "_", base).lstrip(".")
    if not cleaned:
        return f"recording.{detected_format}"
    if "." not in cleaned:
        return f"{cleaned}.{detected_format}"
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

        backend_type = (
            StorageBackendType.SUPABASE
            if settings.music_engine_storage_backend == "supabase"
            else StorageBackendType.LOCAL
        )
        asset_ref = AudioSourceRef(
            storage_backend=backend_type,
            bucket=bucket,
            object_path=stored.object_path,
            asset_id=asset_id,
            original_filename=safe_filename,
            declared_mime_type=metadata.mime_type,
            declared_size_bytes=stored.size_bytes,
        )
        return AudioValidationResponse(
            valid=True,
            asset_reference=asset_ref,
            metadata=metadata,
        )
    finally:
        cleanup_workspace(workspace_dir)

