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


class ParsedMIDITrack(BaseModel):
    track_index: int
    track_name: str
    channel: int = Field(default=0, ge=0, le=15)
    program: int = Field(default=0, ge=0, le=127)
    is_percussion: bool = False
    notes: list[NoteEvent] = Field(default_factory=list)


class ParsedMIDISong(BaseModel):
    tempo_bpm: float
    time_signature: str
    key_signature: str | None = None
    duration_ms: int
    ticks_per_beat: int
    tracks: list[ParsedMIDITrack] = Field(default_factory=list)
    melody_notes: list[NoteEvent] = Field(default_factory=list)


def parse_midi_file(midi_path: Path) -> ParsedMIDISong:
    """
    Parses a Standard MIDI File (.mid/.midi) non-destructively:
      - Reads tempo changes, time signatures, key signatures.
      - Pairs note_on and note_off events with accurate millisecond timings.
      - Preserves individual track identities, GM programs, channels, and velocities.
      - Identifies principal melodic voice for the arrangement engine.
    """
    mid = mido.MidiFile(str(midi_path))
    ticks_per_beat = mid.ticks_per_beat or 480

    # 1. First pass: extract tempo, time signature, and key signature
    tempos: list[tuple[int, int]] = []  # (abs_tick, tempo_us_per_beat)
    time_signatures: list[tuple[int, str]] = []  # (abs_tick, "num/den")
    key_signatures: list[str] = []

    for trk in mid.tracks:
        abs_tick = 0
        for msg in trk:
            abs_tick += msg.time
            if msg.type == "set_tempo":
                tempos.append((abs_tick, msg.tempo))
            elif msg.type == "time_signature":
                time_signatures.append((abs_tick, f"{msg.numerator}/{msg.denominator}"))
            elif msg.type == "key_signature":
                key_signatures.append(msg.key)

    tempos.sort(key=lambda x: x[0])
    if not tempos:
        tempos = [(0, 500000)]  # Default 120 BPM

    time_signature = time_signatures[0][1] if time_signatures else "4/4"
    key_signature = key_signatures[0] if key_signatures else None
    bpm = round(mido.tempo2bpm(tempos[0][1]), 2)

    def tick_to_ms(target_tick: int) -> int:
        if target_tick <= 0:
            return 0
        elapsed_sec = 0.0
        prev_tick = 0
        current_tempo = tempos[0][1]

        for tempo_tick, tempo_val in tempos:
            if target_tick <= tempo_tick:
                break
            delta = tempo_tick - prev_tick
            elapsed_sec += mido.tick2second(delta, ticks_per_beat, current_tempo)
            prev_tick = tempo_tick
            current_tempo = tempo_val

        remaining_delta = target_tick - prev_tick
        elapsed_sec += mido.tick2second(remaining_delta, ticks_per_beat, current_tempo)
        return int(round(elapsed_sec * 1000.0))

    # 2. Second pass: parse each track's notes and metadata
    parsed_tracks: list[ParsedMIDITrack] = []
    all_melodic_notes: list[NoteEvent] = []

    for trk_idx, trk in enumerate(mid.tracks):
        abs_tick = 0
        track_name = f"Track {trk_idx + 1}"
        program = 0
        channel = 0
        is_percussion = False

        active_notes: dict[tuple[int, int], tuple[int, int]] = {}
        track_notes: list[NoteEvent] = []

        for msg in trk:
            abs_tick += msg.time
            msg_ms = tick_to_ms(abs_tick)

            if msg.type == "track_name":
                cleaned = msg.name.strip()
                if cleaned:
                    track_name = cleaned
            elif msg.type == "program_change":
                program = msg.program
                channel = msg.channel
                if channel == 9:
                    is_percussion = True
            elif msg.type == "note_on":
                ch = msg.channel
                pitch = msg.note
                vel = msg.velocity
                if ch == 9:
                    is_percussion = True
                if vel > 0:
                    active_notes[(ch, pitch)] = (msg_ms, vel)
                else:
                    if (ch, pitch) in active_notes:
                        start_ms, start_vel = active_notes.pop((ch, pitch))
                        end_ms = max(start_ms + 40, msg_ms)
                        ev = NoteEvent(
                            start_ms=start_ms,
                            end_ms=end_ms,
                            midi_pitch=pitch,
                            velocity=start_vel,
                            confidence=1.0,
                            voice=track_name,
                        )
                        track_notes.append(ev)
            elif msg.type == "note_off":
                ch = msg.channel
                pitch = msg.note
                if ch == 9:
                    is_percussion = True
                if (ch, pitch) in active_notes:
                    start_ms, start_vel = active_notes.pop((ch, pitch))
                    end_ms = max(start_ms + 40, msg_ms)
                    ev = NoteEvent(
                        start_ms=start_ms,
                        end_ms=end_ms,
                        midi_pitch=pitch,
                        velocity=start_vel,
                        confidence=1.0,
                        voice=track_name,
                    )
                    track_notes.append(ev)

        final_track_ms = tick_to_ms(abs_tick)
        for (ch, pitch), (start_ms, start_vel) in active_notes.items():
            end_ms = max(start_ms + 80, final_track_ms)
            track_notes.append(
                NoteEvent(
                    start_ms=start_ms,
                    end_ms=end_ms,
                    midi_pitch=pitch,
                    velocity=start_vel,
                    confidence=1.0,
                    voice=track_name,
                )
            )

        track_notes.sort(key=lambda n: n.start_ms)

        if track_notes or trk_idx > 0 or program > 0:
            parsed_trk = ParsedMIDITrack(
                track_index=trk_idx,
                track_name=track_name,
                channel=channel,
                program=program,
                is_percussion=is_percussion,
                notes=track_notes,
            )
            parsed_tracks.append(parsed_trk)
            if not is_percussion:
                all_melodic_notes.extend(track_notes)

    # 3. Identify principal melody voice
    melody_notes: list[NoteEvent] = []
    melodic_tracks = [t for t in parsed_tracks if not t.is_percussion and t.notes]
    if melodic_tracks:
        best_track = max(
            melodic_tracks,
            key=lambda t: (len(t.notes), sum(n.midi_pitch for n in t.notes) / len(t.notes)),
        )
        melody_notes = best_track.notes
    elif all_melodic_notes:
        melody_notes = all_melodic_notes

    melody_notes.sort(key=lambda n: n.start_ms)

    duration_ms = int(round(mid.length * 1000.0))
    if duration_ms <= 0 and parsed_tracks:
        duration_ms = max((max((n.end_ms for n in t.notes), default=0) for t in parsed_tracks), default=1000)

    # Infer diatonic key if missing
    if not key_signature and melody_notes:
        pc_counts = [0] * 12
        for n in melody_notes:
            pc_counts[n.midi_pitch % 12] += max(1, n.end_ms - n.start_ms)
        best_root = max(range(12), key=lambda i: pc_counts[i])
        root_names = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
        key_signature = f"{root_names[best_root]} major"

    return ParsedMIDISong(
        tempo_bpm=bpm,
        time_signature=time_signature,
        key_signature=key_signature,
        duration_ms=duration_ms,
        ticks_per_beat=ticks_per_beat,
        tracks=parsed_tracks,
        melody_notes=melody_notes,
    )


