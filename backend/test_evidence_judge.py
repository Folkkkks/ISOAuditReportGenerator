from backend.agents.evidence_judge import judge_report
from backend.models.evidence_judgment import EvidenceJudgeRequest
from backend.models.report_composition import ReportEvidenceItem
from backend.models.schemas import AuditReport


def run_evidence_judge_integration_test() -> None:
    evidence_text = (
        "Privileged user access review was not performed "
        "in the last 12 months."
    )

    report = AuditReport.model_validate(
        {
            "org_name": "Acme Corp",
            "audit_date": "2026-09-03",
            "standard": "ISO/IEC 27001:2022",
            "executive_summary": (
                "One minor nonconformity was identified "
                "regarding privileged access reviews."
            ),
            "findings": [
                {
                    "finding_id": "F-001",
                    "clause_ref": "A.5.18",
                    "classification": "minor_nc",
                    "finding_statement": (
                        "Privileged user access reviews were not "
                        "performed during the past 12 months."
                    ),
                    "objective_evidence": [evidence_text],
                    "requirement_text_id": "ISO27001-A.5.18",
                    "suggested_corrective_action": (
                        "Establish a periodic privileged-access "
                        "review schedule."
                    ),
                }
            ],
            "open_questions": [],
            "disclaimer": (
                "Draft report for auditor review and sign-off only."
            ),
        }
    )

    request = EvidenceJudgeRequest(
        report=report,
        source_evidence=[
            ReportEvidenceItem(
                source="checklist",
                raw_text=evidence_text,
            )
        ],
    )

    result = judge_report(request)

    assert result.report_grounded is True
    assert len(result.judgments) == 1

    judgment = result.judgments[0]

    assert judgment.finding_id == "F-001"
    assert judgment.verdict == "supported"
    assert judgment.evidence_supported is True
    assert judgment.reference_valid is True

    print(result.model_dump_json(indent=2))


if __name__ == "__main__":
    run_evidence_judge_integration_test()
    print("Evidence Judge integration test passed.")