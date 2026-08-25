# 🎓 COLLEGE OS — Production Multi-Tenant Campus Digital Operating System

> **Tagline**: *"Your college. Your community. Your future."*

---

## 📌 Executive Summary & Pitch (PPT Ready)

**College OS** is a secure, multi-tenant, enterprise-grade digital campus operating system designed for modern higher education institutions. It bridges the gap between official college administrative ERPs, academic management workflows, and campus social communities into a single, unified mobile and web platform.

```
                                  COLLEGE OS
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
   ACADEMIC OS                    SOCIAL OS                  ERP INTEGRATION
Attendance Projection        College-Bound Feed          Resilient Adapter Engine
  Timetable & Exams          Verified Campus Clubs       Secret Manager & Vault
Assignments & Notes          Interest Communities        Circuit Breaker Sync Engine
```

---

## 🎯 The Problem in Indian Higher Education

1. **Information Fragmentation**: Critical academic updates — exam schedules, lab slot reschedules, assignment deadlines, fee circulars, and hackathons — are scattered across dozens of unorganized WhatsApp groups, image screenshots, and notice boards.
2. **ERP Disconnect**: Legacy ERP systems are difficult for students to use on mobile devices and lack real-time engagement or proactive notifications.
3. **Manual Overhead**: Students manually calculate attendance margins ("How many classes can I skip?") and copy exam dates into personal calendars.
4. **Privacy & Security Risks**: Generic public social media networks expose students to privacy leaks, unverified impersonation, and cross-college spam.

---

## 💡 The Solution: College OS

College OS unifies the entire campus lifecycle under an authenticated institutional security context:
- **Verified Institutional Identity**: Every user belongs to an authenticated college tenant (`User` ➔ `InstitutionMembership` ➔ `StudentProfile`/`FacultyProfile`).
- **Academic OS**: Real-time attendance tracking with an intelligent **Attendance Projection Calculator** ("Classes needed to reach target %"), automated timetable synchronization, assignments publishing & grading, study planner, and personal lecture notes.
- **Social OS**: A private, college-bound social network with multi-level visibility scopes (`PRIVATE`, `CONNECTIONS`, `SECTION`, `DEPARTMENT`, `COLLEGE`, `COMMUNITY`, `CLUB`), verified student/officer badges, interest communities, official clubs, campus event registration (`GOING`/`WAITLISTED`), and direct messaging with strict block enforcement.
- **ERP Integration Platform**: Bi-directional, fault-tolerant adapter architecture connecting external college ERPs (SAP, CollPoll, Academia, Custom SQL) with automated circuit breakers, HMAC signatures, secret management, and conflict resolution.

---

## 💻 Tech Stack & Architecture

| Layer | Technologies & Frameworks |
|---|---|
| **Mobile App (Android)** | Kotlin, Jetpack Compose, Material 3, ViewModel, Coroutines, Flow, Room, Retrofit |
| **Backend API** | Node.js, NestJS, TypeScript, REST (`/api/v1`), Swagger API Specs |
| **Database & ORM** | PostgreSQL, Prisma ORM (22 domain models, 15 enums) |
| **Admin Web Console** | Next.js 14 (App Router), React, TailwindCSS, TypeScript |
| **Security & Auth** | Argon2id password hashing, JWT + SHA-256 Refresh Token Rotation with reuse attack detection, ABAC/RBAC engine |

---

## 📊 Presentation Deck Outline (12-Slide Copy-Paste PPT Guide)

### Slide 1: Title & Vision
- **Header**: COLLEGE OS — Next-Generation Digital Campus Operating System
- **Subtitle**: "Your college. Your community. Your future."
- **Presenter**: Engineering & Product Architecture Team

### Slide 2: The Core Challenge
- 85%+ of Indian college students receive critical notices as images on WhatsApp.
- Legacy ERPs lack modern mobile interfaces and real-time attendance calculation.
- Students miss assignment deadlines and exam slot changes due to noise.

