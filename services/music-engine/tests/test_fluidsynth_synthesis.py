from __future__ import annotations

import asyncio
from pathlib import Path
from unittest.mock import patch

import numpy as np
import pytest
import soundfile as sf

from app.core.config import Settings
from app.core.errors import InstrumentResourceError, SynthesisError
from app.processing.instruments import (
    GM_DRUM_CLOSED_HAT,
    GM_DRUM_KICK,
    GM_DRUM_SNARE,
    InstrumentResourceManager,
)
from app.processing.interfaces import (
    InstrumentPlaybackRequest,
    NoteEvent,
    SampledInstrumentPatch,
)
from app.processing.midi import MIDITrackSpec, MidoMIDIBuilder
from app.processing.synthesis import FluidSynthRenderer


def _build_all_six_families_midi(tmp_path: Path) -> Path:
    builder = MidoMIDIBuilder()
    midi_path = tmp_path / "six_families.mid"
    tracks = [
        MIDITrackSpec(
            instrument_id="piano",
            track_name="Acoustic Grand Piano",
            gm_program=0,
            channel=0,
            notes=[
                NoteEvent(start_ms=0, end_ms=800, midi_pitch=60, velocity=86, voice="piano", confidence=0.95),
                NoteEvent(start_ms=0, end_ms=800, midi_pitch=64, velocity=82, voice="piano", confidence=0.95),
                NoteEvent(start_ms=0, end_ms=800, midi_pitch=67, velocity=82, voice="piano", confidence=0.95),
            ],
        ),
        MIDITrackSpec(
            instrument_id="strings",
            track_name="String Ensemble",
            gm_program=48,
            channel=1,
            notes=[
                NoteEvent(start_ms=0, end_ms=1000, midi_pitch=67, velocity=76, voice="strings", confidence=0.95),
            ],
        ),
        MIDITrackSpec(
            instrument_id="bass",
            track_name="Acoustic Bass",
            gm_program=32,
            channel=2,
            notes=[
                NoteEvent(start_ms=0, end_ms=1000, midi_pitch=36, velocity=92, voice="bass", confidence=0.95),
            ],
        ),
        MIDITrackSpec(
            instrument_id="brass",
            track_name="Brass Section",
            gm_program=61,
            channel=3,
            notes=[
                NoteEvent(start_ms=200, end_ms=900, midi_pitch=64, velocity=80, voice="brass", confidence=0.95),
            ],
        ),
        MIDITrackSpec(
            instrument_id="woodwinds",
            track_name="Flute / Woodwind Lead",
            gm_program=73,
            channel=4,
            notes=[
                NoteEvent(start_ms=300, end_ms=950, midi_pitch=72, velocity=78, voice="woodwinds", confidence=0.95),
            ],
        ),
        MIDITrackSpec(
            instrument_id="drums",
            track_name="Standard Drum Kit & Percussion",
            gm_program=0,
            channel=9,
            is_percussion=True,
            notes=[
                NoteEvent(start_ms=0, end_ms=180, midi_pitch=GM_DRUM_KICK, velocity=100, voice="drums", confidence=0.95),
                NoteEvent(start_ms=500, end_ms=680, midi_pitch=GM_DRUM_SNARE, velocity=95, voice="drums", confidence=0.95),
                NoteEvent(start_ms=250, end_ms=400, midi_pitch=GM_DRUM_CLOSED_HAT, velocity=75, voice="drums", confidence=0.95),
            ],
        ),
    ]
    asyncio.run(
        builder.build_multitrack_midi(
            tracks=tracks,
            tempo_bpm=120.0,
            time_signature="4/4",
            key_signature="C major",
            output_path=midi_path,
        )
    )
    return midi_path


