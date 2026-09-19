"""Offline bilingual prompt and schema tests. No AI calls."""

import unittest
from datetime import date

from backend.agents.evidence_judge import build_evidence_judge_prompt
from backend.agents.nc_classifier import build_classifier_prompt
from backend.agents.report_composer import (
    DISCLAIMERS,
    _enforce_request_metadata,
    build_report_prompt,
)
from backend.models.classification import ClassificationResult
from backend.models.clause_mapping import ClauseMappingResult
from backend.models.evidence_judgment import EvidenceJudgeRequest
from backend.models.knowledge_base import KnowledgeDocument
from backend.models.report_composition import ReportComposeRequest, ReportEvidenceItem
from backend.models.retrieval import RetrievalResult
from backend.models.schemas import AuditFinding, AuditReport


class LanguageSupportTests(unittest.TestCase):
    def setUp(self):
        self.evidence = ReportEvidenceItem(
            source="document_review",
            raw_text="The access review was completed two weeks late.",
        )
        self.request = ReportComposeRequest(
            org_name="Acme",
            audit_date=date(2026, 9, 16),
            report_language="th",
            evidence=[self.evidence],
        )
        self.classification = ClassificationResult(
            classification="minor_nc",
            rationale="หลักฐานแสดงความล่าช้าเฉพาะกรณี",
            confidence=0.9,
            needs_human_review=False,
        )
        self.mapping = ClauseMappingResult(
            clause_ref="A.5.18",
            requirement_text_id="ISO27001-A.5.18",
            requirement_title="Access rights",
            rationale="Highest retrieval score",
            retrieval_score=1.0,
        )

    def test_request_defaults_to_english_and_rejects_unknown_language(self):
        payload = self.request.model_dump(mode="json")
        payload.pop("report_language")
        self.assertEqual(ReportComposeRequest.model_validate(payload).report_language, "en")
        payload["report_language"] = "jp"
        with self.assertRaises(ValueError):
            ReportComposeRequest.model_validate(payload)

    def test_thai_prompt_keeps_identifiers_and_original_evidence(self):
        document = KnowledgeDocument(
            document_id="ISO27001-A.5.18",
            standard="ISO/IEC 27001:2022",
            reference="A.5.18",
            title="Access rights",
            summary="Access rights shall be reviewed periodically.",
            keywords=["access review"],
            source_note="Synthetic test reference",
        )
        context = [RetrievalResult(document=document, score=1, matched_terms=[])]
        classifier_prompt = build_classifier_prompt(self.evidence.raw_text, context, "th")
        composer_prompt = build_report_prompt(
            self.request, [self.classification], [self.mapping]
        )
        self.assertIn("Write rationale in Thai", classifier_prompt)
        self.assertIn("separate Clause Mapper", classifier_prompt)
        self.assertIn("executive_summary", composer_prompt)
        self.assertIn("in Thai", composer_prompt)
        self.assertIn("Write a concise, formal finding_statement", composer_prompt)
        self.assertIn(self.evidence.raw_text, composer_prompt)
        self.assertIn("objective_evidence_th", composer_prompt)
        self.assertIn("faithful Thai translation", composer_prompt)
        self.assertIn(DISCLAIMERS["th"], composer_prompt)

    def test_judge_narrative_uses_selected_language(self):
        report = AuditReport(
            org_name="Acme",
            audit_date=date(2026, 9, 16),
            standard="ISO/IEC 27001:2022",
            executive_summary="สรุปผลการตรวจ",
            findings=[AuditFinding(
                finding_id="F-001",
                clause_ref="A.5.18",
                classification="minor_nc",
                finding_statement="การทบทวนสิทธิ์ดำเนินการล่าช้าสองสัปดาห์",
                objective_evidence=[self.evidence.raw_text],
                objective_evidence_th=["การทบทวนสิทธิ์เสร็จล่าช้าสองสัปดาห์"],
                requirement_text_id="ISO27001-A.5.18",
                suggested_corrective_action="ดำเนินการทบทวนตามกำหนด",
            )],
            open_questions=[],
            disclaimer=DISCLAIMERS["th"],
        )
        request = EvidenceJudgeRequest(
            report=report,
            source_evidence=[self.evidence],
            report_language="th",
        )
        prompt = build_evidence_judge_prompt(request, [{
            "finding_id": "F-001", "evidence_supported": True, "reference_valid": True,
        }])
        self.assertIn("Write rationale and summary in Thai", prompt)
        self.assertIn("reader aid only", prompt)

    def test_old_reports_without_translation_remain_readable(self):
        finding = AuditFinding.model_validate({
            "finding_id": "F-001",
            "clause_ref": "A.5.18",
            "classification": "minor_nc",
            "finding_statement": "Late review",
            "objective_evidence": [self.evidence.raw_text],
            "requirement_text_id": "ISO27001-A.5.18",
            "suggested_corrective_action": None,
        })
        self.assertEqual(finding.objective_evidence_th, [])

    def test_request_metadata_cannot_be_rewritten_by_the_model(self):
        report = AuditReport(
            org_name="Translated or altered organization",
            audit_date=date(2025, 1, 1),
            standard="Changed standard",
            executive_summary="สรุปผลการตรวจ",
            findings=[AuditFinding(
                finding_id="F-001",
                clause_ref="A.5.18",
                classification="minor_nc",
                finding_statement="การทบทวนสิทธิ์ดำเนินการล่าช้าสองสัปดาห์",
                objective_evidence=[self.evidence.raw_text],
                objective_evidence_th=["การทบทวนสิทธิ์เสร็จล่าช้าสองสัปดาห์"],
                requirement_text_id="ISO27001-A.5.18",
                suggested_corrective_action="ดำเนินการทบทวนตามกำหนด",
            )],
            open_questions=[],
            disclaimer="Changed disclaimer",
        )

        protected = _enforce_request_metadata(report, self.request)

        self.assertEqual(protected.org_name, self.request.org_name)
        self.assertEqual(protected.audit_date, self.request.audit_date)
        self.assertEqual(protected.standard, self.request.standard)
        self.assertEqual(protected.disclaimer, DISCLAIMERS["th"])


if __name__ == "__main__":
    unittest.main()
