from __future__ import annotations

import asyncio
from pathlib import Path

import numpy as np
import soundfile as sf

from app.core.config import Settings
from app.processing.interfaces import MixingAndRenderingRequest, MixTrackInput
from app.processing.mastering import (
    TRUE_PEAK_METHOD_LABEL,
    LoudnessMasterProcessor,
    MasteringConfig,
    measure_loudness,
)
from app.processing.mixing import MixAndExportConfig, SonoraAudioMixerAndMaster
from app.schemas.audio import AudioFormat


def _write_tone_wav(
    path: Path,
    *,
    freq_hz: float,
    duration_sec: float,
    sample_rate: int = 44100,
    amplitude: float = 0.25,
    channels: int = 1,
) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    n = int(round(sample_rate * duration_sec))
    t = np.arange(n, dtype=np.float64) / sample_rate
    wave = amplitude * np.sin(2.0 * np.pi * freq_hz * t)
    if channels == 2:
        data = np.column_stack([wave, wave])
    else:
        data = wave
    sf.write(str(path), data.astype(np.float32), sample_rate, subtype="PCM_16")
    return path


def test_non_destructive_vocal_accompaniment_mix_preserves_original_and_alignment(
    test_settings: Settings,
    tmp_path: Path,
) -> None:
    # Mono 22.05 kHz vocal + Stereo 44.1 kHz accompaniment (verifies resampling & channel consistency)
    vocal_path = _write_tone_wav(
        tmp_path / "original_vocal.wav",
        freq_hz=523.25,  # C5
        duration_sec=2.0,
        sample_rate=22050,
        amplitude=0.18,
        channels=1,
    )
    accomp_path = _write_tone_wav(
        tmp_path / "accompaniment.wav",
        freq_hz=261.63,  # C4
        duration_sec=3.0,
        sample_rate=44100,
        amplitude=0.35,
        channels=2,
    )
    original_vocal_bytes = vocal_path.read_bytes()

    mixer = SonoraAudioMixerAndMaster(test_settings)
    cfg = MixAndExportConfig(
        output_formats=[AudioFormat.WAV],
        sample_rate_hz=44100,
        intro_offset_ms=1000,  # 1s intro before vocal enters
        vocal_gain_db=1.0,
        accompaniment_gain_db=-6.0,
        vocal_balance_mode="auto_adaptive",
        preserve_outro=True,
    )

    res = asyncio.run(
        mixer.mix_vocal_and_accompaniment(
            vocal_path=vocal_path,
            accompaniment_path=accomp_path,
            output_dir=tmp_path / "out",
            config=cfg,
        )
    )

    # Original vocal recording bytes are strictly untouched
    assert vocal_path.read_bytes() == original_vocal_bytes
    assert res.original_vocal_preserved is True
    assert res.vocal_timing_and_pitch_unmodified is True
    assert res.sample_rate_hz == 44100
    assert res.channels == 2
    assert res.mix_duration_ms == 3000  # max(1000 + 2000, 3000)
    assert res.tracks_mixed[0].resampled is True  # 22050 -> 44100

    # Verify rendered WAV has accompaniment in first 1s and BOTH vocal + accompaniment after 1s
    master_wav = Path(res.exports[0].output_path)
    data, sr = sf.read(str(master_wav), dtype="float64", always_2d=True)
    assert sr == 44100
    assert data.shape[1] == 2
    assert res.mastering.clipping_detected is False
    assert res.mastering.true_peak_compliant is True

    # FFT spectral check: 523.25 Hz vocal must be absent in intro [0.1s..0.9s] and present in [1.1s..2.9s]
    intro_seg = data[int(0.1 * sr) : int(0.9 * sr), 0]
    body_seg = data[int(1.1 * sr) : int(2.9 * sr), 0]
    freqs_intro = np.fft.rfftfreq(len(intro_seg), 1.0 / sr)
    mag_intro = np.abs(np.fft.rfft(intro_seg))
    freqs_body = np.fft.rfftfreq(len(body_seg), 1.0 / sr)
    mag_body = np.abs(np.fft.rfft(body_seg))

    vocal_energy_intro = float(np.max(mag_intro[(freqs_intro >= 510) & (freqs_intro <= 536)]))
    vocal_energy_body = float(np.max(mag_body[(freqs_body >= 510) & (freqs_body <= 536)]))
    accomp_energy_body = float(np.max(mag_body[(freqs_body >= 250) & (freqs_body <= 273)]))
    assert vocal_energy_body > vocal_energy_intro * 20.0
    assert accomp_energy_body > 0.01


