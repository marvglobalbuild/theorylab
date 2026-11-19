from __future__ import annotations

import os
import re
import shutil
from pathlib import Path
from typing import Any, Literal

from pydantic import BaseModel, Field

from app.core.config import Settings
from app.core.errors import InstrumentResourceError

InstrumentFamily = Literal["piano", "strings", "bass", "brass", "woodwinds", "drums"]

_SAFE_BIN_RE = re.compile(r"^[A-Za-z0-9._/+-]+$")

# Standard General MIDI Percussion Note Numbers (Channel 9 / 1-based Channel 10)
GM_DRUM_KICK = 36
GM_DRUM_SIDE_STICK = 37
GM_DRUM_SNARE = 38
GM_DRUM_LOW_TOM = 45
GM_DRUM_CLOSED_HAT = 42
GM_DRUM_PEDAL_HAT = 44
GM_DRUM_OPEN_HAT = 46
GM_DRUM_CRASH = 49
GM_DRUM_RIDE = 51
GM_DRUM_RIDE_BELL = 53
GM_DRUM_TAMBOURINE = 54


class InstrumentSpec(BaseModel):
    instrument_id: str
    family: InstrumentFamily
    display_name: str
    gm_program: int = Field(ge=0, le=127)
    default_channel: int = Field(ge=0, le=15)
    is_percussion: bool = False
    min_midi: int = Field(ge=0, le=127)
    max_midi: int = Field(ge=0, le=127)
    default_volume: float = Field(default=0.80, ge=0.0, le=1.0)
    default_pan: int = Field(default=64, ge=0, le=127)  # 64 = center


class SoundLibraryStatus(BaseModel):
    available: bool
    soundfont_path: str | None = None
    soundfont_name: str | None = None
    format: Literal["sf2", "sf3", "unknown"] = "unknown"
    size_bytes: int | None = None
    license_name: str | None = None
    missing_reason: str | None = None
    install_instructions: str | None = None


class InstrumentDiagnostics(BaseModel):
    fluidsynth_available: bool
    fluidsynth_executable: str | None = None
    sound_library: SoundLibraryStatus
    supported_families: list[InstrumentFamily]
    instruments: list[InstrumentSpec]


# Canonical General MIDI Instrument Catalog covering all 6 SONORA Run 2 families
_CANONICAL_INSTRUMENTS: dict[str, InstrumentSpec] = {
    "piano": InstrumentSpec(
        instrument_id="piano",
        family="piano",
        display_name="Acoustic Grand Piano",
        gm_program=0,
        default_channel=0,
        is_percussion=False,
        min_midi=36,
        max_midi=84,
        default_volume=0.82,
        default_pan=56,
    ),
    "electric_piano": InstrumentSpec(
        instrument_id="electric_piano",
        family="piano",
        display_name="Electric Piano",
        gm_program=4,
        default_channel=5,
        is_percussion=False,
        min_midi=40,
        max_midi=84,
        default_volume=0.78,
        default_pan=58,
    ),
    "strings": InstrumentSpec(
        instrument_id="strings",
        family="strings",
        display_name="String Ensemble",
        gm_program=48,
        default_channel=1,
        is_percussion=False,
        min_midi=43,
        max_midi=84,
        default_volume=0.68,
        default_pan=74,
    ),
    "bass": InstrumentSpec(
        instrument_id="bass",
        family="bass",
        display_name="Acoustic Bass",
        gm_program=32,
        default_channel=2,
        is_percussion=False,
        min_midi=28,
        max_midi=55,
        default_volume=0.84,
        default_pan=64,
    ),
    "electric_bass": InstrumentSpec(
        instrument_id="electric_bass",
        family="bass",
        display_name="Electric Bass (Finger)",
        gm_program=33,
        default_channel=2,
        is_percussion=False,
        min_midi=28,
        max_midi=55,
        default_volume=0.84,
        default_pan=64,
    ),
    "brass": InstrumentSpec(
        instrument_id="brass",
        family="brass",
        display_name="Brass Section",
        gm_program=61,
        default_channel=3,
        is_percussion=False,
        min_midi=46,
        max_midi=77,
        default_volume=0.66,
        default_pan=78,
    ),
    "woodwinds": InstrumentSpec(
        instrument_id="woodwinds",
        family="woodwinds",
        display_name="Flute / Woodwind Lead",
        gm_program=73,
        default_channel=4,
        is_percussion=False,
        min_midi=55,
        max_midi=86,
        default_volume=0.64,
        default_pan=48,
    ),
    "drums": InstrumentSpec(
        instrument_id="drums",
        family="drums",
        display_name="Standard Drum Kit & Percussion",
        gm_program=0,
        default_channel=9,  # GM Percussion Channel (0-indexed 9 == MIDI Channel 10)
        is_percussion=True,
        min_midi=35,
        max_midi=81,
        default_volume=0.78,
        default_pan=64,
    ),
}

