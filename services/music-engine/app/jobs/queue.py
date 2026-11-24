from __future__ import annotations

import asyncio
from abc import ABC, abstractmethod
from collections.abc import Awaitable, Callable
from typing import Any

from arq.connections import ArqRedis, RedisSettings, create_pool
from arq.jobs import Job as ArqJob, JobStatus as ArqJobStatus

from app.core.config import Settings
from app.core.errors import QueueIntegrationError
from app.core.logging import get_logger
from app.schemas.jobs import JobResponse

logger = get_logger("queue")

PROCESS_MUSIC_JOB_FUNCTION = "process_music_job"


def arq_job_key(job_id: str) -> str:
    """Deterministic ARQ job ID preventing duplicate queue entries for the same SONORA job."""
    return f"sonora-job:{job_id}"


def cancel_signal_key(job_id: str) -> str:
    """Redis/Valkey key signaling cooperative cancellation to any running worker."""
    return f"sonora:music-engine:cancel:{job_id}"


def build_redis_settings(settings: Settings) -> RedisSettings:
    dsn = settings.music_engine_redis_url.strip()
    if not dsn:
        raise QueueIntegrationError(
            "ARQ queue backend requires MUSIC_ENGINE_REDIS_URL (Valkey/Redis connection URL).",
            code="QUEUE_NOT_CONFIGURED",
            status_code=503,
            retryable=False,
        )
    try:
        return RedisSettings.from_dsn(dsn)
    except Exception as exc:
        raise QueueIntegrationError(
            "Invalid MUSIC_ENGINE_REDIS_URL format for Valkey/Redis connection.",
            code="QUEUE_CONFIG_INVALID",
            status_code=503,
            retryable=False,
        ) from exc


class JobQueueBackend(ABC):
    """Unified dispatch and cancellation contract shared by in-process (dev/test) and ARQ (production) modes."""

    backend_name: str

    @abstractmethod
    async def enqueue(
        self,
        job: JobResponse,
        *,
        correlation_id: str | None = None,
        defer_seconds: float | None = None,
        job_id_override: str | None = None,
    ) -> str:
        """Schedule job execution and return the queue-assigned dispatch identifier."""

    @abstractmethod
    async def request_cancel(self, job_id: str, *, reason: str | None = None) -> None:
        """Signal cancellation for a queued or actively running job."""

    @abstractmethod
    async def is_cancel_requested(self, job_id: str) -> bool:
        """Check whether cancellation has been signaled for `job_id`."""

    async def clear_cancel_signal(self, job_id: str) -> None:
        """Optional cleanup after terminal job completion."""

    @abstractmethod
    async def has_pending_job(self, job_id: str) -> bool:
        """
        Returns True if `job_id` is still queued, deferred, or actively in progress in the
        queue backend. Raises QueueIntegrationError if queue status cannot be verified.
        """

    @abstractmethod
    def active_job_count(self) -> int:
        """Returns locally tracked active tasks (0 for external ARQ web processes)."""

    @abstractmethod
    async def health_check(self) -> bool:
        """Returns True if the queue backend is ready to accept jobs."""

    @abstractmethod
    async def close(self) -> None:
        """Gracefully close connections or cancel local background tasks."""


