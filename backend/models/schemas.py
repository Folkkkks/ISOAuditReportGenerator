from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


class AuditObservation(BaseModel):
    obs_id: str
    source: Literal["interview", "checklist", "document_review"]
    raw_text: str
    normalized_statement: str


class AuditFinding(BaseModel):
    finding_id: str
    clause_ref: str
    classification: Literal["major_nc", "minor_nc", "observation", "ofi"]
    finding_statement: str
    objective_evidence: list[str]
    objective_evidence_th: list[str] = Field(default_factory=list)
    requirement_text_id: str
    suggested_corrective_action: str | None


class AuditReport(BaseModel):
    org_name: str
    audit_date: date
    standard: str
    executive_summary: str
    findings: list[AuditFinding]
    open_questions: list[str]
    disclaimer: str
