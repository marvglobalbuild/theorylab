from __future__ import annotations

import asyncio
import base64
import json
import logging
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import httpx
import pytest
from fastapi.testclient import TestClient

from app.audio.decoding import FFmpegAudioDecoder
from app.audio.preservation import DefaultAudioIngestionService
from app.core.config import Settings
from app.core.errors import (
    AccessDeniedError,
    AccountStatusUnavailableError,
    AuthenticationError,
    MixingError,
    StorageIntegrationError,
    ValidationError,
)
from app.jobs.assets import AudioAssetRecord, AudioAssetRepository, InMemoryAudioAssetRepository
from app.jobs.queue import ArqRedisQueueBackend, arq_job_key
from app.jobs.repository import InMemoryJobRepository, SupabaseJobRepository
from app.main import create_app
from app.processing.artifacts import JobArtifactTracker
from app.processing.interfaces import DecodedAudio
from app.processing.pipeline import ProcessingPipeline
from app.processing.registry import JobExecutionOutput, ProcessingEngineRegistry
from app.schemas.audio import AudioSourceRef, StorageBackendType
from app.schemas.jobs import JobArtifactRef, JobResponse, JobStatus, JobType
from app.security.auth import SupabaseAuthVerifier
from app.storage.base import StorageAdapter, StorageObjectInfo
from app.storage.local_storage import LocalFilesystemStorageAdapter
from app.storage.supabase_storage import SupabaseStorageAdapter
from app.worker import recover_orphaned_jobs
from tests.conftest import TEST_JWT_SECRET, USER_A_ID, USER_B_ID, generate_sine_wav, make_jwt


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _make_fake_jwt_with_alg(alg: str, sub: str = USER_A_ID) -> str:
    header = _b64url(json.dumps({"alg": alg, "typ": "JWT"}).encode("utf-8"))
    payload = _b64url(
        json.dumps(
            {
                "sub": sub,
                "aud": "authenticated",
                "role": "authenticated",
                "exp": int((datetime.now(timezone.utc) + timedelta(hours=1)).timestamp()),
            }
        ).encode("utf-8")
    )
    signature = _b64url(b"simulated-signature-bytes") if alg.lower() != "none" else ""
    return f"{header}.{payload}.{signature}"


class _FailingAssetRepo(AudioAssetRepository):
    async def create_or_get(self, asset: AudioAssetRecord) -> AudioAssetRecord:
        raise StorageIntegrationError(
            "Simulated audio_assets insert failure.",
            code="DATABASE_WRITE_FAILED",
        )

    async def get_by_id(self, asset_id: str) -> AudioAssetRecord | None:
        return None

    async def find_by_storage_path(self, bucket: str, object_path: str) -> AudioAssetRecord | None:
        return None


class _TrackingStorageWrapper(StorageAdapter):
    """Wraps a real LocalFilesystemStorageAdapter to inject upload/delete failures and spy calls."""

    def __init__(
        self,
        inner: LocalFilesystemStorageAdapter,
        *,
        fail_upload_on_call: int | None = None,
        fail_delete: bool = False,
    ) -> None:
        self._inner = inner
        self._fail_upload_on_call = fail_upload_on_call
        self._fail_delete = fail_delete
        self.upload_calls: list[tuple[str, str]] = []
        self.delete_calls: list[tuple[str, str]] = []

    async def head_object(self, bucket: str, object_path: str) -> StorageObjectInfo:
        return await self._inner.head_object(bucket, object_path)

    async def download_to_path(self, bucket: str, object_path: str, destination: Path) -> StorageObjectInfo:
        return await self._inner.download_to_path(bucket, object_path, destination)

    async def upload_from_path(
        self,
        bucket: str,
        object_path: str,
        source: Path,
        content_type: str,
    ) -> StorageObjectInfo:
        self.upload_calls.append((bucket, object_path))
        if self._fail_upload_on_call is not None and len(self.upload_calls) == self._fail_upload_on_call:
            raise StorageIntegrationError(
                "Simulated storage upload failure.",
                code="STORAGE_UPLOAD_FAILED",
            )
        return await self._inner.upload_from_path(bucket, object_path, source, content_type)

    async def delete_object(self, bucket: str, object_path: str) -> bool:
        self.delete_calls.append((bucket, object_path))
        if self._fail_delete:
            raise StorageIntegrationError(
                "Simulated storage delete failure.",
                code="STORAGE_DELETE_FAILED",
            )
        return await self._inner.delete_object(bucket, object_path)

    async def create_signed_url(
        self,
        bucket: str,
        object_path: str,
        expires_in_seconds: int = 300,
    ) -> str:
        return await self._inner.create_signed_url(bucket, object_path, expires_in_seconds)


class _RecoveryArqPipeline:
    def __init__(self, pool: _RecoveryArqPool) -> None:
        self._pool = pool
        self._ops: list[tuple[str, tuple[Any, ...]]] = []

    async def __aenter__(self) -> _RecoveryArqPipeline:
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        return None

    def exists(self, key: str) -> None:
        self._ops.append(("exists", (key,)))

    def zscore(self, queue_name: str, job_id: str) -> None:
        self._ops.append(("zscore", (queue_name, job_id)))

    async def execute(self) -> list[Any]:
        if self._pool.fail_inspection:
            raise ConnectionError("Simulated Redis inspection outage")
        results: list[Any] = []
        for op, args in self._ops:
            if op == "exists":
                results.append(1 if args[0] in self._pool.in_progress_keys else 0)
            elif op == "zscore":
                results.append(self._pool.queued_scores.get((args[0], args[1])))
        return results


