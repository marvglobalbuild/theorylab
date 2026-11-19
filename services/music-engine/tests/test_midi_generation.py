from __future__ import annotations

import asyncio
from pathlib import Path

import mido
import pytest

from app.core.errors import ValidationError
from app.processing.instruments import GM_DRUM_CLOSED_HAT, GM_DRUM_KICK, GM_DRUM_SNARE
from app.processing.interfaces import MIDIExportRequest, NoteEvent
from app.processing.midi import (
    MIDITrackSpec,
    MidoMIDIBuilder,
    ms_to_ticks,
    normalize_mido_key_signature,
    parse_time_signature,
)


def test_midi_helpers_normalize_keys_time_signatures_and_ticks() -> None:
    assert normalize_mido_key_signature("C major") == "C"
    assert normalize_mido_key_signature("A minor") == "Am"
    assert normalize_mido_key_signature("Eb major") == "Eb"
    assert normalize_mido_key_signature("F# minor") == "F#m"
    assert normalize_mido_key_signature("D# major") == "Eb"
    assert normalize_mido_key_signature("   ") is None

    assert parse_time_signature("3/4") == (3, 4)
    assert parse_time_signature("6/8") == (6, 8)
    assert parse_time_signature("invalid") == (4, 4)

    # At 120 BPM and 480 TPB, 500ms == 1 beat == 480 ticks
    assert ms_to_ticks(0, 120.0, 480) == 0
    assert ms_to_ticks(500, 120.0, 480) == 480
    assert ms_to_ticks(2000, 120.0, 480) == 1920


def test_multitrack_midi_generation_preserves_metadata_programs_channels_and_delta_times(
    tmp_path: Path,
) -> None:
    builder = MidoMIDIBuilder()
    out_path = tmp_path / "arrangement.mid"

    tracks = [
        MIDITrackSpec(
            instrument_id="piano",
            track_name="Acoustic Grand Piano",
            gm_program=0,
            channel=0,
            is_percussion=False,
            volume=0.82,
            pan=56,
            notes=[
                NoteEvent(start_ms=0, end_ms=500, midi_pitch=60, velocity=82, voice="piano", confidence=0.95),
                NoteEvent(start_ms=0, end_ms=500, midi_pitch=64, velocity=80, voice="piano", confidence=0.95),
                NoteEvent(start_ms=500, end_ms=1000, midi_pitch=60, velocity=84, voice="piano", confidence=0.95),
            ],
        ),
        MIDITrackSpec(
            instrument_id="strings",
            track_name="String Ensemble",
            gm_program=48,
            channel=1,
            is_percussion=False,
            volume=0.68,
            pan=74,
            notes=[
                NoteEvent(start_ms=0, end_ms=2000, midi_pitch=67, velocity=70, voice="strings", confidence=0.95),
            ],
        ),
        MIDITrackSpec(
            instrument_id="bass",
            track_name="Acoustic Bass",
            gm_program=32,
            channel=2,
            is_percussion=False,
            volume=0.85,
            pan=64,
            notes=[
                NoteEvent(start_ms=0, end_ms=1000, midi_pitch=36, velocity=92, voice="bass", confidence=0.95),
                NoteEvent(start_ms=1000, end_ms=2000, midi_pitch=43, velocity=88, voice="bass", confidence=0.95),
            ],
        ),
        MIDITrackSpec(
            instrument_id="drums",
            track_name="Standard Drum Kit & Percussion",
            gm_program=0,
            channel=9,
            is_percussion=True,
            volume=0.78,
            pan=64,
            notes=[
                NoteEvent(start_ms=0, end_ms=150, midi_pitch=GM_DRUM_KICK, velocity=96, voice="drums", confidence=0.95),
                NoteEvent(start_ms=500, end_ms=650, midi_pitch=GM_DRUM_SNARE, velocity=90, voice="drums", confidence=0.95),
                NoteEvent(start_ms=1000, end_ms=1150, midi_pitch=GM_DRUM_CLOSED_HAT, velocity=72, voice="drums", confidence=0.95),
            ],
        ),
    ]

    result = asyncio.run(
        builder.build_multitrack_midi(
            tracks=tracks,
            tempo_bpm=120.0,
            time_signature="4/4",
            key_signature="C major",
            output_path=out_path,
        )
    )

    assert out_path.is_file()
    assert result.track_count == 5  # conductor track 0 + 4 instrument tracks
    assert result.note_count == 9
    assert result.tempo_bpm == 120.0
    assert result.time_signature == "4/4"
    assert result.key_signature == "C"
    assert result.duration_ms >= 2000

    # Reopen with mido and verify exact SMF Format 1 structure
    mid = mido.MidiFile(str(out_path))
    assert mid.type == 1
    assert mid.ticks_per_beat == 480
    assert len(mid.tracks) == 5

    # Conductor track checks
    meta_msgs = {msg.type: msg for msg in mid.tracks[0]}
    assert meta_msgs["set_tempo"].tempo == mido.bpm2tempo(120.0)
    assert (meta_msgs["time_signature"].numerator, meta_msgs["time_signature"].denominator) == (4, 4)
    assert meta_msgs["key_signature"].key == "C"

    # Per-track program change, channel, note pairing, and non-negative delta times
    expected_programs = {1: (0, 0), 2: (1, 48), 3: (2, 32)}
    for idx, (exp_ch, exp_prog) in expected_programs.items():
        trk = mid.tracks[idx]
        prog_msgs = [m for m in trk if m.type == "program_change"]
        assert len(prog_msgs) == 1
        assert prog_msgs[0].channel == exp_ch
        assert prog_msgs[0].program == exp_prog

        note_ons = [m for m in trk if m.type == "note_on" and m.velocity > 0]
        note_offs = [m for m in trk if m.type == "note_off"]
        assert len(note_ons) == len(note_offs)
        assert all(m.time >= 0 for m in trk)
        assert all(m.channel == exp_ch for m in note_ons + note_offs)

    # Verify repeated note C4 at tick 480 has note_off BEFORE note_on (clean re-articulation)
    piano_trk = mid.tracks[1]
    abs_tick = 0
    events_at_480: list[str] = []
    for msg in piano_trk:
        abs_tick += msg.time
        if msg.type in {"note_on", "note_off"} and msg.note == 60 and abs_tick == 480:
            events_at_480.append(msg.type)
    assert events_at_480 == ["note_off", "note_on"]

    # Percussion track must strictly use channel 9 and omit melodic program_change
    drum_trk = mid.tracks[4]
    assert not any(m.type == "program_change" for m in drum_trk)
    drum_notes = [m for m in drum_trk if m.type in {"note_on", "note_off"}]
    assert len(drum_notes) == 6
    assert all(m.channel == 9 for m in drum_notes)


