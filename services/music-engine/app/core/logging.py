from __future__ import annotations

import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any


class StructuredJsonFormatter(logging.Formatter):
    """Formats log records as single-line JSON without leaking secrets."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for field in (
            "request_id",
            "correlation_id",
            "job_id",
            "user_id",
            "job_type",
            "status",
            "error_code",
            "attempt",
            "max_tries",
            "worker_id",
            "queue_backend",
        ):
            value = getattr(record, field, None)
            if value is not None:
                payload[field] = value
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


class DynamicStdoutHandler(logging.StreamHandler):
    """Writes to the current sys.stdout and safely ignores closed test-capture streams."""

    def __init__(self) -> None:
        super().__init__()

    @property
    def stream(self):
        return sys.stdout

    @stream.setter
    def stream(self, value) -> None:
        pass

    def emit(self, record: logging.LogRecord) -> None:
        current = sys.stdout
        if current is None or getattr(current, "closed", False):
            return
        try:
            super().emit(record)
        except ValueError:
            pass


def configure_logging(level: str = "INFO") -> None:
    root_logger = logging.getLogger("sonora_music_engine")
    root_logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    root_logger.handlers.clear()

    handler = DynamicStdoutHandler()
    handler.setFormatter(StructuredJsonFormatter())
    root_logger.addHandler(handler)
    root_logger.propagate = False


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(f"sonora_music_engine.{name}")
