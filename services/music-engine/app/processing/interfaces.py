from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Literal

from pydantic import BaseModel, Field

from app.schemas.audio import AudioFormat, AudioMetadata, AudioSourceRef, TrimWindow
from app.schemas.jobs import JobArtifactRef


# ---------------------------------------------------------------------------
# Shared Data Transfer Models Across Both Flagship Studios
# ---------------------------------------------------------------------------


class IngestedAudio(BaseModel):
    job_id: str
    user_id: str
    source_ref: AudioSourceRef
    preserved_working_copy_path: str
    metadata: AudioMetadata


class DecodedAudio(BaseModel):
    working_wav_path: str
    sample_rate_hz: int = Field(ge=8000)
    channels: int = Field(ge=1, le=16)
    duration_ms: int = Field(ge=1)
    sample_format: str = "s16"
    trim_applied: TrimWindow | None = None
    source_metadata: AudioMetadata


class BeatMarker(BaseModel):
    time_ms: int = Field(ge=0)
    beat_number: int = Field(ge=1)
    bar_number: int = Field(ge=1)
    is_downbeat: bool = False


class ChordEvent(BaseModel):
    start_ms: int = Field(ge=0)
    end_ms: int = Field(ge=1)
    symbol: str
    root: str
    quality: str
    confidence: float = Field(ge=0.0, le=1.0)


class ChromaSummary(BaseModel):
    pitch_classes: dict[str, float]
    hop_ms: int = Field(ge=1)
    frame_count: int = Field(ge=0)
    mean_energy: float = Field(ge=0.0)


class AudioAnalysisResult(BaseModel):
    tempo_bpm: float | None = Field(default=None, gt=0.0)
    tempo_confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    tempo_stability: Literal["steady", "moderate_variation", "rubato_or_uncertain", "unavailable"] = "unavailable"
    time_signature: str | None = None
    estimated_key: str | None = None
    key_root: str | None = None
    scale: str | None = None
    key_confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    tuning_offset_cents: float | None = None
    beats: list[BeatMarker] = Field(default_factory=list)
    chords: list[ChordEvent] = Field(default_factory=list)
    chroma_summary: ChromaSummary | None = None
    audio_duration_ms: int = Field(default=0, ge=0)
    sample_rate_hz: int = Field(default=0, ge=0)
    reliability: Literal["high", "medium", "low", "unreliable"] = "unreliable"
    reliability_score: float = Field(default=0.0, ge=0.0, le=1.0)
    analysis_method: str = "librosa_krumhansl_schmuckler_chroma"
    is_heuristic: bool = True
    instrument_tags: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class StemResult(BaseModel):
    stem_name: Literal["vocals", "drums", "bass", "piano", "guitar", "other"]
    artifact: JobArtifactRef
    energy_rms_db: float | None = None
    bleed_warning: str | None = None


class SourceSeparationResult(BaseModel):
    stems: list[StemResult]
    model_name: str
    sample_rate_hz: int


class PitchPoint(BaseModel):
    time_ms: int = Field(ge=0)
    frequency_hz: float | None = Field(default=None, ge=0.0)
    midi_note: float | None = None
    confidence: float = Field(ge=0.0, le=1.0)
    voiced: bool = False


class TimeRegion(BaseModel):
    start_ms: int = Field(ge=0)
    end_ms: int = Field(ge=0)
    mean_confidence: float = Field(default=0.0, ge=0.0, le=1.0)


class NoteEvent(BaseModel):
    start_ms: int = Field(ge=0)
    end_ms: int = Field(ge=1)
    midi_pitch: int = Field(ge=0, le=127)
    velocity: int = Field(ge=1, le=127)
    voice: str = "melody"
    clef_hint: Literal["treble", "bass", "alto", "tenor"] = "treble"
    confidence: float = Field(ge=0.0, le=1.0)


