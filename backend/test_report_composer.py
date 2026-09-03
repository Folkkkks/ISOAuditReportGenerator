from datetime import date

from backend.agents.report_composer import (
    DISCLAIMER,
    compose_report,
)
from backend.models.report_composition import (
    ReportComposeRequest,
    ReportEvidenceItem,
)


def run_report_composer_integration_test() -> None:
    evidence_text = (
        "Privileged user access review was not performed "
        "in the last 12 months."
    )

    request = ReportComposeRequest(
        org_name="Acme Corp",
        audit_date=date(2026, 9, 3),
        standard="ISO/IEC 27001:2022",
        evidence=[
            ReportEvidenceItem(
                source="checklist",
                raw_text=evidence_text,
            )
        ],
        top_k=3,
    )

    report = compose_report(request)

    assert report.org_name == "Acme Corp"
    assert report.audit_date == date(2026, 9, 3)
    assert len(report.findings) == 1
    assert report.findings[0].clause_ref == "A.5.18"
    assert report.findings[0].objective_evidence == [
        evidence_text
    ]
    assert report.disclaimer == DISCLAIMER

    print(report.model_dump_json(indent=2))


if __name__ == "__main__":
    run_report_composer_integration_test()
    print("Report composer integration test passed.")