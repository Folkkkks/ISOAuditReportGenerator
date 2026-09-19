"""Local SQLite draft storage. No credentials, provider errors or raw prompts."""

import json
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4


@contextmanager
def connect():
    default = Path(__file__).resolve().parents[2] / "reports/local/audits.sqlite3"
    path = Path(os.getenv("AUDIT_DB_PATH", str(default)))
    path.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(path, timeout=10)
    try:
        db.row_factory = sqlite3.Row
        db.execute("CREATE TABLE IF NOT EXISTS drafts (id TEXT PRIMARY KEY, payload TEXT NOT NULL)")
        db.execute("CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, audit_id TEXT, payload TEXT)")
        with db:
            yield db
    finally:
        db.close()


def now():
    return datetime.now(timezone.utc).isoformat()


def create(request):
    record = {"audit_id": str(uuid4()), "created_at": now(), "revision": 0,
              "status": "ingested", "input": request, "response": None}
    with connect() as db:
        db.execute("INSERT INTO drafts VALUES (?, ?)", (record["audit_id"], json.dumps(record)))
    return record


def get(audit_id):
    with connect() as db:
        row = db.execute("SELECT payload FROM drafts WHERE id=?", (audit_id,)).fetchone()
    if row is None:
        raise KeyError(audit_id)
    return json.loads(row[0])


def list_drafts():
    with connect() as db:
        records = [json.loads(row[0]) for row in db.execute("SELECT payload FROM drafts ORDER BY rowid DESC LIMIT 100")]
    summaries = []
    for record in records:
        response = record.get("response") or {}
        report = response.get("report") or {}
        counts = {name: 0 for name in ("major_nc", "minor_nc", "observation", "ofi")}
        for finding in report.get("findings", []):
            classification = finding.get("classification")
            if classification in counts:
                counts[classification] += 1
        summaries.append({
            "audit_id": record["audit_id"],
            "org_name": record["input"]["org_name"],
            "audit_date": record["input"].get("audit_date"),
            "standard": record["input"].get("standard"),
            "report_language": record["input"].get("report_language", "en"),
            "status": record["status"],
            "created_at": record["created_at"],
            "revision": record["revision"],
            "reviewed_at": record.get("reviewed_at"),
            "reviewed_by": record.get("reviewed_by"),
            "has_report": bool(report),
            "report_grounded": (response.get("judgment") or {}).get("report_grounded"),
            "finding_total": sum(counts.values()),
            "finding_counts": counts,
        })
    return summaries


def update(audit_id, revision, mutate, actor, reason):
    """Atomic optimistic revision check and append-only application audit event."""
    with connect() as db:
        db.execute("BEGIN IMMEDIATE")
        row = db.execute("SELECT payload FROM drafts WHERE id=?", (audit_id,)).fetchone()
        if row is None:
            raise KeyError(audit_id)
        record = json.loads(row[0])
        if record["revision"] != revision:
            raise ValueError("Revision conflict: reload the report before editing.")
        before = json.loads(row[0])
        mutate(record)
        record["revision"] += 1
        event = {"at": now(), "actor": actor, "reason": reason,
                 "before": before, "after": record}
        db.execute("UPDATE drafts SET payload=? WHERE id=?", (json.dumps(record), audit_id))
        db.execute("INSERT INTO events(audit_id,payload) VALUES (?,?)", (audit_id, json.dumps(event)))
    return record


def events(audit_id):
    get(audit_id)
    with connect() as db:
        return [json.loads(row[0]) for row in db.execute(
            "SELECT payload FROM events WHERE audit_id=? ORDER BY id", (audit_id,))]
