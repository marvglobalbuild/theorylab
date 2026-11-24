from __future__ import annotations

import shutil
from functools import lru_cache
from pathlib import Path
from typing import Literal
from urllib.parse import urlsplit

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Environment-driven settings for the SONORA Music Intelligence Engine."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    service_name: str = "sonora-music-engine"
    service_version: str = "0.1.0"
    music_engine_env: Literal["development", "staging", "production", "test"] = "development"
    music_engine_host: str = "0.0.0.0"
    music_engine_port: int = 8000
    music_engine_log_level: str = "INFO"
    music_engine_cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Media processing & resource limits (Audio: 100MB / 10m, Video: 250MB / 10m, MIDI: 20MB / 30m)
    music_engine_max_audio_file_size_bytes: int = Field(default=100 * 1024 * 1024, ge=1024)
    music_engine_max_video_file_size_bytes: int = Field(default=250 * 1024 * 1024, ge=1024)
    music_engine_max_midi_file_size_bytes: int = Field(default=20 * 1024 * 1024, ge=1024)
    music_engine_max_file_size_bytes: int = Field(default=250 * 1024 * 1024, ge=1024)
    music_engine_max_audio_duration_seconds: int = Field(default=600, ge=1)
    music_engine_max_video_duration_seconds: int = Field(default=600, ge=1)
    music_engine_max_midi_duration_seconds: int = Field(default=1800, ge=1)
    music_engine_max_duration_seconds: int = Field(default=600, ge=1)
    music_engine_max_concurrent_jobs_per_user: int = Field(default=3, ge=1, le=20)
    music_engine_temp_dir: str = "/tmp/sonora-music-engine"
    music_engine_local_storage_dir: str = "/tmp/sonora-local-storage"

    # Storage, persistence, and durable queue backends
    music_engine_storage_backend: Literal["local", "supabase"] = "local"
    music_engine_job_repository_backend: Literal["memory", "supabase"] = "memory"
    music_engine_queue_backend: Literal["in_process", "arq"] = "in_process"

    # ARQ + Valkey/Redis durable worker configuration
    music_engine_redis_url: str = ""
    music_engine_arq_queue_name: str = "sonora:music-jobs"
    music_engine_worker_max_jobs: int = Field(default=4, ge=1, le=64)
    music_engine_job_timeout_seconds: int = Field(default=600, ge=1, le=3600)
    music_engine_job_max_retries: int = Field(default=3, ge=1, le=10)
    music_engine_job_retry_backoff_seconds: int = Field(default=5, ge=1, le=300)
    music_engine_cancel_signal_ttl_seconds: int = Field(default=86400, ge=60, le=604800)
    music_engine_stale_workspace_max_age_seconds: int = Field(default=3600, ge=1)
    music_engine_stale_job_timeout_seconds: int = Field(default=900, ge=1)
    music_engine_stale_queued_job_timeout_seconds: int = Field(default=600, ge=1)

    # Optional explicit binaries & verified SoundFont synthesis resources
    ffmpeg_bin: str = Field(default_factory=lambda: shutil.which("ffmpeg") or "ffmpeg")
    ffprobe_bin: str = Field(default_factory=lambda: shutil.which("ffprobe") or "ffprobe")
    fluidsynth_bin: str = Field(default_factory=lambda: shutil.which("fluidsynth") or "fluidsynth")
    music_engine_soundfont_dir: str = "/usr/share/sounds/sf3"
    music_engine_soundfont_path: str = ""
    music_engine_fluidsynth_timeout_seconds: int = Field(default=180, ge=5, le=1200)
    music_engine_fluidsynth_gain: float = Field(default=0.7, ge=0.1, le=2.0)
    music_engine_synthesis_sample_rate_hz: int = Field(default=44100, ge=22050, le=96000)

    # Run 3 mixing, loudness normalization, true-peak protection & format export defaults
    music_engine_master_target_lufs: float = Field(default=-14.0, ge=-30.0, le=-6.0)
    music_engine_master_true_peak_ceiling_dbtp: float = Field(default=-1.0, ge=-6.0, le=-0.1)
    music_engine_master_max_limiting_db: float = Field(default=3.5, ge=0.0, le=12.0)
    music_engine_default_vocal_gain_db: float = Field(default=0.0, ge=-24.0, le=18.0)
    music_engine_default_accompaniment_gain_db: float = Field(default=-4.5, ge=-36.0, le=12.0)
    music_engine_export_wav_bit_depth: Literal[16, 24] = 16
    music_engine_export_mp3_bitrate_kbps: int = Field(default=320, ge=128, le=320)
    music_engine_export_timeout_seconds: int = Field(default=120, ge=5, le=600)

    # Supabase integration (server-side only)
    supabase_url: str = ""
    supabase_publishable_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""
    supabase_jwt_verification_mode: Literal["auto", "remote", "hs256"] = "auto"
    supabase_jwt_audience: str = "authenticated"
    supabase_audio_bucket: str = "sonora-audio"
    supabase_jobs_table: str = "processing_jobs"
    supabase_assets_table: str = "audio_assets"

    @field_validator("music_engine_log_level")
    @classmethod
    def normalize_log_level(cls, value: str) -> str:
        normalized = value.strip().upper()
        if normalized not in {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}:
            return "INFO"
        return normalized

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.music_engine_cors_origins.split(",") if origin.strip()]

    @property
    def supabase_auth_configured(self) -> bool:
        return bool(
            self.supabase_jwt_secret.strip()
            or (
                self.supabase_url.strip()
                and (self.supabase_publishable_key.strip() or self.supabase_service_role_key.strip())
            )
        )

    @property
    def supabase_storage_configured(self) -> bool:
        return bool(self.supabase_url.strip() and self.supabase_service_role_key.strip())

    @property
    def supabase_db_configured(self) -> bool:
        return bool(self.supabase_url.strip() and self.supabase_service_role_key.strip())

    @property
    def arq_queue_configured(self) -> bool:
        return bool(self.music_engine_redis_url.strip())

    @property
    def redacted_redis_target(self) -> str:
        """Returns a safe host/port/db description without leaking credentials in logs."""
        raw = self.music_engine_redis_url.strip()
        if not raw:
            return "unconfigured"
        parsed = urlsplit(raw)
        scheme = parsed.scheme or "redis"
        host = parsed.hostname or "unknown-host"
        port = f":{parsed.port}" if parsed.port else ""
        path = parsed.path or ""
        return f"{scheme}://{host}{port}{path}"

    @property
    def temp_path(self) -> Path:
        return Path(self.music_engine_temp_dir)

    @property
    def local_storage_path(self) -> Path:
        return Path(self.music_engine_local_storage_dir)


@lru_cache
def get_settings() -> Settings:
    return Settings()
