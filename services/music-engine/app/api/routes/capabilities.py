from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.dependencies import get_app_settings, get_processing_registry
from app.core.config import Settings
from app.processing.instruments import InstrumentDiagnostics, InstrumentResourceManager
from app.processing.registry import ProcessingEngineRegistry
from app.schemas.capabilities import EngineCapabilitiesResponse

router = APIRouter(prefix="/api/v1", tags=["Capabilities"])


@router.get(
    "/capabilities",
    response_model=EngineCapabilitiesResponse,
    summary="List supported audio formats, limits, job types, and model readiness",
)
async def get_capabilities(
    registry: ProcessingEngineRegistry = Depends(get_processing_registry),
) -> EngineCapabilitiesResponse:
    return registry.describe_capabilities()


@router.get(
    "/instruments",
    response_model=InstrumentDiagnostics,
    summary="Inspect supported GM instrument families, FluidSynth readiness, and verified SoundFont status",
)
async def get_instrument_diagnostics(
    settings: Settings = Depends(get_app_settings),
    registry: ProcessingEngineRegistry = Depends(get_processing_registry),
) -> InstrumentDiagnostics:
    manager = registry.instruments or InstrumentResourceManager(settings)
    return manager.get_diagnostics()
