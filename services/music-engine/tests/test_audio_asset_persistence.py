from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

import httpx
import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.core.errors import AccessDeniedError, StorageIntegrationError
from app.jobs.assets import (
    AudioAssetRecord,
    AudioAssetRepository,
    InMemoryAudioAssetRepository,
    SupabaseAudioAssetRepository,
)
from app.jobs.repository import SupabaseJobRepository
from app.main import create_app
from app.security.auth import SupabaseAuthVerifier
from app.storage.local_storage import LocalFilesystemStorageAdapter
from tests.conftest import TEST_JWT_SECRET, USER_A_ID, USER_B_ID, generate_sine_wav, make_jwt


class _FailingAssetRepository(AudioAssetRepository):
    async def create_or_get(self, asset: AudioAssetRecord) -> AudioAssetRecord:
        raise StorageIntegrationError(
            "Simulated Supabase audio_assets write failure.",
            code="DATABASE_WRITE_FAILED",
        )

    async def get_by_id(self, asset_id: str) -> AudioAssetRecord | None:
        return None

    async def find_by_storage_path(self, bucket: str, object_path: str) -> AudioAssetRecord | None:
        return None


@pytest.mark.asyncio
async def test_in_memory_asset_repository_duplicate_safe_and_ownership_isolated() -> None:
    repo = InMemoryAudioAssetRepository(allowed_bucket="sonora-audio")
    now = datetime.now(timezone.utc)
    asset_id = str(uuid.uuid4())
    object_path = f"{USER_A_ID}/uploads/{asset_id}/take.wav"

    record = AudioAssetRecord(
        id=asset_id,
        user_id=USER_A_ID,
        bucket="sonora-audio",
        object_path=object_path,
        original_filename="take.wav",
        mime_type="audio/wav",
        size_bytes=2048,
        duration_ms=1000,
        detected_format="wav",
        sha256_checksum="a" * 64,
        sample_rate_hz=44100,
        channels=1,
        codec_name="pcm_s16le",
        bit_rate_bps=705600,
        bit_depth=16,
        original_preserved=True,
        verified_at=now,
        created_at=now,
        updated_at=now,
    )

    first = await repo.create_or_get(record)
    # Duplicate insert with a different UUID for the same (bucket, object_path) and owner returns the persisted row
    duplicate = await repo.create_or_get(record.model_copy(update={"id": str(uuid.uuid4())}))
    assert duplicate.id == first.id
    assert duplicate.object_path == object_path

    # Cross-user path violation is rejected by UserStoragePathGuard
    with pytest.raises(AccessDeniedError) as exc_info:
        await repo.create_or_get(
            record.model_copy(
                update={
                    "id": str(uuid.uuid4()),
                    "user_id": USER_B_ID,
                }
            )
        )
    assert exc_info.value.code == "STORAGE_ACCESS_DENIED"


