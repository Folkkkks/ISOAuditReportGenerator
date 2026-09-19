# v1.0.0 Demo Day validation

Date: 2026-09-19

## Completed checks

| Check | Result |
| --- | ---: |
| Python compile | Passed |
| Backend unit/API tests | 38 / 38 passed |
| Frontend logic/PDF tests | 12 / 12 passed |
| Frontend production build | Passed |
| Evaluation input/Gold validation | 10 / 10 passed |
| Deterministic clause-to-Gold precheck | 10 / 10 exact pairs |
| Secrets included in release artifact | No |

## Final development evaluation

The provider-backed 10-case evaluation completed with Gemini 3.5 Flash Lite and classification rubric v2.

| Metric | Result |
| --- | ---: |
| Prediction coverage | 1.0000 |
| Classification accuracy | 1.0000 |
| Classification macro F1 | 1.0000 |
| Clause-pair accuracy | 1.0000 |
| Automated grounding score | 1.0000 |
| Released unsupported Major NC count | 0 |
| PRD threshold passed | True |

See `reports/v1.0/final_eval_report.md` for per-class and per-case details.

## Human review boundary

The full Gold reports are marked `development_reviewed`. Instructor or qualified-auditor sign-off remains external human work; use `docs/INSTRUCTOR_GOLD_REVIEW.md` and change the status only after that review occurs.
