#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import { Client } from 'pg'
import Redis from 'ioredis'

// Resolve repository root even when executed via pnpm
const rootDir = fileURLToPath(new URL('..', import.meta.url))
const envTestPath = join(rootDir, '..', '.env.test')

if (existsSync(envTestPath)) {
  config({ path: envTestPath, override: false })
}

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL is not defined. Please configure .env.test before running e2e tests.')
  process.exit(1)
}

const parsedUrl = new URL(databaseUrl)
const databaseName = parsedUrl.pathname.replace(/^\//, '')

if (!databaseName) {
  console.error('DATABASE_URL must include a database name.')
  process.exit(1)
}

const adminUrl = new URL(parsedUrl)
adminUrl.pathname = '/postgres'

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`
}

async function ensureDatabaseExists() {
  const client = new Client({ connectionString: adminUrl.toString() })
  await client.connect()

  const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName])

  if (result.rowCount === 0) {
    await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`)
    console.log(`Created database ${databaseName}`)
  }

  await client.end()
}

async function resetRateLimitStore() {
  const host = process.env.REDIS_HOST || 'localhost'
  const port = Number(process.env.REDIS_PORT) || 6379
  const db = Number(process.env.REDIS_RATE_LIMIT_DB) || 1

  const redis = new Redis({ host, port, db })

  try {
    await redis.flushdb()
    console.log(`Flushed Redis rate limit store (db ${db}) at ${host}:${port}`)
  } finally {
    await redis.quit().catch(() => {
      redis.disconnect()
    })
  }
}

async function main() {
  try {
    await ensureDatabaseExists()
    await resetRateLimitStore()

    execFileSync('pnpm', ['prisma', 'migrate', 'deploy'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: parsedUrl.toString()
      }
    })
  } catch (error) {
    console.error('Failed to prepare test database\n', error)
    process.exit(1)
  }
}

await main()
