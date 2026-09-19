"""Track exact prompt-builder and safety policy hashes without storing input text."""

import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
POLICY = ROOT / "prompts" / "safety-v1.txt"
CLASSIFICATION_RUBRIC = ROOT / "prompts" / "classification-rubric-v2.txt"
BUILDERS = {"classifier": ("v4", "nc_classifier.py"),
            "composer": ("v4", "report_composer.py"),
            "judge": ("v3", "evidence_judge.py")}


def manifest():
    return {"policy_version": "safety-v1", "policy_sha256": hashlib.sha256(POLICY.read_bytes()).hexdigest(),
            "classification_rubric": {"version": "v2", "sha256": hashlib.sha256(
                CLASSIFICATION_RUBRIC.read_bytes()).hexdigest()},
            "builders": {name: {"version": version, "sha256": hashlib.sha256(
                (ROOT / "backend" / "agents" / filename).read_bytes()).hexdigest()}
                for name, (version, filename) in BUILDERS.items()}}


def protect(prompt):
    return POLICY.read_text(encoding="utf-8").strip() + "\n\n" + prompt
