from typing import Literal

from pydantic import BaseModel

from backend.models.evidence_judgment import EvidenceJudgeResponse
from backend.models.schemas import AuditReport


class PipelineResponse(BaseModel):
    status: Literal["awaiting_auditor_review", "needs_revision"]
    report: AuditReport | None
    judgment: EvidenceJudgeResponse
    requires_auditor_review: Literal[True] = True