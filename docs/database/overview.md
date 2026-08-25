# 🗄️ Database Architecture & Schema Overview

## Database Engine
- **Engine**: PostgreSQL 16
- **ORM**: Prisma ORM v5
- **Primary Keys**: UUID v4 (Non-sequential to prevent ID enumeration attacks)

## Models (Phase 1 Foundation)
- **Institution**: Tenant root model (`id`, `name`, `slug`, `domain`, `status`, `createdAt`, `updatedAt`).
- **User**: Institutional member (`id`, `institutionId`, `email`, `phone`, `firstName`, `lastName`, `status`).
- **Role**: RBAC Role definition (`id`, `institutionId`, `name`, `description`, `isSystemRole`).
- **Permission**: Granular capability string (`id`, `name`, `module`, `description`).
- **UserRole**: User to Role assignment scoped by `institutionId`.
- **Session**: Auth session & refresh token hash (`id`, `userId`, `refreshTokenHash`, `deviceId`, `expiresAt`, `revokedAt`).
- **AuditLog**: Compliance audit log (`id`, `institutionId`, `actorUserId`, `action`, `resourceType`, `resourceId`, `metadata`, `ipAddress`, `userAgent`).

## Indexing Strategy
Indexes are configured on high-traffic fields: `[institutionId]`, `[email]`, `[status]`, `[createdAt]`.
Email uniqueness is scoped per tenant: `@@unique([institutionId, email])`.
