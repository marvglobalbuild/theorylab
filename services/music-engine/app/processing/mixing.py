from __future__ import annotations

import asyncio
import math
from pathlib import Path
from typing import Literal

import numpy as np
import soundfile as sf
from pydantic import BaseModel, Field
from scipy import signal

from app.core.config import Settings
from app.core.errors import MixingError
from app.processing.exporter import (
    SUPPORTED_EXPORT_FORMATS,
    AudioFormatExporter,
    ExportMetadata,
    ExportResult,
)
from app.processing.interfaces import (
    MixingAndRenderingInterface,
    MixingAndRenderingRequest,
    MixingAndRenderingResult,
    MixTrackInput,
)
from app.processing.mastering import (
    LoudnessMasterProcessor,
    MasteringConfig,
    MasteringReport,
    db_to_linear,
    linear_to_dbfs,
    measure_loudness,
)
from app.schemas.audio import AudioFormat


class MixAndExportConfig(BaseModel):
    """Backend-ready mixing, mastering, and export controls for Run 3."""

    output_formats: list[AudioFormat] = Field(default_factory=lambda: [AudioFormat.WAV], min_length=1)
    sample_rate_hz: int = Field(default=44100, ge=22050, le=96000)
    wav_bit_depth: Literal[16, 24] = 16
    mp3_bitrate_kbps: int = Field(default=320, ge=128, le=320)
    target_lufs: float = Field(default=-14.0, ge=-30.0, le=-6.0)
    true_peak_ceiling_dbtp: float = Field(default=-1.0, ge=-6.0, le=-0.1)
    max_limiting_db: float = Field(default=3.5, ge=0.0, le=12.0)
    vocal_gain_db: float = Field(default=0.0, ge=-24.0, le=18.0)
    accompaniment_gain_db: float = Field(default=-4.5, ge=-36.0, le=12.0)
    vocal_balance_mode: Literal["auto_adaptive", "manual"] = "auto_adaptive"
    stem_gains_db: dict[str, float] = Field(default_factory=dict)
    stem_pans: dict[str, float] = Field(default_factory=dict)
    vocal_pan: float = Field(default=0.0, ge=-1.0, le=1.0)
    accompaniment_pan: float = Field(default=0.0, ge=-1.0, le=1.0)
    intro_offset_ms: int = Field(default=0, ge=0, le=60000)
    preserve_outro: bool = True
    include_original_vocal_copy: bool = False
    metadata: ExportMetadata | None = None


class TrackMixSummary(BaseModel):
    track_id: str
    is_original_vocal: bool = False
    source_sample_rate_hz: int
    source_channels: int
    resampled: bool = False
    duration_ms: int
    offset_ms: int = 0
    applied_gain_db: float
    pan: float = 0.0
    muted: bool = False
    input_lufs: float | None = None


class VocalAccompanimentMixResult(BaseModel):
    sample_rate_hz: int
    channels: int = 2
    mix_duration_ms: int
    vocal_duration_ms: int
    accompaniment_duration_ms: int
    intro_offset_ms: int = 0
    vocal_balance_mode: Literal["auto_adaptive", "manual"]
    adaptive_accompaniment_trim_db: float = 0.0
    effective_vocal_gain_db: float
    effective_accompaniment_gain_db: float
    used_individual_stems: bool = False
    pre_master_sample_peak_dbfs: float | None = None
    pre_master_true_peak_dbtp: float | None = None
    pre_master_clipping_risk: bool = False
    original_vocal_preserved: bool = True
    vocal_timing_and_pitch_unmodified: bool = True
    tracks_mixed: list[TrackMixSummary]
    mastering: MasteringReport
    exports: list[ExportResult]
    warnings: list[str] = Field(default_factory=list)