@pytest.mark.asyncio
async def test_supabase_asset_repository_handles_409_duplicate_and_cross_user_conflict() -> None:
    stored_assets: dict[str, dict] = {}
    asset_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    object_path = f"{USER_A_ID}/uploads/{asset_id}/vocal.wav"

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST" and request.url.path == "/rest/v1/audio_assets":
            row = json.loads(request.content.decode("utf-8"))
            if any(
                existing["bucket"] == row["bucket"] and existing["object_path"] == row["object_path"]
                for existing in stored_assets.values()
            ):
                return httpx.Response(409, json={"code": "23505", "message": "duplicate key value"})
            stored_assets[row["id"]] = row
            return httpx.Response(201, json=[row])

        if request.method == "GET" and request.url.path == "/rest/v1/audio_assets":
            params = request.url.params
            if "bucket" in params and "object_path" in params:
                bkt = params["bucket"].removeprefix("eq.")
                obj = params["object_path"].removeprefix("eq.")
                matches = [
                    r for r in stored_assets.values() if r["bucket"] == bkt and r["object_path"] == obj
                ]
                return httpx.Response(200, json=matches[:1])
            if "id" in params:
                aid = params["id"].removeprefix("eq.")
                row = stored_assets.get(aid)
                return httpx.Response(200, json=[row] if row else [])
        return httpx.Response(404)

    settings = Settings(
        music_engine_env="test",
        supabase_url="https://example-project.supabase.co",
        supabase_service_role_key="sb_secret_server_only",
    )
    record = AudioAssetRecord(
        id=asset_id,
        user_id=USER_A_ID,
        bucket="sonora-audio",
        object_path=object_path,
        original_filename="vocal.wav",
        mime_type="AUDIO/WAV",
        size_bytes=4096,
        duration_ms=1200,
        detected_format="wav",
        sha256_checksum="b" * 64,
        sample_rate_hz=44100,
        channels=1,
        codec_name="pcm_s16le",
        bit_rate_bps=0,  # sanitized to None to satisfy audio_assets_bit_rate_positive
        bit_depth=4,  # sanitized to None to satisfy audio_assets_bit_depth_valid (8..64)
        original_preserved=True,
        verified_at=now,
        created_at=now,
        updated_at=now,
    )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http_client:
        repo = SupabaseAudioAssetRepository(settings, http_client=http_client)
        created = await repo.create_or_get(record)
        assert created.id == asset_id
        assert stored_assets[asset_id]["mime_type"] == "audio/wav"
        assert stored_assets[asset_id]["bit_rate_bps"] is None
        assert stored_assets[asset_id]["bit_depth"] is None
        assert stored_assets[asset_id]["original_preserved"] is True
        assert stored_assets[asset_id]["verified_at"] is not None

        # Duplicate POST returns 409 from PostgREST and cleanly resolves the existing owner row
        duplicate = await repo.create_or_get(record.model_copy(update={"id": str(uuid.uuid4())}))
        assert duplicate.id == asset_id

        # If a conflicting row belongs to a different user, raise STORAGE_ACCESS_DENIED
        stored_assets[asset_id]["user_id"] = USER_B_ID
        with pytest.raises(AccessDeniedError) as exc_info:
            await repo.create_or_get(record.model_copy(update={"id": str(uuid.uuid4())}))
        assert exc_info.value.code == "STORAGE_ACCESS_DENIED"


