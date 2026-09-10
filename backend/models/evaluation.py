from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from backend.models.classification import FindingClassification


class GoldFinding(BaseModel):
    model_config = ConfigDict(extra="forbid")

    case_id: str = Field(min_length=1)
    classification: FindingClassification
    clause_ref: str = Field(min_length=1)
    requirement_text_id: str = Field(min_length=1)
    reference_finding: str = Field(min_length=1)
    rationale: str = Field(min_length=1)
    expected_needs_human_review: bool


class GoldDataset(BaseModel):
    model_config = ConfigDict(extra="forbid")

    dataset_id: str = Field(min_length=1)
    review_status: Literal["draft", "reviewed"]
    target_standard: Literal["ISO/IEC 27001:2022"]
    annotation_note: str = Field(min_length=1)
    rubric: dict[FindingClassification, str]
    cases: list[GoldFinding] = Field(min_length=1)

    @model_validator(mode="after")
    def check_unique_case_ids(self) -> "GoldDataset":
        case_ids = [case.case_id for case in self.cases]

        if len(case_ids) != len(set(case_ids)):
            raise ValueError("Gold dataset contains duplicate case IDs")

        return self