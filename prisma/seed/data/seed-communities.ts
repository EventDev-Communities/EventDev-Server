import { PrismaClient } from '@prisma/client'
import supertokens from 'supertokens-node'
import EmailPassword from 'supertokens-node/recipe/emailpassword'
import Session from 'supertokens-node/recipe/session'
import UserRoles from 'supertokens-node/recipe/userroles'

import { logger } from '../logger'

const communitiesData = [
  {
    name: 'PHP com Rapadura',
    email: 'php@example.com',
    description: 'Comunidade PHP do estado do Ceará.',
    phone: '(85) 99999-9999',
    links: [
      {
        type: 'WEBSITE',
        url: 'https://phpcomrapadura.org'
      },
      {
        type: 'INSTAGRAM',
        url: 'https://www.instagram.com/phpcomrapadura?igsh=MWhuZW5nZ3ZiNTBueg=='
      },
      {
        type: 'LINKEDIN',
        url: 'https://www.linkedin.com/company/phpcomrapadura/about/'
      },
      {
        type: 'GITHUB',
        url: 'https://github.com/PHPcomRapadura/'
      }
    ],
    logoUrl: '/images/logos/php-com-rapadura.png'
  },
  {
    name: 'House.JS',
    email: 'housejs@example.com',
    description: 'Comunidade de JavaScript em Fortaleza, criada pelos alunos do Geração Tech.',
    phone: '(85) 99999-9999',
    links: [
      {
        type: 'WEBSITE',
        url: 'https://www.youtube.com/@comunidadehousejs'
      },
      {
        type: 'INSTAGRAM',
        url: 'https://www.instagram.com/comunidadehousejs?igsh=MTdwMXIxZ293MHAwNw=='
      },
      {
        type: 'LINKEDIN',
        url: 'https://www.linkedin.com/company/comunidade-house-js/posts/?feedView=all'
      }
    ],
    logoUrl: '/images/logos/house-js.png'
  },
  {
    name: 'Frontend CE',
    email: 'frontendce@example.com',
    description: 'Comunidade Frontend CE. Nosso objetivo é facilitar para todos o acesso a informação sobre tecnologia.',
    phone: '(85) 99999-9999',
    links: [
      {
        type: 'INSTAGRAM',
        url: 'https://www.instagram.com/frontendce?igsh=MTZvbzNpYm81a2VwdQ=='
      },
      {
        type: 'LINKEDIN',
        url: 'https://www.linkedin.com/company/front-end-ce/posts/?feedView=all'
      },
      {
        type: 'GITHUB',
        url: 'https://github.com/frontend-ce'
      }
    ],
    logoUrl: '/images/logos/frontend-ce.png'
  },
  {
    name: 'Coda CE',
    email: 'coda@example.com',
    description:
      'Comunidade voltada para o setor de desenvolvimento. Criado para criar um ecossistema em que os devs possam se sentir à vontade para falarem suas dúvidas, dores e conquistas.',
    phone: '(85) 99999-9999',
    links: [
      {
        type: 'WEBSITE',
        url: 'https://coda-ce-page.vercel.app/'
      },
      {
        type: 'INSTAGRAM',
        url: 'https://www.instagram.com/coda.ce?igsh=MWxhdDhjcTdzY3V3dA=='
      },
      {
        type: 'LINKEDIN',
        url: 'https://www.linkedin.com/company/coda-ce/'
      },
      {
        type: 'GITHUB',
        url: 'https://github.com/Coda-ce'
      }
    ],
    logoUrl: '/images/logos/coda-ce.png'
  },
  {
    name: 'Python Nordeste',
    email: 'py@example.com',
    description: 'Comunidade de tecnologia Python Nordeste.',
    phone: '(85) 99999-9999',
    links: [
      {
        type: 'WEBSITE',
        url: 'https://2025.pythonnordeste.org/'
      },
      {
        type: 'INSTAGRAM',
        url: 'https://www.instagram.com/pythonnordeste/?igsh=bTJmZDQxYWVla2l2#'
      },
      {
        type: 'LINKEDIN',
        url: 'https://www.linkedin.com/company/pythonnordeste/posts/?feedView=all'
      },
      {
        type: 'GITHUB',
        url: 'https://github.com/pythonNordeste/'
      }
    ],
    logoUrl: '/images/logos/python-nordeste.png'
  },
  {
    name: 'RH Otimizado',
    email: 'rh@example.com',
    description: 'Comunidade de RH com propósito de compartilhar conteúdos da área de RH carreira, mercado de trabalho e currículo.',
    phone: '(85) 99999-9999',
    links: [
      {
        type: 'INSTAGRAM',
        url: 'https://www.instagram.com/rh.otimizado/?igsh=ZDNuaTNnYmdrY3Nr#'
      }
    ],
    logoUrl: '/images/logos/rh-otimizado.png'
  },
  {
    name: 'JavaScript Ceará',
    email: 'js@example.com',
    description: 'Comunidade cearense de React.',
    phone: '(85) 99999-9999',
    links: [
      {
        type: 'WEBSITE',
        url: 'https://www.javascript-ceara.org/'
      },
      {
        type: 'INSTAGRAM',
        url: 'https://www.instagram.com/reactjsceara?igsh=MWlhenR6bDdlcmZ1cA=='
      },
      {
        type: 'LINKEDIN',
        url: 'https://www.linkedin.com/company/javascript-ceara/'
      }
    ],
    logoUrl: '/images/logos/js-ce.png'
  },
  {
    name: 'GitHub Community Fortaleza',
    email: 'gh@example.com',
    description: 'Comunidade GitHub sobre OpenSource em Fortaleza-CE.',
    phone: '(85) 99999-9999',
    links: [
      {
        type: 'INSTAGRAM',
        url: 'https://www.instagram.com/ghcfortaleza?igsh=a2gybWQ0Znk1bTN3'
      }
    ],
    logoUrl: '/images/logos/ghc.png'
  }
]

async function createSupertokensUser(prisma: PrismaClient, email: string, password: string) {
  const response = await EmailPassword.signUp('public', email, password)
  if (response.status !== 'OK') {
    logger.debug(`   - User ${email} already exists`)
    // Find existing user
    const existingUser = await prisma.user.findUnique({ where: { email } })
    return existingUser?.supertokensId
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

  for (const data of communitiesData) {
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
        password: 'Senha123!',
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
        phoneNumber: data.phone,
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

  logger.info(`   - ${communitiesData.length} communities created`)
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
