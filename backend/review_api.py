"""Local single-user reviewer API. Never claims verified reviewer identity."""

from fastapi import APIRouter, HTTPException
from threading import Lock
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

from backend.models.report_composition import ReportComposeRequest
from backend.models.schemas import AuditFinding
from backend.services import report_store as store
from backend.services.pipeline import run_report_pipeline
from backend.services.provider_errors import call_ai_safely
from backend.services.prompt_registry import manifest
from backend.agents.nc_classifier import DEFAULT_MODEL

router = APIRouter(prefix="/audits", tags=["Draft review"])
generation_lock = Lock()


def read(audit_id):
    try:
        return store.get(audit_id)
    except KeyError:
        raise HTTPException(404, "Audit not found") from None


@router.post("")
def create_audit(request: ReportComposeRequest):
    return store.create(request.model_dump(mode="json"))


@router.get("")
def list_audits():
    return store.list_drafts()


@router.get("/{audit_id}/report")
def get_report(audit_id: str):
    return read(audit_id)


@router.get("/{audit_id}/history")
def history(audit_id: str):
    read(audit_id)
    return store.events(audit_id)


@router.post("/{audit_id}/generate")
def generate(audit_id: str):
    if not generation_lock.acquire(blocking=False):
        raise HTTPException(409, "Another draft is generating. Wait before retrying.")
    try:
        return _generate(audit_id)
    finally:
        generation_lock.release()


def _generate(audit_id: str):
    record = read(audit_id)
    if record["response"] is not None:
        return record
    response = call_ai_safely(lambda: run_report_pipeline(
        ReportComposeRequest.model_validate(record["input"])))

    def mutate(item):
        item["response"] = response.model_dump(mode="json")
        item["status"] = response.status
        item["generation"] = {"model": DEFAULT_MODEL, "prompts": manifest()}

    try:
        return store.update(audit_id, record["revision"], mutate, "system", "Initial AI draft")
    except ValueError as error:
        raise HTTPException(409, str(error)) from None


class FindingEdit(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    revision: int = Field(ge=0)
    actor: str = Field(min_length=1, max_length=100)
    reason: str = Field(min_length=5, max_length=1000)
    classification: Literal["major_nc", "minor_nc", "observation", "ofi"]
    finding_statement: str = Field(min_length=1, max_length=10000)
    suggested_corrective_action: str | None = Field(default=None, max_length=10000)


class ReviewDecision(BaseModel):
    """A local review acknowledgement, not an authenticated ISO certification."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    revision: int = Field(ge=0)
    actor: str = Field(min_length=1, max_length=100)
    reason: str = Field(min_length=5, max_length=1000)
    confirmed: Literal[True]


@router.patch("/{audit_id}/findings/{finding_id}")
def edit_finding(audit_id: str, finding_id: str, request: FindingEdit):
    record = read(audit_id)
    if not record["response"] or not record["response"]["report"]:
        raise HTTPException(409, "No released draft is available for editing")

    def mutate(item):
        findings = item["response"]["report"]["findings"]
        finding = next((f for f in findings if f["finding_id"] == finding_id), None)
        if finding is None:
            raise KeyError(finding_id)
        values = {**finding, **request.model_dump(exclude={"revision", "actor", "reason"})}
        validated = AuditFinding.model_validate(values)
        finding.update(validated.model_dump(mode="json"))
        item["status"] = "edited_pending_review"
        item["judge_stale"] = True
        item["last_edited_by"] = request.actor
        item.pop("reviewed_at", None)
        item.pop("reviewed_by", None)
        item.pop("review_note", None)
        # Keep the original judge as historical evidence, never as approval of this edit.
        item["response"]["requires_auditor_review"] = True

    try:
        return store.update(audit_id, request.revision, mutate, request.actor, request.reason)
    except KeyError:
        raise HTTPException(404, "Finding not found") from None
    except ValueError:
        raise HTTPException(409, "Invalid edit or revision conflict; reload and check classification") from None


@router.post("/{audit_id}/review")
def complete_review(audit_id: str, request: ReviewDecision):
    record = read(audit_id)
    if not record.get("response") or not record["response"].get("report"):
        raise HTTPException(409, "No released draft is available for review")
    if record["status"] == "needs_revision":
        raise HTTPException(409, "A blocked draft cannot be marked as reviewed")

    def mutate(item):
        item["status"] = "auditor_reviewed"
        item["reviewed_at"] = store.now()
        item["reviewed_by"] = request.actor
        item["review_note"] = request.reason
        item.pop("last_edited_by", None)
        item["response"]["requires_auditor_review"] = False

    try:
        return store.update(
            audit_id,
            request.revision,
            mutate,
            request.actor,
            request.reason,
        )
    except ValueError:
        raise HTTPException(409, "Revision conflict; reload the report before completing review") from None
