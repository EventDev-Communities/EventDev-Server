.PHONY: help \
    clean reset-dev reset-prod \
    install test test-e2e lint format \
    dev-up dev-down dev-logs dev-shell \
    db-migrate db-seed db-studio db-reset \
    setup-dev setup-prod create-prod-network \
    check-env check-dns status health health-https \
    prod-up prod-down prod-logs prod-logs-all prod-shell \



# Default target

help:
	@echo "    EventDev Server - Makefile Commands"
	@echo "    ==================================="
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "    Examples:"
	@echo ""
	@echo "    make dev-up     # Start development environment"
	@echo "    make prod-up    # Start production environment"
	@echo "    make dev-logs   # Show development logs"
	@echo "    make clean      # Clean all containers and volumes"

# ------------------------------------------------------------



# Development commands

dev-up: check-env ## Start development environment
	@echo " ✦  Starting development environment..."
	@docker compose -f docker-compose.dev.yml up --build -d
	@echo " ✓  Development environment started!"
	@echo "    API: http://localhost:5122"
	@echo "    SuperTokens: http://localhost:3567"
	@echo "    Debug port: localhost:9229"

dev-down: ## Stop development environment
	@echo " ✦  Stopping development environment..."
	@docker compose -f docker-compose.dev.yml down -v --remove-orphans
	@echo " ✓  Development environment stopped!"

dev-logs: ## Show development logs
	@echo " ✦  Showing development logs (Press Ctrl+C to exit)..."
	@docker compose -f docker-compose.dev.yml logs -f api

dev-shell: ## Access development container shell
	@docker compose -f docker-compose.dev.yml exec api sh

# ------------------------------------------------------------



# Production commands

prod-up: check-env ## Start production environment
	@echo " ✦  Starting production environment..."
	@echo "    Step 1: Starting application services..."
	@docker compose -f docker-compose.prod.yml up --build -d --remove-orphans
	@echo "    Step 2: Waiting for services to be ready..."
	@sleep 30
	@echo " ✓  Production environment started!"
	@echo "    HTTPS: https://api.eventdev.org"
	@echo "    HTTP: http://api.eventdev.org (redirects to HTTPS)"

prod-down: ## Stop production environment
	@echo " ✦  Stopping production environment..."
	@docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
	@echo " ✓  Production environment stopped!"

prod-logs: ## Show production logs
	@echo " ✦  Showing production logs (Press Ctrl+C to exit)..."
	@docker compose -f docker-compose.prod.yml logs -f api

prod-logs-all: ## Show all production container logs
	@echo " ✦  Showing all container logs (Press Ctrl+C to exit)..."
	@docker compose -f docker-compose.prod.yml logs -f

prod-shell: ## Access production container shell
	@docker compose -f docker-compose.prod.yml exec api sh

# ------------------------------------------------------------



# Utility commands

create-prod-network: ## Create production network
	@docker network create eventdev-prod-network 2>/dev/null || true

check-dns: ## Check if DNS is properly configured
	@echo " ✦  Checking DNS configuration for api.eventdev.org..."
	@if nslookup api.eventdev.org >/dev/null 2>&1; then \
		echo " ✓  DNS is configured for api.eventdev.org"; \
		nslookup api.eventdev.org | grep -A2 "Name:" || true; \
	else \
		echo " ⚠  DNS not configured or not propagated yet"; \
		echo "    Make sure api.eventdev.org points to your server IP"; \
	fi

health: ## Check API health
	@echo " ✦  Checking API health..."
	@curl -f http://localhost:5122/health && echo "✓  API is healthy!" || echo "⚠  API is not responding"

health-https: ## Check HTTPS API health
	@echo " ✦  Checking HTTPS API health..."
	@curl -k --fail https://api.eventdev.org/health && echo "✓  HTTPS API is healthy!" || echo "⚠  HTTPS API is not responding"
	@echo "✦  Checking HTTPS API health..."
	@curl -k --fail https://api.eventdev.org/health && echo "✓  HTTPS API is healthy!" || echo "⚠  HTTPS API is not responding"

clean: ## Clean all containers, images and volumes
	@echo " ✦  Cleaning containers and volumes..."
	@docker compose -f docker-compose.dev.yml down -v --remove-orphans 2>/dev/null || true
	@docker compose -f docker-compose.prod.yml down -v --remove-orphans 2>/dev/null || true
	@docker system prune -af
	@docker volume prune -f
	@echo " ✓  Cleanup completed!"

reset-dev: dev-down clean dev-up ## Reset development environment

reset-prod: prod-down clean prod-up ## Reset production environment

# ------------------------------------------------------------



# Database commands

db-migrate: ## Run database migrations
	@echo " ✦  Running database migrations..."
	@docker compose -f docker-compose.dev.yml exec api pnpm exec prisma migrate deploy

db-seed: ## Seed database with initial data
	@echo " ✦  Seeding database..."
	@docker compose -f docker-compose.dev.yml exec api pnpm exec prisma db seed

db-studio: ## Open Prisma Studio
	@echo " ✦  Opening Prisma Studio..."
	@docker compose -f docker-compose.dev.yml exec api pnpm exec prisma studio

db-reset: ## Reset database (development only)
	@echo " ✦  Resetting development database..."
	@docker compose -f docker-compose.dev.yml exec api pnpm exec prisma migrate reset --force

# ------------------------------------------------------------



# Development utilities

install: ## Install dependencies
	@echo " ✦  Installing dependencies..."
	@docker compose -f docker-compose.dev.yml exec api pnpm install

test: ## Run tests
	@echo " ✦  Running tests..."
	@docker compose -f docker-compose.dev.yml exec api pnpm test

test-e2e: ## Run e2e tests
	@echo " ✦  Running e2e tests..."
	@docker compose -f docker-compose.dev.yml exec api pnpm test:e2e

lint: ## Run linter
	@echo " ✦  Running linter..."
	@docker compose -f docker-compose.dev.yml exec api pnpm lint

format: ## Format code
	@echo " ✦  Formatting code..."
	@docker compose -f docker-compose.dev.yml exec api pnpm format

# ------------------------------------------------------------



# Environment setup

setup-dev: ## Setup development environment
	@echo " ✦  Setting up development environment..."
	@cp .env.dev.example .env
	@echo " ✓  .env file created from .env.dev.example"
	@echo "    Please review and update .env file before running 'make dev-up'"

setup-prod: ## Setup production environment
	@echo " ✦  Setting up production environment..."
	@cp .env.prod.example .env
	@echo " ✓  .env file created from .env.prod.example"
	@echo "    IMPORTANT: Update passwords and security settings in .env before running 'make prod-up'"

check-env: ## Check if .env file exists
	@if [ ! -f .env ]; then \
		echo " ⚠  .env file not found!"; \
		echo "    Run 'make setup-dev' or 'make setup-prod' to create it"; \
		exit 1; \
	fi

# ------------------------------------------------------------



# Monitoring

status: ## Show containers status
	@echo " ✦  Development containers:"
	@docker compose -f docker-compose.dev.yml ps 2>/dev/null || echo "Development environment not running"
	@echo ""
	@echo " ✦  Production containers:"
	@docker compose -f docker-compose.prod.yml ps 2>/dev/null || echo "Production environment not running"
