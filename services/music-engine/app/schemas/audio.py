from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field, model_validator


class AudioFormat(str, Enum):
    WAV = "wav"
    MP3 = "mp3"
    FLAC = "flac"
    M4A = "m4a"
    AAC = "aac"
    OGG = "ogg"
    WEBM = "webm"


class StorageBackendType(str, Enum):
    SUPABASE = "supabase"
    LOCAL = "local"


class AudioSourceRef(BaseModel):
    """Reference to a user-owned private audio file stored in Supabase Storage or local dev storage."""

    storage_backend: StorageBackendType = StorageBackendType.SUPABASE
    bucket: str = Field(min_length=1, max_length=120)
    object_path: str = Field(min_length=3, max_length=512)
    asset_id: str | None = Field(default=None, max_length=128)
    original_filename: str | None = Field(default=None, max_length=255)
    declared_mime_type: str | None = Field(default=None, max_length=120)
    declared_size_bytes: int | None = Field(default=None, ge=1)


class TrimWindow(BaseModel):
    """Non-destructive regional trim window applied during decoding without modifying the original recording."""

    start_ms: int = Field(default=0, ge=0)
    end_ms: int | None = Field(default=None, ge=1)

    @model_validator(mode="after")
    def validate_bounds(self) -> TrimWindow:
        if self.end_ms is not None and self.end_ms <= self.start_ms:
            raise ValueError("trim_window.end_ms must be strictly greater than trim_window.start_ms")
        return self


class AudioMetadata(BaseModel):
    """Verified audio stream properties produced by real FFprobe / header inspection."""

    detected_format: AudioFormat
    mime_type: str
    size_bytes: int = Field(ge=1)
    sha256_checksum: str = Field(min_length=64, max_length=64)
    duration_ms: int = Field(ge=1)
    sample_rate_hz: int = Field(ge=8000)
    channels: int = Field(ge=1, le=16)
    codec_name: str
    bit_rate_bps: int | None = None
    bit_depth: int | None = None
    original_preserved: bool = True


class AudioValidationResponse(BaseModel):
    valid: bool
    asset_reference: AudioSourceRef | None = None
    metadata: AudioMetadata
    warnings: list[str] = Field(default_factory=list)