class PitchExtractionResult(BaseModel):
    mode: Literal["monophonic", "polyphonic"]
    hop_ms: int = Field(ge=1)
    contours: list[PitchPoint]
    voiced_regions: list[TimeRegion] = Field(default_factory=list)
    unvoiced_regions: list[TimeRegion] = Field(default_factory=list)
    note_events: list[NoteEvent] = Field(default_factory=list)
    voiced_frame_count: int = Field(default=0, ge=0)
    total_frame_count: int = Field(default=0, ge=0)
    voiced_ratio: float = Field(default=0.0, ge=0.0, le=1.0)
    mean_confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    pitch_range_midi: tuple[float, float] | None = None
    audio_duration_ms: int = Field(default=0, ge=0)
    sample_rate_hz: int = Field(default=0, ge=0)
    extractor_method: str = "librosa_pyin_monophonic"
    monophonic_only_notice: str = (
        "librosa.pyin estimates monophonic vocal or single-instrument melody pitch only; "
        "it is not a polyphonic multi-instrument transcription engine."
    )
    warnings: list[str] = Field(default_factory=list)


class TranscriptionResult(BaseModel):
    notes: list[NoteEvent]
    tempo_bpm: float = Field(gt=0.0)
    time_signature: str
    estimated_key: str
    requires_manual_review: bool = True


class MIDIExportRequest(BaseModel):
    notes: list[NoteEvent]
    tempo_bpm: float = Field(default=120.0, gt=0.0)
    time_signature: str = "4/4"
    quantize_grid: str | None = None
    transpose_semitones: int = 0


class MIDIProcessingResult(BaseModel):
    midi_path: str
    track_count: int = Field(ge=1)
    note_count: int = Field(ge=0)
    duration_ms: int = Field(ge=0)


class MusicXMLExportRequest(BaseModel):
    title: str = "SONORA Transcription"
    notes: list[NoteEvent]
    tempo_bpm: float = Field(default=120.0, gt=0.0)
    time_signature: str = "4/4"
    key_signature: str = "C"
    include_solfa_annotations: bool = False


class MusicXMLGenerationResult(BaseModel):
    musicxml_path: str
    measure_count: int = Field(ge=1)
    part_count: int = Field(ge=1)


class SampledInstrumentPatch(BaseModel):
    """Enforces realistic multi-sampled instrument libraries rather than basic oscillators."""

    instrument_id: str
    sample_library_id: str
    soundfont_or_sfz_ref: str
    articulation: str = "default"
    allow_oscillator_fallback: Literal[False] = False


class InstrumentPlaybackRequest(BaseModel):
    midi_path: str
    patches: list[SampledInstrumentPatch] = Field(min_length=1)
    sample_rate_hz: int = Field(default=44100, ge=22050)


class InstrumentPlaybackResult(BaseModel):
    rendered_audio_path: str
    sample_rate_hz: int
    duration_ms: int
    patches_used: list[SampledInstrumentPatch]


class MixTrackInput(BaseModel):
    track_id: str
    audio_path: str
    gain_db: float = 0.0
    pan: float = Field(default=0.0, ge=-1.0, le=1.0)
    muted: bool = False
    is_original_vocal: bool = False


class MixingAndRenderingRequest(BaseModel):
    tracks: list[MixTrackInput] = Field(min_length=1)
    output_format: AudioFormat = AudioFormat.WAV
    sample_rate_hz: int = Field(default=44100, ge=22050)
    target_lufs: float = Field(default=-14.0, ge=-30.0, le=-6.0)
    preserve_original_tracks: Literal[True] = True


class MixingAndRenderingResult(BaseModel):
    output_path: str
    output_format: AudioFormat
    sample_rate_hz: int
    duration_ms: int
    original_tracks_preserved: bool = True


# ---------------------------------------------------------------------------
# 10 Reusable Processing Interfaces for Both Flagship Studios
# ---------------------------------------------------------------------------


