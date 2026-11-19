from __future__ import annotations

import asyncio
import os
import socket
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from arq import Retry
from arq.connections import RedisSettings
from arq.worker import Worker

from app.audio.preservation import cleanup_stale_workspaces
from app.core.config import Settings, get_settings
from app.core.errors import QueueIntegrationError, RetryableJobError
from app.core.logging import configure_logging, get_logger
from app.core.runtime import (
    build_pipeline,
    build_registry,
    build_repository,
    build_storage,
)
from app.jobs.queue import (
    ArqRedisQueueBackend,
    JobQueueBackend,
    PROCESS_MUSIC_JOB_FUNCTION,
    arq_job_key,
    build_redis_settings,
)
from app.jobs.repository import JobRepository
from app.processing.pipeline import ProcessingPipeline
from app.schemas.common import ErrorDetail
from app.schemas.jobs import JobResponse, JobStatus, TERMINAL_JOB_STATUSES

logger = get_logger("worker")


def make_worker_id() -> str:
    hostname = socket.gethostname()
    return f"sonora-worker-{hostname}-{os.getpid()}-{uuid.uuid4().hex[:8]}"


def calculate_retry_delay_seconds(attempt: int, base_backoff_seconds: int) -> int:
    """Bounded exponential backoff for retryable worker failures (capped at 300s)."""
    safe_attempt = max(1, attempt)
    safe_base = max(1, base_backoff_seconds)
    delay = safe_base * (2 ** (safe_attempt - 1))
    return min(300, delay)


