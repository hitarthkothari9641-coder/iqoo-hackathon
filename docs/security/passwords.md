# 🔒 Password Security & Hashing Policy

## Password Hashing
- Password hashes generated using `bcrypt` with automatic salt generation (minimum cost factor 10).
- Passwords MUST NEVER be logged in application logs, audit events, or API request/response payloads.

## Reset & Verification Tokens
- Single-use, short-lived tokens stored exclusively as SHA-256 hashes (`PasswordResetToken.tokenHash`).
