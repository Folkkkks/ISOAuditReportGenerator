from dataclasses import dataclass

from backend.agents.report_composer import compose_report
from backend.agents.evidence_judge import judge_report
from backend.models.evidence_judgment import EvidenceJudgeRequest
from backend.models.pipeline import PipelineResponse
from backend.models.report_composition import ReportComposeRequest
from backend.models.schemas import AuditReport


@dataclass(frozen=True)
class PipelineExecution:
    """Internal evaluation detail. Never use this as an API response model."""

    draft_report: AuditReport
    response: PipelineResponse


def execute_report_pipeline(request: ReportComposeRequest) -> PipelineExecution:
    """Run composition and judging, preserving the draft for offline evaluation."""
    print("[1/2] Classifying evidence and composing report...", flush=True)
    report = compose_report(request)

    print("[2/2] Checking report with Evidence Judge...", flush=True)
    judgment = judge_report(
        EvidenceJudgeRequest(report=report, source_evidence=request.evidence)
    )

    passed = judgment.report_grounded and all(
        item.verdict == "supported"
        and item.evidence_supported
        and item.reference_valid
        and not item.unsupported_claims
        for item in judgment.judgments
    )
    response = PipelineResponse(
        status="awaiting_auditor_review" if passed else "needs_revision",
        report=report if passed else None,
        judgment=judgment,
    )
    return PipelineExecution(draft_report=report, response=response)


def run_report_pipeline(request: ReportComposeRequest) -> PipelineResponse:
    """API entry point: only return the gated response, not internal details."""
    return execute_report_pipeline(request).response
