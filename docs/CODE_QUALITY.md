# Code quality and API design notes

## Separation of responsibilities

### Backend

| Layer | Responsibility |
| --- | --- |
| `backend/app.py`, `backend/review_api.py` | HTTP routing, validation boundaries, and status codes |
| `backend/models/` | Typed Pydantic contracts for requests, reports, classifications, mappings, and judgments |
| `backend/agents/` | Evidence normalization, classification, mapping, composition, and judging |
| `backend/services/` | Orchestration, retrieval, persistence, prompt registry, provider errors, pacing, and metrics |
| `backend/evaluate.py` | Reproducible Gold-set evaluation and report generation |

### Frontend

| Module | Responsibility |
| --- | --- |
| `main.js` | Application routing, Dashboard/New Audit orchestration, and report rendering |
| `api.js` | Safe HTTP request wrapper and saved-audit generation flow |
| `audit-list.js` | Audit-table rendering, search, and status filters |
| `evaluation.js` | Release metrics and live Judge Block Demo |
| `ui.js` | Shared layout, navigation, labels, and date/status formatting |
| `evidence.js` | Evidence-pack validation, escaping, and optional contact masking |
| `pdf.js`, `pdf-evidence.js` | Browser-side selectable-text extraction and evidence conversion |
| `review.js` | Auditor edits, review completion, and change-history UI |
| `report-export.js` | Markdown report export |
| `upload.js` | JSON and PDF import controls |
| `i18n.js` | Independent English/Thai interface localization |

## API design decisions

- Pydantic validates request and response structures at the API boundary.
- Resource-oriented routes separate evidence creation, generation, retrieval, finding edits, review completion, and evaluation.
- `404` is used for missing audit resources, `409` for stale revisions or invalid workflow state, `422` for invalid input, and sanitized `503` responses for provider availability failures.
- Saved-audit edits use a revision number to prevent silent overwrites from stale browser tabs.
- Unsupported drafts keep diagnostic judgment data but expose no public report body.
- Provider exceptions are translated into safe client messages rather than returning raw provider details.

## Automated quality controls

- Python compilation and 38 Backend unit/API tests.
- 12 Frontend logic and PDF integration tests.
- Frontend syntax check and production build.
- 10/10 input/Gold schema validation and exact clause-pair precheck.
- GitHub Actions repeats the offline checks for pushes and pull requests.
- Timestamped raw evaluation output is ignored; stable reviewed reports are committed under `reports/`.

## Deliberate limitations

- This is a local classroom application without authentication or role-based access control.
- SQLite stores local evidence in plaintext; synthetic or de-identified data should be used.
- Contact masking is best effort, PDF extraction does not include OCR, and lexical retrieval is a baseline rather than a production vector service.
- `main.js` retains the stateful New Audit and report-view orchestration to avoid changing validated behavior immediately before release. Lower-dependency UI, evaluation, list, and export responsibilities have been extracted into focused modules.
