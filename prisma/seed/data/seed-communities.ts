import { PrismaClient } from '@prisma/client'
import supertokens from 'supertokens-node'
import EmailPassword from 'supertokens-node/recipe/emailpassword'
import Session from 'supertokens-node/recipe/session'
import UserRoles from 'supertokens-node/recipe/userroles'

import { communitySeedData } from './seed-datasets'
import { logger } from '../logger'

async function createSupertokensUser(prisma: PrismaClient, email: string, password: string) {
  const response = await EmailPassword.signUp('public', email, password)
  if (response.status !== 'OK') {
    logger.debug(`   - User ${email} already exists`)

    // Try to find in local DB first
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return existingUser.supertokensId
    }

    // If not in local DB (e.g. after db-reset), fetch from SuperTokens
    const users = await supertokens.listUsersByAccountInfo('public', { email })
    if (users.length > 0) {
      return users[0].id
    }

    return null
  }
  await UserRoles.createNewRoleOrAddPermissions('community', [])
  await UserRoles.addRoleToUser('public', response.user.id, 'community')
  return response.user.id
}

export async function seedCommunities(prisma: PrismaClient) {
  logger.info('Seeding Communities...')

  // Find OWNER role (community creator)
  const ownerRole = await prisma.userRole.findUnique({
    where: { code: 'OWNER' }
  })

  if (!ownerRole) {
    throw new Error('UserRole OWNER not found. Run lookups seed first.')
  }

  for (const data of communitySeedData) {
    logger.debug(`   - Creating community: ${data.name}`)

    // Create user in SuperTokens
    const supertokensId = await createSupertokensUser(prisma, data.email, 'Senha123!')

    if (!supertokensId) {
      logger.warn(`   - Skipping ${data.name} - error creating user`)
      continue
    }

    // Create user in database
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        supertokensId,
        email: data.email,
        isActive: true
      }
    })

    // Create community
    const community = await prisma.community.upsert({
      where: { supertokensId },
      update: {},
      create: {
        supertokensId,
        name: data.name,
        description: data.description,
        logoUrl: data.logoUrl,
        phoneNumber: '',
        isActive: true
      }
    })

    // Create community links
    await Promise.all(
      data.links.map(async (link) => {
        const linkType = await prisma.linkType.findUnique({
          where: { code: link.type }
        })

        if (linkType) {
          await prisma.communityLink.upsert({
            where: {
              id: 0 // Placeholder - will always create new
            },
            update: {},
            create: {
              communityId: community.id,
              linkTypeId: linkType.id,
              name: linkType.name,
              url: link.url
            }
          })
        }
      }),
    )

    // Add user as OWNER of the community (not MEMBER)
    await prisma.communityUser.upsert({
      where: {
        communityId_userId: {
          communityId: community.id,
          userId: user.id
        }
      },
      update: {},
      create: {
        communityId: community.id,
        userId: user.id,
        roleId: ownerRole.id // OWNER, not MEMBER
      }
    })

    logger.debug(`   - ${data.name} created with OWNER: ${data.email}`)
  }

  logger.info(`   - ${communitySeedData.length} communities created`)
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
    recipeList: [EmailPassword.init(), Session.init(), UserRoles.init()]
  })

  const prisma = new PrismaClient()
  seedCommunities(prisma)
    .catch((error) => {
      logger.error('ERROR: Failed to seed Communities:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
