# 🏢 Multi-Tenancy Security Specification

## Multi-Tenant Isolation Rule
1. Every institutional data record contains a non-null `institutionId` foreign key referencing the `Institution` model.
2. Client-provided `institutionId` parameters in HTTP bodies or query strings MUST NEVER be trusted for authorization.
3. The backend resolves `institutionId` strictly from the authenticated JWT session or validated domain context.
4. Database queries MUST include `where: { institutionId: tenantContext.institutionId }` filters across all repositories.
