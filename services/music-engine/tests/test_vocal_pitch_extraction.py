from __future__ import annotations

import asyncio
from pathlib import Path

import numpy as np
import pytest
import soundfile as sf

from app.core.errors import ModelNotIntegratedError
from app.processing.interfaces import DecodedAudio
from app.processing.pitch import LibrosaPyinPitchExtractor
from app.schemas.audio import AudioFormat, AudioMetadata


def _make_decoded(wav_path: Path, sr: int = 44100, duration_ms: int = 2000) -> DecodedAudio:
    meta = AudioMetadata(
        detected_format=AudioFormat.WAV,
        mime_type="audio/wav",
        size_bytes=wav_path.stat().st_size if wav_path.is_file() else 1024,
        sha256_checksum="1" * 64,
        duration_ms=duration_ms,
        sample_rate_hz=sr,
        channels=1,
        codec_name="pcm_s16le",
    )
    return DecodedAudio(
        working_wav_path=str(wav_path),
        sample_rate_hz=sr,
        channels=1,
        duration_ms=duration_ms,
        source_metadata=meta,
    )


def _synth_vocal_phrase(
    path: Path,
    segments: list[tuple[float | None, float]],
    *,
    sr: int = 44100,
    vibrato_cents: float = 0.0,
    vibrato_rate_hz: float = 5.5,
) -> tuple[Path, int]:
    """
    Synthesize a deterministic monophonic vocal-like melody with harmonic overtones
    (f0 + 2*f0 + 3*f0), smooth ADSR edges, and optional natural vibrato.
    `segments` is a list of `(frequency_hz_or_None_for_rest, duration_sec)`.
    """
    chunks: list[np.ndarray] = []
    for freq_hz, dur_sec in segments:
        n = int(round(dur_sec * sr))
        if freq_hz is None:
            chunks.append(np.zeros(n, dtype=np.float64))
            continue
        t = np.arange(n, dtype=np.float64) / sr
        if vibrato_cents > 0.0:
            # Instantaneous frequency with smooth sinusoidal vibrato
            semitone_mod = (vibrato_cents / 100.0) * np.sin(2.0 * np.pi * vibrato_rate_hz * t)
            inst_freq = freq_hz * (2.0 ** (semitone_mod / 12.0))
            phase = 2.0 * np.pi * np.cumsum(inst_freq) / sr
        else:
            phase = 2.0 * np.pi * freq_hz * t

        sig = 0.65 * np.sin(phase) + 0.25 * np.sin(2.0 * phase) + 0.10 * np.sin(3.0 * phase)
        attack = np.minimum(1.0, t / 0.02)
        release = np.minimum(1.0, np.maximum(0.0, (dur_sec - t) / 0.025))
        chunks.append(0.75 * sig * attack * release)

    y = np.concatenate(chunks) if chunks else np.zeros(sr, dtype=np.float64)
    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(path), y.astype(np.float32), sr, subtype="PCM_16")
    return path, int(round((len(y) / sr) * 1000))


def test_sustained_a4_frequency_midi_voiced_regions_and_single_note_event(tmp_path: Path) -> None:
    # 0.35s rest -> 1.10s sustained A4 (440 Hz, MIDI 69) -> 0.35s rest
    wav_path, dur_ms = _synth_vocal_phrase(
        tmp_path / "sustained_a4.wav",
        [(None, 0.35), (440.0, 1.10), (None, 0.35)],
    )
    extractor = LibrosaPyinPitchExtractor()
    result = asyncio.run(extractor.extract_pitch(_make_decoded(wav_path, duration_ms=dur_ms)))

    assert result.mode == "monophonic"
    assert result.audio_duration_ms == pytest.approx(dur_ms, abs=15)
    assert result.sample_rate_hz == 44100
    assert result.total_frame_count == len(result.contours)
    assert result.voiced_frame_count > 20
    assert 0.35 <= result.voiced_ratio <= 0.85
    assert result.mean_confidence >= 0.70

    voiced_points = [pt for pt in result.contours if pt.voiced]
    unvoiced_points = [pt for pt in result.contours if not pt.voiced]
    assert len(voiced_points) == result.voiced_frame_count
    assert len(unvoiced_points) > 10
    assert all(pt.frequency_hz is None and pt.midi_note is None for pt in unvoiced_points)

    median_hz = float(np.median([pt.frequency_hz for pt in voiced_points if pt.frequency_hz is not None]))
    median_midi = float(np.median([pt.midi_note for pt in voiced_points if pt.midi_note is not None]))
    assert abs(median_hz - 440.0) <= 3.0
    assert abs(median_midi - 69.0) <= 0.15

    # Voiced/unvoiced regions clearly separated
    assert len(result.voiced_regions) == 1
    assert len(result.unvoiced_regions) >= 2

    # Pitch frames are NOT 1:1 with note events: 40+ voiced frames collapse to 1 clean NoteEvent
    assert len(result.note_events) == 1
    note = result.note_events[0]
    assert note.midi_pitch == 69
    assert note.clef_hint == "treble"
    assert note.end_ms - note.start_ms >= 800
    assert note.confidence >= 0.70


