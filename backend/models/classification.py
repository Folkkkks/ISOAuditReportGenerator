from typing import Literal

from pydantic import BaseModel, Field


FindingClassification = Literal[
    "major_nc",
    "minor_nc",
    "observation",
    "ofi",
]


class ClassificationRequest(BaseModel):
    evidence: str = Field(min_length=1)
    top_k: int = Field(default=3, ge=1, le=5)
    report_language: Literal["en", "th"] = "en"


class ClassificationResult(BaseModel):
    classification: FindingClassification
    rationale: str = Field(min_length=1)
    confidence: float = Field(ge=0, le=1)
    needs_human_review: bool
