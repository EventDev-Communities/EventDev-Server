import { z } from 'zod'
import '@dotenvx/dotenvx/config'

export const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_RATE_LIMIT_DB: z.coerce.number().default(1),

  // Auth / SuperTokens
  SUPERTOKENS_CONNECTION_URI: z.string().default('http://supertokens-auth:3567'),
  SUPERTOKENS_API_KEY: z.string().optional(),
  SUPERTOKENS_APP_NAME: z.string().default('EventDev'),
  WEBSITE_DOMAIN: z.string().default('http://localhost:3000'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Feature Flags
  ENABLE_SWAGGER: z.enum(['true', 'false']).optional().transform((val) => val === 'true'),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_GLOBAL: z.coerce.number().default(100),
  RATE_LIMIT_PUBLIC: z.coerce.number().default(60),
  RATE_LIMIT_AUTH: z.coerce.number().default(5),
  RATE_LIMIT_USERS: z.coerce.number().default(120),
  RATE_LIMIT_ADMIN: z.coerce.number().default(200),
  RATE_LIMIT_ENABLED: z.string().default('true').transform((val) => val === 'true'),

  // Server
  NODE_PORT: z.coerce.number().default(5122),
  ALLOWED_ORIGINS: z.string().optional()
})

export type EnvConfig = z.infer<typeof envSchema>

let state: EnvConfig

// Try to create an initial env snapshot from process.env
const initial = envSchema.safeParse(process.env)

// In case of failure, we might want to throw or just use partial.
// Since validate() will be called by NestJS, we can be lenient here for scripts that don't use Nest.
// But for safety, let's initialize with what we have or empty object casted.
state = initial.success ? initial.data : (process.env as unknown as EnvConfig)

export function env(): EnvConfig {
  return state
}

export const isProduction = () => state.NODE_ENV === 'production'
export const isDevelopment = () => state.NODE_ENV === 'development'
export const isTest = () => state.NODE_ENV === 'test'

export function validate(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config)
  if (!result.success) {
    console.error('Invalid environment variables:', JSON.stringify(result.error.issues, null, 2))
    throw new Error('Invalid environment variables')
  }
  state = Object.freeze(result.data)
  return state
}
