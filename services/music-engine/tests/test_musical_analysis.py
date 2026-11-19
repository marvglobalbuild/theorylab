from __future__ import annotations

import asyncio
from pathlib import Path

import numpy as np
import pytest
import soundfile as sf

from app.core.errors import AudioValidationError
from app.processing.analysis import LibrosaMusicalAnalyzer
from app.processing.interfaces import DecodedAudio
from app.schemas.audio import AudioFormat, AudioMetadata


def _make_decoded(wav_path: Path, sr: int = 44100, duration_ms: int = 4000) -> DecodedAudio:
    meta = AudioMetadata(
        detected_format=AudioFormat.WAV,
        mime_type="audio/wav",
        size_bytes=wav_path.stat().st_size if wav_path.is_file() else 1024,
        sha256_checksum="0" * 64,
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


def _midi_to_hz(midi: float, a4_hz: float = 440.0) -> float:
    return float(a4_hz * (2.0 ** ((midi - 69.0) / 12.0)))


def _synth_chord_progression_wav(
    path: Path,
    chords_midi: list[list[int]],
    *,
    bpm: float = 120.0,
    beats_per_chord: int = 4,
    sr: int = 44100,
    a4_hz: float = 440.0,
    add_clicks: bool = True,
) -> tuple[Path, int]:
    beat_sec = 60.0 / bpm
    total_beats = len(chords_midi) * beats_per_chord
    total_sec = total_beats * beat_sec
    n_samples = int(round(total_sec * sr))
    y = np.zeros(n_samples, dtype=np.float64)

    for chord_idx, notes in enumerate(chords_midi):
        start_s = chord_idx * beats_per_chord * beat_sec
        end_s = (chord_idx + 1) * beats_per_chord * beat_sec
        i0 = int(round(start_s * sr))
        i1 = min(n_samples, int(round(end_s * sr)))
        t = np.arange(i1 - i0, dtype=np.float64) / sr
        seg = np.zeros_like(t)
        for midi in notes:
            f = _midi_to_hz(midi, a4_hz=a4_hz)
            seg += 0.65 * np.sin(2.0 * np.pi * f * t)
            seg += 0.25 * np.sin(2.0 * np.pi * 2.0 * f * t)
            seg += 0.10 * np.sin(2.0 * np.pi * 3.0 * f * t)
        # Gentle envelope per chord
        env = np.minimum(1.0, t / 0.03) * np.minimum(1.0, np.maximum(0.0, (t[-1] - t) / 0.05))
        y[i0:i1] += 0.22 * seg * env

    if add_clicks:
        click_len = int(0.025 * sr)
        ct = np.arange(click_len, dtype=np.float64) / sr
        click = np.sin(2.0 * np.pi * 1200.0 * ct) * np.exp(-ct * 120.0)
        for beat_idx in range(total_beats):
            b0 = int(round(beat_idx * beat_sec * sr))
            b1 = min(n_samples, b0 + click_len)
            gain = 0.65 if beat_idx % 4 == 0 else 0.45
            y[b0:b1] += gain * click[: b1 - b0]

    peak = float(np.max(np.abs(y)))
    if peak > 0:
        y = 0.85 * (y / peak)
    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(path), y.astype(np.float32), sr, subtype="PCM_16")
    return path, int(round(total_sec * 1000))