def test_upload_persists_audio_asset_before_supabase_processing_job_fk_and_trigger(tmp_path: Path) -> None:
    """
    Simulates live Supabase PostgREST with migration 0002's foreign key and
    protect_processing_job_integrity() trigger enforced on processing_jobs INSERT.
    """
    audio_assets_table: dict[str, dict] = {}
    processing_jobs_table: dict[str, dict] = {}
    write_sequence: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "GET" and request.url.path == "/rest/v1/profiles":
            return httpx.Response(200, json=[{"id": USER_A_ID, "account_status": "active"}])

        if request.method == "POST" and request.url.path == "/rest/v1/audio_assets":
            row = json.loads(request.content.decode("utf-8"))
            # Verify all critical migration 0002 check constraints
            assert row["bucket"] == "sonora-audio"
            assert row["object_path"].startswith(f"{row['user_id']}/")
            assert row["original_preserved"] is True
            assert row["verified_at"] is not None
            assert row["size_bytes"] > 0
            assert row["duration_ms"] > 0
            assert len(row["sha256_checksum"]) == 64
            audio_assets_table[row["id"]] = row
            write_sequence.append("audio_assets")
            return httpx.Response(201, json=[row])

        if request.method == "GET" and request.url.path == "/rest/v1/audio_assets":
            params = request.url.params
            if "id" in params:
                aid = params["id"].removeprefix("eq.")
                row = audio_assets_table.get(aid)
                return httpx.Response(200, json=[row] if row else [])
            if "bucket" in params and "object_path" in params:
                bkt = params["bucket"].removeprefix("eq.")
                obj = params["object_path"].removeprefix("eq.")
                rows = [
                    r for r in audio_assets_table.values() if r["bucket"] == bkt and r["object_path"] == obj
                ]
                return httpx.Response(200, json=rows[:1])

        if request.method == "POST" and request.url.path == "/rest/v1/processing_jobs":
            row = json.loads(request.content.decode("utf-8"))
            # Enforce migration 0002 FK + protect_processing_job_integrity() trigger
            asset_id = row.get("audio_asset_id")
            if asset_id is not None:
                linked = audio_assets_table.get(asset_id)
                if linked is None or linked["user_id"] != row["user_id"]:
                    return httpx.Response(
                        400,
                        json={
                            "message": "Referenced audio_asset_id does not exist or does not belong to job user_id."
                        },
                    )
            processing_jobs_table[row["id"]] = row
            write_sequence.append("processing_jobs")
            return httpx.Response(201, json=[row])

        if request.method == "GET" and request.url.path == "/rest/v1/processing_jobs":
            params = request.url.params
            if "id" in params:
                jid = params["id"].removeprefix("eq.")
                row = processing_jobs_table.get(jid)
                return httpx.Response(200, json=[row] if row else [])
            if "user_id" in params and "status" in params:
                uid = params["user_id"].removeprefix("eq.")
                rows = [
                    {"id": r["id"]}
                    for r in processing_jobs_table.values()
                    if r["user_id"] == uid and r["status"] in ("queued", "processing")
                ]
                return httpx.Response(200, json=rows)
            if "user_id" in params:
                uid = params["user_id"].removeprefix("eq.")
                rows = [r for r in processing_jobs_table.values() if r["user_id"] == uid]
                return httpx.Response(200, json=rows)

        if request.method == "PATCH" and request.url.path == "/rest/v1/processing_jobs":
            jid = request.url.params["id"].removeprefix("eq.")
            patch = json.loads(request.content.decode("utf-8"))
            merged = {**processing_jobs_table[jid], **patch}
            processing_jobs_table[jid] = merged
            return httpx.Response(200, json=[merged])

        return httpx.Response(404)

    settings = Settings(
        music_engine_env="test",
        music_engine_temp_dir=str(tmp_path / "temp"),
        music_engine_local_storage_dir=str(tmp_path / "storage"),
        music_engine_storage_backend="local",
        music_engine_job_repository_backend="supabase",
        supabase_url="https://example-project.supabase.co",
        supabase_service_role_key="sb_secret_server_only",
        supabase_jwt_secret=TEST_JWT_SECRET,
        supabase_audio_bucket="sonora-audio",
    )

    http_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    storage = LocalFilesystemStorageAdapter(settings.local_storage_path)
    asset_repo = SupabaseAudioAssetRepository(settings, http_client=http_client)
    job_repo = SupabaseJobRepository(settings, http_client=http_client)
    auth_verifier = SupabaseAuthVerifier(settings, http_client=http_client)
    app = create_app(
        settings=settings,
        storage=storage,
        repository=job_repo,
        asset_repository=asset_repo,
        auth_verifier=auth_verifier,
    )

    wav_path = generate_sine_wav(tmp_path / "persisted_vocal.wav", duration_sec=0.8)
    headers_a = {"Authorization": f"Bearer {make_jwt(USER_A_ID)}"}

    with TestClient(app) as client:
        upload_resp = client.post(
            "/api/v1/audio/upload",
            headers=headers_a,
            files={"file": ("persisted_vocal.wav", wav_path.read_bytes(), "audio/wav")},
        )
        assert upload_resp.status_code == 201, upload_resp.text
        source_ref = upload_resp.json()["asset_reference"]
        asset_id = source_ref["asset_id"]
        assert asset_id in audio_assets_table
        assert audio_assets_table[asset_id]["user_id"] == USER_A_ID

        create_resp = client.post(
            "/api/v1/jobs",
            headers=headers_a,
            json={
                "job_type": "audio_analysis",
                "source_audio": source_ref,
                "parameters": {"include_vocal_pitch": True},
                "studio_context": "ai_accompaniment_studio",
            },
        )
        assert create_resp.status_code == 202, create_resp.text
        job_id = create_resp.json()["job_id"]
        assert processing_jobs_table[job_id]["audio_asset_id"] == asset_id
        assert write_sequence[:2] == ["audio_assets", "processing_jobs"]


