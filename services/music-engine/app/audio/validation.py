from __future__ import annotations

import asyncio
import json
import shutil
import subprocess
import wave
from pathlib import Path

from app.core.errors import AudioValidationError
from app.schemas.audio import AudioFormat, AudioMetadata

FORMAT_MIME_TYPES: dict[AudioFormat, list[str]] = {
    AudioFormat.WAV: ["audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave"],
    AudioFormat.MP3: ["audio/mpeg", "audio/mp3"],
    AudioFormat.FLAC: ["audio/flac", "audio/x-flac"],
    AudioFormat.M4A: ["audio/mp4", "audio/x-m4a", "audio/m4a"],
    AudioFormat.AAC: ["audio/aac", "audio/aacp"],
    AudioFormat.OGG: ["audio/ogg", "application/ogg"],
    AudioFormat.WEBM: ["audio/webm"],
}

EXTENSION_TO_FORMAT: dict[str, AudioFormat] = {
    ".wav": AudioFormat.WAV,
    ".wave": AudioFormat.WAV,
    ".mp3": AudioFormat.MP3,
    ".flac": AudioFormat.FLAC,
    ".m4a": AudioFormat.M4A,
    ".aac": AudioFormat.AAC,
    ".ogg": AudioFormat.OGG,
    ".oga": AudioFormat.OGG,
    ".webm": AudioFormat.WEBM,
}

# Known ISO base media brands used by M4A/MP4 audio containers
_MP4_AUDIO_BRANDS = {b"M4A ", b"M4B ", b"mp42", b"isom", b"iso2", b"dash", b"3gp4"}


def sniff_audio_format_from_bytes(header: bytes, filename: str | None = None) -> AudioFormat:
    """
    Inspects magic bytes at the start of a file to verify it is a genuine audio container
    and reject disguised non-audio payloads (HTML, JSON, scripts, executables, empty files).
    """
    if len(header) < 12:
        raise AudioValidationError(
            "Audio file is empty or truncated and cannot be decoded.",
            code="CORRUPTED_OR_EMPTY_AUDIO",
            details={"bytes_read": len(header)},
        )

    # WAV: RIFF <4 bytes size> WAVE
    if header[:4] == b"RIFF" and header[8:12] == b"WAVE":
        return AudioFormat.WAV

    # FLAC: fLaC
    if header[:4] == b"fLaC":
        return AudioFormat.FLAC

    # OGG: OggS
    if header[:4] == b"OggS":
        return AudioFormat.OGG

    # WebM / Matroska: EBML header 0x1A 0x45 0xDF 0xA3
    if header[:4] == b"\x1a\x45\xdf\xa3":
        return AudioFormat.WEBM

    # MP4 / M4A: [size:4] ftyp [brand:4]
    if header[4:8] == b"ftyp" and header[8:12] in _MP4_AUDIO_BRANDS:
        return AudioFormat.M4A

    # MP3 with ID3v2 header
    if header[:3] == b"ID3":
        return AudioFormat.MP3

    # Raw MPEG Audio frame sync (11 bits set: 0xFF and top 3 bits of byte 1 == 0xE0)
    # Note: AAC ADTS also starts with 0xFFFx (layer bits == 00), while MP3 has layer bits != 00.
    if header[0] == 0xFF and (header[1] & 0xE0) == 0xE0:
        layer_bits = (header[1] >> 1) & 0x03
        if layer_bits == 0:
            return AudioFormat.AAC
        return AudioFormat.MP3

    # Check extension only to provide a clearer error message when magic bytes do not match
    ext_hint = Path(filename).suffix.lower() if filename else ""
    raise AudioValidationError(
        "File header does not match any supported audio format (WAV, MP3, FLAC, M4A, AAC, OGG, WebM).",
        code="UNSUPPORTED_OR_INVALID_AUDIO_HEADER",
        details={"filename_extension": ext_hint or None},
    )


def validate_declared_extension_and_mime(
    filename: str | None,
    declared_mime_type: str | None,
) -> None:
    if filename:
        ext = Path(filename).suffix.lower()
        if ext and ext not in EXTENSION_TO_FORMAT:
            raise AudioValidationError(
                f"File extension '{ext}' is not supported. Supported formats: WAV, MP3, FLAC, M4A, AAC, OGG, WebM.",
                code="UNSUPPORTED_AUDIO_EXTENSION",
                details={"extension": ext},
            )

    if declared_mime_type:
        normalized_mime = declared_mime_type.split(";", 1)[0].strip().lower()
        allowed_mimes = {m for mimes in FORMAT_MIME_TYPES.values() for m in mimes}
        if normalized_mime and normalized_mime not in allowed_mimes:
            raise AudioValidationError(
                f"Declared MIME type '{normalized_mime}' is not an accepted audio MIME type.",
                code="UNSUPPORTED_AUDIO_MIME",
                details={"mime_type": normalized_mime},
            )


def validate_file_size(size_bytes: int, max_size_bytes: int) -> None:
    if size_bytes <= 0:
        raise AudioValidationError(
            "Audio file is empty (0 bytes).",
            code="EMPTY_AUDIO_FILE",
            details={"size_bytes": size_bytes},
        )
    if size_bytes > max_size_bytes:
        raise AudioValidationError(
            f"Audio file size ({size_bytes} bytes) exceeds maximum allowed limit ({max_size_bytes} bytes).",
            code="AUDIO_FILE_TOO_LARGE",
            details={"size_bytes": size_bytes, "max_size_bytes": max_size_bytes},
            status_code=413,
        )


