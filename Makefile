.PHONY: help \
	clean reset-dev reset-prod \
	install test test-e2e test-e2e-debug lint format docs-generate start-dev \
	dev-up dev-down dev-logs dev-shell \
	db-migrate db-seed db-studio db-reset \
	setup-dev setup-prod create-networks prepare-test-db test-deps-up test-deps-down \
	check-env check-dns status health health-https \
	prod-up prod-down prod-logs prod-logs-all prod-shell \



# Default target

help:
	@echo ""
	@echo ""
	@echo ""
	@echo "    EventDev Server - Makefile Commands"
	@echo "    ==================================="
	@echo ""
	@echo "    Usage:"
	@echo "      make <target> [ARGS...]"
	@echo ""
	@echo "    Common targets:"
	@echo "      dev-up        Start development environment"
	@echo "      dev-down      Stop development environment"
	@echo "      dev-logs      Follow API logs"
	@echo "      test          Run full unit test suite"
	@echo "      test-e2e      Run end-to-end tests"
	@echo "      clean         Remove containers, volumes and caches"
	@echo ""
	@echo "    Full target list:"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "      \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "    Tips:"
	@echo "      • Configure .env via make setup-dev before dev-up"
	@echo "      • Use make dev-shell for quick access to the api container"
	@echo "      • make status shows running containers"
	@echo ""
	@echo ""
	@echo ""

# ------------------------------------------------------------



# Development commands

dev-up: check-env create-networks ## Build and start the full development stack (API + dependencies)
	@echo " ✦  Starting development environment..."
	@docker compose -f docker-compose.dev.yml up --build -d
	@echo " ✓  Development environment started!"
	@echo "    API: http://localhost:5122"
	@echo "    SuperTokens: http://localhost:3567"
	@echo "    Debug port: localhost:9229"

dev-down: ## Stop the development stack and remove containers/volumes
	@echo " ✦  Stopping development environment..."
	@docker compose -f docker-compose.dev.yml down -v --remove-orphans
	@echo " ✓  Development environment stopped!"

dev-logs: ## Tail the API logs from the development stack (Ctrl+C to exit)
	@echo " ✦  Showing development logs (Press Ctrl+C to exit)..."
	@docker compose -f docker-compose.dev.yml logs -f api

dev-shell: ## Open an interactive shell inside the development API container
	@docker compose -f docker-compose.dev.yml exec api sh

# ------------------------------------------------------------



# Test dependencies helpers

test-deps-up: create-networks ## Start only Postgres/Redis/SuperTokens for local testing without the API
	@echo " ✦  Starting test dependencies..."
	@docker compose -f docker-compose.dev.yml up -d postgres-db redis-cache supertokens-auth
	@echo " ✓  Test dependencies ready."

test-deps-down: ## Stop and remove the standalone Postgres/Redis/SuperTokens containers used for tests
	@echo " ✦  Stopping test dependencies..."
	@docker compose -f docker-compose.dev.yml stop postgres-db redis-cache supertokens-auth 2>/dev/null || true
	@docker compose -f docker-compose.dev.yml rm -f postgres-db redis-cache supertokens-auth 2>/dev/null || true
	@echo " ✓  Test dependencies stopped."

# ------------------------------------------------------------



# Production commands

prod-up: check-env create-networks ## Build and start the production stack defined in docker-compose.prod.yml
	@echo " ✦  Starting production environment..."
	@echo "    Step 1: Starting application services..."
	@docker compose -f docker-compose.prod.yml up --build -d --remove-orphans
	@echo "    Step 2: Waiting for services to be ready..."
	@sleep 30
	@echo " ✓  Production environment started!"
	@echo "    HTTPS: https://api.eventdev.org"
	@echo "    HTTP: http://api.eventdev.org (redirects to HTTPS)"

prod-down: ## Stop the production stack and remove orphan containers
	@echo " ✦  Stopping production environment..."
	@docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
	@echo " ✓  Production environment stopped!"

prod-logs: ## Tail only the API logs from the production stack (Ctrl+C to exit)
	@echo " ✦  Showing production logs (Press Ctrl+C to exit)..."
	@docker compose -f docker-compose.prod.yml logs -f api

prod-logs-all: ## Tail logs from every production container simultaneously
	@echo " ✦  Showing all container logs (Press Ctrl+C to exit)..."
	@docker compose -f docker-compose.prod.yml logs -f

prod-shell: ## Open an interactive shell inside the production API container
	@docker compose -f docker-compose.prod.yml exec api sh

# ------------------------------------------------------------



# Utility commands

create-networks: ## Ensure the shared dev/prod Docker networks exist
	@echo " ✦  Checking and creating networks if needed..."
	@if ! docker network ls | grep -q eventdev-dev-network; then \
		echo "    Creating eventdev-dev-network..."; \
		docker network create eventdev-dev-network; \
	else \
		echo "    eventdev-dev-network already exists"; \
	fi
	@if ! docker network ls | grep -q eventdev-prod-network; then \
		echo "    Creating eventdev-prod-network..."; \
		docker network create eventdev-prod-network; \
	else \
		echo "    eventdev-prod-network already exists"; \
	fi

check-dns: ## Resolve api.eventdev.org and display DNS information
	@echo " ✦  Checking DNS configuration for api.eventdev.org..."
	@if nslookup api.eventdev.org >/dev/null 2>&1; then \
		echo " ✓  DNS is configured for api.eventdev.org"; \
		nslookup api.eventdev.org | grep -A2 "Name:" || true; \
	else \
		echo " ⚠  DNS not configured or not propagated yet"; \
		echo "    Make sure api.eventdev.org points to your server IP"; \
	fi

