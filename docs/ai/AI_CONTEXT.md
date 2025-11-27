# AI Context

This file contains context information for AI assistants working on this project.

## Project Overview

EventDev-Server is a NestJS backend application for managing events and communities. It uses a modern stack with strict type safety and code quality rules.

## Tech Stack

- **Framework**: NestJS v11
- **Database**: PostgreSQL (via Docker)
- **ORM**: Prisma v7 (using `@prisma/adapter-pg` with native `pg` driver)
- **Authentication**: SuperTokens (Session + EmailPassword)
- **Payments**: Mercado Pago SDK (Webhooks + API)
- **Rate Limiting**: Redis-based (Sliding Window Lua Script)
- **Package Manager**: PNPM v10
- **Language**: TypeScript v5.9
- **Build Tool**: Nest CLI with SWC builder (`"builder": "swc"` in `nest-cli.json`) for fast development and ESM compatibility.
- **Linter**: ESLint (Antfu config + SonarJS)

## Key Directories

- `src/module`: Feature modules (auth, community, event, etc.). Each module follows the Controller-Service-Repository pattern.
- `src/prisma`: Database configuration and service. `PrismaService` extends `PrismaClient` and uses the `pg` adapter.
- `src/common`: Shared utilities, guards, decorators, filters, and interceptors.
- `docs`: Documentation and API specs. `api.http` is generated from `openapi.json`.
- `tools`: Helper scripts (e.g., `generate-http.ts`).

## Development Guidelines

### Build & Runtime (ESM)

- **Strict ESM**: The project is configured as `"type": "module"`.
- **Imports**: You MUST use `import type { ... }` when importing TypeScript interfaces or types. Importing them as values will cause runtime `SyntaxError` in ESM.
- **Build**: We use `swc` via Nest CLI. Configuration is in `nest-cli.json`.

### Code Quality

- **Strict Linting**: We use `@antfu/eslint-config` with `sonarjs`. Do not disable rules unless absolutely necessary.
- **No `console.log`**: NEVER use `console.log`. Use the NestJS `Logger` service instead.
- **No `any`**: Avoid `any` at all costs. Use `unknown` or proper types.
- **No `eslint-disable`**: NEVER use `// eslint-disable`, `// eslint-disable-next-line`, `// eslint-disable-line` or similar comments to suppress linting errors. Fix the underlying issue instead.
- **Imports**:
  - **CRITICAL**: ALWAYS use aliases (`@/`, `@common/`,`@module/`, etc.) instead of relative paths (`../../`) for internal modules. This is enforced by linting rules.
  - **Sort Imports**: Keep imports sorted. This is usually handled by the linter/formatter, but ensure you don't manually disorder them.
  - Remove unused imports.
- **Clean Code**:
  - Remove dead stores (useless assignments).
  - No trailing spaces.
- **IDE Warnings**: ALWAYS check for and fix all IDE warnings and errors (red/yellow squiggles) before finishing a task. Do not ignore them.

### Database

- **Prisma 7**: We use the new adapter pattern. Do not use `datasourceUrl` in `schema.prisma` for the runtime client; it is handled in `PrismaService`.
- **Migrations**: Use `pnpm docs-generate` to update schema docs.

### Testing

- **All Tests**: Use `pnpm test-all` to run both unit and E2E tests.
- **Coverage**: Use `pnpm test-cov`. We enforce a **>90% coverage** threshold.
- **E2E Tests**: Located in `test/`. Use `pnpm test-e2e`.
- **Unit Tests**: Located alongside source files (`*.spec.ts`). Use `pnpm test`.

### API Documentation

- **OpenAPI**: Generated automatically.
- **Swagger UI**: Enabled by default only in **development** mode. Can be enabled in production via `ENABLE_SWAGGER=true`.
- **REST Client**: `docs/rest-client/api.http` is generated via `pnpm generate-http`. It uses RFC 2616 format.

## Common Tasks

- **Generate Client**: `pnpm exec prisma generate --no-hints`
- **Lint**: `pnpm lint`
- **Test**: `pnpm test-all`
- **Verify All**: `pnpm verify-all` runs lint, all tests, and build. Use this to verify the project state.
