"""Dedicated deterministic mapping from evidence to an ISO clause/control."""

from backend.models.clause_mapping import ClauseMappingResult
from backend.models.retrieval import RetrievalResult


def map_clause(
    evidence: str,
    retrieved_context: list[RetrievalResult],
) -> ClauseMappingResult:
    """Select the strongest retrieved ISO reference for one observation.

    Retrieval scores are calculated only from the submitted evidence and the
    local knowledge base. This mapper does not accept an AI-proposed clause,
    so classification and reference selection remain separate responsibilities.
    """
    if not evidence.strip():
        raise ValueError("evidence must not be empty")
    if not retrieved_context:
        raise ValueError("clause mapper requires retrieved knowledge context")

    ranked = sorted(
        retrieved_context,
        key=lambda item: (
            -item.score,
            item.document.reference,
            item.document.document_id,
        ),
    )
    selected = ranked[0]
    document = selected.document
    return ClauseMappingResult(
        clause_ref=document.reference,
        requirement_text_id=document.document_id,
        requirement_title=document.title,
        rationale=(
            "Selected the highest-scoring ISO knowledge-base result returned "
            "for the normalized observation."
        ),
        retrieval_score=float(selected.score),
    )
