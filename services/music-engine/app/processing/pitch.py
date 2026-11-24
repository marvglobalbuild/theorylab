from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any, Literal

import librosa
import numpy as np
import soundfile as sf
from scipy.signal import medfilt

from app.core.errors import AudioValidationError, ModelNotIntegratedError
from app.core.logging import get_logger
from app.processing.interfaces import (
    DecodedAudio,
    NoteEvent,
    PitchExtractionInterface,
    PitchExtractionResult,
    PitchPoint,
    TimeRegion,
)

logger = get_logger("pitch")


def hz_to_midi(frequency_hz: float) -> float:
    return float(69.0 + 12.0 * np.log2(frequency_hz / 440.0))


def _smooth_voiced_midi_spans(midi_series: np.ndarray, voiced_mask: np.ndarray) -> np.ndarray:
    """
    Apply gentle 3-frame median smoothing inside each contiguous voiced span so
    single-frame octave/pitch glitches are removed without smearing across note boundaries
    or unvoiced rests.
    """
    smoothed = midi_series.copy()
    n = len(midi_series)
    i = 0
    while i < n:
        if not voiced_mask[i]:
            i += 1
            continue
        start = i
        while i < n and voiced_mask[i]:
            i += 1
        span_len = i - start
        if span_len >= 3:
            smoothed[start:i] = medfilt(midi_series[start:i], kernel_size=3)
    return smoothed


def _build_regions(
    voiced_mask: np.ndarray,
    frame_times_ms: np.ndarray,
    confidences: np.ndarray,
    hop_ms: int,
    duration_ms: int,
) -> tuple[list[TimeRegion], list[TimeRegion]]:
    voiced_regions: list[TimeRegion] = []
    unvoiced_regions: list[TimeRegion] = []
    n = len(voiced_mask)
    if n == 0:
        return voiced_regions, [TimeRegion(start_ms=0, end_ms=duration_ms, mean_confidence=0.0)]

    start_idx = 0
    current_state = bool(voiced_mask[0])
    for idx in range(1, n + 1):
        at_end = idx == n
        if at_end or bool(voiced_mask[idx]) != current_state:
            s_ms = int(frame_times_ms[start_idx])
            e_ms = duration_ms if at_end else int(frame_times_ms[idx])
            if e_ms <= s_ms:
                e_ms = min(duration_ms, s_ms + hop_ms)
            mean_c = round(float(np.mean(confidences[start_idx:idx])), 3)
            region = TimeRegion(start_ms=s_ms, end_ms=e_ms, mean_confidence=mean_c)
            if current_state:
                voiced_regions.append(region)
            else:
                unvoiced_regions.append(region)
            if not at_end:
                start_idx = idx
                current_state = bool(voiced_mask[idx])

    return voiced_regions, unvoiced_regions


