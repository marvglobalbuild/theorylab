from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from pydantic import BaseModel, Field

from app.processing.instruments import (
    GM_DRUM_CRASH,
    GM_DRUM_CLOSED_HAT,
    GM_DRUM_KICK,
    GM_DRUM_LOW_TOM,
    GM_DRUM_OPEN_HAT,
    GM_DRUM_RIDE,
    GM_DRUM_SIDE_STICK,
    GM_DRUM_SNARE,
    InstrumentResourceManager,
    InstrumentSpec,
)
from app.processing.interfaces import AudioAnalysisResult, NoteEvent, PitchExtractionResult
from app.processing.midi import MIDITrackSpec, parse_time_signature

ArrangementStyle = Literal["ballad", "pop", "gospel", "classical", "cinematic"]

_PITCH_CLASS_TO_INDEX: dict[str, int] = {
    "C": 0,
    "B#": 0,
    "C#": 1,
    "Db": 1,
    "D": 2,
    "D#": 3,
    "Eb": 3,
    "E": 4,
    "Fb": 4,
    "F": 5,
    "E#": 5,
    "F#": 6,
    "Gb": 6,
    "G": 7,
    "G#": 8,
    "Ab": 8,
    "A": 9,
    "A#": 10,
    "Bb": 10,
    "B": 11,
    "Cb": 11,
}

