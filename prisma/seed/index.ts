import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import supertokens from 'supertokens-node'
import EmailPassword from 'supertokens-node/recipe/emailpassword'
import Session from 'supertokens-node/recipe/session'
import UserRoles from 'supertokens-node/recipe/userroles'

import { logger } from './logger'
import { seedAddresses } from './data/seed-addresses'
// Data tables
import { seedAdmin } from './data/seed-admin'
import { seedCommunities } from './data/seed-communities'
import { seedEvents } from './data/seed-events'
// Lookup tables
import { seedCommunityUserRequestStatus } from './lookups/seed-community-user-request-status'
import { seedEventModality } from './lookups/seed-event-modality'
import { seedLinkType } from './lookups/seed-link-type'

import { seedOrderItemType } from './lookups/seed-order-item-type'
import { seedOrderStatus } from './lookups/seed-order-status'
import { seedTicketStatus } from './lookups/seed-ticket-status'
import { seedUserRole } from './lookups/seed-user-role'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  logger.info('Starting database seeding...\n')

  try {
    // Initialize SuperTokens
    logger.info('Initializing SuperTokens...')
    supertokens.init({
      framework: 'express',
      supertokens: {
        connectionURI: process.env.SUPERTOKENS_CONNECTION_URI || 'http://localhost:3567'
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
    logger.info('   - SuperTokens initialized\n')

    // 1. Seed Lookup Tables (order doesn't matter)
    logger.info('PHASE 1: Seeding Lookup Tables\n')
    await seedCommunityUserRequestStatus(prisma)
    await seedEventModality(prisma)
    await seedLinkType(prisma)
    await seedUserRole(prisma)
    await seedTicketStatus(prisma)
    await seedOrderStatus(prisma)
    await seedOrderItemType(prisma)
    logger.info('\n   - All lookup tables seeded\n')

    // 2. Seed Admin User (depends on UserRole)
    logger.info('PHASE 2: Creating Platform Administrator\n')
    await seedAdmin(prisma)
    logger.info('\n   - Platform administrator created\n')

    // 3. Seed Addresses (independent)
    logger.info('PHASE 3: Creating Addresses\n')
    await seedAddresses(prisma)
    logger.info('\n   - Addresses created\n')

    // 4. Seed Communities (depends on UserRole, LinkType)
    logger.info('PHASE 4: Creating Communities\n')
    await seedCommunities(prisma)
    logger.info('\n   - Communities created\n')

    // 5. Seed Events (depends on Communities, EventModality, Addresses)
    logger.info('PHASE 5: Creating Events\n')
    await seedEvents(prisma)
    logger.info('\n   - Events created\n')

    logger.info('SEEDING COMPLETED SUCCESSFULLY!\n')
    logger.info('Summary:')
    logger.info('   - 7 lookup tables seeded')
    logger.info('   - 1 platform administrator created')
    logger.info('   - 8 communities created')
    logger.info('   - 3 addresses created')
    logger.info('   - 3 events created')
  } catch (error) {
    logger.error('\nERROR DURING SEEDING:', error)
    throw error
  }
}

main()
  .catch((error) => {
    logger.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