def test_monophonic_melodic_contour_with_vibrato_segments_distinct_note_events(tmp_path: Path) -> None:
    # C4 (261.63) -> D4 (293.66) -> E4 (329.63) -> rest -> G4 (392.00) with natural +-18 cents vibrato
    wav_path, dur_ms = _synth_vocal_phrase(
        tmp_path / "melody_c_d_e_g.wav",
        [
            (None, 0.15),
            (261.63, 0.55),  # MIDI 60
            (293.66, 0.55),  # MIDI 62
            (329.63, 0.55),  # MIDI 64
            (None, 0.25),
            (392.00, 0.65),  # MIDI 67
            (None, 0.15),
        ],
        vibrato_cents=18.0,
    )
    extractor = LibrosaPyinPitchExtractor()
    result = asyncio.run(extractor.extract_pitch(_make_decoded(wav_path, duration_ms=dur_ms)))

    pitches = [ev.midi_pitch for ev in result.note_events]
    assert pitches == [60, 62, 64, 67]
    # Strictly ordered non-overlapping note timestamps
    for prev, nxt in zip(result.note_events[:-1], result.note_events[1:]):
        assert prev.end_ms <= nxt.start_ms + 30
    assert result.pitch_range_midi is not None
    assert result.pitch_range_midi[0] <= 61.0
    assert result.pitch_range_midi[1] >= 66.0


def test_pitch_extraction_handles_silence_and_noise_without_hallucinating_notes(tmp_path: Path) -> None:
    sr = 44100
    extractor = LibrosaPyinPitchExtractor()

    # Silence
    silence_path = tmp_path / "silence.wav"
    sf.write(str(silence_path), np.zeros(sr * 2, dtype=np.float32), sr, subtype="PCM_16")
    sil_res = asyncio.run(extractor.extract_pitch(_make_decoded(silence_path, duration_ms=2000)))
    assert sil_res.voiced_frame_count == 0
    assert sil_res.voiced_ratio == 0.0
    assert sil_res.note_events == []
    assert sil_res.voiced_regions == []
    assert len(sil_res.unvoiced_regions) == 1
    assert any("silence" in w.lower() for w in sil_res.warnings)

    # White noise
    rng = np.random.default_rng(7)
    noise_path = tmp_path / "noise.wav"
    sf.write(str(noise_path), (0.3 * rng.standard_normal(sr * 2)).astype(np.float32), sr, subtype="PCM_16")
    noise_res = asyncio.run(extractor.extract_pitch(_make_decoded(noise_path, duration_ms=2000)))
    assert noise_res.voiced_ratio <= 0.10
    assert noise_res.note_events == []
    assert any("noise" in w.lower() or "no reliable" in w.lower() for w in noise_res.warnings)


def test_polyphonic_pitch_mode_honestly_raises_model_not_integrated(tmp_path: Path) -> None:
    wav_path, dur_ms = _synth_vocal_phrase(tmp_path / "mono.wav", [(440.0, 0.6)])
    extractor = LibrosaPyinPitchExtractor()

    with pytest.raises(ModelNotIntegratedError) as exc_info:
        asyncio.run(extractor.extract_pitch(_make_decoded(wav_path, duration_ms=dur_ms), mode="polyphonic"))

    assert exc_info.value.code == "MODEL_NOT_INTEGRATED"
    assert exc_info.value.retryable is False
    assert exc_info.value.details["requested_mode"] == "polyphonic"
    assert exc_info.value.details["supported_mode"] == "monophonic"
