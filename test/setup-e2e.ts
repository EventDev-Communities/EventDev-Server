import { join } from 'node:path'
import { ensureSuperTokensInitialized } from '@configs/supertokens.config'
import { config } from 'dotenv'

config({ path: join(__dirname, '..', '.env.test'), override: false })

ensureSuperTokensInitialized()
