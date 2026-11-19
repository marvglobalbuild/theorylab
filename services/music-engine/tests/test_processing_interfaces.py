from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.processing import interfaces
from app.processing.interfaces import SampledInstrumentPatch


def test_all_ten_shared_processing_interfaces_are_defined():
    expected_interfaces = [
        "AudioIngestionInterface",
        "AudioDecodingInterface",
        "AudioAnalysisInterface",
        "SourceSeparationInterface",
        "PitchExtractionInterface",
        "TranscriptionInterface",
        "MIDIProcessingInterface",
        "MusicXMLGenerationInterface",
        "InstrumentPlaybackInterface",
        "MixingAndRenderingInterface",
    ]
    for name in expected_interfaces:
        cls = getattr(interfaces, name, None)
        assert cls is not None, f"Missing interface {name}"
        assert hasattr(cls, "__abstractmethods__") and len(cls.__abstractmethods__) >= 1


def test_instrument_playback_contract_forbids_oscillator_fallback():
    patch = SampledInstrumentPatch(
        instrument_id="acoustic_grand_piano",
        sample_library_id="salamander_grand_v3",
        soundfont_or_sfz_ref="sfz://piano/salamander",
    )
    assert patch.allow_oscillator_fallback is False

    with pytest.raises(ValidationError):
        SampledInstrumentPatch(
            instrument_id="acoustic_grand_piano",
            sample_library_id="basic_sine",
            soundfont_or_sfz_ref="osc://sine",
            allow_oscillator_fallback=True,  # type: ignore[arg-type]
        )
