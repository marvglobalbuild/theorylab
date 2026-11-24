from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable

from app.audio.preservation import cleanup_workspace
from app.core.config import Settings
from app.core.errors import JobTimeoutError, MusicEngineError, RetryableJobError
from app.core.logging import get_logger
from app.processing.artifacts import JobArtifactTracker
from app.processing.registry import ProcessingEngineRegistry
from app.schemas.common import ErrorDetail
from app.schemas.jobs import JobResponse, JobStatus

logger = get_logger("pipeline")

CancelCheck = Callable[[], bool | Awaitable[bool]]


class ProcessingPipeline:
    """
    Executes the multi-stage asynchronous processing lifecycle for a job:
      1. Stage & verify original recording (AudioIngestionInterface)
      2. Non-destructively decode to canonical PCM WAV (AudioDecodingInterface)
      3. Dispatch to registered model/DSP processor (ProcessingEngineRegistry)
    Handles timeouts, controlled retry deferral, cooperative cancellation,
    structured correlation logging, scoped generated-artifact cleanup on failure/cancellation,
    and guaranteed temp workspace cleanup.
    """

    def __init__(self, settings: Settings, registry: ProcessingEngineRegistry) -> None:
        self._settings = settings
        self._registry = registry

    @staticmethod
    async def _check_cancelled(is_cancelled: CancelCheck) -> bool:
        res = is_cancelled()
        if asyncio.iscoroutine(res) or isinstance(res, Awaitable):
            return bool(await res)
        return bool(res)

    async def run(
        self,
        job: JobResponse,
        persist_update: Callable[[JobResponse], Any],
        is_cancelled: CancelCheck,
        *,
        correlation_id: str | None = None,
        attempt: int = 1,
        max_tries: int = 1,
        timeout_seconds: int | None = None,
        defer_on_retryable: bool = False,
        worker_id: str | None = None,
    ) -> JobResponse:
        workspace_dir = self._settings.temp_path / job.job_id
        current = job
        effective_timeout = (
            timeout_seconds
            if timeout_seconds is not None
            else self._settings.music_engine_job_timeout_seconds
        )
        artifact_tracker = JobArtifactTracker(
            user_id=job.user_id,
            job_id=job.job_id,
            allowed_bucket=self._settings.supabase_audio_bucket,
            source_object_path=job.source_audio.object_path,
        )

        def log_extra(**kwargs: Any) -> dict[str, Any]:
            base: dict[str, Any] = {
                "job_id": current.job_id,
                "user_id": current.user_id,
                "job_type": current.job_type.value,
                "attempt": attempt,
                "max_tries": max_tries,
            }
            if correlation_id:
                base["correlation_id"] = correlation_id
            if worker_id:
                base["worker_id"] = worker_id
            base.update(kwargs)
            return base

        async def save(updated: JobResponse) -> JobResponse:
            res = persist_update(updated)
            if asyncio.iscoroutine(res):
                return await res
            return updated

        async def _cleanup_generated_artifacts(reason: str) -> None:
            await artifact_tracker.cleanup(
                self._registry.storage,
                reason=reason,
                correlation_id=correlation_id,
            )

        async def _execute_stages() -> JobResponse:
            nonlocal current

            if await self._check_cancelled(is_cancelled):
                return await self._mark_cancelled(current, save)

            now = datetime.now(timezone.utc)
            current = current.model_copy(
                update={
                    "status": JobStatus.PROCESSING,
                    "progress_percent": 15,
                    "stage": "ingesting_audio" if attempt <= 1 else f"ingesting_audio_attempt_{attempt}",
                    "started_at": current.started_at or now,
                    "error": None,
                    "updated_at": now,
                }
            )
            current = await save(current)

            logger.info("Starting audio ingestion stage", extra=log_extra(status=current.status.value))

            ingested = await self._registry.ingestion.ingest(
                job_id=current.job_id,
                user_id=current.user_id,
                source_ref=current.source_audio,
                workspace_dir=workspace_dir,
            )

            if await self._check_cancelled(is_cancelled):
                return await self._mark_cancelled(current, save)

            current = current.model_copy(
                update={
                    "progress_percent": 35,
                    "stage": "decoding_audio",
                    "audio_metadata": ingested.metadata,
                    "updated_at": datetime.now(timezone.utc),
                }
            )
            current = await save(current)

            decoded = await self._registry.decoder.decode(
                ingested=ingested,
                workspace_dir=workspace_dir,
                trim_window=current.trim_window,
            )

            if await self._check_cancelled(is_cancelled):
                return await self._mark_cancelled(current, save)

            current = current.model_copy(
                update={
                    "progress_percent": 55,
                    "stage": f"executing_{current.job_type.value}",
                    "updated_at": datetime.now(timezone.utc),
                }
            )
            current = await save(current)

            async def _on_stage_progress(percent: int, stage_name: str) -> None:
                nonlocal current
                current = current.model_copy(
                    update={
                        "progress_percent": percent,
                        "stage": stage_name,
                        "updated_at": datetime.now(timezone.utc),
                    }
                )
                current = await save(current)

            output = await self._registry.execute_job_stage(
                current,
                decoded,
                workspace_dir,
                artifact_tracker=artifact_tracker,
                on_progress=_on_stage_progress,
            )
            for ref in output.artifacts:
                artifact_tracker.record_upload(ref.bucket, ref.object_path)

            if await self._check_cancelled(is_cancelled):
                await _cleanup_generated_artifacts("job_cancelled")
                return await self._mark_cancelled(current, save)

            finished_at = datetime.now(timezone.utc)
            current = current.model_copy(
                update={
                    "status": JobStatus.COMPLETED,
                    "progress_percent": 100,
                    "stage": "completed",
                    "result": output.result,
                    "artifacts": output.artifacts,
                    "error": None,
                    "completed_at": finished_at,
                    "updated_at": finished_at,
                }
            )
            try:
                saved = await save(current)
            except Exception:
                await _cleanup_generated_artifacts("final_db_persistence_failed")
                raise

            if saved.status == JobStatus.CANCELLED:
                await _cleanup_generated_artifacts("job_cancelled_before_completion")
                return saved

            logger.info("Completed music processing job", extra=log_extra(status=saved.status.value))
            return saved

        async def _handle_engine_error(exc: MusicEngineError) -> JobResponse:
            nonlocal current
            await _cleanup_generated_artifacts(f"job_error:{exc.code}")
            if defer_on_retryable and exc.retryable and attempt < max_tries:
                next_attempt = attempt + 1
                logger.warning(
                    "Retryable error on attempt %s/%s (%s); scheduling deferred retry",
                    attempt,
                    max_tries,
                    exc.code,
                    extra=log_extra(status=JobStatus.PROCESSING.value, error_code=exc.code),
                )
                # Preserve `processing` status (respecting 0002 monotonic trigger — never revert to `queued`
                # and never prematurely transition to terminal `failed`).
                current = current.model_copy(
                    update={
                        "status": JobStatus.PROCESSING,
                        "stage": f"retrying_attempt_{next_attempt}",
                        "error": ErrorDetail(
                            code=exc.code,
                            message=exc.message,
                            retryable=True,
                            details={
                                **exc.details,
                                "attempt": attempt,
                                "max_tries": max_tries,
                                "next_attempt": next_attempt,
                            },
                        ),
                        "updated_at": datetime.now(timezone.utc),
                    }
                )
                await save(current)
                raise RetryableJobError(exc, attempt=attempt, max_tries=max_tries) from exc

            logger.warning(
                "Job failed with structured error: %s",
                exc.message,
                extra=log_extra(status=JobStatus.FAILED.value, error_code=exc.code),
            )
            failed_at = datetime.now(timezone.utc)
            details = {**exc.details}
            if max_tries > 1:
                details.setdefault("attempt", attempt)
                details.setdefault("max_tries", max_tries)
            current = current.model_copy(
                update={
                    "status": JobStatus.FAILED,
                    "stage": "failed",
                    "artifacts": [],
                    "result": None,
                    "error": ErrorDetail(
                        code=exc.code,
                        message=exc.message,
                        retryable=exc.retryable,
                        details=details,
                    ),
                    "completed_at": failed_at,
                    "updated_at": failed_at,
                }
            )
            return await save(current)

        try:
            if effective_timeout and effective_timeout > 0:
                return await asyncio.wait_for(_execute_stages(), timeout=effective_timeout)
            return await _execute_stages()
        except asyncio.TimeoutError:
            timeout_err = JobTimeoutError(effective_timeout, stage=current.stage)
            return await _handle_engine_error(timeout_err)
        except asyncio.CancelledError:
            await _cleanup_generated_artifacts("job_cancelled_signal")
            return await self._mark_cancelled(current, save)
        except MusicEngineError as exc:
            return await _handle_engine_error(exc)
        except RetryableJobError:
            raise
        except Exception as exc:  # pragma: no cover - defensive fallback
            logger.exception(
                "Unexpected internal processing failure",
                extra=log_extra(status=JobStatus.FAILED.value, error_code="INTERNAL_PROCESSING_ERROR"),
            )
            internal_err = MusicEngineError(
                code="INTERNAL_PROCESSING_ERROR",
                message="An unexpected internal error occurred during audio processing.",
                status_code=500,
                retryable=True,
                details={"exception_type": type(exc).__name__},
            )
            return await _handle_engine_error(internal_err)
        finally:
            cleanup_workspace(workspace_dir)

    @staticmethod
    async def _mark_cancelled(
        job: JobResponse,
        save: Callable[[JobResponse], Any],
    ) -> JobResponse:
        now = datetime.now(timezone.utc)
        cancelled = job.model_copy(
            update={
                "status": JobStatus.CANCELLED,
                "stage": "cancelled",
                "cancelled_at": job.cancelled_at or now,
                "updated_at": now,
            }
        )
        res = save(cancelled)
        if asyncio.iscoroutine(res):
            return await res
        return cancelled
