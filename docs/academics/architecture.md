# 🎓 Academic OS Architecture Specification

## Overview
Phase 4 transforms College OS into an **Academic Operating System** by establishing a strict boundary between:
1. **ERP-Owned Official Records**: Student USN/ID, Enrollments, Official Attendance, Official Marks, Official Exam Schedules, and Official Timetables.
2. **College OS-Owned Academic Workflows**: Assignment Creation, Publishing & Submissions, Study Tasks & Goals, Personal Notes, Course Resources, Academic Announcements, and Analytics.

```
                    ┌─────────────────────┐
                    │       ERP           │
                    │ Official Records    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Integration Layer   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Academic Domain     │
                    │                     │
                    │ Students            │
                    │ Subjects            │
                    │ Attendance          │
                    │ Timetable           │
                    │ Exams               │
                    │ Results             │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        Student App       Faculty App       Admin Panel
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Academic Workflows  │
                    │                     │
                    │ Assignments         │
                    │ Study Planner       │
                    │ Resources           │
                    │ Notes               │
                    │ Notifications       │
                    └─────────────────────┘
```

## Security & Multi-Tenancy
- **Tenant Isolation**: Institution context is derived strictly from server-side JWT assertion.
- **Ownership Verification**: `.self` permissions check `resourceOwnerId === userContext.userId`.
- **Read-Only ERP Data**: Official attendance & results endpoints return HTTP 403 Forbidden on write attempts.
