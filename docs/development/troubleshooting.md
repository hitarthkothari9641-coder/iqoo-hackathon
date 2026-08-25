# 🔍 Troubleshooting Guide

## Common Issues & Solutions

### 1. PostgreSQL Connection Failed
- **Error**: `PrismaClientInitializationError: Can't reach database server`
- **Solution**: Ensure Docker is running and run `docker-compose up -d postgres`. Check credentials in `.env` match `docker-compose.yml`.

### 2. Android Keystore Signing Error
- **Error**: `Keystore file not found`
- **Solution**: Ensure `signingConfigs` in `android/app/build.gradle.kts` uses default `getByName("debug")`.

### 3. Redis Fallback Mode
- **Log**: `Redis client failed to connect...`
- **Behavior**: In development, if `REDIS_REQUIRED=false`, the backend gracefully operates with in-memory fallback.
