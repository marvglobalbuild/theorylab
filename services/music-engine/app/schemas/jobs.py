from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field

from app.schemas.audio import AudioMetadata, AudioSourceRef, TrimWindow
from app.schemas.common import ErrorDetail


class JobType(str, Enum):
    AUDIO_ANALYSIS = "audio_analysis"
    INSTRUMENT_DETECTION = "instrument_detection"
    SOURCE_SEPARATION = "source_separation"
    PITCH_EXTRACTION = "pitch_extraction"
    MUSIC_TRANSCRIPTION = "music_transcription"
    ACCOMPANIMENT_GENERATION = "accompaniment_generation"
    AUDIO_RENDERING = "audio_rendering"


class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


TERMINAL_JOB_STATUSES = frozenset({JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED})


class JobArtifactRef(BaseModel):
    artifact_type: str
    storage_backend: str
    bucket: str | None = None
    object_path: str
    mime_type: str
    size_bytes: int | None = None


class JobCreateRequest(BaseModel):
    job_type: JobType
    source_audio: AudioSourceRef
    trim_window: TrimWindow | None = None
    parameters: dict[str, Any] = Field(default_factory=dict)
    studio_context: str | None = Field(default=None, max_length=64)
    idempotency_key: str | None = Field(default=None, min_length=4, max_length=128)


class JobResponse(BaseModel):
    job_id: str
    user_id: str
    job_type: JobType
    status: JobStatus
    progress_percent: int = Field(ge=0, le=100)
    stage: str
    source_audio: AudioSourceRef
    trim_window: TrimWindow | None = None
    parameters: dict[str, Any] = Field(default_factory=dict)
    studio_context: str | None = None
    audio_metadata: AudioMetadata | None = None
    artifacts: list[JobArtifactRef] = Field(default_factory=list)
    result: dict[str, Any] | None = None
    error: ErrorDetail | None = None
    created_at: datetime
    updated_at: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None
    cancelled_at: datetime | None = None


class JobCancelRequest(BaseModel):
    reason: str | None = Field(default=None, max_length=256)


class JobCancelResponse(BaseModel):
    job_id: str
    status: JobStatus
    cancelled: bool
    message: str
    job: JobResponse


class ArtifactSignedUrlRequest(BaseModel):
    object_path: str = Field(min_length=3, max_length=512)
    expires_in_seconds: int = Field(default=300, ge=60, le=900)


class ArtifactSignedUrlResponse(BaseModel):
    job_id: str
    object_path: str
    mime_type: str
    filename: str
    storage_backend: str
    access_mode: str
    signed_url: str | None = None
    download_path: str
    expires_in_seconds: int

