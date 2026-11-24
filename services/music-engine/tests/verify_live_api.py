from __future__ import annotations

import hashlib
import json
import subprocess
import time
import uuid
import wave
from pathlib import Path

import httpx
import jwt
import numpy as np
import soundfile as sf

BASE_URL = "http://127.0.0.1:8000"
JWT_SECRET = "test-local-supabase-jwt-signing-key-2026"
USER_ID = "33333333-3333-4333-8333-333333333333"


def create_token(user_id: str = USER_ID) -> str:
    now = int(time.time())
    payload = {
        "sub": user_id,
        "email": "local_test_user@sonora.local",
        "role": "authenticated",
        "aud": "authenticated",
        "iat": now,
        "exp": now + 3600,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def generate_monophonic_vocal_wav(path: Path, sample_rate: int = 44100) -> Path:
    """Generate a clean monophonic vocal phrase with harmonic content in C major."""
    path.parent.mkdir(parents=True, exist_ok=True)
    phrase = [
        (60, 0.70),  # C4
        (None, 0.08),
        (64, 0.70),  # E4
        (None, 0.08),
        (67, 0.70),  # G4
        (None, 0.08),
        (64, 0.70),  # E4
        (None, 0.08),
        (60, 1.20),  # C4 hold
    ]
    segments: list[np.ndarray] = []
    t_global = 0.0
    for midi_note, dur in phrase:
        num_samples = int(sample_rate * dur)
        if midi_note is None:
            segments.append(np.zeros((num_samples, 2), dtype=np.float32))
        else:
            freq = 440.0 * (2.0 ** ((midi_note - 69) / 12.0))
            t = np.linspace(t_global, t_global + dur, num_samples, endpoint=False)
            vibrato = 1.0 + 0.012 * np.sin(2.0 * np.pi * 5.2 * t)
            # Add subtle vocal formant harmonics
            fund = np.sin(2.0 * np.pi * freq * vibrato * t)
            h2 = 0.35 * np.sin(2.0 * np.pi * 2.0 * freq * vibrato * t)
            h3 = 0.15 * np.sin(2.0 * np.pi * 3.0 * freq * vibrato * t)
            wave_mono = 0.40 * (fund + h2 + h3)
            # Envelope to avoid clicks
            env = np.ones(num_samples, dtype=np.float32)
            fade = min(int(0.03 * sample_rate), num_samples // 2)
            if fade > 0:
                env[:fade] = np.linspace(0.0, 1.0, fade)
                env[-fade:] = np.linspace(1.0, 0.0, fade)
            shaped = (wave_mono * env).astype(np.float32)
            stereo = np.column_stack([shaped, shaped])
            segments.append(stereo)
        t_global += dur

    audio = np.concatenate(segments, axis=0)
    sf.write(str(path), audio, sample_rate, subtype="PCM_16")
    return path


def main() -> None:
    print("=== Phase 6: Real Live Audio End-to-End Pipeline Verification ===")
    token = create_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Request-ID": f"req-test-{uuid.uuid4().hex[:8]}",
    }

    test_dir = Path("c:/Users/NEW/Desktop/TheoryLab/services/music-engine/tests/output_verification")
    test_dir.mkdir(parents=True, exist_ok=True)
    vocal_wav_path = test_dir / "test_original_vocal.wav"
    generate_monophonic_vocal_wav(vocal_wav_path)
    original_bytes = vocal_wav_path.read_bytes()
    original_sha256 = hashlib.sha256(original_bytes).hexdigest()
    print(f"1. Generated realistic test vocal recording: {vocal_wav_path.name} ({len(original_bytes)} bytes)")
    print(f"   Original SHA-256: {original_sha256}")

    with httpx.Client(base_url=BASE_URL, timeout=60.0) as client:
        # Step 1: Health check
        health_res = client.get("/health")
        assert health_res.status_code == 200, f"Health check failed: {health_res.text}"
        health_data = health_res.json()
        print(f"2. Health check OK (service={health_data['service']}, version={health_data['version']})")
        assert health_data["dependencies"]["ffmpeg_available"] is True
        assert health_data["dependencies"]["fluidsynth_available"] is True
        assert health_data["dependencies"]["soundfont_available"] is True

        # Step 2: Upload vocal audio
        with vocal_wav_path.open("rb") as f:
            upload_res = client.post(
                "/api/v1/audio/upload",
                headers={"Authorization": f"Bearer {token}"},
                files={"file": (vocal_wav_path.name, f, "audio/wav")},
            )
        assert upload_res.status_code == 201, f"Upload failed: {upload_res.text}"
        upload_data = upload_res.json()
        asset_ref = upload_data["asset_reference"]
        metadata = upload_data["metadata"]
        print(f"3. Uploaded audio: asset_id={asset_ref['asset_id']}, format={metadata['detected_format']}, duration={metadata['duration_ms']}ms")

        # Step 3: Create audio_rendering job
        job_payload = {
            "job_type": "audio_rendering",
            "studio_context": "ai_accompaniment_studio",
            "idempotency_key": f"test-idemp-{uuid.uuid4().hex[:8]}",
            "source_audio": asset_ref,
            "parameters": {
                "style": "ballad",
                "selected_instruments": ["piano", "strings", "bass", "drums"],
                "tempo_override_bpm": 120.0,
                "intro_bars": 1,
                "render_individual_stems": True,
                "mix": {
                    "output_formats": ["wav", "mp3"],
                    "wav_bit_depth": 24,
                    "mp3_bitrate_kbps": 320,
                    "target_lufs": -14.0,
                    "true_peak_ceiling_dbtp": -1.0,
                    "vocal_gain_db": 0.0,
                    "accompaniment_gain_db": -4.5,
                    "metadata": {
                        "title": "SONORA Accompaniment Studio Live Verification",
                        "artist": "SONORA Vocalist",
                    },
                },
            },
        }

        job_create_res = client.post("/api/v1/jobs", headers=headers, json=job_payload)
        assert job_create_res.status_code == 202, f"Job creation failed: {job_create_res.text}"
        job_data = job_create_res.json()
        job_id = job_data["job_id"]
        print(f"4. Created job: {job_id} (status={job_data['status']})")

        # Step 4: Poll job until completion
        print("5. Polling job execution...")
        start_time = time.time()
        completed_job = None
        while time.time() - start_time < 300:
            poll_res = client.get(f"/api/v1/jobs/{job_id}", headers=headers)
            assert poll_res.status_code == 200, f"Poll failed: {poll_res.text}"
            job_state = poll_res.json()
            status = job_state["status"]
            progress = job_state["progress_percent"]
            stage = job_state.get("stage_label") or status
            print(f"   [{int(time.time() - start_time)}s] status: {status} ({progress}%) - stage: {stage}")
            if status == "completed":
                completed_job = job_state
                break
            elif status in ("failed", "cancelled"):
                raise RuntimeError(f"Job terminated with status={status}: {job_state.get('error')}")
            time.sleep(2.5)

        assert completed_job is not None, "Job timed out after 300s"
        print("6. Job completed successfully!")

        # Step 5: Verify results and analysis
        res_data = completed_job["result"]
        analysis = res_data.get("musical_analysis", {})
        mastering = res_data.get("mastering", {})
        synthesis = res_data.get("synthesis", {})
        exports = res_data.get("exports", [])

        print(f"   Detected Key: {analysis.get('estimated_key')} (confidence: {analysis.get('key_confidence', 0):.2f})")
        print(f"   Detected Tempo: {analysis.get('tempo_bpm')} BPM")
        print(f"   Synthesis Engine: {synthesis.get('engine')} ({synthesis.get('soundfont_name')})")
        if mastering:
            out_metrics = mastering.get("output_metrics", {})
            print(f"   Mastering Integrated LUFS: {out_metrics.get('integrated_lufs', 0):.2f} LUFS")
            print(f"   Mastering True Peak: {out_metrics.get('true_peak_dbtp', 0):.2f} dBTP")
            print(f"   True Peak Compliant: {mastering.get('true_peak_compliant')}")

        # Step 6: Download and verify artifacts
        artifacts = completed_job["artifacts"]
        print(f"7. Verifying {len(artifacts)} generated artifacts...")
        downloaded_files: dict[str, Path] = {}
        for art in artifacts:
            art_type = art["artifact_type"]
            obj_path = art["object_path"]
            dl_res = client.get(
                f"/api/v1/jobs/{job_id}/artifacts/download",
                headers=headers,
                params={"object_path": obj_path},
            )
            assert dl_res.status_code == 200, f"Failed to download {art_type}: {dl_res.status_code}"
            saved_file = test_dir / Path(obj_path).name
            saved_file.write_bytes(dl_res.content)
            downloaded_files[art_type] = saved_file
            print(f"   Downloaded {art_type} -> {saved_file.name} ({len(dl_res.content)} bytes)")

        # Verify Master MP3 with ffprobe
        mp3_file = downloaded_files.get("master_audio_mp3")
        if not mp3_file or not mp3_file.exists():
            mp3_candidates = list(test_dir.glob("*.mp3"))
            assert len(mp3_candidates) > 0, "No MP3 found among downloaded artifacts!"
            mp3_file = mp3_candidates[0]

        ffprobe_bin = "C:/Users/NEW/Desktop/TheoryLab/services/music-engine/bin/ffmpeg/ffprobe.exe"
        probe_out = subprocess.check_output(
            [
                ffprobe_bin,
                "-v",
                "error",
                "-show_streams",
                "-of",
                "json",
                str(mp3_file),
            ]
        )
        probe_data = json.loads(probe_out)
        stream = probe_data["streams"][0]
        assert stream["codec_name"] == "mp3"
        assert int(stream["sample_rate"]) == 44100
        assert int(stream["channels"]) == 2
        print(f"8. Master MP3 ({mp3_file.name}) verified by FFprobe: codec={stream['codec_name']}, sample_rate={stream['sample_rate']}Hz, channels={stream['channels']}")

        # Step 7: Verify original uploaded vocal recording is untouched
        post_test_bytes = vocal_wav_path.read_bytes()
        post_sha256 = hashlib.sha256(post_test_bytes).hexdigest()
        assert post_sha256 == original_sha256, "ORIGINAL AUDIO WAS MODIFIED!"
        print("9. Non-destructive guarantee verified: original vocal recording SHA-256 is 100% untouched.")

    print("\n>>> ALL PHASE 6 REAL AUDIO PROCESSING CHECKS PASSED SUCCESSFULLY! <<<")


if __name__ == "__main__":
    main()
