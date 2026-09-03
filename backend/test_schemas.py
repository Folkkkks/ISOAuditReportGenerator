from datetime import date

from models.schemas import AuditFinding, AuditObservation, AuditReport


observation = AuditObservation(
    obs_id="OBS-001",
    source="interview",
    raw_text="No evidence of access review was found.",
    normalized_statement="Access reviews were not performed or documented.",
)

finding = AuditFinding(
    finding_id="F-001",
    clause_ref="A.5.18",
    classification="major_nc",
    finding_statement="Access reviews were not performed.",
    objective_evidence=[observation.normalized_statement],
    requirement_text_id="ISO27001-A.5.18",
    suggested_corrective_action="Establish and document periodic access reviews.",
)

report = AuditReport(
    org_name="Acme Corp",
    audit_date=date.today(),
    standard="ISO/IEC 27001:2022",
    executive_summary="The audit identified one major nonconformity related to access review.",
    findings=[finding],
    open_questions=["Confirm access review frequency."],
    disclaimer="Draft report for auditor review and sign-off only.",
)

print(report.model_dump_json(indent=2))