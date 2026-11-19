from __future__ import annotations

import hashlib
from pathlib import Path

import pytest

from app.audio.decoding import FFmpegAudioDecoder
from app.audio.preservation import DefaultAudioIngestionService
from app.schemas.audio import AudioSourceRef, StorageBackendType, TrimWindow
from app.storage.local_storage import LocalFilesystemStorageAdapter
from tests.conftest import USER_A_ID, make_jwt


def test_validate_audio_upload_accepts_valid_wav_and_mp3(
    client,
    user_a_wav_object,
    user_a_mp3_object,
):
    token = make_jwt(USER_A_ID)
    _, wav_path = user_a_wav_object
    _, mp3_path = user_a_mp3_object

    r_wav = client.post(
        "/api/v1/audio/validate",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("take1.wav", wav_path.read_bytes(), "audio/wav")},
    )
    assert r_wav.status_code == 200
    wav_meta = r_wav.json()["metadata"]
    assert wav_meta["detected_format"] == "wav"
    assert wav_meta["sample_rate_hz"] == 44100
    assert wav_meta["channels"] == 1
    assert wav_meta["duration_ms"] >= 750
    assert wav_meta["original_preserved"] is True

    r_mp3 = client.post(
        "/api/v1/audio/validate",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("take1.mp3", mp3_path.read_bytes(), "audio/mpeg")},
    )
    assert r_mp3.status_code == 200
    mp3_meta = r_mp3.json()["metadata"]
    assert mp3_meta["detected_format"] == "mp3"
    assert mp3_meta["duration_ms"] >= 700


def test_validate_audio_upload_rejects_disguised_corrupt_empty_and_oversized_files(client):
    token = make_jwt(USER_A_ID)

    # Disguised HTML pretending to be .wav
    r_html = client.post(
        "/api/v1/audio/validate",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("fake.wav", b"<html><body>not audio</body></html>", "audio/wav")},
    )
    assert r_html.status_code == 422
    assert r_html.json()["error"]["code"] == "UNSUPPORTED_OR_INVALID_AUDIO_HEADER"

    # Empty file
    r_empty = client.post(
        "/api/v1/audio/validate",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("empty.wav", b"", "audio/wav")},
    )
    assert r_empty.status_code == 422
    assert r_empty.json()["error"]["code"] == "EMPTY_AUDIO_FILE"

    # Unsupported extension
    r_ext = client.post(
        "/api/v1/audio/validate",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("script.exe", b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00", "application/octet-stream")},
    )
    assert r_ext.status_code == 422
    assert r_ext.json()["error"]["code"] == "UNSUPPORTED_AUDIO_EXTENSION"

    # Corrupted RIFF/WAVE payload
    r_corrupt = client.post(
        "/api/v1/audio/validate",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("broken.wav", b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00BADDATA", "audio/wav")},
    )
    assert r_corrupt.status_code == 422
    assert r_corrupt.json()["error"]["code"] == "CORRUPTED_AUDIO_FILE"

    # Oversized (> 5 MiB test limit)
    oversized = b"RIFF\x00\x00\x00\x00WAVE" + (b"\x00" * (5 * 1024 * 1024 + 32))
    r_big = client.post(
        "/api/v1/audio/validate",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("huge.wav", oversized, "audio/wav")},
    )
    assert r_big.status_code == 413
    assert r_big.json()["error"]["code"] == "AUDIO_FILE_TOO_LARGE"


@pytest.mark.asyncio
async def test_ingestion_preserves_original_and_decoder_applies_nondestructive_trim(
    test_settings,
    user_a_mp3_object,
):
    object_path, original_path = user_a_mp3_object
    original_sha_before = hashlib.sha256(original_path.read_bytes()).hexdigest()

    storage = LocalFilesystemStorageAdapter(test_settings.local_storage_path)
    ingestion = DefaultAudioIngestionService(test_settings, storage)
    decoder = FFmpegAudioDecoder(test_settings)

    workspace = test_settings.temp_path / "trim-test-job"
    ingested = await ingestion.ingest(
        job_id="trim-test-job",
        user_id=USER_A_ID,
        source_ref=AudioSourceRef(
            storage_backend=StorageBackendType.LOCAL,
            bucket=test_settings.supabase_audio_bucket,
            object_path=object_path,
            original_filename="sample_a4.mp3",
        ),
        workspace_dir=workspace,
    )

    decoded = await decoder.decode(
        ingested=ingested,
        workspace_dir=workspace,
        trim_window=TrimWindow(start_ms=100, end_ms=450),
    )

    assert Path(decoded.working_wav_path).is_file()
    assert decoded.sample_rate_hz == 44100
    assert 250 <= decoded.duration_ms <= 420
    # Original recording must remain byte-for-byte identical
    assert hashlib.sha256(original_path.read_bytes()).hexdigest() == original_sha_before
