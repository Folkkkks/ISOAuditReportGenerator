# Iteration 2 evaluation

Run: 20260910T184439Z-619f5ef6; status: completed

Gold review status: **draft**

Selected 10 of 10 cases.

Development evaluation; these cases are not a held-out benchmark.

Classification and clause scores compare predictions against authored gold labels. Draft gold labels require human review. Judge scores are automated proxies, not independent confirmation of correctness or final PRD compliance.

| Metric | Value |
| --- | ---: |
| selected_cases | 10 |
| predicted_cases | 10 |
| judged_cases | 10 |
| error_cases | 0 |
| pending_cases | 0 |
| interrupted_cases | 0 |
| blocked_cases | 0 |
| prediction_coverage | 1.0000 |
| classification_accuracy | 0.8000 |
| classification_macro_f1 | 0.8125 |
| clause_pair_accuracy | 1.0000 |
| automated_grounding_score | 1.0000 |
| automated_unsupported_finding_rate | 0.0000 |
| major_findings_judged | 3 |
| automated_unsupported_major_count | 0 |
| automated_unsupported_major_rate | 0.0000 |
| released_automated_unsupported_major_count | 0 |

Macro F1 averages all four classes (zero when undefined). Missing outputs count as false negatives. Classification accuracy and exact clause + requirement ID accuracy use all selected cases as denominator. Judge rates use only judged findings; major rate uses only judged major findings.

Blocked drafts remain in evaluation and results.json for diagnostics. The public pipeline response still hides blocked reports. A pipeline exception has no scored prediction, even if an intermediate draft existed.

| Class | Support | TP | FP | FN | F1 |
| --- | ---: | ---: | ---: | ---: | ---: |
| major_nc | 3 | 3 | 0 | 0 | 1.0000 |
| minor_nc | 1 | 1 | 2 | 0 | 0.5000 |
| observation | 5 | 3 | 0 | 2 | 0.7500 |
| ofi | 1 | 1 | 0 | 0 | 1.0000 |

| Case | Expected | Predicted | Status |
| --- | --- | --- | --- |
| GAP-001 | minor_nc / 4.3 | minor_nc / 4.3 | awaiting_auditor_review |
| GAP-002 | observation / 5.2 | observation / 5.2 | awaiting_auditor_review |
| GAP-003 | observation / 5.3 | observation / 5.3 | awaiting_auditor_review |
| GAP-004 | major_nc / 6.1.2 | major_nc / 6.1.2 | awaiting_auditor_review |
| GAP-005 | major_nc / 6.1.3 | major_nc / 6.1.3 | awaiting_auditor_review |
| GAP-006 | major_nc / 6.2 | major_nc / 6.2 | awaiting_auditor_review |
| GAP-007 | observation / 7.2 | minor_nc / 7.2 | awaiting_auditor_review |
| GAP-008 | observation / 7.3 | observation / 7.3 | awaiting_auditor_review |
| GAP-009 | ofi / 7.5.3 | ofi / 7.5.3 | awaiting_auditor_review |
| GAP-010 | observation / 9.2.2 | minor_nc / 9.2.2 | awaiting_auditor_review |

Source provenance, annotation notes, hashes, timings and error types are in results.json. Reference report summaries are templates; narrative quality and corrective actions are not scored.
