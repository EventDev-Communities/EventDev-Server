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
      // eslint-disable-next-line no-console
      console.error(`[ERROR] ${message}`, data ?? '')
    }
  },
  warn: (message: string, data?: unknown) => {
    if (currentLevel >= levels.warn) {
      // eslint-disable-next-line no-console
      console.log(`[WARN] ${message}`, data ?? '')
    }
  },
  info: (message: string, data?: unknown) => {
    if (currentLevel >= levels.info) {
      // eslint-disable-next-line no-console
      console.log(`[INFO] ${message}`, data ?? '')
    }
  },
  debug: (message: string, data?: unknown) => {
    if (currentLevel >= levels.debug) {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] ${message}`, data ?? '')
    }
  }
}
