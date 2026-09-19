import hashlib
import json
from dataclasses import dataclass
from pathlib import Path

from backend.models.evaluation import GoldDataset, GoldFinding
from backend.models.report_composition import ReportComposeRequest
from backend.models.schemas import AuditReport
from backend.services.knowledge_base import (
    DEFAULT_KNOWLEDGE_BASE_PATH,
    load_knowledge_base,
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]
EVALUATION_DIR = PROJECT_ROOT / "data" / "evaluation"


@dataclass(frozen=True)
class EvaluationCase:
    case_id: str
    request: ReportComposeRequest
    gold: GoldFinding


@dataclass(frozen=True)
class EvaluationDataset:
    gold: GoldDataset
    cases: list[EvaluationCase]
    hashes: dict[str, str]


def load_evaluation_dataset(
    inputs_path: Path = EVALUATION_DIR / "inputs.json",
    gold_path: Path = EVALUATION_DIR / "gold.json",
) -> EvaluationDataset:
    """Fail before API calls if inputs, reference annotations or KB disagree."""
    input_bytes = inputs_path.read_bytes()
    gold_bytes = gold_path.read_bytes()
    inputs = json.loads(input_bytes.decode("utf-8-sig"))
    gold = GoldDataset.model_validate_json(gold_bytes.decode("utf-8-sig"))

    if inputs["dataset_id"] != gold.dataset_id:
        raise ValueError("Input and gold dataset IDs do not match")
    if inputs["target_standard"] != gold.target_standard:
        raise ValueError("Input and gold standards do not match")

    requests: dict[str, ReportComposeRequest] = {}
    for item in inputs["cases"]:
        case_id = item["case_id"]
        if not isinstance(case_id, str) or not case_id.strip():
            raise ValueError("Input case ID must be a non-empty string")
        if case_id in requests:
            raise ValueError(f"Duplicate input case ID: {case_id}")
        request = ReportComposeRequest.model_validate(item["request"])
        if request.standard != gold.target_standard:
            raise ValueError(f"{case_id}: unexpected request standard")
        if len(request.evidence) != 1:
            raise ValueError(f"{case_id}: this evaluator supports one finding per case")
        if not request.evidence[0].raw_text.strip():
            raise ValueError(f"{case_id}: blank evidence")
        requests[case_id] = request

    gold_by_id = {item.case_id: item for item in gold.cases}
    if set(requests) != set(gold_by_id):
        raise ValueError("Input and gold case IDs do not match")

    kb = load_knowledge_base()
    pairs = {
        (doc.standard, doc.reference, doc.document_id)
        for doc in kb.documents
    }
    for item in gold.cases:
        if (gold.target_standard, item.clause_ref, item.requirement_text_id) not in pairs:
            raise ValueError(f"{item.case_id}: reference pair is missing from the KB")
        if item.classification not in gold.rubric:
            raise ValueError(f"{item.case_id}: classification has no rubric")
        request = requests[item.case_id]
        report = item.report
        if (
            report.org_name != request.org_name
            or report.audit_date != request.audit_date
            or report.standard != request.standard
        ):
            raise ValueError(f"{item.case_id}: Gold report metadata disagrees with input")
        if report.findings[0].objective_evidence != [request.evidence[0].raw_text]:
            raise ValueError(f"{item.case_id}: Gold objective evidence must copy raw input")

    return EvaluationDataset(
        gold=gold,
        cases=[EvaluationCase(key, value, gold_by_id[key]) for key, value in requests.items()],
        hashes={
            "inputs_sha256": hashlib.sha256(input_bytes).hexdigest(),
            "gold_sha256": hashlib.sha256(gold_bytes).hexdigest(),
            "kb_sha256": hashlib.sha256(DEFAULT_KNOWLEDGE_BASE_PATH.read_bytes()).hexdigest(),
        },
    )


def build_gold_report(case: EvaluationCase) -> AuditReport:
    """Return the separately authored full Gold AuditReport."""
    return case.gold.report.model_copy(deep=True)
