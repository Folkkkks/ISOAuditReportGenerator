"""Shared Gemini client configuration."""

import os

from google import genai
from google.genai import types


DEFAULT_TIMEOUT_SECONDS = 120


def create_gemini_client(api_key: str) -> genai.Client:
    """Create a Gemini client with a finite request timeout."""
    try:
        timeout_seconds = int(
            os.getenv(
                "GEMINI_TIMEOUT_SECONDS",
                str(DEFAULT_TIMEOUT_SECONDS),
            )
        )
    except ValueError as error:
        raise ValueError(
            "GEMINI_TIMEOUT_SECONDS must be an integer"
        ) from error

    if not 1 <= timeout_seconds <= 600:
        raise ValueError(
            "GEMINI_TIMEOUT_SECONDS must be between 1 and 600"
        )

    return genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(
            timeout=timeout_seconds * 1000,
            retry_options=types.HttpRetryOptions(attempts=1),
        ),
    )