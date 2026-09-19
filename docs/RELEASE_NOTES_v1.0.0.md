# ISO Audit Report Generator v1.0.0 — Demo Day

## Overview

This release delivers the Iteration 3 PRD workflow for drafting ISO/IEC 27001:2022 audit reports. It converts synthetic interview notes, checklist results, document-review notes, JSON packs, and selectable-text PDFs into structured draft reports for human auditor review.

The system does not issue certificates, make final certification decisions, or publish reports automatically.

## What changed since v0.1.0

- Added the five-stage pipeline: Evidence Normalizer, NC Classifier, Clause Mapper, Report Composer, and Evidence Judge.
- Added ISO knowledge retrieval, typed outputs, and deterministic clause/reference validation.
- Added Major NC, Minor NC, Observation, and OFI classifications.
- Added dashboard, New Audit, audit library, reports, and evaluation/control views.
- Added JSON and selectable-text PDF evidence import.
- Added Thai/English interface and report-language controls.
- Added auditor edits, review completion, and before/after history.
- Added prompt versions, prompt-builder hashes, injection controls, input bounds, PII helpers, and draft disclaimers.
- Added Markdown export and browser Print / Save as PDF.
- Added the full 10-case PRD Gold set and final development evaluation.

## Final evaluation

Model: `gemini-3.5-flash-lite`  
Prompt manifest: classification rubric `v2`  
Gold status: `development_reviewed`

| Metric | Iteration 2 | v1.0.0 final |
| --- | ---: | ---: |
| Selected cases | 10 | 10 |
| Classification accuracy | 0.8000 | 1.0000 |
| Classification macro F1 | 0.8125 | 1.0000 |
| Clause-pair accuracy | 1.0000 | 1.0000 |
| Automated grounding score | 1.0000 | 1.0000 |
| Released unsupported Major NCs | 0 | 0 |

PRD pass threshold: classification macro F1 ≥ 0.75 and zero unsupported Major NCs on the gold set.  
Result: **Passed**.

This is a small, project-authored development set rather than a held-out benchmark. Automated Judge results do not replace qualified external review.

## Guardrails

- Evidence is treated as untrusted input by the versioned safety policy.
- Unsupported reports are withheld from the public pipeline response.
- Original evidence is preserved for traceability; translations are reader aids only.
- Basic email and Thai mobile-number masking is available before submission.
- Reviewer actions record actor, reason, timestamp, revision, and before/after state.
- Every released report remains a draft requiring auditor sign-off.

## Verification evidence

- `reports/v1.0/final_eval_report.md`
- `reports/v1.0/judge_hallucination_log.md`
- `reports/v1.0/validation_report.md`
- `docs/DEMO_SCRIPT.md`
- `docs/PRD_COMPLIANCE_MATRIX.md`
- `CHANGELOG.md`

## Known boundaries

- Classroom/local application with no authenticated multi-user identity.
- SQLite evidence and history are stored locally as plaintext.
- Contact masking is best effort and does not detect every type of PII.
- PDF import requires selectable text and does not perform OCR.
- Retrieval is a lexical baseline rather than a production vector database.
- Gold reports still require instructor or qualified-auditor sign-off.
