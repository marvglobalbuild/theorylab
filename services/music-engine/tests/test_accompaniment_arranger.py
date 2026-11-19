from __future__ import annotations

import pytest

from app.core.errors import InstrumentResourceError
from app.processing.arranger import ArrangementConfig, ArrangementStyle, SonoraAccompanimentArranger
from app.processing.instruments import InstrumentResourceManager
from app.processing.interfaces import (
    AudioAnalysisResult,
    ChordEvent,
    NoteEvent,
    PitchExtractionResult,
)


def _make_major_analysis_and_pitch() -> tuple[AudioAnalysisResult, PitchExtractionResult]:
    # 8-bar vocal melody at 120 BPM (bar = 2000ms, total = 16000ms) in C major,
    # singing in comfortable soprano/alto register (MIDI 67-76) with intentional breathing gaps.
    analysis = AudioAnalysisResult(
        tempo_bpm=120.0,
        tempo_confidence=0.88,
        tempo_stability="steady",
        time_signature="4/4",
        estimated_key="C major",
        key_root="C",
        scale="major",
        key_confidence=0.84,
        chords=[
            ChordEvent(start_ms=0, end_ms=2000, symbol="C", root="C", quality="major", confidence=0.82),
            ChordEvent(start_ms=2000, end_ms=4000, symbol="Am", root="A", quality="minor", confidence=0.80),
            ChordEvent(start_ms=4000, end_ms=6000, symbol="F", root="F", quality="major", confidence=0.79),
            ChordEvent(start_ms=6000, end_ms=8000, symbol="G", root="G", quality="major", confidence=0.81),
            ChordEvent(start_ms=8000, end_ms=10000, symbol="C", root="C", quality="major", confidence=0.83),
            ChordEvent(start_ms=10000, end_ms=12000, symbol="Am", root="A", quality="minor", confidence=0.78),
            ChordEvent(start_ms=12000, end_ms=14000, symbol="G", root="G", quality="major", confidence=0.80),
            ChordEvent(start_ms=14000, end_ms=16000, symbol="C", root="C", quality="major", confidence=0.85),
        ],
        audio_duration_ms=16000,
        sample_rate_hz=44100,
        reliability="high",
        reliability_score=0.85,
    )
    vocal_notes = [
        # Bar 0 (dense vocal)
        NoteEvent(start_ms=100, end_ms=900, midi_pitch=72, velocity=86, confidence=0.92),
        NoteEvent(start_ms=950, end_ms=1850, midi_pitch=76, velocity=88, confidence=0.90),
        # Bar 1 (dense vocal)
        NoteEvent(start_ms=2100, end_ms=2950, midi_pitch=72, velocity=84, confidence=0.91),
        NoteEvent(start_ms=3000, end_ms=3850, midi_pitch=69, velocity=82, confidence=0.89),
        # Bar 2 (dense vocal)
        NoteEvent(start_ms=4100, end_ms=5600, midi_pitch=77, velocity=86, confidence=0.90),
        # Bar 3 (phrase ending with vocal rest in second half)
        NoteEvent(start_ms=6100, end_ms=6800, midi_pitch=74, velocity=80, confidence=0.88),
        # Bar 4-7
        NoteEvent(start_ms=8100, end_ms=9700, midi_pitch=72, velocity=86, confidence=0.92),
        NoteEvent(start_ms=10100, end_ms=11600, midi_pitch=76, velocity=85, confidence=0.90),
        NoteEvent(start_ms=12100, end_ms=13200, midi_pitch=74, velocity=84, confidence=0.91),
        NoteEvent(start_ms=14100, end_ms=15600, midi_pitch=72, velocity=88, confidence=0.93),
    ]
    pitch = PitchExtractionResult(
        mode="monophonic",
        hop_ms=12,
        contours=[],
        note_events=vocal_notes,
        voiced_ratio=0.72,
        mean_confidence=0.90,
        pitch_range_midi=(69.0, 77.0),
        audio_duration_ms=16000,
        sample_rate_hz=44100,
    )
    return analysis, pitch


