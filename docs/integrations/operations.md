# ⚙️ Integration Operations & Monitoring Guide

## Monitoring & Metrics
- Monitor `SyncJob` execution status via `GET /api/v1/admin/integrations/:id`.
- Ensure database backups include academic tables (`attendance_records`, `results`, `timetable_entries`).
- Manage credential rotations via `POST /api/v1/admin/integrations`.
