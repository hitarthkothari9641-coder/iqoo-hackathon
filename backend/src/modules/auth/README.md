# Auth Module

## Purpose
Handles identity verification, multi-factor authentication (MFA), password hashing, OTP delivery, OAuth/SSO integration, and secure token issuance.

## Future Responsibility
- Email/Password login with bcrypt/argon2 hashing
- Magic link & SMS/Email OTP verification
- Google Workspace & SAML SSO federated authentication
- Access token (JWT) and Refresh token issuance & rotation
- Device session registration, heartbeat, and revocation

## Dependencies
- Database (`User`, `Session`, `UserRole`)
- Cache (`CacheService` for rate-limiting, OTP validation tokens)
- Event Bus (`UserAuthenticatedEvent`, `PasswordResetRequestedEvent`)

## Planned Phase
Phase 2 (Identity & Authentication)