def test_mixing_handles_shorter_accompaniment_stem_levels_and_silence(
    test_settings: Settings,
    tmp_path: Path,
) -> None:
    # Vocal (2.5s) longer than accompaniment (1.2s) -> must NOT truncate vocal
    vocal_path = _write_tone_wav(tmp_path / "long_vocal.wav", freq_hz=440.0, duration_sec=2.5, amplitude=0.2)
    short_acc = _write_tone_wav(tmp_path / "short_acc.wav", freq_hz=220.0, duration_sec=1.2, amplitude=0.2, channels=2)

    # Two distinct stems (piano panned left, bass panned right)
    piano_stem = _write_tone_wav(tmp_path / "piano.wav", freq_hz=330.0, duration_sec=1.2, amplitude=0.25, channels=2)
    bass_stem = _write_tone_wav(tmp_path / "bass.wav", freq_hz=110.0, duration_sec=1.2, amplitude=0.25, channels=2)

    mixer = SonoraAudioMixerAndMaster(test_settings)
    res = asyncio.run(
        mixer.mix_vocal_and_accompaniment(
            vocal_path=vocal_path,
            accompaniment_path=short_acc,
            stem_paths={"piano": piano_stem, "bass": bass_stem},
            output_dir=tmp_path / "out_stems",
            config=MixAndExportConfig(
                output_formats=[AudioFormat.WAV],
                vocal_balance_mode="manual",
                vocal_gain_db=-12.0,
                accompaniment_gain_db=0.0,
                stem_gains_db={"piano": 3.0, "bass": -12.0},
                stem_pans={"piano": -0.9, "bass": 0.9},
            ),
        )
    )

    assert res.used_individual_stems is True
    assert res.mix_duration_ms >= 2490  # full vocal duration preserved
    assert any("preserved without truncation" in w for w in res.warnings)

    # Verify panning + stem gain made left channel (piano +3 dB panned left) louder than right channel
    master_data, _ = sf.read(res.exports[0].output_path, dtype="float64", always_2d=True)
    seg = master_data[: int(1.0 * 44100), :]
    left_rms = float(np.sqrt(np.mean(seg[:, 0] ** 2)))
    right_rms = float(np.sqrt(np.mean(seg[:, 1] ** 2)))
    assert left_rms > right_rms * 1.4

    # Silence handling: silent vocal + silent accompaniment completes cleanly without clipping or fake LUFS
    silent_path = tmp_path / "silent.wav"
    sf.write(str(silent_path), np.zeros((44100, 2), dtype=np.float32), 44100, subtype="PCM_16")
    silent_res = asyncio.run(
        mixer.mix_vocal_and_accompaniment(
            vocal_path=silent_path,
            accompaniment_path=silent_path,
            output_dir=tmp_path / "out_silent",
            config=MixAndExportConfig(output_formats=[AudioFormat.WAV]),
        )
    )
    assert silent_res.mastering.input_metrics.is_silent is True
    assert silent_res.mastering.target_lufs_achieved is False
    assert silent_res.mastering.clipping_detected is False
    assert silent_res.mastering.applied_gain_db == 0.0

    # MixingAndRenderingInterface.mix_and_render contract check
    iface_res = asyncio.run(
        mixer.mix_and_render(
            MixingAndRenderingRequest(
                tracks=[
                    MixTrackInput(track_id="vocal", audio_path=str(vocal_path), gain_db=0.0, is_original_vocal=True),
                    MixTrackInput(track_id="acc", audio_path=str(short_acc), gain_db=-4.0),
                ],
                output_format=AudioFormat.WAV,
                sample_rate_hz=44100,
                target_lufs=-14.0,
            ),
            tmp_path / "out_iface",
        )
    )
    assert Path(iface_res.output_path).is_file()
    assert iface_res.original_tracks_preserved is True
    assert iface_res.sample_rate_hz == 44100