def test_real_fluidsynth_renders_six_instrument_families_to_non_silent_stereo_wav(
    test_settings: Settings,
    tmp_path: Path,
) -> None:
    mgr = InstrumentResourceManager(test_settings)
    diag = mgr.get_diagnostics()
    assert diag.fluidsynth_available is True
    assert diag.sound_library.available is True
    assert diag.sound_library.soundfont_path is not None

    midi_path = _build_all_six_families_midi(tmp_path)
    out_wav = tmp_path / "rendered_full.wav"

    renderer = FluidSynthRenderer(test_settings, mgr)
    synth_diag = asyncio.run(
        renderer.render_midi_to_wav(
            midi_path=midi_path,
            output_wav_path=out_wav,
            sample_rate_hz=44100,
        )
    )

    assert out_wav.is_file()
    assert synth_diag.engine == "fluidsynth"
    assert synth_diag.sample_rate_hz == 44100
    assert synth_diag.channels == 2
    assert synth_diag.duration_ms >= 900
    assert synth_diag.peak_amplitude > 0.01
    assert synth_diag.rms_amplitude > 0.001

    samples, sr = sf.read(str(out_wav), dtype="float32", always_2d=True)
    assert sr == 44100
    assert samples.shape[1] == 2
    assert float(np.max(np.abs(samples))) > 0.01

    # Also verify InstrumentPlaybackInterface contract (`render_instruments`)
    iface_wav = tmp_path / "rendered_via_interface.wav"
    req = InstrumentPlaybackRequest(
        midi_path=str(midi_path),
        patches=[
            SampledInstrumentPatch(
                instrument_id="piano",
                sample_library_id="musescore-general",
                soundfont_or_sfz_ref=diag.sound_library.soundfont_path,
            ),
            SampledInstrumentPatch(
                instrument_id="drums",
                sample_library_id="musescore-general",
                soundfont_or_sfz_ref=diag.sound_library.soundfont_path,
            ),
        ],
        sample_rate_hz=44100,
    )
    iface_res = asyncio.run(renderer.render_instruments(req, iface_wav))
    assert Path(iface_res.rendered_audio_path).is_file()
    assert iface_res.sample_rate_hz == 44100
    assert iface_res.duration_ms >= 900


def test_real_fluidsynth_renders_each_instrument_family_individually(
    test_settings: Settings,
    tmp_path: Path,
) -> None:
    mgr = InstrumentResourceManager(test_settings)
    builder = MidoMIDIBuilder()
    renderer = FluidSynthRenderer(test_settings, mgr)

    family_test_notes = {
        "piano": 60,
        "strings": 64,
        "bass": 36,
        "brass": 60,
        "woodwinds": 72,
        "drums": GM_DRUM_KICK,
    }

    for inst_id, pitch in family_test_notes.items():
        spec = mgr.resolve_instrument(inst_id)
        midi_p = tmp_path / f"{inst_id}.mid"
        wav_p = tmp_path / f"{inst_id}.wav"
        asyncio.run(
            builder.build_multitrack_midi(
                tracks=[
                    MIDITrackSpec(
                        instrument_id=spec.instrument_id,
                        track_name=spec.display_name,
                        gm_program=spec.gm_program,
                        channel=spec.default_channel,
                        is_percussion=spec.is_percussion,
                        notes=[
                            NoteEvent(
                                start_ms=0,
                                end_ms=500,
                                midi_pitch=pitch,
                                velocity=96,
                                voice=spec.instrument_id,
                                confidence=0.95,
                            )
                        ],
                    )
                ],
                tempo_bpm=120.0,
                time_signature="4/4",
                key_signature="C major",
                output_path=midi_p,
            )
        )
        diag = asyncio.run(renderer.render_midi_to_wav(midi_path=midi_p, output_wav_path=wav_p))
        assert wav_p.is_file()
        assert diag.channels == 2
        assert diag.sample_rate_hz == 44100
        assert diag.peak_amplitude > 0.005


