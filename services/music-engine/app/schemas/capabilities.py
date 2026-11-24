from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.audio import AudioFormat
from app.schemas.jobs import JobType


class FormatCapability(BaseModel):
    format: AudioFormat
    mime_types: list[str]
    decode_supported: bool
    export_supported: bool


class InterfaceReadiness(BaseModel):
    interface_name: str
    stage: str
    readiness: Literal["implemented", "interface_only"]
    description: str
    model_integrated: bool
    notes: str | None = None


class JobTypeCapability(BaseModel):
    job_type: JobType
    studio_consumers: list[str]
    status: Literal["ready", "awaiting_model_integration"]
    model_integrated: bool
    required_interfaces: list[str]
    active_provider: str | None = None
    description: str


class EngineLimits(BaseModel):
    max_file_size_bytes: int
    max_duration_seconds: int
    max_audio_file_size_bytes: int = 100 * 1024 * 1024
    max_video_file_size_bytes: int = 250 * 1024 * 1024
    max_midi_file_size_bytes: int = 20 * 1024 * 1024
    max_audio_duration_seconds: int = 600
    max_video_duration_seconds: int = 600
    max_midi_duration_seconds: int = 1800
    max_concurrent_jobs_per_user: int
    target_internal_sample_rate_hz: int = 44100
    realistic_sample_playback_required: bool = True


class EngineCapabilitiesResponse(BaseModel):
    service: str
    version: str
    phase: str = "Phase 5.2 Run 3 - Full AI Accompaniment, Vocal Mixing, Mastering & Export"
    supported_formats: list[FormatCapability]
    limits: EngineLimits
    job_types: list[JobTypeCapability]
    processing_interfaces: list[InterfaceReadiness] = Field(default_factory=list)