health: ## Curl http://localhost:5122/health to verify the local API
	@echo " ✦  Checking API health..."
	@curl -f http://localhost:5122/health && echo "✓  API is healthy!" || echo "⚠  API is not responding"

health-https: ## Curl https://api.eventdev.org/health (ignoring cert issues) to verify remote API
	@echo " ✦  Checking HTTPS API health..."
	@curl -k --fail https://api.eventdev.org/health && echo "✓  HTTPS API is healthy!" || echo "⚠  HTTPS API is not responding"

clean: ## Tear down all compose stacks and prune Docker containers/images/volumes
	@echo " ✦  Cleaning containers and volumes..."
	@docker compose -f docker-compose.dev.yml down -v --remove-orphans 2>/dev/null || true
	@docker compose -f docker-compose.prod.yml down -v --remove-orphans 2>/dev/null || true
	@docker system prune -af
	@docker volume prune -f
	@echo " ✓  Cleanup completed!"

reset-dev: dev-down clean dev-up ## Fully recreate the development environment (destructive)

reset-prod: prod-down clean prod-up ## Fully recreate the production environment (use with caution)

# ------------------------------------------------------------



# Database commands

db-migrate: ## Run `prisma migrate deploy` inside the dev API container
	@echo " ✦  Running database migrations..."
	@docker compose -f docker-compose.dev.yml exec api pnpm exec prisma migrate deploy

db-seed: ## Execute `prisma db seed` inside the dev API container
	@echo " ✦  Seeding database..."
	@docker compose -f docker-compose.dev.yml exec api pnpm exec prisma db seed

db-studio: ## Launch Prisma Studio via the dev API container
	@echo " ✦  Opening Prisma Studio..."
	@docker compose -f docker-compose.dev.yml exec api pnpm exec prisma studio

db-reset: ## Run `prisma migrate reset --force` against the dev database
	@echo " ✦  Resetting development database..."
	@docker compose -f docker-compose.dev.yml exec api pnpm exec prisma migrate reset --force

# ------------------------------------------------------------



# Development utilities

install: ## Run `pnpm install` inside the dev API container
	@echo " ✦  Installing dependencies..."
	@docker compose -f docker-compose.dev.yml exec api pnpm install

verify-all: ## Run full verification (lint, tests, build) inside the dev container
	@echo " ✦  Running full verification..."
	@docker compose -f docker-compose.dev.yml exec api pnpm verify-all

test: ## Execute the unit test suite (pnpm test) inside the dev container
	@echo " ✦  Running tests..."
	@docker compose -f docker-compose.dev.yml exec api pnpm test

test-e2e: ## Execute the Jest e2e suite inside the dev container
	@echo " ✦  Running e2e tests..."
	@docker compose -f docker-compose.dev.yml exec api pnpm test-e2e

test-e2e-debug: ## Run the e2e suite with --detectOpenHandles for debugging leaks
	@echo " ✦  Running e2e tests (debug)..."
	@docker compose -f docker-compose.dev.yml exec api pnpm test-e2e-debug

prepare-test-db: ## Provision local Postgres/Redis for tests via pnpm prepare-test-db (outside Docker)
	@echo " ✦  Preparing local test database..."
	@pnpm prepare-test-db

lint: ## Run ESLint with the repo config inside the dev container
	@echo " ✦  Running linter..."
	@docker compose -f docker-compose.dev.yml exec api pnpm lint

format: ## Run ESLint with --fix to format the codebase
	@echo " ✦  Formatting code..."
	@docker compose -f docker-compose.dev.yml exec api pnpm format

docs-generate: ## Generate docs/schema.sql via Prisma diff (writes to docs/)
	@echo " ✦  Generating schema documentation..."
	@pnpm docs-generate

start-dev: ## Run the NestJS server locally using tsx watch (no Docker)
	@echo " ✦  Starting local NestJS server..."
	@pnpm start-dev

# ------------------------------------------------------------



# Environment setup

setup-dev: ## Copy .env.dev.example to .env for local development
	@echo " ✦  Setting up development environment..."
	@cp .env.dev.example .env
	@echo " ✓  .env file created from .env.dev.example"
	@echo "    Please review and update .env file before running 'make dev-up'"

setup-prod: ## Copy .env.prod.example to .env for production deployments
	@echo " ✦  Setting up production environment..."
	@cp .env.prod.example .env
	@echo " ✓  .env file created from .env.prod.example"
	@echo "    IMPORTANT: Update passwords and security settings in .env before running 'make prod-up'"

check-env: ## Ensure .env exists before running Docker-based targets
	@if [ ! -f .env ]; then \
		echo " ⚠  .env file not found!"; \
		echo "    Run 'make setup-dev' or 'make setup-prod' to create it"; \
		exit 1; \
	fi

# ------------------------------------------------------------



# Monitoring

status: ## Display docker compose ps for both dev and prod stacks
	@echo " ✦  Development containers:"
	@docker compose -f docker-compose.dev.yml ps 2>/dev/null || echo "Development environment not running"
	@echo ""
	@echo " ✦  Production containers:"
	@docker compose -f docker-compose.prod.yml ps 2>/dev/null || echo "Production environment not running"
