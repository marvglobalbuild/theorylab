from __future__ import annotations

import asyncio
import json
import shutil
import subprocess
import wave
from pathlib import Path

from app.core.errors import AudioValidationError
from app.schemas.audio import AudioFormat, AudioMetadata, MediaCategory

FORMAT_MIME_TYPES: dict[AudioFormat, list[str]] = {
    # Audio
    AudioFormat.WAV: ["audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave"],
    AudioFormat.MP3: ["audio/mpeg", "audio/mp3"],
    AudioFormat.FLAC: ["audio/flac", "audio/x-flac"],
    AudioFormat.M4A: ["audio/mp4", "audio/x-m4a", "audio/m4a"],
    AudioFormat.AAC: ["audio/aac", "audio/aacp"],
    AudioFormat.OGG: ["audio/ogg", "application/ogg", "video/ogg"],
    AudioFormat.OPUS: ["audio/opus", "audio/ogg;codecs=opus", "audio/ogg"],
    AudioFormat.WEBM: ["audio/webm", "video/webm"],
    # Video (with audio)
    AudioFormat.MP4: ["video/mp4", "application/mp4"],
    AudioFormat.MOV: ["video/quicktime"],
    AudioFormat.MKV: ["video/x-matroska", "video/matroska", "audio/x-matroska"],
    AudioFormat.AVI: ["video/x-msvideo", "video/avi", "video/msvideo"],
    # MIDI
    AudioFormat.MID: ["audio/midi", "audio/x-midi", "application/x-midi", "audio/mid", "application/octet-stream"],
    AudioFormat.MIDI: ["audio/midi", "audio/x-midi", "application/x-midi", "application/octet-stream"],
}

EXTENSION_TO_FORMAT: dict[str, AudioFormat] = {
    # Audio
    ".wav": AudioFormat.WAV,
    ".wave": AudioFormat.WAV,
    ".mp3": AudioFormat.MP3,
    ".flac": AudioFormat.FLAC,
    ".m4a": AudioFormat.M4A,
    ".aac": AudioFormat.AAC,
    ".ogg": AudioFormat.OGG,
    ".oga": AudioFormat.OGG,
    ".opus": AudioFormat.OPUS,
    ".webm": AudioFormat.WEBM,
    # Video
    ".mp4": AudioFormat.MP4,
    ".mov": AudioFormat.MOV,
    ".mkv": AudioFormat.MKV,
    ".avi": AudioFormat.AVI,
    # MIDI
    ".mid": AudioFormat.MID,
    ".midi": AudioFormat.MIDI,
}

# Known ISO base media brands used by M4A audio containers
_M4A_AUDIO_BRANDS = {b"M4A ", b"M4B "}

# Known ISO base media brands used by MP4/MOV video containers
_MP4_VIDEO_BRANDS = {b"mp41", b"mp42", b"isom", b"iso2", b"dash", b"3gp4", b"avc1"}
_MOV_VIDEO_BRANDS = {b"qt  "}


def get_media_category(fmt: AudioFormat) -> MediaCategory:
    if fmt in {AudioFormat.MID, AudioFormat.MIDI}:
        return MediaCategory.MIDI
    if fmt in {AudioFormat.MP4, AudioFormat.MOV, AudioFormat.MKV, AudioFormat.AVI}:
        return MediaCategory.VIDEO
    return MediaCategory.AUDIO


