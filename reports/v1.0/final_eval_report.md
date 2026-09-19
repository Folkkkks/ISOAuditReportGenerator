# ISO Audit Report Generator — v1.0.0 final development evaluation

Run: `20260916T170240Z-8372e463`  
Status: **completed**  
Model: `gemini-3.5-flash-lite`  
Prompt manifest: classification rubric `v2`  
Gold review status: **development_reviewed**  
PRD metric threshold passed: **True**

Selected 10 of 10 cases. This is a project-authored development evaluation rather than a held-out benchmark. Development-reviewed Gold labels still require qualified external sign-off. Judge scores are automated proxies, not independent confirmation of correctness or final certification compliance.

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
| classification_accuracy | 1.0000 |
| classification_macro_f1 | 1.0000 |
| clause_pair_accuracy | 1.0000 |
| automated_grounding_score | 1.0000 |
| automated_unsupported_finding_rate | 0.0000 |
| major_findings_judged | 3 |
| automated_unsupported_major_count | 0 |
| automated_unsupported_major_rate | 0.0000 |
| released_automated_unsupported_major_count | 0 |

Macro F1 averages all four classes and assigns zero when undefined. Missing outputs count as false negatives. Classification accuracy and exact clause plus requirement-ID accuracy use all selected cases as the denominator. Judge rates use judged findings; the Major rate uses judged Major findings only.

| Class | Support | TP | FP | FN | F1 |
| --- | ---: | ---: | ---: | ---: | ---: |
| major_nc | 3 | 3 | 0 | 0 | 1.0000 |
| minor_nc | 1 | 1 | 0 | 0 | 1.0000 |
| observation | 5 | 5 | 0 | 0 | 1.0000 |
| ofi | 1 | 1 | 0 | 0 | 1.0000 |

| Case | Expected | Predicted | Status |
| --- | --- | --- | --- |
| ACME-001 | minor_nc / 4.3 | minor_nc / 4.3 | awaiting_auditor_review |
| ACME-002 | observation / 5.2 | observation / 5.2 | awaiting_auditor_review |
| ACME-003 | observation / 5.3 | observation / 5.3 | awaiting_auditor_review |
| ACME-004 | major_nc / 6.1.2 | major_nc / 6.1.2 | awaiting_auditor_review |
| ACME-005 | major_nc / 6.1.3 | major_nc / 6.1.3 | awaiting_auditor_review |
| ACME-006 | major_nc / 6.2 | major_nc / 6.2 | awaiting_auditor_review |
| ACME-007 | observation / 7.2 | observation / 7.2 | awaiting_auditor_review |
| ACME-008 | observation / 7.3 | observation / 7.3 | awaiting_auditor_review |
| ACME-009 | ofi / 7.5.3 | ofi / 7.5.3 | awaiting_auditor_review |
| ACME-010 | observation / 9.2.2 | observation / 9.2.2 | awaiting_auditor_review |

Full Gold reports are separately authored references. Narrative quality and corrective-action wording are not scored by these classification and clause metrics.
