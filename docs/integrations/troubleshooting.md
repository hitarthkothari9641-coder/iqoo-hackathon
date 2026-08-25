# 🔍 Integration Troubleshooting & Operations Guide

## Common Operational Scenarios

### Circuit Breaker OPEN
- **Symptom**: `Integration circuit is OPEN due to previous consecutive failures.`
- **Cause**: 5 consecutive API failures occurred within 30 seconds.
- **Resolution**: Verify ERP endpoint availability, verify credentials, then retry connection test in Admin Console.

### Missing Student Mapping
- **Symptom**: Student attendance or results omitted during sync.
- **Resolution**: Ensure the student holds an active `User` record with a matching institutional email or external ID before running sync.
