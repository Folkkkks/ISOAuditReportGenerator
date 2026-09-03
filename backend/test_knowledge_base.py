from backend.services.knowledge_base import load_knowledge_base


def test_load_knowledge_base() -> None:
    knowledge_base = load_knowledge_base()

    assert knowledge_base.version == "0.1"
    assert len(knowledge_base.documents) >= 3
    assert all(
        document.standard == "ISO/IEC 27001:2022"
        for document in knowledge_base.documents
    )
    assert any(
        document.reference == "A.5.18"
        for document in knowledge_base.documents
    )


if __name__ == "__main__":
    test_load_knowledge_base()
    print("Knowledge base validation passed.")