"""Deterministically structure messy audit notes into traceable observations."""

import re

from backend.models.report_composition import ReportEvidenceItem
from backend.models.schemas import AuditObservation


FIELD_PATTERN = re.compile(
    r"(?i)(Auditee|Position|Interview Notes|Checklist Item|Result|Notes|"
    r"Document Name|Reference|Review Notes):\s*"
)


def _clean(value: str) -> str:
    """Collapse formatting noise while preserving the words and punctuation."""
    return " ".join(value.split()).strip()


def _extract_fields(raw_text: str) -> dict[str, str]:
    """Read labelled fields produced by the UI without interpreting evidence."""
    matches = list(FIELD_PATTERN.finditer(raw_text))
    fields: dict[str, str] = {}
    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(raw_text)
        fields[match.group(1).lower()] = _clean(raw_text[start:end]).strip(" .")
    return fields


def _normalize_item(item: ReportEvidenceItem) -> str:
    """Create a source-aware observation and keep raw_text as the audit record."""
    raw = _clean(item.raw_text)
    fields = _extract_fields(item.raw_text)

    if item.source == "interview":
        subject = fields.get("auditee")
        position = fields.get("position")
        notes = fields.get("interview notes") or fields.get("notes")
        if notes:
            context = "Interview"
            if subject:
                context += f" with {subject}"
            if position:
                context += f" ({position})"
            return f"{context}. Observation: {notes}."
        return f"Interview observation: {raw}"

    if item.source == "checklist":
        checklist_item = fields.get("checklist item")
        result = fields.get("result")
        notes = fields.get("notes")
        if checklist_item or result or notes:
            parts = []
            if checklist_item:
                parts.append(f"Checklist item: {checklist_item}.")
            if result:
                parts.append(f"Recorded result: {result}.")
            if notes:
                parts.append(f"Observation: {notes}.")
            return " ".join(parts)
        return f"Checklist observation: {raw}"

    document_name = fields.get("document name")
    reference = fields.get("reference")
    notes = fields.get("review notes") or fields.get("notes")
    if document_name or reference or notes:
        context = f"Document reviewed: {document_name or 'unnamed document'}"
        if reference:
            context += f" (reference {reference})"
        return f"{context}. Observation: {notes or 'No additional review note supplied'}."
    return f"Document-review observation: {raw}"


def normalize_evidence(
    evidence: list[ReportEvidenceItem],
) -> list[AuditObservation]:
    """Create traceable observations without changing the source quotation."""
    return [
        AuditObservation(
            obs_id=f"OBS-{index:03d}",
            source=item.source,
            raw_text=item.raw_text,
            normalized_statement=_normalize_item(item),
        )
        for index, item in enumerate(evidence, start=1)
    ]
