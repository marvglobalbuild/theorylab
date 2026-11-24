from __future__ import annotations

from collections.abc import Awaitable, Callable
from pathlib import Path
from typing import Any

from app.audio.validation import FORMAT_MIME_TYPES
from app.core.config import Settings
from app.core.errors import ModelNotIntegratedError
from app.processing.accompaniment import AccompanimentOrchestrator
from app.processing.artifacts import JobArtifactTracker
from app.processing.instruments import InstrumentResourceManager
from app.processing.interfaces import (
    AudioAnalysisInterface,
    AudioDecodingInterface,
    AudioIngestionInterface,
    DecodedAudio,
    InstrumentPlaybackInterface,
    MIDIProcessingInterface,
    MusicXMLGenerationInterface,
    MixingAndRenderingInterface,
    PitchExtractionInterface,
    SourceSeparationInterface,
    TranscriptionInterface,
)
from app.schemas.capabilities import (
    EngineCapabilitiesResponse,
    EngineLimits,
    FormatCapability,
    InterfaceReadiness,
    JobTypeCapability,
)
from app.schemas.jobs import JobArtifactRef, JobResponse, JobType
from app.storage.base import StorageAdapter


class JobExecutionOutput:
    """Typed output returned by a registered real processing adapter."""

    def __init__(
        self,
        result: dict[str, Any],
        artifacts: list[JobArtifactRef] | None = None,
    ) -> None:
        self.result = result
        self.artifacts = artifacts or []


JobProcessorCallable = Callable[
    [JobResponse, DecodedAudio, Path],
    Awaitable[JobExecutionOutput],
]