def _load_audio_as_stereo_float64(
    path: Path,
    target_sr: int,
) -> tuple[np.ndarray, int, int, bool]:
    """
    Read an audio file non-destructively into a working (N, 2) float64 buffer,
    resampling to `target_sr` via polyphase FIR filtering if needed.
    """
    if not path.is_file():
        raise MixingError(
            f"Mix input track '{path.name}' does not exist.",
            code="MIX_INPUT_MISSING",
            status_code=422,
        )
    try:
        raw, src_sr = sf.read(str(path), dtype="float64", always_2d=True)
    except Exception as exc:
        raise MixingError(
            f"Could not decode mix input track '{path.name}' ({type(exc).__name__}).",
            code="MIX_INPUT_UNREADABLE",
            status_code=422,
        ) from exc

    src_channels = int(raw.shape[1])
    if src_channels == 1:
        stereo = np.repeat(raw, 2, axis=1)
    elif src_channels == 2:
        stereo = np.ascontiguousarray(raw)
    else:
        mono = np.mean(raw, axis=1)
        stereo = np.column_stack([mono, mono])

    resampled = False
    if int(src_sr) != target_sr and stereo.shape[0] > 0:
        g = math.gcd(target_sr, int(src_sr))
        up = target_sr // g
        down = int(src_sr) // g
        stereo = signal.resample_poly(stereo, up=up, down=down, axis=0)
        resampled = True

    return stereo, int(src_sr), src_channels, resampled


def _apply_constant_power_pan(stereo: np.ndarray, pan: float) -> np.ndarray:
    """
    Apply stereo balance/pan in [-1.0 (left), +1.0 (right)].
    At pan=0.0, preserves original stereo image bit-identically (gain = 1.0 on both channels).
    """
    clamped = max(-1.0, min(1.0, float(pan)))
    if abs(clamped) < 1e-6:
        return stereo
    # Constant-power balance normalized so center (0.0) == (1.0, 1.0)
    angle = (clamped + 1.0) * (math.pi / 4.0)
    left_gain = math.cos(angle) * math.sqrt(2.0)
    right_gain = math.sin(angle) * math.sqrt(2.0)
    # Keep per-channel gain <= 1.0 so panning never unexpectedly boosts into clipping
    scale = max(1.0, left_gain, right_gain)
    out = stereo.copy()
    out[:, 0] *= left_gain / scale
    out[:, 1] *= right_gain / scale
    return out


