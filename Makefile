.PHONY: help setup dev test lint build docker-up docker-down

help:
	@echo "College OS Development Makefile"
	@echo "  make setup       - Initial setup (.env & dependencies)"
	@echo "  make docker-up   - Start PostgreSQL and Redis via Docker"
	@echo "  make docker-down - Stop Docker infrastructure"
	@echo "  make dev-backend - Run backend NestJS in watch mode"
	@echo "  make dev-admin   - Run admin Next.js app in dev mode"
	@echo "  make test        - Run backend and Android unit tests"
	@echo "  make lint        - Run lint checks across backend and admin"

setup:
	bash scripts/setup.sh

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

dev-backend:
	cd backend && npm run start:dev

dev-admin:
	cd admin && npm run dev

test:
	cd backend && npm run test
	JAVA_HOME="/Users/cooldude69/Library/Java/JavaVirtualMachines/jbr-21.0.11/Contents/Home" ./gradlew testDebugUnitTest

lint:
	cd backend && npm run lint
	cd admin && npm run lint

build:
	cd backend && npm run build
	cd admin && npm run build
	JAVA_HOME="/Users/cooldude69/Library/Java/JavaVirtualMachines/jbr-21.0.11/Contents/Home" ./gradlew assembleDebug