def _segment_note_events(
    *,
    midi_series: np.ndarray,
    voiced_mask: np.ndarray,
    confidences: np.ndarray,
    rms_frames: np.ndarray,
    frame_times_ms: np.ndarray,
    hop_ms: int,
    duration_ms: int,
    pitch_tolerance_semitones: float = 0.65,
    min_note_duration_ms: int = 80,
) -> list[NoteEvent]:
    """
    Segment frame-level monophonic pitch contours into discrete musical NoteEvents.

    Distinct from raw pitch frames:
      - Groups contiguous voiced frames staying within `pitch_tolerance_semitones` of the
        segment's running median pitch (preserving natural vocal vibrato without fragmenting notes).
      - Splits cleanly on genuine melodic leaps (>= 0.65 semitones) or unvoiced rests.
      - Discards transient pitch blips shorter than `min_note_duration_ms`.
    """
    n = len(voiced_mask)
    if n == 0:
        return []

    peak_rms = float(np.max(rms_frames)) if rms_frames.size > 0 else 1.0
    events: list[NoteEvent] = []

    def _flush_segment(indices: list[int]) -> None:
        if not indices:
            return
        start_idx = indices[0]
        end_idx = indices[-1]
        start_ms = int(frame_times_ms[start_idx])
        end_ms = (
            int(frame_times_ms[end_idx + 1])
            if end_idx + 1 < n
            else min(duration_ms, int(frame_times_ms[end_idx]) + hop_ms)
        )
        if end_ms - start_ms < min_note_duration_ms:
            return

        seg_midis = midi_series[indices]
        median_midi = float(np.median(seg_midis))
        midi_pitch = max(0, min(127, int(round(median_midi))))
        seg_conf = round(max(0.0, min(1.0, float(np.mean(confidences[indices])))), 3)
        seg_rms = float(np.mean(rms_frames[indices])) if rms_frames.size >= end_idx + 1 else peak_rms
        rel_amp = max(0.0, min(1.0, seg_rms / max(peak_rms, 1e-6)))
        velocity = max(35, min(115, int(round(40 + rel_amp * 72))))
        clef_hint: Literal["treble", "bass", "alto", "tenor"] = "bass" if midi_pitch < 55 else "treble"

        events.append(
            NoteEvent(
                start_ms=start_ms,
                end_ms=max(start_ms + 1, end_ms),
                midi_pitch=midi_pitch,
                velocity=velocity,
                voice="melody",
                clef_hint=clef_hint,
                confidence=seg_conf,
            )
        )

    active_indices: list[int] = []
    for idx in range(n):
        if not voiced_mask[idx] or not np.isfinite(midi_series[idx]):
            _flush_segment(active_indices)
            active_indices = []
            continue

        if not active_indices:
            active_indices = [idx]
            continue

        running_median = float(np.median(midi_series[active_indices]))
        if abs(float(midi_series[idx]) - running_median) <= pitch_tolerance_semitones:
            active_indices.append(idx)
        else:
            _flush_segment(active_indices)
            active_indices = [idx]

    _flush_segment(active_indices)
    return events


