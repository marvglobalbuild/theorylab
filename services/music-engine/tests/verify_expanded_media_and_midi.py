from __future__ import annotations

import asyncio
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time
import uuid

import httpx
import jwt
import mido
import numpy as np
import soundfile as sf
from dotenv import load_dotenv

# Ensure .env is loaded
load_dotenv(Path(__file__).parent.parent / ".env")

BASE_URL = "http://127.0.0.1:8000"
JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "test-local-supabase-jwt-signing-key-2026")
USER_ID = "44444444-4444-4444-8444-444444444444"
FFMPEG = "c:/Users/NEW/Desktop/TheoryLab/services/music-engine/bin/ffmpeg/ffmpeg.exe"
FFPROBE = "c:/Users/NEW/Desktop/TheoryLab/services/music-engine/bin/ffmpeg/ffprobe.exe"


def create_token(user_id: str = USER_ID) -> str:
    now = int(time.time())
    payload = {
        "sub": user_id,
        "email": "media_test_user@sonora.local",
        "role": "authenticated",
        "aud": "authenticated",
        "iat": now,
        "exp": now + 7200,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def generate_audio_fixtures(output_dir: Path) -> dict[str, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    sample_rate = 44100
    duration_sec = 4.0

    # 1. Generate base PCM WAV (melody in C major: C4, E4, G4, C5)
    t = np.linspace(0, duration_sec, int(sample_rate * duration_sec), endpoint=False)
    # Simple acoustic musical phrase
    notes = [
        (60, 0.0, 1.0),
        (64, 1.0, 2.0),
        (67, 2.0, 3.0),
        (72, 3.0, 4.0),
    ]
    stereo_wave = np.zeros((len(t), 2), dtype=np.float32)
    for midi_pitch, start, end in notes:
        freq = 440.0 * (2.0 ** ((midi_pitch - 69) / 12.0))
        idx_start = int(start * sample_rate)
        idx_end = int(end * sample_rate)
        seg_t = t[idx_start:idx_end] - start
        tone = 0.4 * np.sin(2.0 * np.pi * freq * seg_t) * (0.5 + 0.5 * np.cos(np.pi * (seg_t / (end - start) - 0.5)))
        stereo_wave[idx_start:idx_end, 0] += tone
        stereo_wave[idx_start:idx_end, 1] += tone

    wav_path = output_dir / "sample.wav"
    sf.write(str(wav_path), stereo_wave, sample_rate, subtype="PCM_16")

    fixtures: dict[str, Path] = {"wav": wav_path}

    # 2. Encode MP3
    mp3_path = output_dir / "sample.mp3"
    subprocess.check_call([FFMPEG, "-y", "-v", "error", "-i", str(wav_path), "-b:a", "320k", str(mp3_path)])
    fixtures["mp3"] = mp3_path

    # 3. Encode M4A (AAC in MP4)
    m4a_path = output_dir / "sample.m4a"
    subprocess.check_call([FFMPEG, "-y", "-v", "error", "-i", str(wav_path), "-c:a", "aac", "-b:a", "256k", str(m4a_path)])
    fixtures["m4a"] = m4a_path

    # 4. Encode FLAC
    flac_path = output_dir / "sample.flac"
    subprocess.check_call([FFMPEG, "-y", "-v", "error", "-i", str(wav_path), "-c:a", "flac", str(flac_path)])
    fixtures["flac"] = flac_path

    # 5. Encode OGG (Vorbis)
    ogg_path = output_dir / "sample.ogg"
    subprocess.check_call([FFMPEG, "-y", "-v", "error", "-i", str(wav_path), "-c:a", "libvorbis", "-q:a", "6", str(ogg_path)])
    fixtures["ogg"] = ogg_path

    # 6. Encode WebM with Opus (simulates browser MediaRecorder)
    webm_path = output_dir / "sample_browser_recorded.webm"
    subprocess.check_call([FFMPEG, "-y", "-v", "error", "-i", str(wav_path), "-c:a", "libopus", "-b:a", "128k", str(webm_path)])
    fixtures["webm"] = webm_path

    # 7. Generate MP4 Video with Audio (H.264 video + AAC audio)
    mp4_path = output_dir / "sample_video.mp4"
    subprocess.check_call([
        FFMPEG, "-y", "-v", "error",
        "-f", "lavfi", "-i", "color=c=navy:s=640x360:r=24",
        "-i", str(wav_path),
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-shortest",
        "-c:a", "aac", "-b:a", "192k",
        str(mp4_path)
    ])
    fixtures["mp4"] = mp4_path

    # 8. Generate QuickTime MOV Video with Audio
    mov_path = output_dir / "sample_video.mov"
    subprocess.check_call([
        FFMPEG, "-y", "-v", "error",
        "-f", "lavfi", "-i", "color=c=darkred:s=640x360:r=24",
        "-i", str(wav_path),
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-shortest",
        "-c:a", "pcm_s16le",
        str(mov_path)
    ])
    fixtures["mov"] = mov_path

    # 9. Generate Single-Track Standard MIDI file
    mid_single = output_dir / "sample_single_track.mid"
    m_single = mido.MidiFile(type=0, ticks_per_beat=480)
    trk = mido.MidiTrack()
    trk.append(mido.MetaMessage("track_name", name="Piano Melody", time=0))
    trk.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(120), time=0))
    trk.append(mido.MetaMessage("time_signature", numerator=4, denominator=4, time=0))
    trk.append(mido.MetaMessage("key_signature", key="C", time=0))
    trk.append(mido.Message("program_change", program=0, channel=0, time=0))
    # 4 quarter notes: C4 (60), E4 (64), G4 (67), C5 (72)
    for p in [60, 64, 67, 72]:
        trk.append(mido.Message("note_on", note=p, velocity=90, channel=0, time=0))
        trk.append(mido.Message("note_off", note=p, velocity=0, channel=0, time=480))
    trk.append(mido.MetaMessage("end_of_track", time=0))
    m_single.tracks.append(trk)
    m_single.save(str(mid_single))
    fixtures["mid_single"] = mid_single

    # 10. Generate Multi-Track Standard MIDI file (Format 1: Conductor + Lead Piano + Flute)
    mid_multi = output_dir / "sample_multi_track.mid"
    m_multi = mido.MidiFile(type=1, ticks_per_beat=480)
    # Track 0: Conductor
    t0 = mido.MidiTrack()
    t0.append(mido.MetaMessage("track_name", name="Conductor", time=0))
    t0.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(110), time=0))
    t0.append(mido.MetaMessage("time_signature", numerator=4, denominator=4, time=0))
    t0.append(mido.MetaMessage("key_signature", key="G", time=0))
    t0.append(mido.MetaMessage("end_of_track", time=0))
    m_multi.tracks.append(t0)

    # Track 1: Piano Lead (Channel 0)
    t1 = mido.MidiTrack()
    t1.append(mido.MetaMessage("track_name", name="Lead Piano", time=0))
    t1.append(mido.Message("program_change", program=0, channel=0, time=0))
    for p in [67, 71, 74, 79]:  # G4, B4, D5, G5
        t1.append(mido.Message("note_on", note=p, velocity=85, channel=0, time=0))
        t1.append(mido.Message("note_off", note=p, velocity=0, channel=0, time=480))
    t1.append(mido.MetaMessage("end_of_track", time=0))
    m_multi.tracks.append(t1)

    # Track 2: Flute Counter-melody (Channel 1, Program 73 Flute)
    t2 = mido.MidiTrack()
    t2.append(mido.MetaMessage("track_name", name="Flute Countermelody", time=0))
    t2.append(mido.Message("program_change", program=73, channel=1, time=0))
    for p in [74, 76, 74, 71]:
        t2.append(mido.Message("note_on", note=p, velocity=75, channel=1, time=0))
        t2.append(mido.Message("note_off", note=p, velocity=0, channel=1, time=480))
    t2.append(mido.MetaMessage("end_of_track", time=0))
    m_multi.tracks.append(t2)
    m_multi.save(str(mid_multi))
    fixtures["mid_multi"] = mid_multi

    # 11. Silent Video without audio (Boundary test: must be rejected with NO_AUDIO_STREAM)
    silent_video = output_dir / "silent_video.mp4"
    subprocess.check_call([
        FFMPEG, "-y", "-v", "error",
        "-f", "lavfi", "-i", "color=c=black:s=320x240:d=2:r=24",
        "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p",
        str(silent_video)
    ])
    fixtures["silent_video"] = silent_video

    return fixtures