def test_midi_interface_build_midi_handles_transposition_and_invalid_inputs(tmp_path: Path) -> None:
    builder = MidoMIDIBuilder()
    out_path = tmp_path / "single.mid"
    req = MIDIExportRequest(
        notes=[
            NoteEvent(start_ms=0, end_ms=400, midi_pitch=60, velocity=80, voice="piano", confidence=0.9),
            NoteEvent(start_ms=400, end_ms=800, midi_pitch=64, velocity=80, voice="piano", confidence=0.9),
        ],
        tempo_bpm=100.0,
        time_signature="3/4",
        transpose_semitones=2,
    )
    res = asyncio.run(builder.build_midi(req, out_path))
    assert res.note_count == 2
    assert res.track_count == 2

    reopened = mido.MidiFile(str(out_path))
    pitches = [m.note for m in reopened.tracks[1] if m.type == "note_on" and m.velocity > 0]
    assert pitches == [62, 66]

    # Melodic track explicitly assigned to percussion channel 9 must be rejected
    with pytest.raises(ValidationError) as exc_info:
        asyncio.run(
            builder.build_multitrack_midi(
                tracks=[
                    MIDITrackSpec(
                        instrument_id="piano",
                        track_name="Bad Piano",
                        gm_program=0,
                        channel=9,
                        is_percussion=False,
                        notes=[],
                    )
                ],
                tempo_bpm=120.0,
                time_signature="4/4",
                key_signature="C major",
                output_path=tmp_path / "bad.mid",
            )
        )
    assert exc_info.value.code == "INVALID_MIDI_CHANNEL"

    # Zero or negative tempo must be rejected
    with pytest.raises(ValidationError) as tempo_exc:
        asyncio.run(
            builder.build_multitrack_midi(
                tracks=[],
                tempo_bpm=0.0,
                time_signature="4/4",
                key_signature=None,
                output_path=tmp_path / "zero_tempo.mid",
            )
        )
    assert tempo_exc.value.code == "INVALID_MIDI_TEMPO"
