import type { TypeInput } from 'supertokens-node/types'
import { env } from '@configs/env'
import supertokens from 'supertokens-node'
import EmailPassword from 'supertokens-node/recipe/emailpassword'
import Session from 'supertokens-node/recipe/session'
import UserRoles from 'supertokens-node/recipe/userroles'

let initialized = false

function buildSuperTokensConfig(): TypeInput {
  const isProd = env().NODE_ENV === 'production'

  return {
    framework: 'express',
    supertokens: {
      connectionURI: env().SUPERTOKENS_CONNECTION_URI
    },
    appInfo: {
      appName: env().SUPERTOKENS_APP_NAME,
      apiDomain: isProd ? 'https://api.eventdev.org' : `http://localhost:${env().NODE_PORT}`,
      websiteDomain: env().WEBSITE_DOMAIN,
      apiBasePath: '/api/v1/auth',
      websiteBasePath: '/auth'
    },
    recipeList: [
      EmailPassword.init({
        override: {
          apis: (originalImplementation) => {
            return {
              ...originalImplementation,
              // Disable default signin and signup API
              signInPOST: undefined,
              signUpPOST: undefined
            }
          }
        }
      }),
      Session.init({
        cookieSecure: isProd,
        cookieSameSite: isProd ? 'none' : 'lax',
        cookieDomain: undefined,
        exposeAccessTokenToFrontendInCookieBasedAuth: true
      }),
      UserRoles.init()
    ]
  }
}

export function ensureSuperTokensInitialized() {
  if (initialized) {
    return
  }

  supertokens.init(buildSuperTokensConfig())
  initialized = true
}
