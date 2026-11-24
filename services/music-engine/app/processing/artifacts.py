from __future__ import annotations

from dataclasses import dataclass

from app.core.errors import MusicEngineError
from app.core.logging import get_logger
from app.storage.base import StorageAdapter, UserStoragePathGuard

logger = get_logger("artifacts")


@dataclass(frozen=True, slots=True)
class ArtifactCleanupSummary:
    attempted: int
    deleted: int
    already_missing: int
    failed: int
    skipped_unsafe: int


class JobArtifactTracker:
    """
    Tracks storage objects uploaded during a single processing job execution and performs
    strictly scoped, idempotent best-effort cleanup if the job fails, is cancelled, or
    cannot persist its terminal completed database state.

    Safety invariants:
      - Only deletes objects matching `allowed_bucket` AND `{user_id}/jobs/{job_id}/...`.
      - Never deletes the original uploaded vocal recording (`source_object_path`),
        anything under `{user_id}/uploads/...`, or objects belonging to another job/user.
      - Cleanup failures are logged cleanly without masking the primary job failure.
      - Repeated cleanup invocations skip objects already deleted/confirmed absent.
    """

    def __init__(
        self,
        *,
        user_id: str,
        job_id: str,
        allowed_bucket: str,
        source_object_path: str | None = None,
    ) -> None:
        self._user_id = user_id.strip()
        self._job_id = job_id.strip()
        self._allowed_bucket = allowed_bucket.strip()
        self._source_object_path = (source_object_path or "").strip()
        self._job_prefix = f"{self._user_id}/jobs/{self._job_id}/"
        self._upload_prefix = f"{self._user_id}/uploads/"
        self._recorded: list[tuple[str, str]] = []
        self._recorded_set: set[tuple[str, str]] = set()
        self._cleaned_set: set[tuple[str, str]] = set()

    @property
    def tracked_objects(self) -> tuple[tuple[str, str], ...]:
        return tuple(self._recorded)

    def record_upload(self, bucket: str, object_path: str) -> None:
        entry = (bucket.strip(), object_path.strip())
        if entry not in self._recorded_set:
            self._recorded_set.add(entry)
            self._recorded.append(entry)

    def validate_deletable_artifact(self, bucket: str, object_path: str) -> str | None:
        """
        Returns the normalized object_path if and only if `(bucket, object_path)` is a
        generated artifact owned by `(self._user_id, self._job_id)` and is NOT the
        original uploaded vocal recording or under `{user_id}/uploads/`.
        """
        clean_bucket = bucket.strip()
        if clean_bucket != self._allowed_bucket:
            return None

        try:
            normalized = UserStoragePathGuard.normalize_and_verify(
                user_id=self._user_id,
                bucket=clean_bucket,
                object_path=object_path,
                allowed_bucket=self._allowed_bucket,
            )
        except MusicEngineError:
            return None

        if not normalized.startswith(self._job_prefix):
            return None
        if normalized.startswith(self._upload_prefix):
            return None
        if self._source_object_path and normalized == self._source_object_path:
            return None
        # Must include at least a filename after `{user_id}/jobs/{job_id}/`
        if len(normalized) <= len(self._job_prefix):
            return None
        return normalized

    async def cleanup(
        self,
        storage: StorageAdapter | None,
        *,
        reason: str,
        correlation_id: str | None = None,
    ) -> ArtifactCleanupSummary:
        if storage is None or not self._recorded:
            return ArtifactCleanupSummary(
                attempted=0,
                deleted=0,
                already_missing=0,
                failed=0,
                skipped_unsafe=0,
            )

        attempted = 0
        deleted = 0
        already_missing = 0
        failed = 0
        skipped_unsafe = 0

        for bucket, object_path in reversed(self._recorded):
            entry = (bucket, object_path)
            if entry in self._cleaned_set:
                continue

            normalized = self.validate_deletable_artifact(bucket, object_path)
            if normalized is None:
                skipped_unsafe += 1
                self._cleaned_set.add(entry)
                logger.warning(
                    "Skipped unsafe or out-of-scope storage path during generated-artifact cleanup",
                    extra={
                        "job_id": self._job_id,
                        "user_id": self._user_id,
                        "object_path": object_path,
                        "reason": reason,
                        "correlation_id": correlation_id,
                    },
                )
                continue

            attempted += 1
            try:
                removed = await storage.delete_object(bucket, normalized)
                self._cleaned_set.add(entry)
                if removed:
                    deleted += 1
                else:
                    already_missing += 1
            except Exception as exc:
                failed += 1
                logger.error(
                    "Failed to delete generated job artifact during cleanup (%s)",
                    type(exc).__name__,
                    extra={
                        "job_id": self._job_id,
                        "user_id": self._user_id,
                        "object_path": normalized,
                        "reason": reason,
                        "error_type": type(exc).__name__,
                        "correlation_id": correlation_id,
                    },
                )

        if attempted > 0 or skipped_unsafe > 0:
            logger.info(
                "Completed generated-artifact cleanup (reason=%s, attempted=%s, deleted=%s, missing=%s, failed=%s, skipped_unsafe=%s)",
                reason,
                attempted,
                deleted,
                already_missing,
                failed,
                skipped_unsafe,
                extra={
                    "job_id": self._job_id,
                    "user_id": self._user_id,
                    "reason": reason,
                    "correlation_id": correlation_id,
                },
            )

        return ArtifactCleanupSummary(
            attempted=attempted,
            deleted=deleted,
            already_missing=already_missing,
            failed=failed,
            skipped_unsafe=skipped_unsafe,
        )
