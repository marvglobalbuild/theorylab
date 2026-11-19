from __future__ import annotations

import asyncio
import shutil
import subprocess
import wave
from pathlib import Path

from app.audio.validation import probe_audio_stream
from app.core.config import Settings
from app.core.errors import AudioValidationError
from app.processing.interfaces import AudioDecodingInterface, DecodedAudio, IngestedAudio
from app.schemas.audio import AudioFormat, TrimWindow


class FFmpegAudioDecoder(AudioDecodingInterface):
    """
    Decodes supported audio formats into canonical uncompressed 16-bit PCM WAV
    for high-resolution downstream analysis, separation, or alignment, applying
    optional TrimWindow non-destructively without touching the original recording.
    """

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    async def decode(
        self,
        ingested: IngestedAudio,
        workspace_dir: Path,
        trim_window: TrimWindow | None = None,
        target_sample_rate_hz: int = 44100,
    ) -> DecodedAudio:
        source_path = Path(ingested.preserved_working_copy_path)
        if not source_path.is_file():
            raise AudioValidationError(
                "Staged working audio copy is missing prior to decoding.",
                code="MISSING_WORKING_AUDIO",
                status_code=500,
            )

        if trim_window and trim_window.start_ms >= ingested.metadata.duration_ms:
            raise AudioValidationError(
                "trim_window.start_ms exceeds total audio duration.",
                code="INVALID_TRIM_WINDOW",
                details={
                    "start_ms": trim_window.start_ms,
                    "duration_ms": ingested.metadata.duration_ms,
                },
            )

        output_wav = workspace_dir / "decoded_canonical.wav"
        ffmpeg_path = shutil.which(self._settings.ffmpeg_bin) or (
            self._settings.ffmpeg_bin if Path(self._settings.ffmpeg_bin).exists() else None
        )

        if ffmpeg_path:
            cmd = [
                ffmpeg_path,
                "-y",
                "-v",
                "error",
            ]
            if trim_window is not None:
                cmd.extend(["-ss", f"{trim_window.start_ms / 1000.0:.3f}"])
                if trim_window.end_ms is not None:
                    cmd.extend(["-to", f"{trim_window.end_ms / 1000.0:.3f}"])
            cmd.extend(
                [
                    "-i",
                    str(source_path),
                    "-vn",
                    "-acodec",
                    "pcm_s16le",
                    "-ar",
                    str(target_sample_rate_hz),
                    str(output_wav),
                ]
            )
            proc = await asyncio.to_thread(
                subprocess.run,
                cmd,
                capture_output=True,
                check=False,
            )
            if proc.returncode != 0:
                err_msg = proc.stderr.decode("utf-8", errors="replace").strip()
                raise AudioValidationError(
                    "FFmpeg failed to decode audio stream; the file may be corrupted or truncated.",
                    code="AUDIO_DECODE_FAILED",
                    details={"ffmpeg_error": err_msg[:300]},
                )
        elif ingested.metadata.detected_format == AudioFormat.WAV and trim_window is None:
            shutil.copyfile(source_path, output_wav)
        else:
            raise AudioValidationError(
                "FFmpeg binary is required to decode or trim this audio file.",
                code="DECODER_UNAVAILABLE",
                status_code=503,
            )

        if not output_wav.is_file() or output_wav.stat().st_size <= 44:
            raise AudioValidationError(
                "Decoded audio output is empty.",
                code="EMPTY_DECODED_AUDIO",
            )

        # Verify decoded canonical WAV stream integrity
        try:
            with wave.open(str(output_wav), "rb") as wf:
                channels = wf.getnchannels()
                sample_rate = wf.getframerate()
                frames = wf.getnframes()
                duration_ms = max(1, int(round((frames / sample_rate) * 1000)))
        except (wave.Error, OSError, ZeroDivisionError) as exc:
            # Fallback to ffprobe if wave header uses extensible format
            probed = await probe_audio_stream(
                file_path=output_wav,
                detected_format=AudioFormat.WAV,
                sha256_checksum=ingested.metadata.sha256_checksum,
                size_bytes=output_wav.stat().st_size,
                max_duration_seconds=self._settings.music_engine_max_duration_seconds,
                ffprobe_bin=self._settings.ffprobe_bin,
            )
            channels = probed.channels
            sample_rate = probed.sample_rate_hz
            duration_ms = probed.duration_ms

        return DecodedAudio(
            working_wav_path=str(output_wav),
            sample_rate_hz=sample_rate,
            channels=channels,
            duration_ms=duration_ms,
            sample_format="s16",
            trim_applied=trim_window,
            source_metadata=ingested.metadata,
        )