_INDEX_TO_PITCH_CLASS: tuple[str, ...] = (
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

_MAJOR_SCALE_INTERVALS: tuple[int, ...] = (0, 2, 4, 5, 7, 9, 11)
_MINOR_SCALE_INTERVALS: tuple[int, ...] = (0, 2, 3, 5, 7, 8, 10)

# Diatonic chord definitions: (scale_degree_0_based, quality, intervals_from_root, roman_label)
_MAJOR_DIATONIC: tuple[tuple[int, str, tuple[int, ...], str], ...] = (
    (0, "major", (0, 4, 7), "I"),
    (1, "minor", (0, 3, 7), "ii"),
    (2, "minor", (0, 3, 7), "iii"),
    (3, "major", (0, 4, 7), "IV"),
    (4, "major", (0, 4, 7), "V"),
    (5, "minor", (0, 3, 7), "vi"),
)

_MINOR_DIATONIC: tuple[tuple[int, str, tuple[int, ...], str], ...] = (
    (0, "minor", (0, 3, 7), "i"),
    (2, "major", (0, 4, 7), "III"),
    (3, "minor", (0, 3, 7), "iv"),
    (4, "major", (0, 4, 7), "V"),  # harmonic minor dominant for authentic resolution
    (4, "minor", (0, 3, 7), "v"),
    (5, "major", (0, 4, 7), "VI"),
    (6, "major", (0, 4, 7), "VII"),
)

_STYLE_DEFAULT_INSTRUMENTS: dict[ArrangementStyle, list[str]] = {
    "ballad": ["piano", "strings", "bass", "woodwinds", "drums"],
    "pop": ["piano", "electric_bass", "strings", "brass", "drums"],
    "gospel": ["piano", "electric_bass", "strings", "brass", "drums"],
    "classical": ["piano", "strings", "bass", "woodwinds"],
    "cinematic": ["piano", "strings", "bass", "brass", "woodwinds", "drums"],
}


class ArrangementConfig(BaseModel):
    """Extensible backend arrangement configuration ready for future studio controls."""

    style: ArrangementStyle = "ballad"
    selected_instruments: list[str] | None = None
    energy: float = Field(default=0.55, ge=0.0, le=1.0)
    density: float = Field(default=0.55, ge=0.0, le=1.0)
    key_override: str | None = None
    tempo_override_bpm: float | None = Field(default=None, ge=40.0, le=220.0)
    transpose_semitones: int = Field(default=0, ge=-12, le=12)
    intro_bars: int = Field(default=0, ge=0, le=8)
    outro_bars: int = Field(default=0, ge=0, le=8)
    instrument_volumes: dict[str, float] = Field(default_factory=dict)
    enabled_tracks: dict[str, bool] = Field(default_factory=dict)
    render_individual_stems: bool = False


class PlannedChord(BaseModel):
    bar_index: int = Field(ge=0)
    start_ms: int = Field(ge=0)
    end_ms: int = Field(ge=1)
    symbol: str
    roman_numeral: str
    root_pc: int = Field(ge=0, le=11)
    quality: str
    pitch_classes: list[int]
    voiced_midi: list[int]
    vocal_active_ratio: float = Field(ge=0.0, le=1.0)
    source: Literal["analysis_chord", "melody_diatonic", "cadence_rule", "fallback_progression"]


class ArrangementPlan(BaseModel):
    style: ArrangementStyle
    key: str
    key_root: str
    scale: Literal["major", "minor"]
    tempo_bpm: float
    time_signature: str
    beats_per_bar: int
    total_bars: int
    intro_bars: int
    outro_bars: int
    duration_ms: int
    transpose_semitones: int
    harmony_source: Literal[
        "user_override",
        "reliable_analysis_chords",
        "estimated_key_diatonic_fallback",
        "vocal_pitch_fallback",
        "conservative_default_fallback",
    ]
    chords: list[PlannedChord]
    tracks: list[MIDITrackSpec]
    warnings: list[str] = Field(default_factory=list)


@dataclass(frozen=True)
class _BarVocalProfile:
    bar_index: int
    start_ms: int
    end_ms: int
    active_ratio: float
    min_midi: int | None
    max_midi: int | None
    weighted_pitch_classes: dict[int, float]
    is_phrase_ending: bool
    is_intro_or_outro: bool


def _parse_key_string(key_str: str | None) -> tuple[int, Literal["major", "minor"]] | None:
    if not key_str:
        return None
    cleaned = key_str.strip()
    if not cleaned:
        return None
    parts = cleaned.split()
    if len(parts) >= 2:
        root_idx = _PITCH_CLASS_TO_INDEX.get(parts[0])
        mode_s = parts[1].lower()
        if root_idx is not None:
            mode: Literal["major", "minor"] = "minor" if mode_s.startswith("min") else "major"
            return root_idx, mode
    if cleaned.endswith("m") and len(cleaned) >= 2:
        root_idx = _PITCH_CLASS_TO_INDEX.get(cleaned[:-1])
        if root_idx is not None:
            return root_idx, "minor"
    root_idx = _PITCH_CLASS_TO_INDEX.get(cleaned)
    if root_idx is not None:
        return root_idx, "major"
    return None


def _build_diatonic_chord_pool(
    root_pc: int,
    scale: Literal["major", "minor"],
    style: ArrangementStyle,
) -> list[dict[str, object]]:
    intervals = _MAJOR_SCALE_INTERVALS if scale == "major" else _MINOR_SCALE_INTERVALS
    defs = _MAJOR_DIATONIC if scale == "major" else _MINOR_DIATONIC
    pool: list[dict[str, object]] = []
    for deg, quality, triad_ints, roman in defs:
        chord_root = (root_pc + intervals[deg]) % 12
        pcs = [(chord_root + iv) % 12 for iv in triad_ints]
        ext_pcs = list(pcs)
        symbol_suffix = "m" if quality == "minor" else ""
        # Gospel and Ballad enrichments (maj7 / m7 / dom7)
        if style == "gospel":
            if roman == "V":
                ext_pcs.append((chord_root + 10) % 12)
                symbol_suffix = "7"
            elif quality == "minor":
                ext_pcs.append((chord_root + 10) % 12)
                symbol_suffix = "m7"
            else:
                ext_pcs.append((chord_root + 11) % 12)
                symbol_suffix = "maj7"
        elif style == "ballad" and roman in {"ii", "vi", "IV", "iv"}:
            ext_pcs.append((chord_root + (10 if quality == "minor" else 11)) % 12)
        symbol = f"{_INDEX_TO_PITCH_CLASS[chord_root]}{symbol_suffix}"
        pool.append(
            {
                "root_pc": chord_root,
                "quality": quality,
                "roman": roman,
                "symbol": symbol,
                "triad_pcs": pcs,
                "voiced_pcs": ext_pcs,
            }
        )
    return pool


def _voice_chord_with_smooth_leading(
    pitch_classes: list[int],
    *,
    previous_voicing: list[int] | None,
    low_bound: int,
    high_bound: int,
) -> list[int]:
    """
    Build close-position chord inversions within [low_bound, high_bound] and choose the
    voicing minimizing L1 voice-leading distance from `previous_voicing`.
    """
    unique_pcs = list(dict.fromkeys(pitch_classes))
    if not unique_pcs:
        return [max(low_bound, min(high_bound, 60))]

    candidates: list[list[int]] = []
    # Generate rotations (inversions) across feasible octaves
    for inv in range(len(unique_pcs)):
        rotated = unique_pcs[inv:] + unique_pcs[:inv]
        for base_oct in (3, 4, 5):
            notes: list[int] = []
            cursor = base_oct * 12 + rotated[0]
            notes.append(cursor)
            for pc in rotated[1:]:
                nxt = (cursor // 12) * 12 + pc
                while nxt <= cursor:
                    nxt += 12
                notes.append(nxt)
                cursor = nxt
            if notes[0] >= low_bound and notes[-1] <= high_bound:
                candidates.append(notes)

    if not candidates:
        # Relax clamping gently to fit within register bounds
        notes = []
        for idx, pc in enumerate(unique_pcs):
            n = 48 + pc
            while n < low_bound:
                n += 12
            while n > high_bound:
                n -= 12
            if notes and n <= notes[-1] and n + 12 <= high_bound:
                n += 12
            notes.append(max(low_bound, min(high_bound, n)))
        return sorted(set(notes))

    if previous_voicing:
        prev_sorted = sorted(previous_voicing)

        def _vl_cost(cand: list[int]) -> float:
            # Measure nearest-voice semitone motion + mild preference for balanced register
            cost = 0.0
            for n in cand:
                cost += min(abs(n - p) for p in prev_sorted)
            prev_center = sum(prev_sorted) / len(prev_sorted)
            cand_center = sum(cand) / len(cand)
            return cost + 0.35 * abs(cand_center - prev_center)

        candidates.sort(key=_vl_cost)
    else:
        target_center = (low_bound + high_bound) / 2.0
        candidates.sort(key=lambda c: abs((sum(c) / len(c)) - target_center))

    return sorted(candidates[0])


class SonoraAccompanimentArranger:
    """
    Deterministic, rule-based music-theory accompaniment arranger for SONORA Run 2.

    Transforms Run 1 musical analysis + monophonic vocal pitch extraction into
    phrase-aware, melody-preserving multi-instrument MIDI tracks across 6 instrument
    families and 5 distinct musical styles.
    """

    def __init__(self, instrument_manager: InstrumentResourceManager) -> None:
        self._instruments = instrument_manager

    def arrange(
        self,
        *,
        analysis: AudioAnalysisResult,
        pitch: PitchExtractionResult,
        config: ArrangementConfig | None = None,
    ) -> ArrangementPlan:
        cfg = config or ArrangementConfig()
        warnings: list[str] = []

        # 1. Resolve tempo and time signature
        tempo_bpm = self._resolve_tempo(analysis, cfg, warnings)
        time_sig = analysis.time_signature or "4/4"
        beats_per_bar, _ = parse_time_signature(time_sig)
        if beats_per_bar not in {3, 4, 6}:
            beats_per_bar = 4
            time_sig = "4/4"

        beat_ms = 60000.0 / tempo_bpm
        bar_ms = beat_ms * beats_per_bar

        # 2. Resolve key, scale, and harmonic reliability
        root_pc, scale, harmony_source = self._resolve_tonal_center(analysis, pitch, cfg, warnings)

        # Apply optional transposition to accompaniment key (original vocal recording untouched)
        if cfg.transpose_semitones != 0:
            root_pc = (root_pc + cfg.transpose_semitones) % 12

        key_root = _INDEX_TO_PITCH_CLASS[root_pc]
        key_label = f"{key_root} {scale}"

        # 3. Resolve requested instruments & validate every one against InstrumentResourceManager
        requested_ids = (
            list(cfg.selected_instruments)
            if cfg.selected_instruments is not None
            else list(_STYLE_DEFAULT_INSTRUMENTS[cfg.style])
        )
        active_specs: list[InstrumentSpec] = []
        seen_ids: set[str] = set()
        for raw_id in requested_ids:
            spec = self._instruments.resolve_instrument(raw_id)
            if cfg.enabled_tracks.get(spec.instrument_id, True) is False or cfg.enabled_tracks.get(raw_id, True) is False:
                continue
            if spec.instrument_id not in seen_ids:
                active_specs.append(spec)
                seen_ids.add(spec.instrument_id)

        if not active_specs:
            # Always keep at least piano if user disabled everything
            active_specs = [self._instruments.resolve_instrument("piano")]
            warnings.append("All requested instruments were disabled; defaulted to piano accompaniment.")

        channel_map = self._instruments.assign_channels(active_specs)

        # 4. Compute bar grid covering intro + vocal recording duration + outro
        vocal_duration_ms = max(
            analysis.audio_duration_ms,
            pitch.audio_duration_ms,
            int(round(bar_ms * 2)),
        )
        body_bars = max(2, int((vocal_duration_ms + bar_ms - 1) // bar_ms))
        total_bars = cfg.intro_bars + body_bars + cfg.outro_bars
        vocal_offset_ms = int(round(cfg.intro_bars * bar_ms))
        total_duration_ms = int(round(total_bars * bar_ms))

        # 5. Profile vocal presence, register, and phrase boundaries per bar (melody preservation)
        bar_profiles = self._profile_vocal_bars(
            pitch=pitch,
            total_bars=total_bars,
            intro_bars=cfg.intro_bars,
            outro_bars=cfg.outro_bars,
            bar_ms=bar_ms,
            vocal_offset_ms=vocal_offset_ms,
            transpose_semitones=cfg.transpose_semitones,
        )

        # 6. Plan phrase-aware diatonic chord progression with voice leading
        planned_chords = self._plan_chord_progression(
            analysis=analysis,
            root_pc=root_pc,
            scale=scale,
            style=cfg.style,
            bar_profiles=bar_profiles,
            vocal_offset_ms=vocal_offset_ms,
            transpose_semitones=cfg.transpose_semitones,
            warnings=warnings,
        )

        # 7. Generate instrument-specific tracks (never making all instruments play continuously)
        midi_tracks: list[MIDITrackSpec] = []
        for spec in active_specs:
            vol = cfg.instrument_volumes.get(spec.instrument_id, spec.default_volume)
            vol = max(0.0, min(1.0, float(vol)))
            notes = self._arrange_instrument(
                spec=spec,
                chords=planned_chords,
                bar_profiles=bar_profiles,
                style=cfg.style,
                beats_per_bar=beats_per_bar,
                beat_ms=beat_ms,
                energy=cfg.energy,
                density=cfg.density,
                scale_root_pc=root_pc,
                scale=scale,
            )
            midi_tracks.append(
                MIDITrackSpec(
                    instrument_id=spec.instrument_id,
                    track_name=spec.display_name,
                    gm_program=spec.gm_program,
                    channel=channel_map[spec.instrument_id],
                    is_percussion=spec.is_percussion,
                    volume=vol,
                    pan=spec.default_pan,
                    notes=notes,
                )
            )

        return ArrangementPlan(
            style=cfg.style,
            key=key_label,
            key_root=key_root,
            scale=scale,
            tempo_bpm=round(tempo_bpm, 2),
            time_signature=time_sig,
            beats_per_bar=beats_per_bar,
            total_bars=total_bars,
            intro_bars=cfg.intro_bars,
            outro_bars=cfg.outro_bars,
            duration_ms=total_duration_ms,
            transpose_semitones=cfg.transpose_semitones,
            harmony_source=harmony_source,
            chords=planned_chords,
            tracks=midi_tracks,
            warnings=warnings,
        )

    def _resolve_tempo(
        self,
        analysis: AudioAnalysisResult,
        cfg: ArrangementConfig,
        warnings: list[str],
    ) -> float:
        if cfg.tempo_override_bpm is not None:
            return float(cfg.tempo_override_bpm)
        if analysis.tempo_bpm is not None and analysis.tempo_confidence >= 0.30:
            return max(50.0, min(190.0, float(analysis.tempo_bpm)))
        default_by_style: dict[ArrangementStyle, float] = {
            "ballad": 76.0,
            "pop": 112.0,
            "gospel": 84.0,
            "classical": 92.0,
            "cinematic": 80.0,
        }
        fallback = default_by_style[cfg.style]
        warnings.append(
            f"Run 1 tempo estimation was unavailable or low-confidence; arrangement defaulted to {fallback:.0f} BPM ({cfg.style} fallback)."
        )
        return fallback

    def _resolve_tonal_center(
        self,
        analysis: AudioAnalysisResult,
        pitch: PitchExtractionResult,
        cfg: ArrangementConfig,
        warnings: list[str],
    ) -> tuple[int, Literal["major", "minor"], Literal[
        "user_override",
        "reliable_analysis_chords",
        "estimated_key_diatonic_fallback",
        "vocal_pitch_fallback",
        "conservative_default_fallback",
    ]]:
        if cfg.key_override:
            parsed = _parse_key_string(cfg.key_override)
            if parsed is not None:
                return parsed[0], parsed[1], "user_override"
            warnings.append(f"Unrecognized key_override '{cfg.key_override}'; falling back to analysis.")

        if analysis.estimated_key and analysis.key_confidence >= 0.45:
            parsed = _parse_key_string(analysis.estimated_key)
            if parsed is not None:
                reliable_chords = [c for c in analysis.chords if c.confidence >= 0.65]
                if reliable_chords and analysis.reliability in {"high", "medium"}:
                    return parsed[0], parsed[1], "reliable_analysis_chords"
                warnings.append(
                    f"Chord estimation confidence was limited; harmony generated from estimated key '{analysis.estimated_key}' using diatonic rules."
                )
                return parsed[0], parsed[1], "estimated_key_diatonic_fallback"

        # Fallback: infer tonal center from extracted monophonic vocal NoteEvents if present
        if pitch.note_events:
            pc_weights = [0.0] * 12
            for ev in pitch.note_events:
                dur = max(1, ev.end_ms - ev.start_ms)
                pc_weights[ev.midi_pitch % 12] += dur * max(0.2, ev.confidence)
            # Match against major/minor diatonic scale membership
            best_score = -1.0
            best_root = 0
            best_scale: Literal["major", "minor"] = "major"
            for r in range(12):
                for sc_name, sc_ints in (("major", _MAJOR_SCALE_INTERVALS), ("minor", _MINOR_SCALE_INTERVALS)):
                    in_scale = {(r + iv) % 12 for iv in sc_ints}
                    score = sum(pc_weights[pc] for pc in in_scale) + 0.35 * pc_weights[r] + 0.2 * pc_weights[(r + 7) % 12]
                    if score > best_score:
                        best_score = score
                        best_root = r
                        best_scale = sc_name  # type: ignore[assignment]
            warnings.append(
                f"Musical analysis key confidence was low ({analysis.key_confidence:.2f}); "
                f"conservative harmony inferred from vocal melody pitch distribution ({_INDEX_TO_PITCH_CLASS[best_root]} {best_scale})."
            )
            return best_root, best_scale, "vocal_pitch_fallback"

        warnings.append(
            "Both musical analysis key and vocal pitch were unreliable; using conservative C major diatonic fallback."
        )
        return 0, "major", "conservative_default_fallback"

    def _profile_vocal_bars(
        self,
        *,
        pitch: PitchExtractionResult,
        total_bars: int,
        intro_bars: int,
        outro_bars: int,
        bar_ms: float,
        vocal_offset_ms: int,
        transpose_semitones: int,
    ) -> list[_BarVocalProfile]:
        profiles: list[_BarVocalProfile] = []
        body_end_bar = total_bars - outro_bars

        for bar_idx in range(total_bars):
            start_ms = int(round(bar_idx * bar_ms))
            end_ms = max(start_ms + 1, int(round((bar_idx + 1) * bar_ms)))
            is_intro_or_outro = bar_idx < intro_bars or bar_idx >= body_end_bar

            if is_intro_or_outro:
                profiles.append(
                    _BarVocalProfile(
                        bar_index=bar_idx,
                        start_ms=start_ms,
                        end_ms=end_ms,
                        active_ratio=0.0,
                        min_midi=None,
                        max_midi=None,
                        weighted_pitch_classes={},
                        is_phrase_ending=(bar_idx == intro_bars - 1 or bar_idx == total_bars - 1),
                        is_intro_or_outro=True,
                    )
                )
                continue

            overlap_total = 0
            pitches_in_bar: list[int] = []
            pc_weights: dict[int, float] = {}
            for ev in pitch.note_events:
                ev_start = ev.start_ms + vocal_offset_ms
                ev_end = ev.end_ms + vocal_offset_ms
                ov_s = max(start_ms, ev_start)
                ov_e = min(end_ms, ev_end)
                if ov_e > ov_s:
                    dur = ov_e - ov_s
                    overlap_total += dur
                    shifted = max(0, min(127, ev.midi_pitch + transpose_semitones))
                    pitches_in_bar.append(shifted)
                    pc = shifted % 12
                    pc_weights[pc] = pc_weights.get(pc, 0.0) + dur * max(0.25, ev.confidence)

            active_ratio = min(1.0, float(overlap_total) / max(1.0, float(end_ms - start_ms)))
            body_rel = bar_idx - intro_bars
            is_phrase_end = ((body_rel + 1) % 4 == 0) or (bar_idx == body_end_bar - 1)
            profiles.append(
                _BarVocalProfile(
                    bar_index=bar_idx,
                    start_ms=start_ms,
                    end_ms=end_ms,
                    active_ratio=round(active_ratio, 3),
                    min_midi=min(pitches_in_bar) if pitches_in_bar else None,
                    max_midi=max(pitches_in_bar) if pitches_in_bar else None,
                    weighted_pitch_classes=pc_weights,
                    is_phrase_ending=is_phrase_end,
                    is_intro_or_outro=False,
                )
            )

        return profiles

    def _plan_chord_progression(
        self,
        *,
        analysis: AudioAnalysisResult,
        root_pc: int,
        scale: Literal["major", "minor"],
        style: ArrangementStyle,
        bar_profiles: list[_BarVocalProfile],
        vocal_offset_ms: int,
        transpose_semitones: int,
        warnings: list[str],
    ) -> list[PlannedChord]:
        pool = _build_diatonic_chord_pool(root_pc, scale, style)
        by_roman = {str(item["roman"]): item for item in pool}

        # Canonical functional fallback cycles per style & mode
        if scale == "major":
            fallback_cycles: dict[ArrangementStyle, list[str]] = {
                "ballad": ["I", "vi", "IV", "V"],
                "pop": ["I", "V", "vi", "IV"],
                "gospel": ["I", "IV", "ii", "V"],
                "classical": ["I", "IV", "V", "I"],
                "cinematic": ["I", "vi", "IV", "V"],
            }
        else:
            fallback_cycles = {
                "ballad": ["i", "VI", "III", "V"],
                "pop": ["i", "VI", "VII", "i"],
                "gospel": ["i", "iv", "VI", "V"],
                "classical": ["i", "iv", "V", "i"],
                "cinematic": ["i", "VI", "iv", "V"],
            }
        cycle = fallback_cycles[style]

        planned: list[PlannedChord] = []
        prev_voicing: list[int] | None = None
        prev_roman: str | None = None

        for idx, bar in enumerate(bar_profiles):
            chosen: dict[str, object] | None = None
            source: Literal[
                "analysis_chord",
                "melody_diatonic",
                "cadence_rule",
                "fallback_progression",
            ] = "fallback_progression"

            # 1. Cadential resolution at final bar or penultimate bar
            if idx == len(bar_profiles) - 1:
                chosen = by_roman["I" if scale == "major" else "i"]
                source = "cadence_rule"
            elif idx == len(bar_profiles) - 2 and len(bar_profiles) >= 3:
                chosen = by_roman["V"]
                source = "cadence_rule"

            # 2. Check reliable Run 1 analysis chord overlapping this bar (if compatible with vocal melody)
            if chosen is None and not bar.is_intro_or_outro and analysis.reliability in {"high", "medium"}:
                best_analysis_chord = None
                best_overlap = 0
                for ac in analysis.chords:
                    if ac.confidence < 0.65:
                        continue
                    ov = min(bar.end_ms, ac.end_ms + vocal_offset_ms) - max(bar.start_ms, ac.start_ms + vocal_offset_ms)
                    if ov > best_overlap:
                        best_overlap = ov
                        best_analysis_chord = ac
                if best_analysis_chord is not None and best_overlap >= (bar.end_ms - bar.start_ms) * 0.4:
                    ac_root = _PITCH_CLASS_TO_INDEX.get(best_analysis_chord.root)
                    if ac_root is not None:
                        ac_root = (ac_root + transpose_semitones) % 12
                        for cand in pool:
                            if cand["root_pc"] == ac_root and cand["quality"] == best_analysis_chord.quality:
                                # Ensure no severe minor-2nd clash against dominant vocal note
                                if self._chord_melody_clash_score(cand, bar.weighted_pitch_classes) < 0.45:
                                    chosen = cand
                                    source = "analysis_chord"
                                break

            # 3. Melody-compatible diatonic chord scoring when vocal notes are present
            if chosen is None and bar.weighted_pitch_classes:
                scored: list[tuple[float, dict[str, object]]] = []
                for cand in pool:
                    triad_pcs = set(cand["triad_pcs"])  # type: ignore[arg-type]
                    total_w = sum(bar.weighted_pitch_classes.values()) or 1.0
                    match_score = sum(
                        w for pc, w in bar.weighted_pitch_classes.items() if pc in triad_pcs
                    ) / total_w
                    clash_penalty = self._chord_melody_clash_score(cand, bar.weighted_pitch_classes)
                    # Gentle functional movement preference (avoid repeating identical chord every bar)
                    repeat_penalty = 0.14 if str(cand["roman"]) == prev_roman else 0.0
                    cadence_bonus = 0.12 if (bar.is_phrase_ending and str(cand["roman"]) in {"V", "IV", "iv"}) else 0.0
                    tonic_start_bonus = 0.15 if (idx == 0 and str(cand["roman"]) in {"I", "i"}) else 0.0
                    final_score = match_score - 0.65 * clash_penalty - repeat_penalty + cadence_bonus + tonic_start_bonus
                    scored.append((final_score, cand))
                scored.sort(key=lambda item: item[0], reverse=True)
                chosen = scored[0][1]
                source = "melody_diatonic"

            # 4. Functional fallback progression (intro/outro/silent bar)
            if chosen is None:
                roman = cycle[idx % len(cycle)]
                chosen = by_roman.get(roman, pool[0])
                source = "fallback_progression"

            # Register clearance: keep chord upper voice comfortably below active vocal melody
            high_bound = 69
            if bar.min_midi is not None and bar.active_ratio >= 0.25:
                high_bound = max(55, min(69, bar.min_midi - 2))
            low_bound = max(44, high_bound - 16)

            voiced = _voice_chord_with_smooth_leading(
                list(chosen["voiced_pcs"]),  # type: ignore[arg-type]
                previous_voicing=prev_voicing,
                low_bound=low_bound,
                high_bound=high_bound,
            )
            prev_voicing = voiced
            prev_roman = str(chosen["roman"])

            planned.append(
                PlannedChord(
                    bar_index=bar.bar_index,
                    start_ms=bar.start_ms,
                    end_ms=bar.end_ms,
                    symbol=str(chosen["symbol"]),
                    roman_numeral=str(chosen["roman"]),
                    root_pc=int(chosen["root_pc"]),  # type: ignore[arg-type]
                    quality=str(chosen["quality"]),
                    pitch_classes=list(chosen["voiced_pcs"]),  # type: ignore[arg-type]
                    voiced_midi=voiced,
                    vocal_active_ratio=bar.active_ratio,
                    source=source,
                )
            )

        return planned

    @staticmethod
    def _chord_melody_clash_score(cand: dict[str, object], pc_weights: dict[int, float]) -> float:
        if not pc_weights:
            return 0.0
        triad_pcs = list(cand["triad_pcs"])  # type: ignore[arg-type]
        total_w = sum(pc_weights.values()) or 1.0
        clash_w = 0.0
        for pc, weight in pc_weights.items():
            # Minor second (1 semitone) against any triad tone is a strong harmonic clash
            if any(min((pc - t) % 12, (t - pc) % 12) == 1 for t in triad_pcs):
                clash_w += weight
        return clash_w / total_w

    def _arrange_instrument(
        self,
        *,
        spec: InstrumentSpec,
        chords: list[PlannedChord],
        bar_profiles: list[_BarVocalProfile],
        style: ArrangementStyle,
        beats_per_bar: int,
        beat_ms: float,
        energy: float,
        density: float,
        scale_root_pc: int,
        scale: Literal["major", "minor"],
    ) -> list[NoteEvent]:
        if spec.family == "piano":
            return self._arrange_piano(spec, chords, bar_profiles, style, beats_per_bar, beat_ms, energy, density)
        if spec.family == "strings":
            return self._arrange_strings(spec, chords, bar_profiles, style, beat_ms, energy, density)
        if spec.family == "bass":
            return self._arrange_bass(spec, chords, style, beats_per_bar, beat_ms, energy, density)
        if spec.family == "brass":
            return self._arrange_brass(spec, chords, bar_profiles, style, beats_per_bar, beat_ms, energy, density)
        if spec.family == "woodwinds":
            return self._arrange_woodwinds(
                spec, chords, bar_profiles, style, beats_per_bar, beat_ms, energy, density, scale_root_pc, scale
            )
        if spec.family == "drums":
            return self._arrange_drums(chords, bar_profiles, style, beats_per_bar, beat_ms, energy, density)
        return []

    @staticmethod
    def _clamp_velocity(val: float) -> int:
        return max(24, min(118, int(round(val))))

    def _arrange_piano(
        self,
        spec: InstrumentSpec,
        chords: list[PlannedChord],
        bar_profiles: list[_BarVocalProfile],
        style: ArrangementStyle,
        beats_per_bar: int,
        beat_ms: float,
        energy: float,
        density: float,
    ) -> list[NoteEvent]:
        events: list[NoteEvent] = []
        base_vel = 52 + energy * 34

        for chord, bar in zip(chords, bar_profiles):
            # Pull piano velocity slightly softer when lead vocal is dense
            duck = 0.85 if bar.active_ratio >= 0.55 else 1.0
            vel = self._clamp_velocity(base_vel * duck)
            voicing = [max(spec.min_midi, min(spec.max_midi, n)) for n in chord.voiced_midi]
            bass_root = 48 + chord.root_pc
            while bass_root > voicing[0] - 5:
                bass_root -= 12
            bass_root = max(spec.min_midi, bass_root)

            if style == "ballad":
                # Warm broken arpeggio pattern respecting vocal space
                arp_seq = [bass_root] + voicing
                step_ms = beat_ms / (2.0 if density >= 0.65 and bar.active_ratio < 0.5 else 1.0)
                steps = int(round((chord.end_ms - chord.start_ms) / step_ms))
                for s in range(steps):
                    note_midi = arp_seq[s % len(arp_seq)]
                    st = int(round(chord.start_ms + s * step_ms))
                    en = min(chord.end_ms - 15, int(round(st + step_ms * 1.4)))
                    if en > st:
                        events.append(
                            NoteEvent(
                                start_ms=st,
                                end_ms=en,
                                midi_pitch=note_midi,
                                velocity=self._clamp_velocity(vel * (1.0 if s == 0 else 0.88)),
                                voice=spec.instrument_id,
                                clef_hint="bass" if note_midi < 55 else "treble",
                                confidence=0.95,
                            )
                        )

            elif style == "pop":
                # Rhythmic chordal comping: beats 1, 2.5 (syncopation), 3, 4 (when dense)
                hit_beats = [0.0, 1.5, 2.0, 3.0] if (beats_per_bar == 4 and density >= 0.45) else [float(b) for b in range(beats_per_bar)]
                for b_idx, b_pos in enumerate(hit_beats):
                    st = int(round(chord.start_ms + b_pos * beat_ms))
                    dur = beat_ms * (0.85 if b_idx == 0 else 0.65)
                    en = min(chord.end_ms - 15, int(round(st + dur)))
                    if en <= st:
                        continue
                    accent = 1.08 if b_pos == 0.0 else 0.90
                    for n in voicing:
                        events.append(
                            NoteEvent(
                                start_ms=st,
                                end_ms=en,
                                midi_pitch=n,
                                velocity=self._clamp_velocity(vel * accent),
                                voice=spec.instrument_id,
                                clef_hint="treble",
                                confidence=0.95,
                            )
                        )

            elif style == "gospel":
                # Rich rhythmic 7th/9th shell voicings with gentle roll on downbeat & beat 3
                for b_pos in (0.0, 1.75, 2.5) if beats_per_bar == 4 else (0.0, 1.5):
                    st = int(round(chord.start_ms + b_pos * beat_ms))
                    en = min(chord.end_ms - 15, int(round(st + beat_ms * 1.15)))
                    if en <= st:
                        continue
                    for idx_n, n in enumerate([bass_root] + voicing):
                        roll_offset = idx_n * 18 if b_pos == 0.0 else 0
                        n_st = min(en - 20, st + roll_offset)
                        if en > n_st:
                            events.append(
                                NoteEvent(
                                    start_ms=n_st,
                                    end_ms=en,
                                    midi_pitch=n,
                                    velocity=self._clamp_velocity(vel * (1.05 if b_pos == 0.0 else 0.90)),
                                    voice=spec.instrument_id,
                                    clef_hint="bass" if n < 55 else "treble",
                                    confidence=0.95,
                                )
                            )

            elif style == "classical":
                # Alberti bass / arpeggiated broken triad pattern (low-high-mid-high)
                triad = voicing[:3] if len(voicing) >= 3 else (voicing + [voicing[-1] + 7])[:3]
                alberti = [triad[0], triad[2], triad[1], triad[2]]
                sub_div = 2 if density >= 0.45 else 1
                step_ms = beat_ms / sub_div
                total_steps = beats_per_bar * sub_div
                for s in range(total_steps):
                    st = int(round(chord.start_ms + s * step_ms))
                    en = min(chord.end_ms - 10, int(round(st + step_ms * 0.92)))
                    if en > st:
                        p = alberti[s % 4]
                        events.append(
                            NoteEvent(
                                start_ms=st,
                                end_ms=en,
                                midi_pitch=p,
                                velocity=self._clamp_velocity(vel * (1.0 if s % 4 == 0 else 0.80)),
                                voice=spec.instrument_id,
                                clef_hint="bass" if p < 55 else "treble",
                                confidence=0.95,
                            )
                        )

            else:  # cinematic
                # Wide open fifths / resonant downbeat & half-bar pulse
                cinematic_notes = sorted(set([bass_root, bass_root + 7] + voicing[:2]))
                for b_pos in (0.0, 2.0) if beats_per_bar == 4 else (0.0,):
                    st = int(round(chord.start_ms + b_pos * beat_ms))
                    en = min(chord.end_ms - 15, int(round(st + beat_ms * 1.95)))
                    if en <= st:
                        continue
                    for n in cinematic_notes:
                        n_clamped = max(spec.min_midi, min(spec.max_midi, n))
                        events.append(
                            NoteEvent(
                                start_ms=st,
                                end_ms=en,
                                midi_pitch=n_clamped,
                                velocity=self._clamp_velocity(vel * (1.08 if b_pos == 0.0 else 0.86)),
                                voice=spec.instrument_id,
                                clef_hint="bass" if n_clamped < 55 else "treble",
                                confidence=0.95,
                            )
                        )

        return events

    def _arrange_strings(
        self,
        spec: InstrumentSpec,
        chords: list[PlannedChord],
        bar_profiles: list[_BarVocalProfile],
        style: ArrangementStyle,
        beat_ms: float,
        energy: float,
        density: float,
    ) -> list[NoteEvent]:
        """Sustained legato harmonic pads avoiding excessive density and leaving bar-1 breathing room."""
        events: list[NoteEvent] = []
        base_vel = 44 + energy * 28

        for idx, (chord, bar) in enumerate(zip(chords, bar_profiles)):
            # Do not play strings continuously from beat 0 on low-density tracks; let piano/vocal open
            if len(chords) >= 4 and idx == 0 and style in {"ballad", "pop"} and density < 0.75:
                continue

            # Keep strings thin (2 voices under dense vocals, 3 voices otherwise)
            max_voices = 2 if bar.active_ratio >= 0.55 else 3
            voicing = [max(spec.min_midi, min(spec.max_midi, n)) for n in chord.voiced_midi[:max_voices]]
            vel = self._clamp_velocity(base_vel * (0.85 if bar.active_ratio >= 0.55 else 1.0))

            # Legato slight overlap-free sustain spanning the bar
            st = chord.start_ms
            en = max(st + 100, chord.end_ms - 25)
            for n in voicing:
                events.append(
                    NoteEvent(
                        start_ms=st,
                        end_ms=en,
                        midi_pitch=n,
                        velocity=vel,
                        voice=spec.instrument_id,
                        clef_hint="bass" if n < 55 else "treble",
                        confidence=0.95,
                    )
                )

        return events

    def _arrange_bass(
        self,
        spec: InstrumentSpec,
        chords: list[PlannedChord],
        style: ArrangementStyle,
        beats_per_bar: int,
        beat_ms: float,
        energy: float,
        density: float,
    ) -> list[NoteEvent]:
        """Low-register root & chord-tone passing bass lines."""
        events: list[NoteEvent] = []
        base_vel = 64 + energy * 30

        for idx, chord in enumerate(chords):
            root_midi = 36 + chord.root_pc
            if root_midi > 46:
                root_midi -= 12
            root_midi = max(spec.min_midi, min(spec.max_midi, root_midi))
            fifth_midi = min(spec.max_midi, root_midi + 7)

            # Passing tone leading smoothly into next bar's root
            next_root_midi = root_midi
            if idx + 1 < len(chords):
                nr = 36 + chords[idx + 1].root_pc
                if nr > 46:
                    nr -= 12
                next_root_midi = max(spec.min_midi, min(spec.max_midi, nr))
            approach_midi = (
                next_root_midi - 1
                if abs(next_root_midi - root_midi) >= 2 and next_root_midi - 1 >= spec.min_midi
                else fifth_midi
            )

            if style in {"ballad", "cinematic"}:
                # Half-note foundation + subtle approach on beat 4
                pattern = [(0.0, 2.0, root_midi, 1.0), (2.0, 1.0, fifth_midi, 0.85), (3.0, 1.0, approach_midi, 0.82)] if beats_per_bar == 4 else [(0.0, 2.0, root_midi, 1.0), (2.0, 1.0, fifth_midi, 0.85)]
            elif style in {"pop", "gospel"}:
                # Syncopated root-fifth-octave groove
                pattern = (
                    [(0.0, 1.5, root_midi, 1.0), (1.5, 0.5, root_midi, 0.86), (2.0, 1.0, fifth_midi, 0.90), (3.0, 0.5, root_midi, 0.84), (3.5, 0.5, approach_midi, 0.88)]
                    if beats_per_bar == 4 and density >= 0.45
                    else [(0.0, 1.5, root_midi, 1.0), (2.0, 1.0, fifth_midi, 0.88), (3.0, 1.0, approach_midi, 0.85)]
                )
            else:  # classical
                pattern = [(0.0, 2.0, root_midi, 0.95), (2.0, 2.0, fifth_midi, 0.85)] if beats_per_bar == 4 else [(0.0, 3.0, root_midi, 0.95)]

            for b_start, b_dur, pitch_m, mult in pattern:
                st = int(round(chord.start_ms + b_start * beat_ms))
                en = min(chord.end_ms - 15, int(round(st + b_dur * beat_ms * 0.92)))
                if en > st:
                    events.append(
                        NoteEvent(
                            start_ms=st,
                            end_ms=en,
                            midi_pitch=max(spec.min_midi, min(spec.max_midi, pitch_m)),
                            velocity=self._clamp_velocity(base_vel * mult),
                            voice=spec.instrument_id,
                            clef_hint="bass",
                            confidence=0.95,
                        )
                    )

        return events

    def _arrange_brass(
        self,
        spec: InstrumentSpec,
        chords: list[PlannedChord],
        bar_profiles: list[_BarVocalProfile],
        style: ArrangementStyle,
        beats_per_bar: int,
        beat_ms: float,
        energy: float,
        density: float,
    ) -> list[NoteEvent]:
        """
        Restrained brass harmonic support: purposefully silent during dense vocal phrases
        and entering at phrase endings, cadences, intros/outros, or Gospel/Cinematic peaks.
        """
        events: list[NoteEvent] = []
        base_vel = 54 + energy * 34

        for idx, (chord, bar) in enumerate(zip(chords, bar_profiles)):
            # Respect lead vocal: stay tacet during dense singing except final cadence or high-energy cinematic swells
            allow_bar = (
                bar.is_phrase_ending
                or bar.is_intro_or_outro
                or bar.active_ratio < 0.40
                or (style == "cinematic" and idx % 2 == 1 and energy >= 0.5)
                or (style == "gospel" and idx % 2 == 1 and bar.active_ratio < 0.65)
            )
            if not allow_bar:
                continue

            voicing = [max(spec.min_midi, min(spec.max_midi, n)) for n in chord.voiced_midi[:3]]
            if style in {"pop", "gospel"}:
                # Punctuated horn stabs at phrase tail (beats 3 and 4)
                st = int(round(chord.start_ms + max(0, beats_per_bar - 2) * beat_ms))
                en = min(chord.end_ms - 20, int(round(st + beat_ms * 0.85)))
                vel = self._clamp_velocity(base_vel)
            else:
                # Warm sustained horn pad support
                st = chord.start_ms
                en = max(st + 120, chord.end_ms - 30)
                vel = self._clamp_velocity(base_vel * 0.85)

            if en > st:
                for n in voicing:
                    events.append(
                        NoteEvent(
                            start_ms=st,
                            end_ms=en,
                            midi_pitch=n,
                            velocity=vel,
                            voice=spec.instrument_id,
                            clef_hint="treble",
                            confidence=0.95,
                        )
                    )

        return events

    def _arrange_woodwinds(
        self,
        spec: InstrumentSpec,
        chords: list[PlannedChord],
        bar_profiles: list[_BarVocalProfile],
        style: ArrangementStyle,
        beats_per_bar: int,
        beat_ms: float,
        energy: float,
        density: float,
        scale_root_pc: int,
        scale: Literal["major", "minor"],
    ) -> list[NoteEvent]:
        """
        Phrase-aware woodwind responses and gentle sustained counterlines that enter
        primarily during vocal breathing spaces and phrase endings.
        """
        events: list[NoteEvent] = []
        base_vel = 48 + energy * 24
        scale_pcs = {
            (scale_root_pc + iv) % 12
            for iv in (_MAJOR_SCALE_INTERVALS if scale == "major" else _MINOR_SCALE_INTERVALS)
        }

        for idx, (chord, bar) in enumerate(zip(chords, bar_profiles)):
            # Do not compete with dense lead vocals
            if bar.active_ratio >= 0.55 and not bar.is_phrase_ending:
                continue

            # Place woodwind response in upper-mid register clear of active vocal
            top_chord_tone = chord.voiced_midi[-1] + 12
            while top_chord_tone > spec.max_midi:
                top_chord_tone -= 12
            while top_chord_tone < spec.min_midi:
                top_chord_tone += 12
            if bar.max_midi is not None and abs(top_chord_tone - bar.max_midi) <= 2:
                candidate_up = top_chord_tone + 5
                top_chord_tone = candidate_up if candidate_up <= spec.max_midi else max(spec.min_midi, top_chord_tone - 5)

            if bar.active_ratio < 0.35 or bar.is_phrase_ending:
                # 2- or 3-note lyrical response phrase in the breathing space
                step_neighbor = top_chord_tone - 2 if ((top_chord_tone - 2) % 12 in scale_pcs) else top_chord_tone - 1
                step_neighbor = max(spec.min_midi, step_neighbor)
                phrase_notes = [
                    (max(0.0, beats_per_bar - 2.0), 0.75, step_neighbor),
                    (max(0.5, beats_per_bar - 1.25), 1.15, top_chord_tone),
                ]
                for b_start, b_dur, pitch_m in phrase_notes:
                    st = int(round(chord.start_ms + b_start * beat_ms))
                    en = min(chord.end_ms - 20, int(round(st + b_dur * beat_ms)))
                    if en > st:
                        events.append(
                            NoteEvent(
                                start_ms=st,
                                end_ms=en,
                                midi_pitch=pitch_m,
                                velocity=self._clamp_velocity(base_vel),
                                voice=spec.instrument_id,
                                clef_hint="treble",
                                confidence=0.95,
                            )
                        )
            elif style in {"classical", "cinematic"} and idx % 2 == 0:
                # Gentle sustained single supporting tone
                st = chord.start_ms
                en = max(st + 120, chord.end_ms - 30)
                events.append(
                    NoteEvent(
                        start_ms=st,
                        end_ms=en,
                        midi_pitch=top_chord_tone,
                        velocity=self._clamp_velocity(base_vel * 0.82),
                        voice=spec.instrument_id,
                        clef_hint="treble",
                        confidence=0.95,
                    )
                )

        return events

    def _arrange_drums(
        self,
        chords: list[PlannedChord],
        bar_profiles: list[_BarVocalProfile],
        style: ArrangementStyle,
        beats_per_bar: int,
        beat_ms: float,
        energy: float,
        density: float,
    ) -> list[NoteEvent]:
        """Meter-aware General MIDI percussion patterns scaled by style, energy, and density."""
        events: list[NoteEvent] = []
        base_vel = 52 + energy * 42

        def _hit(bar_start_ms: int, beat_pos: float, drum_note: int, vel_mult: float) -> None:
            st = int(round(bar_start_ms + beat_pos * beat_ms))
            en = st + max(60, int(round(beat_ms * 0.25)))
            events.append(
                NoteEvent(
                    start_ms=st,
                    end_ms=en,
                    midi_pitch=drum_note,
                    velocity=self._clamp_velocity(base_vel * vel_mult),
                    voice="drums",
                    clef_hint="bass",
                    confidence=0.98,
                )
            )

        for idx, (chord, bar) in enumerate(zip(chords, bar_profiles)):
            # Classical stays sparse/minimal unless explicitly requested
            if style == "classical":
                if idx == 0 or bar.is_phrase_ending:
                    _hit(chord.start_ms, 0.0, GM_DRUM_KICK, 0.65)
                continue

            # Subtle crash on bar 1 or phrase launch
            if idx == 0 and style in {"pop", "gospel", "cinematic"}:
                _hit(chord.start_ms, 0.0, GM_DRUM_CRASH, 0.72)

            if style == "ballad":
                _hit(chord.start_ms, 0.0, GM_DRUM_KICK, 0.75)
                if beats_per_bar >= 4:
                    _hit(chord.start_ms, 1.0, GM_DRUM_SIDE_STICK, 0.68)
                    _hit(chord.start_ms, 2.5, GM_DRUM_KICK, 0.60)
                    _hit(chord.start_ms, 3.0, GM_DRUM_SIDE_STICK, 0.72)
                elif beats_per_bar == 3:
                    _hit(chord.start_ms, 1.0, GM_DRUM_SIDE_STICK, 0.65)
                hat_step = 0.5 if density >= 0.55 else 1.0
                pos = 0.0
                while pos < beats_per_bar - 1e-6:
                    _hit(chord.start_ms, pos, GM_DRUM_CLOSED_HAT, 0.52 if pos % 1.0 == 0 else 0.40)
                    pos += hat_step

            elif style == "pop":
                _hit(chord.start_ms, 0.0, GM_DRUM_KICK, 0.96)
                if beats_per_bar >= 4:
                    _hit(chord.start_ms, 1.0, GM_DRUM_SNARE, 0.90)
                    _hit(chord.start_ms, 2.0, GM_DRUM_KICK, 0.88)
                    if density >= 0.55:
                        _hit(chord.start_ms, 2.5, GM_DRUM_KICK, 0.72)
                    _hit(chord.start_ms, 3.0, GM_DRUM_SNARE, 0.92)
                for step in range(beats_per_bar * 2):
                    pos = step * 0.5
                    hat = GM_DRUM_OPEN_HAT if (bar.is_phrase_ending and step == beats_per_bar * 2 - 1) else GM_DRUM_CLOSED_HAT
                    _hit(chord.start_ms, pos, hat, 0.66 if step % 2 == 0 else 0.50)

            elif style == "gospel":
                _hit(chord.start_ms, 0.0, GM_DRUM_KICK, 0.95)
                if beats_per_bar >= 4:
                    _hit(chord.start_ms, 1.0, GM_DRUM_SNARE, 0.92)
                    _hit(chord.start_ms, 1.75, GM_DRUM_KICK, 0.76)
                    _hit(chord.start_ms, 2.5, GM_DRUM_KICK, 0.84)
                    _hit(chord.start_ms, 3.0, GM_DRUM_SNARE, 0.95)
                for step in range(beats_per_bar * 2):
                    _hit(chord.start_ms, step * 0.5, GM_DRUM_RIDE, 0.68 if step % 2 == 0 else 0.52)
                if bar.is_phrase_ending and beats_per_bar >= 4:
                    _hit(chord.start_ms, 3.5, GM_DRUM_SNARE, 0.78)
                    _hit(chord.start_ms, 3.75, GM_DRUM_LOW_TOM, 0.82)

            elif style == "cinematic":
                _hit(chord.start_ms, 0.0, GM_DRUM_KICK, 1.0)
                _hit(chord.start_ms, 0.0, GM_DRUM_LOW_TOM, 0.88)
                if beats_per_bar >= 4 and density >= 0.45:
                    _hit(chord.start_ms, 2.0, GM_DRUM_LOW_TOM, 0.76)
                    _hit(chord.start_ms, 3.5, GM_DRUM_KICK, 0.74)
                if bar.is_phrase_ending:
                    _hit(chord.start_ms, max(0.0, beats_per_bar - 1.0), GM_DRUM_CRASH, 0.78)

        return events
