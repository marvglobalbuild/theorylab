from __future__ import annotations

import asyncio
from pathlib import Path
import uuid
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any
from urllib.parse import quote

import httpx

from app.core.config import Settings
from app.core.errors import StorageIntegrationError
from app.schemas.jobs import JobResponse, JobStatus, TERMINAL_JOB_STATUSES


def _parse_optional_uuid(value: str | None) -> str | None:
    if not value:
        return None
    try:
        return str(uuid.UUID(value.strip()))
    except (ValueError, AttributeError):
        return None


class JobRepository(ABC):
    """Persistence contract for music processing job metadata (never stores raw audio binaries)."""

    @abstractmethod
    async def create(self, job: JobResponse, idempotency_key: str | None = None) -> JobResponse:
        pass

    @abstractmethod
    async def get_by_id(self, job_id: str) -> JobResponse | None:
        pass

    @abstractmethod
    async def list_by_user(self, user_id: str, limit: int = 50) -> list[JobResponse]:
        pass

    @abstractmethod
    async def find_by_idempotency_key(self, user_id: str, idempotency_key: str) -> JobResponse | None:
        pass

    @abstractmethod
    async def update(self, job: JobResponse) -> JobResponse:
        pass

    @abstractmethod
    async def count_active_by_user(self, user_id: str) -> int:
        pass

    @abstractmethod
    async def update_if_status(
        self,
        job: JobResponse,
        expected_status: JobStatus,
    ) -> JobResponse | None:
        """
        Conditionally updates `job` ONLY if its persisted status still equals `expected_status`.
        Returns the updated JobResponse if the conditional write matched, or None if another
        worker/API request already transitioned the job to a different status.
        """
        pass

    @abstractmethod
    async def list_stale_processing_jobs(
        self,
        older_than: datetime,
        limit: int = 50,
    ) -> list[JobResponse]:
        """Returns jobs stuck in `processing` with updated_at earlier than `older_than`."""
        pass

    @abstractmethod
    async def list_stale_queued_jobs(
        self,
        older_than: datetime,
        limit: int = 50,
    ) -> list[JobResponse]:
        """Returns jobs stuck in `queued` with updated_at earlier than `older_than`."""
        pass


