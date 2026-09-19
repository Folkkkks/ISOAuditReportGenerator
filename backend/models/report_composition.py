from datetime import date

from pydantic import BaseModel, ConfigDict, Field
from typing import Literal


EvidenceSource = Literal["interview", "checklist", "document_review"]


class ReportEvidenceItem(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    source: EvidenceSource
    raw_text: str = Field(min_length=1, max_length=10000)


class ReportComposeRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    org_name: str = Field(min_length=1, max_length=200)
    audit_date: date
    standard: Literal["ISO/IEC 27001:2022"] = "ISO/IEC 27001:2022"
    report_language: Literal["en", "th"] = "en"
    evidence: list[ReportEvidenceItem] = Field(min_length=1, max_length=10)
    top_k: int = Field(default=3, ge=1, le=5)
