import { PrismaClient } from '@prisma/client'
import supertokens from 'supertokens-node'
import EmailPassword from 'supertokens-node/recipe/emailpassword'
import UserRoles from 'supertokens-node/recipe/userroles'
import Session from 'supertokens-node/recipe/session'

const prisma = new PrismaClient()

// Inicializar SuperTokens
supertokens.init({
  framework: 'express',
  supertokens: {
    connectionURI: 'http://supertokens-auth:3567'
  },
  appInfo: {
    appName: 'eventdev-server',
    apiDomain: 'http://localhost:5122',
    websiteDomain: 'http://app:5173',
    apiBasePath: '/api/v1/auth',
    websiteBasePath: '/auth'
  },
  recipeList: [EmailPassword.init(), Session.init(), UserRoles.init()]
})

const communitiesData = [
  {
    name: 'PHP com Rapadura',
    email: 'php@example.com',
    description: 'Comunidade PHP do estado do Ceará.',
    phone: '(85) 99999-9999',
    link_website: 'https://phpcomrapadura.org',
    link_instagram: 'https://www.instagram.com/phpcomrapadura?igsh=MWhuZW5nZ3ZiNTBueg==',
    link_linkedin: 'https://www.linkedin.com/company/phpcomrapadura/about/',
    link_github: 'https://github.com/PHPcomRapadura/',
    logo_url: '/images/logos/php-com-rapadura.png'
  },
  {
    name: 'House .JS',
    email: 'housejs@example.com',
    description: 'Comunidade de JavaScript em Fortaleza, criada pelos alunos do Geração Tech.',
    phone: '(85) 99999-9999',
    link_website: 'https://www.youtube.com/@comunidadehousejs',
    link_instagram: 'https://www.instagram.com/comunidadehousejs?igsh=MTdwMXIxZ293MHAwNw==',
    link_linkedin: 'https://www.linkedin.com/company/comunidade-house-js/posts/?feedView=all',
    link_github: 'https://github.com/',
    logo_url: '/images/logos/house-js.png'
  },
  {
    name: 'Frontend CE',
    email: 'frontendce@example.com',
    description: 'Comunidade Frontend CE. Nosso objetivo é de facilitar para todos o acesso a informação sobre tecnologia.',
    phone: '(85) 99999-9999',
    link_website: 'https://www.instagram.com/frontendce?igsh=MTZvbzNpYm81a2VwdQ==',
    link_instagram: 'https://www.instagram.com/frontendce?igsh=MTZvbzNpYm81a2VwdQ==',
    link_linkedin: 'https://www.linkedin.com/company/front-end-ce/posts/?feedView=all',
    link_github: 'https://github.com/frontend-ce',
    logo_url: '/images/logos/frontend-ce.png'
  },
  {
    name: 'Coda CE',
    email: 'coda@example.com',
    description:
      'Comunidade voltada para o setor de desenvolvimento. Criado para criar um ecossistema em que os devs possam se sentir à vontade para falarem suas dúvidas, dores e conquistas.',
    phone: '(85) 99999-9999',
    link_website: 'https://coda-ce-page.vercel.app/',
    link_instagram: 'https://www.instagram.com/coda.ce?igsh=MWxhdDhjcTdzY3V3dA==',
    link_linkedin: 'https://www.linkedin.com/company/coda-ce/',
    link_github: 'https://github.com/Coda-ce',
    logo_url: '/images/logos/coda-ce.png'
  },
  {
    name: 'Python Nordeste',
    email: 'py@example.com',
    description: 'Comunidade de tecnologia Python Nordeste.',
    phone: '(85) 99999-9999',
    link_website: 'https://2025.pythonnordeste.org/',
    link_instagram: 'https://www.instagram.com/pythonnordeste/?igsh=bTJmZDQxYWVla2l2#',
    link_linkedin: 'https://www.linkedin.com/company/pythonnordeste/posts/?feedView=all',
    link_github: 'https://github.com/pythonNordeste/',
    logo_url: '/images/logos/python-nordeste.png'
  },
  {
    name: 'RH Otimizado',
    email: 'rh@example.com',
    description: 'Comunidade de RH com propósito de compartilhar conteúdos da área de RH carreira, mercado de trabalho e currículo.',
    phone: '(85) 99999-9999',
    link_website: 'https://www.instagram.com/rh.otimizado/?igsh=ZDNuaTNnYmdrY3Nr#',
    link_instagram: 'https://www.instagram.com/rh.otimizado/?igsh=ZDNuaTNnYmdrY3Nr#',
    link_linkedin: 'https://linkedin.com/',
    link_github: 'https://github.com/',
    logo_url: '/images/logos/rh-otimizado.png'
  },
  {
    name: 'JavaScript Ceará',
    email: 'js@example.com',
    description: 'Comunidade cearense de React.',
    phone: '(85) 99999-9999',
    link_website: 'https://www.javascript-ceara.org/',
    link_instagram: 'https://www.instagram.com/reactjsceara?igsh=MWlhenR6bDdlcmZ1cA==',
    link_linkedin: 'https://www.linkedin.com/company/javascript-ceara/',
    link_github: 'https://github.com/',
    logo_url: '/images/logos/js-ce.png'
  },
  {
    name: 'GitHub Community Fortaleza',
    email: 'gh@example.com',
    description: 'Comunidade GitHub sobre OpenSource em Fortaleza-CE.',
    phone: '(85) 99999-9999',
    link_website: 'https://www.instagram.com/ghcfortaleza?igsh=a2gybWQ0Znk1bTN3',
    link_instagram: 'https://www.instagram.com/ghcfortaleza?igsh=a2gybWQ0Znk1bTN3',
    link_linkedin: 'https://linkedin.com/',
    link_github: 'https://github.com/',
    logo_url: '/images/logos/ghc.png'
  }
]