class AudioIngestionInterface(ABC):
    """1. Validates format/size/ownership, computes checksum, preserves original, and stages working copy."""

    @abstractmethod
    async def ingest(
        self,
        job_id: str,
        user_id: str,
        source_ref: AudioSourceRef,
        workspace_dir: Path,
    ) -> IngestedAudio:
        """Verify access, validate raw bytes/headers, preserve original, and return staged metadata."""


class AudioDecodingInterface(ABC):
    """2. Decodes validated audio formats into canonical high-resolution PCM/WAV with optional non-destructive trim."""

    @abstractmethod
    async def decode(
        self,
        ingested: IngestedAudio,
        workspace_dir: Path,
        trim_window: TrimWindow | None = None,
        target_sample_rate_hz: int = 44100,
    ) -> DecodedAudio:
        """Decode source audio into a canonical PCM WAV working file."""


class AudioAnalysisInterface(ABC):
    """3. Extracts tempo, beat grid, meter, key center, chord progression, and instrument cues."""

    @abstractmethod
    async def analyze(
        self,
        decoded: DecodedAudio,
        options: dict[str, Any] | None = None,
    ) -> AudioAnalysisResult:
        """Analyze musical attributes of decoded audio."""


class SourceSeparationInterface(ABC):
    """4. Separates mixed recordings into isolated stems (vocals, drums, bass, piano, guitar, other)."""

    @abstractmethod
    async def separate(
        self,
        decoded: DecodedAudio,
        workspace_dir: Path,
        requested_stems: list[str] | None = None,
    ) -> SourceSeparationResult:
        """Separate audio into individual stems without modifying the original recording."""


class PitchExtractionInterface(ABC):
    """5. Extracts monophonic vocal F0 or polyphonic pitch salience contours."""

    @abstractmethod
    async def extract_pitch(
        self,
        decoded: DecodedAudio,
        mode: Literal["monophonic", "polyphonic"] = "monophonic",
        options: dict[str, Any] | None = None,
    ) -> PitchExtractionResult:
        """Extract pitch contours from decoded audio."""


class TranscriptionInterface(ABC):
    """6. Converts decoded audio or pitch contours into discrete quantized note events."""

    @abstractmethod
    async def transcribe(
        self,
        decoded: DecodedAudio,
        pitch_result: PitchExtractionResult | None = None,
        analysis: AudioAnalysisResult | None = None,
    ) -> TranscriptionResult:
        """Transcribe audio into structured MIDI-ready note events."""


class MIDIProcessingInterface(ABC):
    """7. Builds, quantizes, transposes, and serializes standard MIDI files."""

    @abstractmethod
    async def build_midi(
        self,
        request: MIDIExportRequest,
        output_path: Path,
    ) -> MIDIProcessingResult:
        """Serialize structured note events into a standard MIDI file."""


class MusicXMLGenerationInterface(ABC):
    """8. Generates clean MusicXML notation scores compatible with VexFlow and notation editors."""

    @abstractmethod
    async def generate_musicxml(
        self,
        request: MusicXMLExportRequest,
        output_path: Path,
    ) -> MusicXMLGenerationResult:
        """Serialize note events and harmonic metadata into MusicXML."""


class InstrumentPlaybackInterface(ABC):
    """9. Renders MIDI/arrangements using realistic multi-sampled instrument libraries (never basic oscillators)."""

    @abstractmethod
    async def render_instruments(
        self,
        request: InstrumentPlaybackRequest,
        output_path: Path,
    ) -> InstrumentPlaybackResult:
        """Render MIDI tracks through realistic sample libraries / SoundFonts."""


class MixingAndRenderingInterface(ABC):
    """10. Performs non-destructive beat-aligned mixing, loudness normalization, and audio export."""

    @abstractmethod
    async def mix_and_render(
        self,
        request: MixingAndRenderingRequest,
        output_dir: Path,
    ) -> MixingAndRenderingResult:
        """Mix tracks non-destructively and render final audio output."""
