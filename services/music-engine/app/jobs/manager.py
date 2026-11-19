from __future__ import annotations

import uuid
from datetime import datetime, timezone
from pathlib import Path

from app.audio.validation import validate_declared_extension_and_mime, validate_file_size
from app.core.config import Settings
from app.core.errors import (
    AccessDeniedError,
    JobConflictError,
    QueueIntegrationError,
    RateLimitOrQuotaError,
    ResourceNotFoundError,
    ValidationError,
)
from app.core.logging import get_logger
from app.jobs.assets import AudioAssetRepository
from app.jobs.queue import InProcessQueueBackend, JobQueueBackend
from app.jobs.repository import JobRepository, _parse_optional_uuid
from app.processing.pipeline import ProcessingPipeline
from app.schemas.common import ErrorDetail
from app.schemas.jobs import (
    JobCancelResponse,
    JobCreateRequest,
    JobResponse,
    JobStatus,
    TERMINAL_JOB_STATUSES,
)
from app.security.auth import AuthenticatedUser
from app.storage.base import StorageAdapter, UserStoragePathGuard

logger = get_logger("jobs")


class AsyncJobManager:
    """
    Single unified job orchestration façade coordinating:
      - Pre-flight ownership & audio file validation
      - Idempotency & per-user concurrency quotas
      - Authoritative persistent job records (Supabase / in-memory repository)
      - Durable queue dispatch via ARQ (Valkey/Redis) or local in-process fallback
      - Cooperative cancellation across API and worker processes
    """

    def __init__(
        self,
        settings: Settings,
        repository: JobRepository,
        storage: StorageAdapter,
        pipeline: ProcessingPipeline,
        queue: JobQueueBackend | None = None,
        asset_repository: AudioAssetRepository | None = None,
    ) -> None:
        self._settings = settings
        self._repo = repository
        self._asset_repo = asset_repository
        self._storage = storage
        self._pipeline = pipeline
        if queue is None:
            self._queue: JobQueueBackend = InProcessQueueBackend(executor=self._execute_in_process)
        else:
            self._queue = queue
            if isinstance(self._queue, InProcessQueueBackend):
                self._queue.bind_executor(self._execute_in_process)

    @property
    def queue_backend_name(self) -> str:
        return self._queue.backend_name

    def active_job_count(self) -> int:
        return self._queue.active_job_count()

    async def queue_health_check(self) -> bool:
        return await self._queue.health_check()

    async def create_job(
        self,
        user: AuthenticatedUser,
        request: JobCreateRequest,
        *,
        correlation_id: str | None = None,
    ) -> JobResponse:
        # 1. Enforce strict user-namespace ownership before touching storage or queuing work
        normalized_path = UserStoragePathGuard.normalize_and_verify(
            user_id=user.id,
            bucket=request.source_audio.bucket,
            object_path=request.source_audio.object_path,
            allowed_bucket=self._settings.supabase_audio_bucket,
        )

        # 2. Pre-flight extension, MIME, and declared size checks
        validate_declared_extension_and_mime(
            filename=request.source_audio.original_filename or Path(normalized_path).name,
            declared_mime_type=request.source_audio.declared_mime_type,
        )
        if request.source_audio.declared_size_bytes is not None:
            validate_file_size(
                request.source_audio.declared_size_bytes,
                self._settings.music_engine_max_file_size_bytes,
            )

        # 3. Idempotency check scoped strictly to the authenticated user
        if request.idempotency_key:
            existing = await self._repo.find_by_idempotency_key(user.id, request.idempotency_key)
            if existing is not None:
                logger.info(
                    "Returning existing idempotent processing job",
                    extra={
                        "job_id": existing.job_id,
                        "user_id": user.id,
                        "job_type": existing.job_type.value,
                        "status": existing.status.value,
                        "correlation_id": correlation_id,
                        "queue_backend": self._queue.backend_name,
                    },
                )
                return existing

        # 4. Enforce per-user concurrency quota
        active_for_user = await self._repo.count_active_by_user(user.id)
        if active_for_user >= self._settings.music_engine_max_concurrent_jobs_per_user:
            raise RateLimitOrQuotaError(
                (
                    f"Concurrent job limit ({self._settings.music_engine_max_concurrent_jobs_per_user}) "
                    "reached. Wait for an active job to finish or cancel one before submitting another."
                ),
                details={"active_jobs": active_for_user},
            )

        # 5. Verify source audio object exists and passes size bounds in private storage
        object_info = await self._storage.head_object(request.source_audio.bucket, normalized_path)
        validate_file_size(object_info.size_bytes, self._settings.music_engine_max_file_size_bytes)

        # 5b. Verify or resolve audio_asset_id against persisted public.audio_assets metadata
        resolved_asset_id = request.source_audio.asset_id
        if self._asset_repo is not None:
            if resolved_asset_id is not None:
                parsed_asset_id = _parse_optional_uuid(resolved_asset_id)
                if parsed_asset_id is None:
                    raise ValidationError(
                        "source_audio.asset_id must be a valid UUID.",
                        code="INVALID_AUDIO_ASSET_ID",
                    )
                asset_row = await self._asset_repo.get_by_id(parsed_asset_id)
                if asset_row is None:
                    raise ResourceNotFoundError(
                        f"Audio asset '{parsed_asset_id}' was not found.",
                        code="AUDIO_ASSET_NOT_FOUND",
                    )
                if asset_row.user_id != user.id:
                    raise AccessDeniedError(
                        "You do not have permission to reference another user's audio asset.",
                        code="STORAGE_ACCESS_DENIED",
                    )
                if asset_row.bucket != request.source_audio.bucket or asset_row.object_path != normalized_path:
                    raise ValidationError(
                        "source_audio.asset_id does not match the specified storage bucket and object_path.",
                        code="AUDIO_ASSET_MISMATCH",
                    )
                resolved_asset_id = asset_row.id
            else:
                matched_asset = await self._asset_repo.find_by_storage_path(
                    request.source_audio.bucket, normalized_path
                )
                if matched_asset is not None and matched_asset.user_id == user.id:
                    resolved_asset_id = matched_asset.id

        now = datetime.now(timezone.utc)
        job_id = str(uuid.uuid4())
        sanitized_source = request.source_audio.model_copy(
            update={
                "object_path": normalized_path,
                "asset_id": resolved_asset_id,
                "declared_size_bytes": object_info.size_bytes,
            }
        )

        job = JobResponse(
            job_id=job_id,
            user_id=user.id,
            job_type=request.job_type,
            status=JobStatus.QUEUED,
            progress_percent=0,
            stage="queued",
            source_audio=sanitized_source,
            trim_window=request.trim_window,
            parameters=request.parameters,
            studio_context=request.studio_context,
            created_at=now,
            updated_at=now,
        )

        persisted = await self._repo.create(job, idempotency_key=request.idempotency_key)
        # If a concurrent idempotent POST won the DB unique constraint race, return it without re-enqueuing
        if persisted.job_id != job.job_id:
            return persisted

        try:
            await self._queue.enqueue(persisted, correlation_id=correlation_id)
        except QueueIntegrationError as exc:
            failed_at = datetime.now(timezone.utc)
            failed_job = persisted.model_copy(
                update={
                    "status": JobStatus.FAILED,
                    "stage": "failed",
                    "error": ErrorDetail(
                        code=exc.code,
                        message=exc.message,
                        retryable=exc.retryable,
                        details=exc.details,
                    ),
                    "completed_at": failed_at,
                    "updated_at": failed_at,
                }
            )
            try:
                await self._repo.update(failed_job)
            except Exception:
                logger.exception(
                    "Failed to persist QUEUE_UNAVAILABLE failure state for job",
                    extra={"job_id": persisted.job_id, "user_id": user.id, "correlation_id": correlation_id},
                )
            raise

        logger.info(
            "Queued music processing job",
            extra={
                "job_id": persisted.job_id,
                "user_id": user.id,
                "job_type": persisted.job_type.value,
                "status": persisted.status.value,
                "correlation_id": correlation_id,
                "queue_backend": self._queue.backend_name,
            },
        )
        return persisted

    async def _execute_in_process(
        self,
        initial_job: JobResponse,
        correlation_id: str | None,
        is_cancelled,
    ) -> JobResponse:
        return await self._pipeline.run(
            job=initial_job,
            persist_update=self._repo.update,
            is_cancelled=is_cancelled,
            correlation_id=correlation_id,
            attempt=1,
            max_tries=1,
            timeout_seconds=self._settings.music_engine_job_timeout_seconds,
            defer_on_retryable=False,
        )

    async def get_job(self, job_id: str, user: AuthenticatedUser) -> JobResponse:
        job = await self._repo.get_by_id(job_id)
        if job is None:
            raise ResourceNotFoundError(
                f"Processing job '{job_id}' was not found.",
                code="JOB_NOT_FOUND",
            )
        if job.user_id != user.id:
            raise AccessDeniedError(
                "You do not have permission to access another user's processing job.",
                code="JOB_ACCESS_DENIED",
            )
        return job

    async def list_jobs(self, user: AuthenticatedUser, limit: int = 50) -> list[JobResponse]:
        return await self._repo.list_by_user(user.id, limit=limit)

    async def cancel_job(
        self,
        job_id: str,
        user: AuthenticatedUser,
        reason: str | None = None,
        *,
        correlation_id: str | None = None,
    ) -> JobCancelResponse:
        job = await self.get_job(job_id, user)

        if job.status in TERMINAL_JOB_STATUSES:
            raise JobConflictError(
                f"Job '{job_id}' is already in terminal state '{job.status.value}' and cannot be cancelled.",
                code="JOB_ALREADY_TERMINAL",
                details={"status": job.status.value},
            )

        # Signal queue / worker cancellation first so running tasks stop promptly
        await self._queue.request_cancel(job_id, reason=reason)

        # Authoritatively persist `cancelled` state in Supabase / repository
        refreshed = await self._repo.get_by_id(job_id)
        now = datetime.now(timezone.utc)
        target = refreshed or job
        if target.status != JobStatus.CANCELLED:
            target = target.model_copy(
                update={
                    "status": JobStatus.CANCELLED,
                    "stage": "cancelled",
                    "cancelled_at": now,
                    "updated_at": now,
                }
            )
            target = await self._repo.update(target)

        logger.info(
            "Cancelled music processing job",
            extra={
                "job_id": job_id,
                "user_id": user.id,
                "status": target.status.value,
                "correlation_id": correlation_id,
                "queue_backend": self._queue.backend_name,
            },
        )

        return JobCancelResponse(
            job_id=job_id,
            status=target.status,
            cancelled=True,
            message=reason or "Processing job cancelled cleanly; original recording remains preserved.",
            job=target,
        )

    async def shutdown(self) -> None:
        await self._queue.close()
