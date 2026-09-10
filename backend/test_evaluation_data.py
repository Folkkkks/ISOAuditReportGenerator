import json
from pathlib import Path

from backend.models.evaluation import GoldDataset
from backend.models.report_composition import ReportComposeRequest
from backend.services.knowledge_base import load_knowledge_base


EVALUATION_DIR = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "evaluation"
)


def validate_evaluation_data() -> None:
    input_path = EVALUATION_DIR / "inputs.json"
    gold_path = EVALUATION_DIR / "gold.json"

    inputs = json.loads(input_path.read_text(encoding="utf-8-sig"))
    gold = GoldDataset.model_validate_json(
        gold_path.read_text(encoding="utf-8-sig")
    )

    if inputs["dataset_id"] != gold.dataset_id:
        raise ValueError("Input and gold dataset IDs do not match")

    if inputs["target_standard"] != gold.target_standard:
        raise ValueError("Input and gold standards do not match")

    requests = {}

    for case in inputs["cases"]:
        case_id = case["case_id"]

        if case_id in requests:
            raise ValueError(f"Duplicate input case ID: {case_id}")

        request = ReportComposeRequest.model_validate(case["request"])

        if request.standard != gold.target_standard:
            raise ValueError(f"{case_id}: unexpected request standard")

        if len(request.evidence) != 1:
            raise ValueError(
                f"{case_id}: this dataset expects one evidence item "
                "and one reference finding per case"
            )

        if not request.evidence[0].raw_text.strip():
            raise ValueError(f"{case_id}: evidence is blank")

        requests[case_id] = request

    gold_ids = {case.case_id for case in gold.cases}
    input_ids = set(requests)

    if input_ids != gold_ids:
        raise ValueError(
            f"Missing gold cases: {sorted(input_ids - gold_ids)}; "
            f"missing input cases: {sorted(gold_ids - input_ids)}"
        )

    knowledge_base = load_knowledge_base()
    allowed_references = {
        (
            document.standard,
            document.reference,
            document.document_id,
        )
        for document in knowledge_base.documents
    }

    for case in gold.cases:
        reference = (
            gold.target_standard,
            case.clause_ref,
            case.requirement_text_id,
        )

        if reference not in allowed_references:
            raise ValueError(
                f"{case.case_id}: reference pair does not exist in the KB"
            )

        if case.classification not in gold.rubric:
            raise ValueError(
                f"{case.case_id}: classification has no rubric"
            )

    print(f"Validated {len(requests)} input/gold pairs.")
    print("All gold reference pairs exist in the knowledge base.")
    print(f"Gold review status: {gold.review_status}")


if __name__ == "__main__":
    validate_evaluation_data()