_INSTRUMENT_ALIASES: dict[str, str] = {
    "acoustic_grand_piano": "piano",
    "grand_piano": "piano",
    "keys": "piano",
    "epiano": "electric_piano",
    "rhodes": "electric_piano",
    "string_ensemble": "strings",
    "orchestral_strings": "strings",
    "pad_strings": "strings",
    "acoustic_bass": "bass",
    "upright_bass": "bass",
    "finger_bass": "electric_bass",
    "brass_section": "brass",
    "horns": "brass",
    "flute": "woodwinds",
    "clarinet": "woodwinds",
    "oboe": "woodwinds",
    "woodwind": "woodwinds",
    "percussion": "drums",
    "drum_kit": "drums",
    "kit": "drums",
}

_PREFERRED_SOUNDFONT_NAMES: tuple[str, ...] = (
    "MuseScore_General.sf2",
    "MuseScore_General.sf3",
    "MuseScore_General_Full.sf3",
    "MuseScore_General_HQ.sf2",
    "FluidR3_GM.sf2",
    "default-GM.sf3",
    "default-GM.sf2",
)

_SOUNDFONT_INSTALL_INSTRUCTIONS = (
    "Install the MIT-licensed MuseScore General SoundFont outside user upload directories: "
    "Debian/Ubuntu `apt-get install fluidsynth musescore-general-soundfont` (provides "
    "/usr/share/sounds/sf3/MuseScore_General.sf3), or download MuseScore_General.sf3 / "
    "MuseScore_General.sf2 from https://ftp.osuosl.org/pub/musescore/soundfont/MuseScore_General/ "
    "into a persistent read-only directory and set MUSIC_ENGINE_SOUNDFONT_PATH or MUSIC_ENGINE_SOUNDFONT_DIR."
)


def _is_valid_soundfont_header(path: Path) -> bool:
    """Verify RIFF 'sfbk' SoundFont 2/3 container magic bytes."""
    try:
        with path.open("rb") as fh:
            header = fh.read(12)
        return len(header) == 12 and header[:4] == b"RIFF" and header[8:12] == b"sfbk"
    except OSError:
        return False


def _infer_license_label(filename: str) -> str:
    lower = filename.lower()
    if "musescore_general" in lower:
        return "MIT (with CC0/Public Domain sample components; copyright notice required)"
    if "fluidr3" in lower:
        return "MIT (Frank Wen FluidR3; copyright notice required)"
    return "External SoundFont (verify license in THIRD_PARTY_LICENSES.md)"


