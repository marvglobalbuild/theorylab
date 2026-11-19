from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any

import numpy as np
import soundfile as sf
from pydantic import BaseModel

from app.core.config import Settings
from app.core.errors import SynthesisError
from app.core.logging import get_logger
from app.processing.instruments import InstrumentResourceManager
from app.processing.interfaces import (
    InstrumentPlaybackInterface,
    InstrumentPlaybackRequest,
    InstrumentPlaybackResult,
)

logger = get_logger("synthesis")


class SynthesisDiagnostics(BaseModel):
    engine: str = "fluidsynth"
    executable: str
    soundfont_path: str
    soundfont_name: str
    sample_rate_hz: int
    channels: int
    duration_ms: int
    peak_amplitude: float
    rms_amplitude: float
    size_bytes: int


class FluidSynthRenderer(InstrumentPlaybackInterface):
    """
    Production MIDI-to-WAV renderer backed by FluidSynth CLI + verified SoundFonts.

    Security & reliability guarantees:
      - Invokes FluidSynth strictly via `asyncio.create_subprocess_exec` argument arrays
        (never shell interpolation).
      - Enforces timeout and cooperative cancellation with clean subprocess termination
        and removal of partial output files.
      - Validates rendered WAV sample rate, stereo channels (2), and non-silent audio.
      - Never substitutes Tone.js oscillators or synthetic waveforms if FluidSynth or
        a SoundFont library is missing.
    """

    MIN_PEAK_AMPLITUDE = 1e-4
    MIN_RMS_AMPLITUDE = 1e-5

    def __init__(
        self,
        settings: Settings,
        instrument_manager: InstrumentResourceManager,
    ) -> None:
        self._settings = settings
        self._instruments = instrument_manager

    async def render_instruments(
        self,
        request: InstrumentPlaybackRequest,
        output_path: Path,
    ) -> InstrumentPlaybackResult:
        # Validate every requested patch instrument against GM catalog
        for patch in request.patches:
            self._instruments.resolve_instrument(patch.instrument_id)

        requested_sf: str | None = None
        for patch in request.patches:
            ref = patch.soundfont_or_sfz_ref.strip()
            if ref.endswith((".sf2", ".sf3")) and Path(ref).is_file():
                requested_sf = ref
                break

        diag = await self.render_midi_to_wav(
            midi_path=Path(request.midi_path),
            output_wav_path=output_path,
            sample_rate_hz=request.sample_rate_hz,
            soundfont_override=requested_sf,
        )
        return InstrumentPlaybackResult(
            rendered_audio_path=str(output_path),
            sample_rate_hz=diag.sample_rate_hz,
            duration_ms=diag.duration_ms,
            patches_used=request.patches,
        )

    async def render_midi_to_wav(
        self,
        *,
        midi_path: Path,
        output_wav_path: Path,
        sample_rate_hz: int | None = None,
        gain: float | None = None,
        timeout_seconds: int | None = None,
        soundfont_override: str | None = None,
    ) -> SynthesisDiagnostics:
        if not midi_path.is_file():
            raise SynthesisError(
                f"Input MIDI file '{midi_path.name}' does not exist for FluidSynth rendering.",
                code="MIDI_INPUT_MISSING",
                status_code=422,
                retryable=False,
            )

        exe = self._instruments.resolve_fluidsynth_executable()
        if exe is None:
            raise SynthesisError(
                "FluidSynth executable is not installed or not executable at configured FLUIDSYNTH_BIN.",
                code="FLUIDSYNTH_NOT_AVAILABLE",
                status_code=503,
                details={"configured_bin": self._settings.fluidsynth_bin},
                retryable=False,
            )

        sf_status = self._instruments.resolve_sound_library(requested_path=soundfont_override)
        if not sf_status.available or not sf_status.soundfont_path:
            raise SynthesisError(
                sf_status.missing_reason or "No verified SoundFont library is available for synthesis.",
                code="SOUNDFONT_NOT_FOUND",
                status_code=503,
                details={
                    "install_instructions": sf_status.install_instructions,
                    "soundfont_dir": self._settings.music_engine_soundfont_dir,
                },
                retryable=False,
            )

        target_sr = int(sample_rate_hz or self._settings.music_engine_synthesis_sample_rate_hz)
        target_gain = float(gain if gain is not None else self._settings.music_engine_fluidsynth_gain)
        eff_timeout = int(timeout_seconds or self._settings.music_engine_fluidsynth_timeout_seconds)

        output_wav_path.parent.mkdir(parents=True, exist_ok=True)

        # Safe subprocess argument array (no shell interpolation)
        cmd = [
            exe,
            "-n",
            "-i",
            "-T",
            "wav",
            "-O",
            "s16",
            "-F",
            str(output_wav_path),
            "-r",
            str(target_sr),
            "-g",
            f"{target_gain:.2f}",
            sf_status.soundfont_path,
            str(midi_path),
        ]

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        try:
            stdout_bytes, stderr_bytes = await asyncio.wait_for(
                proc.communicate(),
                timeout=eff_timeout,
            )
        except asyncio.TimeoutError as exc:
            await self._terminate_process(proc)
            self._remove_partial_output(output_wav_path)
            raise SynthesisError(
                f"FluidSynth rendering exceeded timeout of {eff_timeout} seconds.",
                code="SYNTHESIS_TIMEOUT",
                status_code=504,
                details={"timeout_seconds": eff_timeout, "midi_file": midi_path.name},
                retryable=True,
            ) from exc
        except asyncio.CancelledError:
            await self._terminate_process(proc)
            self._remove_partial_output(output_wav_path)
            raise

        if proc.returncode != 0:
            self._remove_partial_output(output_wav_path)
            stderr_tail = (stderr_bytes or b"").decode("utf-8", errors="replace")[-500:]
            raise SynthesisError(
                f"FluidSynth exited with non-zero status {proc.returncode}.",
                code="SYNTHESIS_FAILED",
                status_code=502,
                details={"returncode": proc.returncode, "stderr_excerpt": stderr_tail},
                retryable=False,
            )

        # Validate rendered WAV format, stereo channels, sample rate, and non-silent audio
        return await asyncio.to_thread(
            self._validate_rendered_wav,
            output_wav_path,
            target_sr,
            exe,
            sf_status.soundfont_path,
            sf_status.soundfont_name or Path(sf_status.soundfont_path).name,
        )

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
    def _remove_partial_output(path: Path) -> None:
        try:
            if path.exists():
                path.unlink()
        except OSError:
            pass

    def _validate_rendered_wav(
        self,
        wav_path: Path,
        expected_sr: int,
        executable: str,
        soundfont_path: str,
        soundfont_name: str,
    ) -> SynthesisDiagnostics:
        if not wav_path.is_file() or wav_path.stat().st_size < 44:
            self._remove_partial_output(wav_path)
            raise SynthesisError(
                "FluidSynth did not produce a valid WAV output file.",
                code="SYNTHESIS_EMPTY_OUTPUT",
                status_code=502,
                retryable=False,
            )

        try:
            info = sf.info(str(wav_path))
            samples, sr = sf.read(str(wav_path), dtype="float32", always_2d=True)
        except Exception as exc:
            self._remove_partial_output(wav_path)
            raise SynthesisError(
                f"Rendered WAV could not be decoded by soundfile ({type(exc).__name__}).",
                code="SYNTHESIS_INVALID_WAV",
                status_code=502,
                retryable=False,
            ) from exc

        if int(sr) != expected_sr:
            raise SynthesisError(
                f"Rendered WAV sample rate {sr} Hz did not match requested {expected_sr} Hz.",
                code="SYNTHESIS_SAMPLE_RATE_MISMATCH",
                status_code=502,
                retryable=False,
            )
        if int(info.channels) != 2:
            raise SynthesisError(
                f"Rendered WAV must be stereo (2 channels), got {info.channels}.",
                code="SYNTHESIS_CHANNEL_MISMATCH",
                status_code=502,
                retryable=False,
            )
        if samples.size == 0 or info.frames <= 0:
            raise SynthesisError(
                "Rendered WAV contains zero audio frames.",
                code="SYNTHESIS_SILENT_OUTPUT",
                status_code=502,
                retryable=False,
            )

        peak = float(np.max(np.abs(samples)))
        rms = float(np.sqrt(np.mean(np.square(samples, dtype=np.float64))))
        if peak < self.MIN_PEAK_AMPLITUDE or rms < self.MIN_RMS_AMPLITUDE:
            raise SynthesisError(
                "FluidSynth rendered silent audio (no audible instrument signal detected).",
                code="SYNTHESIS_SILENT_OUTPUT",
                status_code=502,
                details={"peak_amplitude": peak, "rms_amplitude": rms},
                retryable=False,
            )

        duration_ms = max(1, int(round((float(info.frames) / float(sr)) * 1000.0)))
        return SynthesisDiagnostics(
            executable=executable,
            soundfont_path=soundfont_path,
            soundfont_name=soundfont_name,
            sample_rate_hz=int(sr),
            channels=int(info.channels),
            duration_ms=duration_ms,
            peak_amplitude=round(peak, 5),
            rms_amplitude=round(rms, 5),
            size_bytes=wav_path.stat().st_size,
        )