def sniff_audio_format_from_bytes(header: bytes, filename: str | None = None) -> AudioFormat:
    """
    Inspects magic bytes at the start of a file to verify it is a genuine audio, video,
    or MIDI container and reject disguised non-media payloads (HTML, JSON, executables).
    """
    if len(header) < 4:
        raise AudioValidationError(
            "Media file is empty or truncated and cannot be decoded.",
            code="CORRUPTED_OR_EMPTY_AUDIO",
            details={"bytes_read": len(header)},
        )

    ext_hint = Path(filename).suffix.lower() if filename else ""

    # MIDI: MThd header chunk
    if header[:4] == b"MThd":
        return AudioFormat.MIDI if ext_hint == ".midi" else AudioFormat.MID

    # RIFF containers (WAV or AVI)
    if header[:4] == b"RIFF" and len(header) >= 12:
        riff_type = header[8:12]
        if riff_type == b"WAVE":
            return AudioFormat.WAV
        if riff_type == b"AVI ":
            return AudioFormat.AVI

    # FLAC: fLaC
    if header[:4] == b"fLaC":
        return AudioFormat.FLAC

    # OGG / OPUS: OggS
    if header[:4] == b"OggS":
        if b"OpusHead" in header or ext_hint == ".opus":
            return AudioFormat.OPUS
        return AudioFormat.OGG

    # WebM / Matroska: EBML header 0x1A 0x45 0xDF 0xA3
    if header[:4] == b"\x1a\x45\xdf\xa3":
        if ext_hint == ".mkv":
            return AudioFormat.MKV
        return AudioFormat.WEBM

    # MP4 / M4A / QuickTime MOV: [size:4] ftyp [brand:4]
    if len(header) >= 12 and header[4:8] == b"ftyp":
        brand = header[8:12]
        if brand in _M4A_AUDIO_BRANDS or ext_hint == ".m4a":
            return AudioFormat.M4A
        if brand in _MOV_VIDEO_BRANDS or ext_hint == ".mov":
            return AudioFormat.MOV
        return AudioFormat.MP4

    # QuickTime MOV with moov/wide atom before ftyp
    if len(header) >= 8 and (header[4:8] in {b"moov", b"wide", b"mdat"} or header[:4] in {b"moov", b"wide", b"mdat"}):
        if ext_hint == ".mov":
            return AudioFormat.MOV
        return AudioFormat.MP4

    # MP3 with ID3v2 header
    if header[:3] == b"ID3":
        return AudioFormat.MP3

    # Raw MPEG Audio frame sync (11 bits set: 0xFF and top 3 bits of byte 1 == 0xE0)
    if len(header) >= 2 and header[0] == 0xFF and (header[1] & 0xE0) == 0xE0:
        layer_bits = (header[1] >> 1) & 0x03
        if layer_bits == 0:
            return AudioFormat.AAC
        return AudioFormat.MP3

    # If magic bytes match known extension hint when valid
    if ext_hint in EXTENSION_TO_FORMAT:
        return EXTENSION_TO_FORMAT[ext_hint]

    raise AudioValidationError(
        "File header does not match any supported audio, video, or MIDI format "
        "(Audio: WAV, MP3, FLAC, M4A, AAC, OGG, OPUS, WebM; Video: MP4, MOV, MKV, AVI; MIDI: MID, MIDI).",
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
                f"File extension '{ext}' is not supported. Supported extensions: "
                ".wav, .mp3, .flac, .m4a, .aac, .ogg, .opus, .webm, .mp4, .mov, .mkv, .avi, .mid, .midi.",
                code="UNSUPPORTED_AUDIO_EXTENSION",
                details={"extension": ext},
            )

    if declared_mime_type:
        normalized_mime = declared_mime_type.split(";", 1)[0].strip().lower()
        allowed_mimes = {m for mimes in FORMAT_MIME_TYPES.values() for m in mimes}
        allowed_mimes.update({"application/octet-stream", "binary/octet-stream"})
        if normalized_mime and normalized_mime not in allowed_mimes:
            raise AudioValidationError(
                f"Declared MIME type '{normalized_mime}' is not an accepted audio, video, or MIDI MIME type.",
                code="UNSUPPORTED_AUDIO_MIME",
                details={"mime_type": normalized_mime},
            )


