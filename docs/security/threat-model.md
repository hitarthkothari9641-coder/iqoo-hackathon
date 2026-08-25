# ⚠️ Security Threat Model & Mitigations

| Threat Vector | Mitigation Mechanism |
|---|---|
| **Account Enumeration** | Generic authentication failure messages ("Invalid email or password"). |
| **Refresh Token Theft & Replay** | Cryptographic token rotation + instant family invalidation (`REFRESH_TOKEN_REUSE`). |
| **Cross-Tenant Data Leakage** | Non-null `institutionId` isolation + server-side membership authorization verification. |
| **Privilege Escalation** | Strict role assignment validation preventing non-Super Admins from assigning `SUPER_ADMIN`. |
| **IDOR Attacks** | Tenant & ownership checks (`canAccessResource`) returning 403/404 without leaking existence. |
