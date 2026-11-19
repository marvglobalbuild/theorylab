from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any, Literal

import librosa
import numpy as np
import soundfile as sf
from scipy.signal import medfilt

from app.core.errors import AudioValidationError
from app.core.logging import get_logger
from app.processing.interfaces import (
    AudioAnalysisInterface,
    AudioAnalysisResult,
    BeatMarker,
    ChordEvent,
    ChromaSummary,
    DecodedAudio,
)

logger = get_logger("analysis")

PITCH_CLASS_NAMES: tuple[str, ...] = (
    "C",
    "C#",
    "D",
    "Eb",
    "E",
    "F",
    "F#",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
)

# Krumhansl-Kessler (1990) tonal hierarchy probe-tone profiles (C = index 0)
_KS_MAJOR_PROFILE = np.array(
    [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88],
    dtype=np.float64,
)
_KS_MINOR_PROFILE = np.array(
    [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17],
    dtype=np.float64,
)

# Pre-normalized major and minor triad templates for chroma-based chord matching
def _build_triad_templates() -> list[tuple[str, str, str, np.ndarray]]:
    templates: list[tuple[str, str, str, np.ndarray]] = []
    for root_idx, root_name in enumerate(PITCH_CLASS_NAMES):
        maj = np.zeros(12, dtype=np.float64)
        maj[root_idx] = 1.0
        maj[(root_idx + 4) % 12] = 0.85
        maj[(root_idx + 7) % 12] = 0.90
        maj /= np.linalg.norm(maj)
        templates.append((root_name, root_name, "major", maj))

        min_vec = np.zeros(12, dtype=np.float64)
        min_vec[root_idx] = 1.0
        min_vec[(root_idx + 3) % 12] = 0.85
        min_vec[(root_idx + 7) % 12] = 0.90
        min_vec /= np.linalg.norm(min_vec)
        templates.append((f"{root_name}m", root_name, "minor", min_vec))
    return templates


_TRIAD_TEMPLATES = _build_triad_templates()


def _pearson_corr(a: np.ndarray, b: np.ndarray) -> float:
    a_centered = a - np.mean(a)
    b_centered = b - np.mean(b)
    denom = float(np.linalg.norm(a_centered) * np.linalg.norm(b_centered))
    if denom <= 1e-12:
        return 0.0
    return float(np.dot(a_centered, b_centered) / denom)


