from backend.services.retrieval import retrieve_documents


def test_access_review_retrieves_a_5_18_first() -> None:
    results = retrieve_documents(
        "Privileged user access review was not performed in the last 12 months.",
        top_k=3,
    )

    assert results
    assert results[0].document.reference == "A.5.18"
    assert results[0].score > 0


def test_top_k_limits_results() -> None:
    results = retrieve_documents(
        "access control and identity",
        top_k=2,
    )

    assert len(results) <= 2


def test_empty_query_is_rejected() -> None:
    try:
        retrieve_documents("   ")
    except ValueError as error:
        assert str(error) == "query must not be empty"
    else:
        raise AssertionError("An empty query should raise ValueError")


if __name__ == "__main__":
    test_access_review_retrieves_a_5_18_first()
    test_top_k_limits_results()
    test_empty_query_is_rejected()
    print("Retrieval pipeline tests passed.")