def validate_file_size(
    size_bytes: int,
    max_size_bytes: int,
    category: MediaCategory = MediaCategory.AUDIO,
) -> None:
    if size_bytes <= 0:
        raise AudioValidationError(
            f"{category.value.capitalize()} file is empty (0 bytes).",
            code="EMPTY_AUDIO_FILE",
            details={"size_bytes": size_bytes},
        )
    if size_bytes > max_size_bytes:
        max_mb = max_size_bytes // (1024 * 1024)
        raise AudioValidationError(
            f"{category.value.capitalize()} file size ({size_bytes / (1024 * 1024):.1f} MB) exceeds maximum allowed limit ({max_mb} MB).",
            code=f"{category.value.upper()}_FILE_TOO_LARGE",
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


def probe_midi_stream(
    file_path: Path,
    detected_format: AudioFormat,
    sha256_checksum: str,
    size_bytes: int,
    max_duration_seconds: int = 1800,
) -> AudioMetadata:
    """Validates and extracts metadata from a Standard MIDI File using mido."""
    import mido

    try:
        mid = mido.MidiFile(str(file_path))
    except Exception as exc:
        raise AudioValidationError(
            f"Invalid or corrupted MIDI file structure: {str(exc)[:200]}",
            code="INVALID_MIDI_STRUCTURE",
            details={"error": str(exc)[:200]},
        ) from exc

    if not mid.tracks:
        raise AudioValidationError(
            "MIDI file contains no tracks.",
            code="INVALID_MIDI_STRUCTURE",
        )

    total_notes = 0
    for trk in mid.tracks:
        for msg in trk:
            if msg.type == "note_on" and getattr(msg, "velocity", 0) > 0:
                total_notes += 1

    duration_ms = int(round(mid.length * 1000.0))
    if duration_ms <= 0 or total_notes == 0:
        raise AudioValidationError(
            "MIDI file contains no playable musical note events.",
            code="EMPTY_MIDI_FILE",
            details={"tracks": len(mid.tracks), "note_count": total_notes},
        )

    max_duration_ms = max_duration_seconds * 1000
    if duration_ms > max_duration_ms:
        raise AudioValidationError(
            f"MIDI musical duration ({duration_ms / 1000:.1f}s) exceeds maximum allowed limit ({max_duration_seconds}s).",
            code="MIDI_DURATION_TOO_LONG",
            details={"duration_ms": duration_ms, "max_duration_seconds": max_duration_seconds},
        )

    return AudioMetadata(
        detected_format=detected_format,
        mime_type="audio/midi",
        media_category=MediaCategory.MIDI,
        size_bytes=size_bytes,
        sha256_checksum=sha256_checksum,
        duration_ms=duration_ms,
        sample_rate_hz=44100,
        channels=2,
        codec_name="midi",
        midi_track_count=len(mid.tracks),
        midi_note_count=total_notes,
        original_preserved=True,
    )


async def probe_audio_stream(
    file_path: Path,
    detected_format: AudioFormat,
    sha256_checksum: str,
    size_bytes: int,
    max_duration_seconds: int,
    ffprobe_bin: str = "ffprobe",
) -> AudioMetadata:
    """
    Probes an audio, video, or MIDI file using FFprobe (or mido for MIDI)
    to verify readable audio frames/events, duration bounds, sample rate, and channel count.
    """
    if detected_format in {AudioFormat.MID, AudioFormat.MIDI}:
        return probe_midi_stream(
            file_path=file_path,
            detected_format=detected_format,
            sha256_checksum=sha256_checksum,
            size_bytes=size_bytes,
            max_duration_seconds=1800,
        )

    resolved_ffprobe = shutil.which(ffprobe_bin) or (ffprobe_bin if Path(ffprobe_bin).exists() else None)

    duration_ms: int | None = None
    sample_rate_hz: int | None = None
    channels: int | None = None
    codec_name: str | None = None
    bit_rate_bps: int | None = None
    bit_depth: int | None = None
    is_video = False

    if resolved_ffprobe:
        proc = await asyncio.to_thread(
            subprocess.run,
            [
                resolved_ffprobe,
                "-v",
                "error",
                "-show_format",
                "-show_streams",
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
                "Media file appears corrupted or unreadable by media probe.",
                code="CORRUPTED_AUDIO_FILE",
                details={"probe_error": err_msg[:300]},
            )

        try:
            probe_data = json.loads(proc.stdout.decode("utf-8"))
        except json.JSONDecodeError as exc:
            raise AudioValidationError(
                "Unable to parse media stream metadata.",
                code="CORRUPTED_AUDIO_FILE",
            ) from exc

        streams = probe_data.get("streams") or []
        audio_streams = [s for s in streams if s.get("codec_type") == "audio"]
        video_streams = [s for s in streams if s.get("codec_type") == "video"]

        is_video = (
            len(video_streams) > 0
            or detected_format in {AudioFormat.MP4, AudioFormat.MOV, AudioFormat.MKV, AudioFormat.AVI}
        )

        if not audio_streams:
            if is_video:
                raise AudioValidationError(
                    "Video file does not contain a usable audio stream. Please upload a video with an audio track.",
                    code="NO_AUDIO_STREAM",
                )
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
            "FFprobe is required to validate media formats and is unavailable on this host.",
            code="AUDIO_PROBE_UNAVAILABLE",
            status_code=503,
        )

    # Specific, granular error messages
    if duration_ms is None or duration_ms <= 0:
        raise AudioValidationError(
            "Audio stream has invalid or undetectable duration (0 ms or corrupted timestamps).",
            code="INVALID_AUDIO_DURATION",
            details={"duration_ms": duration_ms},
        )

    if sample_rate_hz is None or sample_rate_hz < 8000:
        raise AudioValidationError(
            f"Audio sample rate ({sample_rate_hz or 0} Hz) is too low for musical processing (minimum 8,000 Hz required).",
            code="INVALID_SAMPLE_RATE",
            details={"sample_rate_hz": sample_rate_hz},
        )

    if channels is None or channels < 1:
        raise AudioValidationError(
            "Audio stream contains no audio channels.",
            code="INVALID_CHANNEL_LAYOUT",
            details={"channels": channels},
        )

    max_duration_ms = max_duration_seconds * 1000
    if duration_ms > max_duration_ms:
        label = "Video" if is_video else "Audio"
        code = "VIDEO_DURATION_TOO_LONG" if is_video else "AUDIO_DURATION_TOO_LONG"
        raise AudioValidationError(
            f"{label} duration ({duration_ms / 1000:.1f}s) exceeds maximum allowed limit ({max_duration_seconds}s).",
            code=code,
            details={"duration_ms": duration_ms, "max_duration_seconds": max_duration_seconds},
        )

    primary_mime = FORMAT_MIME_TYPES[detected_format][0]
    category = MediaCategory.VIDEO if is_video else MediaCategory.AUDIO
    return AudioMetadata(
        detected_format=detected_format,
        mime_type=primary_mime,
        media_category=category,
        size_bytes=size_bytes,
        sha256_checksum=sha256_checksum,
        duration_ms=duration_ms,
        sample_rate_hz=sample_rate_hz,
        channels=channels,
        codec_name=codec_name or detected_format.value,
        bit_rate_bps=bit_rate_bps,
        bit_depth=bit_depth,
        original_preserved=True,
        video_extracted=is_video,
    )
