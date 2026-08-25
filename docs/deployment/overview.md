# 🚀 Deployment Architecture & Overview

## Target Environments
- **Development**: Local Docker Compose + local Android emulator / device
- **Staging / Production**: Kubernetes / Container App Hosting with managed PostgreSQL (AWS RDS / GCP Cloud SQL) & ElastiCache Redis.

## Containerization
Production Dockerfiles exist for:
- `backend/Dockerfile` (Multi-stage build outputting optimized NestJS dist JS)
