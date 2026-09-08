from backend.agents.report_composer import compose_report
from backend.agents.evidence_judge import judge_report
from backend.models.evidence_judgment import EvidenceJudgeRequest
from backend.models.pipeline import PipelineResponse
from backend.models.report_composition import ReportComposeRequest


def run_report_pipeline(
    request: ReportComposeRequest,
) -> PipelineResponse:
    print("[1/2] Classifying evidence and composing report...", flush=True)
    report = compose_report(request)

    print("[2/2] Checking report with Evidence Judge...", flush=True)
    judgment = judge_report(
        EvidenceJudgeRequest(
            report=report,
            source_evidence=request.evidence,
        )
    )

    passed = judgment.report_grounded and all(
        item.verdict == "supported"
        and item.evidence_supported
        and item.reference_valid
        and not item.unsupported_claims
        for item in judgment.judgments
    )

    return PipelineResponse(
        status=(
            "awaiting_auditor_review"
            if passed
            else "needs_revision"
        ),
        report=report if passed else None,
        judgment=judgment,
    )