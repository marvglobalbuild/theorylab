from __future__ import annotations

import asyncio
import uuid
from pathlib import Path
from typing import Any

import mido
import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.core.runtime import build_registry
from app.jobs.queue import ArqRedisQueueBackend
from app.jobs.repository import InMemoryJobRepository
from app.main import create_app
from app.storage.local_storage import LocalFilesystemStorageAdapter
from app.worker import process_music_job, startup as worker_startup
from tests.conftest import TEST_JWT_SECRET, USER_A_ID, USER_B_ID, make_jwt
from tests.test_worker_and_arq_queue import FakeArqPool


def _generate_vocal_melody_wav(path: Path, sample_rate: int = 44100) -> Path:
    """
    Generate a realistic monophonic vocal-range harmonic phrase in C major at 120 BPM
    (C5 -> E5 -> G5 -> E5 -> F5 -> D5 -> C5 with brief breath pauses) so Run 1 analysis,
    Run 1 pYIN pitch extraction, Run 2 arrangement, MIDI, and FluidSynth synthesis all
    execute on real audio data.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    # (midi_note or None for breath rest, duration_sec)
    phrase: list[tuple[int | None, float]] = [
        (72, 0.90),  # C5
        (None, 0.10),
        (76, 0.90),  # E5
        (None, 0.10),
        (79, 0.90),  # G5
        (None, 0.10),
        (76, 0.90),  # E5
        (None, 0.10),
        (77, 0.90),  # F5
        (None, 0.10),
        (74, 0.90),  # D5
        (None, 0.10),
        (72, 1.80),  # C5 final hold
        (None, 0.20),
    ]
    segments: list[np.ndarray] = []
    for midi_note, dur_s in phrase:
        n = int(round(sample_rate * dur_s))
        if midi_note is None:
            segments.append(np.zeros(n, dtype=np.float32))
            continue
        t = np.arange(n, dtype=np.float64) / sample_rate
        f0 = 440.0 * (2.0 ** ((midi_note - 69) / 12.0))
        # Subtle vocal vibrato + warm harmonic overtones
        vibrato = 1.0 + 0.003 * np.sin(2.0 * np.pi * 5.2 * t)
        phase = 2.0 * np.pi * np.cumsum(f0 * vibrato) / sample_rate
        sig = (
            0.55 * np.sin(phase)
            + 0.25 * np.sin(2.0 * phase)
            + 0.12 * np.sin(3.0 * phase)
            + 0.05 * np.sin(4.0 * phase)
        )
        # Smooth attack/release envelope
        env = np.ones(n, dtype=np.float64)
        fade = min(int(0.03 * sample_rate), n // 4)
        env[:fade] = np.linspace(0.0, 1.0, fade)
        env[-fade:] = np.linspace(1.0, 0.0, fade)
        segments.append((sig * env * 0.45).astype(np.float32))

    audio = np.concatenate(segments)
    sf.write(str(path), audio, sample_rate, subtype="PCM_16")
    return path


def test_run2_end_to_end_accompaniment_pipeline_with_real_fluidsynth_and_stems(
    tmp_path: Path,
) -> None:
    settings = Settings(
        music_engine_env="test",
        music_engine_temp_dir=str(tmp_path / "temp"),
        music_engine_local_storage_dir=str(tmp_path / "storage"),
        music_engine_storage_backend="local",
        music_engine_job_repository_backend="memory",
        music_engine_queue_backend="arq",
        music_engine_redis_url="redis://valkey.test:6379/0",
        music_engine_arq_queue_name="sonora:run2-e2e",
        music_engine_job_timeout_seconds=120,
        music_engine_max_file_size_bytes=10 * 1024 * 1024,
        music_engine_max_duration_seconds=120,
        music_engine_max_concurrent_jobs_per_user=3,
        supabase_jwt_secret=TEST_JWT_SECRET,
        supabase_audio_bucket="sonora-audio",
    )

    # Seed private vocal recording in User A's namespace
    vocal_object_path = f"{USER_A_ID}/uploads/{uuid.uuid4()}/lead_vocal_c_major.wav"
    vocal_disk_path = settings.local_storage_path / settings.supabase_audio_bucket / vocal_object_path
    _generate_vocal_melody_wav(vocal_disk_path)
    original_vocal_bytes = vocal_disk_path.read_bytes()

    storage = LocalFilesystemStorageAdapter(settings.local_storage_path)
    repo = InMemoryJobRepository()
    registry = build_registry(settings, storage)
    fake_pool = FakeArqPool()
    queue = ArqRedisQueueBackend(settings=settings, pool=fake_pool)

    app = create_app(
        settings=settings,
        storage=storage,
        repository=repo,
        registry=registry,
        queue=queue,
    )

    headers_a = {
        "Authorization": f"Bearer {make_jwt(USER_A_ID)}",
        "X-Request-ID": "corr-run2-e2e-001",
    }
    headers_b = {"Authorization": f"Bearer {make_jwt(USER_B_ID)}"}

    with TestClient(app) as client:
        # 1. Submit accompaniment_generation job via FastAPI
        submit = client.post(
            "/api/v1/jobs",
            headers=headers_a,
            json={
                "job_type": "accompaniment_generation",
                "studio_context": "ai_accompaniment_studio",
                "source_audio": {
                    "storage_backend": "local",
                    "bucket": "sonora-audio",
                    "object_path": vocal_object_path,
                    "original_filename": "lead_vocal_c_major.wav",
                    "declared_mime_type": "audio/wav",
                },
                "parameters": {
                    "style": "ballad",
                    "selected_instruments": ["piano", "strings", "bass", "drums"],
                    "energy": 0.6,
                    "density": 0.55,
                    "tempo_override_bpm": 120.0,
                    "render_individual_stems": True,
                },
            },
        )
        assert submit.status_code == 202
        created = submit.json()
        job_id = created["job_id"]
        assert created["status"] == "queued"
        assert len(fake_pool.enqueued) == 1

        # 2. Execute job in the dedicated ARQ worker
        worker_ctx: dict[str, Any] = {
            "settings": settings,
            "storage": storage,
            "repository": repo,
            "registry": registry,
            "queue": queue,
            "worker_id": "run2-e2e-worker",
            "job_try": 1,
        }
        asyncio.run(worker_startup(worker_ctx))
        worker_outcome = asyncio.run(process_music_job(worker_ctx, job_id, "corr-run2-e2e-001"))
        assert worker_outcome == {"job_id": job_id, "status": "completed", "attempt": 1}

        # 3. Verify User A retrieves completed accompaniment job, metadata, and private artifacts
        fetched = client.get(f"/api/v1/jobs/{job_id}", headers=headers_a)
        assert fetched.status_code == 200
        body = fetched.json()
        assert body["status"] == "completed"
        assert body["progress_percent"] == 100
        assert body["error"] is None

        result = body["result"]
        assert result["original_vocal_preserved"] is True
        assert result["mixing_status"] == "accompaniment_only_pending_run3_vocal_mix"
        assert result["arrangement"]["style"] == "ballad"
        assert result["arrangement"]["tempo_bpm"] == 120.0
        assert len(result["arrangement"]["chords"]) >= 4
        assert result["midi"]["track_count"] == 5  # conductor + piano + strings + bass + drums
        assert result["midi"]["note_count"] > 20
        assert result["synthesis"]["engine"] == "fluidsynth"
        assert result["synthesis"]["sample_rate_hz"] == 44100
        assert result["synthesis"]["channels"] == 2
        assert result["synthesis"]["peak_amplitude"] > 0.01
        assert len(result["synthesis"]["individual_stems"]) == 4

        # 4. Verify persisted artifacts exist strictly in User A's private storage namespace
        artifacts_by_type = {a["artifact_type"]: a for a in body["artifacts"]}
        assert "accompaniment_midi" in artifacts_by_type
        assert "accompaniment_audio" in artifacts_by_type
        for inst_id in ("piano", "strings", "bass", "drums"):
            assert f"instrument_track_{inst_id}" in artifacts_by_type

        for art in body["artifacts"]:
            assert art["object_path"].startswith(f"{USER_A_ID}/jobs/{job_id}/")
            disk_file = settings.local_storage_path / settings.supabase_audio_bucket / art["object_path"]
            assert disk_file.is_file()
            assert disk_file.stat().st_size == art["size_bytes"]

        # Reopen persisted MIDI from private storage and verify valid SMF Format 1
        stored_midi_path = (
            settings.local_storage_path
            / settings.supabase_audio_bucket
            / artifacts_by_type["accompaniment_midi"]["object_path"]
        )
        reopened_mid = mido.MidiFile(str(stored_midi_path))
        assert reopened_mid.type == 1
        assert len(reopened_mid.tracks) == 5

        # Read persisted stereo accompaniment WAV and confirm audible non-silent stereo PCM
        stored_wav_path = (
            settings.local_storage_path
            / settings.supabase_audio_bucket
            / artifacts_by_type["accompaniment_audio"]["object_path"]
        )
        wav_samples, wav_sr = sf.read(str(stored_wav_path), dtype="float32", always_2d=True)
        assert wav_sr == 44100
        assert wav_samples.shape[1] == 2
        assert float(np.max(np.abs(wav_samples))) > 0.01

        # 5. Cross-user isolation: User B cannot view User A's accompaniment job
        forbidden = client.get(f"/api/v1/jobs/{job_id}", headers=headers_b)
        assert forbidden.status_code == 403

        # 6. Original vocal recording untouched & temporary workspace cleaned up
        assert vocal_disk_path.read_bytes() == original_vocal_bytes
        assert not (settings.temp_path / job_id).exists()
