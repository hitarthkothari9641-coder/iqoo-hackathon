# 🏛️ College OS — Architecture Overview

## Mission & Tagline
> **"Your college. Your community. Your future."**

College OS is a multi-tenant digital campus operating system designed for Indian higher education institutions. It unifies ERP, academic workflows, attendance, student communities, career placements, and AI assistance into a single secure platform.

---

## 🏗️ System Overview & Core Components

```
college-os/
├── android/          # Native Android App (Kotlin, Compose, Clean Arch, M3, Room, Retrofit)
├── backend/          # Backend API Service (TypeScript, NestJS, Prisma ORM, Redis, Postgres)
├── admin/            # Administrative Web Dashboard (Next.js 14, React, Tailwind CSS)
├── packages/         # Shared Contracts, DTOs & Constants
├── infrastructure/   # Docker Compose & Infrastructure Provisioning
├── docs/             # Comprehensive Architecture & Security Specifications
└── scripts/          # Shell & PowerShell Automation Utilities
```

---

## 🔒 Key Architectural Directives

1. **Strict Multi-Tenancy**: Every data entity is scoped by `institutionId`. Cross-tenant query execution is forbidden at the database layer.
2. **Standardized API Contract**: All endpoints produce `{ success, data, meta }` on success and `{ success: false, error: { code, message } }` on error.
3. **Traceability**: Every HTTP request receives an `X-Request-Id` UUID header propagated through logs, database queries, and error payloads.
4. **Resilience**: Optional dependencies like Redis operate under fallback mode if not explicitly set to required in environment config.
