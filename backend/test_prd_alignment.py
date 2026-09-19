"""Offline checks for the PRD architecture and API contract."""

import os
import tempfile
import unittest
from datetime import date

from fastapi.testclient import TestClient

from backend.agents.clause_mapper import map_clause
from backend.agents.evidence_normalizer import normalize_evidence
from backend.app import app
from backend.models.knowledge_base import KnowledgeDocument
from backend.models.report_composition import ReportEvidenceItem
from backend.models.evidence_judgment import EvidenceJudgeRequest
from backend.models.retrieval import RetrievalResult
from backend.services.evaluation_data import load_evaluation_dataset


class PrdAlignmentTests(unittest.TestCase):
    def test_normalizer_preserves_raw_text_and_structures_whitespace(self):
        raw = "Access review\n  was completed   late."
        result = normalize_evidence([
            ReportEvidenceItem(source="document_review", raw_text=raw),
        ])
        self.assertEqual(result[0].obs_id, "OBS-001")
        self.assertEqual(result[0].raw_text, raw)
        self.assertEqual(
            result[0].normalized_statement,
            "Document-review observation: Access review was completed late.",
        )

    def test_clause_mapper_selects_highest_scoring_retrieved_pair(self):
        context = [RetrievalResult(document=KnowledgeDocument(
            document_id="ISO27001-A.5.18",
            standard="ISO/IEC 27001:2022",
            reference="A.5.18",
            title="Access rights",
            summary="Access rights shall be reviewed.",
            keywords=["access"],
            source_note="Synthetic test fixture",
        ), score=1.0, matched_terms=[])]
        mapping = map_clause("Access review was late", context)
        self.assertEqual(mapping.clause_ref, "A.5.18")
        self.assertEqual(mapping.requirement_text_id, "ISO27001-A.5.18")
        with self.assertRaises(ValueError):
            map_clause("Access review was late", [])

    def test_evidence_source_is_restricted_to_prd_values(self):
        with self.assertRaises(ValueError):
            ReportEvidenceItem(source="photo", raw_text="Not in text scope")

    def test_ingest_uses_persistent_audit_store(self):
        with tempfile.TemporaryDirectory() as directory:
            old = os.environ.get("AUDIT_DB_PATH")
            os.environ["AUDIT_DB_PATH"] = directory + "/audit.db"
            try:
                with TestClient(app) as client:
                    payload = {
                        "org_name": "Acme", "audit_date": str(date(2026, 9, 16)),
                        "evidence": [{"source": "interview", "raw_text": "A review was late."}],
                    }
                    created = client.post("/audits/ingest", json=payload)
                    self.assertEqual(created.status_code, 200)
                    audit_id = created.json()["audit_id"]
                    loaded = client.get(f"/audits/{audit_id}/report")
                    self.assertEqual(loaded.status_code, 200)
                    self.assertEqual(loaded.json()["input"]["org_name"], "Acme")
            finally:
                if old is None:
                    os.environ.pop("AUDIT_DB_PATH", None)
                else:
                    os.environ["AUDIT_DB_PATH"] = old

    def test_evaluate_endpoint_dry_run(self):
        with TestClient(app) as client:
            response = client.post("/evaluate", json={"dry_run": True, "limit": 2})
            self.assertEqual(response.status_code, 200)
            body = response.json()
            self.assertEqual(body["status"], "validated")
            self.assertEqual(body["selected_cases"], 2)
            self.assertTrue(body["dry_run"])

    def test_judge_block_demo_fixture_is_available(self):
        import json
        from pathlib import Path

        path = Path(__file__).resolve().parents[1] / "data" / "demo" / "unsupported-judge-request.json"
        request = EvidenceJudgeRequest.model_validate_json(path.read_text(encoding="utf-8"))
        self.assertEqual(request.report.findings[0].classification, "major_nc")
        self.assertIn("One employee", request.source_evidence[0].raw_text)

    def test_strict_prd_dataset_has_full_reports_and_all_sources(self):
        dataset = load_evaluation_dataset()
        self.assertEqual(len(dataset.cases), 10)
        self.assertEqual(dataset.gold.review_status, "development_reviewed")
        sources = {
            case.request.evidence[0].source
            for case in dataset.cases
        }
        self.assertEqual(sources, {"interview", "checklist", "document_review"})
        self.assertTrue(all(len(case.gold.report.findings) == 1 for case in dataset.cases))


if __name__ == "__main__":
    unittest.main()
