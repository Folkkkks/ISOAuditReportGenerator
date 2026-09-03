import re

from backend.models.knowledge_base import KnowledgeBase, KnowledgeDocument
from backend.models.retrieval import RetrievalResult
from backend.services.knowledge_base import load_knowledge_base


TOKEN_PATTERN = re.compile(r"[a-z0-9.]+")
STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "in",
    "is",
    "it",
    "no",
    "not",
    "of",
    "on",
    "or",
    "the",
    "to",
    "was",
    "were",
    "with",
}


def _tokenize(text: str) -> set[str]:
    tokens = TOKEN_PATTERN.findall(text.lower())
    return {token for token in tokens if token not in STOP_WORDS}


def _score_document(
    query: str,
    query_tokens: set[str],
    document: KnowledgeDocument,
) -> RetrievalResult | None:
    searchable_text = " ".join(
        [
            document.reference,
            document.title,
            document.summary,
            *document.keywords,
        ]
    )
    document_tokens = _tokenize(searchable_text)
    matched_terms = sorted(query_tokens & document_tokens)

    score = float(len(matched_terms))
    normalized_query = query.lower()

    for keyword in document.keywords:
        if keyword.lower() in normalized_query:
            score += 3.0

    if document.reference.lower() in normalized_query:
        score += 5.0

    if score <= 0:
        return None

    return RetrievalResult(
        document=document,
        score=score,
        matched_terms=matched_terms,
    )


def retrieve_documents(
    query: str,
    top_k: int = 3,
    knowledge_base: KnowledgeBase | None = None,
) -> list[RetrievalResult]:
    """Return the most relevant knowledge documents for an evidence query."""
    if not query.strip():
        raise ValueError("query must not be empty")
    if top_k < 1:
        raise ValueError("top_k must be at least 1")

    knowledge_base = knowledge_base or load_knowledge_base()
    query_tokens = _tokenize(query)

    results = [
        result
        for document in knowledge_base.documents
        if (
            result := _score_document(
                query,
                query_tokens,
                document,
            )
        )
        is not None
    ]

    results.sort(
        key=lambda result: (
            -result.score,
            result.document.reference,
        )
    )
    return results[:top_k]