import json
import os

from dotenv import load_dotenv
from google import genai

from backend.agents.nc_classifier import classify_evidence
from backend.models.classification import ClassificationResult
from backend.models.report_composition import ReportComposeRequest
from backend.models.schemas import AuditReport


load_dotenv()

DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
DISCLAIMER = "Draft report for auditor review and sign-off only."


def _classify_items(
    request: ReportComposeRequest,
) -> list[ClassificationResult]:
    return [
        classify_evidence(
            evidence=item.raw_text,
            top_k=request.top_k,
        )
        for item in request.evidence
    ]


def build_report_prompt(
    request: ReportComposeRequest,
    classifications: list[ClassificationResult],
) -> str:
    evidence_context = [
        {
            "source": evidence.source,
            "raw_text": evidence.raw_text,
            "classification": classification.model_dump(),
        }
        for evidence, classification in zip(
            request.evidence,
            classifications,
            strict=True,
        )
    ]

    return f"""
You are the Report Composer specialist for an ISO audit-report drafting
system. Produce one structured draft AuditReport for human review.

Rules:
1. Preserve the organization name, audit date, and standard exactly.
2. Create one finding for each supplied evidence item, in the same order.
3. Use finding IDs F-001, F-002, and so on.
4. Copy clause_ref, classification, finding_statement, and
   requirement_text_id exactly from each classifier result.
5. objective_evidence must contain only the corresponding raw_text.
6. Suggested corrective actions must be concise proposals, not claims
   or official certification decisions.
7. Add open questions when a classifier says human review is needed.
8. Do not invent evidence, controls, dates, or audit conclusions.
9. Use this exact disclaimer: {DISCLAIMER}

ORGANIZATION: {request.org_name}
AUDIT DATE: {request.audit_date.isoformat()}
STANDARD: {request.standard}

EVIDENCE AND CLASSIFIER RESULTS:
{json.dumps(evidence_context, indent=2)}
""".strip()


def _validate_report_grounding(
    report: AuditReport,
    request: ReportComposeRequest,
    classifications: list[ClassificationResult],
) -> None:
    if report.org_name != request.org_name:
        raise ValueError("report changed the organization name")
    if report.audit_date != request.audit_date:
        raise ValueError("report changed the audit date")
    if report.standard != request.standard:
        raise ValueError("report changed the audit standard")
    if len(report.findings) != len(classifications):
        raise ValueError(
            "report finding count does not match evidence count"
        )
    if report.disclaimer != DISCLAIMER:
        raise ValueError("report changed the required disclaimer")

    for index, (finding, evidence, classification) in enumerate(
        zip(
            report.findings,
            request.evidence,
            classifications,
            strict=True,
        ),
        start=1,
    ):
        expected_id = f"F-{index:03d}"

        if finding.finding_id != expected_id:
            raise ValueError(
                "report returned an invalid finding ID"
            )
        if finding.clause_ref != classification.clause_ref:
            raise ValueError(
                "report changed a grounded clause reference"
            )
        if finding.classification != classification.classification:
            raise ValueError(
                "report changed a finding classification"
            )
        if (
            finding.requirement_text_id
            != classification.requirement_text_id
        ):
            raise ValueError(
                "report changed a knowledge document ID"
            )
        if (
            finding.finding_statement
            != classification.finding_statement
        ):
            raise ValueError(
                "report changed a grounded finding statement"
            )
        if finding.objective_evidence != [evidence.raw_text]:
            raise ValueError(
                "report added or changed objective evidence"
            )


def compose_report(
    request: ReportComposeRequest,
    model_name: str = DEFAULT_MODEL,
) -> AuditReport:
    classifications = _classify_items(request)

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GOOGLE_API_KEY is not configured"
        )

    client = genai.Client(api_key=api_key)
    interaction = client.interactions.create(
        model=model_name,
        input=build_report_prompt(
            request,
            classifications,
        ),
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": AuditReport.model_json_schema(),
        },
    )

    if not interaction.output_text:
        raise RuntimeError(
            "Gemini returned an empty report response"
        )

    report = AuditReport.model_validate_json(
        interaction.output_text
    )
    _validate_report_grounding(
        report,
        request,
        classifications,
    )

    return report