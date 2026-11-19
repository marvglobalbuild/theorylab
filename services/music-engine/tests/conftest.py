from __future__ import annotations

import asyncio
import math
import struct
import subprocess
import time
import uuid
import wave
from pathlib import Path

import jwt
import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app

TEST_JWT_SECRET = "test-super-secret-supabase-jwt-signing-key-2026"
USER_A_ID = "11111111-1111-4111-8111-111111111111"
USER_B_ID = "22222222-2222-4222-8222-222222222222"


def make_jwt(
    user_id: str = USER_A_ID,
    email: str = "learner@sonora.test",
    exp_offset_seconds: int = 3600,
    secret: str = TEST_JWT_SECRET,
    audience: str = "authenticated",
) -> str:
    now = int(time.time())
    payload = {
        "sub": user_id,
        "email": email,
        "role": "authenticated",
        "aud": audience,
        "iat": now,
        "exp": now + exp_offset_seconds,
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def generate_sine_wav(path: Path, duration_sec: float = 0.6, sample_rate: int = 44100, freq_hz: float = 440.0) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    num_frames = int(sample_rate * duration_sec)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        frames = bytearray()
        for i in range(num_frames):
            sample = int(16000 * math.sin(2.0 * math.pi * freq_hz * i / sample_rate))
            frames.extend(struct.pack("<h", sample))
        wf.writeframes(bytes(frames))
    return path


def convert_wav_via_ffmpeg(wav_path: Path, out_path: Path) -> Path:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(wav_path), str(out_path)],
        check=True,
    )
    return out_path


@pytest.fixture
def test_settings(tmp_path: Path) -> Settings:
    return Settings(
        music_engine_env="test",
        music_engine_temp_dir=str(tmp_path / "temp"),
        music_engine_local_storage_dir=str(tmp_path / "storage"),
        music_engine_storage_backend="local",
        music_engine_job_repository_backend="memory",
        music_engine_max_file_size_bytes=5 * 1024 * 1024,
        music_engine_max_duration_seconds=120,
        music_engine_max_concurrent_jobs_per_user=2,
        supabase_jwt_secret=TEST_JWT_SECRET,
        supabase_audio_bucket="sonora-audio",
    )


@pytest.fixture
def app_instance(test_settings: Settings):
    return create_app(settings=test_settings)


@pytest.fixture
def client(app_instance):
    with TestClient(app_instance) as test_client:
        yield test_client


@pytest.fixture
def user_a_wav_object(test_settings: Settings) -> tuple[str, Path]:
    object_path = f"{USER_A_ID}/uploads/{uuid.uuid4()}/sample_a4.wav"
    dest = test_settings.local_storage_path / test_settings.supabase_audio_bucket / object_path
    generate_sine_wav(dest, duration_sec=0.8)
    return object_path, dest


@pytest.fixture
def user_a_mp3_object(test_settings: Settings, tmp_path: Path) -> tuple[str, Path]:
    src_wav = generate_sine_wav(tmp_path / "src_for_mp3.wav", duration_sec=0.8)
    object_path = f"{USER_A_ID}/uploads/{uuid.uuid4()}/sample_a4.mp3"
    dest = test_settings.local_storage_path / test_settings.supabase_audio_bucket / object_path
    convert_wav_via_ffmpeg(src_wav, dest)
    return object_path, dest


@pytest.fixture
def user_a_corrupt_object(test_settings: Settings) -> tuple[str, Path]:
    object_path = f"{USER_A_ID}/uploads/{uuid.uuid4()}/corrupt.wav"
    dest = test_settings.local_storage_path / test_settings.supabase_audio_bucket / object_path
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00CORRUPTED_GARBAGE_DATA")
    return object_path, dest
