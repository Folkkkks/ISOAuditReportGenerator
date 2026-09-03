import json
from pathlib import Path

from backend.models.knowledge_base import KnowledgeBase


DEFAULT_KNOWLEDGE_BASE_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "knowledge_base"
    / "iso27001_controls.json"
)


def load_knowledge_base(
    path: Path = DEFAULT_KNOWLEDGE_BASE_PATH,
) -> KnowledgeBase:
    """Load and validate the local ISO 27001 knowledge base."""
    with path.open(encoding="utf-8") as file:
        payload = json.load(file)

    return KnowledgeBase.model_validate(payload)