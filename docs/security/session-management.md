# 📱 Device Session Management Specification

## Tracking & Revocation
- Active sessions track `deviceId`, `deviceName`, `platform`, `ipAddress`, `userAgent`, `lastUsedAt`, `createdAt`, `expiresAt`.
- Endpoints:
  - `GET /api/v1/me/sessions`: List active device sessions.
  - `DELETE /api/v1/me/sessions/:id`: Revoke individual device session.
  - `POST /api/v1/me/sessions/revoke-all`: Bulk revoke all other active sessions for user.