class _RecoveryArqPool:
    """Test double implementing ArqRedis pipeline (`exists`/`zscore`) and cancel keys."""

    def __init__(self) -> None:
        self.queued_scores: dict[tuple[str, str], float] = {}
        self.in_progress_keys: set[str] = set()
        self.kv: dict[str, Any] = {}
        self.enqueued: list[dict[str, Any]] = []
        self.fail_enqueue: bool = False
        self.fail_inspection: bool = False

    def pipeline(self, transaction: bool = True) -> _RecoveryArqPipeline:
        return _RecoveryArqPipeline(self)

    async def enqueue_job(
        self,
        function: str,
        *args: Any,
        _job_id: str | None = None,
        _queue_name: str | None = None,
        _defer_by: float | None = None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        if self.fail_enqueue:
            raise ConnectionError("Simulated queue outage")
        if _job_id and _queue_name:
            self.queued_scores[(_queue_name, _job_id)] = 1.0
        entry = {"function": function, "args": args, "job_id": _job_id, "queue_name": _queue_name}
        self.enqueued.append(entry)
        return entry

    async def get(self, key: str) -> Any:
        return self.kv.get(key)

    async def set(self, key: str, value: Any, ex: int | None = None) -> bool:
        self.kv[key] = value
        return True

    async def delete(self, key: str) -> int:
        return 1 if self.kv.pop(key, None) is not None else 0

    async def ping(self) -> bool:
        return True

    async def aclose(self) -> None:
        return None


def _make_job(
    *,
    user_id: str = USER_A_ID,
    job_id: str | None = None,
    job_type: JobType = JobType.AUDIO_RENDERING,
    status: JobStatus = JobStatus.QUEUED,
    object_path: str | None = None,
    updated_at: datetime | None = None,
) -> JobResponse:
    now = updated_at or datetime.now(timezone.utc)
    jid = job_id or str(uuid.uuid4())
    return JobResponse(
        job_id=jid,
        user_id=user_id,
        job_type=job_type,
        status=status,
        progress_percent=0 if status == JobStatus.QUEUED else 40,
        stage="queued" if status == JobStatus.QUEUED else "executing_audio_rendering",
        source_audio=AudioSourceRef(
            storage_backend=StorageBackendType.LOCAL,
            bucket="sonora-audio",
            object_path=object_path or f"{user_id}/uploads/{uuid.uuid4()}/vocal.wav",
            original_filename="vocal.wav",
            declared_mime_type="audio/wav",
        ),
        created_at=now,
        updated_at=now,
        started_at=now if status == JobStatus.PROCESSING else None,
    )


# =============================================================================
# P0: STORAGE DELETION & UPLOAD ROLLBACK TESTS
# =============================================================================


@pytest.mark.asyncio
async def test_local_storage_delete_object_idempotent_and_rejects_invalid_paths(tmp_path: Path) -> None:
    adapter = LocalFilesystemStorageAdapter(tmp_path / "storage")
    src = tmp_path / "sample.wav"
    src.write_bytes(b"RIFFtest")

    valid_path = f"{USER_A_ID}/uploads/asset-1/sample.wav"
    await adapter.upload_from_path("sonora-audio", valid_path, src, "audio/wav")

    # Deleting existing file returns True, deleting again returns False (idempotent)
    assert await adapter.delete_object("sonora-audio", valid_path) is True
    assert await adapter.delete_object("sonora-audio", valid_path) is False
    assert await adapter.delete_object("sonora-audio", f"{USER_A_ID}/uploads/missing.wav") is False

    # Directory path cannot be deleted
    dir_path = f"{USER_A_ID}/uploads"
    (tmp_path / "storage" / "sonora-audio" / dir_path).mkdir(parents=True, exist_ok=True)
    with pytest.raises(ValidationError) as dir_exc:
        await adapter.delete_object("sonora-audio", dir_path)
    assert dir_exc.value.code == "INVALID_STORAGE_PATH"

    # Invalid/traversal paths are strictly rejected
    for bad_bucket, bad_path in [
        ("sonora-audio", f"{USER_A_ID}/../{USER_B_ID}/secret.wav"),
        ("sonora-audio", f"/{USER_A_ID}/uploads/test.wav"),
        ("sonora-audio", f"{USER_A_ID}\\uploads\\test.wav"),
        ("sonora-audio", ""),
        ("sonora-audio", f"{USER_A_ID}"),
        ("../escape", f"{USER_A_ID}/uploads/test.wav"),
        ("", f"{USER_A_ID}/uploads/test.wav"),
    ]:
        with pytest.raises(ValidationError) as exc_info:
            await adapter.delete_object(bad_bucket, bad_path)
        assert exc_info.value.code == "INVALID_STORAGE_PATH"


@pytest.mark.asyncio
async def test_supabase_storage_delete_object_handles_200_404_400_not_found_and_unauthorized_bucket() -> None:
    calls: list[tuple[str, str]] = []
    responses: dict[str, httpx.Response] = {
        f"/storage/v1/object/sonora-audio/{USER_A_ID}/uploads/exists.wav": httpx.Response(200, json={"message": "ok"}),
        f"/storage/v1/object/sonora-audio/{USER_A_ID}/uploads/missing_404.wav": httpx.Response(404, json={"error": "not_found"}),
        f"/storage/v1/object/sonora-audio/{USER_A_ID}/uploads/missing_400.wav": httpx.Response(
            400, json={"statusCode": "404", "error": "not_found", "message": "Object not found"}
        ),
        f"/storage/v1/object/sonora-audio/{USER_A_ID}/uploads/server_err.wav": httpx.Response(500, text="boom"),
    }

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append((request.method, request.url.path))
        return responses.get(request.url.path, httpx.Response(404))

    settings = Settings(
        music_engine_env="test",
        supabase_url="https://example-project.supabase.co",
        supabase_service_role_key="sb_secret_super_sensitive_token",
        supabase_audio_bucket="sonora-audio",
    )
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http_client:
        adapter = SupabaseStorageAdapter(settings, http_client=http_client)

        assert await adapter.delete_object("sonora-audio", f"{USER_A_ID}/uploads/exists.wav") is True
        assert await adapter.delete_object("sonora-audio", f"{USER_A_ID}/uploads/missing_404.wav") is False
        assert await adapter.delete_object("sonora-audio", f"{USER_A_ID}/uploads/missing_400.wav") is False

        with pytest.raises(StorageIntegrationError) as err_500:
            await adapter.delete_object("sonora-audio", f"{USER_A_ID}/uploads/server_err.wav")
        assert err_500.value.code == "STORAGE_DELETE_FAILED"
        assert "sb_secret_super_sensitive_token" not in err_500.value.message

        # Unauthorized bucket rejected before any HTTP call
        calls_before = len(calls)
        with pytest.raises(AccessDeniedError) as bucket_exc:
            await adapter.delete_object("other-private-bucket", f"{USER_A_ID}/uploads/exists.wav")
        assert bucket_exc.value.code == "BUCKET_NOT_ALLOWED"
        assert len(calls) == calls_before

        # Traversal rejected before any HTTP call
        with pytest.raises(ValidationError) as trav_exc:
            await adapter.delete_object("sonora-audio", f"{USER_A_ID}/../{USER_B_ID}/exists.wav")
        assert trav_exc.value.code == "INVALID_STORAGE_PATH"
        assert len(calls) == calls_before


def test_upload_success_storage_failure_db_rollback_and_rollback_failure(
    test_settings: Settings,
    tmp_path: Path,
    capsys: pytest.CaptureFixture[str],
) -> None:
    wav_path = generate_sine_wav(tmp_path / "vocal.wav", duration_sec=0.6)
    wav_bytes = wav_path.read_bytes()
    headers_a = {"Authorization": f"Bearer {make_jwt(USER_A_ID)}"}

    # 1. Successful upload and metadata persistence
    inner_storage = LocalFilesystemStorageAdapter(test_settings.local_storage_path)
    ok_storage = _TrackingStorageWrapper(inner_storage)
    ok_repo = InMemoryAudioAssetRepository(allowed_bucket=test_settings.supabase_audio_bucket)
    app_ok = create_app(settings=test_settings, storage=ok_storage, asset_repository=ok_repo)
    with TestClient(app_ok) as client:
        resp = client.post("/api/v1/audio/upload", headers=headers_a, files={"file": ("vocal.wav", wav_bytes, "audio/wav")})
        assert resp.status_code == 201
        ref = resp.json()["asset_reference"]
        stored_file = test_settings.local_storage_path / ref["bucket"] / ref["object_path"]
        assert stored_file.is_file()
        assert stored_file.read_bytes() == wav_bytes
        assert ok_storage.delete_calls == []

    # 2. Storage upload failure -> DB insert never called, error returned cleanly
    fail_up_storage = _TrackingStorageWrapper(inner_storage, fail_upload_on_call=1)
    spy_repo = InMemoryAudioAssetRepository(allowed_bucket=test_settings.supabase_audio_bucket)
    app_fail_up = create_app(settings=test_settings, storage=fail_up_storage, asset_repository=spy_repo)
    with TestClient(app_fail_up) as client:
        resp = client.post("/api/v1/audio/upload", headers=headers_a, files={"file": ("vocal.wav", wav_bytes, "audio/wav")})
        assert resp.status_code == 502
        assert resp.json()["error"]["code"] == "STORAGE_UPLOAD_FAILED"
        assert fail_up_storage.delete_calls == []

    # 3. DB insert failure after storage upload -> successful storage rollback removes uploaded bytes
    rb_storage = _TrackingStorageWrapper(inner_storage)
    app_rb = create_app(settings=test_settings, storage=rb_storage, asset_repository=_FailingAssetRepo())
    with TestClient(app_rb) as client:
        resp = client.post("/api/v1/audio/upload", headers=headers_a, files={"file": ("vocal.wav", wav_bytes, "audio/wav")})
        assert resp.status_code == 502
        assert resp.json()["error"]["code"] == "DATABASE_WRITE_FAILED"
        assert "asset_reference" not in resp.json()
        assert len(rb_storage.upload_calls) == 1
        assert rb_storage.delete_calls == rb_storage.upload_calls
        uploaded_bucket, uploaded_path = rb_storage.upload_calls[0]
        assert not (test_settings.local_storage_path / uploaded_bucket / uploaded_path).exists()

    # 4. DB insert failure + storage rollback failure -> logs error cleanly, re-raises DB failure
    capsys.readouterr()
    rb_fail_storage = _TrackingStorageWrapper(inner_storage, fail_delete=True)
    app_rb_fail = create_app(settings=test_settings, storage=rb_fail_storage, asset_repository=_FailingAssetRepo())
    with TestClient(app_rb_fail) as client:
        resp = client.post(
            "/api/v1/audio/upload",
            headers=headers_a,
            files={"file": ("vocal.wav", wav_bytes, "audio/wav")},
        )
        assert resp.status_code == 502
        assert resp.json()["error"]["code"] == "DATABASE_WRITE_FAILED"
        assert len(rb_fail_storage.delete_calls) == 1
    captured_out = capsys.readouterr().out
    assert "storage rollback also failed" in captured_out.lower()
    assert TEST_JWT_SECRET not in captured_out


# =============================================================================
# P1: GENERATED ARTIFACT CLEANUP TESTS
# =============================================================================


@pytest.mark.asyncio
async def test_generated_artifact_cleanup_all_failure_cancellation_and_isolation_cases(
    test_settings: Settings,
    tmp_path: Path,
) -> None:
    inner_storage = LocalFilesystemStorageAdapter(test_settings.local_storage_path)

    # Seed original vocal recording + another job's artifact + another user's artifact
    vocal_obj = f"{USER_A_ID}/uploads/orig-asset/vocal.wav"
    vocal_file = test_settings.local_storage_path / "sonora-audio" / vocal_obj
    generate_sine_wav(vocal_file, duration_sec=0.5)
    original_vocal_bytes = vocal_file.read_bytes()

    other_job_id = str(uuid.uuid4())
    other_job_obj = f"{USER_A_ID}/jobs/{other_job_id}/master.wav"
    other_job_file = test_settings.local_storage_path / "sonora-audio" / other_job_obj
    other_job_file.parent.mkdir(parents=True, exist_ok=True)
    other_job_file.write_bytes(b"other-job-master")

    def _seed_other_user_same_job(job_id: str) -> Path:
        p = test_settings.local_storage_path / "sonora-audio" / f"{USER_B_ID}/jobs/{job_id}/master.wav"
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(b"other-user-master")
        return p

    # --- Case 1: Failure before any artifact upload ---
    storage_1 = _TrackingStorageWrapper(inner_storage)
    reg_1 = ProcessingEngineRegistry(
        settings=test_settings,
        ingestion=DefaultAudioIngestionService(test_settings, storage_1),
        decoder=FFmpegAudioDecoder(test_settings),
        storage=storage_1,
    )

    async def _fail_immediately(job: JobResponse, decoded: DecodedAudio, workspace_dir: Path) -> JobExecutionOutput:
        raise MixingError("Failed before uploading anything", code="MIXING_FAILED")

    reg_1.register_processor(JobType.AUDIO_RENDERING, "fail-early", _fail_immediately)
    pipe_1 = ProcessingPipeline(test_settings, reg_1)
    job_1 = _make_job(object_path=vocal_obj)
    res_1 = await pipe_1.run(job_1, lambda j: j, lambda: False)
    assert res_1.status == JobStatus.FAILED
    assert storage_1.delete_calls == []
    assert vocal_file.read_bytes() == original_vocal_bytes

    # --- Case 2: Failure after ONE artifact upload ---
    storage_2 = _TrackingStorageWrapper(inner_storage)
    reg_2 = ProcessingEngineRegistry(
        settings=test_settings,
        ingestion=DefaultAudioIngestionService(test_settings, storage_2),
        decoder=FFmpegAudioDecoder(test_settings),
        storage=storage_2,
    )
    job_2 = _make_job(object_path=vocal_obj)
    other_user_file_2 = _seed_other_user_same_job(job_2.job_id)

    async def _fail_after_one(job: JobResponse, decoded: DecodedAudio, workspace_dir: Path) -> JobExecutionOutput:
        # Simulate stage uploading 1 artifact via tracker-compatible path (or direct tracker test below)
        art_file = workspace_dir / "accompaniment.mid"
        art_file.write_bytes(b"MThd0001")
        obj_path = f"{job.user_id}/jobs/{job.job_id}/accompaniment.mid"
        await storage_2.upload_from_path("sonora-audio", obj_path, art_file, "audio/midi")
        raise MixingError("Failed after first upload", code="MIXING_FAILED")

    # Use JobArtifactTracker directly via execute_job_stage wrapper to simulate AccompanimentOrchestrator
    orig_exec_2 = reg_2.execute_job_stage

    async def _tracked_fail_after_one(job, decoded, workspace_dir, *, artifact_tracker=None):
        art_file = workspace_dir / "accompaniment.mid"
        art_file.write_bytes(b"MThd0001")
        obj_path = f"{job.user_id}/jobs/{job.job_id}/accompaniment.mid"
        await storage_2.upload_from_path("sonora-audio", obj_path, art_file, "audio/midi")
        if artifact_tracker is not None:
            artifact_tracker.record_upload("sonora-audio", obj_path)
            # Also try recording unsafe/foreign paths to verify strict isolation
            artifact_tracker.record_upload("sonora-audio", vocal_obj)
            artifact_tracker.record_upload("sonora-audio", other_job_obj)
            artifact_tracker.record_upload("sonora-audio", f"{USER_B_ID}/jobs/{job.job_id}/master.wav")
        raise MixingError("Failed after 1 upload", code="MIXING_FAILED")

    reg_2.execute_job_stage = _tracked_fail_after_one  # type: ignore[method-assign]
    pipe_2 = ProcessingPipeline(test_settings, reg_2)
    res_2 = await pipe_2.run(job_2, lambda j: j, lambda: False)
    assert res_2.status == JobStatus.FAILED
    assert storage_2.delete_calls == [("sonora-audio", f"{USER_A_ID}/jobs/{job_2.job_id}/accompaniment.mid")]
    assert not (test_settings.local_storage_path / "sonora-audio" / f"{USER_A_ID}/jobs/{job_2.job_id}/accompaniment.mid").exists()
    # Original vocal, other job, and other user files are strictly preserved!
    assert vocal_file.read_bytes() == original_vocal_bytes
    assert other_job_file.read_bytes() == b"other-job-master"
    assert other_user_file_2.read_bytes() == b"other-user-master"

    # --- Case 3: Failure after MULTIPLE artifact uploads ---
    storage_3 = _TrackingStorageWrapper(inner_storage)
    reg_3 = ProcessingEngineRegistry(
        settings=test_settings,
        ingestion=DefaultAudioIngestionService(test_settings, storage_3),
        decoder=FFmpegAudioDecoder(test_settings),
        storage=storage_3,
    )
    job_3 = _make_job(object_path=vocal_obj)

    async def _tracked_fail_after_multi(job, decoded, workspace_dir, *, artifact_tracker=None):
        for name in ["accompaniment.mid", "accompaniment.wav", "stems/piano.wav"]:
            local = workspace_dir / name.replace("/", "_")
            local.write_bytes(b"generated-bytes")
            obj = f"{job.user_id}/jobs/{job.job_id}/{name}"
            await storage_3.upload_from_path("sonora-audio", obj, local, "application/octet-stream")
            if artifact_tracker is not None:
                artifact_tracker.record_upload("sonora-audio", obj)
        raise MixingError("Failed during export", code="MIXING_FAILED")

    reg_3.execute_job_stage = _tracked_fail_after_multi  # type: ignore[method-assign]
    pipe_3 = ProcessingPipeline(test_settings, reg_3)
    res_3 = await pipe_3.run(job_3, lambda j: j, lambda: False)
    assert res_3.status == JobStatus.FAILED
    assert len(storage_3.delete_calls) == 3
    for name in ["accompaniment.mid", "accompaniment.wav", "stems/piano.wav"]:
        assert not (test_settings.local_storage_path / "sonora-audio" / f"{USER_A_ID}/jobs/{job_3.job_id}/{name}").exists()
    assert vocal_file.read_bytes() == original_vocal_bytes

    # --- Case 4: Cancellation during rendering ---
    storage_4 = _TrackingStorageWrapper(inner_storage)
    reg_4 = ProcessingEngineRegistry(
        settings=test_settings,
        ingestion=DefaultAudioIngestionService(test_settings, storage_4),
        decoder=FFmpegAudioDecoder(test_settings),
        storage=storage_4,
    )
    job_4 = _make_job(object_path=vocal_obj)
    cancelled_flag = False

    async def _cancel_during_render(job, decoded, workspace_dir, *, artifact_tracker=None):
        nonlocal cancelled_flag
        local = workspace_dir / "master.wav"
        local.write_bytes(b"rendered-master")
        obj = f"{job.user_id}/jobs/{job.job_id}/master.wav"
        await storage_4.upload_from_path("sonora-audio", obj, local, "audio/wav")
        if artifact_tracker is not None:
            artifact_tracker.record_upload("sonora-audio", obj)
        cancelled_flag = True
        return JobExecutionOutput(
            result={"ok": True},
            artifacts=[
                JobArtifactRef(
                    artifact_type="master_audio_wav",
                    storage_backend="local",
                    bucket="sonora-audio",
                    object_path=obj,
                    mime_type="audio/wav",
                    size_bytes=15,
                )
            ],
        )

    reg_4.execute_job_stage = _cancel_during_render  # type: ignore[method-assign]
    pipe_4 = ProcessingPipeline(test_settings, reg_4)
    res_4 = await pipe_4.run(job_4, lambda j: j, lambda: cancelled_flag)
    assert res_4.status == JobStatus.CANCELLED
    assert storage_4.delete_calls == [("sonora-audio", f"{USER_A_ID}/jobs/{job_4.job_id}/master.wav")]
    assert not (test_settings.local_storage_path / "sonora-audio" / f"{USER_A_ID}/jobs/{job_4.job_id}/master.wav").exists()

    # --- Case 5: Final DB persistence failure after rendering completes ---
    storage_5 = _TrackingStorageWrapper(inner_storage)
    reg_5 = ProcessingEngineRegistry(
        settings=test_settings,
        ingestion=DefaultAudioIngestionService(test_settings, storage_5),
        decoder=FFmpegAudioDecoder(test_settings),
        storage=storage_5,
    )
    job_5 = _make_job(object_path=vocal_obj)

    async def _succeed_render(job, decoded, workspace_dir, *, artifact_tracker=None):
        refs: list[JobArtifactRef] = []
        for name in ["accompaniment.mid", "master.wav"]:
            local = workspace_dir / name
            local.write_bytes(b"final-bytes")
            obj = f"{job.user_id}/jobs/{job.job_id}/{name}"
            await storage_5.upload_from_path("sonora-audio", obj, local, "application/octet-stream")
            if artifact_tracker is not None:
                artifact_tracker.record_upload("sonora-audio", obj)
            refs.append(
                JobArtifactRef(
                    artifact_type=name,
                    storage_backend="local",
                    bucket="sonora-audio",
                    object_path=obj,
                    mime_type="application/octet-stream",
                    size_bytes=11,
                )
            )
        return JobExecutionOutput(result={"done": True}, artifacts=refs)

    reg_5.execute_job_stage = _succeed_render  # type: ignore[method-assign]
    pipe_5 = ProcessingPipeline(test_settings, reg_5)

    async def _fail_on_completed_save(updated: JobResponse) -> JobResponse:
        if updated.status == JobStatus.COMPLETED:
            raise StorageIntegrationError("Simulated final DB write outage", code="DATABASE_WRITE_FAILED")
        return updated

    res_5 = await pipe_5.run(job_5, _fail_on_completed_save, lambda: False)
    assert res_5.status == JobStatus.FAILED
    assert res_5.error is not None and res_5.error.code == "DATABASE_WRITE_FAILED"
    assert res_5.artifacts == []
    assert len(storage_5.delete_calls) == 2
    for name in ["accompaniment.mid", "master.wav"]:
        assert not (test_settings.local_storage_path / "sonora-audio" / f"{USER_A_ID}/jobs/{job_5.job_id}/{name}").exists()
    assert vocal_file.read_bytes() == original_vocal_bytes

    # --- Case 6: Cleanup failure logs error without masking original job failure ---
    storage_6 = _TrackingStorageWrapper(inner_storage, fail_delete=True)
    reg_6 = ProcessingEngineRegistry(
        settings=test_settings,
        ingestion=DefaultAudioIngestionService(test_settings, storage_6),
        decoder=FFmpegAudioDecoder(test_settings),
        storage=storage_6,
    )
    job_6 = _make_job(object_path=vocal_obj)

    async def _upload_then_fail_cleanup_err(job, decoded, workspace_dir, *, artifact_tracker=None):
        local = workspace_dir / "accompaniment.wav"
        local.write_bytes(b"wav-bytes")
        obj = f"{job.user_id}/jobs/{job.job_id}/accompaniment.wav"
        await storage_6.upload_from_path("sonora-audio", obj, local, "audio/wav")
        if artifact_tracker is not None:
            artifact_tracker.record_upload("sonora-audio", obj)
        raise MixingError("Primary mixing failure", code="MIXING_FAILED")

    reg_6.execute_job_stage = _upload_then_fail_cleanup_err  # type: ignore[method-assign]
    pipe_6 = ProcessingPipeline(test_settings, reg_6)
    res_6 = await pipe_6.run(job_6, lambda j: j, lambda: False)
    assert res_6.status == JobStatus.FAILED
    assert res_6.error is not None and res_6.error.code == "MIXING_FAILED"
    assert len(storage_6.delete_calls) == 1

    # --- Case 7: Tracker idempotency across repeated cleanup calls ---
    tracker = JobArtifactTracker(
        user_id=USER_A_ID,
        job_id=job_6.job_id,
        allowed_bucket="sonora-audio",
        source_object_path=vocal_obj,
    )
    tracker.record_upload("sonora-audio", f"{USER_A_ID}/jobs/{job_6.job_id}/accompaniment.wav")
    first_clean = await tracker.cleanup(inner_storage, reason="retry_1")
    second_clean = await tracker.cleanup(inner_storage, reason="retry_2")
    assert first_clean.deleted == 1
    assert second_clean.attempted == 0
    assert vocal_file.read_bytes() == original_vocal_bytes
    assert other_job_file.read_bytes() == b"other-job-master"


@pytest.mark.asyncio
async def test_real_accompaniment_orchestrator_cleans_up_partial_uploads_on_mid_render_failure(
    test_settings: Settings,
) -> None:
    """
    Verifies the real AccompanimentOrchestrator + ProcessingPipeline wiring:
    when accompaniment.mid uploads successfully and accompaniment.wav upload fails,
    accompaniment.mid is automatically deleted while the original vocal upload remains intact.
    """
    from app.core.runtime import build_pipeline, build_registry

    inner_storage = LocalFilesystemStorageAdapter(test_settings.local_storage_path)
    vocal_obj = f"{USER_A_ID}/uploads/orig-real/vocal.wav"
    vocal_file = test_settings.local_storage_path / "sonora-audio" / vocal_obj
    generate_sine_wav(vocal_file, duration_sec=0.8)
    original_bytes = vocal_file.read_bytes()

    # Fail on the 2nd storage upload (after accompaniment.mid succeeds, when accompaniment.wav uploads)
    storage = _TrackingStorageWrapper(inner_storage, fail_upload_on_call=2)
    registry = build_registry(test_settings, storage)
    pipeline = build_pipeline(test_settings, registry)

    job = _make_job(
        job_type=JobType.ACCOMPANIMENT_GENERATION,
        object_path=vocal_obj,
    ).model_copy(
        update={
            "parameters": {
                "instruments": ["piano"],
                "render_individual_stems": False,
            }
        }
    )

    result = await pipeline.run(job, lambda j: j, lambda: False)
    assert result.status == JobStatus.FAILED
    assert result.error is not None
    assert result.error.code == "STORAGE_UPLOAD_FAILED"

    midi_path = f"{USER_A_ID}/jobs/{job.job_id}/accompaniment.mid"
    assert ("sonora-audio", midi_path) in storage.upload_calls
    assert storage.delete_calls == [("sonora-audio", midi_path)]
    assert not (test_settings.local_storage_path / "sonora-audio" / midi_path).exists()
    # Original uploaded vocal recording is strictly untouched
    assert vocal_file.read_bytes() == original_bytes


# =============================================================================
# P1: STALE QUEUED-JOB RECOVERY TESTS
# =============================================================================


@pytest.mark.asyncio
async def test_stale_queued_job_recovery_all_scenarios(tmp_path: Path) -> None:
    settings = Settings(
        music_engine_env="test",
        music_engine_temp_dir=str(tmp_path / "temp"),
        music_engine_local_storage_dir=str(tmp_path / "storage"),
        music_engine_queue_backend="arq",
        music_engine_redis_url="redis://localhost:6379/0",
        music_engine_arq_queue_name="sonora:test-recovery",
        music_engine_stale_job_timeout_seconds=900,
        music_engine_stale_queued_job_timeout_seconds=300,
    )
    repo = InMemoryJobRepository()
    pool = _RecoveryArqPool()
    queue = ArqRedisQueueBackend(settings=settings, pool=pool)

    now = datetime.now(timezone.utc)
    stale_queued_ts = now - timedelta(seconds=600)
    fresh_queued_ts = now - timedelta(seconds=60)
    stale_proc_ts = now - timedelta(seconds=1200)

    # 1. Stale queued job with NO queue entry -> recovered as failed (QUEUE_DISPATCH_ORPHANED)
    orphaned_queued = _make_job(status=JobStatus.QUEUED, updated_at=stale_queued_ts)
    # 2. Stale queued job STILL pending in ARQ -> must NOT be failed
    pending_in_arq = _make_job(status=JobStatus.QUEUED, updated_at=stale_queued_ts)
    pool.queued_scores[(settings.music_engine_arq_queue_name, arq_job_key(pending_in_arq.job_id))] = 123.0
    # 3. Recently queued job (within threshold) -> untouched
    recent_queued = _make_job(status=JobStatus.QUEUED, updated_at=fresh_queued_ts)
    # 4. Existing stale processing job -> still recovered via existing re-enqueue behavior
    stale_processing = _make_job(status=JobStatus.PROCESSING, updated_at=stale_proc_ts)

    for j in (orphaned_queued, pending_in_arq, recent_queued, stale_processing):
        await repo.create(j)

    summary = await recover_orphaned_jobs(
        settings=settings,
        repository=repo,
        queue=queue,
        worker_id="worker-rec-1",
    )
    assert summary == {"inspected": 3, "requeued": 1, "cancelled": 0, "failed": 1}

    rec_orphan = await repo.get_by_id(orphaned_queued.job_id)
    assert rec_orphan is not None
    assert rec_orphan.status == JobStatus.FAILED
    assert rec_orphan.error is not None
    assert rec_orphan.error.code == "QUEUE_DISPATCH_ORPHANED"
    assert rec_orphan.error.retryable is True

    rec_pending = await repo.get_by_id(pending_in_arq.job_id)
    assert rec_pending is not None
    assert rec_pending.status == JobStatus.QUEUED

    rec_recent = await repo.get_by_id(recent_queued.job_id)
    assert rec_recent is not None
    assert rec_recent.status == JobStatus.QUEUED

    rec_proc = await repo.get_by_id(stale_processing.job_id)
    assert rec_proc is not None
    assert rec_proc.status == JobStatus.PROCESSING
    assert rec_proc.stage == "recovering_after_worker_restart"

    # 5. Repeated recovery execution is strictly idempotent
    second_summary = await recover_orphaned_jobs(
        settings=settings,
        repository=repo,
        queue=queue,
        worker_id="worker-rec-2",
    )
    assert second_summary["failed"] == 0
    assert second_summary["requeued"] == 0
    assert (await repo.get_by_id(orphaned_queued.job_id)).status == JobStatus.FAILED  # type: ignore[union-attr]
    assert (await repo.get_by_id(pending_in_arq.job_id)).status == JobStatus.QUEUED  # type: ignore[union-attr]


@pytest.mark.asyncio
async def test_stale_queued_recovery_guards_concurrent_activation_and_db_failure(tmp_path: Path) -> None:
    settings = Settings(
        music_engine_env="test",
        music_engine_queue_backend="arq",
        music_engine_redis_url="redis://localhost:6379/0",
        music_engine_stale_queued_job_timeout_seconds=300,
    )
    now = datetime.now(timezone.utc)
    stale_ts = now - timedelta(seconds=600)

    # Case A: Job becomes `processing` right as recovery runs -> conditional update does NOT overwrite
    class _ConcurrentActivationRepo(InMemoryJobRepository):
        async def list_stale_queued_jobs(self, older_than: datetime, limit: int = 50) -> list[JobResponse]:
            items = await super().list_stale_queued_jobs(older_than, limit=limit)
            # Simulate another worker picking up the job right after the SELECT
            for item in items:
                await super().update(
                    item.model_copy(
                        update={
                            "status": JobStatus.PROCESSING,
                            "stage": "decoding_audio",
                            "updated_at": datetime.now(timezone.utc),
                        }
                    )
                )
            return items

    race_repo = _ConcurrentActivationRepo()
    race_job = _make_job(status=JobStatus.QUEUED, updated_at=stale_ts)
    await race_repo.create(race_job)
    queue = ArqRedisQueueBackend(settings=settings, pool=_RecoveryArqPool())

    summary_race = await recover_orphaned_jobs(
        settings=settings,
        repository=race_repo,
        queue=queue,
        worker_id="worker-race",
    )
    assert summary_race["failed"] == 0
    after_race = await race_repo.get_by_id(race_job.job_id)
    assert after_race is not None
    assert after_race.status == JobStatus.PROCESSING
    assert after_race.stage == "decoding_audio"

    # Case B: DB update failure on one job does not crash recovery of subsequent jobs
    class _FlakyUpdateRepo(InMemoryJobRepository):
        def __init__(self, fail_job_id: str) -> None:
            super().__init__()
            self._fail_job_id = fail_job_id

        async def update_if_status(self, job: JobResponse, expected_status: JobStatus) -> JobResponse | None:
            if job.job_id == self._fail_job_id:
                raise StorageIntegrationError("Transient DB error", code="DATABASE_WRITE_FAILED")
            return await super().update_if_status(job, expected_status)

    j_fail = _make_job(status=JobStatus.QUEUED, updated_at=stale_ts - timedelta(seconds=10))
    j_ok = _make_job(status=JobStatus.QUEUED, updated_at=stale_ts)
    flaky_repo = _FlakyUpdateRepo(fail_job_id=j_fail.job_id)
    await flaky_repo.create(j_fail)
    await flaky_repo.create(j_ok)

    summary_flaky = await recover_orphaned_jobs(
        settings=settings,
        repository=flaky_repo,
        queue=queue,
        worker_id="worker-flaky",
    )
    assert summary_flaky["inspected"] == 2
    assert summary_flaky["failed"] == 1
    assert (await flaky_repo.get_by_id(j_fail.job_id)).status == JobStatus.QUEUED  # type: ignore[union-attr]
    assert (await flaky_repo.get_by_id(j_ok.job_id)).status == JobStatus.FAILED  # type: ignore[union-attr]

    # Case C: Queue inspection outage -> conservatively skips failing the job
    outage_pool = _RecoveryArqPool()
    outage_pool.fail_inspection = True
    outage_queue = ArqRedisQueueBackend(settings=settings, pool=outage_pool)
    outage_repo = InMemoryJobRepository()
    j_safe = _make_job(status=JobStatus.QUEUED, updated_at=stale_ts)
    await outage_repo.create(j_safe)

    summary_outage = await recover_orphaned_jobs(
        settings=settings,
        repository=outage_repo,
        queue=outage_queue,
        worker_id="worker-outage",
    )
    assert summary_outage["failed"] == 0
    assert (await outage_repo.get_by_id(j_safe.job_id)).status == JobStatus.QUEUED  # type: ignore[union-attr]


@pytest.mark.asyncio
async def test_supabase_job_repository_list_stale_queued_and_conditional_patch() -> None:
    rows: dict[str, dict[str, Any]] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST" and request.url.path == "/rest/v1/processing_jobs":
            row = json.loads(request.content.decode("utf-8"))
            rows[row["id"]] = row
            return httpx.Response(201, json=[row])
        if request.method == "GET" and request.url.path == "/rest/v1/processing_jobs":
            params = request.url.params
            if params.get("status") == "eq.queued" and "updated_at" in params:
                cutoff = params["updated_at"].removeprefix("lt.")
                matched = [r for r in rows.values() if r["status"] == "queued" and r["updated_at"] < cutoff]
                return httpx.Response(200, json=matched)
        if request.method == "PATCH" and request.url.path == "/rest/v1/processing_jobs":
            params = request.url.params
            jid = params["id"].removeprefix("eq.")
            expected = params.get("status", "").removeprefix("eq.")
            current = rows.get(jid)
            if current is None or (expected and current["status"] != expected):
                return httpx.Response(200, json=[])
            patch = json.loads(request.content.decode("utf-8"))
            merged = {**current, **patch}
            rows[jid] = merged
            return httpx.Response(200, json=[merged])
        return httpx.Response(404)

    settings = Settings(
        music_engine_env="test",
        supabase_url="https://example-project.supabase.co",
        supabase_service_role_key="sb_secret_server_only",
    )
    old_ts = datetime.now(timezone.utc) - timedelta(seconds=900)
    job = _make_job(status=JobStatus.QUEUED, updated_at=old_ts)

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http_client:
        repo = SupabaseJobRepository(settings, http_client=http_client)
        await repo.create(job)

        stale = await repo.list_stale_queued_jobs(older_than=datetime.now(timezone.utc) - timedelta(seconds=300))
        assert [j.job_id for j in stale] == [job.job_id]

        # Simulate concurrent worker transition to `processing`
        rows[job.job_id]["status"] = "processing"
        missed = await repo.update_if_status(
            job.model_copy(update={"status": JobStatus.FAILED}),
            JobStatus.QUEUED,
        )
        assert missed is None
        assert rows[job.job_id]["status"] == "processing"

        # Matching expected status succeeds
        matched = await repo.update_if_status(
            job.model_copy(update={"status": JobStatus.FAILED}),
            JobStatus.PROCESSING,
        )
        assert matched is not None
        assert matched.status == JobStatus.FAILED


# =============================================================================
# P0: AUTHENTICATION & ACCOUNT-STATUS HARDENING TESTS
# =============================================================================


@pytest.mark.asyncio
async def test_account_status_fail_safe_matrix_and_no_fail_open() -> None:
    token = make_jwt(USER_A_ID)

    def _make_settings() -> Settings:
        return Settings(
            music_engine_env="test",
            supabase_url="https://example-project.supabase.co",
            supabase_publishable_key="sb_publishable_example",
            supabase_service_role_key="sb_secret_super_sensitive_key",
            supabase_jwt_secret=TEST_JWT_SECRET,
        )

    async def _run_with_profile_handler(profile_handler):
        async with httpx.AsyncClient(transport=httpx.MockTransport(profile_handler)) as http_client:
            verifier = SupabaseAuthVerifier(_make_settings(), http_client=http_client)
            return await verifier.verify_bearer_token(f"Bearer {token}")

    # 1. Valid active account -> allowed
    user = await _run_with_profile_handler(
        lambda req: httpx.Response(200, json=[{"id": USER_A_ID, "account_status": "active"}])
    )
    assert user.id == USER_A_ID

    # 2. Suspended account -> 403 ACCOUNT_INACTIVE
    with pytest.raises(AccessDeniedError) as exc_susp:
        await _run_with_profile_handler(
            lambda req: httpx.Response(200, json=[{"id": USER_A_ID, "account_status": "suspended"}])
        )
    assert exc_susp.value.status_code == 403
    assert exc_susp.value.code == "ACCOUNT_INACTIVE"

    # 3. Archived account -> 403 ACCOUNT_INACTIVE
    with pytest.raises(AccessDeniedError) as exc_arch:
        await _run_with_profile_handler(
            lambda req: httpx.Response(200, json=[{"id": USER_A_ID, "account_status": "archived"}])
        )
    assert exc_arch.value.status_code == 403
    assert exc_arch.value.code == "ACCOUNT_INACTIVE"

    # 4. Missing profile -> 403 ACCOUNT_PROFILE_MISSING (never fails open)
    with pytest.raises(AccessDeniedError) as exc_missing:
        await _run_with_profile_handler(lambda req: httpx.Response(200, json=[]))
    assert exc_missing.value.status_code == 403
    assert exc_missing.value.code == "ACCOUNT_PROFILE_MISSING"

    # 5. PostgREST non-200 response -> 503 ACCOUNT_STATUS_UNAVAILABLE
    with pytest.raises(AccountStatusUnavailableError) as exc_500:
        await _run_with_profile_handler(
            lambda req: httpx.Response(500, json={"message": "internal postgres detail should not leak"})
        )
    assert exc_500.value.status_code == 503
    assert exc_500.value.code == "ACCOUNT_STATUS_UNAVAILABLE"
    assert "internal postgres detail" not in exc_500.value.message
    assert "sb_secret_super_sensitive_key" not in exc_500.value.message

    # 6. Network failure -> 503 ACCOUNT_STATUS_UNAVAILABLE
    def _net_err(req: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("Connection refused to internal host")

    with pytest.raises(AccountStatusUnavailableError) as exc_net:
        await _run_with_profile_handler(_net_err)
    assert exc_net.value.status_code == 503
    assert exc_net.value.code == "ACCOUNT_STATUS_UNAVAILABLE"
    assert "internal host" not in exc_net.value.message

    # 7. Timeout -> 503 ACCOUNT_STATUS_UNAVAILABLE
    def _timeout_err(req: httpx.Request) -> httpx.Response:
        raise httpx.ReadTimeout("Timed out reading from PostgREST")

    with pytest.raises(AccountStatusUnavailableError) as exc_to:
        await _run_with_profile_handler(_timeout_err)
    assert exc_to.value.status_code == 503
    assert exc_to.value.code == "ACCOUNT_STATUS_UNAVAILABLE"

    # 8. Malformed responses (non-JSON, non-list JSON, missing account_status) -> 503
    for malformed_resp in [
        httpx.Response(200, content=b"<html>bad gateway</html>"),
        httpx.Response(200, json={"unexpected": "object"}),
        httpx.Response(200, json=[{"id": USER_A_ID}]),
        httpx.Response(200, json=["not-a-dict"]),
    ]:
        with pytest.raises(AccountStatusUnavailableError) as exc_mal:
            await _run_with_profile_handler(lambda req, r=malformed_resp: r)
        assert exc_mal.value.status_code == 503
        assert exc_mal.value.code == "ACCOUNT_STATUS_UNAVAILABLE"


def test_http_endpoint_returns_503_when_account_status_service_unavailable_and_401_for_invalid_token(
    test_settings: Settings,
) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/rest/v1/profiles":
            return httpx.Response(503, text="upstream postgres unavailable")
        return httpx.Response(404)

    settings = test_settings.model_copy(
        update={
            "supabase_url": "https://example-project.supabase.co",
            "supabase_service_role_key": "sb_secret_never_leak",
            "supabase_jwt_secret": TEST_JWT_SECRET,
        }
    )
    http_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    verifier = SupabaseAuthVerifier(settings, http_client=http_client)
    app = create_app(settings=settings, auth_verifier=verifier)

    with TestClient(app) as client:
        # 9. Valid authentication + unavailable account-status service -> HTTP 503
        resp_503 = client.get("/api/v1/jobs", headers={"Authorization": f"Bearer {make_jwt(USER_A_ID)}"})
        assert resp_503.status_code == 503
        err_503 = resp_503.json()["error"]
        assert err_503["code"] == "ACCOUNT_STATUS_UNAVAILABLE"
        assert err_503["retryable"] is True
        assert "sb_secret_never_leak" not in resp_503.text
        assert "upstream postgres" not in resp_503.text

        # 10. Invalid authentication token -> HTTP 401
        resp_401 = client.get(
            "/api/v1/jobs",
            headers={"Authorization": f"Bearer {make_jwt(USER_A_ID, secret='wrong-secret-012345678901234567890123')}"},
        )
        assert resp_401.status_code == 401
        assert resp_401.json()["error"]["code"] == "INVALID_TOKEN"


@pytest.mark.asyncio
async def test_jwt_verification_handles_hs256_asymmetric_remote_and_rejects_unsigned_tokens() -> None:
    remote_calls: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/auth/v1/user":
            remote_calls.append(request.headers.get("Authorization", ""))
            return httpx.Response(
                200,
                json={"id": USER_A_ID, "email": "singer@sonora.test", "role": "authenticated"},
            )
        if request.url.path == "/rest/v1/profiles":
            return httpx.Response(200, json=[{"id": USER_A_ID, "account_status": "active"}])
        return httpx.Response(404)

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http_client:
        # 1. Auto mode with HS256 secret configured:
        #    - HS256 token verified locally (no /auth/v1/user round-trip)
        #    - ES256 / RS256 token delegates cleanly to /auth/v1/user instead of failing HS256 mismatch
        auto_settings = Settings(
            music_engine_env="test",
            supabase_url="https://example-project.supabase.co",
            supabase_publishable_key="sb_publishable_example",
            supabase_service_role_key="sb_secret_server_only",
            supabase_jwt_secret=TEST_JWT_SECRET,
            supabase_jwt_verification_mode="auto",
        )
        auto_verifier = SupabaseAuthVerifier(auto_settings, http_client=http_client)

        hs256_user = await auto_verifier.verify_bearer_token(f"Bearer {make_jwt(USER_A_ID)}")
        assert hs256_user.id == USER_A_ID
        assert len(remote_calls) == 0

        es256_token = _make_fake_jwt_with_alg("ES256")
        es256_user = await auto_verifier.verify_bearer_token(f"Bearer {es256_token}")
        assert es256_user.id == USER_A_ID
        assert len(remote_calls) == 1

        rs256_token = _make_fake_jwt_with_alg("RS256")
        rs256_user = await auto_verifier.verify_bearer_token(f"Bearer {rs256_token}")
        assert rs256_user.id == USER_A_ID
        assert len(remote_calls) == 2

        # 2. Unsigned `alg=none` and unsupported algorithms are ALWAYS rejected (never delegated)
        for bad_alg in ("none", "None", "HS512", "UNKNOWN_ALG"):
            bad_tok = _make_fake_jwt_with_alg(bad_alg)
            with pytest.raises(AuthenticationError) as bad_exc:
                await auto_verifier.verify_bearer_token(f"Bearer {bad_tok}")
            assert bad_exc.value.status_code == 401
            assert bad_exc.value.code == "INVALID_TOKEN"
        assert len(remote_calls) == 2

        # 3. Remote mode always delegates even for HS256 tokens
        remote_settings = auto_settings.model_copy(update={"supabase_jwt_verification_mode": "remote"})
        remote_verifier = SupabaseAuthVerifier(remote_settings, http_client=http_client)
        rem_user = await remote_verifier.verify_bearer_token(f"Bearer {make_jwt(USER_A_ID)}")
        assert rem_user.id == USER_A_ID
        assert len(remote_calls) == 3

        # 4. Strict hs256 mode rejects asymmetric ES256 tokens cleanly
        hs256_only_settings = auto_settings.model_copy(update={"supabase_jwt_verification_mode": "hs256"})
        hs256_only_verifier = SupabaseAuthVerifier(hs256_only_settings, http_client=http_client)
        with pytest.raises(AuthenticationError) as mode_exc:
            await hs256_only_verifier.verify_bearer_token(f"Bearer {es256_token}")
        assert mode_exc.value.status_code == 401
        assert mode_exc.value.code == "INVALID_TOKEN"
