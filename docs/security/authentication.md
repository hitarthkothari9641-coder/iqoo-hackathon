# 🔑 Authentication Architecture & Token Specification

## Token Lifecycle & Security
1. **Access Tokens**: Short-lived JWTs (15-minute expiration) signed with `JWT_ACCESS_SECRET`. Claims contain `sub` (userId), `sessionId`, `tokenFamilyId`, and optional `institutionId`.
2. **Refresh Tokens**: Cryptographically random 64-character hex strings stored as SHA-256 hashes in PostgreSQL (`Session.refreshTokenHash`). Valid for 7 days.
3. **Refresh Token Rotation**: On every refresh request (`POST /api/v1/auth/refresh`), the used refresh token is revoked and a new refresh token is issued within the same `tokenFamilyId`.
4. **Reuse Attack Detection**: If a previously rotated or revoked refresh token is presented, the system flags a security event (`REFRESH_TOKEN_REUSE`) and automatically revokes all active sessions belonging to that `tokenFamilyId`.