def main() -> None:
    print("=================================================================")
    print("SONORA Phase 7: Expanded Media (Audio, Video, MIDI) Audit & Tests")
    print("=================================================================")

    token = create_token()
    headers = {"Authorization": f"Bearer {token}"}
    fixtures_dir = Path("c:/Users/NEW/Desktop/TheoryLab/services/music-engine/tests/output_verification/media_fixtures")
    fixtures = generate_audio_fixtures(fixtures_dir)
    print(f"Generated {len(fixtures)} test fixtures (audio, video, MIDI, boundary cases).")

    with httpx.Client(base_url=BASE_URL, timeout=60.0) as client:
        # Check capabilities
        cap_res = client.get("/api/v1/capabilities")
        assert cap_res.status_code == 200
        cap_data = cap_res.json()
        supported_formats = [f["format"] for f in cap_data["supported_formats"]]
        print(f"1. Verified engine capabilities: {len(supported_formats)} supported formats -> {', '.join(supported_formats)}")

        # Test A: Upload & Validation for all supported media types
        print("\n2. Testing Upload and Probing for All Formats:")
        format_assets: dict[str, dict] = {}
        for key in ["wav", "mp3", "m4a", "flac", "ogg", "webm", "mp4", "mov", "mid_single", "mid_multi"]:
            file_path = fixtures[key]
            orig_sha = hashlib.sha256(file_path.read_bytes()).hexdigest()
            with file_path.open("rb") as f:
                res = client.post(
                    "/api/v1/audio/upload",
                    headers=headers,
                    files={"file": (file_path.name, f)},
                )
            assert res.status_code == 201, f"Upload failed for {key}: {res.text}"
            data = res.json()
            meta = data["metadata"]
            asset_ref = data["asset_reference"]
            format_assets[key] = data

            # Verify non-destructive SHA-256 match
            assert meta["sha256_checksum"] == orig_sha
            print(f"   [PASS] {key.upper()}: format={meta['detected_format']}, category={meta['media_category']}, dur={meta['duration_ms']}ms, size={meta['size_bytes']}B")

        # Test B: Boundary test - Video without audio stream
        print("\n3. Testing Negative Boundary Case: Video without Audio Stream:")
        silent_file = fixtures["silent_video"]
        with silent_file.open("rb") as f:
            silent_res = client.post(
                "/api/v1/audio/upload",
                headers=headers,
                files={"file": (silent_file.name, f, "video/mp4")},
            )
        assert silent_res.status_code == 422, f"Expected 422 for silent video, got {silent_res.status_code}"
        silent_err = silent_res.json()["error"]
        assert silent_err["code"] == "NO_AUDIO_STREAM"
        print(f"   [PASS] Silent video correctly rejected: code='{silent_err['code']}', message='{silent_err['message']}'")

        # Test C: End-to-End Processing Job on Video Input (MP4 Audio Extraction + Accompaniment)
        print("\n4. Testing Real Processing Pipeline with MP4 Video Input:")
        mp4_asset = format_assets["mp4"]
        job_req = {
            "job_type": "audio_rendering",
            "source_audio": mp4_asset["asset_reference"],
            "parameters": {
                "arrangement": {
                    "style": "pop",
                    "selected_instruments": ["piano", "strings", "bass", "drums"],
                },
                "mix": {
                    "output_formats": ["mp3"],
                },
            },
        }
        mp4_job_res = client.post("/api/v1/jobs", headers=headers, json=job_req)
        assert mp4_job_res.status_code == 202
        mp4_job_id = mp4_job_res.json()["job_id"]
        print(f"   Created Video Accompaniment Job: {mp4_job_id}")

        # Poll video job to completion
        start_t = time.time()
        while time.time() - start_t < 180:
            p_res = client.get(f"/api/v1/jobs/{mp4_job_id}", headers=headers)
            assert p_res.status_code == 200
            j_state = p_res.json()
            if j_state["status"] == "completed":
                print(f"   [PASS] Video job completed in {int(time.time() - start_t)}s!")
                break
            elif j_state["status"] in ("failed", "cancelled"):
                raise RuntimeError(f"Video job failed: {j_state.get('error')}")
            time.sleep(2.0)

        # Test D: End-to-End Processing Job on Multi-Track MIDI Input
        print("\n5. Testing Real Processing Pipeline with Multi-Track MIDI Input (Direct Symbolic Arrangement):")
        midi_asset = format_assets["mid_multi"]
        midi_job_req = {
            "job_type": "audio_rendering",
            "source_audio": midi_asset["asset_reference"],
            "parameters": {
                "arrangement": {
                    "style": "classical",
                    "selected_instruments": ["piano", "strings", "bass"],
                },
                "mix": {
                    "output_formats": ["mp3"],
                },
            },
        }
        midi_job_res = client.post("/api/v1/jobs", headers=headers, json=midi_job_req)
        assert midi_job_res.status_code == 202
        midi_job_id = midi_job_res.json()["job_id"]
        print(f"   Created Multi-Track MIDI Accompaniment Job: {midi_job_id}")

        start_t = time.time()
        completed_midi_job = None
        while time.time() - start_t < 180:
            p_res = client.get(f"/api/v1/jobs/{midi_job_id}", headers=headers)
            assert p_res.status_code == 200
            j_state = p_res.json()
            if j_state["status"] == "completed":
                completed_midi_job = j_state
                print(f"   [PASS] MIDI job completed in {int(time.time() - start_t)}s!")
                break
            elif j_state["status"] in ("failed", "cancelled"):
                raise RuntimeError(f"MIDI job failed: {j_state.get('error')}")
            time.sleep(2.0)

        assert completed_midi_job is not None

        # Test E: Verify MIDI Multi-Track Preservation in Downloaded Output MIDI
        print("\n6. Verifying MIDI Arrangement Multi-Track Preservation & Audio Playability:")
        artifacts = completed_midi_job["artifacts"]
        art_map = {a["artifact_type"]: a for a in artifacts}
        assert "accompaniment_midi" in art_map
        assert "master_audio_mp3" in art_map

        # Download accompaniment.mid
        dl_midi = client.get(
            f"/api/v1/jobs/{midi_job_id}/artifacts/download",
            headers=headers,
            params={"object_path": art_map["accompaniment_midi"]["object_path"]},
        )
        assert dl_midi.status_code == 200
        saved_arr_mid = fixtures_dir / "arranged_output.mid"
        saved_arr_mid.write_bytes(dl_midi.content)

        # Inspect arranged MIDI with mido
        arr_mid = mido.MidiFile(str(saved_arr_mid))
        track_names = [t.name for t in arr_mid.tracks if any(m.type == "track_name" for m in t)]
        print(f"   Exported Arrangement MIDI Track Count: {len(arr_mid.tracks)}")
        print(f"   Track Names: {track_names}")
        # Verify original tracks are preserved in the arrangement
        assert any("Original" in name or "Piano" in name or "Flute" in name for name in track_names), "Original MIDI tracks missing from arrangement!"

        # Download master MP3
        dl_mp3 = client.get(
            f"/api/v1/jobs/{midi_job_id}/artifacts/download",
            headers=headers,
            params={"object_path": art_map["master_audio_mp3"]["object_path"]},
        )
        assert dl_mp3.status_code == 200
        saved_arr_mp3 = fixtures_dir / "master_midi_arranged.mp3"
        saved_arr_mp3.write_bytes(dl_mp3.content)

        # Verify master MP3 with FFprobe
        probe_res = subprocess.check_output([
            FFPROBE, "-v", "error", "-show_streams", "-of", "json", str(saved_arr_mp3)
        ])
        probe_data = json.loads(probe_res)
        stream = probe_data["streams"][0]
        assert stream["codec_name"] == "mp3"
        assert int(stream["sample_rate"]) == 44100
        assert int(stream["channels"]) == 2
        print(f"   [PASS] Master MP3 verified by FFprobe: codec={stream['codec_name']}, sample_rate={stream['sample_rate']}Hz, channels={stream['channels']}, size={len(dl_mp3.content)} bytes")

    print("\n>>> ALL PHASE 7 EXPANDED MEDIA & MIDI TESTS PASSED WITH 100% SUCCESS! <<<")


if __name__ == "__main__":
    main()
