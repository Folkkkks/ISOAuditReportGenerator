from fastapi import FastAPI
from pydantic import BaseModel
from uuid import uuid4

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