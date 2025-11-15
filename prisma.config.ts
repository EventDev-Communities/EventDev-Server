import { defineConfig } from 'prisma/config'
import '@dotenvx/dotenvx/config'

export default defineConfig({
  migrations: {
    seed: `node --import tsx/esm prisma/seed/index.ts`
  }
})
