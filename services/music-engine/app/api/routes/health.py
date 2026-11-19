from __future__ import annotations

import shutil
import time
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, Request

from app.api.dependencies import get_app_settings, get_job_manager
from app.core.config import Settings
from app.jobs.manager import AsyncJobManager
from app.processing.instruments import InstrumentResourceManager
from app.schemas.common import DependencyHealth, HealthResponse

router = APIRouter(tags=["Health"])


def _binary_available(name: str) -> bool:
    return bool(shutil.which(name) or Path(name).is_file())


@router.get("/health", response_model=HealthResponse, summary="Service health check")
async def get_health(
    request: Request,
    settings: Settings = Depends(get_app_settings),
    job_manager: AsyncJobManager = Depends(get_job_manager),
) -> HealthResponse:
    started_at: float = getattr(request.app.state, "started_monotonic", time.monotonic())
    uptime = max(0.0, round(time.monotonic() - started_at, 3))

    ffmpeg_ok = _binary_available(settings.ffmpeg_bin)
    ffprobe_ok = _binary_available(settings.ffprobe_bin)
    inst_diag = InstrumentResourceManager(settings).get_diagnostics()
    queue_backend = job_manager.queue_backend_name
    redis_reachable: bool | None = None
    if queue_backend == "arq":
        redis_reachable = await job_manager.queue_health_check()

    queue_healthy = True if redis_reachable is None else redis_reachable
    status = "ok" if (ffmpeg_ok and ffprobe_ok and queue_healthy) else "degraded"

    return HealthResponse(
        status=status,
        service=settings.service_name,
        version=settings.service_version,
        environment=settings.music_engine_env,
        uptime_seconds=uptime,
        timestamp=datetime.now(timezone.utc),
        storage_backend=settings.music_engine_storage_backend,
        job_repository_backend=settings.music_engine_job_repository_backend,
        queue_backend=queue_backend,
        active_jobs=job_manager.active_job_count(),
        dependencies=DependencyHealth(
            ffmpeg_available=ffmpeg_ok,
            ffprobe_available=ffprobe_ok,
            fluidsynth_available=inst_diag.fluidsynth_available,
            soundfont_available=inst_diag.sound_library.available,
            soundfont_name=inst_diag.sound_library.soundfont_name,
            supabase_auth_configured=settings.supabase_auth_configured,
            supabase_storage_configured=settings.supabase_storage_configured,
            supabase_db_configured=settings.supabase_db_configured,
            redis_queue_configured=settings.arq_queue_configured,
            redis_queue_reachable=redis_reachable,
        ),
    )
