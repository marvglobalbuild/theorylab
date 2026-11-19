from __future__ import annotations

import asyncio
import os
import time
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import pytest
from arq import Retry
from fastapi.testclient import TestClient

from app.audio.decoding import FFmpegAudioDecoder
from app.audio.preservation import DefaultAudioIngestionService, cleanup_stale_workspaces
from app.core.config import Settings
from app.core.errors import QueueIntegrationError, StorageIntegrationError
from app.jobs.queue import (
    ArqRedisQueueBackend,
    PROCESS_MUSIC_JOB_FUNCTION,
    arq_job_key,
    build_redis_settings,
    cancel_signal_key,
)
from app.jobs.repository import InMemoryJobRepository
from app.main import create_app
from app.processing.interfaces import DecodedAudio
from app.processing.pipeline import ProcessingPipeline
from app.processing.registry import JobExecutionOutput, ProcessingEngineRegistry
from app.schemas.audio import AudioSourceRef
from app.schemas.jobs import JobResponse, JobStatus, JobType
from app.storage.local_storage import LocalFilesystemStorageAdapter
from app.worker import (
    WorkerSettings,
    build_worker_settings_class,
    calculate_retry_delay_seconds,
    process_music_job,
    recover_orphaned_jobs,
    shutdown as worker_shutdown,
    startup as worker_startup,
)
from tests.conftest import TEST_JWT_SECRET, USER_A_ID, generate_sine_wav, make_jwt


class FakeArqPool:
    """Isolated in-memory test double implementing the subset of ArqRedis used by SONORA."""

    def __init__(self) -> None:
        self.enqueued: list[dict[str, Any]] = []
        self.seen_job_ids: set[str] = set()
        self.kv: dict[str, tuple[Any, int | None]] = {}
        self.fail_enqueue: bool = False
        self.fail_ping: bool = False
        self.closed: bool = False

    async def enqueue_job(
        self,
        function: str,
        *args: Any,
        _job_id: str | None = None,
        _queue_name: str | None = None,
        _defer_by: float | None = None,
        **kwargs: Any,
    ) -> dict[str, Any] | None:
        if self.fail_enqueue:
            raise ConnectionError("Simulated Valkey/Redis broker outage")
        if _job_id and _job_id in self.seen_job_ids:
            return None
        if _job_id:
            self.seen_job_ids.add(_job_id)
        entry = {
            "function": function,
            "args": args,
            "kwargs": kwargs,
            "job_id": _job_id,
            "queue_name": _queue_name,
            "defer_by": _defer_by,
        }
        self.enqueued.append(entry)
        return entry

    async def set(self, key: str, value: Any, ex: int | None = None) -> bool:
        self.kv[key] = (value, ex)
        return True

    async def get(self, key: str) -> Any:
        item = self.kv.get(key)
        return item[0] if item is not None else None

    async def delete(self, key: str) -> int:
        return 1 if self.kv.pop(key, None) is not None else 0

    async def ping(self) -> bool:
        if self.fail_ping:
            raise ConnectionError("Broker ping failed")
        return True

    async def aclose(self) -> None:
        self.closed = True


def _make_arq_settings(tmp_path: Path, **overrides: Any) -> Settings:
    defaults: dict[str, Any] = {
        "music_engine_env": "test",
        "music_engine_temp_dir": str(tmp_path / "temp"),
        "music_engine_local_storage_dir": str(tmp_path / "storage"),
        "music_engine_storage_backend": "local",
        "music_engine_job_repository_backend": "memory",
        "music_engine_queue_backend": "arq",
        "music_engine_redis_url": "redis://:super-secret-pass@valkey.internal:6379/1",
        "music_engine_arq_queue_name": "sonora:test-jobs",
        "music_engine_job_max_retries": 3,
        "music_engine_job_retry_backoff_seconds": 5,
        "music_engine_job_timeout_seconds": 30,
        "music_engine_max_file_size_bytes": 5 * 1024 * 1024,
        "music_engine_max_duration_seconds": 120,
        "music_engine_max_concurrent_jobs_per_user": 3,
        "supabase_jwt_secret": TEST_JWT_SECRET,
        "supabase_audio_bucket": "sonora-audio",
    }
    defaults.update(overrides)
    return Settings(**defaults)


