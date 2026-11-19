from __future__ import annotations

from tests.conftest import USER_A_ID, USER_B_ID, make_jwt


def test_missing_and_invalid_tokens_are_rejected(client, user_a_wav_object):
    object_path, _ = user_a_wav_object
    payload = {
        "job_type": "audio_analysis",
        "source_audio": {
            "storage_backend": "local",
            "bucket": "sonora-audio",
            "object_path": object_path,
        },
    }

    # No header
    r1 = client.post("/api/v1/jobs", json=payload)
    assert r1.status_code == 401
    assert r1.json()["error"]["code"] == "MISSING_TOKEN"

    # Bad scheme
    r2 = client.post("/api/v1/jobs", json=payload, headers={"Authorization": "Basic abc"})
    assert r2.status_code == 401
    assert r2.json()["error"]["code"] == "INVALID_AUTH_HEADER"

    # Expired token
    expired = make_jwt(USER_A_ID, exp_offset_seconds=-30)
    r3 = client.post("/api/v1/jobs", json=payload, headers={"Authorization": f"Bearer {expired}"})
    assert r3.status_code == 401
    assert r3.json()["error"]["code"] == "TOKEN_EXPIRED"

    # Wrong signature
    forged = make_jwt(USER_A_ID, secret="wrong-secret-key-at-least-32-bytes")
    r4 = client.post("/api/v1/jobs", json=payload, headers={"Authorization": f"Bearer {forged}"})
    assert r4.status_code == 401
    assert r4.json()["error"]["code"] == "INVALID_TOKEN"


def test_user_cannot_process_another_users_file_or_disallowed_bucket(client, user_a_wav_object):
    user_a_path, _ = user_a_wav_object
    user_b_token = make_jwt(USER_B_ID, email="other@sonora.test")

    # Cross-user object_path access attempt
    r1 = client.post(
        "/api/v1/jobs",
        headers={"Authorization": f"Bearer {user_b_token}"},
        json={
            "job_type": "audio_analysis",
            "source_audio": {
                "storage_backend": "local",
                "bucket": "sonora-audio",
                "object_path": user_a_path,
            },
        },
    )
    assert r1.status_code == 403
    assert r1.json()["error"]["code"] == "STORAGE_ACCESS_DENIED"

    # Disallowed bucket access attempt
    user_a_token = make_jwt(USER_A_ID)
    r2 = client.post(
        "/api/v1/jobs",
        headers={"Authorization": f"Bearer {user_a_token}"},
        json={
            "job_type": "audio_analysis",
            "source_audio": {
                "storage_backend": "local",
                "bucket": "other-private-bucket",
                "object_path": user_a_path,
            },
        },
    )
    assert r2.status_code == 403
    assert r2.json()["error"]["code"] == "BUCKET_NOT_ALLOWED"


def test_path_traversal_attempts_are_rejected(client):
    token = make_jwt(USER_A_ID)
    for bad_path in [
        f"{USER_A_ID}/../{USER_B_ID}/secret.wav",
        f"/{USER_A_ID}/uploads/test.wav",
        f"{USER_A_ID}/uploads\\test.wav",
        f"{USER_A_ID}",
    ]:
        resp = client.post(
            "/api/v1/jobs",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "job_type": "audio_analysis",
                "source_audio": {
                    "storage_backend": "local",
                    "bucket": "sonora-audio",
                    "object_path": bad_path,
                },
            },
        )
        assert resp.status_code == 422
        assert resp.json()["error"]["code"] == "INVALID_STORAGE_PATH"


def test_user_cannot_view_or_cancel_another_users_job(client, user_a_wav_object):
    object_path, _ = user_a_wav_object
    user_a_token = make_jwt(USER_A_ID)
    user_b_token = make_jwt(USER_B_ID, email="other@sonora.test")

    created = client.post(
        "/api/v1/jobs",
        headers={"Authorization": f"Bearer {user_a_token}"},
        json={
            "job_type": "audio_analysis",
            "source_audio": {
                "storage_backend": "local",
                "bucket": "sonora-audio",
                "object_path": object_path,
            },
        },
    )
    assert created.status_code == 202
    job_id = created.json()["job_id"]

    # User B cannot read User A's job
    get_res = client.get(
        f"/api/v1/jobs/{job_id}",
        headers={"Authorization": f"Bearer {user_b_token}"},
    )
    assert get_res.status_code == 403
    assert get_res.json()["error"]["code"] == "JOB_ACCESS_DENIED"

    # User B cannot cancel User A's job
    cancel_res = client.post(
        f"/api/v1/jobs/{job_id}/cancel",
        headers={"Authorization": f"Bearer {user_b_token}"},
    )
    assert cancel_res.status_code == 403
    assert cancel_res.json()["error"]["code"] == "JOB_ACCESS_DENIED"

    # User B's job list does not expose User A's job
    list_res = client.get("/api/v1/jobs", headers={"Authorization": f"Bearer {user_b_token}"})
    assert list_res.status_code == 200
    assert list_res.json() == []
