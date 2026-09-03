from backend.agents.nc_classifier import classify_evidence


def run_classifier_integration_test() -> None:
    result = classify_evidence(
        "Privileged user access review was not performed "
        "in the last 12 months.",
        top_k=3,
    )

    assert result.clause_ref == "A.5.18"
    assert result.requirement_text_id == "ISO27001-A.5.18"
    assert 0 <= result.confidence <= 1

    print(result.model_dump_json(indent=2))


if __name__ == "__main__":
    run_classifier_integration_test()
    print("NC classifier integration test passed.")