def _seed_user_wav(settings: Settings, user_id: str = USER_A_ID) -> tuple[str, Path]:
    object_path = f"{user_id}/uploads/{uuid.uuid4()}/vocal_take.wav"
    dest = settings.local_storage_path / settings.supabase_audio_bucket / object_path
    generate_sine_wav(dest, duration_sec=0.5)
    return object_path, dest


def _build_registry_with_echo_processor(
    settings: Settings,
    storage: LocalFilesystemStorageAdapter,
) -> ProcessingEngineRegistry:
    registry = ProcessingEngineRegistry(
        settings=settings,
        ingestion=DefaultAudioIngestionService(settings, storage),
        decoder=FFmpegAudioDecoder(settings),
    )

    async def _echo_analysis(
        job: JobResponse,
        decoded: DecodedAudio,
        workspace_dir: Path,
    ) -> JobExecutionOutput:
        return JobExecutionOutput(
            result={
                "decoded_sample_rate": decoded.sample_rate_hz,
                "decoded_channels": decoded.channels,
                "duration_ms": decoded.duration_ms,
            }
        )

    registry.register_processor(JobType.AUDIO_ANALYSIS, "test-echo-processor", _echo_analysis)
    return registry


def test_redacted_redis_target_masks_credentials(tmp_path: Path) -> None:
    settings = _make_arq_settings(
        tmp_path,
        music_engine_redis_url="rediss://sonora_user:ultra_secret_password@valkey.prod:6380/2",
    )
    redacted = settings.redacted_redis_target
    assert "ultra_secret_password" not in redacted
    assert "sonora_user" not in redacted
    assert redacted == "rediss://valkey.prod:6380/2"

    unconfigured = _make_arq_settings(tmp_path, music_engine_redis_url="")
    assert unconfigured.redacted_redis_target == "unconfigured"
    assert unconfigured.arq_queue_configured is False


def test_worker_settings_and_redis_dsn_validation(tmp_path: Path) -> None:
    settings = _make_arq_settings(tmp_path, music_engine_worker_max_jobs=6, music_engine_job_max_retries=4)
    ws = build_worker_settings_class(settings)
    assert ws.functions == [process_music_job]
    assert ws.on_startup is worker_startup
    assert ws.on_shutdown is worker_shutdown
    assert ws.queue_name == "sonora:test-jobs"
    assert ws.max_jobs == 6
    assert ws.max_tries == 4
    assert ws.job_timeout == settings.music_engine_job_timeout_seconds + 30
    assert ws.allow_abort_jobs is True
    assert ws.redis_settings.host == "valkey.internal"
    assert ws.redis_settings.port == 6379
    assert ws.redis_settings.database == 1

    # Default module-level WorkerSettings must remain safely importable without env vars
    assert WorkerSettings.functions == [process_music_job]

    # Missing URL raises structured QueueIntegrationError
    empty = _make_arq_settings(tmp_path, music_engine_redis_url="")
    with pytest.raises(QueueIntegrationError) as exc_info:
        build_redis_settings(empty)
    assert exc_info.value.code == "QUEUE_NOT_CONFIGURED"

    # Exponential backoff helper grows and caps at 300s
    assert calculate_retry_delay_seconds(1, 5) == 5
    assert calculate_retry_delay_seconds(2, 5) == 10
    assert calculate_retry_delay_seconds(3, 5) == 20
    assert calculate_retry_delay_seconds(10, 5) == 300


