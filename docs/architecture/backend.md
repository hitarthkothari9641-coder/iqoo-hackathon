# ⚙️ Backend Architecture (NestJS)

## Tech Stack
- **Framework**: NestJS v10 (TypeScript 5.3)
- **Database ORM**: Prisma ORM v5 (PostgreSQL 16)
- **Caching & Locks**: Redis v7 (ioredis abstraction via `CacheService`)
- **Documentation**: OpenAPI / Swagger (`/api/docs`)
- **Security**: Helmet, CORS, Throttler rate-limiting foundation

## Module Boundaries
```
src/modules/
├── auth/            # (Phase 2) Multi-tenant auth, session management, OTP, SSO
├── users/           # (Phase 2) User profiles, roles, student identity
├── institutions/    # (Phase 2) Tenant provisioning & institutional settings
├── academics/       # (Phase 3) Courses, grades, syllabus, timetables
├── attendance/      # (Phase 3) Attendance records & biometric sync
├── social/          # (Phase 4) Campus feed, student posts, moderation
├── clubs/           # (Phase 4) Student organizations & event hosting
├── messaging/       # (Phase 4) Real-time chat & notifications
├── career/          # (Phase 5) Placement drives, resumes, job applications
├── ai/              # (Phase 6) Gemini 1.5 Flash assistant & OCR processing
```