class InMemoryJobRepository(JobRepository):
    """Thread/task-safe in-memory job repository with local disk rehydration for standalone execution and testing."""

    def __init__(self, storage_dir: Path | None = None) -> None:
        self._lock = asyncio.Lock()
        self._jobs: dict[str, JobResponse] = {}
        self._idempotency: dict[tuple[str, str], str] = {}
        self._storage_dir = Path(storage_dir).resolve() if storage_dir is not None else None
        if self._storage_dir and self._storage_dir.is_dir():
            self._preload_from_disk()

    def _preload_from_disk(self) -> None:
        if not self._storage_dir:
            return
        for job_file in self._storage_dir.glob("*/jobs/*/job.json"):
            try:
                job = JobResponse.model_validate_json(job_file.read_text(encoding="utf-8"))
                self._jobs[job.job_id] = job
            except Exception:
                continue

    def _persist_to_disk(self, job: JobResponse) -> None:
        if not self._storage_dir:
            return
        try:
            target_dir = self._storage_dir / job.user_id / "jobs" / job.job_id
            target_dir.mkdir(parents=True, exist_ok=True)
            job_file = target_dir / "job.json"
            job_file.write_text(job.model_dump_json(indent=2), encoding="utf-8")
        except Exception:
            pass

    async def create(self, job: JobResponse, idempotency_key: str | None = None) -> JobResponse:
        async with self._lock:
            self._jobs[job.job_id] = job
            if idempotency_key:
                self._idempotency[(job.user_id, idempotency_key)] = job.job_id
            self._persist_to_disk(job)
            return job

    async def get_by_id(self, job_id: str) -> JobResponse | None:
        async with self._lock:
            if job_id in self._jobs:
                return self._jobs[job_id]
            if self._storage_dir:
                for candidate in self._storage_dir.glob(f"*/jobs/{job_id}/job.json"):
                    try:
                        job = JobResponse.model_validate_json(candidate.read_text(encoding="utf-8"))
                        self._jobs[job.job_id] = job
                        return job
                    except Exception:
                        pass
            return None

    async def list_by_user(self, user_id: str, limit: int = 50) -> list[JobResponse]:
        async with self._lock:
            if self._storage_dir:
                user_jobs_dir = self._storage_dir / user_id / "jobs"
                if user_jobs_dir.is_dir():
                    for candidate in user_jobs_dir.glob("*/job.json"):
                        if candidate.parent.name not in self._jobs:
                            try:
                                job = JobResponse.model_validate_json(candidate.read_text(encoding="utf-8"))
                                self._jobs[job.job_id] = job
                            except Exception:
                                pass
            owned = [j for j in self._jobs.values() if j.user_id == user_id]
            owned.sort(key=lambda j: j.created_at, reverse=True)
            return owned[:limit]

    async def find_by_idempotency_key(self, user_id: str, idempotency_key: str) -> JobResponse | None:
        async with self._lock:
            job_id = self._idempotency.get((user_id, idempotency_key))
            if not job_id:
                return None
            return self._jobs.get(job_id)

    async def register_idempotency_key(self, user_id: str, idempotency_key: str, job_id: str) -> None:
        async with self._lock:
            self._idempotency[(user_id, idempotency_key)] = job_id

    async def update(self, job: JobResponse) -> JobResponse:
        async with self._lock:
            self._jobs[job.job_id] = job
            self._persist_to_disk(job)
            return job

    async def count_active_by_user(self, user_id: str) -> int:
        async with self._lock:
            return sum(
                1
                for j in self._jobs.values()
                if j.user_id == user_id and j.status not in TERMINAL_JOB_STATUSES
            )

    async def update_if_status(
        self,
        job: JobResponse,
        expected_status: JobStatus,
    ) -> JobResponse | None:
        async with self._lock:
            existing = self._jobs.get(job.job_id)
            if existing is None or existing.status != expected_status:
                return None
            self._jobs[job.job_id] = job
            self._persist_to_disk(job)
            return job

    async def list_stale_processing_jobs(
        self,
        older_than: datetime,
        limit: int = 50,
    ) -> list[JobResponse]:
        async with self._lock:
            stale = [
                j
                for j in self._jobs.values()
                if j.status == JobStatus.PROCESSING and j.updated_at < older_than
            ]
            stale.sort(key=lambda j: j.updated_at)
            return stale[:limit]

    async def list_stale_queued_jobs(
        self,
        older_than: datetime,
        limit: int = 50,
    ) -> list[JobResponse]:
        async with self._lock:
            stale = [
                j
                for j in self._jobs.values()
                if j.status == JobStatus.QUEUED and j.updated_at < older_than
            ]
            stale.sort(key=lambda j: j.updated_at)
            return stale[:limit]