def test_arq_submission_and_worker_execution_end_to_end(tmp_path: Path) -> None:
    settings = _make_arq_settings(tmp_path)
    object_path, original_file = _seed_user_wav(settings)
    original_bytes = original_file.read_bytes()

    repo = InMemoryJobRepository()
    storage = LocalFilesystemStorageAdapter(settings.local_storage_path)
    registry = _build_registry_with_echo_processor(settings, storage)
    fake_pool = FakeArqPool()
    queue = ArqRedisQueueBackend(settings=settings, pool=fake_pool)

    app = create_app(
        settings=settings,
        storage=storage,
        repository=repo,
        registry=registry,
        queue=queue,
    )
    headers = {
        "Authorization": f"Bearer {make_jwt(USER_A_ID)}",
        "X-Request-ID": "corr-stage1-e2e-001",
    }

    with TestClient(app) as client:
        submit = client.post(
            "/api/v1/jobs",
            headers=headers,
            json={
                "job_type": "audio_analysis",
                "source_audio": {
                    "storage_backend": "local",
                    "bucket": "sonora-audio",
                    "object_path": object_path,
                    "original_filename": "vocal_take.wav",
                    "declared_mime_type": "audio/wav",
                },
            },
        )
        assert submit.status_code == 202
        assert submit.headers["X-Request-ID"] == "corr-stage1-e2e-001"
        created = submit.json()
        job_id = created["job_id"]
        assert created["status"] == "queued"

        # FastAPI dispatched cleanly to ARQ without running audio in-process
        assert len(fake_pool.enqueued) == 1
        dispatched = fake_pool.enqueued[0]
        assert dispatched["function"] == PROCESS_MUSIC_JOB_FUNCTION
        assert dispatched["args"] == (job_id, "corr-stage1-e2e-001")
        assert dispatched["job_id"] == arq_job_key(job_id)
        assert dispatched["queue_name"] == "sonora:test-jobs"

        # Execute the job via the dedicated ARQ worker function
        worker_ctx: dict[str, Any] = {
            "settings": settings,
            "storage": storage,
            "repository": repo,
            "registry": registry,
            "queue": queue,
            "worker_id": "test-worker-1",
            "job_try": 1,
        }
        asyncio.run(worker_startup(worker_ctx))
        result = asyncio.run(process_music_job(worker_ctx, job_id, "corr-stage1-e2e-001"))
        assert result == {"job_id": job_id, "status": "completed", "attempt": 1}

        # Confirm FastAPI GET /api/v1/jobs/{job_id} sees the worker's persisted completion
        fetched = client.get(f"/api/v1/jobs/{job_id}", headers=headers)
        assert fetched.status_code == 200
        body = fetched.json()
        assert body["status"] == "completed"
        assert body["progress_percent"] == 100
        assert body["audio_metadata"]["detected_format"] == "wav"
        assert body["result"]["decoded_sample_rate"] == 44100

        # Original recording preserved & temporary job workspace cleaned up
        assert original_file.read_bytes() == original_bytes
        assert not (settings.temp_path / job_id).exists()


def test_worker_retryable_failure_defers_preserving_monotonic_state_then_succeeds(tmp_path: Path) -> None:
    settings = _make_arq_settings(
        tmp_path,
        music_engine_job_max_retries=3,
        music_engine_job_retry_backoff_seconds=7,
    )
    object_path, _ = _seed_user_wav(settings)
    repo = InMemoryJobRepository()
    storage = LocalFilesystemStorageAdapter(settings.local_storage_path)
    queue = ArqRedisQueueBackend(settings=settings, pool=FakeArqPool())

    registry = ProcessingEngineRegistry(
        settings=settings,
        ingestion=DefaultAudioIngestionService(settings, storage),
        decoder=FFmpegAudioDecoder(settings),
    )
    attempts_seen = 0

    async def _flaky_analysis(job: JobResponse, decoded: DecodedAudio, workspace_dir: Path) -> JobExecutionOutput:
        nonlocal attempts_seen
        attempts_seen += 1
        if attempts_seen == 1:
            raise StorageIntegrationError(
                "Transient Supabase storage gateway timeout.",
                code="STORAGE_TRANSIENT_TIMEOUT",
                retryable=True,
            )
        return JobExecutionOutput(result={"recovered": True, "sample_rate": decoded.sample_rate_hz})

    registry.register_processor(JobType.AUDIO_ANALYSIS, "test-flaky-processor", _flaky_analysis)
    pipeline = ProcessingPipeline(settings=settings, registry=registry)

    now = datetime.now(timezone.utc)
    job = JobResponse(
        job_id=str(uuid.uuid4()),
        user_id=USER_A_ID,
        job_type=JobType.AUDIO_ANALYSIS,
        status=JobStatus.QUEUED,
        progress_percent=0,
        stage="queued",
        source_audio=AudioSourceRef(
            storage_backend="local",
            bucket="sonora-audio",
            object_path=object_path,
            original_filename="vocal_take.wav",
            declared_mime_type="audio/wav",
        ),
        created_at=now,
        updated_at=now,
    )
    asyncio.run(repo.create(job))

    ctx: dict[str, Any] = {
        "settings": settings,
        "repository": repo,
        "pipeline": pipeline,
        "queue": queue,
        "worker_id": "test-worker-retry",
        "job_try": 1,
    }

    # Attempt 1: transient retryable error -> ARQ Retry(defer=7s), DB stays `processing` (never reverts to `queued`)
    with pytest.raises(Retry) as retry_exc:
        asyncio.run(process_music_job(ctx, job.job_id, "corr-retry-1"))
    assert retry_exc.value.defer_score == 7000  # ARQ stores defer_score in milliseconds

    after_attempt_1 = asyncio.run(repo.get_by_id(job.job_id))
    assert after_attempt_1 is not None
    assert after_attempt_1.status == JobStatus.PROCESSING
    assert after_attempt_1.stage == "retrying_attempt_2"
    assert after_attempt_1.error is not None
    assert after_attempt_1.error.code == "STORAGE_TRANSIENT_TIMEOUT"
    assert after_attempt_1.error.retryable is True
    assert after_attempt_1.error.details["attempt"] == 1
    assert after_attempt_1.error.details["next_attempt"] == 2
    assert not (settings.temp_path / job.job_id).exists()

    # Attempt 2: succeeds cleanly and clears temporary retry error
    ctx["job_try"] = 2
    result = asyncio.run(process_music_job(ctx, job.job_id, "corr-retry-1"))
    assert result["status"] == "completed"
    assert result["attempt"] == 2

    final_job = asyncio.run(repo.get_by_id(job.job_id))
    assert final_job is not None
    assert final_job.status == JobStatus.COMPLETED
    assert final_job.error is None
    assert final_job.completed_at is not None
    assert final_job.result == {"recovered": True, "sample_rate": 44100}


