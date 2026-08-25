# 🌐 API Conventions & Specifications

## Base Path
All business endpoints use version prefix: `/api/v1`

## Health Probe Endpoints
- `GET /api/v1/health`: Returns system name, version, and environment status.
- `GET /api/v1/health/live`: Returns process liveness and uptime.
- `GET /api/v1/health/ready`: Checks PostgreSQL and Redis connections. Returns HTTP 200 when ready or HTTP 503 when degraded.

## Standard Success Envelope
```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-08-25T22:50:00Z"
  }
}
```

## Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid field value"
  }
}
```