def _make_minor_analysis_and_pitch() -> tuple[AudioAnalysisResult, PitchExtractionResult]:
    analysis = AudioAnalysisResult(
        tempo_bpm=96.0,
        tempo_confidence=0.82,
        tempo_stability="steady",
        time_signature="4/4",
        estimated_key="A minor",
        key_root="A",
        scale="minor",
        key_confidence=0.80,
        chords=[],
        audio_duration_ms=10000,
        sample_rate_hz=44100,
        reliability="medium",
        reliability_score=0.68,
    )
    pitch = PitchExtractionResult(
        mode="monophonic",
        hop_ms=12,
        contours=[],
        note_events=[
            NoteEvent(start_ms=100, end_ms=1800, midi_pitch=69, velocity=80, confidence=0.90),
            NoteEvent(start_ms=2600, end_ms=4200, midi_pitch=72, velocity=82, confidence=0.90),
            NoteEvent(start_ms=5100, end_ms=6900, midi_pitch=76, velocity=84, confidence=0.91),
            NoteEvent(start_ms=7600, end_ms=9400, midi_pitch=69, velocity=82, confidence=0.90),
        ],
        voiced_ratio=0.65,
        mean_confidence=0.90,
        pitch_range_midi=(69.0, 76.0),
        audio_duration_ms=10000,
        sample_rate_hz=44100,
    )
    return analysis, pitch


def test_arranger_major_key_melody_preservation_register_bounds_and_voice_leading(test_settings) -> None:
    mgr = InstrumentResourceManager(test_settings)
    arranger = SonoraAccompanimentArranger(mgr)
    analysis, pitch = _make_major_analysis_and_pitch()

    plan = arranger.arrange(
        analysis=analysis,
        pitch=pitch,
        config=ArrangementConfig(
            style="cinematic",
            selected_instruments=["piano", "strings", "bass", "brass", "woodwinds", "drums"],
            energy=0.6,
            density=0.55,
        ),
    )

    assert plan.key == "C major"
    assert plan.harmony_source == "reliable_analysis_chords"
    assert plan.total_bars == 8
    assert plan.chords[-1].roman_numeral == "I"  # authentic cadence resolution
    assert plan.chords[-2].roman_numeral == "V"

    # Melody register clearance: chord voicings stay below active vocal melody (min_midi >= 69)
    for chord in plan.chords:
        if chord.vocal_active_ratio >= 0.25:
            assert max(chord.voiced_midi) <= 69

    # Smooth voice leading: adjacent bar voicing centers never jump wildly (<= 7 semitones)
    for prev, curr in zip(plan.chords, plan.chords[1:]):
        prev_center = sum(prev.voiced_midi) / len(prev.voiced_midi)
        curr_center = sum(curr.voiced_midi) / len(curr.voiced_midi)
        assert abs(curr_center - prev_center) <= 7.0

    # All 6 instrument families produced valid tracks strictly inside their GM register bounds
    by_id = {trk.instrument_id: trk for trk in plan.tracks}
    assert set(by_id.keys()) == {"piano", "strings", "bass", "brass", "woodwinds", "drums"}
    for inst_id, trk in by_id.items():
        spec = mgr.resolve_instrument(inst_id)
        assert len(trk.notes) > 0
        if spec.is_percussion:
            assert trk.channel == 9
        else:
            assert trk.channel != 9
            assert all(spec.min_midi <= n.midi_pitch <= spec.max_midi for n in trk.notes)

    # Phrase-aware restraint: woodwinds do not spam notes during every dense singing bar
    assert len(by_id["woodwinds"].notes) < len(by_id["piano"].notes)


