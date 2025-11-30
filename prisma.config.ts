import { defineConfig } from 'prisma/config'
import '@dotenvx/dotenvx/config'

const url = process.env.DATABASE_URL

// Allow dummy URL only for 'prisma generate' command which doesn't need a real DB connection
const isGenerateCommand = process.argv.includes('generate')

if (!url && !isGenerateCommand) {
  throw new Error('DATABASE_URL is not defined. Please configure .env file.')
}

if (!url && isGenerateCommand) {
  // Warn user that dummy URL is being used
  console.warn('Warning: DATABASE_URL is not defined. Using dummy URL for generation only.')
}

export default defineConfig({
  datasource: {
    url: url || 'postgresql://dummy:dummy@localhost:5439/dummy'
  },
  migrations: {
    seed: `node --import @swc-node/register/esm-register prisma/seed/index.ts`
  }
})
