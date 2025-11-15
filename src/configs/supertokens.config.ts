import type { TypeInput } from 'supertokens-node/types'
import supertokens from 'supertokens-node'
import EmailPassword from 'supertokens-node/recipe/emailpassword'
import Session from 'supertokens-node/recipe/session'
import UserRoles from 'supertokens-node/recipe/userroles'

let initialized = false

function buildSuperTokensConfig(): TypeInput {
  const isProd = process.env.NODE_ENV === 'production'

  return {
    framework: 'express',
    supertokens: {
      connectionURI: process.env.SUPERTOKENS_CONNECTION_URI || 'http://supertokens-auth:3567'
    },
    appInfo: {
      appName: 'eventdev-server',
      apiDomain: isProd ? 'https://api.eventdev.org' : 'http://localhost:5122',
      websiteDomain: isProd ? 'https://eventdev.org' : 'http://localhost:3000',
      apiBasePath: '/api/v1/auth',
      websiteBasePath: '/auth'
    },
    recipeList: [EmailPassword.init(), Session.init(), UserRoles.init()]
  }
}

export function ensureSuperTokensInitialized() {
  if (initialized) {
    return
  }

  supertokens.init(buildSuperTokensConfig())
  initialized = true
}
