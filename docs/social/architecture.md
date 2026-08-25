# 📱 Social OS Architecture Specification

## Overview
Phase 5 introduces a **College-Bound Private Social Network** for College OS.

```
                    COLLEGE OS
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
   ACADEMIC OS      SOCIAL OS      COMMUNITY OS
    Phase 4         Phase 5        Future/Phase 6
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
    PROFILES          FEED           NETWORK
       │                │                │
       └────────────────┼────────────────┘
                        │
              ┌─────────┼─────────┐
              ▼         ▼         ▼
            CLUBS     EVENTS    CHAT
              │         │         │
              └─────────┼─────────┘
                        ▼
                    MODERATION
```

## Critical Security & Privacy Principles
1. **Tenant Isolation**: College A users CANNOT view, search, follow, message, join, or comment on College B content.
2. **Multi-Level Visibility Scopes**: `PRIVATE`, `CONNECTIONS`, `SECTION`, `DEPARTMENT`, `COLLEGE`, `COMMUNITY`, `CLUB`.
3. **Academic & Social Boundary**: Private academic data (Attendance, Marks, Results) is NEVER exposed on social profiles. Verified academic identity (Program, Department, Year) is populated strictly from ERP identity.
4. **Safety & Moderation**: Content reporting (`Report`), user blocking (`Block`), and audit-logged admin moderation workflow (`REMOVE_CONTENT`, `WARN_USER`, `RESTRICT_USER`, `SUSPEND_USER`).
