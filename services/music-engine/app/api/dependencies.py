from __future__ import annotations

from fastapi import Depends, Header, Request

from app.core.config import Settings
from app.jobs.manager import AsyncJobManager
from app.processing.registry import ProcessingEngineRegistry
from app.security.auth import AuthenticatedUser, SupabaseAuthVerifier
from app.storage.base import StorageAdapter


def get_app_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_job_manager(request: Request) -> AsyncJobManager:
    return request.app.state.job_manager


def get_processing_registry(request: Request) -> ProcessingEngineRegistry:
    return request.app.state.registry


def get_storage_adapter(request: Request) -> StorageAdapter:
    return request.app.state.storage


def get_auth_verifier(request: Request) -> SupabaseAuthVerifier:
    return request.app.state.auth_verifier


async def get_current_user(
    authorization: str | None = Header(default=None),
    verifier: SupabaseAuthVerifier = Depends(get_auth_verifier),
) -> AuthenticatedUser:
    return await verifier.verify_bearer_token(authorization)
