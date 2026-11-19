from __future__ import annotations

import asyncio
import json
import subprocess
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
from app.processing.mastering import TRUE_PEAK_METHOD_LABEL
from app.storage.local_storage import LocalFilesystemStorageAdapter
from app.worker import process_music_job, startup as worker_startup
from tests.conftest import TEST_JWT_SECRET, USER_A_ID, USER_B_ID, make_jwt
from tests.test_run2_end_to_end_integration import _generate_vocal_melody_wav
from tests.test_worker_and_arq_queue import FakeArqPool


def test_run3_full_end_to_end_vocal_accompaniment_mixing_mastering_and_multi_format_export(
    tmp_path: Path,
) -> None:
    """
    Full Run 1 + Run 2 + Run 3 end-to-end production test using REAL audio fixtures,
    REAL FFmpeg decoding, REAL librosa analysis + pYIN vocal pitch extraction,
    REAL accompaniment arrangement + mido MIDI, REAL FluidSynth + MuseScore General SF3
    synthesis (full accompaniment + individual stems), REAL non-destructive mixing,
    REAL pyloudnorm ITU-R BS.1770-4 loudness normalization + 4x oversampled true-peak
    protection, and REAL FFmpeg/FFprobe-verified WAV (24-bit), FLAC, and MP3 (320 kbps) export.
    """
    settings = Settings(
        music_engine_env="test",
        music_engine_temp_dir=str(tmp_path / "temp"),
        music_engine_local_storage_dir=str(tmp_path / "storage"),
        music_engine_storage_backend="local",
        music_engine_job_repository_backend="memory",
        music_engine_queue_backend="arq",
        music_engine_redis_url="redis://valkey.test:6379/0",
        music_engine_arq_queue_name="sonora:run3-e2e",
        music_engine_job_timeout_seconds=180,
        music_engine_max_file_size_bytes=15 * 1024 * 1024,
        music_engine_max_duration_seconds=120,
        music_engine_max_concurrent_jobs_per_user=3,
        supabase_jwt_secret=TEST_JWT_SECRET,
        supabase_audio_bucket="sonora-audio",
    )

    vocal_object_path = f"{USER_A_ID}/uploads/{uuid.uuid4()}/lead_vocal_production.wav"
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
        "X-Request-ID": "corr-run3-e2e-001",
    }
    headers_b = {"Authorization": f"Bearer {make_jwt(USER_B_ID)}"}

    with TestClient(app) as client:
        # 1. Submit JobType.AUDIO_RENDERING (full Run 1 + Run 2 + Run 3 pipeline)
        submit = client.post(
            "/api/v1/jobs",
            headers=headers_a,
            json={
                "job_type": "audio_rendering",
                "studio_context": "ai_accompaniment_studio",
                "idempotency_key": "run3-e2e-prod-001",
                "source_audio": {
                    "storage_backend": "local",
                    "bucket": "sonora-audio",
                    "object_path": vocal_object_path,
                    "original_filename": "lead_vocal_production.wav",
                    "declared_mime_type": "audio/wav",
                },
                "parameters": {
                    "style": "ballad",
                    "selected_instruments": ["piano", "strings", "bass", "drums"],
                    "tempo_override_bpm": 120.0,
                    "intro_bars": 1,
                    "render_individual_stems": True,
                    "mix": {
                        "output_formats": ["wav", "flac", "mp3"],
                        "wav_bit_depth": 24,
                        "mp3_bitrate_kbps": 320,
                        "target_lufs": -14.0,
                        "true_peak_ceiling_dbtp": -1.0,
                        "vocal_gain_db": 0.5,
                        "accompaniment_gain_db": -5.0,
                        "vocal_balance_mode": "auto_adaptive",
                        "include_original_vocal_copy": True,
                        "metadata": {
                            "title": "SONORA E2E Vocal Master",
                            "artist": "Test Artist",
                        },
                    },
                },
            },
        )
        assert submit.status_code == 202
        job_id = submit.json()["job_id"]
        assert len(fake_pool.enqueued) == 1

        # 2. Execute full pipeline in the dedicated ARQ worker
        worker_ctx: dict[str, Any] = {
            "settings": settings,
            "storage": storage,
            "repository": repo,
            "registry": registry,
            "queue": queue,
            "worker_id": "run3-e2e-worker",
            "job_try": 1,
        }
        asyncio.run(worker_startup(worker_ctx))
        outcome = asyncio.run(process_music_job(worker_ctx, job_id, "corr-run3-e2e-001"))
        assert outcome == {"job_id": job_id, "status": "completed", "attempt": 1}

        # 3. Fetch completed job and verify all Run 1 + Run 2 + Run 3 outputs
        fetched = client.get(f"/api/v1/jobs/{job_id}", headers=headers_a)
        assert fetched.status_code == 200
        body = fetched.json()
        assert body["status"] == "completed"
        assert body["progress_percent"] == 100
        assert body["error"] is None

        res = body["result"]
        assert res["original_vocal_preserved"] is True
        assert res["mixing_status"] == "mastered_vocal_and_accompaniment"

        # Mixing verification
        mix = res["mixing"]
        assert mix["sample_rate_hz"] == 44100
        assert mix["channels"] == 2
        assert mix["intro_offset_ms"] == 2000  # 1 bar @ 120 BPM in 4/4 == 2000ms
        assert mix["original_vocal_preserved"] is True
        assert mix["vocal_timing_and_pitch_unmodified"] is True
        assert mix["original_vocal_copy_object_path"] == f"{USER_A_ID}/jobs/{job_id}/original_vocal_copy.wav"

        # Mastering verification (real pyloudnorm + 4x oversampled true peak)
        mastering = res["mastering"]
        assert mastering["true_peak_method"] == TRUE_PEAK_METHOD_LABEL
        assert mastering["loudness_method"] == "pyloudnorm_itu_bs1770_4"
        assert mastering["clipping_detected"] is False
        assert mastering["true_peak_compliant"] is True
        assert mastering["output_metrics"]["true_peak_dbtp"] <= -0.92
        assert mastering["output_metrics"]["integrated_lufs"] is not None
        assert mastering["output_metrics"]["is_silent"] is False

        # Exports verification (WAV 24-bit, FLAC, MP3 320 kbps)
        exports_by_fmt = {e["format"]: e for e in res["exports"]}
        assert set(exports_by_fmt.keys()) == {"wav", "flac", "mp3"}
        assert exports_by_fmt["wav"]["bit_depth"] == 24
        assert exports_by_fmt["wav"]["codec_name"] == "pcm_s24le"
        assert exports_by_fmt["flac"]["codec_name"] == "flac"
        assert exports_by_fmt["mp3"]["codec_name"] == "mp3"
        assert 300 <= exports_by_fmt["mp3"]["bitrate_kbps"] <= 340
        for exp in exports_by_fmt.values():
            assert exp["ffprobe_verified"] is True
            assert exp["sample_rate_hz"] == 44100
            assert exp["channels"] == 2

        # 4. Private storage artifact verification (strict `{user_id}/jobs/{job_id}/...` ownership)
        artifacts_by_type = {a["artifact_type"]: a for a in body["artifacts"]}
        expected_artifact_types = {
            "accompaniment_midi",
            "accompaniment_audio",
            "instrument_track_piano",
            "instrument_track_strings",
            "instrument_track_bass",
            "instrument_track_drums",
            "master_audio_wav",
            "master_audio_flac",
            "master_audio_mp3",
            "original_vocal_copy",
        }
        assert expected_artifact_types.issubset(set(artifacts_by_type.keys()))

        bucket_dir = settings.local_storage_path / settings.supabase_audio_bucket
        for art in body["artifacts"]:
            assert art["object_path"].startswith(f"{USER_A_ID}/jobs/{job_id}/")
            disk_file = bucket_dir / art["object_path"]
            assert disk_file.is_file()
            assert disk_file.stat().st_size == art["size_bytes"]

        # Verify persisted MIDI is valid SMF Format 1
        mid = mido.MidiFile(str(bucket_dir / artifacts_by_type["accompaniment_midi"]["object_path"]))
        assert mid.type == 1

        # Verify persisted master WAV is non-silent, stereo, 44.1 kHz, and contains both
        # intro accompaniment (before 2.0s) AND vocal+accompaniment energy (after 2.0s)
        master_wav_path = bucket_dir / artifacts_by_type["master_audio_wav"]["object_path"]
        master_pcm, sr = sf.read(str(master_wav_path), dtype="float64", always_2d=True)
        assert sr == 44100
        assert master_pcm.shape[1] == 2
        assert float(np.max(np.abs(master_pcm))) > 0.05
        intro_rms = float(np.sqrt(np.mean(master_pcm[int(0.2 * sr) : int(1.8 * sr)] ** 2)))
        vocal_body_rms = float(np.sqrt(np.mean(master_pcm[int(2.2 * sr) : int(8.0 * sr)] ** 2)))
        assert intro_rms > 0.005  # accompaniment present in intro
        assert vocal_body_rms > 0.01  # vocal + accompaniment present in body

        # Verify persisted MP3 directly with FFprobe
        master_mp3_path = bucket_dir / artifacts_by_type["master_audio_mp3"]["object_path"]
        mp3_probe = json.loads(
            subprocess.check_output(
                [
                    settings.ffprobe_bin,
                    "-v",
                    "error",
                    "-print_format",
                    "json",
                    "-show_streams",
                    str(master_mp3_path),
                ]
            ).decode("utf-8")
        )
        assert mp3_probe["streams"][0]["codec_name"] == "mp3"
        assert mp3_probe["streams"][0]["channels"] == 2
        assert int(mp3_probe["streams"][0]["sample_rate"]) == 44100

        # 5. Cross-user access control: User B strictly denied (403)
        assert client.get(f"/api/v1/jobs/{job_id}", headers=headers_b).status_code == 403

        # 6. Original uploaded vocal recording is bit-for-bit untouched & temp workspace cleaned up
        assert vocal_disk_path.read_bytes() == original_vocal_bytes
        assert not (settings.temp_path / job_id).exists()
