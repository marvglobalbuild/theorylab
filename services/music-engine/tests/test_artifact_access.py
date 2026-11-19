from __future__ import annotations

import time
from pathlib import Path

from fastapi.testclient import TestClient

from tests.conftest import USER_A_ID, USER_B_ID, generate_sine_wav, make_jwt


def _wait_for_job(client: TestClient, job_id: str, headers: dict[str, str], timeout_s: float = 15.0) -> dict:
    deadline = time.monotonic() + timeout_s
    while time.monotonic() < deadline:
        resp = client.get(f"/api/v1/jobs/{job_id}", headers=headers)
        assert resp.status_code == 200
        body = resp.json()
        if body["status"] in ("completed", "failed", "cancelled"):
            return body
        time.sleep(0.05)
    raise AssertionError(f"Job {job_id} did not reach terminal state within {timeout_s}s")


def test_private_audio_upload_validates_and_stores_in_user_namespace(
    client: TestClient,
    tmp_path: Path,
) -> None:
    wav_path = generate_sine_wav(tmp_path / "my vocal take.wav", duration_sec=0.8)
    token_a = make_jwt(USER_A_ID)

    # Unauthenticated rejected
    unauth = client.post(
        "/api/v1/audio/upload",
        files={"file": ("my vocal take.wav", wav_path.read_bytes(), "audio/wav")},
    )
    assert unauth.status_code == 401

    # Authenticated succeeds and namespaces strictly under USER_A_ID
    resp = client.post(
        "/api/v1/audio/upload",
        headers={"Authorization": f"Bearer {token_a}"},
        files={"file": ("my vocal take.wav", wav_path.read_bytes(), "audio/wav")},
    )
    assert resp.status_code == 201, resp.text
    payload = resp.json()
    assert payload["valid"] is True
    assert payload["asset_reference"]["object_path"].startswith(f"{USER_A_ID}/uploads/")
    assert payload["asset_reference"]["bucket"] == "sonora-audio"
    assert payload["metadata"]["detected_format"] == "wav"
    assert payload["metadata"]["original_preserved"] is True

    # Invalid file type rejected cleanly
    bad = client.post(
        "/api/v1/audio/upload",
        headers={"Authorization": f"Bearer {token_a}"},
        files={"file": ("video.mp4", b"\x00\x00\x00\x18ftypmp42", "video/mp4")},
    )
    assert bad.status_code in (400, 415, 422)


def test_owner_can_access_job_artifacts_and_cross_user_is_denied(
    client: TestClient,
    tmp_path: Path,
) -> None:
    wav_path = generate_sine_wav(tmp_path / "vocal.wav", duration_sec=1.2)
    headers_a = {"Authorization": f"Bearer {make_jwt(USER_A_ID)}"}
    headers_b = {"Authorization": f"Bearer {make_jwt(USER_B_ID)}"}

    upload_resp = client.post(
        "/api/v1/audio/upload",
        headers=headers_a,
        files={"file": ("vocal.wav", wav_path.read_bytes(), "audio/wav")},
    )
    assert upload_resp.status_code == 201
    source_ref = upload_resp.json()["asset_reference"]

    create_resp = client.post(
        "/api/v1/jobs",
        headers=headers_a,
        json={
            "job_type": "audio_analysis",
            "source_audio": source_ref,
            "parameters": {"include_vocal_pitch": True, "project_name": "Studio Test Take"},
            "studio_context": "ai_accompaniment_studio",
        },
    )
    assert create_resp.status_code == 202
    job_id = create_resp.json()["job_id"]
    completed = _wait_for_job(client, job_id, headers_a)
    assert completed["status"] == "completed"

    source_path = source_ref["object_path"]

    # Owner can request signed/access URL and download original vocal
    sign_ok = client.post(
        f"/api/v1/jobs/{job_id}/artifacts/signed-url",
        headers=headers_a,
        json={"object_path": source_path, "expires_in_seconds": 300},
    )
    assert sign_ok.status_code == 200, sign_ok.text
    sign_body = sign_ok.json()
    assert sign_body["job_id"] == job_id
    assert sign_body["object_path"] == source_path
    assert "/artifacts/download?" in sign_body["download_path"]

    dl_ok = client.get(sign_body["download_path"], headers=headers_a)
    assert dl_ok.status_code == 200
    assert dl_ok.content == wav_path.read_bytes()

    # Cross-user access strictly rejected with 403 JOB_ACCESS_DENIED
    sign_cross = client.post(
        f"/api/v1/jobs/{job_id}/artifacts/signed-url",
        headers=headers_b,
        json={"object_path": source_path},
    )
    assert sign_cross.status_code == 403
    assert sign_cross.json()["error"]["code"] == "JOB_ACCESS_DENIED"

    dl_cross = client.get(sign_body["download_path"], headers=headers_b)
    assert dl_cross.status_code == 403
    assert dl_cross.json()["error"]["code"] == "JOB_ACCESS_DENIED"

    # Unauthenticated download strictly rejected with 401
    dl_unauth = client.get(sign_body["download_path"])
    assert dl_unauth.status_code == 401

    # Unrelated object path not belonging to job rejected
    unrelated = client.post(
        f"/api/v1/jobs/{job_id}/artifacts/signed-url",
        headers=headers_a,
        json={"object_path": f"{USER_A_ID}/uploads/other/not-in-job.wav"},
    )
    assert unrelated.status_code == 404
    assert unrelated.json()["error"]["code"] == "ARTIFACT_NOT_FOUND"

    # P2 CORS: cross-origin download exposes Content-Disposition for browser filename parsing
    dl_cors = client.get(
        sign_body["download_path"],
        headers={**headers_a, "Origin": "http://localhost:3000"},
    )
    assert dl_cors.status_code == 200
    assert dl_cors.headers.get("access-control-allow-origin") == "http://localhost:3000"
    exposed = dl_cors.headers.get("access-control-expose-headers", "")
    assert "Content-Disposition" in exposed
    assert "attachment" in dl_cors.headers.get("content-disposition", "")

