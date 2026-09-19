"""Single-process pacing; not a shared quota manager or daily-quota workaround."""
import os
import threading
import time

_lock = threading.Lock()
_last = 0.0


def wait_for_slot():
    global _last
    interval = float(os.getenv("GEMINI_MIN_INTERVAL_SECONDS", "15"))
    if not 0 <= interval <= 60:
        raise ValueError("GEMINI_MIN_INTERVAL_SECONDS must be between 0 and 60")
    with _lock:
        delay = interval - (time.monotonic() - _last)
        if delay > 0:
            time.sleep(delay)
        _last = time.monotonic()
