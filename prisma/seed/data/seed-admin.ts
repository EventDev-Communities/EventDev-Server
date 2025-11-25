import { PrismaClient } from '@prisma/client'
import supertokens from 'supertokens-node'
import EmailPassword from 'supertokens-node/recipe/emailpassword'
import UserRoles from 'supertokens-node/recipe/userroles'

import { logger } from '../logger'

export async function seedAdmin(prisma: PrismaClient) {
  logger.info('Seeding Platform Administrator...')

  try {
    const adminUser = await EmailPassword.signUp('public', 'admin@eventdev.com', 'Admin123!')

    if (adminUser.status === 'OK') {
      // Create platform administrator role in SuperTokens
      await UserRoles.createNewRoleOrAddPermissions('platform_admin', ['platform:manage', 'users:manage', 'communities:manage', 'events:manage'])
      await UserRoles.createNewRoleOrAddPermissions('user', [])
      await UserRoles.addRoleToUser('public', adminUser.user.id, 'platform_admin')

      // Create root user in database (platform administrator)
      await prisma.user.upsert({
        where: { email: 'admin@eventdev.com' },
        update: {},
        create: {
          supertokensId: adminUser.user.id,
          email: 'admin@eventdev.com',
          isRoot: true, // Platform root user
          isActive: true
        }
      })

      logger.info('   - Platform administrator created (isRoot: true)')
      logger.info('   - Email: admin@eventdev.com')
      logger.info('   - Role: platform_admin')
    }
  } catch (error) {
    logger.warn('   - Platform admin already exists or error creating:', error)
  }
}

// Run standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  // Initialize SuperTokens
  supertokens.init({
    framework: 'express',
    supertokens: {
      connectionURI: process.env.SUPERTOKENS_CONNECTION_URI || 'http://supertokens-auth:3567'
    },
    appInfo: {
      appName: 'eventdev-server',
      apiDomain: process.env.API_DOMAIN || 'http://localhost:5122',
      websiteDomain: process.env.WEBSITE_DOMAIN || 'http://app:5173',
      apiBasePath: '/api/v1/auth',
      websiteBasePath: '/auth'
    },
    recipeList: [EmailPassword.init()]
  })

  const prisma = new PrismaClient()
  seedAdmin(prisma)
    .catch((error) => {
      logger.error('ERROR: Failed to seed Admin:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
