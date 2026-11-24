from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any

from pydantic import ValidationError as PydanticValidationError

from app.core.config import Settings
from app.core.errors import MixingError, ValidationError
from app.processing.arranger import ArrangementConfig, SonoraAccompanimentArranger
from app.processing.artifacts import JobArtifactTracker
from app.processing.exporter import ExportMetadata
from app.processing.instruments import InstrumentResourceManager
from app.processing.interfaces import (
    AudioAnalysisInterface,
    AudioAnalysisResult,
    DecodedAudio,
    PitchExtractionInterface,
    PitchExtractionResult,
)
from app.processing.midi import (
    MIDITrackSpec,
    MidoMIDIBuilder,
    parse_midi_file,
    parsed_midi_to_analysis_and_pitch,
)
from app.processing.mixing import MixAndExportConfig, SonoraAudioMixerAndMaster
from app.processing.synthesis import FluidSynthRenderer
from app.schemas.audio import AudioFormat, MediaCategory
from app.schemas.jobs import JobArtifactRef, JobResponse
from app.storage.base import StorageAdapter, UserStoragePathGuard


class AccompanimentOrchestrator:
    """
    Phase 5.2 Run 2 & Run 3 end-to-end accompaniment and vocal mastering workflow:
      1. Musical analysis (LibrosaMusicalAnalyzer)
      2. Monophonic vocal pitch extraction (LibrosaPyinPitchExtractor)
      3. Theory-driven accompaniment arrangement (SonoraAccompanimentArranger)
      4. Multi-track Standard MIDI File generation (MidoMIDIBuilder)
      5. Multi-sampled SoundFont rendering via FluidSynth (FluidSynthRenderer)
      6. Optional per-instrument stem rendering & validation
      7. (Run 3) Non-destructive vocal + accompaniment mixing, pyloudnorm ITU-R BS.1770-4
         loudness normalization, 4x oversampled true-peak protection, and FFprobe-validated
         WAV (16/24-bit), FLAC, and MP3 export
      8. Private artifact persistence under deterministic `{user_id}/jobs/{job_id}/...` paths

    Original uploaded vocal recordings remain strictly untouched at all times.
    """

    def __init__(
        self,
        *,
        settings: Settings,
        storage: StorageAdapter,
        analysis: AudioAnalysisInterface,
        pitch: PitchExtractionInterface,
        instruments: InstrumentResourceManager,
        arranger: SonoraAccompanimentArranger,
        midi: MidoMIDIBuilder,
        renderer: FluidSynthRenderer,
        mixer: SonoraAudioMixerAndMaster | None = None,
    ) -> None:
        self._settings = settings
        self._storage = storage
        self._analysis = analysis
        self._pitch = pitch
        self._instruments = instruments
        self._arranger = arranger
        self._midi = midi
        self._renderer = renderer
        self._mixer = mixer

    @staticmethod
    def parse_config(parameters: dict[str, Any]) -> ArrangementConfig:
        raw = parameters.get("arrangement") if isinstance(parameters.get("arrangement"), dict) else parameters
        known_fields = set(ArrangementConfig.model_fields.keys())
        filtered = {k: v for k, v in raw.items() if k in known_fields}
        try:
            return ArrangementConfig.model_validate(filtered)
        except PydanticValidationError as exc:
            raise ValidationError(
                "Invalid accompaniment arrangement configuration parameters.",
                code="INVALID_ARRANGEMENT_CONFIG",
                details={"errors": exc.errors()},
            ) from exc

    def parse_mix_config(
        self,
        parameters: dict[str, Any],
        *,
        default_intro_offset_ms: int = 0,
    ) -> MixAndExportConfig:
        merged: dict[str, Any] = {
            "sample_rate_hz": self._settings.music_engine_synthesis_sample_rate_hz,
            "wav_bit_depth": self._settings.music_engine_export_wav_bit_depth,
            "mp3_bitrate_kbps": self._settings.music_engine_export_mp3_bitrate_kbps,
            "target_lufs": self._settings.music_engine_master_target_lufs,
            "true_peak_ceiling_dbtp": self._settings.music_engine_master_true_peak_ceiling_dbtp,
            "max_limiting_db": self._settings.music_engine_master_max_limiting_db,
            "vocal_gain_db": self._settings.music_engine_default_vocal_gain_db,
            "accompaniment_gain_db": self._settings.music_engine_default_accompaniment_gain_db,
            "intro_offset_ms": default_intro_offset_ms,
        }

        known_fields = set(MixAndExportConfig.model_fields.keys())
        # Accept top-level keys as well as nested `mix` and `export` parameter blocks
        sources: list[dict[str, Any]] = [parameters]
        for nested_key in ("mix", "export", "mastering"):
            nested = parameters.get(nested_key)
            if isinstance(nested, dict):
                sources.append(nested)

        for src in sources:
            for k, v in src.items():
                if k in known_fields:
                    merged[k] = v
            # Convenience singular `output_format` / `master_format` alias -> `output_formats`
            if ("output_format" in src or "master_format" in src) and "output_formats" not in src:
                merged["output_formats"] = [src.get("output_format") or src.get("master_format")]

        # Normalize string formats like "wav" / "flac" / "mp3"
        if isinstance(merged.get("output_formats"), list):
            normalized_fmts: list[AudioFormat | str] = []
            for item in merged["output_formats"]:
                if isinstance(item, str):
                    normalized_fmts.append(item.strip().lower())
                else:
                    normalized_fmts.append(item)
            merged["output_formats"] = normalized_fmts

        if isinstance(merged.get("metadata"), dict):
            merged["metadata"] = ExportMetadata.model_validate(merged["metadata"])

        try:
            return MixAndExportConfig.model_validate(merged)
        except PydanticValidationError as exc:
            raise ValidationError(
                "Invalid mixing, mastering, or export configuration parameters.",
                code="INVALID_MIX_CONFIG",
                details={"errors": exc.errors()},
            ) from exc

    async def generate(
        self,
        job: JobResponse,
        decoded: DecodedAudio,
        workspace_dir: Path,
        *,
        artifact_tracker: JobArtifactTracker | None = None,
    ) -> tuple[dict[str, Any], list[JobArtifactRef]]:
        """Run 2 accompaniment workflow (optionally includes Run 3 mix if `mix_with_vocal: true`)."""
        include_mix = bool(job.parameters.get("mix_with_vocal") is True)
        return await self.generate_and_master(
            job,
            decoded,
            workspace_dir,
            include_mix_and_export=include_mix,
            artifact_tracker=artifact_tracker,
        )

    async def generate_and_master(
        self,
        job: JobResponse,
        decoded: DecodedAudio,
        workspace_dir: Path,
        *,
        include_mix_and_export: bool = True,
        artifact_tracker: JobArtifactTracker | None = None,
        on_progress: Any | None = None,
    ) -> tuple[dict[str, Any], list[JobArtifactRef]]:
        config = self.parse_config(job.parameters)

        analysis_opts = job.parameters.get("analysis_options")
        pitch_opts = job.parameters.get("pitch_options")

        is_midi_input = (
            getattr(decoded.source_metadata, "media_category", None) == MediaCategory.MIDI
            or decoded.source_metadata.detected_format in {AudioFormat.MID, AudioFormat.MIDI}
        )

        parsed_midi_song = None
        if is_midi_input:
            # Phase 5: Direct symbolic MIDI parsing pathway - bypass audio/vocal pYIN pitch analysis
            midi_candidates = [
                workspace_dir / "source_working_copy.mid",
                workspace_dir / "source_working_copy.midi",
                *workspace_dir.glob("*.mid"),
                *workspace_dir.glob("*.midi"),
            ]
            midi_src = next((p for p in midi_candidates if p.is_file()), None)
            if not midi_src:
                raise ValidationError(
                    "Original input MIDI file is missing from job workspace.",
                    code="MISSING_INPUT_MIDI",
                )

            parsed_midi_song = parse_midi_file(midi_src)
            analysis_res, pitch_res = parsed_midi_to_analysis_and_pitch(parsed_midi_song)

            if config.tempo_override_bpm is not None:
                analysis_res.tempo_bpm = config.tempo_override_bpm
            if config.key_override:
                analysis_res.estimated_key = config.key_override
        else:
            # Check for caller pre-computed analysis & pitch to eliminate redundant computation
            raw_analysis = job.parameters.get("musical_analysis")
            raw_pitch = job.parameters.get("vocal_pitch")
            analysis_res: AudioAnalysisResult | None = None
            pitch_res: PitchExtractionResult | None = None

            if isinstance(raw_analysis, dict):
                try:
                    analysis_res = AudioAnalysisResult.model_validate(raw_analysis)
                except Exception:
                    analysis_res = None
            if isinstance(raw_pitch, dict):
                try:
                    pitch_res = PitchExtractionResult.model_validate(raw_pitch)
                except Exception:
                    pitch_res = None

            # Concurrently extract any missing components
            if analysis_res is None and pitch_res is None:
                if on_progress:
                    await on_progress(45, "analyzing_vocals")
                analysis_res, pitch_res = await asyncio.gather(
                    self._analysis.analyze(
                        decoded,
                        options=analysis_opts if isinstance(analysis_opts, dict) else None,
                    ),
                    self._pitch.extract_pitch(
                        decoded,
                        mode="monophonic",
                        options=pitch_opts if isinstance(pitch_opts, dict) else None,
                    ),
                )
            elif analysis_res is None:
                if on_progress:
                    await on_progress(45, "detecting_key_and_tempo")
                analysis_res = await self._analysis.analyze(
                    decoded,
                    options=analysis_opts if isinstance(analysis_opts, dict) else None,
                )
            elif pitch_res is None:
                if on_progress:
                    await on_progress(45, "analyzing_vocals")
                pitch_res = await self._pitch.extract_pitch(
                    decoded,
                    mode="monophonic",
                    options=pitch_opts if isinstance(pitch_opts, dict) else None,
                )

        # Stage 3: Theory-driven accompaniment arrangement
        if on_progress:
            await on_progress(60, "arranging_instruments")
        plan = self._arranger.arrange(
            analysis=analysis_res,
            pitch=pitch_res,
            config=config,
        )

        intro_offset_ms = int(round(plan.intro_bars * plan.beats_per_bar * (60000.0 / plan.tempo_bpm)))
        mix_config: MixAndExportConfig | None = None
        if include_mix_and_export:
            if self._mixer is None:
                raise MixingError(
                    "Mixing and mastering engine is not configured on this worker.",
                    code="MIXER_NOT_CONFIGURED",
                    status_code=503,
                )
            mix_config = self.parse_mix_config(
                job.parameters,
                default_intro_offset_ms=intro_offset_ms,
            )

        # Stage 4: Build multi-track Standard MIDI File
        # If input is MIDI, preserve all original tracks alongside generated accompaniment tracks!
        final_midi_tracks: list[MIDITrackSpec] = []
        if is_midi_input and parsed_midi_song and parsed_midi_song.tracks:
            for orig_trk in parsed_midi_song.tracks:
                if orig_trk.notes:
                    final_midi_tracks.append(
                        MIDITrackSpec(
                            instrument_id=f"input_{orig_trk.track_index}",
                            track_name=f"Original: {orig_trk.track_name}",
                            gm_program=orig_trk.program,
                            channel=orig_trk.channel,
                            is_percussion=orig_trk.is_percussion,
                            notes=orig_trk.notes,
                        )
                    )
        final_midi_tracks.extend(plan.tracks)

        midi_local_path = workspace_dir / "accompaniment.mid"
        midi_res = await self._midi.build_multitrack_midi(
            tracks=final_midi_tracks,
            tempo_bpm=plan.tempo_bpm,
            time_signature=plan.time_signature,
            key_signature=plan.key,
            output_path=midi_local_path,
        )

        # Stage 5: Render multi-sampled stereo WAV via FluidSynth
        if on_progress:
            await on_progress(70, "rendering_accompaniment")
        wav_local_path = workspace_dir / "accompaniment.wav"
        synth_diag = await self._renderer.render_midi_to_wav(
            midi_path=midi_local_path,
            output_wav_path=wav_local_path,
        )

        # Stage 6: Persist deterministic artifacts strictly inside the user's private namespace
        bucket = self._settings.supabase_audio_bucket
        artifacts: list[JobArtifactRef] = []

        midi_obj_path = UserStoragePathGuard.normalize_and_verify(
            user_id=job.user_id,
            bucket=bucket,
            object_path=f"{job.user_id}/jobs/{job.job_id}/accompaniment.mid",
            allowed_bucket=bucket,
        )
        midi_stored = await self._storage.upload_from_path(
            bucket=bucket,
            object_path=midi_obj_path,
            source=midi_local_path,
            content_type="audio/midi",
        )
        if artifact_tracker is not None:
            artifact_tracker.record_upload(bucket, midi_stored.object_path)
        artifacts.append(
            JobArtifactRef(
                artifact_type="accompaniment_midi",
                storage_backend=self._settings.music_engine_storage_backend,
                bucket=bucket,
                object_path=midi_stored.object_path,
                mime_type="audio/midi",
                size_bytes=midi_stored.size_bytes,
            )
        )

        wav_obj_path = UserStoragePathGuard.normalize_and_verify(
            user_id=job.user_id,
            bucket=bucket,
            object_path=f"{job.user_id}/jobs/{job.job_id}/accompaniment.wav",
            allowed_bucket=bucket,
        )
        wav_stored = await self._storage.upload_from_path(
            bucket=bucket,
            object_path=wav_obj_path,
            source=wav_local_path,
            content_type="audio/wav",
        )
        if artifact_tracker is not None:
            artifact_tracker.record_upload(bucket, wav_stored.object_path)
        artifacts.append(
            JobArtifactRef(
                artifact_type="accompaniment_audio",
                storage_backend=self._settings.music_engine_storage_backend,
                bucket=bucket,
                object_path=wav_stored.object_path,
                mime_type="audio/wav",
                size_bytes=wav_stored.size_bytes,
            )
        )

        # Stage 6b: Render per-instrument stems concurrently when requested or needed for mixing
        need_stems = bool(
            config.render_individual_stems
            or (
                mix_config is not None
                and (
                    mix_config.stem_gains_db
                    or mix_config.stem_pans
                    or mix_config.muted_stems
                    or mix_config.solo_stems
                )
            )
        )
        stem_summaries: list[dict[str, Any]] = []
        stem_local_paths: dict[str, Path] = {}
        if need_stems:
            if on_progress:
                await on_progress(82, "rendering_stems")

            async def _render_single_stem(track: MIDITrackSpec):
                if not track.notes:
                    return None
                stem_midi = workspace_dir / f"stem_{track.instrument_id}.mid"
                stem_wav = workspace_dir / f"stem_{track.instrument_id}.wav"
                await self._midi.build_multitrack_midi(
                    tracks=[track],
                    tempo_bpm=plan.tempo_bpm,
                    time_signature=plan.time_signature,
                    key_signature=plan.key,
                    output_path=stem_midi,
                )
                stem_diag = await self._renderer.render_midi_to_wav(
                    midi_path=stem_midi,
                    output_wav_path=stem_wav,
                )
                stem_obj_path = UserStoragePathGuard.normalize_and_verify(
                    user_id=job.user_id,
                    bucket=bucket,
                    object_path=f"{job.user_id}/jobs/{job.job_id}/stems/{track.instrument_id}.wav",
                    allowed_bucket=bucket,
                )
                stem_stored = await self._storage.upload_from_path(
                    bucket=bucket,
                    object_path=stem_obj_path,
                    source=stem_wav,
                    content_type="audio/wav",
                )
                if artifact_tracker is not None:
                    artifact_tracker.record_upload(bucket, stem_stored.object_path)
                art_ref = JobArtifactRef(
                    artifact_type=f"instrument_track_{track.instrument_id}",
                    storage_backend=self._settings.music_engine_storage_backend,
                    bucket=bucket,
                    object_path=stem_stored.object_path,
                    mime_type="audio/wav",
                    size_bytes=stem_stored.size_bytes,
                )
                summary = {
                    "instrument_id": track.instrument_id,
                    "track_name": track.track_name,
                    "gm_program": track.gm_program,
                    "channel": track.channel,
                    "object_path": stem_stored.object_path,
                    "duration_ms": stem_diag.duration_ms,
                    "peak_amplitude": stem_diag.peak_amplitude,
                    "rms_amplitude": stem_diag.rms_amplitude,
                    "size_bytes": stem_stored.size_bytes,
                }
                return track.instrument_id, stem_wav, art_ref, summary

            stem_tasks = [_render_single_stem(track) for track in plan.tracks if track.notes]
            stem_results = await asyncio.gather(*stem_tasks)
            for res in stem_results:
                if res is not None:
                    inst_id, stem_wav, art_ref, summary = res
                    stem_local_paths[inst_id] = stem_wav
                    artifacts.append(art_ref)
                    stem_summaries.append(summary)

        # Stage 7 (Run 3): Non-destructive vocal + accompaniment mixing, mastering & format export
        mixing_payload: dict[str, Any] | None = None
        mastering_payload: dict[str, Any] | None = None
        exports_payload: list[dict[str, Any]] = []
        original_vocal_copy_obj_path: str | None = None

        if include_mix_and_export and mix_config is not None and self._mixer is not None:
            if on_progress:
                await on_progress(90, "mastering_audio")
            exports_dir = workspace_dir / "exports"
            mix_res = await self._mixer.mix_vocal_and_accompaniment(
                vocal_path=Path(decoded.working_wav_path),
                accompaniment_path=wav_local_path,
                output_dir=exports_dir,
                config=mix_config,
                stem_paths=stem_local_paths if stem_local_paths else None,
                base_filename="master",
            )

            for exp in mix_res.exports:
                master_obj_path = UserStoragePathGuard.normalize_and_verify(
                    user_id=job.user_id,
                    bucket=bucket,
                    object_path=f"{job.user_id}/jobs/{job.job_id}/{exp.filename}",
                    allowed_bucket=bucket,
                )
                master_stored = await self._storage.upload_from_path(
                    bucket=bucket,
                    object_path=master_obj_path,
                    source=Path(exp.output_path),
                    content_type=exp.mime_type,
                )
                if artifact_tracker is not None:
                    artifact_tracker.record_upload(bucket, master_stored.object_path)
                artifacts.append(
                    JobArtifactRef(
                        artifact_type=f"master_audio_{exp.format.value}",
                        storage_backend=self._settings.music_engine_storage_backend,
                        bucket=bucket,
                        object_path=master_stored.object_path,
                        mime_type=exp.mime_type,
                        size_bytes=master_stored.size_bytes,
                    )
                )
                exports_payload.append(
                    {
                        "format": exp.format.value,
                        "filename": exp.filename,
                        "object_path": master_stored.object_path,
                        "mime_type": exp.mime_type,
                        "size_bytes": master_stored.size_bytes,
                        "sample_rate_hz": exp.sample_rate_hz,
                        "channels": exp.channels,
                        "duration_ms": exp.duration_ms,
                        "bit_depth": exp.bit_depth,
                        "bitrate_kbps": exp.bitrate_kbps,
                        "codec_name": exp.codec_name,
                        "ffprobe_verified": exp.ffprobe_verified,
                        "soundfile_verified": exp.soundfile_verified,
                        "peak_amplitude": exp.peak_amplitude,
                        "metadata_written": exp.metadata_written,
                    }
                )

            if mix_config.include_original_vocal_copy:
                vocal_copy_obj_path = UserStoragePathGuard.normalize_and_verify(
                    user_id=job.user_id,
                    bucket=bucket,
                    object_path=f"{job.user_id}/jobs/{job.job_id}/original_vocal_copy.wav",
                    allowed_bucket=bucket,
                )
                vocal_copy_stored = await self._storage.upload_from_path(
                    bucket=bucket,
                    object_path=vocal_copy_obj_path,
                    source=Path(decoded.working_wav_path),
                    content_type="audio/wav",
                )
                if artifact_tracker is not None:
                    artifact_tracker.record_upload(bucket, vocal_copy_stored.object_path)
                original_vocal_copy_obj_path = vocal_copy_stored.object_path
                artifacts.append(
                    JobArtifactRef(
                        artifact_type="original_vocal_copy",
                        storage_backend=self._settings.music_engine_storage_backend,
                        bucket=bucket,
                        object_path=vocal_copy_stored.object_path,
                        mime_type="audio/wav",
                        size_bytes=vocal_copy_stored.size_bytes,
                    )
                )

            mixing_payload = {
                "sample_rate_hz": mix_res.sample_rate_hz,
                "channels": mix_res.channels,
                "mix_duration_ms": mix_res.mix_duration_ms,
                "vocal_duration_ms": mix_res.vocal_duration_ms,
                "accompaniment_duration_ms": mix_res.accompaniment_duration_ms,
                "intro_offset_ms": mix_res.intro_offset_ms,
                "vocal_balance_mode": mix_res.vocal_balance_mode,
                "adaptive_accompaniment_trim_db": mix_res.adaptive_accompaniment_trim_db,
                "effective_vocal_gain_db": mix_res.effective_vocal_gain_db,
                "effective_accompaniment_gain_db": mix_res.effective_accompaniment_gain_db,
                "used_individual_stems": mix_res.used_individual_stems,
                "pre_master_sample_peak_dbfs": mix_res.pre_master_sample_peak_dbfs,
                "pre_master_true_peak_dbtp": mix_res.pre_master_true_peak_dbtp,
                "pre_master_clipping_risk": mix_res.pre_master_clipping_risk,
                "original_vocal_preserved": mix_res.original_vocal_preserved,
                "vocal_timing_and_pitch_unmodified": mix_res.vocal_timing_and_pitch_unmodified,
                "original_vocal_copy_object_path": original_vocal_copy_obj_path,
                "tracks_mixed": [t.model_dump(mode="json") for t in mix_res.tracks_mixed],
                "warnings": mix_res.warnings,
            }
            mastering_payload = mix_res.mastering.model_dump(mode="json")

        track_summary = [
            {
                "instrument_id": trk.instrument_id,
                "track_name": trk.track_name,
                "gm_program": trk.gm_program,
                "channel": trk.channel,
                "is_percussion": trk.is_percussion,
                "volume": trk.volume,
                "pan": trk.pan,
                "note_count": len(trk.notes),
            }
            for trk in plan.tracks
        ]

        result_payload: dict[str, Any] = {
            "arrangement": {
                "style": plan.style,
                "key": plan.key,
                "key_root": plan.key_root,
                "scale": plan.scale,
                "tempo_bpm": plan.tempo_bpm,
                "time_signature": plan.time_signature,
                "beats_per_bar": plan.beats_per_bar,
                "total_bars": plan.total_bars,
                "intro_bars": plan.intro_bars,
                "outro_bars": plan.outro_bars,
                "duration_ms": plan.duration_ms,
                "transpose_semitones": plan.transpose_semitones,
                "harmony_source": plan.harmony_source,
                "chords": [c.model_dump(mode="json") for c in plan.chords],
                "tracks": track_summary,
                "warnings": plan.warnings,
            },
            "midi": {
                "filename": "accompaniment.mid",
                "object_path": midi_stored.object_path,
                "track_count": midi_res.track_count,
                "instrument_tracks": midi_res.instrument_tracks,
                "note_count": midi_res.note_count,
                "duration_ms": midi_res.duration_ms,
                "tempo_bpm": midi_res.tempo_bpm,
                "time_signature": midi_res.time_signature,
                "key_signature": midi_res.key_signature,
                "ticks_per_beat": midi_res.ticks_per_beat,
            },
            "synthesis": {
                "engine": synth_diag.engine,
                "soundfont_name": synth_diag.soundfont_name,
                "sample_rate_hz": synth_diag.sample_rate_hz,
                "channels": synth_diag.channels,
                "duration_ms": synth_diag.duration_ms,
                "peak_amplitude": synth_diag.peak_amplitude,
                "rms_amplitude": synth_diag.rms_amplitude,
                "size_bytes": synth_diag.size_bytes,
                "object_path": wav_stored.object_path,
                "individual_stems": stem_summaries,
            },
            "musical_analysis": {
                "tempo_bpm": analysis_res.tempo_bpm,
                "tempo_confidence": analysis_res.tempo_confidence,
                "tempo_stability": analysis_res.tempo_stability,
                "time_signature": analysis_res.time_signature,
                "estimated_key": analysis_res.estimated_key,
                "key_confidence": analysis_res.key_confidence,
                "reliability": analysis_res.reliability,
                "reliability_score": analysis_res.reliability_score,
                "chord_count": len(analysis_res.chords),
                "warnings": analysis_res.warnings,
            },
            "vocal_pitch": {
                "mode": pitch_res.mode,
                "voiced_ratio": pitch_res.voiced_ratio,
                "mean_confidence": pitch_res.mean_confidence,
                "note_event_count": len(pitch_res.note_events),
                "pitch_range_midi": list(pitch_res.pitch_range_midi) if pitch_res.pitch_range_midi else None,
                "warnings": pitch_res.warnings,
            },
            "original_vocal_preserved": True,
            "mixing_status": (
                "mastered_vocal_and_accompaniment"
                if include_mix_and_export
                else "accompaniment_only_pending_run3_vocal_mix"
            ),
        }

        if include_mix_and_export:
            result_payload["mixing"] = mixing_payload
            result_payload["mastering"] = mastering_payload
            result_payload["exports"] = exports_payload

        return result_payload, artifacts
