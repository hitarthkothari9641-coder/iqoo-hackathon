# 🔑 Academic OS RBAC & Permissions Reference

| Role | Academic Capabilities | Restricted Operations |
|---|---|---|
| **STUDENT** | View own dashboard, timetable, subjects, attendance, results, assignments. Create personal notes, study tasks, and submit assignments. | Cannot modify official ERP attendance/results or access peer data. |
| **FACULTY** | View assigned teaching subjects/sections, create & publish assignments, grade submissions, publish course resources, publish announcements. | Cannot modify ERP official records or access unassigned subjects/departments. |
| **HOD** | View department-wide attendance, faculty workload, subject performance, and department analytics. | Cannot access unassigned departments. |
| **ACADEMIC_COORDINATOR** | Manage academic calendar events (`CLASS`, `EXAM`, `HOLIDAY`), course resources, announcements, and institution policies. | Cannot bypass tenant isolation. |
| **COLLEGE_ADMIN** | Full institutional academic configuration, department/program management, policy configuration, and integration oversight. | Cannot access other institutions (Multi-Tenant Isolation). |
