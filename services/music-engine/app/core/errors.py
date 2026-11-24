from __future__ import annotations

from typing import Any


class MusicEngineError(Exception):
    """Base structured exception for the SONORA Music Intelligence Engine."""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: dict[str, Any] | None = None,
        retryable: bool = False,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        self.retryable = retryable


class AuthenticationError(MusicEngineError):
    def __init__(
        self,
        message: str = "Authentication credentials are missing or invalid.",
        code: str = "UNAUTHORIZED",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(code=code, message=message, status_code=401, details=details, retryable=False)


class AccessDeniedError(MusicEngineError):
    def __init__(
        self,
        message: str = "You do not have permission to access this resource.",
        code: str = "FORBIDDEN",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(code=code, message=message, status_code=403, details=details, retryable=False)


class AccountStatusUnavailableError(MusicEngineError):
    """Raised when the account-status verification service is unreachable or returns an invalid response."""

    def __init__(
        self,
        message: str = "Unable to verify account status right now. Please try again shortly.",
        code: str = "ACCOUNT_STATUS_UNAVAILABLE",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(code=code, message=message, status_code=503, details=details, retryable=True)


class AuthProviderUnavailableError(MusicEngineError):
    """Raised when the authentication provider endpoint is unreachable or times out."""

    def __init__(
        self,
        message: str = "Unable to reach authentication service. Please try again shortly.",
        code: str = "AUTH_PROVIDER_UNREACHABLE",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(code=code, message=message, status_code=503, details=details, retryable=True)


class ResourceNotFoundError(MusicEngineError):
    def __init__(
        self,
        message: str = "Requested resource was not found.",
        code: str = "NOT_FOUND",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(code=code, message=message, status_code=404, details=details, retryable=False)


class ValidationError(MusicEngineError):
    def __init__(
        self,
        message: str,
        code: str = "VALIDATION_ERROR",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(code=code, message=message, status_code=422, details=details, retryable=False)


class AudioValidationError(MusicEngineError):
    def __init__(
        self,
        message: str,
        code: str = "INVALID_AUDIO_FILE",
        details: dict[str, Any] | None = None,
        status_code: int = 422,
    ) -> None:
        super().__init__(code=code, message=message, status_code=status_code, details=details, retryable=False)


class JobConflictError(MusicEngineError):
    def __init__(
        self,
        message: str,
        code: str = "JOB_CONFLICT",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(code=code, message=message, status_code=409, details=details, retryable=False)


class RateLimitOrQuotaError(MusicEngineError):
    def __init__(
        self,
        message: str,
        code: str = "CONCURRENT_JOB_LIMIT_EXCEEDED",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(code=code, message=message, status_code=429, details=details, retryable=True)


class ModelNotIntegratedError(MusicEngineError):
    """Raised honestly when a requested processing capability has no integrated AI/DSP model yet."""

    def __init__(
        self,
        job_type: str,
        interface_name: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        merged_details = {
            "job_type": job_type,
            "interface": interface_name,
            "implemented": False,
            **(details or {}),
        }
        super().__init__(
            code="MODEL_NOT_INTEGRATED",
            message=(
                f"Processing interface '{interface_name}' is ready for '{job_type}', "
                "but no production model backend is integrated yet."
            ),
            status_code=501,
            details=merged_details,
            retryable=False,
        )


class StorageIntegrationError(MusicEngineError):
    def __init__(
        self,
        message: str,
        code: str = "STORAGE_ERROR",
        status_code: int = 502,
        details: dict[str, Any] | None = None,
        retryable: bool = True,
    ) -> None:
        super().__init__(code=code, message=message, status_code=status_code, details=details, retryable=retryable)


class QueueIntegrationError(MusicEngineError):
    """Raised when the Valkey/Redis ARQ queue broker is unconfigured or unreachable."""

    def __init__(
        self,
        message: str,
        code: str = "QUEUE_UNAVAILABLE",
        status_code: int = 503,
        details: dict[str, Any] | None = None,
        retryable: bool = True,
    ) -> None:
        super().__init__(code=code, message=message, status_code=status_code, details=details, retryable=retryable)


class JobTimeoutError(MusicEngineError):
    """Raised when a music processing job exceeds its configured execution timeout."""

    def __init__(
        self,
        timeout_seconds: int,
        stage: str | None = None,
    ) -> None:
        details: dict[str, Any] = {"timeout_seconds": timeout_seconds}
        if stage:
            details["stage"] = stage
        super().__init__(
            code="JOB_TIMEOUT",
            message=f"Processing job exceeded execution timeout of {timeout_seconds} seconds.",
            status_code=504,
            details=details,
            retryable=True,
        )


class RetryableJobError(Exception):
    """Internal signal raised by ProcessingPipeline when a worker should defer and retry a job."""

    def __init__(
        self,
        cause: MusicEngineError,
        *,
        attempt: int,
        max_tries: int,
    ) -> None:
        super().__init__(cause.message)
        self.cause = cause
        self.attempt = attempt
        self.max_tries = max_tries


class InstrumentResourceError(MusicEngineError):
    """Raised when a requested instrument or SoundFont resource is unknown or unavailable."""

    def __init__(
        self,
        message: str,
        code: str = "INSTRUMENT_RESOURCE_ERROR",
        status_code: int = 422,
        details: dict[str, Any] | None = None,
        retryable: bool = False,
    ) -> None:
        super().__init__(
            code=code,
            message=message,
            status_code=status_code,
            details=details,
            retryable=retryable,
        )


class SynthesisError(MusicEngineError):
    """Raised when FluidSynth synthesis fails, times out, or produces invalid/silent audio."""

    def __init__(
        self,
        message: str,
        code: str = "SYNTHESIS_FAILED",
        status_code: int = 503,
        details: dict[str, Any] | None = None,
        retryable: bool = False,
    ) -> None:
        super().__init__(
            code=code,
            message=message,
            status_code=status_code,
            details=details,
            retryable=retryable,
        )


class MixingError(MusicEngineError):
    """Raised when non-destructive mixing, alignment, or loudness mastering fails."""

    def __init__(
        self,
        message: str,
        code: str = "MIXING_FAILED",
        status_code: int = 422,
        details: dict[str, Any] | None = None,
        retryable: bool = False,
    ) -> None:
        super().__init__(
            code=code,
            message=message,
            status_code=status_code,
            details=details,
            retryable=retryable,
        )


class AudioExportError(MusicEngineError):
    """Raised when FFmpeg/soundfile audio format export or FFprobe validation fails."""

    def __init__(
        self,
        message: str,
        code: str = "AUDIO_EXPORT_FAILED",
        status_code: int = 502,
        details: dict[str, Any] | None = None,
        retryable: bool = False,
    ) -> None:
        super().__init__(
            code=code,
            message=message,
            status_code=status_code,
            details=details,
            retryable=retryable,
        )

