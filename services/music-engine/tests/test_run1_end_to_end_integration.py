from __future__ import annotations

import asyncio
import uuid
from pathlib import Path
from typing import Any

import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.jobs.queue import ArqRedisQueueBackend
from app.jobs.repository import InMemoryJobRepository
from app.main import create_app
from app.storage.local_storage import LocalFilesystemStorageAdapter
from app.worker import process_music_job, shutdown as worker_shutdown, startup as worker_startup
from tests.conftest import TEST_JWT_SECRET, USER_A_ID, USER_B_ID, make_jwt
from tests.test_musical_analysis import _synth_chord_progression_wav
from tests.test_vocal_pitch_extraction import _synth_vocal_phrase
from tests.test_worker_and_arq_queue import FakeArqPool


def _make_run1_settings(tmp_path: Path) -> Settings:
    return Settings(
        music_engine_env="test",
        music_engine_temp_dir=str(tmp_path / "temp"),
        music_engine_local_storage_dir=str(tmp_path / "storage"),
        music_engine_storage_backend="local",
        music_engine_job_repository_backend="memory",
        music_engine_queue_backend="arq",
        music_engine_redis_url="redis://:secret@valkey.test:6379/0",
        music_engine_arq_queue_name="sonora:run1-e2e",
        music_engine_job_max_retries=2,
        music_engine_job_retry_backoff_seconds=2,
        music_engine_job_timeout_seconds=60,
        supabase_jwt_secret=TEST_JWT_SECRET,
        supabase_audio_bucket="sonora-audio",
    )


