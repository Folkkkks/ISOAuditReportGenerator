import json
import os

from dotenv import load_dotenv
from google import genai

from backend.models.evidence_judgment import (
    EvidenceJudgeRequest,
    EvidenceJudgeResponse,
)
from backend.services.retrieval import retrieve_documents


load_dotenv()

DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")


def _build_deterministic_checks(
    request: EvidenceJudgeRequest,
) -> list[dict]:
    source_texts = {
        item.raw_text
        for item in request.source_evidence
    }

    checks = []

    for finding in request.report.findings:
        evidence_supported = all(
            evidence in source_texts
            for evidence in finding.objective_evidence
        )

        retrieved = retrieve_documents(
            query=(
                f"{finding.clause_ref} "
                f"{finding.requirement_text_id} "
                f"{finding.finding_statement}"
            ),
            top_k=5,
        )

        reference_valid = any(
            result.document.reference == finding.clause_ref
            and result.document.document_id
            == finding.requirement_text_id
            for result in retrieved
        )

        checks.append(
            {
                "finding_id": finding.finding_id,
                "evidence_supported": evidence_supported,
                "reference_valid": reference_valid,
            }
        )

    return checks


def build_evidence_judge_prompt(
    request: EvidenceJudgeRequest,
    deterministic_checks: list[dict],
) -> str:
    report_data = request.report.model_dump(mode="json")
    source_data = [
        item.model_dump(mode="json")
        for item in request.source_evidence
    ]

    return f"""
You are the Evidence Judge for an ISO/IEC 27001:2022
audit-report drafting system.

Review every finding and decide whether it is:
- supported: fully supported by the supplied source evidence
- partially_supported: some claims are supported but others are not
- unsupported: the finding lacks adequate source evidence

Rules:
1. Use only the report, source evidence, and deterministic checks supplied.
2. Return exactly one judgment for every finding.
3. Copy each finding_id exactly.
4. Copy evidence_supported and reference_valid exactly from the
   deterministic checks.
5. Do not treat a clearly proposed corrective action as an unsupported fact.
6. List factual claims not supported by the source evidence in
   unsupported_claims.
7. Set needs_human_review to true for partial or unsupported findings,
   ambiguity, or insufficient evidence.
8. Set report_grounded to true only when every finding is supported,
   evidence_supported is true, and reference_valid is true.
9. Do not invent evidence, requirements, or audit conclusions.

AUDIT REPORT:
{json.dumps(report_data, indent=2)}

SOURCE EVIDENCE:
{json.dumps(source_data, indent=2)}

DETERMINISTIC CHECKS:
{json.dumps(deterministic_checks, indent=2)}
""".strip()


def _validate_judgment(
    request: EvidenceJudgeRequest,
    result: EvidenceJudgeResponse,
    deterministic_checks: list[dict],
) -> None:
    expected_ids = [
        finding.finding_id
        for finding in request.report.findings
    ]
    returned_ids = [
        judgment.finding_id
        for judgment in result.judgments
    ]

    if returned_ids != expected_ids:
        raise ValueError(
            "Evidence Judge returned unexpected finding IDs"
        )

    checks_by_id = {
        check["finding_id"]: check
        for check in deterministic_checks
    }

    for judgment in result.judgments:
        expected = checks_by_id[judgment.finding_id]

        if (
            judgment.evidence_supported
            != expected["evidence_supported"]
        ):
            raise ValueError(
                "Evidence Judge changed the evidence-support check"
            )

        if judgment.reference_valid != expected["reference_valid"]:
            raise ValueError(
                "Evidence Judge changed the reference-validity check"
            )

    expected_grounded = all(
        judgment.verdict == "supported"
        and judgment.evidence_supported
        and judgment.reference_valid
        for judgment in result.judgments
    )

    if result.report_grounded != expected_grounded:
        raise ValueError(
            "Evidence Judge returned an inconsistent report status"
        )


def judge_report(
    request: EvidenceJudgeRequest,
    model_name: str = DEFAULT_MODEL,
) -> EvidenceJudgeResponse:
    if not request.report.findings:
        raise ValueError(
            "report must contain at least one finding"
        )

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GOOGLE_API_KEY is not configured"
        )

    deterministic_checks = _build_deterministic_checks(request)

    client = genai.Client(api_key=api_key)
    interaction = client.interactions.create(
        model=model_name,
        input=build_evidence_judge_prompt(
            request,
            deterministic_checks,
        ),
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": EvidenceJudgeResponse.model_json_schema(),
        },
    )

    if not interaction.output_text:
        raise RuntimeError(
            "Gemini returned an empty Evidence Judge response"
        )

    result = EvidenceJudgeResponse.model_validate_json(
        interaction.output_text
    )

    _validate_judgment(
        request,
        result,
        deterministic_checks,
    )

    return result