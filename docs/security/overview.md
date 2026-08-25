# 🛡️ Security Architecture & Directives

## 1. Secrets Handling Policy
- **ZERO SECRETS IN REPO**: API keys, database credentials, JWT secrets, and private certificates MUST NEVER be committed to Git.
- Environments use `.env` ignored by `.gitignore`. Templates are provided in `.env.example`, `.env.development.example`, `.env.production.example`.

## 2. Global Error Safety
- Internal database stack traces or connection errors are caught by `GlobalExceptionFilter` and sanitized into generic API error responses (`INTERNAL_SERVER_ERROR`).

## 3. Input Validation
- Request DTOs are validated using `class-validator` and `class-transformer` with `whitelist: true` and `forbidNonWhitelisted: true`.
