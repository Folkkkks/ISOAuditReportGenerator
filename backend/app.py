import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.models.retrieval import RetrievalRequest, RetrievalResult
from backend.services.retrieval import retrieve_documents
from backend.agents.nc_classifier import classify_evidence
from backend.models.classification import (
    ClassificationRequest,
    ClassificationResult,
)
from backend.agents.report_composer import compose_report
from backend.models.report_composition import ReportComposeRequest
from backend.models.schemas import AuditReport
from backend.agents.evidence_judge import judge_report
from backend.models.evidence_judgment import (
    EvidenceJudgeRequest,
    EvidenceJudgeResponse,
)
from backend.models.pipeline import PipelineResponse
from backend.services.pipeline import run_report_pipeline
from backend.services.provider_errors import call_ai_safely
from backend.review_api import router as review_router
from backend.services import report_store as store
from pydantic import BaseModel, Field

app = FastAPI(title="ISO Audit Report Generator API", version="1.0.0")
app.include_router(review_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "ISO Audit Report Generator API is running"}


class EvaluationApiRequest(BaseModel):
    dry_run: bool = True
    limit: int | None = Field(default=None, ge=1)


@app.post("/evaluate")
def evaluate(request: EvaluationApiRequest):
    """Validate or run the development evaluation pack."""
    from backend.evaluate import run_evaluation
    try:
        return run_evaluation(limit=request.limit, dry_run=request.dry_run)
    except ValueError as error:
        raise HTTPException(422, str(error)) from None


@app.post("/audits/ingest")
def ingest_audit(request: ReportComposeRequest):
    """PRD-compatible ingest endpoint backed by the persistent review store."""
    return store.create(request.model_dump(mode="json"))

@app.post("/knowledge/search", response_model=list[RetrievalResult])
def search_knowledge(request: RetrievalRequest):
    return retrieve_documents(
        query=request.query,
        top_k=request.top_k,
    )


@app.post(
    "/findings/classify",
    response_model=ClassificationResult,
)
def classify_finding(
    request: ClassificationRequest,
):
    return call_ai_safely(
        lambda: classify_evidence(
            evidence=request.evidence,
            top_k=request.top_k,
            report_language=request.report_language,
        )
    )


@app.post("/reports/compose", response_model=AuditReport)
def compose_audit_report(request: ReportComposeRequest):
    return call_ai_safely(lambda: compose_report(request))


@app.post(
    "/reports/judge",
    response_model=EvidenceJudgeResponse,
)
def judge_audit_report(
    request: EvidenceJudgeRequest,
):
    return call_ai_safely(lambda: judge_report(request))


@app.post(
    "/demo/judge-block",
    response_model=EvidenceJudgeResponse,
)
def run_judge_block_demo():
    """Run the bundled unsupported-claim case without manual JSON entry."""
    fixture = (
        Path(__file__).resolve().parents[1]
        / "data"
        / "demo"
        / "unsupported-judge-request.json"
    )
    request = EvidenceJudgeRequest.model_validate(
        json.loads(fixture.read_text(encoding="utf-8"))
    )
    return call_ai_safely(lambda: judge_report(request))


@app.post(
    "/reports/run",
    response_model=PipelineResponse,
)
def run_audit_report(
    request: ReportComposeRequest,
):
    return call_ai_safely(lambda: run_report_pipeline(request))
