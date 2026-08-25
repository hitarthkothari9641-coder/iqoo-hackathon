# Users Module

## Purpose
Manages user entity lifecycles, institutional roles, profile attributes, verification status, and batch directory synchronization.

## Future Responsibility
- User CRUD scoped to institutional tenant
- Role assignments and RBAC/ABAC policy binding
- Student profile (Branch, Semester, Roll Number, CGPA)
- Faculty profile (Department, Designation, Assigned Courses)
- Account deactivation, export, and compliance data requests

## Dependencies
- Database (`User`, `UserRole`, `Role`)
- Institutions Module
- Audit Logging

## Planned Phase
Phase 2 (Identity & User Management)
