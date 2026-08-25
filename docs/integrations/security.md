# 🛡️ Integration Security Specification

1. **RBAC Control**: Integration management is strictly limited to authorized administrative roles (`COLLEGE_ADMIN`, `SUPER_ADMIN`) with permissions (`integrations.create`, `integrations.sync`, `integrations.disconnect`). Students and faculty have zero access to integration settings.
2. **Tenant Isolation**: Cross-tenant access is blocked at the guard level. College A Admin cannot view or trigger sync for College B integrations.
3. **Secret Isolation**: Secret references stored in DB columns; raw credentials held in SecretManager memory.
