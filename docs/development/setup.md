# 🛠️ Development Environment Setup Guide

## Prerequisites
- **Node.js**: v20+
- **JDK**: Java 17 or Java 21
- **Docker Desktop**: For running PostgreSQL and Redis containers
- **Android Studio**: Hedgehog or newer

## Quickstart (Unix / macOS)
```bash
# 1. Clone repository
git clone https://github.com/hitarthkothari9641-coder/iqoo-hackathon.git college-os
cd college-os

# 2. Setup environment config
cp .env.example .env
cp .env.example backend/.env
cp .env.example admin/.env

# 3. Start Infrastructure
docker-compose up -d

# 4. Install & Build Backend
cd backend
npm install
npx prisma generate
npm run build
npm run start:dev
```

## Quickstart (Windows PowerShell)
```powershell
# 1. Setup environment config
Copy-Item .env.example .env
Copy-Item .env.example backend\.env
Copy-Item .env.example admin\.env

# 2. Start Infrastructure
docker-compose up -d

# 3. Run Backend
cd backend
npm install
npx prisma generate
npm run build
npm run start:dev
```