def test_run1_complete_workflow_analysis_plus_vocal_pitch_over_arq_worker(tmp_path: Path) -> None:
    """
    End-to-end Run 1 integration test using isolated test doubles for ARQ pool, storage, and repo:
      FastAPI POST /api/v1/jobs -> ARQ enqueue -> dedicated ARQ worker ->
      ingestion -> FFmpeg decode -> LibrosaMusicalAnalyzer + LibrosaPyinPitchExtractor ->
      persisted job result -> authenticated GET /api/v1/jobs/{job_id} -> workspace cleanup ->
      cross-user access denied.
    """
    settings = _make_run1_settings(tmp_path)
    storage = LocalFilesystemStorageAdapter(settings.local_storage_path)
    repo = InMemoryJobRepository()
    fake_pool = FakeArqPool()
    queue = ArqRedisQueueBackend(settings=settings, pool=fake_pool)

    # Seed a C major rhythmic chord track for User A
    analysis_path = f"{USER_A_ID}/uploads/{uuid.uuid4()}/song_c_major.wav"
    analysis_dest = settings.local_storage_path / settings.supabase_audio_bucket / analysis_path
    _synth_chord_progression_wav(
        analysis_dest,
        [[48, 60, 64, 67], [53, 60, 65, 69], [55, 59, 62, 67], [48, 60, 64, 67]],
        bpm=120.0,
        beats_per_chord=4,
    )
    original_analysis_bytes = analysis_dest.read_bytes()

    # Seed a monophonic vocal melody C4 -> E4 -> G4 for User A
    vocal_path = f"{USER_A_ID}/uploads/{uuid.uuid4()}/solo_vocal.wav"
    vocal_dest = settings.local_storage_path / settings.supabase_audio_bucket / vocal_path
    _synth_vocal_phrase(
        vocal_dest,
        [(None, 0.15), (261.63, 0.55), (329.63, 0.55), (392.00, 0.60), (None, 0.15)],
        vibrato_cents=12.0,
    )
    original_vocal_bytes = vocal_dest.read_bytes()

    app = create_app(settings=settings, storage=storage, repository=repo, queue=queue)
    user_a_headers = {
        "Authorization": f"Bearer {make_jwt(USER_A_ID)}",
        "X-Request-ID": "corr-run1-e2e-analysis",
    }
    user_b_headers = {"Authorization": f"Bearer {make_jwt(USER_B_ID)}"}

    with TestClient(app) as client:
        # 1. Submit combined musical analysis + vocal pitch job
        submit_analysis = client.post(
            "/api/v1/jobs",
            headers=user_a_headers,
            json={
                "job_type": "audio_analysis",
                "parameters": {"include_vocal_pitch": True},
                "source_audio": {
                    "storage_backend": "local",
                    "bucket": "sonora-audio",
                    "object_path": analysis_path,
                    "original_filename": "song_c_major.wav",
                    "declared_mime_type": "audio/wav",
                },
            },
        )
        assert submit_analysis.status_code == 202
        analysis_job_id = submit_analysis.json()["job_id"]
        assert submit_analysis.json()["status"] == "queued"

        # 2. Submit dedicated monophonic vocal pitch extraction job
        submit_pitch = client.post(
            "/api/v1/jobs",
            headers={**user_a_headers, "X-Request-ID": "corr-run1-e2e-pitch"},
            json={
                "job_type": "pitch_extraction",
                "parameters": {"mode": "monophonic"},
                "source_audio": {
                    "storage_backend": "local",
                    "bucket": "sonora-audio",
                    "object_path": vocal_path,
                    "original_filename": "solo_vocal.wav",
                    "declared_mime_type": "audio/wav",
                },
            },
        )
        assert submit_pitch.status_code == 202
        pitch_job_id = submit_pitch.json()["job_id"]

        # Both jobs were dispatched to ARQ queue
        assert len(fake_pool.enqueued) == 2

        # 3. Boot dedicated ARQ worker using real runtime registry (LibrosaMusicalAnalyzer + LibrosaPyinPitchExtractor)
        worker_ctx: dict[str, Any] = {
            "settings": settings,
            "storage": storage,
            "repository": repo,
            "queue": queue,
            "worker_id": "run1-e2e-worker",
            "job_try": 1,
        }
        asyncio.run(worker_startup(worker_ctx))

        res_a = asyncio.run(process_music_job(worker_ctx, analysis_job_id, "corr-run1-e2e-analysis"))
        res_p = asyncio.run(process_music_job(worker_ctx, pitch_job_id, "corr-run1-e2e-pitch"))
        assert res_a["status"] == "completed"
        assert res_p["status"] == "completed"

        # 4. Authorized owner retrieves validated musical analysis + combined vocal_pitch result
        fetched_a = client.get(f"/api/v1/jobs/{analysis_job_id}", headers=user_a_headers)
        assert fetched_a.status_code == 200
        a_body = fetched_a.json()
        assert a_body["status"] == "completed"
        assert a_body["progress_percent"] == 100
        assert a_body["audio_metadata"]["detected_format"] == "wav"
        assert a_body["result"]["estimated_key"] == "C major"
        assert a_body["result"]["tempo_bpm"] is not None
        assert len(a_body["result"]["beats"]) >= 6
        assert "vocal_pitch" in a_body["result"]
        assert a_body["result"]["vocal_pitch"]["mode"] == "monophonic"

        # 5. Authorized owner retrieves monophonic vocal pitch extraction result
        fetched_p = client.get(f"/api/v1/jobs/{pitch_job_id}", headers=user_a_headers)
        assert fetched_p.status_code == 200
        p_body = fetched_p.json()
        assert p_body["status"] == "completed"
        assert p_body["result"]["mode"] == "monophonic"
        assert [ev["midi_pitch"] for ev in p_body["result"]["note_events"]] == [60, 64, 67]
        assert len(p_body["result"]["contours"]) > len(p_body["result"]["note_events"])
        assert "monophonic" in p_body["result"]["monophonic_only_notice"].lower()

        # 6. Cross-user access control remains strictly enforced
        forbidden = client.get(f"/api/v1/jobs/{pitch_job_id}", headers=user_b_headers)
        assert forbidden.status_code == 403
        assert forbidden.json()["error"]["code"] == "JOB_ACCESS_DENIED"

        # 7. Polyphonic pitch request fails honestly with MODEL_NOT_INTEGRATED
        poly_submit = client.post(
            "/api/v1/jobs",
            headers=user_a_headers,
            json={
                "job_type": "pitch_extraction",
                "parameters": {"mode": "polyphonic"},
                "source_audio": {
                    "storage_backend": "local",
                    "bucket": "sonora-audio",
                    "object_path": vocal_path,
                },
            },
        )
        assert poly_submit.status_code == 202
        poly_id = poly_submit.json()["job_id"]
        poly_run = asyncio.run(process_music_job(worker_ctx, poly_id, "corr-poly"))
        assert poly_run["status"] == "failed"
        poly_body = client.get(f"/api/v1/jobs/{poly_id}", headers=user_a_headers).json()
        assert poly_body["status"] == "failed"
        assert poly_body["error"]["code"] == "MODEL_NOT_INTEGRATED"

        # 8. Original recordings untouched and all temp job workspaces cleaned up
        assert analysis_dest.read_bytes() == original_analysis_bytes
        assert vocal_dest.read_bytes() == original_vocal_bytes
        assert not (settings.temp_path / analysis_job_id).exists()
        assert not (settings.temp_path / pitch_job_id).exists()
        assert not (settings.temp_path / poly_id).exists()

        asyncio.run(worker_shutdown(worker_ctx))
