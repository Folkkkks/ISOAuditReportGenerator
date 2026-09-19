# Instructor / qualified reviewer Gold-label sign-off

The 10 full Gold `AuditReport` objects are technically complete and project-reviewed. They must not be described as instructor-approved until a qualified reviewer records a decision below.

| Case | Proposed classification | Clause | Decision | Reviewer / initials | Date | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| ACME-001 | minor_nc | 4.3 | Pending |  |  |  |
| ACME-002 | observation | 5.2 | Pending |  |  |  |
| ACME-003 | observation | 5.3 | Pending |  |  |  |
| ACME-004 | major_nc | 6.1.2 | Pending |  |  |  |
| ACME-005 | major_nc | 6.1.3 | Pending |  |  |  |
| ACME-006 | major_nc | 6.2 | Pending |  |  |  |
| ACME-007 | observation | 7.2 | Pending |  |  |  |
| ACME-008 | observation | 7.3 | Pending |  |  |  |
| ACME-009 | ofi | 7.5.3 | Pending |  |  |  |
| ACME-010 | observation | 9.2.2 | Pending |  |  |  |

After all rows are approved, update `review_status` in `data/evaluation/gold.json` from `development_reviewed` to `instructor_reviewed`, record the reviewer and date in `review_basis`, rerun validation and the full live evaluation, and commit the resulting report. Do not change the status merely to improve presentation claims.
