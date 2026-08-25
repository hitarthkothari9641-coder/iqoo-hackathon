# 🎯 Attribute-Based Access Control (ABAC) & Scope Resolution

## Permission Scopes
- **`SELF`**: Operates strictly on resources owned by `user.id`.
- **`DEPARTMENT`**: Operates on resources matching `user.departmentId`.
- **`INSTITUTION`**: Operates on resources matching `userContext.institutionId`.
- **`PLATFORM`**: Platform-wide execution (Super Admin only).
