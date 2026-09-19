# Changelog

This file records the course release history. Prompt versions are tracked separately in the prompt registry and generation metadata.

## v1.0.0 — Iteration 3 Demo Day

### Product and UI

- Added a professional operations dashboard, searchable audit library, reports view, and evaluation/control view.
- Added JSON evidence import and selectable-text PDF extraction with explicit file, page, and character limits.
- Added persistent English/Thai interface controls and English/Thai report generation.
- Added original objective evidence plus a Thai reader-aid translation; only the original evidence is authoritative for grounding.
- Added auditor edits, optimistic revision checks, before/after change history, and explicit review completion.
- Added Markdown export and browser Print / Save as PDF.
- Split shared UI, audit-list, evaluation, and report-export responsibilities out of the main frontend entry point.

### PRD architecture

- Added source-aware Evidence Normalization while preserving exact raw evidence.
- Separated NC classification, deterministic Clause Mapping, Report Composition, and Evidence Judging into explicit stages.
- Added 10 messy Acme Corp cases containing interview, checklist, and document-review evidence.
- Added 10 separately authored full Gold `AuditReport` objects with `development_reviewed` status.
- Added report templates, a tone guide, a knowledge-base manifest, and the one-click `POST /demo/judge-block` route.

### Prompt and security controls

- Added the versioned `safety-v1` policy and classification rubric v2.
- Added prompt-builder SHA-256 hashes to generation metadata.
- Added untrusted-evidence instructions, safe HTML rendering, input bounds, provider-error handling, and request pacing.
- Added optional best-effort masking for email addresses and common Thai mobile numbers.
- Added a mandatory draft disclaimer and a Judge gate that withholds unsupported reports.
- Added injection, blocked-report, PII helper, and unsupported-major regression coverage.

### Final development evaluation

- Evaluated all 10 Gold-set cases with Gemini 3.5 Flash Lite and classification rubric v2.
- Classification accuracy: `1.0000`.
- Classification macro F1: `1.0000`.
- Clause-pair accuracy: `1.0000`.
- Automated grounding score: `1.0000`.
- Released unsupported Major NC count: `0`.
- PRD threshold passed.

Gold reports are project-authored and development-reviewed. Instructor or qualified-auditor sign-off remains external human work.

## v0.2.0 — Iteration 2 AI Core

- Added the local ISO knowledge base, lexical retrieval, classifier specialist routing, structured Gemini calls, Report Composer, and Evidence Judge.
- Added resumable full-set evaluation and classification, clause, grounding, and unsupported-finding metrics.
- Development classification macro F1: `0.8125` on 10 authored Gold cases.
- Clause-pair accuracy: `1.0000`; released unsupported Major NC count: `0`.

## v0.1.0 — Iteration 1 Walking Skeleton

- Added Pydantic report and evidence schemas.
- Added the FastAPI skeleton and sample structured request/response.
- Added the initial architecture, project structure, setup instructions, and release documentation.