def test_upload_fails_cleanly_when_asset_persistence_fails(test_settings: Settings, tmp_path: Path) -> None:
    app = create_app(
        settings=test_settings,
        asset_repository=_FailingAssetRepository(),
    )
    wav_path = generate_sine_wav(tmp_path / "fail_persist.wav", duration_sec=0.6)
    headers_a = {"Authorization": f"Bearer {make_jwt(USER_A_ID)}"}

    with TestClient(app) as client:
        resp = client.post(
            "/api/v1/audio/upload",
            headers=headers_a,
            files={"file": ("fail_persist.wav", wav_path.read_bytes(), "audio/wav")},
        )
        assert resp.status_code == 502
        body = resp.json()
        assert body["error"]["code"] == "DATABASE_WRITE_FAILED"
        assert "asset_reference" not in body


def test_job_creation_rejects_missing_or_cross_user_audio_asset_id(
    client: TestClient,
    tmp_path: Path,
) -> None:
    wav_a = generate_sine_wav(tmp_path / "user_a.wav", duration_sec=0.8)
    wav_b = generate_sine_wav(tmp_path / "user_b.wav", duration_sec=0.8)
    headers_a = {"Authorization": f"Bearer {make_jwt(USER_A_ID)}"}
    headers_b = {"Authorization": f"Bearer {make_jwt(USER_B_ID)}"}

    up_a = client.post(
        "/api/v1/audio/upload",
        headers=headers_a,
        files={"file": ("user_a.wav", wav_a.read_bytes(), "audio/wav")},
    )
    assert up_a.status_code == 201
    ref_a = up_a.json()["asset_reference"]

    up_b = client.post(
        "/api/v1/audio/upload",
        headers=headers_b,
        files={"file": ("user_b.wav", wav_b.read_bytes(), "audio/wav")},
    )
    assert up_b.status_code == 201
    ref_b = up_b.json()["asset_reference"]

    # 1. Unknown asset_id rejected with 404 AUDIO_ASSET_NOT_FOUND
    missing = client.post(
        "/api/v1/jobs",
        headers=headers_a,
        json={
            "job_type": "audio_analysis",
            "source_audio": {**ref_a, "asset_id": str(uuid.uuid4())},
        },
    )
    assert missing.status_code == 404
    assert missing.json()["error"]["code"] == "AUDIO_ASSET_NOT_FOUND"

    # 2. Cross-user asset_id (User A attempting to link User B's asset_id) rejected with 403
    cross_user = client.post(
        "/api/v1/jobs",
        headers=headers_a,
        json={
            "job_type": "audio_analysis",
            "source_audio": {**ref_a, "asset_id": ref_b["asset_id"]},
        },
    )
    assert cross_user.status_code == 403
    assert cross_user.json()["error"]["code"] == "STORAGE_ACCESS_DENIED"

    # 3. Valid asset_id with mismatched object_path rejected with 422 AUDIO_ASSET_MISMATCH
    up_a2 = client.post(
        "/api/v1/audio/upload",
        headers=headers_a,
        files={"file": ("user_a_second.wav", wav_a.read_bytes(), "audio/wav")},
    )
    assert up_a2.status_code == 201
    ref_a2 = up_a2.json()["asset_reference"]

    mismatch = client.post(
        "/api/v1/jobs",
        headers=headers_a,
        json={
            "job_type": "audio_analysis",
            "source_audio": {**ref_a2, "asset_id": ref_a["asset_id"]},
        },
    )
    assert mismatch.status_code == 422
    assert mismatch.json()["error"]["code"] == "AUDIO_ASSET_MISMATCH"
