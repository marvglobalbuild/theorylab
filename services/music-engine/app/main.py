from __future__ import annotations

import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes import audio, capabilities, health, jobs
from app.core.config import Settings, get_settings
from app.core.errors import MusicEngineError
from app.core.logging import configure_logging, get_logger
from app.core.runtime import (
    build_asset_repository,
    build_pipeline,
    build_queue_backend,
    build_registry,
    build_repository,
    build_storage,
)
from app.jobs.assets import AudioAssetRepository
from app.jobs.manager import AsyncJobManager
from app.jobs.queue import JobQueueBackend
from app.jobs.repository import JobRepository
from app.processing.registry import ProcessingEngineRegistry
from app.schemas.common import ErrorDetail, ErrorEnvelope
from app.security.auth import SupabaseAuthVerifier
from app.storage.base import StorageAdapter

logger = get_logger("main")


def create_app(
    settings: Settings | None = None,
    storage: StorageAdapter | None = None,
    repository: JobRepository | None = None,
    asset_repository: AudioAssetRepository | None = None,
    auth_verifier: SupabaseAuthVerifier | None = None,
    registry: ProcessingEngineRegistry | None = None,
    queue: JobQueueBackend | None = None,
) -> FastAPI:
    resolved_settings = settings or get_settings()
    configure_logging(resolved_settings.music_engine_log_level)

    resolved_storage = storage or build_storage(resolved_settings)
    resolved_repo = repository or build_repository(resolved_settings)
    resolved_asset_repo = asset_repository or build_asset_repository(resolved_settings)
    resolved_auth = auth_verifier or SupabaseAuthVerifier(resolved_settings)
    resolved_registry = registry or build_registry(resolved_settings, resolved_storage)
    pipeline = build_pipeline(resolved_settings, resolved_registry)
    resolved_queue = queue or build_queue_backend(resolved_settings)

    job_manager = AsyncJobManager(
        settings=resolved_settings,
        repository=resolved_repo,
        storage=resolved_storage,
        pipeline=pipeline,
        queue=resolved_queue,
        asset_repository=resolved_asset_repo,
    )

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        resolved_settings.temp_path.mkdir(parents=True, exist_ok=True)
        application.state.started_monotonic = time.monotonic()
        logger.info(
            "Started SONORA Music Intelligence Engine (queue_backend=%s)",
            job_manager.queue_backend_name,
            extra={
                "status": "started",
                "queue_backend": job_manager.queue_backend_name,
            },
        )
        try:
            yield
        finally:
            await job_manager.shutdown()
            logger.info(
                "Stopped SONORA Music Intelligence Engine",
                extra={
                    "status": "stopped",
                    "queue_backend": job_manager.queue_backend_name,
                },
            )

    app = FastAPI(
        title="SONORA Music Intelligence Engine",
        version=resolved_settings.service_version,
        description=(
            "SONORA Music Intelligence Engine API service. "
            "Handles authenticated audio ingestion, format/integrity validation, "
            "non-destructive decoding, and durable asynchronous job orchestration."
        ),
        lifespan=lifespan,
    )

    app.state.settings = resolved_settings
    app.state.storage = resolved_storage
    app.state.repository = resolved_repo
    app.state.asset_repository = resolved_asset_repo
    app.state.auth_verifier = resolved_auth
    app.state.registry = resolved_registry
    app.state.queue = resolved_queue
    app.state.job_manager = job_manager
    app.state.started_monotonic = time.monotonic()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=resolved_settings.cors_origins_list,
        allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|0\.0\.0\.0)(:\d+)?$",
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
        allow_private_network=True,
        expose_headers=[
            "Content-Disposition",
            "Content-Range",
            "Accept-Ranges",
            "Content-Length",
            "Content-Type",
            "X-Request-ID",
        ],
    )

    @app.middleware("http")
    async def attach_request_id(request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

    @app.exception_handler(MusicEngineError)
    async def handle_music_engine_error(request: Request, exc: MusicEngineError) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        envelope = ErrorEnvelope(
            error=ErrorDetail(
                code=exc.code,
                message=exc.message,
                retryable=exc.retryable,
                details=exc.details,
            ),
            request_id=request_id,
        )
        return JSONResponse(status_code=exc.status_code, content=envelope.model_dump(mode="json"))

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        envelope = ErrorEnvelope(
            error=ErrorDetail(
                code="REQUEST_VALIDATION_ERROR",
                message="Request payload failed schema validation.",
                retryable=False,
                details={"errors": jsonable_encoder(exc.errors())},
            ),
            request_id=request_id,
        )
        return JSONResponse(
            status_code=422,
            content=envelope.model_dump(mode="json"),
        )

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        detail_str = str(exc.detail) if exc.detail else "HTTP request error."
        logger.warning(
            "HTTP exception occurred: %s (status=%d)",
            detail_str,
            exc.status_code,
            extra={"request_id": request_id, "status_code": exc.status_code, "detail": exc.detail},
        )
        code = f"HTTP_{exc.status_code}"
        message = detail_str
        if exc.status_code == 400 and "boundary" in detail_str.lower():
            code = "MALFORMED_MULTIPART_UPLOAD"
            message = (
                "The media upload request was rejected because the multipart form boundary was missing or invalid. "
                "Please verify your file and try re-uploading."
            )
        elif exc.status_code == 400:
            code = "BAD_REQUEST"
            message = detail_str

        envelope = ErrorEnvelope(
            error=ErrorDetail(
                code=code,
                message=message,
                retryable=False,
                details={"detail": exc.detail},
            ),
            request_id=request_id,
        )
        return JSONResponse(status_code=exc.status_code, content=envelope.model_dump(mode="json"))

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        logger.exception("Unhandled HTTP exception", extra={"request_id": request_id})
        envelope = ErrorEnvelope(
            error=ErrorDetail(
                code="INTERNAL_SERVER_ERROR",
                message="An unexpected internal server error occurred.",
                retryable=True,
                details={"exception_type": type(exc).__name__},
            ),
            request_id=request_id,
        )
        return JSONResponse(
            status_code=500,
            content=envelope.model_dump(mode="json"),
        )

    app.include_router(health.router)
    app.include_router(capabilities.router)
    app.include_router(jobs.router)
    app.include_router(audio.router)

    return app


app = create_app()
