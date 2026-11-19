from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import httpx
import pytest

from app.core.config import Settings
from app.core.errors import AccessDeniedError, AuthenticationError
from app.jobs.repository import SupabaseJobRepository
from app.schemas.audio import AudioSourceRef, StorageBackendType
from app.schemas.jobs import JobResponse, JobStatus, JobType
from app.security.auth import SupabaseAuthVerifier
from app.storage.supabase_storage import SupabaseStorageAdapter
from tests.conftest import USER_A_ID


@pytest.mark.asyncio
async def test_supabase_auth_verifier_remote_introspection_and_suspended_profile():
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/auth/v1/user":
            if request.headers.get("Authorization") == "Bearer valid-supabase-token":
                return httpx.Response(200, json={"id": USER_A_ID, "email": "student@sonora.test", "role": "authenticated"})
            return httpx.Response(401, json={"error": "invalid_token"})
        if request.url.path == "/rest/v1/profiles":
            # Simulate suspended account
            return httpx.Response(200, json=[{"id": USER_A_ID, "account_status": "suspended"}])
        return httpx.Response(404)

    settings = Settings(
        music_engine_env="test",
        supabase_url="https://example-project.supabase.co",
        supabase_publishable_key="sb_publishable_example",
        supabase_service_role_key="sb_secret_server_only",
    )
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http_client:
        verifier = SupabaseAuthVerifier(settings, http_client=http_client)

        with pytest.raises(AuthenticationError):
            await verifier.verify_bearer_token("Bearer invalid-token")

        with pytest.raises(AccessDeniedError) as exc_info:
            await verifier.verify_bearer_token("Bearer valid-supabase-token")
        assert exc_info.value.code == "ACCOUNT_INACTIVE"


@pytest.mark.asyncio
async def test_supabase_storage_adapter_head_download_upload_and_sign(tmp_path: Path):
    calls: list[tuple[str, str]] = []
    audio_bytes = b"RIFF\x24\x00\x00\x00WAVEfmt "

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append((request.method, request.url.path))
        if request.method == "GET" and request.url.path.startswith("/storage/v1/object/info/"):
            return httpx.Response(200, json={"size": len(audio_bytes), "content_type": "audio/wav", "etag": "etag-1"})
        if request.method == "GET" and request.url.path.startswith("/storage/v1/object/sonora-audio/"):
            return httpx.Response(200, content=audio_bytes)
        if request.method == "POST" and request.url.path.startswith("/storage/v1/object/sign/"):
            return httpx.Response(200, json={"signedURL": "/object/sign/sonora-audio/signed-token"})
        if request.method == "POST" and request.url.path.startswith("/storage/v1/object/sonora-audio/"):
            return httpx.Response(200, json={"Key": "sonora-audio/out.mid"})
        return httpx.Response(404)

    settings = Settings(
        music_engine_env="test",
        supabase_url="https://example-project.supabase.co",
        supabase_service_role_key="sb_secret_server_only",
    )
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http_client:
        adapter = SupabaseStorageAdapter(settings, http_client=http_client)
        obj_path = f"{USER_A_ID}/uploads/test.wav"

        info = await adapter.head_object("sonora-audio", obj_path)
        assert info.size_bytes == len(audio_bytes)

        dest = tmp_path / "downloaded.wav"
        await adapter.download_to_path("sonora-audio", obj_path, dest)
        assert dest.read_bytes() == audio_bytes

        upload_src = tmp_path / "artifact.mid"
        upload_src.write_bytes(b"MThd\x00\x00\x00\x06")
        uploaded = await adapter.upload_from_path("sonora-audio", f"{USER_A_ID}/artifacts/out.mid", upload_src, "audio/midi")
        assert uploaded.size_bytes == 8

        signed_url = await adapter.create_signed_url("sonora-audio", obj_path, expires_in_seconds=120)
        assert signed_url.startswith("https://example-project.supabase.co/storage/v1/")


@pytest.mark.asyncio
async def test_supabase_job_repository_roundtrip():
    stored_rows: dict[str, dict] = {}
    last_patch_body: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST" and request.url.path == "/rest/v1/processing_jobs":
            row = json.loads(request.content.decode("utf-8"))
            stored_rows[row["id"]] = row
            return httpx.Response(201, json=[row])
        if request.method == "GET" and request.url.path == "/rest/v1/processing_jobs":
            params = request.url.params
            if "id" in params:
                jid = params["id"].removeprefix("eq.")
                row = stored_rows.get(jid)
                return httpx.Response(200, json=[row] if row else [])
            if "user_id" in params and "idempotency_key" in params:
                uid = params["user_id"].removeprefix("eq.")
                key = params["idempotency_key"].removeprefix("eq.")
                rows = [
                    r
                    for r in stored_rows.values()
                    if r["user_id"] == uid and r.get("idempotency_key") == key
                ]
                return httpx.Response(200, json=rows)
            if "user_id" in params:
                uid = params["user_id"].removeprefix("eq.")
                rows = [r for r in stored_rows.values() if r["user_id"] == uid]
                return httpx.Response(200, json=rows)
        if request.method == "PATCH" and request.url.path == "/rest/v1/processing_jobs":
            jid = request.url.params["id"].removeprefix("eq.")
            patch = json.loads(request.content.decode("utf-8"))
            last_patch_body.clear()
            last_patch_body.update(patch)
            merged = {**stored_rows[jid], **patch}
            stored_rows[jid] = merged
            return httpx.Response(200, json=[merged])
        return httpx.Response(404)

    settings = Settings(
        music_engine_env="test",
        supabase_url="https://example-project.supabase.co",
        supabase_service_role_key="sb_secret_server_only",
    )
    now = datetime.now(timezone.utc)
    asset_uuid = "33333333-3333-4333-8333-333333333333"
    job_uuid = "44444444-4444-4444-8444-444444444444"
    sample_job = JobResponse(
        job_id=job_uuid,
        user_id=USER_A_ID,
        job_type=JobType.AUDIO_ANALYSIS,
        status=JobStatus.QUEUED,
        progress_percent=0,
        stage="queued",
        source_audio=AudioSourceRef(
            storage_backend=StorageBackendType.SUPABASE,
            bucket="sonora-audio",
            object_path=f"{USER_A_ID}/uploads/test.wav",
            asset_id=asset_uuid,
        ),
        created_at=now,
        updated_at=now,
    )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http_client:
        repo = SupabaseJobRepository(settings, http_client=http_client)
        created = await repo.create(sample_job, idempotency_key="idem-key-0001")
        assert created.job_id == job_uuid
        assert stored_rows[job_uuid]["audio_asset_id"] == asset_uuid
        assert stored_rows[job_uuid]["idempotency_key"] == "idem-key-0001"

        by_idem = await repo.find_by_idempotency_key(USER_A_ID, "idem-key-0001")
        assert by_idem is not None
        assert by_idem.job_id == job_uuid

        fetched = await repo.get_by_id(job_uuid)
        assert fetched is not None
        assert fetched.user_id == USER_A_ID

        active_count = await repo.count_active_by_user(USER_A_ID)
        assert active_count == 1

        updated = await repo.update(
            sample_job.model_copy(update={"status": JobStatus.PROCESSING, "progress_percent": 30})
        )
        assert updated.status == JobStatus.PROCESSING
        # Immutable identity/creation columns are never sent in PATCH payloads
        assert "id" not in last_patch_body
        assert "user_id" not in last_patch_body
        assert "job_type" not in last_patch_body
        assert "created_at" not in last_patch_body
        assert "idempotency_key" not in last_patch_body