def test_instrument_resource_manager_enforces_security_and_missing_library_errors(
    tmp_path: Path,
) -> None:
    # 1. Explicit nonexistent SoundFont must fail honestly with SOUNDFONT_NOT_FOUND
    missing_sf_settings = Settings(
        music_engine_env="test",
        music_engine_temp_dir=str(tmp_path / "temp"),
        music_engine_local_storage_dir=str(tmp_path / "storage"),
        music_engine_soundfont_path=str(tmp_path / "nonexistent.sf3"),
    )
    mgr_missing = InstrumentResourceManager(missing_sf_settings)
    sf_status = mgr_missing.resolve_sound_library()
    assert sf_status.available is False
    assert sf_status.install_instructions is not None

    midi_path = _build_all_six_families_midi(tmp_path)
    renderer_missing = FluidSynthRenderer(missing_sf_settings, mgr_missing)
    with pytest.raises(SynthesisError) as sf_exc:
        asyncio.run(renderer_missing.render_midi_to_wav(midi_path=midi_path, output_wav_path=tmp_path / "x.wav"))
    assert sf_exc.value.code == "SOUNDFONT_NOT_FOUND"
    assert sf_exc.value.retryable is False

    # 2. SoundFont placed inside user upload storage must be REJECTED for security isolation
    user_sf = tmp_path / "storage" / "evil_upload.sf2"
    user_sf.parent.mkdir(parents=True, exist_ok=True)
    user_sf.write_bytes(b"RIFF\x00\x10\x00\x00sfbk" + b"\x00" * 2048)

    evil_settings = Settings(
        music_engine_env="test",
        music_engine_temp_dir=str(tmp_path / "temp"),
        music_engine_local_storage_dir=str(tmp_path / "storage"),
        music_engine_soundfont_path=str(user_sf),
    )
    evil_status = InstrumentResourceManager(evil_settings).resolve_sound_library()
    assert evil_status.available is False
    assert "forbidden for security isolation" in (evil_status.missing_reason or "")

    # 3. Missing FluidSynth binary must fail honestly with FLUIDSYNTH_NOT_AVAILABLE
    no_bin_settings = Settings(
        music_engine_env="test",
        music_engine_temp_dir=str(tmp_path / "temp"),
        music_engine_local_storage_dir=str(tmp_path / "storage"),
        fluidsynth_bin="/nonexistent/bin/fluidsynth-missing",
    )
    renderer_no_bin = FluidSynthRenderer(no_bin_settings, InstrumentResourceManager(no_bin_settings))
    with pytest.raises(SynthesisError) as bin_exc:
        asyncio.run(renderer_no_bin.render_midi_to_wav(midi_path=midi_path, output_wav_path=tmp_path / "y.wav"))
    assert bin_exc.value.code == "FLUIDSYNTH_NOT_AVAILABLE"

    # 4. Invalid GM program number raises InstrumentResourceError
    with pytest.raises(InstrumentResourceError) as gm_exc:
        InstrumentResourceManager.validate_program_number(128)
    assert gm_exc.value.code == "INVALID_GM_PROGRAM"


def test_fluidsynth_timeout_and_cancellation_cleanup(
    test_settings: Settings,
    tmp_path: Path,
) -> None:
    mgr = InstrumentResourceManager(test_settings)
    renderer = FluidSynthRenderer(test_settings, mgr)
    midi_path = _build_all_six_families_midi(tmp_path)
    out_wav = tmp_path / "timeout_partial.wav"

    class _HangingProcess:
        def __init__(self) -> None:
            self.returncode: int | None = None
            self.killed = False

        async def communicate(self) -> tuple[bytes, bytes]:
            out_wav.write_bytes(b"RIFFPARTIAL")
            await asyncio.sleep(10)
            return b"", b""

        def kill(self) -> None:
            self.killed = True
            self.returncode = -9

        async def wait(self) -> int:
            return -9

    hanging = _HangingProcess()

    async def _fake_exec(*args, **kwargs):
        return hanging

    with patch("asyncio.create_subprocess_exec", side_effect=_fake_exec):
        with pytest.raises(SynthesisError) as exc_info:
            asyncio.run(
                renderer.render_midi_to_wav(
                    midi_path=midi_path,
                    output_wav_path=out_wav,
                    timeout_seconds=1,
                )
            )
    assert exc_info.value.code == "SYNTHESIS_TIMEOUT"
    assert exc_info.value.retryable is True
    assert hanging.killed is True
    assert not out_wav.exists()
