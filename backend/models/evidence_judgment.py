from typing import Literal

from pydantic import BaseModel, Field

from backend.models.report_composition import ReportEvidenceItem
from backend.models.schemas import AuditReport


JudgmentVerdict = Literal[
    "supported",
    "partially_supported",
    "unsupported",
]


class EvidenceJudgeRequest(BaseModel):
    report: AuditReport
    source_evidence: list[ReportEvidenceItem] = Field(min_length=1)


class FindingJudgment(BaseModel):
    finding_id: str = Field(min_length=1)
    verdict: JudgmentVerdict
    evidence_supported: bool
    reference_valid: bool
    rationale: str = Field(min_length=1)
    unsupported_claims: list[str] = Field(default_factory=list)
    needs_human_review: bool


class EvidenceJudgeResponse(BaseModel):
    report_grounded: bool
    judgments: list[FindingJudgment] = Field(min_length=1)
    summary: str = Field(min_length=1)