class ProcessingEngineRegistry:
    """
    Central registry of processing interfaces and job-type handlers.
    Honesty guarantee: unimplemented AI/ML models are explicitly reported as
    `awaiting_model_integration` / `interface_only` and raise `ModelNotIntegratedError`
    rather than returning fabricated musical results.
    """

    def __init__(
        self,
        settings: Settings,
        ingestion: AudioIngestionInterface,
        decoder: AudioDecodingInterface,
        analysis: AudioAnalysisInterface | None = None,
        separation: SourceSeparationInterface | None = None,
        pitch: PitchExtractionInterface | None = None,
        transcription: TranscriptionInterface | None = None,
        midi: MIDIProcessingInterface | None = None,
        musicxml: MusicXMLGenerationInterface | None = None,
        playback: InstrumentPlaybackInterface | None = None,
        mixing: MixingAndRenderingInterface | None = None,
        instruments: InstrumentResourceManager | None = None,
        accompaniment: AccompanimentOrchestrator | None = None,
        storage: StorageAdapter | None = None,
    ) -> None:
        self._settings = settings
        self.ingestion = ingestion
        self.decoder = decoder
        self.analysis = analysis
        self.separation = separation
        self.pitch = pitch
        self.transcription = transcription
        self.midi = midi
        self.musicxml = musicxml
        self.playback = playback
        self.mixing = mixing
        self.instruments = instruments
        self.accompaniment = accompaniment
        inferred_storage = (
            storage
            or (getattr(accompaniment, "_storage", None) if accompaniment is not None else None)
            or getattr(ingestion, "_storage", None)
        )
        self.storage: StorageAdapter | None = (
            inferred_storage if isinstance(inferred_storage, StorageAdapter) else None
        )
        self._custom_processors: dict[JobType, tuple[str, JobProcessorCallable]] = {}

    def register_processor(
        self,
        job_type: JobType,
        provider_name: str,
        handler: JobProcessorCallable,
    ) -> None:
        """Registers a verified model/DSP processor for a specific job type."""
        self._custom_processors[job_type] = (provider_name, handler)

    def has_model_for(self, job_type: JobType) -> bool:
        if job_type in self._custom_processors:
            return True
        mapping = {
            JobType.AUDIO_ANALYSIS: self.analysis is not None,
            JobType.INSTRUMENT_DETECTION: False,
            JobType.SOURCE_SEPARATION: self.separation is not None,
            JobType.PITCH_EXTRACTION: self.pitch is not None,
            JobType.MUSIC_TRANSCRIPTION: self.transcription is not None,
            JobType.ACCOMPANIMENT_GENERATION: self.accompaniment is not None,
            JobType.AUDIO_RENDERING: self.playback is not None and self.mixing is not None,
        }
        return mapping.get(job_type, False)

    async def execute_job_stage(
        self,
        job: JobResponse,
        decoded: DecodedAudio,
        workspace_dir: Path,
        *,
        artifact_tracker: JobArtifactTracker | None = None,
        on_progress: Any | None = None,
    ) -> JobExecutionOutput:
        if job.job_type in self._custom_processors:
            _, handler = self._custom_processors[job.job_type]
            return await handler(job, decoded, workspace_dir)

        if job.job_type == JobType.AUDIO_ANALYSIS:
            if self.analysis is None:
                raise ModelNotIntegratedError(job.job_type.value, "AudioAnalysisInterface")
            # Optional combined Run 1 workflow: run musical analysis and pitch extraction concurrently
            if job.parameters.get("include_vocal_pitch") is True and self.pitch is not None:
                pitch_options = job.parameters.get("pitch_options")
                res, pitch_res = await asyncio.gather(
                    self.analysis.analyze(decoded, job.parameters),
                    self.pitch.extract_pitch(
                        decoded,
                        mode="monophonic",
                        options=pitch_options if isinstance(pitch_options, dict) else None,
                    ),
                )
                payload = res.model_dump(mode="json")
                payload["vocal_pitch"] = pitch_res.model_dump(mode="json")
            else:
                res = await self.analysis.analyze(decoded, job.parameters)
                payload = res.model_dump(mode="json")
            return JobExecutionOutput(result=payload)

        if job.job_type == JobType.INSTRUMENT_DETECTION:
            raise ModelNotIntegratedError(job.job_type.value, "InstrumentDetectionModel")

        if job.job_type == JobType.SOURCE_SEPARATION:
            if self.separation is None:
                raise ModelNotIntegratedError(job.job_type.value, "SourceSeparationInterface")
            stems_param = job.parameters.get("stems")
            requested = [str(s) for s in stems_param] if isinstance(stems_param, list) else None
            res = await self.separation.separate(decoded, workspace_dir, requested)
            return JobExecutionOutput(
                result=res.model_dump(mode="json"),
                artifacts=[stem.artifact for stem in res.stems],
            )

        if job.job_type == JobType.PITCH_EXTRACTION:
            if self.pitch is None:
                raise ModelNotIntegratedError(job.job_type.value, "PitchExtractionInterface")
            mode = "polyphonic" if job.parameters.get("mode") == "polyphonic" else "monophonic"
            res = await self.pitch.extract_pitch(decoded, mode=mode, options=job.parameters)
            return JobExecutionOutput(result=res.model_dump(mode="json"))

        if job.job_type == JobType.MUSIC_TRANSCRIPTION:
            if self.transcription is None:
                raise ModelNotIntegratedError(job.job_type.value, "TranscriptionInterface")
            res = await self.transcription.transcribe(decoded)
            return JobExecutionOutput(result=res.model_dump(mode="json"))

        if job.job_type == JobType.ACCOMPANIMENT_GENERATION:
            if self.accompaniment is None:
                raise ModelNotIntegratedError(job.job_type.value, "AccompanimentOrchestrator")
            include_mix = bool(job.parameters.get("mix_with_vocal") is True)
            result_payload, artifacts = await self.accompaniment.generate_and_master(
                job,
                decoded,
                workspace_dir,
                include_mix_and_export=include_mix,
                artifact_tracker=artifact_tracker,
                on_progress=on_progress,
            )
            return JobExecutionOutput(result=result_payload, artifacts=artifacts)

        if job.job_type == JobType.AUDIO_RENDERING:
            if self.mixing is None or self.accompaniment is None:
                raise ModelNotIntegratedError(job.job_type.value, "MixingAndRenderingInterface")
            result_payload, artifacts = await self.accompaniment.generate_and_master(
                job,
                decoded,
                workspace_dir,
                include_mix_and_export=True,
                artifact_tracker=artifact_tracker,
                on_progress=on_progress,
            )
            return JobExecutionOutput(result=result_payload, artifacts=artifacts)

        raise ModelNotIntegratedError(job.job_type.value, "UnknownProcessingInterface")

    def describe_capabilities(self) -> EngineCapabilitiesResponse:
        supported_formats = [
            FormatCapability(
                format=fmt,
                mime_types=mimes,
                decode_supported=True,
                export_supported=fmt.value in {"wav", "mp3", "flac"},
            )
            for fmt, mimes in FORMAT_MIME_TYPES.items()
        ]

        inst_diag = self.instruments.get_diagnostics() if self.instruments is not None else None
        playback_notes = (
            (
                f"FluidSynth CLI + verified SoundFont ({inst_diag.sound_library.soundfont_name}) ready."
                if inst_diag.fluidsynth_available and inst_diag.sound_library.available
                else f"FluidSynth renderer integrated, but runtime synthesis prerequisites are missing "
                f"(fluidsynth={inst_diag.fluidsynth_available}, soundfont={inst_diag.sound_library.available})."
            )
            if (self.playback is not None and inst_diag is not None)
            else "Awaiting realistic multi-sampled SoundFont/SFZ renderer integration."
        )

        interfaces = [
            InterfaceReadiness(
                interface_name="AudioIngestionInterface",
                stage="ingestion",
                readiness="implemented",
                model_integrated=True,
                description="Validates storage ownership, file size, MIME/extension, magic bytes, SHA-256 checksum, and preserves original recordings.",
            ),
            InterfaceReadiness(
                interface_name="AudioDecodingInterface",
                stage="decoding",
                readiness="implemented",
                model_integrated=True,
                description="FFmpeg/FFprobe-backed non-destructive decoding to canonical 44.1 kHz PCM WAV with optional TrimWindow.",
            ),
            InterfaceReadiness(
                interface_name="AudioAnalysisInterface",
                stage="analysis",
                readiness="implemented" if self.analysis is not None else "interface_only",
                model_integrated=self.analysis is not None,
                description="Tempo, beat grid, Krumhansl-Schmuckler key/scale, chroma distribution, and basic triad chord estimation with uncertainty reporting.",
                notes=(
                    "Implemented via librosa/NumPy/SciPy (heuristic MIR estimates; multi-instrument detection not yet integrated)."
                    if self.analysis is not None
                    else "Awaiting validated DSP/MIR model selection."
                ),
            ),
            InterfaceReadiness(
                interface_name="SourceSeparationInterface",
                stage="separation",
                readiness="implemented" if self.separation is not None else "interface_only",
                model_integrated=self.separation is not None,
                description="Multi-stem demixing (vocals, drums, bass, piano, guitar, other) with bleed warnings.",
                notes="Deferred beyond Phase 5.2 (CPU-only accompaniment studio phase).",
            ),
            InterfaceReadiness(
                interface_name="PitchExtractionInterface",
                stage="pitch_extraction",
                readiness="implemented" if self.pitch is not None else "interface_only",
                model_integrated=self.pitch is not None,
                description="Monophonic vocal/melody F0 contour, MIDI pitch, voiced/unvoiced regions, and note-event segmentation.",
                notes=(
                    "Implemented via librosa.pyin for monophonic vocals/melodies only; polyphonic pitch mode is not implemented."
                    if self.pitch is not None
                    else "Awaiting pitch extraction model integration."
                ),
            ),
            InterfaceReadiness(
                interface_name="TranscriptionInterface",
                stage="transcription",
                readiness="implemented" if self.transcription is not None else "interface_only",
                model_integrated=self.transcription is not None,
                description="Quantized note event transcription with voice/clef hints and manual review flagging.",
            ),
            InterfaceReadiness(
                interface_name="MIDIProcessingInterface",
                stage="midi",
                readiness="implemented" if self.midi is not None else "interface_only",
                model_integrated=self.midi is not None,
                description="Standard MIDI File (Format 1) generation with tempo, time/key signatures, GM programs, and multi-track instrument separation.",
                notes=(
                    "Implemented via mido with post-write reopen verification and channel 9 percussion routing."
                    if self.midi is not None
                    else "Awaiting MIDI serialization library integration."
                ),
            ),
            InterfaceReadiness(
                interface_name="MusicXMLGenerationInterface",
                stage="notation",
                readiness="implemented" if self.musicxml is not None else "interface_only",
                model_integrated=self.musicxml is not None,
                description="MusicXML engraving output for VexFlow and external notation editors.",
            ),
            InterfaceReadiness(
                interface_name="InstrumentPlaybackInterface",
                stage="synthesis",
                readiness="implemented" if self.playback is not None else "interface_only",
                model_integrated=self.playback is not None,
                description="Multi-sampled instrument library rendering (FluidSynth + SoundFont). Never substitutes basic oscillators.",
                notes=playback_notes,
            ),
            InterfaceReadiness(
                interface_name="MixingAndRenderingInterface",
                stage="rendering",
                readiness="implemented" if self.mixing is not None else "interface_only",
                model_integrated=self.mixing is not None,
                description="Non-destructive vocal-aligned mixing, ITU-R BS.1770-4 LUFS normalization, 4x oversampled true-peak protection, and WAV/FLAC/MP3 export.",
                notes=(
                    "Implemented via pyloudnorm, 4x oversampled polyphase true-peak limiting, and FFmpeg/FFprobe-validated WAV (16/24-bit), FLAC, and MP3 export."
                    if self.mixing is not None
                    else "Awaiting mixing and mastering engine integration."
                ),
            ),
        ]

        def _default_provider_for(job_type: JobType) -> str | None:
            if job_type in self._custom_processors:
                return self._custom_processors[job_type][0]
            if job_type == JobType.AUDIO_ANALYSIS and self.analysis is not None:
                return "librosa-musical-analyzer"
            if job_type == JobType.PITCH_EXTRACTION and self.pitch is not None:
                return "librosa-pyin-monophonic"
            if job_type == JobType.ACCOMPANIMENT_GENERATION and self.accompaniment is not None:
                return "sonora-arranger+mido+fluidsynth"
            if job_type == JobType.AUDIO_RENDERING and self.playback is not None and self.mixing is not None:
                return "sonora-arranger+mido+fluidsynth+pyloudnorm+ffmpeg"
            return None

        def job_cap(
            job_type: JobType,
            studios: list[str],
            required_interfaces: list[str],
            description: str,
        ) -> JobTypeCapability:
            integrated = self.has_model_for(job_type)
            provider = _default_provider_for(job_type)
            return JobTypeCapability(
                job_type=job_type,
                studio_consumers=studios,
                status="ready" if integrated else "awaiting_model_integration",
                model_integrated=integrated,
                required_interfaces=required_interfaces,
                active_provider=provider,
                description=description,
            )

        job_types = [
            job_cap(
                JobType.AUDIO_ANALYSIS,
                ["song_analysis_studio", "ai_accompaniment_studio"],
                ["AudioIngestionInterface", "AudioDecodingInterface", "AudioAnalysisInterface"],
                "Detect tempo, beat grid, key signature, harmonic progression, and structural phrasing.",
            ),
            job_cap(
                JobType.INSTRUMENT_DETECTION,
                ["song_analysis_studio", "instrument_analysis_studio"],
                ["AudioIngestionInterface", "AudioDecodingInterface", "AudioAnalysisInterface"],
                "Identify prominent instruments and ensemble density with uncertainty metadata.",
            ),
            job_cap(
                JobType.SOURCE_SEPARATION,
                ["instrument_analysis_studio", "song_analysis_studio"],
                ["AudioIngestionInterface", "AudioDecodingInterface", "SourceSeparationInterface"],
                "Separate recordings into isolated musical stems while preserving original recordings.",
            ),
            job_cap(
                JobType.PITCH_EXTRACTION,
                ["song_analysis_studio", "ai_accompaniment_studio"],
                ["AudioIngestionInterface", "AudioDecodingInterface", "PitchExtractionInterface"],
                "Extract monophonic vocal F0 or polyphonic pitch contours with confidence scores.",
            ),
            job_cap(
                JobType.MUSIC_TRANSCRIPTION,
                ["song_analysis_studio", "instrument_analysis_studio"],
                [
                    "AudioIngestionInterface",
                    "AudioDecodingInterface",
                    "PitchExtractionInterface",
                    "TranscriptionInterface",
                    "MIDIProcessingInterface",
                    "MusicXMLGenerationInterface",
                ],
                "Transcribe audio into editable MIDI and MusicXML notation.",
            ),
            job_cap(
                JobType.ACCOMPANIMENT_GENERATION,
                ["ai_accompaniment_studio"],
                [
                    "AudioIngestionInterface",
                    "AudioDecodingInterface",
                    "PitchExtractionInterface",
                    "AudioAnalysisInterface",
                    "MIDIProcessingInterface",
                    "InstrumentPlaybackInterface",
                ],
                "Generate beat-aligned multi-instrument MIDI and synthesized accompaniment audio conditioned on vocal melody (final vocal mixing belongs to Run 3).",
            ),
            job_cap(
                JobType.AUDIO_RENDERING,
                ["song_analysis_studio", "instrument_analysis_studio", "ai_accompaniment_studio"],
                [
                    "MIDIProcessingInterface",
                    "InstrumentPlaybackInterface",
                    "MixingAndRenderingInterface",
                ],
                "Mix vocal + accompaniment non-destructively with LUFS loudness normalization and polished audio export (Phase 5.2 Run 3).",
            ),
        ]

        return EngineCapabilitiesResponse(
            service=self._settings.service_name,
            version=self._settings.service_version,
            supported_formats=supported_formats,
            limits=EngineLimits(
                max_file_size_bytes=self._settings.music_engine_max_file_size_bytes,
                max_duration_seconds=self._settings.music_engine_max_duration_seconds,
                max_audio_file_size_bytes=self._settings.music_engine_max_audio_file_size_bytes,
                max_video_file_size_bytes=self._settings.music_engine_max_video_file_size_bytes,
                max_midi_file_size_bytes=self._settings.music_engine_max_midi_file_size_bytes,
                max_audio_duration_seconds=self._settings.music_engine_max_audio_duration_seconds,
                max_video_duration_seconds=self._settings.music_engine_max_video_duration_seconds,
                max_midi_duration_seconds=self._settings.music_engine_max_midi_duration_seconds,
                max_concurrent_jobs_per_user=self._settings.music_engine_max_concurrent_jobs_per_user,
            ),
            job_types=job_types,
            processing_interfaces=interfaces,
        )