def test_arranger_minor_key_and_uncertain_key_conservative_fallbacks(test_settings) -> None:
    mgr = InstrumentResourceManager(test_settings)
    arranger = SonoraAccompanimentArranger(mgr)

    # Minor key with no reliable Run 1 chords -> diatonic minor fallback
    minor_analysis, minor_pitch = _make_minor_analysis_and_pitch()
    minor_plan = arranger.arrange(
        analysis=minor_analysis,
        pitch=minor_pitch,
        config=ArrangementConfig(style="classical"),
    )
    assert minor_plan.key == "A minor"
    assert minor_plan.scale == "minor"
    assert minor_plan.harmony_source == "estimated_key_diatonic_fallback"
    assert minor_plan.chords[-1].roman_numeral == "i"
    assert len(minor_plan.warnings) >= 1

    # Low-confidence key + no chords + no vocal pitch -> conservative C major default + explicit warnings
    uncertain_analysis = AudioAnalysisResult(
        tempo_bpm=None,
        tempo_confidence=0.1,
        tempo_stability="unavailable",
        estimated_key=None,
        key_confidence=0.12,
        audio_duration_ms=8000,
        sample_rate_hz=44100,
        reliability="unreliable",
        reliability_score=0.1,
    )
    empty_pitch = PitchExtractionResult(
        mode="monophonic",
        hop_ms=12,
        contours=[],
        note_events=[],
        audio_duration_ms=8000,
        sample_rate_hz=44100,
    )
    fallback_plan = arranger.arrange(
        analysis=uncertain_analysis,
        pitch=empty_pitch,
        config=ArrangementConfig(style="ballad"),
    )
    assert fallback_plan.key == "C major"
    assert fallback_plan.harmony_source == "conservative_default_fallback"
    assert fallback_plan.tempo_bpm == 76.0  # ballad fallback tempo
    assert len(fallback_plan.warnings) >= 2
    assert any(len(t.notes) > 0 for t in fallback_plan.tracks)


def test_arranger_five_styles_produce_distinct_arrangements_and_are_deterministic(test_settings) -> None:
    mgr = InstrumentResourceManager(test_settings)
    arranger = SonoraAccompanimentArranger(mgr)
    analysis, pitch = _make_major_analysis_and_pitch()

    styles: list[ArrangementStyle] = ["ballad", "pop", "gospel", "classical", "cinematic"]
    signatures: dict[str, tuple[int, tuple[str, ...], int]] = {}

    for style in styles:
        cfg = ArrangementConfig(style=style, energy=0.65, density=0.6)
        plan_a = arranger.arrange(analysis=analysis, pitch=pitch, config=cfg)
        plan_b = arranger.arrange(analysis=analysis, pitch=pitch, config=cfg)

        # Strict determinism: identical inputs yield byte-for-byte identical plans
        assert plan_a.model_dump() == plan_b.model_dump()

        piano_trk = next(t for t in plan_a.tracks if t.instrument_id == "piano")
        total_notes = sum(len(t.notes) for t in plan_a.tracks)
        chord_symbols = tuple(c.symbol for c in plan_a.chords)
        signatures[style] = (len(piano_trk.notes), chord_symbols, total_notes)

    # All 5 styles must produce meaningfully distinct musical signatures
    assert len(set(signatures.values())) == 5
    # Classical has no drums by default; Pop/Gospel/Ballad/Cinematic include drums
    classical_plan = arranger.arrange(analysis=analysis, pitch=pitch, config=ArrangementConfig(style="classical"))
    assert "drums" not in {t.instrument_id for t in classical_plan.tracks}


def test_arranger_extensible_controls_overrides_transpose_intro_outro_and_validation(test_settings) -> None:
    mgr = InstrumentResourceManager(test_settings)
    arranger = SonoraAccompanimentArranger(mgr)
    analysis, pitch = _make_major_analysis_and_pitch()

    cfg = ArrangementConfig(
        style="pop",
        key_override="G major",
        tempo_override_bpm=108.0,
        transpose_semitones=2,
        intro_bars=2,
        outro_bars=1,
        enabled_tracks={"brass": False, "drums": False},
        instrument_volumes={"piano": 0.91},
    )
    plan = arranger.arrange(analysis=analysis, pitch=pitch, config=cfg)

    assert plan.harmony_source == "user_override"
    assert plan.key == "A major"  # G major + 2 semitones
    assert plan.tempo_bpm == 108.0
    assert plan.intro_bars == 2
    assert plan.outro_bars == 1
    assert plan.total_bars >= 2 + 1 + 2

    ids = {t.instrument_id for t in plan.tracks}
    assert "brass" not in ids
    assert "drums" not in ids
    piano = next(t for t in plan.tracks if t.instrument_id == "piano")
    assert piano.volume == pytest.approx(0.91)

    # Unknown instrument must fail explicitly via InstrumentResourceError
    with pytest.raises(InstrumentResourceError) as exc_info:
        arranger.arrange(
            analysis=analysis,
            pitch=pitch,
            config=ArrangementConfig(selected_instruments=["nonexistent_theremin"]),
        )
    assert exc_info.value.code == "UNKNOWN_INSTRUMENT"