def test_worker_exhausted_retries_and_non_retryable_failures_terminate_cleanly(tmp_path: Path) -> None:
    settings = _make_arq_settings(tmp_path, music_engine_job_max_retries=2)
    object_path, _ = _seed_user_wav(settings)
    repo = InMemoryJobRepository()
    storage = LocalFilesystemStorageAdapter(settings.local_storage_path)
    queue = ArqRedisQueueBackend(settings=settings, pool=FakeArqPool())

    always_fail_registry = ProcessingEngineRegistry(
        settings=settings,
        ingestion=DefaultAudioIngestionService(settings, storage),
        decoder=FFmpegAudioDecoder(settings),
    )

    async def _always_transient(job, decoded, workspace_dir):
        raise StorageIntegrationError("Persistent outage", code="STORAGE_OUTAGE", retryable=True)

    always_fail_registry.register_processor(JobType.AUDIO_ANALYSIS, "test-always-fail", _always_transient)
    pipeline = ProcessingPipeline(settings=settings, registry=always_fail_registry)

    now = datetime.now(timezone.utc)
    exhausted_job = JobResponse(
        job_id=str(uuid.uuid4()),
        user_id=USER_A_ID,
        job_type=JobType.AUDIO_ANALYSIS,
        status=JobStatus.QUEUED,
        progress_percent=0,
        stage="queued",
        source_audio=AudioSourceRef(storage_backend="local", bucket="sonora-audio", object_path=object_path),
        created_at=now,
        updated_at=now,
    )
    asyncio.run(repo.create(exhausted_job))

    # On final attempt (job_try == max_tries), must NOT raise Retry; marks terminal `failed`
    ctx: dict[str, Any] = {
        "settings": settings,
        "repository": repo,
        "pipeline": pipeline,
        "queue": queue,
        "worker_id": "test-worker-exhaust",
        "job_try": 2,
    }
    res = asyncio.run(process_music_job(ctx, exhausted_job.job_id, "corr-exhaust"))
    assert res["status"] == "failed"
    persisted = asyncio.run(repo.get_by_id(exhausted_job.job_id))
    assert persisted is not None
    assert persisted.status == JobStatus.FAILED
    assert persisted.error is not None
    assert persisted.error.code == "STORAGE_OUTAGE"
    assert persisted.error.details["attempt"] == 2
    assert persisted.error.details["max_tries"] == 2

    # Non-retryable error (unregistered MODEL_NOT_INTEGRATED) must fail immediately on attempt 1 without Retry
    default_pipeline = ProcessingPipeline(
        settings=settings,
        registry=ProcessingEngineRegistry(
            settings=settings,
            ingestion=DefaultAudioIngestionService(settings, storage),
            decoder=FFmpegAudioDecoder(settings),
        ),
    )
    non_retryable_job = JobResponse(
        job_id=str(uuid.uuid4()),
        user_id=USER_A_ID,
        job_type=JobType.SOURCE_SEPARATION,
        status=JobStatus.QUEUED,
        progress_percent=0,
        stage="queued",
        source_audio=AudioSourceRef(storage_backend="local", bucket="sonora-audio", object_path=object_path),
        created_at=now,
        updated_at=now,
    )
    asyncio.run(repo.create(non_retryable_job))
    ctx["pipeline"] = default_pipeline
    ctx["job_try"] = 1
    res_nr = asyncio.run(process_music_job(ctx, non_retryable_job.job_id, "corr-nr"))
    assert res_nr["status"] == "failed"
    persisted_nr = asyncio.run(repo.get_by_id(non_retryable_job.job_id))
    assert persisted_nr is not None
    assert persisted_nr.status == JobStatus.FAILED
    assert persisted_nr.error is not None
    assert persisted_nr.error.code == "MODEL_NOT_INTEGRATED"
    assert persisted_nr.error.retryable is False


