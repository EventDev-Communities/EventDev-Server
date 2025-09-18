import { PrismaClient, community_user_roles } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { signUp } from 'supertokens-node/recipe/emailpassword'
import { addRoleToUser } from 'supertokens-node/recipe/userroles'
import SuperTokens from 'supertokens-node'
import EmailPassword from 'supertokens-node/recipe/emailpassword'
import UserRoles from 'supertokens-node/recipe/userroles'
import Session from 'supertokens-node/recipe/session'

SuperTokens.init({
  framework: 'express',
  supertokens: {
    connectionURI: process.env.SUPERTOKENS_CONNECTION_URI || 'http://localhost:3567',
    apiKey: process.env.SUPERTOKENS_API_KEY || undefined,
  },
  appInfo: {
    appName: 'EventDev',
    apiDomain: 'http://localhost:5122',
    websiteDomain: 'http://localhost:3000',
    apiBasePath: '/auth',
    websiteBasePath: '/auth',
  },
  recipeList: [
    EmailPassword.init(),
    Session.init(),
    UserRoles.init(),
  ],
})

const prisma = new PrismaClient()

const communityData = [
  { name: 'Tech Innovators', description: 'Comunidade focada em inovação tecnológica e startups.' },
  { name: 'Dev Masters', description: 'Grupo de desenvolvedores experientes para troca de conhecimento avançado.' },
  { name: 'AI Pioneers', description: 'Especialistas e entusiastas de Inteligência Artificial.' },
  { name: 'Cloud Heroes', description: 'Profissionais de Cloud Computing, DevOps e SRE.' },
  { name: 'Frontend Ninjas', description: 'Apaixonados por UI/UX, design systems e frameworks modernos.' },
  { name: 'Backend Warriors', description: 'Especialistas em arquiteturas de microsserviços, APIs e bancos de dados.' },
  { name: 'Mobile Coders', description: 'Programadores mobile para Android e iOS.' },
  { name: 'Game Dev Club', description: 'Criadores de jogos, de indies a AAA, usando Unity e Unreal.' },
  { name: 'Data Science Hub', description: 'Comunidade para cientistas de dados, engenheiros de ML e analistas.' },
  { name: 'CyberSec Squad', description: 'Profissionais e entusiastas de segurança da informação.' },
  { name: 'Blockchain Builders', description: 'Desenvolvedores focados em Web3, dApps e contratos inteligentes.' },
  { name: 'Open Source Alliance', description: 'Colaboradores e mantenedores de projetos open source.' },
  { name: 'Agile Leaders', description: 'Líderes, Scrum Masters e Coaches ágeis.' },
  { name: 'Design Thinkers', description: 'Especialistas em Design Thinking e inovação centrada no usuário.' },
  { name: 'Clean Code Society', description: 'Defensores do código limpo e das boas práticas de desenvolvimento.' }
]

async function main() {
  console.log('Iniciando o processo de seed...')

  console.log('Limpando dados antigos...')
  await prisma.community_user.deleteMany({})
  await prisma.community.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('Criando 50 usuários...')
  const usersData = Array.from({ length: 50 }, () => ({
    supertokens_id: faker.string.uuid(),
    function: faker.person.jobTitle()
  }))
  await prisma.user.createMany({ data: usersData })

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@eventdev.org';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  let supertokensUser: Awaited<ReturnType<typeof signUp>> | undefined;
  let adminUser: Awaited<ReturnType<typeof prisma.user.create>> | null;
  let userId: string | undefined;
  try {
    supertokensUser = await signUp("public", adminEmail, adminPassword);
    if (supertokensUser.status === "OK") {
      userId = typeof supertokensUser.recipeUserId === 'string'
        ? supertokensUser.recipeUserId
        : (supertokensUser.recipeUserId.getAsString() || supertokensUser.recipeUserId.toString());
      console.log('Usuário admin criado/logado no SuperTokens');
      adminUser = await prisma.user.create({
        data: {
          supertokens_id: userId,
          function: 'admin',
          usuario_root: true,
        }
      });
      console.log('Usuário admin criado no banco:', adminEmail);
    } else {
      console.log('Não foi possível criar/logar admin no SuperTokens:', supertokensUser.status);
    }
  } catch (e) {
    console.log('Usuário admin já existe ou erro ao criar:', e.message);
  }

  try {
    if (supertokensUser && supertokensUser.status === "OK" && userId) {
      await addRoleToUser("public", userId, 'admin');
      console.log('Papel ADMIN atribuído ao usuário admin no SuperTokens');
    }
  } catch (e) {
    console.log('️Erro ao atribuir papel ADMIN:', e.message);
  }

  const createdUsers = await prisma.user.findMany()

  console.log('Criando 15 comunidades...')
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

  console.log('Vinculando usuários às comunidades...')
  const memberships: { community_id: number; user_id: number; role: community_user_roles }[] = []

  for (const community of createdCommunities) {
    const availableUsers = [...createdUsers]
    faker.helpers.shuffle(availableUsers)

    const memberCount = Math.min(15, availableUsers.length)

    const leader = availableUsers.pop()
    if (leader) {
      memberships.push({
        community_id: community.id,
        user_id: leader.id,
        role: community_user_roles.LEADER
      })
    }

    for (let i = 0; i < memberCount - 1; i++) {
      const member = availableUsers.pop()
      if (member) {
        memberships.push({
          community_id: community.id,
          user_id: member.id,
          role: community_user_roles.MEMBER
        })
      }
    }
  }

  await prisma.community_user.createMany({
    data: memberships,
    skipDuplicates: true
  })

  console.log('Seed finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
