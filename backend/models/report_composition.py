from datetime import date

from pydantic import BaseModel, Field


class ReportEvidenceItem(BaseModel):
    source: str = Field(min_length=1)
    raw_text: str = Field(min_length=1)


class ReportComposeRequest(BaseModel):
    org_name: str = Field(min_length=1)
    audit_date: date
    standard: str = "ISO/IEC 27001:2022"
    evidence: list[ReportEvidenceItem] = Field(min_length=1)
    top_k: int = Field(default=3, ge=1, le=5)