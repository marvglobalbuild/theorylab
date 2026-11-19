from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    code: str
    message: str
    retryable: bool = False
    details: dict[str, Any] = Field(default_factory=dict)


class ErrorEnvelope(BaseModel):
    error: ErrorDetail
    request_id: str | None = None


class DependencyHealth(BaseModel):
    ffmpeg_available: bool
    ffprobe_available: bool
    fluidsynth_available: bool = False
    soundfont_available: bool = False
    soundfont_name: str | None = None
    supabase_auth_configured: bool
    supabase_storage_configured: bool
    supabase_db_configured: bool
    redis_queue_configured: bool = False
    redis_queue_reachable: bool | None = None


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    service: str
    version: str
    environment: str
    uptime_seconds: float
    timestamp: datetime
    storage_backend: str
    job_repository_backend: str
    queue_backend: str = "in_process"
    active_jobs: int
    dependencies: DependencyHealth
