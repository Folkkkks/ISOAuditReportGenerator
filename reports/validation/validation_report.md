# v1.4 strict-PRD validation

Date: 2026-09-16

## Completed checks

| Check | Result |
| --- | ---: |
| Python compile | Passed |
| Backend unit/API tests | 37 / 37 passed |
| Frontend logic/PDF tests | 11 / 11 passed |
| Frontend production build | Passed |
| Evaluation input/Gold validation | 10 / 10 passed |
| Deterministic clause-to-Gold precheck | 10 / 10 exact pairs |
| Secrets included in release artifact | No |

## Live model evaluation

Not completed in the packaging environment because outbound access to the Gemini provider was unavailable. Historical Iteration 3 metrics must not be presented as v1.4 results.

Run this from the project root on the presentation machine after configuring `.env`:

```powershell
.\venv\Scripts\python.exe -m backend.evaluate
```

Then open the newly created `reports/evaluation/<run-id>/eval_report.md`. The PRD threshold is classification macro F1 ≥ 0.75 and `released_automated_unsupported_major_count = 0`.

## Human review boundary

The full Gold reports are marked `development_reviewed`. Instructor or qualified-auditor sign-off is still external human work; use `docs/INSTRUCTOR_GOLD_REVIEW.md` and update the status only after that review occurs.
