import unittest

from backend.agents.classifier_router import select_classifier_specialist
from backend.models.knowledge_base import KnowledgeDocument
from backend.models.retrieval import RetrievalResult


def make_result(reference: str, score: float) -> RetrievalResult:
    return RetrievalResult(
        document=KnowledgeDocument(
            document_id=f"TEST-{reference}",
            reference=reference,
            title="Router test fixture",
            summary="Synthetic document for routing tests.",
            source_note="Test fixture only.",
        ),
        score=score,
    )


class ClassifierRouterTests(unittest.TestCase):
    def test_management_specialist_ignores_weak_annex_match(self):
        route = select_classifier_specialist([
            make_result("A.5.18", 2),
            make_result("6.1.2", 10),
        ])
        self.assertEqual(route.specialist, "management_system")

    def test_annex_specialist_ignores_weak_management_match(self):
        route = select_classifier_specialist([
            make_result("7.3", 2),
            make_result("A.5.18", 10),
        ])
        self.assertEqual(route.specialist, "annex_a")

    def test_close_cross_family_matches_use_mixed_specialist(self):
        route = select_classifier_specialist([
            make_result("7.3", 8),
            make_result("A.6.3", 10),
        ])
        self.assertEqual(route.specialist, "mixed")

    def test_unknown_reference_uses_mixed_specialist(self):
        route = select_classifier_specialist([
            make_result("UNKNOWN", 5),
        ])
        self.assertEqual(route.specialist, "mixed")

    def test_empty_context_is_rejected(self):
        with self.assertRaises(ValueError):
            select_classifier_specialist([])

    def test_routes_supply_different_specialist_instructions(self):
        management = select_classifier_specialist([
            make_result("4.3", 10),
        ])
        annex = select_classifier_specialist([
            make_result("A.5.18", 10),
        ])
        self.assertNotEqual(
            management.instructions,
            annex.instructions,
        )


if __name__ == "__main__":
    unittest.main()