class InProcessQueueBackend(JobQueueBackend):
    """
    Lightweight local asyncio task runner retained for unit tests and single-process development.
    Not intended for durable production job execution.
    """

    backend_name = "in_process"

    def __init__(
        self,
        executor: Callable[[JobResponse, str | None, Callable[[], bool]], Awaitable[JobResponse]] | None = None,
    ) -> None:
        self._executor = executor
        self._tasks: dict[str, asyncio.Task[JobResponse]] = {}
        self._cancel_flags: set[str] = set()

    def bind_executor(
        self,
        executor: Callable[[JobResponse, str | None, Callable[[], bool]], Awaitable[JobResponse]],
    ) -> None:
        self._executor = executor

    async def enqueue(
        self,
        job: JobResponse,
        *,
        correlation_id: str | None = None,
        defer_seconds: float | None = None,
        job_id_override: str | None = None,
    ) -> str:
        if self._executor is None:
            raise QueueIntegrationError(
                "In-process queue backend has no bound job executor.",
                code="QUEUE_NOT_CONFIGURED",
                retryable=False,
            )

        async def _runner() -> JobResponse:
            if defer_seconds and defer_seconds > 0:
                await asyncio.sleep(defer_seconds)
            else:
                # Yield once so POST /api/v1/jobs callers observe `queued` immediately on creation
                await asyncio.sleep(0)
            return await self._executor(
                job,
                correlation_id,
                lambda: job.job_id in self._cancel_flags,
            )

        task = asyncio.create_task(_runner(), name=f"music-job-{job.job_id}")
        self._tasks[job.job_id] = task
        task.add_done_callback(lambda _t, jid=job.job_id: self._tasks.pop(jid, None))
        return job_id_override or arq_job_key(job.job_id)

    async def request_cancel(self, job_id: str, *, reason: str | None = None) -> None:
        self._cancel_flags.add(job_id)
        task = self._tasks.get(job_id)
        if task is not None and not task.done():
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

    async def is_cancel_requested(self, job_id: str) -> bool:
        return job_id in self._cancel_flags

    async def clear_cancel_signal(self, job_id: str) -> None:
        self._cancel_flags.discard(job_id)

    async def has_pending_job(self, job_id: str) -> bool:
        task = self._tasks.get(job_id)
        return task is not None and not task.done()

    def active_job_count(self) -> int:
        return sum(1 for task in self._tasks.values() if not task.done())

    async def health_check(self) -> bool:
        return True

    async def close(self) -> None:
        active_tasks = list(self._tasks.values())
        for task in active_tasks:
            task.cancel()
        if active_tasks:
            await asyncio.gather(*active_tasks, return_exceptions=True)
        self._tasks.clear()
        self._cancel_flags.clear()


