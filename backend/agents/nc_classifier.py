import os

from dotenv import load_dotenv
from google import genai

from backend.models.classification import ClassificationResult
from backend.models.retrieval import RetrievalResult
from backend.services.retrieval import retrieve_documents


load_dotenv()

DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")


def _format_context(results: list[RetrievalResult]) -> str:
    return "\n\n".join(
        (
            f"Document ID: {result.document.document_id}\n"
            f"Reference: {result.document.reference}\n"
            f"Title: {result.document.title}\n"
            f"Summary: {result.document.summary}"
        )
        for result in results
    )


def build_classifier_prompt(
    evidence: str,
    retrieved_context: list[RetrievalResult],
) -> str:
    context = _format_context(retrieved_context)

    return f"""
You are the NC Classifier specialist for an ISO/IEC 27001:2022
audit-report drafting system.

Classify the evidence as exactly one of:
- major_nc: a systemic or significant failure of the management system
- minor_nc: an isolated lapse that does not indicate systemic failure
- observation: a noteworthy fact without enough support for nonconformity
- ofi: an opportunity for improvement without a demonstrated failure

Rules:
1. Use only the supplied evidence and retrieved knowledge context.
2. Select the most specific reference from the retrieved context.
3. Copy clause_ref and requirement_text_id exactly from that context.
4. Do not invent facts, controls, or corrective actions.
5. Set needs_human_review to true when evidence is incomplete, ambiguous,
   or insufficient to determine severity confidently.
6. Write a concise, objective finding_statement and rationale.

EVIDENCE:
{evidence}

RETRIEVED KNOWLEDGE CONTEXT:
{context}
""".strip()


def classify_evidence(
    evidence: str,
    top_k: int = 3,
    model_name: str = DEFAULT_MODEL,
) -> ClassificationResult:
    if not evidence.strip():
        raise ValueError("evidence must not be empty")

    retrieved_context = retrieve_documents(
        evidence,
        top_k=top_k,
    )
    if not retrieved_context:
        raise ValueError(
            "no relevant knowledge context was retrieved"
        )

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GOOGLE_API_KEY is not configured"
        )

    client = genai.Client(api_key=api_key)

    interaction = client.interactions.create(
        model=model_name,
        input=build_classifier_prompt(
            evidence,
            retrieved_context,
        ),
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": ClassificationResult.model_json_schema(),
        },
    )

    if not interaction.output_text:
        raise RuntimeError(
            "Gemini returned an empty classifier response"
        )

    result = ClassificationResult.model_validate_json(
        interaction.output_text
    )

    allowed_pairs = {
        (
            item.document.reference,
            item.document.document_id,
        )
        for item in retrieved_context
    }
    result_pair = (
        result.clause_ref,
        result.requirement_text_id,
    )

    if result_pair not in allowed_pairs:
        raise ValueError(
            "classifier returned a reference "
            "outside the retrieved context"
        )

    return result