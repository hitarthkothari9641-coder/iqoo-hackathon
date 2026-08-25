# 🔌 College ERP Integration Platform Architecture

## Overview & Layered Security Pipeline
```
External College ERP
        │
        ▼
Integration Adapter (Capability Checks & Authentication)
        │
        ▼
Normalization Layer (Standardizes Attendance, Grades & Terminology)
        │
        ▼
Validation & Tenant Verification (Server-Side Context & IDOR Protection)
        │
        ▼
Sync Engine (Batched & Idempotent Upserts)
        │
        ▼
PostgreSQL Domain Models
```

## Critical Security Directives
1. **Zero Credential Scraping**: We NEVER steal, guess, or bypass portal credentials, MFA, CAPTCHAs, or bot protections.
2. **Secret Storage**: Raw API credentials and tokens are stored in SecretManager (AWS KMS / HashiCorp Vault / Env). Database columns store only `secretRef` references.
3. **Domain Isolation**: Vendor-specific schemas are normalized before entering core domain models.
