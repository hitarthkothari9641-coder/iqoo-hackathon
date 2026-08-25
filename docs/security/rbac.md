# 🛡️ Role-Based Access Control (RBAC) & Scope Matrix

## Identity & Role Mapping
```
User
 └── InstitutionMembership (College A)
      ├── MembershipRole ➔ STUDENT (Permissions: profile.read.self, sessions.read.self)
      └── MembershipRole ➔ CLUB_LEADER (Permissions: events.create)
```

## System Roles & Permission Matrix
- **`STUDENT`**: `profile.read.self`, `profile.update.self`, `sessions.read.self`, `sessions.revoke.self`.
- **`FACULTY`**: Student permissions + `academics.read`.
- **`COLLEGE_ADMIN`**: Student & Faculty permissions + `users.read`, `users.update`, `memberships.read`, `roles.read`, `roles.assign`, `audit.read`.
- **`SUPER_ADMIN`**: Platform-wide capability `platform.institutions.manage`.
