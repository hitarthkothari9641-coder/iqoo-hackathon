#!/usr/bin/env bash
set -e

echo "🚀 Initializing College OS Development Environment..."

if [ ! -f .env ]; then
  echo "📄 Creating .env from .env.example..."
  cp .env.example .env
fi

if [ ! -f backend/.env ]; then
  cp .env.example backend/.env
fi

if [ ! -f admin/.env ]; then
  cp .env.example admin/.env
fi

echo "📦 Installing backend dependencies..."
cd backend && npm install && npx prisma generate && cd ..

echo "📦 Installing admin dependencies..."
cd admin && npm install && cd ..

echo "✅ Environment setup complete!"
