from __future__ import annotations

import uuid
from pathlib import Path
from urllib.parse import quote

from fastapi import APIRouter, Depends, Query, Request, status
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from app.api.dependencies import (
    get_app_settings,
    get_current_user,
    get_job_manager,
    get_storage_adapter,
)
from app.audio.preservation import cleanup_workspace
from app.core.config import Settings
from app.core.errors import AccessDeniedError, ResourceNotFoundError
from app.jobs.manager import AsyncJobManager
from app.schemas.jobs import (
    ArtifactSignedUrlRequest,
    ArtifactSignedUrlResponse,
    JobCancelRequest,
    JobCancelResponse,
    JobCreateRequest,
    JobResponse,
)
from app.security.auth import AuthenticatedUser
from app.storage.base import StorageAdapter, UserStoragePathGuard

router = APIRouter(prefix="/api/v1/jobs", tags=["Jobs"])


def _resolve_authorized_job_object(
    job: JobResponse,
    user: AuthenticatedUser,
    object_path: str,
    settings: Settings,
) -> tuple[str, str, str, str]:
    """
    Strictly verify that:
      1. `object_path` belongs to `user.id` inside the allowed private bucket.
      2. `object_path` is either one of `job.artifacts` or `job.source_audio.object_path`.
    Returns `(bucket, normalized_object_path, mime_type, filename)`.
    """
    bucket = settings.supabase_audio_bucket
    normalized = UserStoragePathGuard.normalize_and_verify(
        user_id=user.id,
        bucket=bucket,
        object_path=object_path,
        allowed_bucket=bucket,
    )

    for artifact in job.artifacts:
        if artifact.object_path == normalized:
            art_bucket = artifact.bucket or bucket
            UserStoragePathGuard.normalize_and_verify(
                user_id=user.id,
                bucket=art_bucket,
                object_path=artifact.object_path,
                allowed_bucket=bucket,
            )
            return art_bucket, normalized, artifact.mime_type, Path(normalized).name

    if job.source_audio.object_path == normalized:
        src_bucket = job.source_audio.bucket or bucket
        UserStoragePathGuard.normalize_and_verify(
            user_id=user.id,
            bucket=src_bucket,
            object_path=job.source_audio.object_path,
            allowed_bucket=bucket,
        )
        mime = (
            job.audio_metadata.mime_type
            if job.audio_metadata is not None
            else (job.source_audio.declared_mime_type or "application/octet-stream")
        )
        filename = job.source_audio.original_filename or Path(normalized).name
        return src_bucket, normalized, mime, filename

    raise ResourceNotFoundError(
        "The requested artifact does not belong to this processing job.",
        code="ARTIFACT_NOT_FOUND",
    )


@router.post(
    "",
    response_model=JobResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Create and queue an asynchronous music processing job",
)
async def create_job(
    request: Request,
    payload: JobCreateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    job_manager: AsyncJobManager = Depends(get_job_manager),
) -> JobResponse:
    correlation_id = getattr(request.state, "request_id", None)
    return await job_manager.create_job(
        current_user,
        payload,
        correlation_id=correlation_id,
    )


@router.get(
    "",
    response_model=list[JobResponse],
    summary="List processing jobs owned by the authenticated user",
)
async def list_jobs(
    limit: int = Query(default=25, ge=1, le=100),
    current_user: AuthenticatedUser = Depends(get_current_user),
    job_manager: AsyncJobManager = Depends(get_job_manager),
) -> list[JobResponse]:
    return await job_manager.list_jobs(current_user, limit=limit)


@router.get(
    "/{job_id}",
    response_model=JobResponse,
    summary="Get processing job status, metadata, artifacts, or structured error",
)
async def get_job(
    job_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    job_manager: AsyncJobManager = Depends(get_job_manager),
) -> JobResponse:
    return await job_manager.get_job(job_id, current_user)


