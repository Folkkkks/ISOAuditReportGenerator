"""Translate known AI provider failures into safe HTTP responses."""

from collections.abc import Callable
from typing import TypeVar

from fastapi import HTTPException


ResultT = TypeVar("ResultT")


_PROVIDER_ERRORS = {
    "RateLimitError": (
        429,
        "AI service quota or rate limit reached. Please wait and try again.",
    ),
    "APITimeoutError": (
        504,
        "AI service request timed out. Please try again.",
    ),
    "InternalServerError": (
        503,
        "AI service is temporarily unavailable. Please try again later.",
    ),
    "CreateInteractionServerError": (
        503,
        "AI service is temporarily unavailable. Please try again later.",
    ),
}


def call_ai_safely(operation: Callable[[], ResultT]) -> ResultT:
    """Run an AI operation and hide provider-specific response details."""
    try:
        return operation()
    except Exception as error:
        response = _PROVIDER_ERRORS.get(type(error).__name__)
        if response is None:
            raise

        status_code, detail = response
        raise HTTPException(status_code=status_code, detail=detail) from error