class SonoraAudioMixerAndMaster(MixingAndRenderingInterface):
    """
    Phase 5.2 Run 3 non-destructive vocal + accompaniment mixing, adaptive vocal
    balance, ITU-R BS.1770-4 loudness normalization (pyloudnorm), 4x oversampled
    true-peak protection, and validated WAV/FLAC/MP3 export engine.
    """

    def __init__(
        self,
        settings: Settings,
        master_processor: LoudnessMasterProcessor | None = None,
        exporter: AudioFormatExporter | None = None,
    ) -> None:
        self._settings = settings
        self._master = master_processor or LoudnessMasterProcessor()
        self._exporter = exporter or AudioFormatExporter(settings)

    async def mix_and_render(
        self,
        request: MixingAndRenderingRequest,
        output_dir: Path,
    ) -> MixingAndRenderingResult:
        """Implementation of shared `MixingAndRenderingInterface`."""
        if request.output_format not in SUPPORTED_EXPORT_FORMATS:
            raise MixingError(
                f"Output format '{request.output_format.value}' is not supported for mastering export.",
                code="UNSUPPORTED_EXPORT_FORMAT",
                status_code=422,
            )

        mix_stereo, _summaries, _pre_peak, _pre_tp, _warnings = await asyncio.to_thread(
            self._sum_generic_tracks_sync,
            request.tracks,
            request.sample_rate_hz,
        )

        master_cfg = MasteringConfig(
            target_lufs=request.target_lufs,
            true_peak_ceiling_dbtp=self._settings.music_engine_master_true_peak_ceiling_dbtp,
            max_limiting_db=self._settings.music_engine_master_max_limiting_db,
        )
        mastered, _report = await asyncio.to_thread(
            self._master.process,
            mix_stereo,
            request.sample_rate_hz,
            master_cfg,
        )

        export_res = await self._exporter.export_master(
            stereo_audio=mastered,
            sample_rate_hz=request.sample_rate_hz,
            output_dir=output_dir,
            base_filename="master",
            output_format=request.output_format,
            wav_bit_depth=self._settings.music_engine_export_wav_bit_depth,
            mp3_bitrate_kbps=self._settings.music_engine_export_mp3_bitrate_kbps,
        )

        return MixingAndRenderingResult(
            output_path=export_res.output_path,
            output_format=export_res.format,
            sample_rate_hz=export_res.sample_rate_hz,
            duration_ms=export_res.duration_ms,
            original_tracks_preserved=True,
        )

    async def mix_vocal_and_accompaniment(
        self,
        *,
        vocal_path: Path,
        accompaniment_path: Path,
        output_dir: Path,
        config: MixAndExportConfig | None = None,
        stem_paths: dict[str, Path] | None = None,
        base_filename: str = "master",
    ) -> VocalAccompanimentMixResult:
        """
        Combine original uploaded vocal + synthesized accompaniment (or individual stems
        when stem-level gains/pans are supplied) non-destructively, master to target
        loudness + true-peak ceiling, and export all requested formats with FFprobe validation.
        """
        cfg = config or MixAndExportConfig(
            sample_rate_hz=self._settings.music_engine_synthesis_sample_rate_hz,
            wav_bit_depth=self._settings.music_engine_export_wav_bit_depth,
            mp3_bitrate_kbps=self._settings.music_engine_export_mp3_bitrate_kbps,
            target_lufs=self._settings.music_engine_master_target_lufs,
            true_peak_ceiling_dbtp=self._settings.music_engine_master_true_peak_ceiling_dbtp,
            max_limiting_db=self._settings.music_engine_master_max_limiting_db,
            vocal_gain_db=self._settings.music_engine_default_vocal_gain_db,
            accompaniment_gain_db=self._settings.music_engine_default_accompaniment_gain_db,
        )

        for fmt in cfg.output_formats:
            if fmt not in SUPPORTED_EXPORT_FORMATS:
                raise MixingError(
                    f"Output format '{fmt.value}' is not supported. Supported formats: wav, flac, mp3.",
                    code="UNSUPPORTED_EXPORT_FORMAT",
                    status_code=422,
                )

        mix_bundle = await asyncio.to_thread(
            self._mix_vocal_and_accompaniment_sync,
            vocal_path,
            accompaniment_path,
            stem_paths,
            cfg,
        )

        master_cfg = MasteringConfig(
            target_lufs=cfg.target_lufs,
            true_peak_ceiling_dbtp=cfg.true_peak_ceiling_dbtp,
            max_limiting_db=cfg.max_limiting_db,
        )
        mastered_stereo, mastering_report = await asyncio.to_thread(
            self._master.process,
            mix_bundle["mix_stereo"],
            cfg.sample_rate_hz,
            master_cfg,
        )

        # Deduplicate requested formats deterministically while preserving order
        unique_formats = list(dict.fromkeys(cfg.output_formats))
        exports: list[ExportResult] = []
        for fmt in unique_formats:
            exp = await self._exporter.export_master(
                stereo_audio=mastered_stereo,
                sample_rate_hz=cfg.sample_rate_hz,
                output_dir=output_dir,
                base_filename=base_filename,
                output_format=fmt,
                wav_bit_depth=cfg.wav_bit_depth,
                mp3_bitrate_kbps=cfg.mp3_bitrate_kbps,
                metadata=cfg.metadata,
            )
            exports.append(exp)

        all_warnings = list(mix_bundle["warnings"]) + list(mastering_report.warnings)

        return VocalAccompanimentMixResult(
            sample_rate_hz=cfg.sample_rate_hz,
            channels=2,
            mix_duration_ms=mix_bundle["mix_duration_ms"],
            vocal_duration_ms=mix_bundle["vocal_duration_ms"],
            accompaniment_duration_ms=mix_bundle["accompaniment_duration_ms"],
            intro_offset_ms=cfg.intro_offset_ms,
            vocal_balance_mode=cfg.vocal_balance_mode,
            adaptive_accompaniment_trim_db=mix_bundle["adaptive_trim_db"],
            effective_vocal_gain_db=round(cfg.vocal_gain_db, 3),
            effective_accompaniment_gain_db=mix_bundle["effective_accomp_gain_db"],
            used_individual_stems=mix_bundle["used_stems"],
            pre_master_sample_peak_dbfs=mix_bundle["pre_master_sample_peak_dbfs"],
            pre_master_true_peak_dbtp=mix_bundle["pre_master_true_peak_dbtp"],
            pre_master_clipping_risk=mix_bundle["pre_master_clipping_risk"],
            original_vocal_preserved=True,
            vocal_timing_and_pitch_unmodified=True,
            tracks_mixed=mix_bundle["tracks_mixed"],
            mastering=mastering_report,
            exports=exports,
            warnings=all_warnings,
        )

    def _mix_vocal_and_accompaniment_sync(
        self,
        vocal_path: Path,
        accompaniment_path: Path,
        stem_paths: dict[str, Path] | None,
        cfg: MixAndExportConfig,
    ) -> dict[str, object]:
        sr = cfg.sample_rate_hz
        warnings: list[str] = []
        tracks_mixed: list[TrackMixSummary] = []

        # 1. Load original vocal non-destructively (no time-stretch, pitch-shift, or denoise)
        vocal_stereo, vocal_src_sr, vocal_src_ch, vocal_resampled = _load_audio_as_stereo_float64(
            vocal_path, sr
        )
        vocal_metrics = measure_loudness(vocal_stereo, sr)
        vocal_duration_ms = int(round((vocal_stereo.shape[0] / float(sr)) * 1000.0))

        # 2. Build accompaniment bus either from individual stems (when stem overrides provided) or full accompaniment WAV
        use_stems = bool(stem_paths and (cfg.stem_gains_db or cfg.stem_pans))
        if use_stems and stem_paths:
            loaded_stems: list[tuple[str, np.ndarray, int, int, bool, float, float]] = []
            max_stem_len = 0
            for inst_id, s_path in stem_paths.items():
                s_audio, s_sr, s_ch, s_res = _load_audio_as_stereo_float64(s_path, sr)
                s_gain_db = float(cfg.stem_gains_db.get(inst_id, 0.0))
                s_pan = float(cfg.stem_pans.get(inst_id, 0.0))
                loaded_stems.append((inst_id, s_audio, s_sr, s_ch, s_res, s_gain_db, s_pan))
                if s_audio.shape[0] > max_stem_len:
                    max_stem_len = s_audio.shape[0]

            accomp_bus = np.zeros((max_stem_len, 2), dtype=np.float64)
            for inst_id, s_audio, s_sr, s_ch, s_res, s_gain_db, s_pan in loaded_stems:
                s_metrics = measure_loudness(s_audio, sr)
                panned = _apply_constant_power_pan(s_audio, s_pan) * db_to_linear(s_gain_db)
                accomp_bus[: panned.shape[0], :] += panned
                tracks_mixed.append(
                    TrackMixSummary(
                        track_id=f"stem:{inst_id}",
                        is_original_vocal=False,
                        source_sample_rate_hz=s_sr,
                        source_channels=s_ch,
                        resampled=s_res,
                        duration_ms=int(round((s_audio.shape[0] / float(sr)) * 1000.0)),
                        offset_ms=0,
                        applied_gain_db=round(s_gain_db, 3),
                        pan=round(s_pan, 3),
                        input_lufs=s_metrics.integrated_lufs,
                    )
                )
        else:
            accomp_bus, acc_sr, acc_ch, acc_res = _load_audio_as_stereo_float64(accompaniment_path, sr)
            acc_metrics_raw = measure_loudness(accomp_bus, sr)
            tracks_mixed.append(
                TrackMixSummary(
                    track_id="accompaniment",
                    is_original_vocal=False,
                    source_sample_rate_hz=acc_sr,
                    source_channels=acc_ch,
                    resampled=acc_res,
                    duration_ms=int(round((accomp_bus.shape[0] / float(sr)) * 1000.0)),
                    offset_ms=0,
                    applied_gain_db=round(cfg.accompaniment_gain_db, 3),
                    pan=round(cfg.accompaniment_pan, 3),
                    input_lufs=acc_metrics_raw.integrated_lufs,
                )
            )

        accomp_duration_ms = int(round((accomp_bus.shape[0] / float(sr)) * 1000.0))
        accomp_metrics = measure_loudness(accomp_bus, sr)

        # 3. Adaptive vocal-to-accompaniment balance calibration (prevents loud accompaniment masking quiet vocals)
        adaptive_trim_db = 0.0
        if cfg.vocal_balance_mode == "auto_adaptive" and not vocal_metrics.is_silent and not accomp_metrics.is_silent:
            vocal_ref_db = (
                vocal_metrics.integrated_lufs
                if vocal_metrics.integrated_lufs is not None
                else vocal_metrics.rms_dbfs
            )
            accomp_ref_db = (
                accomp_metrics.integrated_lufs
                if accomp_metrics.integrated_lufs is not None
                else accomp_metrics.rms_dbfs
            )
            if vocal_ref_db is not None and accomp_ref_db is not None:
                # Match accompaniment baseline to vocal loudness before applying user's accompaniment_gain_db (-4.5 dB default)
                raw_trim = vocal_ref_db - accomp_ref_db
                adaptive_trim_db = max(-12.0, min(6.0, round(raw_trim, 3)))

        effective_accomp_gain_db = round(cfg.accompaniment_gain_db + adaptive_trim_db, 3)

        # Update accompaniment track summary if single accompaniment bus was used
        if not use_stems and tracks_mixed:
            tracks_mixed[0] = tracks_mixed[0].model_copy(
                update={"applied_gain_db": effective_accomp_gain_db}
            )

        # 4. Timeline alignment & non-truncating canvas sizing
        vocal_offset_samples = int(round((cfg.intro_offset_ms / 1000.0) * sr))
        vocal_end_samples = vocal_offset_samples + vocal_stereo.shape[0]
        accomp_end_samples = accomp_bus.shape[0]

        if cfg.preserve_outro:
            total_samples = max(vocal_end_samples, accomp_end_samples, 1)
        else:
            # Never truncate the vocal; only trim trailing accompaniment beyond vocal end if preserve_outro=False
            total_samples = max(vocal_end_samples, 1)

        if vocal_end_samples > accomp_end_samples and accomp_end_samples > 0:
            warnings.append(
                f"Vocal recording ({vocal_duration_ms} ms + {cfg.intro_offset_ms} ms intro offset) extends beyond "
                f"accompaniment ({accomp_duration_ms} ms); full vocal duration preserved without truncation."
            )

        # 5. Safe float64 summation with vocal & accompaniment gain/pan + headroom management
        canvas = np.zeros((total_samples, 2), dtype=np.float64)

        vocal_processed = _apply_constant_power_pan(vocal_stereo, cfg.vocal_pan) * db_to_linear(
            cfg.vocal_gain_db
        )
        canvas[vocal_offset_samples:vocal_end_samples, :] += vocal_processed

        accomp_len_to_write = min(total_samples, accomp_bus.shape[0])
        if accomp_len_to_write > 0:
            accomp_processed = _apply_constant_power_pan(
                accomp_bus[:accomp_len_to_write, :],
                cfg.accompaniment_pan,
            ) * db_to_linear(effective_accomp_gain_db)
            canvas[:accomp_len_to_write, :] += accomp_processed

        tracks_mixed.insert(
            0,
            TrackMixSummary(
                track_id="original_vocal",
                is_original_vocal=True,
                source_sample_rate_hz=vocal_src_sr,
                source_channels=vocal_src_ch,
                resampled=vocal_resampled,
                duration_ms=vocal_duration_ms,
                offset_ms=cfg.intro_offset_ms,
                applied_gain_db=round(cfg.vocal_gain_db, 3),
                pan=round(cfg.vocal_pan, 3),
                input_lufs=vocal_metrics.integrated_lufs,
            ),
        )

        # Pre-master headroom inspection (float64 summation prevents hard internal clipping before mastering)
        pre_metrics = measure_loudness(canvas, sr)
        pre_clip_risk = bool(
            pre_metrics.sample_peak_linear > 1.0
            or (pre_metrics.true_peak_dbtp is not None and pre_metrics.true_peak_dbtp > 0.0)
        )
        if pre_clip_risk:
            # Pull down pre-master headroom safely before mastering so downstream stage has clean headroom
            safe_headroom_gain = db_to_linear(-3.0) / max(pre_metrics.true_peak_linear, 1e-12)
            canvas = canvas * safe_headroom_gain
            warnings.append(
                "Pre-master summed signal exceeded 0 dBFS; applied clean float64 headroom reduction prior to loudness mastering."
            )

        mix_duration_ms = int(round((total_samples / float(sr)) * 1000.0))

        return {
            "mix_stereo": canvas,
            "mix_duration_ms": mix_duration_ms,
            "vocal_duration_ms": vocal_duration_ms,
            "accompaniment_duration_ms": accomp_duration_ms,
            "adaptive_trim_db": adaptive_trim_db,
            "effective_accomp_gain_db": effective_accomp_gain_db,
            "used_stems": use_stems,
            "pre_master_sample_peak_dbfs": pre_metrics.sample_peak_dbfs,
            "pre_master_true_peak_dbtp": pre_metrics.true_peak_dbtp,
            "pre_master_clipping_risk": pre_clip_risk,
            "tracks_mixed": tracks_mixed,
            "warnings": warnings,
        }

    def _sum_generic_tracks_sync(
        self,
        tracks: list[MixTrackInput],
        target_sr: int,
    ) -> tuple[np.ndarray, list[TrackMixSummary], float | None, float | None, list[str]]:
        loaded: list[tuple[MixTrackInput, np.ndarray, int, int, bool]] = []
        max_len = 0
        for trk in tracks:
            if trk.muted:
                continue
            stereo, src_sr, src_ch, resampled = _load_audio_as_stereo_float64(
                Path(trk.audio_path), target_sr
            )
            loaded.append((trk, stereo, src_sr, src_ch, resampled))
            if stereo.shape[0] > max_len:
                max_len = stereo.shape[0]

        if max_len == 0:
            raise MixingError(
                "All mix input tracks were muted or empty; no audio available to render.",
                code="EMPTY_MIX_TRACKS",
                status_code=422,
            )

        canvas = np.zeros((max_len, 2), dtype=np.float64)
        summaries: list[TrackMixSummary] = []
        for trk, stereo, src_sr, src_ch, resampled in loaded:
            panned = _apply_constant_power_pan(stereo, trk.pan) * db_to_linear(trk.gain_db)
            canvas[: panned.shape[0], :] += panned
            summaries.append(
                TrackMixSummary(
                    track_id=trk.track_id,
                    is_original_vocal=trk.is_original_vocal,
                    source_sample_rate_hz=src_sr,
                    source_channels=src_ch,
                    resampled=resampled,
                    duration_ms=int(round((stereo.shape[0] / float(target_sr)) * 1000.0)),
                    applied_gain_db=round(trk.gain_db, 3),
                    pan=round(trk.pan, 3),
                )
            )

        pre_metrics = measure_loudness(canvas, target_sr)
        return (
            canvas,
            summaries,
            pre_metrics.sample_peak_dbfs,
            pre_metrics.true_peak_dbtp,
            [],
        )