def _passband_spectral_flatness(
    y: np.ndarray,
    sr: int,
    *,
    n_fft: int = 2048,
    hop_length: int = 512,
    fmin_hz: float = 80.0,
    fmax_hz: float = 8000.0,
) -> float:
    """
    Compute Wiener entropy (spectral flatness) strictly inside the musical passband
    (80 Hz .. min(8 kHz, 0.8 * Nyquist)) so DC removal or resampler anti-aliasing
    roll-off near Nyquist does not artificially suppress flatness on broadband noise.
    """
    eff_fft = min(n_fft, max(256, 2 ** int(np.floor(np.log2(max(256, len(y)))))))
    eff_hop = min(hop_length, max(128, eff_fft // 4))
    S = np.abs(librosa.stft(y, n_fft=eff_fft, hop_length=eff_hop)) ** 2
    freqs = librosa.fft_frequencies(sr=sr, n_fft=eff_fft)
    upper = min(fmax_hz, 0.80 * (sr / 2.0))
    band = (freqs >= fmin_hz) & (freqs <= upper)
    if not np.any(band):
        return 0.0
    S_band = np.maximum(S[band, :], 1e-12)
    geo_mean = np.exp(np.mean(np.log(S_band), axis=0))
    arith_mean = np.mean(S_band, axis=0)
    flatness = geo_mean / np.maximum(arith_mean, 1e-12)
    return float(np.mean(flatness)) if flatness.size > 0 else 0.0


def _estimate_key_krumhansl_schmuckler(
    chroma_mean: np.ndarray,
) -> tuple[str, str, str, float, float, bool]:
    """
    Match a 12-bin chroma distribution against all 24 Krumhansl-Schmuckler
    major and minor key profiles.

    Returns:
      (estimated_key, root, scale, best_r, second_best_r, relative_ambiguous)
    """
    candidates: list[tuple[float, str, str, int]] = []
    for root_idx, root_name in enumerate(PITCH_CLASS_NAMES):
        major_shifted = np.roll(_KS_MAJOR_PROFILE, root_idx)
        minor_shifted = np.roll(_KS_MINOR_PROFILE, root_idx)
        candidates.append((_pearson_corr(chroma_mean, major_shifted), root_name, "major", root_idx))
        candidates.append((_pearson_corr(chroma_mean, minor_shifted), root_name, "minor", root_idx))

    candidates.sort(key=lambda item: item[0], reverse=True)
    best_r, best_root, best_scale, best_idx = candidates[0]
    second_r, _, second_scale, second_idx = candidates[1]

    # Check if runner-up is the relative major/minor (3 semitones apart) with a small margin
    is_relative = (
        (best_scale == "major" and second_scale == "minor" and (best_idx - 3) % 12 == second_idx)
        or (best_scale == "minor" and second_scale == "major" and (best_idx + 3) % 12 == second_idx)
    )
    relative_ambiguous = bool(is_relative and (best_r - second_r) < 0.08)

    return f"{best_root} {best_scale}", best_root, best_scale, best_r, second_r, relative_ambiguous


def _extract_chords_from_chroma(
    chroma: np.ndarray,
    frame_times_ms: np.ndarray,
    duration_ms: int,
    beat_times_ms: list[int],
    *,
    min_similarity: float = 0.58,
) -> list[ChordEvent]:
    """
    Estimate basic major/minor chords across beat-synchronous (or ~1.0s) windows
    using cosine similarity against triad templates and median smoothing.
    """
    if chroma.shape[1] == 0 or duration_ms < 500:
        return []

    # Build window boundaries in ms
    if len(beat_times_ms) >= 4:
        # Group every 2 beats for cleaner harmonic stability
        boundaries = [beat_times_ms[i] for i in range(0, len(beat_times_ms), 2)]
        if boundaries[0] > 150:
            boundaries.insert(0, 0)
        if duration_ms - boundaries[-1] > 250:
            boundaries.append(duration_ms)
        else:
            boundaries[-1] = duration_ms
    else:
        step_ms = 1000
        boundaries = list(range(0, duration_ms, step_ms))
        if not boundaries or boundaries[-1] < duration_ms:
            boundaries.append(duration_ms)

    if len(boundaries) < 2:
        return []

    raw_indices: list[int] = []
    raw_scores: list[float] = []
    window_ranges: list[tuple[int, int]] = []

    for start_ms, end_ms in zip(boundaries[:-1], boundaries[1:]):
        if end_ms <= start_ms:
            continue
        mask = (frame_times_ms >= start_ms) & (frame_times_ms < end_ms)
        if not np.any(mask):
            continue
        seg_chroma = np.mean(chroma[:, mask], axis=1)
        norm = float(np.linalg.norm(seg_chroma))
        if norm <= 1e-6:
            raw_indices.append(-1)
            raw_scores.append(0.0)
            window_ranges.append((int(start_ms), int(end_ms)))
            continue

        seg_unit = seg_chroma / norm
        # Suppress nearly flat/noisy chroma windows (poor tonal contrast)
        contrast = float(np.max(seg_unit) - np.mean(seg_unit))
        if contrast < 0.14:
            raw_indices.append(-1)
            raw_scores.append(0.0)
            window_ranges.append((int(start_ms), int(end_ms)))
            continue

        best_idx = -1
        best_sim = -1.0
        for idx, (_, _, _, tmpl) in enumerate(_TRIAD_TEMPLATES):
            sim = float(np.dot(seg_unit, tmpl))
            if sim > best_sim:
                best_sim = sim
                best_idx = idx

        if best_sim >= min_similarity:
            raw_indices.append(best_idx)
            raw_scores.append(best_sim)
        else:
            raw_indices.append(-1)
            raw_scores.append(best_sim)
        window_ranges.append((int(start_ms), int(end_ms)))

    if not raw_indices:
        return []

    # Median filter chord indices (kernel=3) when >= 3 segments exist to damp 1-window flicker
    if len(raw_indices) >= 3:
        filtered_indices = [int(v) for v in medfilt(np.array(raw_indices, dtype=np.int32), kernel_size=3)]
    else:
        filtered_indices = raw_indices

    merged: list[ChordEvent] = []
    for seg_idx, tmpl_idx in enumerate(filtered_indices):
        if tmpl_idx < 0:
            continue
        symbol, root, quality, _ = _TRIAD_TEMPLATES[tmpl_idx]
        start_ms, end_ms = window_ranges[seg_idx]
        sim = max(0.0, min(1.0, raw_scores[seg_idx]))
        # Normalize cosine similarity [0.55..1.0] into conservative confidence [0.35..0.95]
        conf = round(max(0.35, min(0.95, (sim - 0.35) / 0.65)), 3)

        if merged and merged[-1].symbol == symbol and start_ms <= merged[-1].end_ms + 50:
            prev = merged[-1]
            avg_conf = round((prev.confidence + conf) / 2.0, 3)
            merged[-1] = prev.model_copy(update={"end_ms": max(prev.end_ms, end_ms), "confidence": avg_conf})
        else:
            merged.append(
                ChordEvent(
                    start_ms=start_ms,
                    end_ms=max(start_ms + 1, end_ms),
                    symbol=symbol,
                    root=root,
                    quality=quality,
                    confidence=conf,
                )
            )

    return merged


class LibrosaMusicalAnalyzer(AudioAnalysisInterface):
    """
    CPU-only musical analysis engine using librosa, NumPy, SciPy, and soundfile.

    Provides documented heuristic estimates for tempo, beat grid, Krumhansl-Schmuckler
    key/scale, 12-bin chroma distribution, and basic triad chords, with explicit
    confidence and uncertainty reporting for silence, noise, short clips, unusual
    tuning, and rubato/tempo drift.
    """

    ANALYSIS_SR = 22050
    HOP_LENGTH = 512
    SILENCE_RMS_THRESHOLD = 1e-4
    SHORT_TEMPO_MIN_SECONDS = 1.5
    SHORT_KEY_MIN_SECONDS = 0.5
    NOISE_FLATNESS_THRESHOLD = 0.35

    async def analyze(
        self,
        decoded: DecodedAudio,
        options: dict[str, Any] | None = None,
    ) -> AudioAnalysisResult:
        return await asyncio.to_thread(self._analyze_sync, decoded, options or {})

    def _analyze_sync(
        self,
        decoded: DecodedAudio,
        options: dict[str, Any],
    ) -> AudioAnalysisResult:
        wav_path = Path(decoded.working_wav_path)
        if not wav_path.is_file():
            raise AudioValidationError(
                f"Decoded audio file '{wav_path.name}' is missing for musical analysis.",
                code="DECODED_AUDIO_MISSING",
                status_code=500,
            )

        try:
            raw_audio, native_sr = sf.read(str(wav_path), dtype="float32", always_2d=False)
        except Exception as exc:
            raise AudioValidationError(
                f"Unable to read decoded PCM audio for musical analysis ({type(exc).__name__}).",
                code="UNREADABLE_AUDIO_STREAM",
            ) from exc

        if raw_audio is None or raw_audio.size == 0:
            raise AudioValidationError(
                "Decoded audio stream is empty (0 samples).",
                code="EMPTY_AUDIO_STREAM",
            )

        y_native = np.mean(raw_audio, axis=1, dtype=np.float32) if raw_audio.ndim > 1 else np.asarray(raw_audio, dtype=np.float32)
        if not np.all(np.isfinite(y_native)):
            y_native = np.nan_to_num(y_native, nan=0.0, posinf=0.0, neginf=0.0)

        duration_sec = float(len(y_native)) / float(native_sr)
        duration_ms = max(1, int(round(duration_sec * 1000.0)))

        # Resample to 22.05 kHz for balanced CPU speed and musical resolution
        if native_sr != self.ANALYSIS_SR and len(y_native) > 0:
            y = librosa.resample(y_native, orig_sr=native_sr, target_sr=self.ANALYSIS_SR)
            sr = self.ANALYSIS_SR
        else:
            y = y_native
            sr = int(native_sr)

        warnings: list[str] = []
        rms_global = float(np.sqrt(np.mean(np.square(y), dtype=np.float64)))
        peak_abs = float(np.max(np.abs(y))) if len(y) > 0 else 0.0

        # 1. Explicit Silence Handling (never fabricate tempo, key, or chords)
        if rms_global < self.SILENCE_RMS_THRESHOLD or peak_abs < self.SILENCE_RMS_THRESHOLD:
            warnings.append(
                "Audio contains silence or near-silent energy; tempo, beat grid, key, and chords cannot be reliably estimated."
            )
            return AudioAnalysisResult(
                tempo_bpm=None,
                tempo_confidence=0.0,
                tempo_stability="unavailable",
                time_signature=None,
                estimated_key=None,
                key_root=None,
                scale=None,
                key_confidence=0.0,
                tuning_offset_cents=None,
                beats=[],
                chords=[],
                chroma_summary=None,
                audio_duration_ms=duration_ms,
                sample_rate_hz=int(native_sr),
                reliability="unreliable",
                reliability_score=0.0,
                warnings=warnings,
            )

        # Low-level / clipped / low-quality diagnostics
        if rms_global < 0.005:
            warnings.append("Recording level is very quiet; analysis confidence may be reduced.")
        clipping_ratio = float(np.mean(np.abs(y) >= 0.995))
        if clipping_ratio > 0.02:
            warnings.append("Significant audio clipping detected; harmonic and beat accuracy may be degraded.")
        if decoded.source_metadata.sample_rate_hz < 16000:
            warnings.append(
                f"Low source sample rate ({decoded.source_metadata.sample_rate_hz} Hz); upper harmonics may be limited."
            )

        # Normalize analysis copy (original file is never modified)
        y_norm = y / max(peak_abs, 1e-6)

        # Passband spectral flatness assesses noise-like vs tonal signal cleanly
        mean_flatness = _passband_spectral_flatness(y_norm, sr, hop_length=self.HOP_LENGTH)
        is_broadband_noise = mean_flatness >= self.NOISE_FLATNESS_THRESHOLD

        if is_broadband_noise:
            warnings.append(
                "High broadband noise or lack of harmonic content detected; tonal key and chord estimates are unreliable."
            )

        # 2. Tuning Estimation (detect A440 deviation and align chroma extraction)
        tuning_offset_cents: float | None = None
        tuning_bins = 0.0
        if not is_broadband_noise and duration_sec >= 0.4:
            try:
                tuning_bins = float(librosa.estimate_tuning(y=y_norm, sr=sr))
                tuning_offset_cents = round(tuning_bins * 100.0, 1)
                if abs(tuning_offset_cents) >= 20.0:
                    warnings.append(
                        f"Non-standard tuning offset detected ({tuning_offset_cents:+.1f} cents relative to A=440 Hz); chroma was tuning-adjusted."
                    )
            except Exception:
                tuning_bins = 0.0
                tuning_offset_cents = None

        # 3. Harmonic-Percussive Separation & Chroma Extraction
        if len(y_norm) >= 2048:
            try:
                y_harm, y_perc = librosa.effects.hpss(y_norm)
            except Exception:
                y_harm, y_perc = y_norm, y_norm
        else:
            y_harm, y_perc = y_norm, y_norm

        n_fft = min(2048, max(256, 2 ** int(np.floor(np.log2(max(256, len(y_norm)))))))
        hop_length = min(self.HOP_LENGTH, max(128, n_fft // 4))
        hop_ms = max(1, int(round((hop_length / float(sr)) * 1000.0)))

        # Use CQT chroma when audio is long enough for lowest octave filterbank, else STFT chroma
        try:
            if duration_sec >= 0.75:
                chroma = librosa.feature.chroma_cqt(
                    y=y_harm,
                    sr=sr,
                    hop_length=hop_length,
                    tuning=tuning_bins,
                )
            else:
                chroma = librosa.feature.chroma_stft(
                    y=y_harm,
                    sr=sr,
                    n_fft=n_fft,
                    hop_length=hop_length,
                    tuning=tuning_bins,
                )
        except Exception:
            chroma = librosa.feature.chroma_stft(
                y=y_harm,
                sr=sr,
                n_fft=n_fft,
                hop_length=hop_length,
            )

        chroma = np.nan_to_num(chroma, nan=0.0, posinf=0.0, neginf=0.0)
        chroma_frame_count = int(chroma.shape[1])
        chroma_mean_raw = np.mean(chroma, axis=1) if chroma_frame_count > 0 else np.zeros(12, dtype=np.float64)
        chroma_sum = float(np.sum(chroma_mean_raw))
        chroma_dist = (chroma_mean_raw / chroma_sum) if chroma_sum > 1e-9 else np.zeros(12, dtype=np.float64)

        chroma_summary = ChromaSummary(
            pitch_classes={
                name: round(float(chroma_dist[idx]), 4)
                for idx, name in enumerate(PITCH_CLASS_NAMES)
            },
            hop_ms=hop_ms,
            frame_count=chroma_frame_count,
            mean_energy=round(float(np.mean(chroma_mean_raw)), 4),
        )

        # 4. Tempo, Beat Grid & Rubato Stability Estimation
        tempo_bpm: float | None = None
        tempo_confidence = 0.0
        tempo_stability: Literal["steady", "moderate_variation", "rubato_or_uncertain", "unavailable"] = "unavailable"
        time_signature: str | None = None
        beats: list[BeatMarker] = []
        beat_times_ms: list[int] = []

        if duration_sec < self.SHORT_TEMPO_MIN_SECONDS:
            warnings.append(
                f"Recording is very short ({duration_sec:.2f}s < {self.SHORT_TEMPO_MIN_SECONDS:.1f}s); tempo and beat-grid estimation suppressed."
            )
        elif is_broadband_noise:
            warnings.append("Broadband noise lacks clear rhythmic transients; tempo and beat-grid estimation suppressed.")
        else:
            onset_source = y_perc if float(np.sqrt(np.mean(np.square(y_perc)))) > 0.02 else y_norm
            onset_env = librosa.onset.onset_strength(y=onset_source, sr=sr, hop_length=hop_length)
            onset_std = float(np.std(onset_env)) if onset_env.size > 0 else 0.0
            onset_max = float(np.max(onset_env)) if onset_env.size > 0 else 0.0
            onset_mean = float(np.mean(onset_env)) if onset_env.size > 0 else 0.0

            # Need measurable rhythmic modulation (a pure steady sine drone has almost flat onset envelope)
            onset_peak_ratio = (onset_max / max(onset_mean, 1e-6)) if onset_mean > 1e-6 else 0.0
            if onset_std < 0.08 or onset_peak_ratio < 1.8:
                tempo_stability = "unavailable"
                warnings.append(
                    "Insufficient rhythmic transient energy (e.g., sustained drone or legato passage); tempo and beat grid could not be reliably tracked."
                )
            else:
                raw_tempo, beat_frames = librosa.beat.beat_track(
                    onset_envelope=onset_env,
                    sr=sr,
                    hop_length=hop_length,
                    units="frames",
                )
                tempo_scalar = float(np.asarray(raw_tempo).reshape(-1)[0]) if np.asarray(raw_tempo).size > 0 else 0.0
                beat_times_sec = librosa.frames_to_time(beat_frames, sr=sr, hop_length=hop_length)

                if tempo_scalar > 0.0 and len(beat_times_sec) >= 2:
                    # Also measure raw onset-peak regularity to detect rubato/tempo drift
                    # (beat_track's DP regularizes beats toward a constant tempo, so raw onset
                    # peaks expose genuine tempo acceleration/deceleration or rubato!)
                    onset_peaks = librosa.util.peak_pick(
                        onset_env,
                        pre_max=3,
                        post_max=3,
                        pre_avg=3,
                        post_avg=5,
                        delta=max(0.2, onset_std * 0.6),
                        wait=max(3, int(round(0.20 * sr / hop_length))),
                    )
                    peak_times_sec = librosa.frames_to_time(onset_peaks, sr=sr, hop_length=hop_length)
                    if len(peak_times_sec) >= 4:
                        peak_ibis = np.diff(peak_times_sec)
                        peak_median = float(np.median(peak_ibis))
                        valid_peak_ibis = peak_ibis[
                            (peak_ibis >= 0.45 * peak_median) & (peak_ibis <= 1.85 * peak_median)
                        ]
                        ibi_for_cv = valid_peak_ibis if len(valid_peak_ibis) >= 3 else np.diff(beat_times_sec)
                    else:
                        ibi_for_cv = np.diff(beat_times_sec)

                    mean_ibi = float(np.mean(ibi_for_cv))
                    std_ibi = float(np.std(ibi_for_cv))
                    ibi_cv = (std_ibi / mean_ibi) if mean_ibi > 1e-6 else 1.0

                    # Pulse clarity from onset autocorrelation strength
                    tempogram = librosa.feature.tempogram(onset_envelope=onset_env, sr=sr, hop_length=hop_length)
                    pulse_strength = float(np.mean(np.max(tempogram[1:], axis=0))) if tempogram.shape[0] > 1 else 0.0

                    if ibi_cv <= 0.06:
                        tempo_stability = "steady"
                    elif ibi_cv <= 0.14:
                        tempo_stability = "moderate_variation"
                    else:
                        tempo_stability = "rubato_or_uncertain"
                        warnings.append(
                            "Significant tempo variation or rubato detected; single global BPM and beat grid are approximate."
                        )

                    raw_conf = 0.55 * min(1.0, pulse_strength) + 0.45 * max(0.0, 1.0 - ibi_cv * 3.5)
                    if duration_sec < 3.0:
                        raw_conf *= 0.75
                        warnings.append("Short recording (< 3.0s) limits global tempo precision.")
                    tempo_confidence = round(max(0.1, min(0.95, raw_conf)), 3)
                    tempo_bpm = round(tempo_scalar, 2)

                    # Heuristic 4/4 beat grouping (documented as heuristic, not guaranteed meter)
                    beats_per_bar = 4
                    time_signature = "4/4"
                    for idx, t_sec in enumerate(beat_times_sec):
                        t_ms = int(round(float(t_sec) * 1000.0))
                        beat_times_ms.append(t_ms)
                        beats.append(
                            BeatMarker(
                                time_ms=t_ms,
                                beat_number=(idx % beats_per_bar) + 1,
                                bar_number=(idx // beats_per_bar) + 1,
                                is_downbeat=(idx % beats_per_bar == 0),
                            )
                        )
                else:
                    warnings.append("Could not detect a consistent beat grid in this recording.")

        # 5. Key & Scale Estimation (Krumhansl-Schmuckler)
        estimated_key: str | None = None
        key_root: str | None = None
        scale: str | None = None
        key_confidence = 0.0

        chroma_contrast = float(np.max(chroma_dist) - np.min(chroma_dist)) if chroma_dist.size == 12 else 0.0
        if is_broadband_noise or chroma_contrast < 0.05:
            warnings.append("Insufficient pitched harmonic contrast for reliable key estimation.")
        elif duration_sec < self.SHORT_KEY_MIN_SECONDS:
            warnings.append(
                f"Recording is very short ({duration_sec:.2f}s); key estimation confidence is capped."
            )
            ks_key, ks_root, ks_scale, best_r, second_r, rel_amb = _estimate_key_krumhansl_schmuckler(chroma_dist)
            if best_r >= 0.45:
                estimated_key = ks_key
                key_root = ks_root
                scale = ks_scale
                key_confidence = round(min(0.45, max(0.15, best_r * 0.5)), 3)
        else:
            ks_key, ks_root, ks_scale, best_r, second_r, rel_amb = _estimate_key_krumhansl_schmuckler(chroma_dist)
            if best_r >= 0.35:
                estimated_key = ks_key
                key_root = ks_root
                scale = ks_scale
                margin = max(0.0, best_r - second_r)
                # Blend correlation strength + separation margin, penalized by spectral flatness
                flatness_factor = max(0.25, 1.0 - mean_flatness * 1.4)
                dur_factor = 0.75 if duration_sec < 2.0 else 1.0
                conf = (0.65 * max(0.0, best_r) + 0.35 * min(1.0, margin * 4.0)) * flatness_factor * dur_factor
                key_confidence = round(max(0.1, min(0.95, conf)), 3)
                if rel_amb:
                    warnings.append(
                        f"Close Krumhansl-Schmuckler correlation between '{ks_key}' and its relative key; scale mode may be ambiguous."
                    )
            else:
                warnings.append(
                    "Weak tonal correlation across Krumhansl-Schmuckler profiles; key could not be reliably determined."
                )

        # 6. Basic Chroma-Based Chord Estimation (suppressed on silence/noise)
        chords: list[ChordEvent] = []
        if not is_broadband_noise and chroma_frame_count > 0 and chroma_contrast >= 0.06:
            frame_times_ms = librosa.frames_to_time(
                np.arange(chroma_frame_count), sr=sr, hop_length=hop_length
            ) * 1000.0
            chords = _extract_chords_from_chroma(
                chroma=chroma,
                frame_times_ms=frame_times_ms,
                duration_ms=duration_ms,
                beat_times_ms=beat_times_ms,
            )
            if not chords and duration_sec >= 1.5:
                warnings.append("No chords met the harmonic confidence threshold; chord track left empty.")

        # 7. Overall Reliability Indicator
        active_scores: list[float] = []
        if tempo_bpm is not None:
            active_scores.append(tempo_confidence)
        if estimated_key is not None:
            active_scores.append(key_confidence)
        if chords:
            active_scores.append(float(np.mean([c.confidence for c in chords])))

        if not active_scores or is_broadband_noise:
            reliability_score = round(float(np.mean(active_scores)) * 0.4, 3) if active_scores else 0.0
            reliability: Literal["high", "medium", "low", "unreliable"] = "unreliable"
        else:
            reliability_score = round(float(np.mean(active_scores)), 3)
            if reliability_score >= 0.72 and tempo_bpm is not None and estimated_key is not None:
                reliability = "high"
            elif reliability_score >= 0.45:
                reliability = "medium"
            else:
                reliability = "low"

        return AudioAnalysisResult(
            tempo_bpm=tempo_bpm,
            tempo_confidence=tempo_confidence,
            tempo_stability=tempo_stability,
            time_signature=time_signature,
            estimated_key=estimated_key,
            key_root=key_root,
            scale=scale,
            key_confidence=key_confidence,
            tuning_offset_cents=tuning_offset_cents,
            beats=beats,
            chords=chords,
            chroma_summary=chroma_summary,
            audio_duration_ms=duration_ms,
            sample_rate_hz=int(native_sr),
            reliability=reliability,
            reliability_score=reliability_score,
            instrument_tags=[],
            warnings=warnings,
        )
