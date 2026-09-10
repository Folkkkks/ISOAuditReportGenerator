from typing import get_args

from backend.models.classification import FindingClassification


LABELS = get_args(FindingClassification)


def calculate_metrics(rows: list[dict]) -> dict:
    """Single-finding evaluation; missing outputs count as false negatives."""
    if not rows:
        raise ValueError("Cannot calculate metrics for an empty evaluation")

    per_class = {}
    for label in LABELS:
        tp = fp = fn = support = 0
        for row in rows:
            expected = row["expected"]["classification"]
            predicted = (row.get("prediction") or {}).get("classification")
            support += expected == label
            tp += expected == label and predicted == label
            fp += expected != label and predicted == label
            fn += expected == label and predicted != label
        precision = tp / (tp + fp) if tp + fp else 0.0
        recall = tp / (tp + fn) if tp + fn else 0.0
        f1 = 2 * tp / (2 * tp + fp + fn) if 2 * tp + fp + fn else 0.0
        per_class[label] = dict(
            support=support, tp=tp, fp=fp, fn=fn,
            precision=precision, recall=recall, f1=f1,
        )

    mapped = classification_correct = predicted = judged = grounded = unsupported = 0
    major_judged = unsupported_major = released_unsupported_major = 0
    for row in rows:
        output = row.get("prediction")
        if output is not None:
            predicted += 1
            expected = row["expected"]
            classification_correct += output["classification"] == expected["classification"]
            mapped += (
                output["clause_ref"] == expected["clause_ref"]
                and output["requirement_text_id"] == expected["requirement_text_id"]
            )
        judgment = row.get("finding_judgment")
        if judgment is None:
            continue
        judged += 1
        supported = (
            judgment["verdict"] == "supported"
            and judgment["evidence_supported"]
            and judgment["reference_valid"]
            and not judgment["unsupported_claims"]
        )
        grounded += supported
        unsupported += not supported
        if output and output["classification"] == "major_nc":
            major_judged += 1
            unsupported_major += not supported
            released_unsupported_major += (
                not supported and row["status"] == "awaiting_auditor_review"
            )

    total = len(rows)
    return {
        "selected_cases": total,
        "predicted_cases": predicted,
        "judged_cases": judged,
        "error_cases": sum(row["status"] == "error" for row in rows),
        "pending_cases": sum(row["status"] == "pending" for row in rows),
        "interrupted_cases": sum(row["status"] == "interrupted" for row in rows),
        "blocked_cases": sum(row["status"] == "needs_revision" for row in rows),
        "prediction_coverage": predicted / total,
        "classification_accuracy": classification_correct / total,
        "classification_macro_f1": sum(item["f1"] for item in per_class.values()) / len(LABELS),
        "clause_pair_accuracy": mapped / total,
        "automated_grounding_score": grounded / judged if judged else None,
        "automated_unsupported_finding_rate": unsupported / judged if judged else None,
        "major_findings_judged": major_judged,
        "automated_unsupported_major_count": unsupported_major if judged else None,
        "automated_unsupported_major_rate": unsupported_major / major_judged if major_judged else None,
        "released_automated_unsupported_major_count": released_unsupported_major if judged else None,
        "per_class": per_class,
    }
