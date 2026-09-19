# PRD compliance matrix — v1.0.0 Demo Day

| PRD requirement | Implementation evidence | Status |
| --- | --- | --- |
| ISO/IEC 27001:2022 only | `ReportComposeRequest.standard`; local KB | Complete |
| Normalize messy notes | Source-aware `backend/agents/evidence_normalizer.py`; exact raw text retained | Complete |
| Major / Minor / Observation / OFI | `backend/agents/nc_classifier.py` and typed schema | Complete |
| Clause mapping | Separate deterministic `backend/agents/clause_mapper.py` | Complete |
| Formal findings and corrective actions | `backend/agents/report_composer.py` | Complete |
| Evidence Judge blocks unsupported drafts | `backend/agents/evidence_judge.py`; gated pipeline; `/demo/judge-block` | Complete |
| 10 messy mini packs | `data/evaluation/inputs.json`; all three PRD evidence sources | Complete |
| 10 separate full Gold reports | `data/evaluation/gold.json` | Complete (development-reviewed) |
| Classification F1, clause accuracy, grounding, unsupported rate | `backend/evaluate.py`; automated PRD threshold field | Complete |
| ≥75% F1 and zero released unsupported Major NCs | `reports/v1.0/final_eval_report.md` | Complete: 1.0000 macro F1; zero released unsupported Major NCs |
| Ingest / generate / retrieve / override / evaluate APIs | FastAPI routes in `backend/app.py` and `backend/review_api.py` | Complete |
| Human override trail | SQLite before/after events with actor, reason, and revision | Complete |
| Draft disclaimer and no auto-publish | Required report disclaimer; explicit auditor-review state | Complete |
| Untrusted evidence | Versioned safety prompt and exact-evidence validation | Complete |
| PDF/Markdown export | Selectable-text PDF ingest; print/PDF and Markdown export UI | Complete |
| No certificate issuance, scheduling, photo/video | Explicit scope and input restrictions | Complete |
| Shared KB constraint | Manifest and project summaries; no full ISO redistribution | Complete within repository; authorized source access remains external |

## Honest completion boundary

Software and repository deliverables are complete against the stated PRD, and the final provider-backed development evaluation passed the required thresholds. Instructor or qualified-auditor approval of Gold labels cannot be manufactured in code and remains external human work; use `docs/INSTRUCTOR_GOLD_REVIEW.md` for that review.