def test_worker_timeout_persists_structured_timeout_and_cleans_workspace(tmp_path: Path) -> None:
    settings = _make_arq_settings(
        tmp_path,
        music_engine_job_timeout_seconds=1,
        music_engine_job_max_retries=1,
    )
    object_path, _ = _seed_user_wav(settings)
    repo = InMemoryJobRepository()
    storage = LocalFilesystemStorageAdapter(settings.local_storage_path)
    queue = ArqRedisQueueBackend(settings=settings, pool=FakeArqPool())

    slow_registry = ProcessingEngineRegistry(
        settings=settings,
        ingestion=DefaultAudioIngestionService(settings, storage),
        decoder=FFmpegAudioDecoder(settings),
    )

    async def _slow_stage(job, decoded, workspace_dir):
        await asyncio.sleep(5)
        return JobExecutionOutput(result={"never": True})

    slow_registry.register_processor(JobType.AUDIO_ANALYSIS, "test-slow-processor", _slow_stage)
    pipeline = ProcessingPipeline(settings=settings, registry=slow_registry)

    now = datetime.now(timezone.utc)
    job = JobResponse(
        job_id=str(uuid.uuid4()),
        user_id=USER_A_ID,
        job_type=JobType.AUDIO_ANALYSIS,
        status=JobStatus.QUEUED,
        progress_percent=0,
        stage="queued",
        source_audio=AudioSourceRef(storage_backend="local", bucket="sonora-audio", object_path=object_path),
        created_at=now,
        updated_at=now,
    )
    asyncio.run(repo.create(job))

    ctx: dict[str, Any] = {
        "settings": settings,
        "repository": repo,
        "pipeline": pipeline,
        "queue": queue,
        "worker_id": "test-worker-timeout",
        "job_try": 1,
    }
    res = asyncio.run(process_music_job(ctx, job.job_id, "corr-timeout"))
    assert res["status"] == "failed"
    persisted = asyncio.run(repo.get_by_id(job.job_id))
    assert persisted is not None
    assert persisted.status == JobStatus.FAILED
    assert persisted.error is not None
    assert persisted.error.code == "JOB_TIMEOUT"
    assert persisted.error.retryable is True
    assert not (settings.temp_path / job.job_id).exists()


