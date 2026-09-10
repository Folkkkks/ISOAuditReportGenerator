import json

from backend.models.knowledge_base import (
    KnowledgeBase,
    KnowledgeDocument,
)
from backend.services.knowledge_base import (
    DEFAULT_KNOWLEDGE_BASE_PATH,
    load_knowledge_base,
)


# Project-authored summaries, not verbatim ISO text.
# Page numbers refer to PDF pages, including the cover.
CLAUSES = [
    (
        "4.3",
        "ISMS scope",
        "Define and document the ISMS boundaries and applicability, "
        "considering organizational context, interested-party requirements, "
        "and interfaces or dependencies with other organizations.",
        ["scope", "boundaries", "applicability", "documented scope"],
        "8",
    ),
    (
        "5.2",
        "Information security policy",
        "Management establishes an appropriate information security policy "
        "covering objectives or their framework, applicable requirements, "
        "and continual improvement. Document and communicate the policy "
        "and make it available to relevant interested parties as appropriate.",
        ["information security policy", "policy", "communication"],
        "9",
    ),
    (
        "5.3",
        "Information security roles and responsibilities",
        "Assign and communicate responsibilities and authorities for "
        "information security roles, including ISMS conformity and "
        "reporting ISMS performance to management.",
        ["roles", "responsibilities", "authorities", "assignment"],
        "9",
    ),
    (
        "6.1.2",
        "Information security risk assessment process",
        "Define, document and apply a repeatable risk assessment process. "
        "Set assessment and acceptance criteria, identify risks and owners, "
        "analyse likelihood and consequences, and evaluate priorities.",
        ["risk assessment", "risk criteria", "risk owners", "methodology"],
        "10",
    ),
    (
        "6.1.3",
        "Information security risk treatment process",
        "Select risk treatment options and necessary controls using "
        "assessment results. Check coverage against Annex A, prepare a "
        "Statement of Applicability and treatment plan, and obtain risk "
        "owner approval of the plan and acceptance of residual risks. "
        "Retain documentation of the process.",
        ["risk treatment", "statement of applicability", "residual risk"],
        "10-11",
    ),
    (
        "6.2",
        "Information security objectives",
        "Set documented information security objectives at relevant "
        "functions and levels. Monitor and communicate them, measure them "
        "where practicable, and plan actions, resources, responsibilities, "
        "completion dates and evaluation of results.",
        ["objectives", "targets", "measurements", "planning"],
        "11",
    ),
    (
        "7.2",
        "Competence",
        "Determine the competence needed for work affecting information "
        "security performance. Ensure suitable education, training or "
        "experience, evaluate competence-building actions where applicable, "
        "and retain appropriate evidence of competence.",
        ["competence", "skills", "training effectiveness", "qualifications"],
        "12",
    ),
    (
        "7.3",
        "Awareness",
        "People working under organizational control need awareness of "
        "the information security policy, their contribution to ISMS "
        "effectiveness, and the implications of failing to meet ISMS "
        "requirements. A missing formal course alone does not prove "
        "that people lack awareness.",
        ["awareness", "staff awareness", "policy awareness", "staff updates"],
        "12",
    ),
    (
        "7.5.3",
        "Control of documented information",
        "Keep required ISMS documentation available and suitable when "
        "needed, and protect it appropriately. Address access, retrieval, "
        "distribution, storage, preservation, change control, retention "
        "and disposal as applicable.",
        ["document control", "retrieval", "version control", "documents"],
        "13",
    ),
    (
        "9.2.2",
        "Internal audit programme",
        "Maintain an internal audit programme covering frequency, methods, "
        "responsibilities, planning and reporting. Define audit scope and "
        "criteria, ensure auditor objectivity, report results to relevant "
        "management, and retain evidence of programme execution and results.",
        ["internal audit", "audit programme", "audit schedule", "auditors"],
        "15",
    ),
]


def main() -> None:
    """Add the Iteration 2 clause summaries without replacing existing data."""
    path = DEFAULT_KNOWLEDGE_BASE_PATH
    knowledge_base = load_knowledge_base()
    documents = list(knowledge_base.documents)

    existing = {}
    for document in documents:
        if document.document_id in existing:
            raise ValueError(
                f"Duplicate document ID: {document.document_id}"
            )
        existing[document.document_id] = document

    added = 0

    for reference, title, summary, keywords, pages in CLAUSES:
        document = KnowledgeDocument(
            document_id=f"ISO27001-{reference}",
            standard="ISO/IEC 27001:2022",
            reference=reference,
            title=title,
            summary=summary,
            keywords=keywords,
            source_note=(
                "Project-authored summary; checked against the supplied "
                f"ISO/IEC 27001:2022 PDF, PDF pages {pages}, "
                f"clause {reference}. Not verbatim ISO text. "
                "The approved 2013 gap-analysis report provides case "
                "context, not the authority for this 2022 requirement."
            ),
        )

        if document.document_id in existing:
            if existing[document.document_id] != document:
                raise ValueError(
                    "Existing document has different content: "
                    f"{document.document_id}. Review before replacing."
                )
            continue

        documents.append(document)
        existing[document.document_id] = document
        added += 1

    updated = KnowledgeBase(
        version=knowledge_base.version,
        documents=documents,
    )

    if added:
        payload = json.dumps(
            updated.model_dump(mode="json"),
            ensure_ascii=False,
            indent=2,
        )
        temporary_path = path.with_suffix(".json.tmp")
        temporary_path.write_text(payload + "\n", encoding="utf-8")
        temporary_path.replace(path)

    print(f"Added {added} knowledge documents.")
    print(f"Total knowledge documents: {len(updated.documents)}")


if __name__ == "__main__":
    main()