def test_tempo_beat_grid_key_and_chords_c_major_120bpm(tmp_path: Path) -> None:
    # C -> F -> G -> C at 120 BPM (8 seconds, 16 beats)
    chords = [
        [48, 60, 64, 67],  # C major
        [53, 60, 65, 69],  # F major
        [55, 59, 62, 67],  # G major
        [48, 60, 64, 67],  # C major
    ]
    wav_path, dur_ms = _synth_chord_progression_wav(
        tmp_path / "c_major_120.wav",
        chords,
        bpm=120.0,
        beats_per_chord=4,
    )
    analyzer = LibrosaMusicalAnalyzer()
    result = asyncio.run(analyzer.analyze(_make_decoded(wav_path, duration_ms=dur_ms)))

    assert result.is_heuristic is True
    assert result.audio_duration_ms == pytest.approx(dur_ms, abs=25)
    assert result.sample_rate_hz == 44100
    assert result.tempo_bpm is not None
    # Allow octave equivalence or direct 120 BPM match
    assert abs(result.tempo_bpm - 120.0) <= 4.0 or abs(result.tempo_bpm - 60.0) <= 2.5
    assert result.tempo_confidence >= 0.4
    assert result.tempo_stability in {"steady", "moderate_variation"}
    assert len(result.beats) >= 6
    assert result.beats[0].is_downbeat is True

    assert result.estimated_key == "C major"
    assert result.key_root == "C"
    assert result.scale == "major"
    assert result.key_confidence >= 0.45

    assert result.chroma_summary is not None
    assert set(result.chroma_summary.pitch_classes.keys()) == {
        "C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"
    }
    assert result.chroma_summary.pitch_classes["C"] > result.chroma_summary.pitch_classes["F#"]

    chord_symbols = {c.symbol for c in result.chords}
    assert "C" in chord_symbols
    assert "F" in chord_symbols or "G" in chord_symbols
    assert result.reliability in {"high", "medium"}
    assert result.instrument_tags == []


def test_minor_key_and_100bpm_estimation(tmp_path: Path) -> None:
    # Am -> Dm -> Em -> Am at 100 BPM
    chords = [
        [45, 57, 60, 64],  # A minor
        [50, 57, 62, 65],  # D minor
        [52, 59, 64, 67],  # E minor
        [45, 57, 60, 64],  # A minor
    ]
    wav_path, dur_ms = _synth_chord_progression_wav(
        tmp_path / "a_minor_100.wav",
        chords,
        bpm=100.0,
        beats_per_chord=4,
    )
    analyzer = LibrosaMusicalAnalyzer()
    result = asyncio.run(analyzer.analyze(_make_decoded(wav_path, duration_ms=dur_ms)))

    assert result.estimated_key == "A minor"
    assert result.key_root == "A"
    assert result.scale == "minor"
    assert result.tempo_bpm is not None
    assert abs(result.tempo_bpm - 100.0) <= 4.0


def test_rubato_tempo_variation_reports_uncertainty(tmp_path: Path) -> None:
    # Click track accelerating smoothly from 75 BPM to 150 BPM + C major pad
    sr = 44100
    click_times: list[float] = []
    t_cur = 0.2
    for step in range(14):
        click_times.append(t_cur)
        # Alternately long and short rubato spacing (0.85s -> 0.40s)
        bpm_local = 72.0 + (step / 13.0) * 84.0
        t_cur += 60.0 / bpm_local

    total_sec = t_cur + 0.4
    n_samples = int(round(total_sec * sr))
    t = np.arange(n_samples, dtype=np.float64) / sr
    y = 0.12 * (np.sin(2.0 * np.pi * 261.63 * t) + np.sin(2.0 * np.pi * 329.63 * t) + np.sin(2.0 * np.pi * 392.0 * t))

    click_len = int(0.025 * sr)
    ct = np.arange(click_len, dtype=np.float64) / sr
    click = np.sin(2.0 * np.pi * 1300.0 * ct) * np.exp(-ct * 110.0)
    for ct_sec in click_times:
        b0 = int(round(ct_sec * sr))
        b1 = min(n_samples, b0 + click_len)
        y[b0:b1] += 0.7 * click[: b1 - b0]

    y = 0.85 * y / np.max(np.abs(y))
    wav_path = tmp_path / "rubato.wav"
    sf.write(str(wav_path), y.astype(np.float32), sr, subtype="PCM_16")

    analyzer = LibrosaMusicalAnalyzer()
    result = asyncio.run(analyzer.analyze(_make_decoded(wav_path, duration_ms=int(round(total_sec * 1000)))))
    assert result.tempo_stability == "rubato_or_uncertain"
    assert any("rubato" in w.lower() or "tempo variation" in w.lower() for w in result.warnings)


