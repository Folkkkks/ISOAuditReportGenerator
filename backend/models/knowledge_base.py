from pydantic import BaseModel, Field


class KnowledgeDocument(BaseModel):
    document_id: str = Field(min_length=1)
    standard: str = "ISO/IEC 27001:2022"
    reference: str = Field(min_length=1)
    title: str = Field(min_length=1)
    summary: str = Field(min_length=1)
    keywords: list[str] = Field(default_factory=list)
    source_note: str = Field(min_length=1)


class KnowledgeBase(BaseModel):
    version: str = "0.1"
    documents: list[KnowledgeDocument]