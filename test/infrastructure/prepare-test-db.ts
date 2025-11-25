import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { config } from '@dotenvx/dotenvx'
import Redis from 'ioredis'
import { Client } from 'pg'

// Resolve repository root
const rootDir = process.cwd()
const envTestPath = join(rootDir, 'test', '.env.test')

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

if (!/^[\w-]+$/.test(databaseName)) {
  console.error('Invalid database name. Only alphanumeric characters, underscores, and hyphens are allowed.')
  process.exit(1)
}

if (!databaseName) {
  console.error('DATABASE_URL must include a database name.')
  process.exit(1)
}

const adminUrl = new URL(parsedUrl.toString())
adminUrl.pathname = '/postgres'

function quoteIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`
}

function log(message: string) {
  process.stdout.write(`${message}\n`)
}

async function ensureDatabaseExists() {
  const client = new Client({ connectionString: adminUrl.toString() })
  await client.connect()

  const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName])

  if (result.rowCount === 0) {
    // CREATE DATABASE cannot use parameters for the database name.
    // The name is validated by regex and quoted to prevent injection.
    const createDbQuery = `CREATE DATABASE ${quoteIdentifier(databaseName)}`
    await client.query(createDbQuery)
    log(`Created database ${databaseName}`)
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
    log(`Flushed Redis rate limit store (db ${db}) at ${host}:${port}`)
  } finally {
    await redis.quit().catch((err) => {
      console.error('Error quitting redis (this is expected if connection was already closed or failed):', err)
      redis.disconnect()
    })
  }
}

async function main() {
  try {
    await ensureDatabaseExists()
    await resetRateLimitStore()

    // eslint-disable-next-line sonarjs/no-os-command-from-path
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

void main()