### Slide 3: Product Architecture Overview
- **Core Platform**: Multi-tenant institutional identity & RBAC/ABAC engine.
- **Academic OS**: Attendance, Timetables, Assignments, Exams, Study Planner.
- **Social OS**: College-bound social network, verified clubs, campus events.
- **ERP Engine**: Adapter pattern with automated sync, circuit breaker, and HMAC security.

### Slide 4: Academic OS Capabilities
- **Attendance Calculator**: Calculates exact classes needed to achieve 85%/90% attendance or safe classes margin.
- **Timetable & Exams**: Live class schedules, lab rooms, exam countdowns, and official grade sheets.
- **Assignments & Notes**: Online submission, deadline tracking, and private markdown notes.

### Slide 5: Social OS — Private Campus Network
- Strict college tenant isolation: College A users cannot view or message College B users.
- Multi-level visibility scopes: `SECTION`, `DEPARTMENT`, `COLLEGE`, `CLUB`.
- Verified badges: Official Student USN badges, Club Officers, and Faculty Advisors.

### Slide 6: Verified Clubs & Campus Events
- Institution-recognized student clubs (Coding Club, Robotics, MUN, Cultural, E-Cell).
- Admin approval queue for club registration requests.
- Event capacity tracking with `GOING`, `INTERESTED`, and `WAITLISTED` statuses.

### Slide 7: ERP Integration Platform
- Flexible Adapter Pattern (`IntegrationAdapter`) supporting REST, GraphQL, SQL, and Webhooks.
- **Circuit Breaker Pattern**: Automatically trips after 5 consecutive failures to protect ERP servers.
- **Data Freshness Engine**: Full & incremental sync jobs with conflict resolution.

### Slide 8: Security & Multi-Tenant Isolation
- **Security Chain**: `User` ➔ `Identity` ➔ `Session` ➔ `Tenant` ➔ `Roles` ➔ `Permissions` ➔ `Authorized Action`.
- Argon2id password hashing + SHA-256 refresh token rotation with immediate family revocation on reuse detection.
- Academic OS private data (Attendance, Marks) is NEVER exposed on social profiles.

### Slide 9: Native Android UX
- Built with Jetpack Compose & Material 3 design system.
- Smooth 5-Tab Bottom Navigation (`Home`, `Academics`, `Social`, `Clubs`, `Profile`).
- Offline-first caching with Room and DataStore.

### Slide 10: Admin Web Moderation Console
- Unified Next.js web application for college administrators.
- Safety report review queue with audit-logged moderation actions (`REMOVE_CONTENT`, `WARN_USER`, `SUSPEND_USER`).
- Integration management & ERP sync health dashboard.

### Slide 11: Automated Test Suite & Quality Assurance
- **10/10 Test Suites Passed (25/25 Total Tests)**.
- Automated security specs verifying cross-college feed isolation, block privacy, token rotation, and ERP ownership.
- Zero ESLint warnings; 100% clean Next.js and Android builds.

### Slide 12: Future Expansion & Roadmap
- **Phase 6**: Campus Services (Marketplace, Lost & Found, Canteen Pre-Ordering, Transport Tracking).
- **Phase 7**: AI Academic Copilot & Automated Notice Extraction via OCR/LLM.

---

## 🛠️ Local Development & Quick Start

### Prerequisites
- Node.js >= 18.x
- Java JDK >= 21 (or JBR 21)
- Android Studio / Android SDK (API 34)
- PostgreSQL database instance

### 1. Backend API Setup
```bash
cd backend
npm install
npx prisma generate
npm run lint
npm run build
npm run test
```

### 2. Admin Web Application Setup
```bash
cd admin
npm install
npm run lint
npm run build
```

### 3. Android Mobile Application Build
```bash
cd android
./gradlew testDebugUnitTest assembleDebug
```

---

## 📄 License & Ownership
Copyright © 2026 College OS Team. All rights reserved. Confidential & Proprietary.
