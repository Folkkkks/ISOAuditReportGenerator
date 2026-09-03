from fastapi import FastAPI
from pydantic import BaseModel
from uuid import uuid4
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

app = FastAPI(title="ISO Audit Report Generator API")

audits_db = {}


class EvidenceItem(BaseModel):
    source: str
    raw_text: str


class AuditIngestRequest(BaseModel):
    org_name: str
    standard: str = "ISO/IEC 27001:2022"
    evidence: list[EvidenceItem]


class AuditIngestResponse(BaseModel):
    audit_id: str
    org_name: str
    standard: str
    evidence: list[EvidenceItem]
    status: str


@app.get("/")
def root():
    return {"message": "ISO Audit Report Generator API is running"}


@app.post("/audits/ingest", response_model=AuditIngestResponse)
def ingest_audit(request: AuditIngestRequest):
    audit_id = str(uuid4())

    audits_db[audit_id] = {
        "audit_id": audit_id,
        "org_name": request.org_name,
        "standard": request.standard,
        "evidence": [item.model_dump() for item in request.evidence],
        "status": "ingested",
    }

    return audits_db[audit_id]

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
    return classify_evidence(
        evidence=request.evidence,
        top_k=request.top_k,
    )



@app.post("/reports/compose", response_model=AuditReport)
def compose_audit_report(request: ReportComposeRequest):
    return compose_report(request)