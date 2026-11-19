from __future__ import annotations

from app.audio.decoding import FFmpegAudioDecoder
from app.audio.preservation import DefaultAudioIngestionService
from app.core.config import Settings
from app.jobs.queue import ArqRedisQueueBackend, InProcessQueueBackend, JobQueueBackend
from app.jobs.repository import InMemoryJobRepository, JobRepository, SupabaseJobRepository
from app.processing.accompaniment import AccompanimentOrchestrator
from app.processing.analysis import LibrosaMusicalAnalyzer
from app.processing.arranger import SonoraAccompanimentArranger
from app.processing.exporter import AudioFormatExporter
from app.processing.instruments import InstrumentResourceManager
from app.processing.mastering import LoudnessMasterProcessor
from app.processing.midi import MidoMIDIBuilder
from app.processing.mixing import SonoraAudioMixerAndMaster
from app.processing.pipeline import ProcessingPipeline
from app.processing.pitch import LibrosaPyinPitchExtractor
from app.processing.registry import ProcessingEngineRegistry
from app.processing.synthesis import FluidSynthRenderer
from app.storage.base import StorageAdapter
from app.storage.local_storage import LocalFilesystemStorageAdapter
from app.storage.supabase_storage import SupabaseStorageAdapter


def build_storage(settings: Settings) -> StorageAdapter:
    if settings.music_engine_storage_backend == "supabase":
        return SupabaseStorageAdapter(settings)
    return LocalFilesystemStorageAdapter(settings.local_storage_path)


def build_repository(settings: Settings) -> JobRepository:
    if settings.music_engine_job_repository_backend == "supabase":
        return SupabaseJobRepository(settings)
    return InMemoryJobRepository()


def build_registry(settings: Settings, storage: StorageAdapter) -> ProcessingEngineRegistry:
    ingestion = DefaultAudioIngestionService(settings, storage)
    decoder = FFmpegAudioDecoder(settings)
    analysis = LibrosaMusicalAnalyzer()
    pitch = LibrosaPyinPitchExtractor()
    instruments = InstrumentResourceManager(settings)
    arranger = SonoraAccompanimentArranger(instruments)
    midi = MidoMIDIBuilder()
    playback = FluidSynthRenderer(settings, instruments)
    mixer = SonoraAudioMixerAndMaster(
        settings=settings,
        master_processor=LoudnessMasterProcessor(),
        exporter=AudioFormatExporter(settings),
    )
    accompaniment = AccompanimentOrchestrator(
        settings=settings,
        storage=storage,
        analysis=analysis,
        pitch=pitch,
        instruments=instruments,
        arranger=arranger,
        midi=midi,
        renderer=playback,
        mixer=mixer,
    )
    return ProcessingEngineRegistry(
        settings=settings,
        ingestion=ingestion,
        decoder=decoder,
        analysis=analysis,
        pitch=pitch,
        midi=midi,
        playback=playback,
        mixing=mixer,
        instruments=instruments,
        accompaniment=accompaniment,
    )


def build_pipeline(settings: Settings, registry: ProcessingEngineRegistry) -> ProcessingPipeline:
    return ProcessingPipeline(settings=settings, registry=registry)


def build_queue_backend(settings: Settings) -> JobQueueBackend:
    if settings.music_engine_queue_backend == "arq":
        return ArqRedisQueueBackend(settings)
    return InProcessQueueBackend()