class LibrosaPyinPitchExtractor(PitchExtractionInterface):
    """
    CPU-only monophonic vocal / melody pitch extractor powered by librosa.pyin.

    Scope notice:
      - Designed strictly for solo vocals or predominantly monophonic melodies.
      - Does NOT perform polyphonic multi-instrument transcription; requests with
        `mode="polyphonic"` honestly raise `ModelNotIntegratedError`.
    """

    ANALYSIS_SR = 22050
    DEFAULT_FRAME_LENGTH = 2048
    DEFAULT_HOP_LENGTH = 512
    DEFAULT_FMIN_HZ = 65.41  # C2
    DEFAULT_FMAX_HZ = 1046.50  # C6
    SILENCE_RMS_THRESHOLD = 1e-4
    NOISE_FLATNESS_THRESHOLD = 0.42

    async def extract_pitch(
        self,
        decoded: DecodedAudio,
        mode: Literal["monophonic", "polyphonic"] = "monophonic",
        options: dict[str, Any] | None = None,
    ) -> PitchExtractionResult:
        if mode != "monophonic":
            raise ModelNotIntegratedError(
                "pitch_extraction",
                "PitchExtractionInterface",
                details={
                    "requested_mode": mode,
                    "supported_mode": "monophonic",
                    "reason": (
                        "librosa.pyin provides monophonic vocal/melody pitch extraction only "
                        "and cannot transcribe polyphonic multi-instrument recordings."
                    ),
                },
            )
        return await asyncio.to_thread(self._extract_monophonic_sync, decoded, options or {})

    def _extract_monophonic_sync(
        self,
        decoded: DecodedAudio,
        options: dict[str, Any],
    ) -> PitchExtractionResult:
        wav_path = Path(decoded.working_wav_path)
        if not wav_path.is_file():
            raise AudioValidationError(
                f"Decoded audio file '{wav_path.name}' is missing for vocal pitch extraction.",
                code="DECODED_AUDIO_MISSING",
                status_code=500,
            )

        try:
            raw_audio, native_sr = sf.read(str(wav_path), dtype="float32", always_2d=False)
        except Exception as exc:
            raise AudioValidationError(
                f"Unable to read decoded PCM audio for pitch extraction ({type(exc).__name__}).",
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

        if native_sr != self.ANALYSIS_SR and len(y_native) > 0:
            y = librosa.resample(y_native, orig_sr=native_sr, target_sr=self.ANALYSIS_SR)
            sr = self.ANALYSIS_SR
        else:
            y = y_native
            sr = int(native_sr)

        fmin_hz = float(options.get("fmin_hz", self.DEFAULT_FMIN_HZ))
        fmax_hz = float(options.get("fmax_hz", self.DEFAULT_FMAX_HZ))
        fmin_hz = max(40.0, min(fmin_hz, 500.0))
        fmax_hz = max(fmin_hz * 2.0, min(fmax_hz, sr / 2.5))
        min_voiced_prob = float(options.get("min_voiced_prob", 0.30))
        min_note_duration_ms = int(options.get("min_note_duration_ms", 80))
        resolution = float(options.get("resolution", 0.15))

        frame_length = min(self.DEFAULT_FRAME_LENGTH, max(512, 2 ** int(np.floor(np.log2(max(512, len(y)))))))
        hop_length = min(self.DEFAULT_HOP_LENGTH, max(128, frame_length // 4))
        hop_ms = max(1, int(round((hop_length / float(sr)) * 1000.0)))

        warnings: list[str] = []
        rms_global = float(np.sqrt(np.mean(np.square(y), dtype=np.float64)))
        peak_abs = float(np.max(np.abs(y))) if len(y) > 0 else 0.0

        # 1. Explicit Silence Handling
        if rms_global < self.SILENCE_RMS_THRESHOLD or peak_abs < self.SILENCE_RMS_THRESHOLD:
            warnings.append("Audio contains silence or near-silent energy; no vocal pitch detected.")
            return PitchExtractionResult(
                mode="monophonic",
                hop_ms=hop_ms,
                contours=[],
                voiced_regions=[],
                unvoiced_regions=[TimeRegion(start_ms=0, end_ms=duration_ms, mean_confidence=0.0)],
                note_events=[],
                voiced_frame_count=0,
                total_frame_count=0,
                voiced_ratio=0.0,
                mean_confidence=0.0,
                pitch_range_midi=None,
                audio_duration_ms=duration_ms,
                sample_rate_hz=int(native_sr),
                warnings=warnings,
            )

        y_norm = y / max(peak_abs, 1e-6)

        # Frame-level energy & passband spectral flatness (80Hz..8kHz) for noise/unvoiced gating
        rms_frames = librosa.feature.rms(y=y_norm, frame_length=frame_length, hop_length=hop_length)[0]
        S_pow = np.abs(librosa.stft(y_norm, n_fft=frame_length, hop_length=hop_length)) ** 2
        freqs = librosa.fft_frequencies(sr=sr, n_fft=frame_length)
        band = (freqs >= 80.0) & (freqs <= min(8000.0, 0.80 * (sr / 2.0)))
        S_band = np.maximum(S_pow[band, :], 1e-12)
        flatness_frames = np.exp(np.mean(np.log(S_band), axis=0)) / np.maximum(np.mean(S_band, axis=0), 1e-12)
        mean_flatness = float(np.mean(flatness_frames)) if flatness_frames.size > 0 else 1.0

        # 2. Run librosa.pyin monophonic F0 estimation
        f0, voiced_flag, voiced_probs = librosa.pyin(
            y_norm,
            fmin=fmin_hz,
            fmax=fmax_hz,
            sr=sr,
            frame_length=frame_length,
            hop_length=hop_length,
            resolution=resolution,
            fill_na=np.nan,
        )

        n_frames = len(f0)
        frame_times_ms = np.round(
            librosa.frames_to_time(np.arange(n_frames), sr=sr, hop_length=hop_length) * 1000.0
        ).astype(np.int64)

        # Align auxiliary frame arrays safely
        rms_aligned = rms_frames[:n_frames] if len(rms_frames) >= n_frames else np.pad(rms_frames, (0, n_frames - len(rms_frames)))
        flat_aligned = (
            flatness_frames[:n_frames]
            if len(flatness_frames) >= n_frames
            else np.pad(flatness_frames, (0, n_frames - len(flatness_frames)), constant_values=1.0)
        )
        probs_clean = np.nan_to_num(voiced_probs, nan=0.0, posinf=1.0, neginf=0.0)
        probs_clean = np.clip(probs_clean, 0.0, 1.0)

        peak_frame_rms = float(np.max(rms_aligned)) if rms_aligned.size > 0 else 0.0
        energy_floor = max(0.015, peak_frame_rms * 0.04)

        # Gate frames: require finite F0, pyin voiced flag, sufficient voiced probability,
        # sufficient frame energy, and non-noise spectral flatness
        voiced_mask = (
            np.asarray(voiced_flag, dtype=bool)
            & np.isfinite(f0)
            & (f0 > 0.0)
            & (probs_clean >= min_voiced_prob)
            & (rms_aligned >= energy_floor)
            & (flat_aligned < self.NOISE_FLATNESS_THRESHOLD)
        )

        raw_midi = np.full(n_frames, np.nan, dtype=np.float64)
        valid_idx = np.where(voiced_mask)[0]
        if valid_idx.size > 0:
            raw_midi[valid_idx] = 69.0 + 12.0 * np.log2(f0[valid_idx] / 440.0)

        # Gentle median smoothing strictly inside contiguous voiced spans
        smoothed_midi = _smooth_voiced_midi_spans(raw_midi, voiced_mask)

        contours: list[PitchPoint] = []
        for idx in range(n_frames):
            is_v = bool(voiced_mask[idx] and np.isfinite(smoothed_midi[idx]))
            conf = round(float(probs_clean[idx]), 4)
            if is_v:
                midi_val = round(float(smoothed_midi[idx]), 3)
                freq_val = round(float(440.0 * (2.0 ** ((midi_val - 69.0) / 12.0))), 2)
                contours.append(
                    PitchPoint(
                        time_ms=int(frame_times_ms[idx]),
                        frequency_hz=freq_val,
                        midi_note=midi_val,
                        confidence=conf,
                        voiced=True,
                    )
                )
            else:
                contours.append(
                    PitchPoint(
                        time_ms=int(frame_times_ms[idx]),
                        frequency_hz=None,
                        midi_note=None,
                        confidence=conf if not is_v else 0.0,
                        voiced=False,
                    )
                )

        voiced_regions, unvoiced_regions = _build_regions(
            voiced_mask=voiced_mask,
            frame_times_ms=frame_times_ms,
            confidences=probs_clean,
            hop_ms=hop_ms,
            duration_ms=duration_ms,
        )

        note_events = _segment_note_events(
            midi_series=smoothed_midi,
            voiced_mask=voiced_mask,
            confidences=probs_clean,
            rms_frames=rms_aligned,
            frame_times_ms=frame_times_ms,
            hop_ms=hop_ms,
            duration_ms=duration_ms,
            min_note_duration_ms=min_note_duration_ms,
        )

        voiced_count = int(np.sum(voiced_mask))
        voiced_ratio = round(float(voiced_count) / float(max(1, n_frames)), 4)
        mean_conf = (
            round(float(np.mean(probs_clean[voiced_mask])), 4)
            if voiced_count > 0
            else 0.0
        )

        pitch_range_midi: tuple[float, float] | None = None
        if voiced_count > 0:
            v_midis = smoothed_midi[voiced_mask]
            pitch_range_midi = (round(float(np.min(v_midis)), 2), round(float(np.max(v_midis)), 2))

        if mean_flatness >= self.NOISE_FLATNESS_THRESHOLD:
            warnings.append(
                "High broadband noise detected; unpitched noise frames were suppressed as unvoiced."
            )
        if voiced_count == 0:
            warnings.append("No reliable monophonic voiced pitch was detected in this recording.")
        elif len(note_events) == 0:
            warnings.append(
                "Short voiced fragments were detected, but none exceeded the minimum note duration threshold."
            )
        if duration_sec < 0.5:
            warnings.append("Very short recording (< 0.5s); melodic contour and note segmentation are limited.")

        return PitchExtractionResult(
            mode="monophonic",
            hop_ms=hop_ms,
            contours=contours,
            voiced_regions=voiced_regions,
            unvoiced_regions=unvoiced_regions,
            note_events=note_events,
            voiced_frame_count=voiced_count,
            total_frame_count=n_frames,
            voiced_ratio=voiced_ratio,
            mean_confidence=mean_conf,
            pitch_range_midi=pitch_range_midi,
            audio_duration_ms=duration_ms,
            sample_rate_hz=int(native_sr),
            warnings=warnings,
        )
