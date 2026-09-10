import re
from dataclasses import dataclass
from typing import Literal

from backend.models.retrieval import RetrievalResult


SpecialistName = Literal["management_system", "annex_a", "mixed"]

SPECIALIST_INSTRUCTIONS: dict[SpecialistName, str] = {
    "management_system": (
        "Focus on management-system requirements in clauses 4-10. "
        "Distinguish an absent required process from an isolated lapse. "
        "Only claim a documentation failure when the cited requirement "
        "requires documentation. Do not infer lack of awareness or "
        "competence solely from absence of a formal training course."
    ),
    "annex_a": (
        "Focus on Annex A information security controls. Examine the "
        "observed control operation and relevant policy or applicability "
        "information. Do not invent review frequencies or infer a "
        "system-wide failure from an isolated control observation."
    ),
    "mixed": (
        "Compare management-system requirements and Annex A controls. "
        "Choose the most specific requirement supported by the evidence. "
        "Do not assume a control issue also proves a management-system "
        "failure. Flag unresolved ambiguity for human review."
    ),
}


@dataclass(frozen=True)
class SpecialistRoute:
    specialist: SpecialistName
    reason: str

    @property
    def instructions(self) -> str:
        return SPECIALIST_INSTRUCTIONS[self.specialist]


def select_classifier_specialist(
    results: list[RetrievalResult],
) -> SpecialistRoute:
    """Select a prompt specialist using the strongest retrieval matches."""
    if not results:
        raise ValueError("Cannot route without retrieved context")

    strongest = max(item.score for item in results)

    # A routing heuristic, not a calibrated probability.
    candidates = [
        item for item in results
        if item.score >= strongest * 0.8
    ]
    families: set[SpecialistName] = set()

    for item in candidates:
        reference = item.document.reference

        if re.fullmatch(r"A\.[5-8]\.\d+", reference):
            families.add("annex_a")
        elif re.fullmatch(r"(?:[4-9]|10)(?:\.\d+)*", reference):
            families.add("management_system")
        else:
            families.add("mixed")

    if families == {"management_system"}:
        name: SpecialistName = "management_system"
    elif families == {"annex_a"}:
        name = "annex_a"
    else:
        name = "mixed"

    return SpecialistRoute(
        specialist=name,
        reason=(
            "Selected from reference families scoring at least 80% "
            "of the strongest retrieved match; all context is retained."
        ),
    )