class SupabaseJobRepository(JobRepository):
    """
    PostgREST repository persisting job metadata & storage file references into Supabase Postgres.
    Requires `supabase/migrations/0002_music_intelligence_storage_and_jobs.sql` to be applied.
    """

    def __init__(self, settings: Settings, http_client: httpx.AsyncClient | None = None) -> None:
        self._base_url = settings.supabase_url.strip().rstrip("/")
        self._service_key = settings.supabase_service_role_key.strip()
        self._table = settings.supabase_jobs_table.strip() or "processing_jobs"
        self._http_client = http_client

    def _ensure_configured(self) -> None:
        if not self._base_url or not self._service_key:
            raise StorageIntegrationError(
                "Supabase job persistence requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
                code="DATABASE_NOT_CONFIGURED",
                status_code=503,
                retryable=False,
            )

    def _headers(self, extra: dict[str, str] | None = None) -> dict[str, str]:
        headers = {
            "apikey": self._service_key,
            "Authorization": f"Bearer {self._service_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        if extra:
            headers.update(extra)
        return headers

    @staticmethod
    def _serialize(
        job: JobResponse,
        idempotency_key: str | None = None,
        *,
        for_update: bool = False,
    ) -> dict[str, Any]:
        mutable_fields: dict[str, Any] = {
            "audio_asset_id": _parse_optional_uuid(job.source_audio.asset_id),
            "status": job.status.value,
            "progress_percent": job.progress_percent,
            "stage": job.stage,
            "source_audio": job.source_audio.model_dump(mode="json"),
            "trim_window": job.trim_window.model_dump(mode="json") if job.trim_window else None,
            "parameters": job.parameters,
            "studio_context": job.studio_context,
            "audio_metadata": job.audio_metadata.model_dump(mode="json") if job.audio_metadata else None,
            "artifacts": [a.model_dump(mode="json") for a in job.artifacts],
            "result": job.result,
            "error": job.error.model_dump(mode="json") if job.error else None,
            "updated_at": job.updated_at.isoformat(),
            "started_at": job.started_at.isoformat() if job.started_at else None,
            "completed_at": job.completed_at.isoformat() if job.completed_at else None,
            "cancelled_at": job.cancelled_at.isoformat() if job.cancelled_at else None,
        }
        if for_update:
            return mutable_fields

        payload: dict[str, Any] = {
            "id": job.job_id,
            "user_id": job.user_id,
            "job_type": job.job_type.value,
            "created_at": job.created_at.isoformat(),
            **mutable_fields,
        }
        if idempotency_key is not None:
            payload["idempotency_key"] = idempotency_key
        return payload

    @staticmethod
    def _deserialize(row: dict[str, Any]) -> JobResponse:
        normalized = {**row, "job_id": row.get("job_id") or row["id"]}
        return JobResponse.model_validate(normalized)

    async def _request(self, method: str, path: str, json_body: Any = None) -> httpx.Response:
        self._ensure_configured()
        url = f"{self._base_url}/rest/v1/{path}"
        try:
            if self._http_client is not None:
                return await self._http_client.request(
                    method, url, headers=self._headers(), json=json_body, timeout=10.0
                )
            async with httpx.AsyncClient(timeout=10.0) as client:
                return await client.request(
                    method, url, headers=self._headers(), json=json_body
                )
        except httpx.HTTPError as exc:
            raise StorageIntegrationError(
                f"Failed to contact Supabase database: {exc}",
                code="DATABASE_UNREACHABLE",
            ) from exc

    async def create(self, job: JobResponse, idempotency_key: str | None = None) -> JobResponse:
        res = await self._request(
            "POST",
            self._table,
            json_body=self._serialize(job, idempotency_key=idempotency_key),
        )
        if res.status_code == 409 and idempotency_key:
            existing = await self.find_by_idempotency_key(job.user_id, idempotency_key)
            if existing is not None:
                return existing
        if res.status_code >= 400:
            raise StorageIntegrationError(
                f"Supabase job insert failed with HTTP {res.status_code}.",
                code="DATABASE_WRITE_FAILED",
                details={"response": res.text[:300]},
            )
        rows = res.json()
        return self._deserialize(rows[0] if isinstance(rows, list) and rows else rows)

    async def get_by_id(self, job_id: str) -> JobResponse | None:
        encoded_id = quote(job_id, safe="")
        res = await self._request("GET", f"{self._table}?id=eq.{encoded_id}&limit=1")
        if res.status_code >= 400:
            raise StorageIntegrationError(
                f"Supabase job query failed with HTTP {res.status_code}.",
                code="DATABASE_READ_FAILED",
            )
        rows = res.json()
        if not rows:
            return None
        return self._deserialize(rows[0])

    async def list_by_user(self, user_id: str, limit: int = 50) -> list[JobResponse]:
        encoded_uid = quote(user_id, safe="")
        res = await self._request(
            "GET",
            f"{self._table}?user_id=eq.{encoded_uid}&order=created_at.desc&limit={limit}",
        )
        if res.status_code >= 400:
            raise StorageIntegrationError(
                f"Supabase job list failed with HTTP {res.status_code}.",
                code="DATABASE_READ_FAILED",
            )
        rows = res.json()
        return [self._deserialize(r) for r in rows] if isinstance(rows, list) else []

    async def find_by_idempotency_key(self, user_id: str, idempotency_key: str) -> JobResponse | None:
        encoded_uid = quote(user_id, safe="")
        encoded_key = quote(idempotency_key, safe="")
        res = await self._request(
            "GET",
            f"{self._table}?user_id=eq.{encoded_uid}&idempotency_key=eq.{encoded_key}&limit=1",
        )
        if res.status_code >= 400:
            return None
        rows = res.json()
        if not rows:
            return None
        return self._deserialize(rows[0])

    async def update(self, job: JobResponse) -> JobResponse:
        encoded_id = quote(job.job_id, safe="")
        encoded_uid = quote(job.user_id, safe="")
        res = await self._request(
            "PATCH",
            f"{self._table}?id=eq.{encoded_id}&user_id=eq.{encoded_uid}",
            json_body=self._serialize(job, for_update=True),
        )
        if res.status_code >= 400:
            raise StorageIntegrationError(
                f"Supabase job update failed with HTTP {res.status_code}.",
                code="DATABASE_WRITE_FAILED",
            )
        rows = res.json()
        if isinstance(rows, list) and rows:
            return self._deserialize(rows[0])
        return job

    async def count_active_by_user(self, user_id: str) -> int:
        active_statuses = ",".join([JobStatus.QUEUED.value, JobStatus.PROCESSING.value])
        res = await self._request(
            "GET",
            f"{self._table}?user_id=eq.{user_id}&status=in.({active_statuses})&select=id",
        )
        if res.status_code >= 400:
            return 0
        rows = res.json()
        return len(rows) if isinstance(rows, list) else 0

    async def update_if_status(
        self,
        job: JobResponse,
        expected_status: JobStatus,
    ) -> JobResponse | None:
        encoded_id = quote(job.job_id, safe="")
        encoded_uid = quote(job.user_id, safe="")
        encoded_status = quote(expected_status.value, safe="")
        res = await self._request(
            "PATCH",
            f"{self._table}?id=eq.{encoded_id}&user_id=eq.{encoded_uid}&status=eq.{encoded_status}",
            json_body=self._serialize(job, for_update=True),
        )
        if res.status_code >= 400:
            raise StorageIntegrationError(
                f"Supabase conditional job update failed with HTTP {res.status_code}.",
                code="DATABASE_WRITE_FAILED",
            )
        rows = res.json()
        if isinstance(rows, list) and rows:
            return self._deserialize(rows[0])
        return None

    async def list_stale_processing_jobs(
        self,
        older_than: datetime,
        limit: int = 50,
    ) -> list[JobResponse]:
        cutoff = quote(older_than.isoformat(), safe="")
        res = await self._request(
            "GET",
            f"{self._table}?status=eq.{JobStatus.PROCESSING.value}&updated_at=lt.{cutoff}&order=updated_at.asc&limit={limit}",
        )
        if res.status_code >= 400:
            raise StorageIntegrationError(
                f"Supabase stale job query failed with HTTP {res.status_code}.",
                code="DATABASE_READ_FAILED",
            )
        rows = res.json()
        return [self._deserialize(r) for r in rows] if isinstance(rows, list) else []

    async def list_stale_queued_jobs(
        self,
        older_than: datetime,
        limit: int = 50,
    ) -> list[JobResponse]:
        cutoff = quote(older_than.isoformat(), safe="")
        res = await self._request(
            "GET",
            f"{self._table}?status=eq.{JobStatus.QUEUED.value}&updated_at=lt.{cutoff}&order=updated_at.asc&limit={limit}",
        )
        if res.status_code >= 400:
            raise StorageIntegrationError(
                f"Supabase stale queued job query failed with HTTP {res.status_code}.",
                code="DATABASE_READ_FAILED",
            )
        rows = res.json()
        return [self._deserialize(r) for r in rows] if isinstance(rows, list) else []
