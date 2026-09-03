from pydantic import BaseModel, Field

from backend.models.knowledge_base import KnowledgeDocument


class RetrievalRequest(BaseModel):
    query: str = Field(min_length=1)
    top_k: int = Field(default=3, ge=1, le=10)


class RetrievalResult(BaseModel):
    document: KnowledgeDocument
    score: float = Field(gt=0)
    matched_terms: list[str] = Field(default_factory=list)