class InstrumentResourceManager:
    """
    Central registry for General MIDI instrument mappings, program validation,
    FluidSynth binary verification, and read-only SoundFont discovery.
    """

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    @staticmethod
    def list_supported_families() -> list[InstrumentFamily]:
        return ["piano", "strings", "bass", "brass", "woodwinds", "drums"]

    @staticmethod
    def list_instruments() -> list[InstrumentSpec]:
        return list(_CANONICAL_INSTRUMENTS.values())

    @staticmethod
    def resolve_instrument(instrument_id: str) -> InstrumentSpec:
        normalized = instrument_id.strip().lower().replace("-", "_").replace(" ", "_")
        canonical = _INSTRUMENT_ALIASES.get(normalized, normalized)
        spec = _CANONICAL_INSTRUMENTS.get(canonical)
        if spec is None:
            raise InstrumentResourceError(
                f"Instrument '{instrument_id}' is not supported by the SONORA synthesis layer.",
                code="UNKNOWN_INSTRUMENT",
                status_code=422,
                details={
                    "requested": instrument_id,
                    "supported_instruments": sorted(_CANONICAL_INSTRUMENTS.keys()),
                },
            )
        if not (0 <= spec.gm_program <= 127):
            raise InstrumentResourceError(
                f"Invalid General MIDI program {spec.gm_program} for '{spec.instrument_id}'.",
                code="INVALID_GM_PROGRAM",
                status_code=500,
            )
        return spec

    @staticmethod
    def validate_program_number(program: int) -> int:
        if not isinstance(program, int) or not (0 <= program <= 127):
            raise InstrumentResourceError(
                f"General MIDI program number must be an integer between 0 and 127 (got {program!r}).",
                code="INVALID_GM_PROGRAM",
                status_code=422,
            )
        return program

    def resolve_fluidsynth_executable(self) -> str | None:
        raw = self._settings.fluidsynth_bin.strip()
        if not raw or not _SAFE_BIN_RE.match(raw):
            return None
        found = shutil.which(raw)
        if found and os.access(found, os.X_OK):
            return found
        candidate = Path(raw)
        if candidate.is_file() and os.access(candidate, os.X_OK):
            return str(candidate.resolve())
        return None

    def _is_inside_user_writable_paths(self, candidate: Path) -> bool:
        resolved = candidate.resolve()
        for forbidden_root in (self._settings.local_storage_path, self._settings.temp_path):
            try:
                resolved.relative_to(forbidden_root.resolve())
                return True
            except ValueError:
                continue
        return False

    def resolve_sound_library(self, requested_path: str | None = None) -> SoundLibraryStatus:
        candidates: list[Path] = []

        explicit = (requested_path or self._settings.music_engine_soundfont_path or "").strip()
        if explicit:
            p = Path(explicit)
            if p.is_file():
                candidates.append(p)
            else:
                return SoundLibraryStatus(
                    available=False,
                    soundfont_path=None,
                    soundfont_name=p.name,
                    missing_reason=f"Configured SoundFont file '{explicit}' does not exist.",
                    install_instructions=_SOUNDFONT_INSTALL_INSTRUCTIONS,
                )

        if not candidates:
            search_dirs: list[Path] = []
            configured_dir = self._settings.music_engine_soundfont_dir.strip()
            if configured_dir:
                search_dirs.append(Path(configured_dir))
            # Standard read-only system locations (searched only if explicit path was not set)
            for sys_dir in (
                Path("/opt/sonora/soundfonts"),
                Path("/usr/share/sounds/sf3"),
                Path("/usr/share/sounds/sf2"),
                Path("/usr/share/soundfonts"),
            ):
                if sys_dir not in search_dirs:
                    search_dirs.append(sys_dir)

            for directory in search_dirs:
                if not directory.is_dir():
                    continue
                for preferred in _PREFERRED_SOUNDFONT_NAMES:
                    candidate = directory / preferred
                    if candidate.is_file():
                        candidates.append(candidate)
                # Fallback: any .sf2 or .sf3 in the directory (sorted deterministically)
                for ext in ("*.sf2", "*.sf3"):
                    for found in sorted(directory.glob(ext)):
                        if found.is_file() and found not in candidates:
                            candidates.append(found)

        for candidate in candidates:
            if candidate.suffix.lower() not in {".sf2", ".sf3"}:
                continue
            if self._is_inside_user_writable_paths(candidate):
                return SoundLibraryStatus(
                    available=False,
                    missing_reason=(
                        "SoundFont path is located inside a user storage or temporary workspace directory, "
                        "which is forbidden for security isolation."
                    ),
                    install_instructions=_SOUNDFONT_INSTALL_INSTRUCTIONS,
                )
            resolved = candidate.resolve()
            size = resolved.stat().st_size
            if size < 1024 or not _is_valid_soundfont_header(resolved):
                continue
            fmt: Literal["sf2", "sf3", "unknown"] = (
                "sf3" if candidate.suffix.lower() == ".sf3" else "sf2"
            )
            return SoundLibraryStatus(
                available=True,
                soundfont_path=str(resolved),
                soundfont_name=candidate.name,
                format=fmt,
                size_bytes=size,
                license_name=_infer_license_label(candidate.name),
            )

        return SoundLibraryStatus(
            available=False,
            missing_reason=(
                "No verified .sf2 or .sf3 SoundFont library was found in configured or system directories."
            ),
            install_instructions=_SOUNDFONT_INSTALL_INSTRUCTIONS,
        )

    def get_diagnostics(self) -> InstrumentDiagnostics:
        exe = self.resolve_fluidsynth_executable()
        sf_status = self.resolve_sound_library()
        return InstrumentDiagnostics(
            fluidsynth_available=exe is not None,
            fluidsynth_executable=exe,
            sound_library=sf_status,
            supported_families=self.list_supported_families(),
            instruments=self.list_instruments(),
        )

    def assign_channels(self, specs: list[InstrumentSpec]) -> dict[str, int]:
        """
        Assign collision-free MIDI channels (0-15) keeping percussion strictly on channel 9.
        """
        assigned: dict[str, int] = {}
        used_melodic: set[int] = set()

        for spec in specs:
            if spec.is_percussion:
                assigned[spec.instrument_id] = 9
                continue
            preferred = spec.default_channel
            if preferred != 9 and preferred not in used_melodic:
                assigned[spec.instrument_id] = preferred
                used_melodic.add(preferred)
            else:
                for ch in range(16):
                    if ch != 9 and ch not in used_melodic:
                        assigned[spec.instrument_id] = ch
                        used_melodic.add(ch)
                        break
                else:
                    raise InstrumentResourceError(
                        "Exceeded the 15 melodic MIDI channels available in a single Standard MIDI File.",
                        code="MIDI_CHANNEL_LIMIT_EXCEEDED",
                        status_code=422,
                    )
        return assigned
