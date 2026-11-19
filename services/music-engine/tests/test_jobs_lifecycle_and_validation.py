from __future__ import annotations

import asyncio
import time
from pathlib import Path

from app.processing.registry import JobExecutionOutput
from app.schemas.jobs import JobResponse, JobType
from tests.conftest import USER_A_ID, make_jwt


def _wait_for_terminal_status(client, token: str, job_id: str, timeout_sec: float = 4.0) -> dict:
    deadline = time.monotonic() + timeout_sec
    while time.monotonic() < deadline:
        res = client.get(f"/api/v1/jobs/{job_id}", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        body = res.json()
        if body["status"] in {"completed", "failed", "cancelled"}:
            return body
        time.sleep(0.05)
    raise AssertionError(f"Job {job_id} did not reach terminal status within {timeout_sec}s")


def test_request_validation_rejects_unknown_job_type_and_bad_trim_window(client, user_a_wav_object):
    object_path, _ = user_a_wav_object
    token = make_jwt(USER_A_ID)

    r_bad_type = client.post(
        "/api/v1/jobs",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "job_type": "invented_magic_mode",
            "source_audio": {
                "storage_backend": "local",
                "bucket": "sonora-audio",
                "object_path": object_path,
            },
        },
    )
    assert r_bad_type.status_code == 422
    assert r_bad_type.json()["error"]["code"] == "REQUEST_VALIDATION_ERROR"

    r_bad_trim = client.post(
        "/api/v1/jobs",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "job_type": "audio_analysis",
            "source_audio": {
                "storage_backend": "local",
                "bucket": "sonora-audio",
                "object_path": object_path,
            },
            "trim_window": {"start_ms": 500, "end_ms": 200},
        },
    )
    assert r_bad_trim.status_code == 422


def test_job_honestly_fails_when_model_not_integrated_never_fabricates_results(client, user_a_wav_object):
    object_path, _ = user_a_wav_object
    token = make_jwt(USER_A_ID)

    create_res = client.post(
        "/api/v1/jobs",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "job_type": "source_separation",
            "source_audio": {
                "storage_backend": "local",
                "bucket": "sonora-audio",
                "object_path": object_path,
            },
        },
    )
    assert create_res.status_code == 202
    created = create_res.json()
    assert created["status"] == "queued"

    final = _wait_for_terminal_status(client, token, created["job_id"])
    assert final["status"] == "failed"
    assert final["result"] is None
    assert final["artifacts"] == []
    assert final["error"]["code"] == "MODEL_NOT_INTEGRATED"
    # Stage 1 ingestion/decoding metadata was genuinely computed and recorded
    assert final["audio_metadata"]["detected_format"] == "wav"
    assert final["audio_metadata"]["sample_rate_hz"] == 44100


def test_corrupted_file_fails_with_structured_audio_error(client, user_a_corrupt_object):
    object_path, _ = user_a_corrupt_object
    token = make_jwt(USER_A_ID)

    create_res = client.post(
        "/api/v1/jobs",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "job_type": "audio_analysis",
            "source_audio": {
                "storage_backend": "local",
                "bucket": "sonora-audio",
                "object_path": object_path,
            },
        },
    )
    assert create_res.status_code == 202
    final = _wait_for_terminal_status(client, token, create_res.json()["job_id"])
    assert final["status"] == "failed"
    assert final["error"]["code"] == "CORRUPTED_AUDIO_FILE"


def test_job_completes_when_processor_registered_and_rejects_terminal_cancel(
    app_instance,
    client,
    user_a_wav_object,
):
    async def sample_analysis_processor(job: JobResponse, decoded, workspace: Path) -> JobExecutionOutput:
        assert Path(decoded.working_wav_path).is_file()
        return JobExecutionOutput(
            result={
                "decoded_duration_ms": decoded.duration_ms,
                "sample_rate_hz": decoded.sample_rate_hz,
                "processor": "test_verified_adapter",
            }
        )

    app_instance.state.registry.register_processor(
        JobType.AUDIO_ANALYSIS,
        "test_verified_adapter",
        sample_analysis_processor,
    )

    object_path, _ = user_a_wav_object
    token = make_jwt(USER_A_ID)

    create_res = client.post(
        "/api/v1/jobs",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "job_type": "audio_analysis",
            "source_audio": {
                "storage_backend": "local",
                "bucket": "sonora-audio",
                "object_path": object_path,
            },
            "idempotency_key": "idem-analysis-001",
        },
    )
    assert create_res.status_code == 202
    job_id = create_res.json()["job_id"]

    # Idempotency check returns same job
    dup_res = client.post(
        "/api/v1/jobs",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "job_type": "audio_analysis",
            "source_audio": {
                "storage_backend": "local",
                "bucket": "sonora-audio",
                "object_path": object_path,
            },
            "idempotency_key": "idem-analysis-001",
        },
    )
    assert dup_res.status_code == 202
    assert dup_res.json()["job_id"] == job_id

    final = _wait_for_terminal_status(client, token, job_id)
    assert final["status"] == "completed"
    assert final["progress_percent"] == 100
    assert final["result"]["processor"] == "test_verified_adapter"

    # Cancelling a completed job must return 409 Conflict
    cancel_res = client.post(
        f"/api/v1/jobs/{job_id}/cancel",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert cancel_res.status_code == 409
    assert cancel_res.json()["error"]["code"] == "JOB_ALREADY_TERMINAL"


def test_job_cancellation_and_concurrency_quota(app_instance, client, user_a_wav_object):
    async def slow_processor(job: JobResponse, decoded, workspace: Path) -> JobExecutionOutput:
        await asyncio.sleep(1.5)
        return JobExecutionOutput(result={"done": True})

    app_instance.state.registry.register_processor(
        JobType.PITCH_EXTRACTION,
        "slow_test_adapter",
        slow_processor,
    )

    object_path, _ = user_a_wav_object
    token = make_jwt(USER_A_ID)
    payload = {
        "job_type": "pitch_extraction",
        "source_audio": {
            "storage_backend": "local",
            "bucket": "sonora-audio",
            "object_path": object_path,
        },
    }

    j1 = client.post("/api/v1/jobs", headers={"Authorization": f"Bearer {token}"}, json=payload)
    j2 = client.post("/api/v1/jobs", headers={"Authorization": f"Bearer {token}"}, json=payload)
    assert j1.status_code == 202
    assert j2.status_code == 202

    # 3rd concurrent job exceeds max_concurrent_jobs_per_user=2
    j3 = client.post("/api/v1/jobs", headers={"Authorization": f"Bearer {token}"}, json=payload)
    assert j3.status_code == 429
    assert j3.json()["error"]["code"] == "CONCURRENT_JOB_LIMIT_EXCEEDED"

    # Cancel both active jobs cleanly
    c1 = client.post(
        f"/api/v1/jobs/{j1.json()['job_id']}/cancel",
        headers={"Authorization": f"Bearer {token}"},
        json={"reason": "User aborted"},
    )
    c2 = client.post(
        f"/api/v1/jobs/{j2.json()['job_id']}/cancel",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert c1.status_code == 200
    assert c1.json()["cancelled"] is True
    assert c1.json()["status"] == "cancelled"
    assert c2.status_code == 200
    assert c2.json()["status"] == "cancelled"
