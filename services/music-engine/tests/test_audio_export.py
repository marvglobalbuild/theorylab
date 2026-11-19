from __future__ import annotations

import asyncio
import json
import subprocess
from pathlib import Path
from unittest.mock import patch

import numpy as np
import pytest

from app.core.config import Settings
from app.core.errors import AudioExportError
from app.processing.exporter import AudioFormatExporter, ExportMetadata
from app.schemas.audio import AudioFormat


def _make_test_stereo_master(duration_sec: float = 1.5, sample_rate: int = 44100) -> np.ndarray:
    t = np.arange(int(round(duration_sec * sample_rate)), dtype=np.float64) / sample_rate
    left = 0.35 * np.sin(2.0 * np.pi * 440.0 * t) + 0.15 * np.sin(2.0 * np.pi * 660.0 * t)
    right = 0.35 * np.sin(2.0 * np.pi * 440.0 * t) + 0.15 * np.sin(2.0 * np.pi * 554.37 * t)
    return np.column_stack([left, right])


def test_audio_exporter_wav16_wav24_flac_and_mp3_320kbps_ffprobe_verified(
    test_settings: Settings,
    tmp_path: Path,
) -> None:
    exporter = AudioFormatExporter(test_settings)
    stereo = _make_test_stereo_master(duration_sec=1.5, sample_rate=44100)
    meta = ExportMetadata(
        title="SONORA Accompaniment Test",
        artist="SONORA Test Vocalist",
        album="Phase 5.2 Run 3",
        comment="Non-destructive vocal and accompaniment master",
    )

    # 1. WAV 16-bit
    wav16 = asyncio.run(
        exporter.export_master(
            stereo_audio=stereo,
            sample_rate_hz=44100,
            output_dir=tmp_path / "wav16",
            base_filename="master_16",
            output_format=AudioFormat.WAV,
            wav_bit_depth=16,
            metadata=meta,
        )
    )
    assert Path(wav16.output_path).is_file()
    assert wav16.codec_name == "pcm_s16le"
    assert wav16.bit_depth == 16
    assert wav16.sample_rate_hz == 44100
    assert wav16.channels == 2
    assert 1450 <= wav16.duration_ms <= 1550
    assert wav16.ffprobe_verified is True
    assert wav16.soundfile_verified is True
    assert wav16.peak_amplitude is not None and wav16.peak_amplitude > 0.3

    # 2. WAV 24-bit
    wav24 = asyncio.run(
        exporter.export_master(
            stereo_audio=stereo,
            sample_rate_hz=44100,
            output_dir=tmp_path / "wav24",
            base_filename="master_24",
            output_format=AudioFormat.WAV,
            wav_bit_depth=24,
            metadata=meta,
        )
    )
    assert Path(wav24.output_path).is_file()
    assert wav24.codec_name == "pcm_s24le"
    assert wav24.bit_depth == 24
    assert wav24.size_bytes > wav16.size_bytes  # 24-bit PCM is ~1.5x larger than 16-bit
    assert wav24.ffprobe_verified is True
    assert wav24.soundfile_verified is True

    # 3. FLAC (lossless)
    flac_res = asyncio.run(
        exporter.export_master(
            stereo_audio=stereo,
            sample_rate_hz=44100,
            output_dir=tmp_path / "flac",
            base_filename="master",
            output_format=AudioFormat.FLAC,
            metadata=meta,
        )
    )
    assert Path(flac_res.output_path).is_file()
    assert flac_res.codec_name == "flac"
    assert flac_res.mime_type == "audio/flac"
    assert flac_res.sample_rate_hz == 44100
    assert flac_res.channels == 2
    assert 1450 <= flac_res.duration_ms <= 1550
    assert flac_res.ffprobe_verified is True
    assert flac_res.soundfile_verified is True

    # Verify FLAC metadata tags directly via FFprobe
    flac_probe = json.loads(
        subprocess.check_output(
            [test_settings.ffprobe_bin, "-v", "error", "-print_format", "json", "-show_format", flac_res.output_path]
        ).decode("utf-8")
    )
    flac_tags = {k.lower(): v for k, v in flac_probe["format"].get("tags", {}).items()}
    assert flac_tags.get("title") == "SONORA Accompaniment Test"
    assert flac_tags.get("artist") == "SONORA Test Vocalist"

    # 4. MP3 320 kbps
    mp3_res = asyncio.run(
        exporter.export_master(
            stereo_audio=stereo,
            sample_rate_hz=44100,
            output_dir=tmp_path / "mp3",
            base_filename="master",
            output_format=AudioFormat.MP3,
            mp3_bitrate_kbps=320,
            metadata=meta,
        )
    )
    assert Path(mp3_res.output_path).is_file()
    assert mp3_res.codec_name == "mp3"
    assert mp3_res.mime_type == "audio/mpeg"
    assert mp3_res.sample_rate_hz == 44100
    assert mp3_res.channels == 2
    assert mp3_res.bitrate_kbps is not None and 300 <= mp3_res.bitrate_kbps <= 340
    assert 1450 <= mp3_res.duration_ms <= 1650
    assert mp3_res.ffprobe_verified is True

    # Verify ID3 tags via FFprobe
    mp3_probe = json.loads(
        subprocess.check_output(
            [test_settings.ffprobe_bin, "-v", "error", "-print_format", "json", "-show_format", mp3_res.output_path]
        ).decode("utf-8")
    )
    mp3_tags = {k.lower(): v for k, v in mp3_probe["format"].get("tags", {}).items()}
    assert mp3_tags.get("title") == "SONORA Accompaniment Test"


def test_audio_exporter_rejects_unsupported_format_and_cleans_up_on_timeout(
    test_settings: Settings,
    tmp_path: Path,
) -> None:
    exporter = AudioFormatExporter(test_settings)
    stereo = _make_test_stereo_master(duration_sec=0.6)

    with pytest.raises(AudioExportError) as fmt_exc:
        asyncio.run(
            exporter.export_master(
                stereo_audio=stereo,
                sample_rate_hz=44100,
                output_dir=tmp_path,
                output_format=AudioFormat.OGG,
            )
        )
    assert fmt_exc.value.code == "UNSUPPORTED_EXPORT_FORMAT"

    out_mp3 = tmp_path / "timeout_master.mp3"

    class _SlowFFmpeg:
        def __init__(self) -> None:
            self.returncode: int | None = None
            self.killed = False

        async def communicate(self) -> tuple[bytes, bytes]:
            out_mp3.write_bytes(b"ID3PARTIAL")
            await asyncio.sleep(10)
            return b"", b""

        def kill(self) -> None:
            self.killed = True
            self.returncode = -9

        async def wait(self) -> int:
            return -9

    slow = _SlowFFmpeg()

    async def _fake_exec(*args, **kwargs):
        return slow

    with patch("asyncio.create_subprocess_exec", side_effect=_fake_exec):
        with pytest.raises(AudioExportError) as timeout_exc:
            asyncio.run(
                exporter.export_master(
                    stereo_audio=stereo,
                    sample_rate_hz=44100,
                    output_dir=tmp_path,
                    base_filename="timeout_master",
                    output_format=AudioFormat.MP3,
                    timeout_seconds=1,
                )
            )
    assert timeout_exc.value.code == "EXPORT_TIMEOUT"
    assert timeout_exc.value.retryable is True
    assert slow.killed is True
    assert not out_mp3.exists()
