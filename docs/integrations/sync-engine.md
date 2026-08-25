# 🔄 Synchronization Engine Specification

- **Sync Types**: `FULL_SYNC`, `INCREMENTAL_SYNC`, `ENTITY_SYNC`, `MANUAL_SYNC`, `SCHEDULED_SYNC`.
- **Idempotency**: External identity mapping via `institutionId` + `sourceSystem` + `externalId`. Re-running sync operations guarantees zero duplicate creation.
- **Resilience**: `CircuitBreakerService` transitions to `OPEN` after 5 consecutive failures, protecting both College OS and the ERP provider from cascade failures.
