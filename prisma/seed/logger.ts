/**
 * Simple logger for seed scripts
 * Uses console with structured output but avoids direct console.warn/error
 */

const LOG_LEVEL = process.env.LOG_LEVEL || 'info'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
}

const currentLevel = levels[LOG_LEVEL as keyof typeof levels] ?? levels.info

export const logger = {
  error: (message: string, data?: unknown) => {
    if (currentLevel >= levels.error) {
      process.stderr.write(`[ERROR] ${message} ${data ? JSON.stringify(data) : ''}\n`)
    }
  },
  warn: (message: string, data?: unknown) => {
    if (currentLevel >= levels.warn) {
      process.stdout.write(`[WARN] ${message} ${data ? JSON.stringify(data) : ''}\n`)
    }
  },
  info: (message: string, data?: unknown) => {
    if (currentLevel >= levels.info) {
      process.stdout.write(`[INFO] ${message} ${data ? JSON.stringify(data) : ''}\n`)
    }
  },
  debug: (message: string, data?: unknown) => {
    if (currentLevel >= levels.debug) {
      process.stdout.write(`[DEBUG] ${message} ${data ? JSON.stringify(data) : ''}\n`)
    }
  }
}