async def recover_orphaned_jobs(
    *,
    settings: Settings,
    repository: JobRepository,
    queue: JobQueueBackend,
    worker_id: str,
) -> dict[str, int]:
    """
    Reconciles jobs left stuck in `processing` after an abrupt worker crash/restart.

    Compatible with Supabase migration 0002's monotonic state trigger:
      - Never transitions `processing` back to `queued`.
      - If a cancellation signal exists, transitions cleanly to `cancelled`.
      - Otherwise keeps `status = 'processing'`, updates `stage = 'recovering_after_worker_restart'`,
        and re-enqueues into ARQ with a fresh recovery dispatch ID.
      - If re-enqueueing fails, marks the job terminal `failed` with `WORKER_INTERRUPTED`.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(
        seconds=settings.music_engine_stale_job_timeout_seconds
    )
    stale_jobs = await repository.list_stale_processing_jobs(older_than=cutoff, limit=50)
    summary = {"inspected": len(stale_jobs), "requeued": 0, "cancelled": 0, "failed": 0}

    for stale in stale_jobs:
        if stale.status in TERMINAL_JOB_STATUSES:
            continue

        now = datetime.now(timezone.utc)
        if await queue.is_cancel_requested(stale.job_id):
            cancelled = stale.model_copy(
                update={
                    "status": JobStatus.CANCELLED,
                    "stage": "cancelled",
                    "cancelled_at": stale.cancelled_at or now,
                    "updated_at": now,
                }
            )
            await repository.update(cancelled)
            await queue.clear_cancel_signal(stale.job_id)
            summary["cancelled"] += 1
            logger.info(
                "Finalized cancelled orphaned job during worker startup recovery",
                extra={
                    "job_id": stale.job_id,
                    "user_id": stale.user_id,
                    "status": cancelled.status.value,
                    "worker_id": worker_id,
                    "queue_backend": queue.backend_name,
                },
            )
            continue

        recovery_dispatch_id = f"{arq_job_key(stale.job_id)}:recover:{int(now.timestamp())}"
        try:
            recovering = stale.model_copy(
                update={
                    "status": JobStatus.PROCESSING,
                    "stage": "recovering_after_worker_restart",
                    "updated_at": now,
                }
            )
            await repository.update(recovering)
            await queue.enqueue(
                recovering,
                correlation_id=f"recovery-{worker_id}",
                job_id_override=recovery_dispatch_id,
            )
            summary["requeued"] += 1
            logger.warning(
                "Re-enqueued orphaned processing job after worker restart",
                extra={
                    "job_id": stale.job_id,
                    "user_id": stale.user_id,
                    "job_type": stale.job_type.value,
                    "status": recovering.status.value,
                    "worker_id": worker_id,
                    "queue_backend": queue.backend_name,
                },
            )
        except Exception as exc:
            failed = stale.model_copy(
                update={
                    "status": JobStatus.FAILED,
                    "stage": "failed",
                    "error": ErrorDetail(
                        code="WORKER_INTERRUPTED",
                        message=(
                            "Processing worker restarted before this job completed and automatic "
                            "recovery enqueue failed. Please resubmit the job."
                        ),
                        retryable=True,
                        details={"exception_type": type(exc).__name__},
                    ),
                    "completed_at": now,
                    "updated_at": now,
                }
            )
            await repository.update(failed)
            summary["failed"] += 1
            logger.error(
                "Failed to recover orphaned processing job; marked terminal failed",
                extra={
                    "job_id": stale.job_id,
                    "user_id": stale.user_id,
                    "status": failed.status.value,
                    "error_code": "WORKER_INTERRUPTED",
                    "worker_id": worker_id,
                    "queue_backend": queue.backend_name,
                },
            )

    return summary


async def process_music_job(
    ctx: dict[str, Any],
    job_id: str,
    correlation_id: str | None = None,
) -> dict[str, Any]:
    """
    Dedicated ARQ worker task executing a single SONORA music processing job.

    Authoritative state lives in `repository` (Supabase `public.processing_jobs` in production).
    Redis/Valkey provides durable dispatch, retry scheduling, and cooperative cancel signals.
    """
    settings: Settings = ctx["settings"]
    repository: JobRepository = ctx["repository"]
    pipeline: ProcessingPipeline = ctx["pipeline"]
    queue: JobQueueBackend = ctx["queue"]
    worker_id: str = ctx.get("worker_id") or "sonora-worker"

    attempt = int(ctx.get("job_try", 1) or 1)
    max_tries = settings.music_engine_job_max_retries

    job = await repository.get_by_id(job_id)
    if job is None:
        logger.warning(
            "Worker received unknown job_id; skipping idempotently",
            extra={
                "job_id": job_id,
                "correlation_id": correlation_id,
                "attempt": attempt,
                "max_tries": max_tries,
                "worker_id": worker_id,
                "queue_backend": queue.backend_name,
            },
        )
        return {"job_id": job_id, "status": "missing", "skipped": True}

    if job.status in TERMINAL_JOB_STATUSES:
        logger.info(
            "Skipping duplicate delivery for already-terminal job",
            extra={
                "job_id": job.job_id,
                "user_id": job.user_id,
                "job_type": job.job_type.value,
                "status": job.status.value,
                "correlation_id": correlation_id,
                "attempt": attempt,
                "max_tries": max_tries,
                "worker_id": worker_id,
                "queue_backend": queue.backend_name,
            },
        )
        await queue.clear_cancel_signal(job.job_id)
        return {"job_id": job.job_id, "status": job.status.value, "skipped": True}

    async def is_cancelled() -> bool:
        if await queue.is_cancel_requested(job.job_id):
            return True
        latest = await repository.get_by_id(job.job_id)
        return latest is not None and latest.status == JobStatus.CANCELLED

    async def persist_if_not_terminal(updated: JobResponse) -> JobResponse:
        latest = await repository.get_by_id(updated.job_id)
        if latest is not None and latest.status in TERMINAL_JOB_STATUSES:
            # Never overwrite an already-terminal state (especially `cancelled` set by the API).
            return latest
        return await repository.update(updated)

    try:
        result_job = await pipeline.run(
            job=job,
            persist_update=persist_if_not_terminal,
            is_cancelled=is_cancelled,
            correlation_id=correlation_id,
            attempt=attempt,
            max_tries=max_tries,
            timeout_seconds=settings.music_engine_job_timeout_seconds,
            defer_on_retryable=True,
            worker_id=worker_id,
        )
    except RetryableJobError as retry_err:
        delay = calculate_retry_delay_seconds(
            attempt=retry_err.attempt,
            base_backoff_seconds=settings.music_engine_job_retry_backoff_seconds,
        )
        logger.warning(
            "Deferring retryable job %s for %ss (attempt %s/%s)",
            job.job_id,
            delay,
            retry_err.attempt,
            retry_err.max_tries,
            extra={
                "job_id": job.job_id,
                "user_id": job.user_id,
                "job_type": job.job_type.value,
                "status": JobStatus.PROCESSING.value,
                "error_code": retry_err.cause.code,
                "correlation_id": correlation_id,
                "attempt": retry_err.attempt,
                "max_tries": retry_err.max_tries,
                "worker_id": worker_id,
                "queue_backend": queue.backend_name,
            },
        )
        raise Retry(defer=delay) from retry_err

    if result_job.status in TERMINAL_JOB_STATUSES:
        await queue.clear_cancel_signal(result_job.job_id)

    return {
        "job_id": result_job.job_id,
        "status": result_job.status.value,
        "attempt": attempt,
    }


async def startup(ctx: dict[str, Any]) -> None:
    """ARQ worker startup hook: initializes shared services, cleans stale workspaces, and recovers orphans."""
    settings: Settings = ctx.get("settings") or get_settings()
    configure_logging(settings.music_engine_log_level)
    settings.temp_path.mkdir(parents=True, exist_ok=True)

    worker_id = ctx.get("worker_id") or make_worker_id()
    storage = ctx.get("storage") or build_storage(settings)
    repository = ctx.get("repository") or build_repository(settings)
    registry = ctx.get("registry") or build_registry(settings, storage)
    pipeline = ctx.get("pipeline") or build_pipeline(settings, registry)
    queue: JobQueueBackend = ctx.get("queue") or ArqRedisQueueBackend(
        settings=settings,
        pool=ctx.get("redis"),
    )

    ctx["settings"] = settings
    ctx["worker_id"] = worker_id
    ctx["storage"] = storage
    ctx["repository"] = repository
    ctx["registry"] = registry
    ctx["pipeline"] = pipeline
    ctx["queue"] = queue

    removed_workspaces = cleanup_stale_workspaces(
        settings.temp_path,
        settings.music_engine_stale_workspace_max_age_seconds,
    )

    recovery_summary = {"inspected": 0, "requeued": 0, "cancelled": 0, "failed": 0}
    try:
        recovery_summary = await recover_orphaned_jobs(
            settings=settings,
            repository=repository,
            queue=queue,
            worker_id=worker_id,
        )
    except Exception as exc:
        logger.warning(
            "Orphaned job recovery encountered an error on startup (%s); worker will still process new jobs",
            type(exc).__name__,
            extra={"worker_id": worker_id, "queue_backend": queue.backend_name},
        )

    ctx["startup_removed_workspaces"] = removed_workspaces
    ctx["startup_recovery_summary"] = recovery_summary

    logger.info(
        "SONORA durable music worker started (removed_stale_workspaces=%s, recovered=%s)",
        removed_workspaces,
        recovery_summary,
        extra={
            "status": "started",
            "worker_id": worker_id,
            "queue_backend": queue.backend_name,
        },
    )


async def shutdown(ctx: dict[str, Any]) -> None:
    worker_id = ctx.get("worker_id") or "sonora-worker"
    queue: JobQueueBackend | None = ctx.get("queue")
    if queue is not None:
        await queue.close()
    logger.info(
        "SONORA durable music worker stopped",
        extra={"status": "stopped", "worker_id": worker_id},
    )


def _resolve_worker_redis_settings(settings: Settings) -> RedisSettings:
    if settings.arq_queue_configured:
        return build_redis_settings(settings)
    # Safe default allowing module import in test/CLI introspection before env is exported;
    # `run_worker()` enforces explicit MUSIC_ENGINE_REDIS_URL before connecting.
    return RedisSettings()


def build_worker_settings_class(settings: Settings | None = None) -> type:
    resolved = settings or get_settings()

    class _ConfiguredWorkerSettings:
        functions = [process_music_job]
        on_startup = startup
        on_shutdown = shutdown
        redis_settings = _resolve_worker_redis_settings(resolved)
        queue_name = resolved.music_engine_arq_queue_name
        max_jobs = resolved.music_engine_worker_max_jobs
        # Give ProcessingPipeline's internal asyncio.wait_for timeout 30s headroom to persist
        # JOB_TIMEOUT and remove temp workspaces cleanly before ARQ cancels the coroutine.
        job_timeout = resolved.music_engine_job_timeout_seconds + 30
        max_tries = resolved.music_engine_job_max_retries
        allow_abort_jobs = True
        keep_result = 3600

    _ConfiguredWorkerSettings.__name__ = "WorkerSettings"
    return _ConfiguredWorkerSettings


# Entry point for `arq app.worker.WorkerSettings`
WorkerSettings = build_worker_settings_class()


def run_worker(settings: Settings | None = None) -> None:
    """Explicit CLI runner (`python -m app.worker`) enforcing configured Valkey/Redis URL."""
    resolved = settings or get_settings()
    configure_logging(resolved.music_engine_log_level)
    redis_settings = build_redis_settings(resolved)
    worker = Worker(
        functions=[process_music_job],
        on_startup=startup,
        on_shutdown=shutdown,
        redis_settings=redis_settings,
        queue_name=resolved.music_engine_arq_queue_name,
        max_jobs=resolved.music_engine_worker_max_jobs,
        job_timeout=resolved.music_engine_job_timeout_seconds + 30,
        max_tries=resolved.music_engine_job_max_retries,
        allow_abort_jobs=True,
        keep_result=3600,
        ctx={"settings": resolved},
    )
    logger.info(
        "Launching ARQ worker against %s (queue=%s, max_jobs=%s, max_tries=%s, timeout=%ss)",
        resolved.redacted_redis_target,
        resolved.music_engine_arq_queue_name,
        resolved.music_engine_worker_max_jobs,
        resolved.music_engine_job_max_retries,
        resolved.music_engine_job_timeout_seconds,
        extra={"queue_backend": "arq"},
    )
    worker.run()


assert process_music_job.__name__ == PROCESS_MUSIC_JOB_FUNCTION


if __name__ == "__main__":
    try:
        run_worker()
    except QueueIntegrationError as exc:
        logger.error(
            "Worker startup aborted: %s",
            exc.message,
            extra={"error_code": exc.code, "queue_backend": "arq"},
        )
        raise SystemExit(1) from exc