class ArqRedisQueueBackend(JobQueueBackend):
    """
    Durable Valkey/Redis ARQ queue adapter separating FastAPI HTTP intake from
    dedicated audio processing worker processes.
    """

    backend_name = "arq"

    def __init__(
        self,
        settings: Settings,
        pool: ArqRedis | Any | None = None,
    ) -> None:
        self._settings = settings
        self._pool: ArqRedis | Any | None = pool
        self._owns_pool = pool is None
        self._pool_lock = asyncio.Lock()

    async def _get_pool(self) -> ArqRedis | Any:
        if self._pool is not None:
            return self._pool
        async with self._pool_lock:
            if self._pool is not None:
                return self._pool
            redis_settings = build_redis_settings(self._settings)
            try:
                self._pool = await create_pool(
                    redis_settings,
                    default_queue_name=self._settings.music_engine_arq_queue_name,
                )
                self._owns_pool = True
                logger.info(
                    "Connected ARQ queue pool to %s (queue=%s)",
                    self._settings.redacted_redis_target,
                    self._settings.music_engine_arq_queue_name,
                    extra={"queue_backend": self.backend_name},
                )
                return self._pool
            except QueueIntegrationError:
                raise
            except Exception as exc:
                raise QueueIntegrationError(
                    f"Unable to connect to Valkey/Redis queue broker ({type(exc).__name__}).",
                    code="QUEUE_UNAVAILABLE",
                    status_code=503,
                    details={"target": self._settings.redacted_redis_target},
                    retryable=True,
                ) from exc

    async def enqueue(
        self,
        job: JobResponse,
        *,
        correlation_id: str | None = None,
        defer_seconds: float | None = None,
        job_id_override: str | None = None,
    ) -> str:
        pool = await self._get_pool()
        dispatch_id = job_id_override or arq_job_key(job.job_id)
        try:
            enqueued = await pool.enqueue_job(
                PROCESS_MUSIC_JOB_FUNCTION,
                job.job_id,
                correlation_id,
                _job_id=dispatch_id,
                _queue_name=self._settings.music_engine_arq_queue_name,
                _defer_by=defer_seconds,
            )
        except Exception as exc:
            raise QueueIntegrationError(
                f"Failed to enqueue job '{job.job_id}' into Valkey/Redis queue.",
                code="QUEUE_ENQUEUE_FAILED",
                status_code=503,
                details={
                    "job_id": job.job_id,
                    "exception_type": type(exc).__name__,
                },
                retryable=True,
            ) from exc

        logger.info(
            "Dispatched job to ARQ queue (deduplicated=%s)",
            enqueued is None,
            extra={
                "job_id": job.job_id,
                "user_id": job.user_id,
                "job_type": job.job_type.value,
                "correlation_id": correlation_id,
                "queue_backend": self.backend_name,
            },
        )
        return dispatch_id

    async def request_cancel(self, job_id: str, *, reason: str | None = None) -> None:
        try:
            pool = await self._get_pool()
            await pool.set(
                cancel_signal_key(job_id),
                reason or "cancelled",
                ex=self._settings.music_engine_cancel_signal_ttl_seconds,
            )
            # Best-effort ARQ job abort for queued/running workers when supported
            try:
                arq_job = ArqJob(
                    arq_job_key(job_id),
                    pool,
                    _queue_name=self._settings.music_engine_arq_queue_name,
                )
                await arq_job.abort(timeout=0.01, poll_delay=0.01)
            except Exception:
                # Cooperative cancellation via Redis key + persistent DB status still guarantees abort
                pass
        except QueueIntegrationError:
            logger.warning(
                "Queue broker unavailable while signaling cancel; persistent DB status remains source of truth",
                extra={"job_id": job_id, "queue_backend": self.backend_name},
            )
        except Exception as exc:
            logger.warning(
                "Unable to publish Redis cancellation signal (%s); DB status remains source of truth",
                type(exc).__name__,
                extra={"job_id": job_id, "queue_backend": self.backend_name},
            )

    async def is_cancel_requested(self, job_id: str) -> bool:
        try:
            pool = await self._get_pool()
            value = await pool.get(cancel_signal_key(job_id))
            return value is not None
        except Exception:
            return False

    async def clear_cancel_signal(self, job_id: str) -> None:
        try:
            pool = await self._get_pool()
            await pool.delete(cancel_signal_key(job_id))
        except Exception:
            pass

    async def has_pending_job(self, job_id: str) -> bool:
        pool = await self._get_pool()
        dispatch_id = arq_job_key(job_id)
        try:
            custom_check = getattr(pool, "has_pending_job", None)
            if callable(custom_check):
                result = custom_check(dispatch_id, self._settings.music_engine_arq_queue_name)
                if asyncio.iscoroutine(result):
                    result = await result
                return bool(result)

            # Standard ARQ/Redis inspection using arq.jobs.Job.status() (uses Redis pipeline)
            if hasattr(pool, "pipeline"):
                arq_job = ArqJob(
                    dispatch_id,
                    pool,
                    _queue_name=self._settings.music_engine_arq_queue_name,
                )
                status = await arq_job.status()
                return status in (
                    ArqJobStatus.queued,
                    ArqJobStatus.deferred,
                    ArqJobStatus.in_progress,
                )

            # Lightweight in-memory pool test double fallback (e.g., FakeArqPool)
            seen = getattr(pool, "seen_job_ids", None)
            if isinstance(seen, set):
                return dispatch_id in seen
            return False
        except QueueIntegrationError:
            raise
        except Exception as exc:
            raise QueueIntegrationError(
                f"Failed to inspect ARQ queue state for job '{job_id}' ({type(exc).__name__}).",
                code="QUEUE_INSPECTION_FAILED",
                status_code=503,
                retryable=True,
            ) from exc

    def active_job_count(self) -> int:
        # Web processes do not host audio execution tasks when using ARQ
        return 0

    async def health_check(self) -> bool:
        if not self._settings.arq_queue_configured and self._pool is None:
            return False
        try:
            pool = await self._get_pool()
            pong = await pool.ping()
            return bool(pong)
        except Exception:
            return False

    async def close(self) -> None:
        if self._pool is not None and self._owns_pool:
            close_fn = getattr(self._pool, "aclose", None) or getattr(self._pool, "close", None)
            if close_fn is not None:
                res = close_fn()
                if asyncio.iscoroutine(res):
                    await res
            self._pool = None
