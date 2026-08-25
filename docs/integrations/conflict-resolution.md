# ⚖️ Identity Conflict & Reconciliation Policy

Identity matching priority:
1. Official External Student ID / USN
2. Verified Institutional Email Address
3. Employee ID (for Faculty)

If a source record cannot be matched unambiguously, a `SyncConflict` record with status `PENDING_REVIEW` is created for administrative review.
