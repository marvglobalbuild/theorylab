from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Any, Literal

import numpy as np
import soundfile as sf
from pydantic import BaseModel, Field

from app.core.config import Settings
from app.core.errors import AudioExportError
from app.processing.mastering import ensure_stereo_float64
from app.schemas.audio import AudioFormat

EXPORT_MIME_TYPES: dict[AudioFormat, str] = {
    AudioFormat.WAV: "audio/wav",
    AudioFormat.FLAC: "audio/flac",
    AudioFormat.MP3: "audio/mpeg",
}

SUPPORTED_EXPORT_FORMATS: frozenset[AudioFormat] = frozenset(
    {AudioFormat.WAV, AudioFormat.FLAC, AudioFormat.MP3}
)


class ExportMetadata(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    artist: str | None = Field(default=None, max_length=200)
    album: str | None = Field(default=None, max_length=200)
    comment: str | None = Field(default=None, max_length=400)


class ExportResult(BaseModel):
    format: AudioFormat
    filename: str
    output_path: str
    mime_type: str
    size_bytes: int = Field(ge=1)
    sample_rate_hz: int = Field(ge=8000)
    channels: int = Field(ge=1)
    duration_ms: int = Field(ge=1)
    bit_depth: int | None = None
    bitrate_kbps: int | None = None
    codec_name: str
    ffprobe_verified: bool = True
    soundfile_verified: bool = False
    peak_amplitude: float | None = None
    metadata_written: dict[str, str] = Field(default_factory=dict)


def _metadata_ffmpeg_args(metadata: ExportMetadata | None) -> tuple[list[str], dict[str, str]]:
    if metadata is None:
        return [], {}
    args: list[str] = []
    written: dict[str, str] = {}
    for key in ("title", "artist", "album", "comment"):
        val = getattr(metadata, key, None)
        if val and val.strip():
            # Strip control characters to prevent malformed metadata injection
            clean = "".join(ch for ch in val.strip() if ord(ch) >= 32)
            if clean:
                args.extend(["-metadata", f"{key}={clean}"])
                written[key] = clean
    return args, written


class AudioFormatExporter:
    """
    Production audio format exporter supporting stereo WAV (16-bit & 24-bit PCM),
    lossless FLAC, and MP3 (configurable bitrate, default 320 kbps).

    Security & reliability guarantees:
      - Invokes FFmpeg and FFprobe strictly via `asyncio.create_subprocess_exec`
        argument arrays (zero shell string interpolation).
      - Enforces timeouts and cooperative cancellation with partial-file cleanup.
      - Validates EVERY exported file via FFprobe (and soundfile for WAV/FLAC).
    """

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    async def export_master(
        self,
        *,
        stereo_audio: np.ndarray,
        sample_rate_hz: int,
        output_dir: Path,
        base_filename: str = "master",
        output_format: AudioFormat = AudioFormat.WAV,
        wav_bit_depth: Literal[16, 24] = 16,
        mp3_bitrate_kbps: int = 320,
        metadata: ExportMetadata | None = None,
        timeout_seconds: int | None = None,
    ) -> ExportResult:
        if output_format not in SUPPORTED_EXPORT_FORMATS:
            raise AudioExportError(
                f"Export format '{output_format.value}' is not supported. Use wav, flac, or mp3.",
                code="UNSUPPORTED_EXPORT_FORMAT",
                status_code=422,
                retryable=False,
            )

        stereo = ensure_stereo_float64(stereo_audio)
        if stereo.shape[0] == 0:
            raise AudioExportError(
                "Cannot export an empty audio buffer (0 frames).",
                code="EMPTY_EXPORT_AUDIO",
                status_code=422,
                retryable=False,
            )

        # Hard safety clamp to [-1.0, 1.0] before PCM quantization (mastering already protects true peak)
        clamped = np.clip(stereo, -1.0, 1.0)
        output_dir.mkdir(parents=True, exist_ok=True)
        eff_timeout = int(timeout_seconds or self._settings.music_engine_export_timeout_seconds)

        # Write high-precision temporary float64 WAV source inside output_dir for FFmpeg encoding
        staging_wav = output_dir / f"._{base_filename}_{output_format.value}_src.wav"
        target_ext = output_format.value
        final_path = output_dir / f"{base_filename}.{target_ext}"

        meta_args, written_meta = _metadata_ffmpeg_args(metadata)

        try:
            await asyncio.to_thread(
                sf.write,
                str(staging_wav),
                clamped,
                sample_rate_hz,
                "DOUBLE",
                None,
                "WAV",
            )

            if output_format == AudioFormat.WAV:
                pcm_codec = "pcm_s24le" if wav_bit_depth == 24 else "pcm_s16le"
                cmd = [
                    self._settings.ffmpeg_bin,
                    "-y",
                    "-v",
                    "error",
                    "-i",
                    str(staging_wav),
                    "-ar",
                    str(sample_rate_hz),
                    "-ac",
                    "2",
                    "-c:a",
                    pcm_codec,
                    *meta_args,
                    str(final_path),
                ]
            elif output_format == AudioFormat.FLAC:
                cmd = [
                    self._settings.ffmpeg_bin,
                    "-y",
                    "-v",
                    "error",
                    "-i",
                    str(staging_wav),
                    "-ar",
                    str(sample_rate_hz),
                    "-ac",
                    "2",
                    "-c:a",
                    "flac",
                    "-compression_level",
                    "5",
                    *meta_args,
                    str(final_path),
                ]
            else:  # MP3
                safe_bitrate = max(128, min(320, int(mp3_bitrate_kbps)))
                cmd = [
                    self._settings.ffmpeg_bin,
                    "-y",
                    "-v",
                    "error",
                    "-i",
                    str(staging_wav),
                    "-ar",
                    str(sample_rate_hz),
                    "-ac",
                    "2",
                    "-c:a",
                    "libmp3lame",
                    "-b:a",
                    f"{safe_bitrate}k",
                    "-id3v2_version",
                    "3",
                    *meta_args,
                    str(final_path),
                ]

            await self._run_subprocess(cmd, output_to_clean=final_path, timeout_seconds=eff_timeout)

            # Validate every export with FFprobe (and soundfile for WAV/FLAC)
            return await self._validate_exported_file(
                path=final_path,
                expected_format=output_format,
                expected_sr=sample_rate_hz,
                expected_wav_bit_depth=wav_bit_depth if output_format == AudioFormat.WAV else None,
                expected_mp3_bitrate_kbps=mp3_bitrate_kbps if output_format == AudioFormat.MP3 else None,
                written_meta=written_meta,
                timeout_seconds=min(30, eff_timeout),
            )
        finally:
            self._remove_file_quietly(staging_wav)

    async def _run_subprocess(
        self,
        cmd: list[str],
        *,
        output_to_clean: Path | None,
        timeout_seconds: int,
    ) -> tuple[bytes, bytes]:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        try:
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=timeout_seconds)
        except asyncio.TimeoutError as exc:
            await self._terminate_process(proc)
            if output_to_clean is not None:
                self._remove_file_quietly(output_to_clean)
            raise AudioExportError(
                f"Audio export subprocess exceeded timeout of {timeout_seconds} seconds.",
                code="EXPORT_TIMEOUT",
                status_code=504,
                retryable=True,
            ) from exc
        except asyncio.CancelledError:
            await self._terminate_process(proc)
            if output_to_clean is not None:
                self._remove_file_quietly(output_to_clean)
            raise

        if proc.returncode != 0:
            if output_to_clean is not None:
                self._remove_file_quietly(output_to_clean)
            stderr_tail = (stderr or b"").decode("utf-8", errors="replace")[-500:]
            raise AudioExportError(
                f"Audio export command exited with status {proc.returncode}.",
                code="AUDIO_EXPORT_FAILED",
                status_code=502,
                details={"returncode": proc.returncode, "stderr_excerpt": stderr_tail},
                retryable=False,
            )
        return stdout, stderr

    async def _validate_exported_file(
        self,
        *,
        path: Path,
        expected_format: AudioFormat,
        expected_sr: int,
        expected_wav_bit_depth: int | None,
        expected_mp3_bitrate_kbps: int | None,
        written_meta: dict[str, str],
        timeout_seconds: int,
    ) -> ExportResult:
        if not path.is_file() or path.stat().st_size == 0:
            raise AudioExportError(
                f"Exported file '{path.name}' is missing or empty.",
                code="EXPORT_VALIDATION_FAILED",
                status_code=502,
            )

        probe_cmd = [
            self._settings.ffprobe_bin,
            "-v",
            "error",
            "-print_format",
            "json",
            "-show_format",
            "-show_streams",
            str(path),
        ]
        stdout, _ = await self._run_subprocess(
            probe_cmd,
            output_to_clean=None,
            timeout_seconds=timeout_seconds,
        )

        try:
            payload: dict[str, Any] = json.loads(stdout.decode("utf-8"))
        except Exception as exc:
            raise AudioExportError(
                f"FFprobe returned unreadable metadata for '{path.name}'.",
                code="EXPORT_VALIDATION_FAILED",
                status_code=502,
            ) from exc

        audio_streams = [s for s in payload.get("streams", []) if s.get("codec_type") == "audio"]
        if not audio_streams:
            raise AudioExportError(
                f"FFprobe found no audio stream in exported file '{path.name}'.",
                code="EXPORT_VALIDATION_FAILED",
                status_code=502,
            )

        stream = audio_streams[0]
        fmt_info = payload.get("format", {})

        codec_name = str(stream.get("codec_name") or "unknown")
        probed_sr = int(stream.get("sample_rate") or 0)
        probed_ch = int(stream.get("channels") or 0)
        duration_sec = float(stream.get("duration") or fmt_info.get("duration") or 0.0)
        duration_ms = int(round(duration_sec * 1000.0))

        if probed_sr != expected_sr:
            raise AudioExportError(
                f"Exported '{path.name}' sample rate ({probed_sr} Hz) != expected ({expected_sr} Hz).",
                code="EXPORT_VALIDATION_FAILED",
                status_code=502,
            )
        if probed_ch != 2:
            raise AudioExportError(
                f"Exported '{path.name}' must be stereo (2 channels), got {probed_ch}.",
                code="EXPORT_VALIDATION_FAILED",
                status_code=502,
            )
        if duration_ms <= 0:
            raise AudioExportError(
                f"Exported '{path.name}' reported invalid duration ({duration_ms} ms).",
                code="EXPORT_VALIDATION_FAILED",
                status_code=502,
            )

        bit_depth: int | None = None
        bitrate_kbps: int | None = None

        if expected_format == AudioFormat.WAV:
            expected_codec = "pcm_s24le" if expected_wav_bit_depth == 24 else "pcm_s16le"
            if codec_name != expected_codec:
                raise AudioExportError(
                    f"Exported WAV codec '{codec_name}' != expected '{expected_codec}'.",
                    code="EXPORT_VALIDATION_FAILED",
                    status_code=502,
                )
            raw_bits = stream.get("bits_per_sample") or stream.get("bits_per_raw_sample")
            bit_depth = int(raw_bits) if raw_bits else expected_wav_bit_depth
        elif expected_format == AudioFormat.FLAC:
            if codec_name != "flac":
                raise AudioExportError(
                    f"Exported FLAC codec '{codec_name}' != expected 'flac'.",
                    code="EXPORT_VALIDATION_FAILED",
                    status_code=502,
                )
            raw_bits = stream.get("bits_per_raw_sample") or stream.get("bits_per_sample")
            bit_depth = int(raw_bits) if raw_bits and int(raw_bits) > 0 else 24
        elif expected_format == AudioFormat.MP3:
            if codec_name != "mp3":
                raise AudioExportError(
                    f"Exported MP3 codec '{codec_name}' != expected 'mp3'.",
                    code="EXPORT_VALIDATION_FAILED",
                    status_code=502,
                )
            raw_br = stream.get("bit_rate") or fmt_info.get("bit_rate")
            bitrate_kbps = int(round(float(raw_br) / 1000.0)) if raw_br else expected_mp3_bitrate_kbps

        soundfile_verified = False
        peak_amp: float | None = None
        if expected_format in {AudioFormat.WAV, AudioFormat.FLAC}:
            peak_amp = await asyncio.to_thread(self._verify_with_soundfile, path, expected_sr)
            soundfile_verified = True

        return ExportResult(
            format=expected_format,
            filename=path.name,
            output_path=str(path),
            mime_type=EXPORT_MIME_TYPES[expected_format],
            size_bytes=path.stat().st_size,
            sample_rate_hz=probed_sr,
            channels=probed_ch,
            duration_ms=duration_ms,
            bit_depth=bit_depth,
            bitrate_kbps=bitrate_kbps,
            codec_name=codec_name,
            ffprobe_verified=True,
            soundfile_verified=soundfile_verified,
            peak_amplitude=round(peak_amp, 6) if peak_amp is not None else None,
            metadata_written=written_meta,
        )

    @staticmethod
    def _verify_with_soundfile(path: Path, expected_sr: int) -> float:
        try:
            data, sr = sf.read(str(path), dtype="float32", always_2d=True)
        except Exception as exc:
            raise AudioExportError(
                f"soundfile could not verify exported '{path.name}' ({type(exc).__name__}).",
                code="EXPORT_VALIDATION_FAILED",
                status_code=502,
            ) from exc
        if int(sr) != expected_sr or data.shape[1] != 2 or data.shape[0] == 0:
            raise AudioExportError(
                f"soundfile validation failed for '{path.name}' (sr={sr}, shape={data.shape}).",
                code="EXPORT_VALIDATION_FAILED",
                status_code=502,
            )
        return float(np.max(np.abs(data)))

    @staticmethod
    async def _terminate_process(proc: asyncio.subprocess.Process) -> None:
        if proc.returncode is not None:
            return
        try:
            proc.kill()
        except ProcessLookupError:
            return
        try:
            await asyncio.wait_for(proc.wait(), timeout=5)
        except Exception:
            pass

    @staticmethod
    def _remove_file_quietly(path: Path) -> None:
        try:
            if path.exists():
                path.unlink()
        except OSError:
            pass
