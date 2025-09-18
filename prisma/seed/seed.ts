import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
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

const communityData = [
  { name: 'Tech Innovators', description: 'Comunidade focada em inovação tecnológica e startups.' },
  { name: 'Dev Masters', description: 'Grupo de desenvolvedores experientes para troca de conhecimento avançado.' },
  { name: 'AI Pioneers', description: 'Especialistas e entusiastas de Inteligência Artificial.' },
  { name: 'Cloud Heroes', description: 'Profissionais de Cloud Computing, DevOps e SRE.' },
  { name: 'Frontend Ninjas', description: 'Apaixonados por UI/UX, design systems e frameworks modernos.' },
  { name: 'Backend Warriors', description: 'Especialistas em arquiteturas de microsserviços, APIs e bancos de dados.' }
]

async function main() {
  console.log('✦ Iniciando o processo de seed...')

  console.log('✦ Limpando dados antigos...')
  await prisma.event.deleteMany({})
  await prisma.address.deleteMany({})
  await prisma.community_user_request.deleteMany({})
  await prisma.community_user.deleteMany({})
  await prisma.post.deleteMany({})
  await prisma.community.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('✦ Criando admin no SuperTokens...')
  try {
    const adminUser = await EmailPassword.signUp('public', 'admin@eventdev.com', 'Admin123!')
    if (adminUser.status === 'OK') {
      console.log('✓ Admin criado no SuperTokens:', adminUser.user.id)

      // Criar roles se não existirem
      await UserRoles.createNewRoleOrAddPermissions('admin', [])
      await UserRoles.createNewRoleOrAddPermissions('user', [])
      await UserRoles.createNewRoleOrAddPermissions('community', [])

      // Atribuir role admin ao usuário
      await UserRoles.addRoleToUser('public', adminUser.user.id, 'admin')
      console.log('✓ Role admin atribuída')

      // Criar o usuário admin no banco do Prisma
      await prisma.user.create({
        data: {
          supertokens_id: adminUser.user.id,
          email: 'admin@eventdev.com',
          password: 'hashed_password',
          usuario_root: true
        }
      })
      console.log('✓ Admin criado no banco Prisma')
    }
  } catch (error) {
    console.log('⚠ Admin pode já existir:', error.message)
  }

  console.log('✦ Criando usuários...')
  const usersData = Array.from({ length: 20 }, () => ({
    supertokens_id: faker.string.uuid(),
    email: faker.internet.email(),
    password: faker.internet.password()
  }))
  await prisma.user.createMany({ data: usersData })
  const createdUsers = await prisma.user.findMany()

  console.log('✦ Criando comunidades...')
  const communitiesToCreate = communityData.map((community) => {
    const slug = community.name.toLowerCase().replace(/ /g, '-')
    return {
      supertokens_id: faker.string.uuid(),
      name: community.name,
      description: community.description,
      logo_url: `https://placehold.co/400x400/7B42BC/FFFFFF?text=${community.name.charAt(0)}`,
      phone_number: faker.phone.number(),
      link_instagram: `https://instagram.com/${slug}`,
      link_linkedin: `https://linkedin.com/company/${slug}`,
      link_website: `https://${slug}.com`,
      link_github: `https://github.com/${slug}`,
      is_active: true
    }
  })
  await prisma.community.createMany({ data: communitiesToCreate })
  const createdCommunities = await prisma.community.findMany()

  console.log('✦ Vinculando usuários às comunidades...')
  const memberships: { community_id: number; user_id: number }[] = []
  for (const community of createdCommunities) {
    const availableUsers = [...createdUsers]
    faker.helpers.shuffle(availableUsers)
    const memberCount = Math.min(8, availableUsers.length)

    // Adicionar membros à comunidade
    for (let i = 0; i < memberCount; i++) {
      const member = availableUsers.pop()
      if (member) {
        memberships.push({
          community_id: community.id,
          user_id: member.id
        })
      }
    }
  }

  await prisma.community_user.createMany({
    data: memberships,
    skipDuplicates: true
  })

  console.log('✦ Criando endereços...')
  const addressesData = Array.from({ length: 15 }, () => ({
    cep: '12345678',
    state: 'SP',
    city: faker.location.city(),
    neighborhood: faker.location.county(),
    streetAddress: faker.location.streetAddress(),
    number: faker.number.int({ min: 1, max: 999 }).toString()
  }))
  await prisma.address.createMany({ data: addressesData })
  const createdAddresses = await prisma.address.findMany()

  console.log('✦ Criando eventos...')
  const eventsData: any[] = []
  for (const community of createdCommunities) {
    const eventCount = faker.number.int({ min: 2, max: 4 })
    for (let i = 0; i < eventCount; i++) {
      const modality = faker.helpers.arrayElement(['ONLINE', 'PRESENTIAL', 'HYBRID'])
      const startDate = faker.date.future({ years: 1 })
      const endDate = new Date(startDate)
      endDate.setHours(startDate.getHours() + faker.number.int({ min: 2, max: 6 }))

      eventsData.push({
        id_community: community.id,
        id_address: modality === 'ONLINE' ? null : createdAddresses[Math.floor(Math.random() * createdAddresses.length)]?.id || null,
        title: faker.helpers.arrayElement([
          'Workshop de React',
          'Meetup de JavaScript',
          'Hackathon de IA',
          'Palestra sobre DevOps',
          'Bootcamp de Node.js'
        ]),
        capa_url: faker.image.url({ width: 800, height: 400 }),
        link: modality === 'ONLINE' ? faker.internet.url() : null,
        description: faker.lorem.sentence({ min: 8, max: 15 }),
        modality: modality,
        start_date_time: startDate,
        end_date_time: endDate,
        is_active: true
      })
    }
  }

  await prisma.event.createMany({ data: eventsData })
  console.log(`✓ ${eventsData.length} eventos criados`)

  // Estatísticas finais
  const stats = {
    users: await prisma.user.count(),
    communities: await prisma.community.count(),
    events: await prisma.event.count(),
    addresses: await prisma.address.count(),
    memberships: await prisma.community_user.count()
  }

  console.log('✦ Estatísticas finais:')
  console.log(`  - Usuários: ${stats.users}`)
  console.log(`  - Comunidades: ${stats.communities}`)
  console.log(`  - Eventos: ${stats.events}`)
  console.log(`  - Endereços: ${stats.addresses}`)
  console.log(`  - Vínculos: ${stats.memberships}`)

  console.log('✓ Seed finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
