from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any

import mido
from pydantic import BaseModel, Field

from app.core.errors import ValidationError
from app.processing.interfaces import (
    MIDIExportRequest,
    MIDIProcessingInterface,
    MIDIProcessingResult,
    NoteEvent,
)

# Valid mido key_signature strings (enharmonic normalization to mido's supported set)
_MIDO_MAJOR_KEYS: dict[str, str] = {
    "C": "C",
    "C#": "C#",
    "Db": "Db",
    "D": "D",
    "D#": "Eb",
    "Eb": "Eb",
    "E": "E",
    "F": "F",
    "F#": "F#",
    "Gb": "Gb",
    "G": "G",
    "G#": "Ab",
    "Ab": "Ab",
    "A": "A",
    "A#": "Bb",
    "Bb": "Bb",
    "B": "B",
}

_MIDO_MINOR_KEYS: dict[str, str] = {
    "C": "Cm",
    "C#": "C#m",
    "Db": "C#m",
    "D": "Dm",
    "D#": "D#m",
    "Eb": "Ebm",
    "E": "Em",
    "F": "Fm",
    "F#": "F#m",
    "Gb": "F#m",
    "G": "Gm",
    "G#": "G#m",
    "Ab": "Abm",
    "A": "Am",
    "A#": "A#m",
    "Bb": "Bbm",
    "B": "Bm",
}


class MIDITrackSpec(BaseModel):
    instrument_id: str
    track_name: str
    gm_program: int = Field(default=0, ge=0, le=127)
    channel: int = Field(default=0, ge=0, le=15)
    is_percussion: bool = False
    volume: float = Field(default=0.80, ge=0.0, le=1.0)
    pan: int = Field(default=64, ge=0, le=127)
    notes: list[NoteEvent] = Field(default_factory=list)


class MultiTrackMIDIResult(BaseModel):
    midi_path: str
    track_count: int = Field(ge=1)
    instrument_tracks: list[str]
    note_count: int = Field(ge=0)
    duration_ms: int = Field(ge=0)
    tempo_bpm: float
    time_signature: str
    key_signature: str | None = None
    ticks_per_beat: int = 480


def normalize_mido_key_signature(key_label: str | None) -> str | None:
    """Convert labels like 'C major', 'A minor', 'Eb major', 'F#m' into mido key_signature format."""
    if not key_label:
        return None
    cleaned = key_label.strip()
    if not cleaned:
        return None
    parts = cleaned.split()
    if len(parts) == 2:
        root, mode = parts[0], parts[1].lower()
        if mode.startswith("min"):
            return _MIDO_MINOR_KEYS.get(root)
        if mode.startswith("maj"):
            return _MIDO_MAJOR_KEYS.get(root)
    if cleaned.endswith("m") and len(cleaned) >= 2:
        return _MIDO_MINOR_KEYS.get(cleaned[:-1])
    return _MIDO_MAJOR_KEYS.get(cleaned)


def parse_time_signature(ts: str) -> tuple[int, int]:
    """Parse '4/4', '3/4', '6/8' into valid MIDI (numerator, denominator) values."""
    try:
        num_s, den_s = ts.strip().split("/")
        num = int(num_s)
        den = int(den_s)
        if 1 <= num <= 32 and den in {1, 2, 4, 8, 16, 32}:
            return num, den
    except Exception:
        pass
    return 4, 4


def ms_to_ticks(time_ms: int, tempo_bpm: float, ticks_per_beat: int) -> int:
    if time_ms <= 0:
        return 0
    return max(0, int(round((float(time_ms) / 60000.0) * float(tempo_bpm) * float(ticks_per_beat))))