def test_unusual_tuning_detected_and_chroma_adjusted(tmp_path: Path) -> None:
    # A=432 Hz (~ -31.8 cents) C major progression
    chords = [
        [48, 60, 64, 67],
        [53, 60, 65, 69],
        [55, 59, 62, 67],
        [48, 60, 64, 67],
    ]
    wav_path, dur_ms = _synth_chord_progression_wav(
        tmp_path / "a432_c_major.wav",
        chords,
        bpm=110.0,
        beats_per_chord=4,
        a4_hz=432.0,
    )
    analyzer = LibrosaMusicalAnalyzer()
    result = asyncio.run(analyzer.analyze(_make_decoded(wav_path, duration_ms=dur_ms)))

    assert result.tuning_offset_cents is not None
    assert result.tuning_offset_cents < -15.0
    assert any("tuning" in w.lower() for w in result.warnings)
    assert result.estimated_key == "C major"


def test_silence_returns_explicit_unreliable_without_fabricated_music(tmp_path: Path) -> None:
    sr = 44100
    y = np.zeros(sr * 3, dtype=np.float32)
    wav_path = tmp_path / "silence.wav"
    sf.write(str(wav_path), y, sr, subtype="PCM_16")

    analyzer = LibrosaMusicalAnalyzer()
    result = asyncio.run(analyzer.analyze(_make_decoded(wav_path, duration_ms=3000)))

    assert result.tempo_bpm is None
    assert result.estimated_key is None
    assert result.scale is None
    assert result.time_signature is None
    assert result.beats == []
    assert result.chords == []
    assert result.key_confidence == 0.0
    assert result.tempo_confidence == 0.0
    assert result.reliability == "unreliable"
    assert result.reliability_score == 0.0
    assert any("silence" in w.lower() for w in result.warnings)


def test_broadband_noise_suppresses_key_and_chords_honestly(tmp_path: Path) -> None:
    sr = 44100
    rng = np.random.default_rng(42)
    y = (0.3 * rng.standard_normal(sr * 3)).astype(np.float32)
    wav_path = tmp_path / "white_noise.wav"
    sf.write(str(wav_path), y, sr, subtype="PCM_16")

    analyzer = LibrosaMusicalAnalyzer()
    result = asyncio.run(analyzer.analyze(_make_decoded(wav_path, duration_ms=3000)))

    assert result.tempo_bpm is None
    assert result.estimated_key is None
    assert result.chords == []
    assert result.reliability == "unreliable"
    assert any("noise" in w.lower() for w in result.warnings)


def test_very_short_audio_suppresses_tempo_and_warns(tmp_path: Path) -> None:
    sr = 44100
    dur_sec = 0.45
    t = np.arange(int(sr * dur_sec), dtype=np.float64) / sr
    y = (
        0.3 * np.sin(2.0 * np.pi * 261.63 * t)
        + 0.25 * np.sin(2.0 * np.pi * 329.63 * t)
        + 0.25 * np.sin(2.0 * np.pi * 392.0 * t)
    ).astype(np.float32)
    wav_path = tmp_path / "short_clip.wav"
    sf.write(str(wav_path), y, sr, subtype="PCM_16")

    analyzer = LibrosaMusicalAnalyzer()
    result = asyncio.run(analyzer.analyze(_make_decoded(wav_path, duration_ms=450)))

    assert result.tempo_bpm is None
    assert result.beats == []
    assert result.key_confidence <= 0.5
    assert any("short" in w.lower() for w in result.warnings)


def test_missing_or_invalid_audio_raises_structured_error(tmp_path: Path) -> None:
    analyzer = LibrosaMusicalAnalyzer()

    missing_path = tmp_path / "nonexistent.wav"
    with pytest.raises(AudioValidationError) as missing_exc:
        asyncio.run(analyzer.analyze(_make_decoded(missing_path, duration_ms=1000)))
    assert missing_exc.value.code == "DECODED_AUDIO_MISSING"

    corrupt_path = tmp_path / "corrupt.wav"
    corrupt_path.write_bytes(b"NOT_A_VALID_AUDIO_FILE_HEADER_1234567890")
    with pytest.raises(AudioValidationError) as corrupt_exc:
        asyncio.run(analyzer.analyze(_make_decoded(corrupt_path, duration_ms=1000)))
    assert corrupt_exc.value.code == "UNREADABLE_AUDIO_STREAM"
