from dataclasses import dataclass

from backend.agents.report_composer import (
    classify_observations,
    compose_report,
    map_observations,
    retrieve_contexts,
)
from backend.agents.evidence_judge import judge_report
from backend.agents.evidence_normalizer import normalize_evidence
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
    print("[1/5] Normalizing evidence...", flush=True)
    observations = normalize_evidence(request.evidence)
    contexts = retrieve_contexts(request, observations)
    print("[2/5] Classifying nonconformities...", flush=True)
    classifications = classify_observations(request, observations, contexts)
    print("[3/5] Mapping ISO clauses...", flush=True)
    mappings = map_observations(observations, contexts)
    print("[4/5] Composing the draft report...", flush=True)
    report = compose_report(
        request,
        observations=observations,
        classifications=classifications,
        mappings=mappings,
    )

    print("[5/5] Checking report with Evidence Judge...", flush=True)
    judgment = judge_report(
        EvidenceJudgeRequest(
            report=report,
            source_evidence=request.evidence,
            report_language=request.report_language,
        )
    )

    finding_ids = [finding.finding_id for finding in report.findings]
    judgment_ids = [item.finding_id for item in judgment.judgments]
    complete = (bool(finding_ids) and len(set(finding_ids)) == len(finding_ids)
                and sorted(finding_ids) == sorted(judgment_ids))
    passed = complete and judgment.report_grounded and all(
        item.verdict == "supported"
        and item.evidence_supported
        and item.reference_valid
        and not item.unsupported_claims
        for item in judgment.judgments
    )
    response = PipelineResponse(
        status="awaiting_auditor_review" if passed else "needs_revision",
        observations=observations,
        report=report if passed else None,
        judgment=judgment,
    )
    return PipelineExecution(draft_report=report, response=response)


def run_report_pipeline(request: ReportComposeRequest) -> PipelineResponse:
    """API entry point: only return the gated response, not internal details."""
    return execute_report_pipeline(request).response