const frontendCEEvent = {
  title: 'Frontend Day 2025',
  description: 'Frontend Day 2025.',
  cover_url: '/images/event-covers/event-frontend.png',
  link: 'https://www.frontendce.com.br/',
  modality: 'PRESENTIAL',
  start_date: new Date('2025-09-20T08:00:00.275Z'),
  end_date: new Date('2025-09-20T17:00:00.275Z'),
  address: {
    cep: '60165010',
    state: 'CE',
    city: 'Fortaleza',
    neighborhood: 'Centro',
    streetAddress: 'Av. Monsenhor Tabosa',
    number: '740'
  }
}

async function createSupertokensUser(email: string, password: string) {
  const response = await EmailPassword.signUp('public', email, password)
  if (response.status !== 'OK') {
    throw new Error(`User ${email} already exists`)
  }
  await UserRoles.createNewRoleOrAddPermissions('community', [])
  await UserRoles.addRoleToUser('public', response.user.id, 'community')
  return response.user.id
}

async function main() {
  console.log('✦ Cleaning old data...')
  await prisma.event.deleteMany({})
  await prisma.address.deleteMany({})
  await prisma.community_user_request.deleteMany({})
  await prisma.community_user.deleteMany({})
  await prisma.post.deleteMany({})
  await prisma.community.deleteMany({})
  await prisma.user.deleteMany({})

  // --- Admin ---
  console.log('✦ Creating admin...')
  try {
    const adminUser = await EmailPassword.signUp('public', 'admin@eventdev.com', 'Admin123!')
    if (adminUser.status === 'OK') {
      await UserRoles.createNewRoleOrAddPermissions('admin', [])
      await UserRoles.createNewRoleOrAddPermissions('user', [])
      await UserRoles.addRoleToUser('public', adminUser.user.id, 'admin')

      await prisma.user.create({
        data: {
          supertokens_id: adminUser.user.id,
          email: 'admin@eventdev.com',
          password: 'Admin123!',
          usuario_root: true
        }
      })
      console.log('✓ Admin created')
    }
  } catch (err) {
    console.log('⚠ Admin may already exist:', err.message)
  }

  // --- Users and Communities ---
  console.log('✦ Creating community users...')
  for (const data of communitiesData) {
    const suUserId = await createSupertokensUser(data.email, 'Senha123!')

    const user = await prisma.user.create({
      data: {
        supertokens_id: suUserId,
        email: data.email,
        password: 'Senha123!'
      }
    })

    const community = await prisma.community.create({
      data: {
        supertokens_id: suUserId,
        name: data.name,
        description: data.description,
        logo_url: data.logo_url,
        phone_number: data.phone,
        link_instagram: data.link_instagram,
        link_linkedin: data.link_linkedin,
        link_website: data.link_website,
        link_github: data.link_github,
        is_active: true
      }
    })

    await prisma.community_user.create({
      data: {
        community_id: community.id,
        user_id: user.id
      }
    })
  }

  // --- Frontend Day ---
  const frontendCommunity = await prisma.community.findFirst({ where: { name: 'Frontend CE' } })
  if (frontendCommunity) {
    const address = await prisma.address.create({
      data: frontendCEEvent.address
    })

    await prisma.event.create({
      data: {
        id_community: frontendCommunity.id,
        id_address: address.id,
        title: frontendCEEvent.title,
        description: frontendCEEvent.description,
        capa_url: frontendCEEvent.cover_url,
        link: frontendCEEvent.link,
        modality: 'PRESENTIAL',
        start_date_time: frontendCEEvent.start_date,
        end_date_time: frontendCEEvent.end_date,
        is_active: true
      }
    })

    console.log('✓ Frontend CE event created')
  }

  console.log('✓ Seed finished successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