@router.post(
    "/{job_id}/cancel",
    response_model=JobCancelResponse,
    summary="Cancel a queued or processing music job",
)
async def cancel_job(
    job_id: str,
    request: Request,
    payload: JobCancelRequest | None = None,
    current_user: AuthenticatedUser = Depends(get_current_user),
    job_manager: AsyncJobManager = Depends(get_job_manager),
) -> JobCancelResponse:
    correlation_id = getattr(request.state, "request_id", None)
    return await job_manager.cancel_job(
        job_id=job_id,
        user=current_user,
        reason=payload.reason if payload else None,
        correlation_id=correlation_id,
    )


@router.post(
    "/{job_id}/artifacts/signed-url",
    response_model=ArtifactSignedUrlResponse,
    summary="Issue a short-lived authorized access URL for a private artifact owned by the authenticated user",
)
async def create_artifact_signed_url(
    job_id: str,
    payload: ArtifactSignedUrlRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    job_manager: AsyncJobManager = Depends(get_job_manager),
    storage: StorageAdapter = Depends(get_storage_adapter),
    settings: Settings = Depends(get_app_settings),
) -> ArtifactSignedUrlResponse:
    job = await job_manager.get_job(job_id, current_user)
    if job.user_id != current_user.id:
        raise AccessDeniedError(
            "You do not have permission to access another user's artifacts.",
            code="JOB_ACCESS_DENIED",
        )

    bucket, normalized, mime_type, filename = _resolve_authorized_job_object(
        job=job,
        user=current_user,
        object_path=payload.object_path,
        settings=settings,
    )
    download_path = f"/api/v1/jobs/{quote(job_id, safe='')}/artifacts/download?object_path={quote(normalized, safe='')}"

    if settings.music_engine_storage_backend == "supabase":
        signed_url = await storage.create_signed_url(
            bucket=bucket,
            object_path=normalized,
            expires_in_seconds=payload.expires_in_seconds,
        )
        return ArtifactSignedUrlResponse(
            job_id=job_id,
            object_path=normalized,
            mime_type=mime_type,
            filename=filename,
            storage_backend="supabase",
            access_mode="signed_url",
            signed_url=signed_url,
            download_path=download_path,
            expires_in_seconds=payload.expires_in_seconds,
        )

    # Local storage verifies object existence and serves strictly through the Bearer-authenticated download endpoint
    await storage.head_object(bucket, normalized)
    return ArtifactSignedUrlResponse(
        job_id=job_id,
        object_path=normalized,
        mime_type=mime_type,
        filename=filename,
        storage_backend=settings.music_engine_storage_backend,
        access_mode="authenticated_stream",
        signed_url=None,
        download_path=download_path,
        expires_in_seconds=payload.expires_in_seconds,
    )


@router.get(
    "/{job_id}/artifacts/download",
    summary="Stream an authorized private job artifact or source recording for the authenticated owner",
)
async def download_job_artifact(
    job_id: str,
    object_path: str = Query(..., min_length=3, max_length=512),
    current_user: AuthenticatedUser = Depends(get_current_user),
    job_manager: AsyncJobManager = Depends(get_job_manager),
    storage: StorageAdapter = Depends(get_storage_adapter),
    settings: Settings = Depends(get_app_settings),
) -> FileResponse:
    job = await job_manager.get_job(job_id, current_user)
    if job.user_id != current_user.id:
        raise AccessDeniedError(
            "You do not have permission to download another user's artifacts.",
            code="JOB_ACCESS_DENIED",
        )

    bucket, normalized, mime_type, filename = _resolve_authorized_job_object(
        job=job,
        user=current_user,
        object_path=object_path,
        settings=settings,
    )

    workspace_dir = settings.temp_path / f"dl-{current_user.id}-{uuid.uuid4()}"
    workspace_dir.mkdir(parents=True, exist_ok=True)
    target_path = workspace_dir / Path(filename).name

    try:
        await storage.download_to_path(bucket, normalized, target_path)
    except Exception:
        cleanup_workspace(workspace_dir)
        raise

    return FileResponse(
        path=target_path,
        media_type=mime_type,
        filename=filename,
        background=BackgroundTask(cleanup_workspace, workspace_dir),
    )

