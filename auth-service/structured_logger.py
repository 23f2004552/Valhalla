"""
Structured JSON Logger for RMS Microservices.
Every log line is a valid JSON object with consistent fields.
Copy this file into each service directory.
"""

import json
import sys
import traceback
import datetime


class StructuredLogger:
    def __init__(self, service_name: str):
        self.service_name = service_name

    def _log(self, level: str, event: str, cid: str = "", **kwargs):
        entry = {
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "level": level,
            "service": self.service_name,
            "event": event,
        }
        if cid:
            entry["cid"] = cid
        entry.update(kwargs)
        # Write as single-line JSON to stdout
        sys.stdout.write(json.dumps(entry, default=str) + "\n")
        sys.stdout.flush()

    def info(self, event: str, cid: str = "", **kwargs):
        self._log("INFO", event, cid, **kwargs)

    def warn(self, event: str, cid: str = "", **kwargs):
        self._log("WARN", event, cid, **kwargs)

    def error(self, event: str, cid: str = "", exc: Exception = None, **kwargs):
        if exc:
            kwargs["error"] = str(exc)
            kwargs["stack_trace"] = traceback.format_exc()
        self._log("ERROR", event, cid, **kwargs)

    def debug(self, event: str, cid: str = "", **kwargs):
        self._log("DEBUG", event, cid, **kwargs)
