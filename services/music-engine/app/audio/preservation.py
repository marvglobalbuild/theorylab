from __future__ import annotations

import hashlib
import shutil
from pathlib import Path

from app.audio.validation import (
    get_media_category,
    probe_audio_stream,
    sniff_audio_format_from_bytes,
    validate_declared_extension_and_mime,
    validate_file_size,
)
from app.core.config import Settings
from app.core.errors import AudioValidationError
from app.processing.interfaces import AudioIngestionInterface, IngestedAudio
from app.schemas.audio import AudioSourceRef
from app.storage.base import StorageAdapter, UserStoragePathGuard


def compute_sha256(file_path: Path) -> str:
    digest = hashlib.sha256()
    with file_path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


class DefaultAudioIngestionService(AudioIngestionInterface):
    """
    Validates user ownership, verifies file size/headers/stream integrity,
    preserves the original recording untouched in storage, and stages a working copy
    with its SHA-256 checksum inside an isolated per-job workspace.
    """

    def __init__(self, settings: Settings, storage: StorageAdapter) -> None:
        self._settings = settings
        self._storage = storage

    async def ingest(
        self,
        job_id: str,
        user_id: str,
        source_ref: AudioSourceRef,
        workspace_dir: Path,
    ) -> IngestedAudio:
        normalized_path = UserStoragePathGuard.normalize_and_verify(
            user_id=user_id,
            bucket=source_ref.bucket,
            object_path=source_ref.object_path,
            allowed_bucket=self._settings.supabase_audio_bucket,
        )

        validate_declared_extension_and_mime(
            filename=source_ref.original_filename or Path(normalized_path).name,
            declared_mime_type=source_ref.declared_mime_type,
        )

        if source_ref.declared_size_bytes is not None:
            validate_file_size(
                source_ref.declared_size_bytes,
                self._settings.music_engine_max_file_size_bytes,
            )

        object_info = await self._storage.head_object(source_ref.bucket, normalized_path)
        actual_size = object_info.size_bytes

        workspace_dir.mkdir(parents=True, exist_ok=True)
        suffix = Path(source_ref.original_filename or normalized_path).suffix.lower() or ".audio"
        staged_original_copy = workspace_dir / f"source_working_copy{suffix}"

        await self._storage.download_to_path(
            bucket=source_ref.bucket,
            object_path=normalized_path,
            destination=staged_original_copy,
        )

        with staged_original_copy.open("rb") as handle:
            header = handle.read(64)

        detected_format = sniff_audio_format_from_bytes(
            header=header,
            filename=source_ref.original_filename or normalized_path,
        )
        category = get_media_category(detected_format)
        validate_file_size(actual_size, self._settings.music_engine_max_file_size_bytes, category=category)

        max_dur = (
            self._settings.music_engine_max_midi_duration_seconds
            if category.value == "midi"
            else self._settings.music_engine_max_duration_seconds
        )

        checksum = compute_sha256(staged_original_copy)
        metadata = await probe_audio_stream(
            file_path=staged_original_copy,
            detected_format=detected_format,
            sha256_checksum=checksum,
            size_bytes=actual_size,
            max_duration_seconds=max_dur,
            ffprobe_bin=self._settings.ffprobe_bin,
        )

        # Ensure the working copy is marked read-only so downstream DSP/FFmpeg never mutates it
        try:
            staged_original_copy.chmod(0o444)
        except OSError:
            pass

        sanitized_ref = source_ref.model_copy(update={"object_path": normalized_path})
        return IngestedAudio(
            job_id=job_id,
            user_id=user_id,
            source_ref=sanitized_ref,
            preserved_working_copy_path=str(staged_original_copy),
            metadata=metadata,
        )


def validate_uploaded_bytes_metadata(
    data: bytes,
    filename: str | None,
    declared_mime_type: str | None,
    max_size_bytes: int,
) -> tuple[str, int]:
    """Helper for direct audio/video/MIDI upload validation before writing to workspace/storage."""
    validate_declared_extension_and_mime(filename, declared_mime_type)
    if len(data) == 0:
        raise AudioValidationError(
            "Media file is empty (0 bytes).",
            code="EMPTY_AUDIO_FILE",
        )
    if len(data) < 4:
        raise AudioValidationError(
            "Uploaded media data is too short to contain a valid header.",
            code="CORRUPTED_OR_EMPTY_AUDIO",
        )
    detected = sniff_audio_format_from_bytes(data[:64], filename=filename)
    category = get_media_category(detected)
    validate_file_size(len(data), max_size_bytes, category=category)
    return detected.value, len(data)


def cleanup_workspace(workspace_dir: Path) -> None:
    if not workspace_dir.exists():
        return
    for item in workspace_dir.rglob("*"):
        try:
            if item.is_file():
                item.chmod(0o644)
        except OSError:
            pass
    shutil.rmtree(workspace_dir, ignore_errors=True)


def cleanup_stale_workspaces(temp_root: Path, max_age_seconds: int) -> int:
    """
    Removes orphaned per-job temporary directories older than `max_age_seconds`.
    Safe to run during worker startup/recovery after a hard crash or restart.
    """
    if not temp_root.exists() or not temp_root.is_dir():
        return 0

    import time

    cutoff = time.time() - max(0, max_age_seconds)
    removed = 0
    for entry in temp_root.iterdir():
        try:
            if not entry.is_dir():
                continue
            if entry.stat().st_mtime <= cutoff:
                cleanup_workspace(entry)
                removed += 1
        except OSError:
            continue
    return removed
