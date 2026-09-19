from typing import Literal

from pydantic import BaseModel, Field

from backend.models.evidence_judgment import EvidenceJudgeResponse
from backend.models.schemas import AuditObservation, AuditReport


class PipelineResponse(BaseModel):
    status: Literal["awaiting_auditor_review", "needs_revision"]
    observations: list[AuditObservation] = Field(default_factory=list)
    report: AuditReport | None
    judgment: EvidenceJudgeResponse
    requires_auditor_review: Literal[True] = True