def test_cross_process_cancellation_while_queued_and_mid_execution(tmp_path: Path) -> None:
    settings = _make_arq_settings(tmp_path)
    object_path, _ = _seed_user_wav(settings)
    repo = InMemoryJobRepository()
    storage = LocalFilesystemStorageAdapter(settings.local_storage_path)
    registry = _build_registry_with_echo_processor(settings, storage)
    fake_pool = FakeArqPool()
    queue = ArqRedisQueueBackend(settings=settings, pool=fake_pool)

    app = create_app(
        settings=settings,
        storage=storage,
        repository=repo,
        registry=registry,
        queue=queue,
    )
    headers = {"Authorization": f"Bearer {make_jwt(USER_A_ID)}", "X-Request-ID": "corr-cancel"}

    with TestClient(app) as client:
        # Case A: Cancelled while still queued before worker picks it up
        submit = client.post(
            "/api/v1/jobs",
            headers=headers,
            json={
                "job_type": "audio_analysis",
                "source_audio": {
                    "storage_backend": "local",
                    "bucket": "sonora-audio",
                    "object_path": object_path,
                },
            },
        )
        assert submit.status_code == 202
        queued_job_id = submit.json()["job_id"]

        cancel_res = client.post(
            f"/api/v1/jobs/{queued_job_id}/cancel",
            headers=headers,
            json={"reason": "User cancelled before execution"},
        )
        assert cancel_res.status_code == 200
        assert cancel_res.json()["status"] == "cancelled"
        assert cancel_signal_key(queued_job_id) in fake_pool.kv

        # Worker receives the already-cancelled job -> skips idempotently and clears cancel key
        worker_ctx: dict[str, Any] = {
            "settings": settings,
            "storage": storage,
            "repository": repo,
            "registry": registry,
            "queue": queue,
            "worker_id": "test-worker-cancel",
            "job_try": 1,
        }
        asyncio.run(worker_startup(worker_ctx))
        outcome = asyncio.run(process_music_job(worker_ctx, queued_job_id, "corr-cancel"))
        assert outcome == {"job_id": queued_job_id, "status": "cancelled", "skipped": True}
        assert cancel_signal_key(queued_job_id) not in fake_pool.kv

    # Case B: Cancelled mid-execution -> worker never overwrites `cancelled` with `completed`
    mid_registry = ProcessingEngineRegistry(
        settings=settings,
        ingestion=DefaultAudioIngestionService(settings, storage),
        decoder=FFmpegAudioDecoder(settings),
    )

    async def _cancel_mid_stage(job, decoded, workspace_dir):
        await queue.request_cancel(job.job_id, reason="Mid-flight cancel")
        current = await repo.get_by_id(job.job_id)
        assert current is not None
        await repo.update(
            current.model_copy(
                update={
                    "status": JobStatus.CANCELLED,
                    "stage": "cancelled",
                    "cancelled_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                }
            )
        )
        return JobExecutionOutput(result={"should_not_win": True})

    mid_registry.register_processor(JobType.AUDIO_ANALYSIS, "test-mid-cancel", _cancel_mid_stage)

    mid_job = JobResponse(
        job_id=str(uuid.uuid4()),
        user_id=USER_A_ID,
        job_type=JobType.AUDIO_ANALYSIS,
        status=JobStatus.QUEUED,
        progress_percent=0,
        stage="queued",
        source_audio=AudioSourceRef(storage_backend="local", bucket="sonora-audio", object_path=object_path),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    asyncio.run(repo.create(mid_job))
    mid_ctx = {
        "settings": settings,
        "repository": repo,
        "pipeline": ProcessingPipeline(settings=settings, registry=mid_registry),
        "queue": queue,
        "worker_id": "test-worker-mid-cancel",
        "job_try": 1,
    }
    mid_res = asyncio.run(process_music_job(mid_ctx, mid_job.job_id, "corr-mid-cancel"))
    assert mid_res["status"] == "cancelled"
    persisted_mid = asyncio.run(repo.get_by_id(mid_job.job_id))
    assert persisted_mid is not None
    assert persisted_mid.status == JobStatus.CANCELLED
    assert persisted_mid.result is None
    assert not (settings.temp_path / mid_job.job_id).exists()


def test_idempotency_prevents_duplicate_enqueue_and_worker_redelivery_is_noop(tmp_path: Path) -> None:
    settings = _make_arq_settings(tmp_path)
    object_path, _ = _seed_user_wav(settings)
    repo = InMemoryJobRepository()
    storage = LocalFilesystemStorageAdapter(settings.local_storage_path)
    registry = _build_registry_with_echo_processor(settings, storage)
    fake_pool = FakeArqPool()
    queue = ArqRedisQueueBackend(settings=settings, pool=fake_pool)

    app = create_app(
        settings=settings,
        storage=storage,
        repository=repo,
        registry=registry,
        queue=queue,
    )
    headers = {"Authorization": f"Bearer {make_jwt(USER_A_ID)}"}
    payload = {
        "job_type": "audio_analysis",
        "idempotency_key": "idem-arq-001",
        "source_audio": {
            "storage_backend": "local",
            "bucket": "sonora-audio",
            "object_path": object_path,
        },
    }

    with TestClient(app) as client:
        first = client.post("/api/v1/jobs", headers=headers, json=payload)
        second = client.post("/api/v1/jobs", headers=headers, json=payload)
        assert first.status_code == 202
        assert second.status_code == 202
        assert first.json()["job_id"] == second.json()["job_id"]
        assert len(fake_pool.enqueued) == 1

    # Run worker once, then deliver the same job_id a second time -> strict no-op
    job_id = first.json()["job_id"]
    ctx: dict[str, Any] = {
        "settings": settings,
        "storage": storage,
        "repository": repo,
        "registry": registry,
        "queue": queue,
        "worker_id": "test-worker-idem",
        "job_try": 1,
    }
    asyncio.run(worker_startup(ctx))
    run1 = asyncio.run(process_music_job(ctx, job_id, "corr-1"))
    run2 = asyncio.run(process_music_job(ctx, job_id, "corr-2"))
    assert run1["status"] == "completed"
    assert run2 == {"job_id": job_id, "status": "completed", "skipped": True}


def test_broker_outage_on_submission_returns_503_and_persists_failed_state(tmp_path: Path) -> None:
    settings = _make_arq_settings(tmp_path)
    object_path, _ = _seed_user_wav(settings)
    repo = InMemoryJobRepository()
    storage = LocalFilesystemStorageAdapter(settings.local_storage_path)
    fake_pool = FakeArqPool()
    fake_pool.fail_enqueue = True
    queue = ArqRedisQueueBackend(settings=settings, pool=fake_pool)

    app = create_app(settings=settings, storage=storage, repository=repo, queue=queue)
    headers = {"Authorization": f"Bearer {make_jwt(USER_A_ID)}"}

    with TestClient(app) as client:
        resp = client.post(
            "/api/v1/jobs",
            headers=headers,
            json={
                "job_type": "audio_analysis",
                "source_audio": {
                    "storage_backend": "local",
                    "bucket": "sonora-audio",
                    "object_path": object_path,
                },
            },
        )
        assert resp.status_code == 503
        err = resp.json()["error"]
        assert err["code"] == "QUEUE_ENQUEUE_FAILED"
        assert err["retryable"] is True

        # Persisted job must be marked terminal `failed` so it never leaks as an orphaned `queued` job
        listed = client.get("/api/v1/jobs", headers=headers)
        assert listed.status_code == 200
        jobs = listed.json()
        assert len(jobs) == 1
        assert jobs[0]["status"] == "failed"
        assert jobs[0]["error"]["code"] == "QUEUE_ENQUEUE_FAILED"
        assert asyncio.run(repo.count_active_by_user(USER_A_ID)) == 0


def test_worker_startup_cleans_stale_workspaces_and_recovers_orphaned_jobs(tmp_path: Path) -> None:
    settings = _make_arq_settings(
        tmp_path,
        music_engine_stale_workspace_max_age_seconds=3600,
        music_engine_stale_job_timeout_seconds=600,
    )
    settings.temp_path.mkdir(parents=True, exist_ok=True)

    # Create one stale workspace (2 hours old) and one fresh workspace (now)
    stale_dir = settings.temp_path / "stale-job-workspace"
    stale_dir.mkdir()
    (stale_dir / "temp.wav").write_bytes(b"old")
    old_mtime = time.time() - 7200
    os.utime(stale_dir, (old_mtime, old_mtime))

    fresh_dir = settings.temp_path / "fresh-job-workspace"
    fresh_dir.mkdir()
    (fresh_dir / "temp.wav").write_bytes(b"new")

    repo = InMemoryJobRepository()
    storage = LocalFilesystemStorageAdapter(settings.local_storage_path)
    fake_pool = FakeArqPool()
    queue = ArqRedisQueueBackend(settings=settings, pool=fake_pool)

    now = datetime.now(timezone.utc)
    stale_time = now - timedelta(seconds=1200)

    def _make_processing_job(updated: datetime) -> JobResponse:
        return JobResponse(
            job_id=str(uuid.uuid4()),
            user_id=USER_A_ID,
            job_type=JobType.AUDIO_ANALYSIS,
            status=JobStatus.PROCESSING,
            progress_percent=35,
            stage="decoding_audio",
            source_audio=AudioSourceRef(
                storage_backend="local",
                bucket="sonora-audio",
                object_path=f"{USER_A_ID}/uploads/a.wav",
            ),
            started_at=updated,
            created_at=updated,
            updated_at=updated,
        )

    stale_recoverable = _make_processing_job(stale_time)
    stale_cancelled = _make_processing_job(stale_time)
    fresh_active = _make_processing_job(now)

    asyncio.run(repo.create(stale_recoverable))
    asyncio.run(repo.create(stale_cancelled))
    asyncio.run(repo.create(fresh_active))
    asyncio.run(queue.request_cancel(stale_cancelled.job_id, reason="User cancelled before crash"))

    ctx: dict[str, Any] = {
        "settings": settings,
        "storage": storage,
        "repository": repo,
        "queue": queue,
        "worker_id": "test-worker-recovery",
    }
    asyncio.run(worker_startup(ctx))

    assert ctx["startup_removed_workspaces"] == 1
    assert not stale_dir.exists()
    assert fresh_dir.exists()

    summary = ctx["startup_recovery_summary"]
    assert summary == {"inspected": 2, "requeued": 1, "cancelled": 1, "failed": 0}

    # Stale recoverable job stays in `processing` (monotonic trigger safe) and is re-enqueued
    rec_job = asyncio.run(repo.get_by_id(stale_recoverable.job_id))
    assert rec_job is not None
    assert rec_job.status == JobStatus.PROCESSING
    assert rec_job.stage == "recovering_after_worker_restart"
    assert len(fake_pool.enqueued) == 1
    assert fake_pool.enqueued[0]["args"][0] == stale_recoverable.job_id
    assert fake_pool.enqueued[0]["job_id"].startswith(f"{arq_job_key(stale_recoverable.job_id)}:recover:")

    # Stale cancelled job is finalized to `cancelled`
    can_job = asyncio.run(repo.get_by_id(stale_cancelled.job_id))
    assert can_job is not None
    assert can_job.status == JobStatus.CANCELLED

    # Fresh processing job is untouched
    act_job = asyncio.run(repo.get_by_id(fresh_active.job_id))
    assert act_job is not None
    assert act_job.stage == "decoding_audio"

    # Also test recovery failure fallback -> marks terminal `failed` with `WORKER_INTERRUPTED`
    broken_stale = _make_processing_job(stale_time)
    asyncio.run(repo.create(broken_stale))
    fake_pool.fail_enqueue = True
    fallback_summary = asyncio.run(
        recover_orphaned_jobs(
            settings=settings,
            repository=repo,
            queue=queue,
            worker_id="test-worker-recovery-2",
        )
    )
    assert fallback_summary["failed"] == 1
    failed_job = asyncio.run(repo.get_by_id(broken_stale.job_id))
    assert failed_job is not None
    assert failed_job.status == JobStatus.FAILED
    assert failed_job.error is not None
    assert failed_job.error.code == "WORKER_INTERRUPTED"

    asyncio.run(worker_shutdown(ctx))


def test_health_endpoint_reports_arq_broker_status(tmp_path: Path) -> None:
    settings = _make_arq_settings(tmp_path)
    fake_pool = FakeArqPool()
    queue = ArqRedisQueueBackend(settings=settings, pool=fake_pool)
    app = create_app(settings=settings, queue=queue)

    with TestClient(app) as client:
        healthy = client.get("/health")
        assert healthy.status_code == 200
        body = healthy.json()
        assert body["status"] == "ok"
        assert body["queue_backend"] == "arq"
        assert body["dependencies"]["redis_queue_configured"] is True
        assert body["dependencies"]["redis_queue_reachable"] is True

        # Simulate broker outage -> /health reports degraded
        fake_pool.fail_ping = True
        degraded = client.get("/health")
        assert degraded.status_code == 200
        dbody = degraded.json()
        assert dbody["status"] == "degraded"
        assert dbody["queue_backend"] == "arq"
        assert dbody["dependencies"]["redis_queue_reachable"] is False


def test_cleanup_stale_workspaces_handles_missing_dir(tmp_path: Path) -> None:
    assert cleanup_stale_workspaces(tmp_path / "does-not-exist", 60) == 0