def test_loudness_normalization_target_minus14_and_true_peak_vs_sample_peak() -> None:
    sr = 44100
    t = np.arange(int(sr * 2.5), dtype=np.float64) / sr
    # Quiet harmonic music-like signal (~ -26 LUFS) -> should normalize cleanly to -14 LUFS without clipping
    musical = (
        0.04 * np.sin(2.0 * np.pi * 220.0 * t)
        + 0.03 * np.sin(2.0 * np.pi * 440.0 * t)
        + 0.02 * np.sin(2.0 * np.pi * 660.0 * t)
    )
    stereo = np.column_stack([musical, musical])

    processor = LoudnessMasterProcessor()
    out, report = processor.process(
        stereo,
        sample_rate_hz=sr,
        config=MasteringConfig(target_lufs=-14.0, true_peak_ceiling_dbtp=-1.0),
    )

    assert report.true_peak_method == TRUE_PEAK_METHOD_LABEL
    assert report.input_metrics.integrated_lufs is not None
    assert report.output_metrics.integrated_lufs is not None
    assert abs(report.output_metrics.integrated_lufs - (-14.0)) <= 0.6
    assert report.target_lufs_achieved is True
    assert report.true_peak_compliant is True
    assert report.output_metrics.true_peak_dbtp is not None
    assert report.output_metrics.true_peak_dbtp <= -0.92
    assert report.clipping_detected is False
    assert report.limiting_applied is False  # pure linear gain, zero unnecessary limiting!
    assert out.shape == stereo.shape

    # True-peak vs sample-peak test: fs/4 sine sampled at 45° phase (samples hit ±0.7071 = -3.01 dBFS,
    # while true continuous peak hits ±1.0 = 0.0 dBTP!). Proves 4x oversampled true peak catches inter-sample overs.
    n = sr * 2
    idx = np.arange(n, dtype=np.float64)
    isp_wave = 0.99 * np.sin(0.5 * np.pi * idx + np.pi / 4.0)
    isp_stereo = np.column_stack([isp_wave, isp_wave])
    isp_metrics = measure_loudness(isp_stereo, sample_rate_hz=sr, oversampling_factor=4)
    assert isp_metrics.sample_peak_dbfs is not None
    assert isp_metrics.true_peak_dbtp is not None
    assert isp_metrics.true_peak_dbtp > isp_metrics.sample_peak_dbfs + 2.0  # ~3.0 dB inter-sample peak!

    # Mastering must hold true peak (not just sample peak!) safely under -1.0 dBTP
    _, isp_report = processor.process(
        isp_stereo,
        sample_rate_hz=sr,
        config=MasteringConfig(target_lufs=-14.0, true_peak_ceiling_dbtp=-1.0),
    )
    assert isp_report.true_peak_compliant is True
    assert isp_report.output_metrics.true_peak_dbtp is not None
    assert isp_report.output_metrics.true_peak_dbtp <= -0.92


def test_loudness_safeguard_refuses_excessive_limiting_and_reports_honestly() -> None:
    sr = 44100
    n = int(sr * 3.0)
    # High crest-factor transient fixture: soft sustained bed + sharp full-scale percussive spikes.
    # Reaching -14 LUFS would require > 10 dB of limiting; safeguard (max_limiting_db=3.0) must refuse to crush it!
    t = np.arange(n, dtype=np.float64) / sr
    bed = 0.012 * np.sin(2.0 * np.pi * 330.0 * t)
    spikes = np.zeros(n, dtype=np.float64)
    for sec in (0.5, 1.5, 2.5):
        center = int(sec * sr)
        burst_len = int(0.015 * sr)
        env = np.hanning(burst_len)
        spikes[center : center + burst_len] = 0.95 * env * np.sin(
            2.0 * np.pi * 1200.0 * np.arange(burst_len) / sr
        )
    spiky = np.column_stack([bed + spikes, bed + spikes])

    processor = LoudnessMasterProcessor()
    _, report = processor.process(
        spiky,
        sample_rate_hz=sr,
        config=MasteringConfig(target_lufs=-14.0, true_peak_ceiling_dbtp=-1.0, max_limiting_db=3.0),
    )

    # Honest reporting: did NOT crush dynamics to fake -14 LUFS compliance
    assert report.target_lufs_achieved is False
    assert report.true_peak_compliant is True
    assert report.clipping_detected is False
    assert report.output_metrics.true_peak_dbtp is not None
    assert report.output_metrics.true_peak_dbtp <= -0.92
    assert report.output_metrics.integrated_lufs is not None
    assert report.output_metrics.integrated_lufs < -15.5
    assert any("could not be reached" in w or "limiting safeguard" in w for w in report.warnings)