class MidoMIDIBuilder(MIDIProcessingInterface):
    """
    Standard MIDI File (Format 1) generator built on `mido`.

    Generates deterministic, spec-compliant multi-track MIDI files with:
      - Conductor track 0 (tempo, time signature, key signature)
      - Dedicated named tracks per instrument
      - General MIDI program changes, CC7 volume, and CC10 stereo pan
      - Strict percussion channel 9 handling
      - Exact delta-time calculation and guaranteed note_on / note_off pairing
      - Post-write reopening verification via `mido.MidiFile`
    """

    DEFAULT_TICKS_PER_BEAT = 480

    async def build_midi(
        self,
        request: MIDIExportRequest,
        output_path: Path,
    ) -> MIDIProcessingResult:
        return await asyncio.to_thread(self._build_single_request_sync, request, output_path)

    async def build_multitrack_midi(
        self,
        *,
        tracks: list[MIDITrackSpec],
        tempo_bpm: float,
        time_signature: str,
        key_signature: str | None,
        output_path: Path,
        ticks_per_beat: int = DEFAULT_TICKS_PER_BEAT,
    ) -> MultiTrackMIDIResult:
        return await asyncio.to_thread(
            self._build_multitrack_sync,
            tracks,
            tempo_bpm,
            time_signature,
            key_signature,
            output_path,
            ticks_per_beat,
        )

    def _build_single_request_sync(
        self,
        request: MIDIExportRequest,
        output_path: Path,
    ) -> MIDIProcessingResult:
        # Group NoteEvents by voice cleanly into separate tracks
        grouped: dict[str, list[NoteEvent]] = {}
        for ev in request.notes:
            transposed_pitch = max(0, min(127, ev.midi_pitch + request.transpose_semitones))
            grouped.setdefault(ev.voice or "melody", []).append(
                ev.model_copy(update={"midi_pitch": transposed_pitch})
            )

        midi_tracks: list[MIDITrackSpec] = []
        channel_idx = 0
        for voice_name, voice_notes in grouped.items():
            is_perc = voice_name.lower() in {"drums", "percussion"}
            if is_perc:
                ch = 9
            else:
                if channel_idx == 9:
                    channel_idx += 1
                ch = channel_idx % 16
                channel_idx += 1
            midi_tracks.append(
                MIDITrackSpec(
                    instrument_id=voice_name,
                    track_name=voice_name,
                    gm_program=0,
                    channel=ch,
                    is_percussion=is_perc,
                    notes=voice_notes,
                )
            )

        if not midi_tracks:
            midi_tracks.append(
                MIDITrackSpec(
                    instrument_id="piano",
                    track_name="Empty Track",
                    gm_program=0,
                    channel=0,
                    notes=[],
                )
            )

        res = self._build_multitrack_sync(
            tracks=midi_tracks,
            tempo_bpm=request.tempo_bpm,
            time_signature=request.time_signature,
            key_signature=None,
            output_path=output_path,
            ticks_per_beat=self.DEFAULT_TICKS_PER_BEAT,
        )
        return MIDIProcessingResult(
            midi_path=res.midi_path,
            track_count=res.track_count,
            note_count=res.note_count,
            duration_ms=res.duration_ms,
        )

    def _build_multitrack_sync(
        self,
        tracks: list[MIDITrackSpec],
        tempo_bpm: float,
        time_signature: str,
        key_signature: str | None,
        output_path: Path,
        ticks_per_beat: int,
    ) -> MultiTrackMIDIResult:
        if tempo_bpm <= 0.0:
            raise ValidationError("MIDI tempo_bpm must be greater than 0.", code="INVALID_MIDI_TEMPO")

        mid = mido.MidiFile(type=1, ticks_per_beat=ticks_per_beat)
        num, den = parse_time_signature(time_signature)
        mido_key = normalize_mido_key_signature(key_signature)

        # Track 0: Conductor / Metadata track
        meta_track = mido.MidiTrack()
        meta_track.append(mido.MetaMessage("track_name", name="SONORA Conductor", time=0))
        meta_track.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(tempo_bpm), time=0))
        meta_track.append(
            mido.MetaMessage(
                "time_signature",
                numerator=num,
                denominator=den,
                clocks_per_click=24,
                notated_32nd_notes_per_beat=8,
                time=0,
            )
        )
        if mido_key is not None:
            meta_track.append(mido.MetaMessage("key_signature", key=mido_key, time=0))
        meta_track.append(mido.MetaMessage("end_of_track", time=0))
        mid.tracks.append(meta_track)

        total_notes = 0
        max_end_ms = 0
        included_names: list[str] = []

        for spec in tracks:
            channel = 9 if spec.is_percussion else max(0, min(15, spec.channel))
            if not spec.is_percussion and channel == 9:
                raise ValidationError(
                    f"Melodic track '{spec.track_name}' cannot be assigned to GM percussion channel 9.",
                    code="INVALID_MIDI_CHANNEL",
                )

            trk = mido.MidiTrack()
            trk.append(mido.MetaMessage("track_name", name=spec.track_name, time=0))
            if not spec.is_percussion:
                trk.append(
                    mido.Message(
                        "program_change",
                        channel=channel,
                        program=max(0, min(127, spec.gm_program)),
                        time=0,
                    )
                )

            vol_cc = max(0, min(127, int(round(spec.volume * 127))))
            pan_cc = max(0, min(127, spec.pan))
            trk.append(mido.Message("control_change", channel=channel, control=7, value=vol_cc, time=0))
            trk.append(mido.Message("control_change", channel=channel, control=10, value=pan_cc, time=0))

            # Build absolute-tick event tuples: (tick, priority, pitch, velocity)
            # priority 0 = note_off, priority 1 = note_on -> ensures clean re-articulation at identical ticks
            raw_events: list[tuple[int, int, int, int]] = []
            for note in spec.notes:
                pitch = max(0, min(127, int(note.midi_pitch)))
                vel = max(1, min(127, int(note.velocity)))
                start_tick = ms_to_ticks(note.start_ms, tempo_bpm, ticks_per_beat)
                end_tick = ms_to_ticks(note.end_ms, tempo_bpm, ticks_per_beat)
                if end_tick <= start_tick:
                    end_tick = start_tick + max(1, ticks_per_beat // 8)
                raw_events.append((start_tick, 1, pitch, vel))
                raw_events.append((end_tick, 0, pitch, 0))
                total_notes += 1
                if note.end_ms > max_end_ms:
                    max_end_ms = note.end_ms

            raw_events.sort(key=lambda item: (item[0], item[1], item[2]))

            prev_tick = 0
            for tick, priority, pitch, vel in raw_events:
                delta = max(0, tick - prev_tick)
                prev_tick = tick
                if priority == 1:
                    trk.append(mido.Message("note_on", channel=channel, note=pitch, velocity=vel, time=delta))
                else:
                    trk.append(mido.Message("note_off", channel=channel, note=pitch, velocity=0, time=delta))

            trk.append(mido.MetaMessage("end_of_track", time=0))
            mid.tracks.append(trk)
            included_names.append(spec.track_name)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        mid.save(str(output_path))

        # Verify file can be cleanly reopened and parsed by mido
        verified = mido.MidiFile(str(output_path))
        verified_duration_ms = max(max_end_ms, int(round(verified.length * 1000.0)))

        return MultiTrackMIDIResult(
            midi_path=str(output_path),
            track_count=len(verified.tracks),
            instrument_tracks=included_names,
            note_count=total_notes,
            duration_ms=verified_duration_ms,
            tempo_bpm=round(float(tempo_bpm), 2),
            time_signature=f"{num}/{den}",
            key_signature=mido_key,
            ticks_per_beat=ticks_per_beat,
        )
