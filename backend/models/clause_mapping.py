"""Structured result produced by the dedicated Clause Mapper."""

from pydantic import BaseModel, Field


class ClauseMappingResult(BaseModel):
    clause_ref: str = Field(min_length=1)
    requirement_text_id: str = Field(min_length=1)
    requirement_title: str = Field(min_length=1)
    rationale: str = Field(min_length=1)
    retrieval_score: float = Field(ge=0)