def parsed_midi_to_analysis_and_pitch(
    parsed: ParsedMIDISong,
) -> tuple[AudioAnalysisResult, PitchExtractionResult]:
    """Converts parsed MIDI structures directly into harmonic analysis and pitch representations."""
    from app.processing.interfaces import AudioAnalysisResult, BeatMarker, PitchExtractionResult

    # Generate beat grid
    ms_per_beat = (60000.0 / parsed.tempo_bpm) if parsed.tempo_bpm > 0 else 500.0
    beats: list[BeatMarker] = []
    num, den = parse_time_signature(parsed.time_signature)
    total_beats = max(1, int(parsed.duration_ms / ms_per_beat) + 1)
    for b_idx in range(total_beats):
        b_time = int(b_idx * ms_per_beat)
        if b_time > parsed.duration_ms:
            break
        beat_num = (b_idx % num) + 1
        bar_num = (b_idx // num) + 1
        beats.append(
            BeatMarker(
                time_ms=b_time,
                beat_number=beat_num,
                bar_number=bar_num,
                is_downbeat=(beat_num == 1),
            )
        )

    key_label = parsed.key_signature or "C major"
    analysis_res = AudioAnalysisResult(
        tempo_bpm=parsed.tempo_bpm,
        tempo_confidence=1.0,
        tempo_stability="steady",
        time_signature=parsed.time_signature,
        estimated_key=key_label,
        key_confidence=0.98,
        beats=beats,
        chords=[],
        audio_duration_ms=parsed.duration_ms,
        sample_rate_hz=44100,
        reliability="high",
        reliability_score=0.99,
        analysis_method="midi_symbolic_parser",
        is_heuristic=False,
        warnings=[],
    )

    notes = parsed.melody_notes
    pitch_range = (
        (min(n.midi_pitch for n in notes), max(n.midi_pitch for n in notes))
        if notes
        else (60, 72)
    )

    pitch_res = PitchExtractionResult(
        mode="polyphonic",
        hop_ms=10,
        contours=[],
        voiced_ratio=1.0 if notes else 0.0,
        mean_confidence=1.0,
        note_events=notes,
        pitch_range_midi=pitch_range,
        voiced_regions=[],
        unvoiced_regions=[],
        audio_duration_ms=parsed.duration_ms,
        sample_rate_hz=44100,
        extractor_method="midi_symbolic_parser",
        monophonic_only_notice="Direct symbolic MIDI input; bypasses monophonic vocal pYIN pitch extraction.",
        warnings=[],
    )

    return analysis_res, pitch_res


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