def _probe_wav_stdlib(path: Path) -> tuple[int, int, int, str, int | None, int | None] | None:
    try:
        with wave.open(str(path), "rb") as wf:
            channels = wf.getnchannels()
            sample_rate = wf.getframerate()
            sampwidth = wf.getsampwidth()
            frames = wf.getnframes()
            if channels < 1 or sample_rate < 8000 or frames <= 0:
                return None
            duration_ms = max(1, int(round((frames / sample_rate) * 1000)))
            bit_depth = sampwidth * 8
            bit_rate = sample_rate * channels * bit_depth
            return duration_ms, sample_rate, channels, f"pcm_s{bit_depth}le", bit_rate, bit_depth
    except (wave.Error, EOFError, OSError):
        return None


async def probe_audio_stream(
    file_path: Path,
    detected_format: AudioFormat,
    sha256_checksum: str,
    size_bytes: int,
    max_duration_seconds: int,
    ffprobe_bin: str = "ffprobe",
) -> AudioMetadata:
    """
    Probes an audio file using FFprobe (with stdlib WAV validation fallback if FFprobe is absent)
    to verify readable audio frames, duration bounds, sample rate, and channel count.
    """
    resolved_ffprobe = shutil.which(ffprobe_bin) or (ffprobe_bin if Path(ffprobe_bin).exists() else None)

    duration_ms: int | None = None
    sample_rate_hz: int | None = None
    channels: int | None = None
    codec_name: str | None = None
    bit_rate_bps: int | None = None
    bit_depth: int | None = None

    if resolved_ffprobe:
        proc = await asyncio.to_thread(
            subprocess.run,
            [
                resolved_ffprobe,
                "-v",
                "error",
                "-show_format",
                "-show_streams",
                "-select_streams",
                "a:0",
                "-of",
                "json",
                str(file_path),
            ],
            capture_output=True,
            check=False,
        )
        if proc.returncode != 0:
            err_msg = proc.stderr.decode("utf-8", errors="replace").strip()
            raise AudioValidationError(
                "Audio file appears corrupted or unreadable by media probe.",
                code="CORRUPTED_AUDIO_FILE",
                details={"probe_error": err_msg[:300]},
            )

        try:
            probe_data = json.loads(proc.stdout.decode("utf-8"))
        except json.JSONDecodeError as exc:
            raise AudioValidationError(
                "Unable to parse audio stream metadata.",
                code="CORRUPTED_AUDIO_FILE",
            ) from exc

        streams = probe_data.get("streams") or []
        audio_streams = [s for s in streams if s.get("codec_type") == "audio"]
        if not audio_streams:
            raise AudioValidationError(
                "File does not contain a valid audio stream.",
                code="NO_AUDIO_STREAM",
            )

        stream = audio_streams[0]
        fmt = probe_data.get("format") or {}

        raw_duration = stream.get("duration") or fmt.get("duration")
        if raw_duration is not None:
            try:
                duration_sec = float(raw_duration)
                duration_ms = int(round(duration_sec * 1000))
            except (TypeError, ValueError):
                duration_ms = None

        try:
            sample_rate_hz = int(stream.get("sample_rate") or 0)
            channels = int(stream.get("channels") or 0)
        except (TypeError, ValueError) as exc:
            raise AudioValidationError(
                "Corrupted sample rate or channel metadata in audio stream.",
                code="CORRUPTED_AUDIO_FILE",
            ) from exc

        codec_name = str(stream.get("codec_name") or detected_format.value)
        raw_bit_rate = stream.get("bit_rate") or fmt.get("bit_rate")
        if raw_bit_rate is not None:
            try:
                bit_rate_bps = int(raw_bit_rate)
            except (TypeError, ValueError):
                bit_rate_bps = None

        raw_bps = stream.get("bits_per_sample") or stream.get("bits_per_raw_sample")
        if raw_bps is not None:
            try:
                parsed_bps = int(raw_bps)
                bit_depth = parsed_bps if parsed_bps > 0 else None
            except (TypeError, ValueError):
                bit_depth = None
    elif detected_format == AudioFormat.WAV:
        wav_info = _probe_wav_stdlib(file_path)
        if not wav_info:
            raise AudioValidationError(
                "WAV file header or sample frames are corrupted.",
                code="CORRUPTED_AUDIO_FILE",
            )
        duration_ms, sample_rate_hz, channels, codec_name, bit_rate_bps, bit_depth = wav_info
    else:
        raise AudioValidationError(
            "FFprobe is required to validate compressed audio formats and is unavailable on this host.",
            code="AUDIO_PROBE_UNAVAILABLE",
            status_code=503,
        )

    if not duration_ms or duration_ms <= 0 or not sample_rate_hz or sample_rate_hz < 8000 or not channels or channels < 1:
        raise AudioValidationError(
            "Audio stream has invalid duration, sample rate, or channel layout.",
            code="CORRUPTED_AUDIO_FILE",
            details={
                "duration_ms": duration_ms,
                "sample_rate_hz": sample_rate_hz,
                "channels": channels,
            },
        )

    max_duration_ms = max_duration_seconds * 1000
    if duration_ms > max_duration_ms:
        raise AudioValidationError(
            f"Audio duration ({duration_ms / 1000:.1f}s) exceeds maximum allowed limit ({max_duration_seconds}s).",
            code="AUDIO_DURATION_TOO_LONG",
            details={"duration_ms": duration_ms, "max_duration_seconds": max_duration_seconds},
        )

    primary_mime = FORMAT_MIME_TYPES[detected_format][0]
    return AudioMetadata(
        detected_format=detected_format,
        mime_type=primary_mime,
        size_bytes=size_bytes,
        sha256_checksum=sha256_checksum,
        duration_ms=duration_ms,
        sample_rate_hz=sample_rate_hz,
        channels=channels,
        codec_name=codec_name or detected_format.value,
        bit_rate_bps=bit_rate_bps,
        bit_depth=bit_depth,
        original_preserved=True,
    )
