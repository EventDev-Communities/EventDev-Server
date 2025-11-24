export interface AddressSeed {
  cep: string
  streetAddress: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

export const addressSeedData = [
  {
    cep: '60060390',
    streetAddress: 'Rua Dragão do Mar',
    number: '81',
    complement: 'Centro Dragão do Mar de Arte e Cultura',
    neighborhood: 'Praia de Iracema',
    city: 'Fortaleza',
    state: 'CE'
  },
  {
    cep: '60811905',
    streetAddress: 'Av. Washington Soares',
    number: '1321',
    complement: 'Universidade de Fortaleza - UNIFOR',
    neighborhood: 'Edson Queiroz',
    city: 'Fortaleza',
    state: 'CE'
  },
  {
    cep: '60175055',
    streetAddress: 'Rua Desembargador Lauro Nogueira',
    number: '1500',
    complement: 'Teatro RioMar Fortaleza',
    neighborhood: 'Papicu',
    city: 'Fortaleza',
    state: 'CE'
  }
] satisfies ReadonlyArray<AddressSeed>

export interface CommunityLinkSeed {
  type: string
  url: string
}

export interface CommunitySeed {
  name: string
  email: string
  description: string
  phone: string
  links: CommunityLinkSeed[]
  logoUrl: string
}

export const communitySeedData = [
  {
    name: 'PHP com Rapadura',
    email: 'php@example.com',
    description: 'Comunidade PHP do estado do Ceará.',
    phone: '(85) 99999-9999',
    links: [
      { type: 'WEBSITE', url: 'https://phpcomrapadura.org' },
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/phpcomrapadura?igsh=MWhuZW5nZ3ZiNTBueg==' },
      { type: 'LINKEDIN', url: 'https://www.linkedin.com/company/phpcomrapadura/about/' },
      { type: 'GITHUB', url: 'https://github.com/PHPcomRapadura/' }
    ],
    logoUrl: '/images/logos/php-com-rapadura.png'
  },
  {
    name: 'House.JS',
    email: 'housejs@example.com',
    description: 'Comunidade de JavaScript em Fortaleza, criada pelos alunos do Geração Tech.',
    phone: '(85) 99999-9999',
    links: [
      { type: 'WEBSITE', url: 'https://www.youtube.com/@comunidadehousejs' },
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/comunidadehousejs?igsh=MTdwMXIxZ293MHAwNw==' },
      { type: 'LINKEDIN', url: 'https://www.linkedin.com/company/comunidade-house-js/posts/?feedView=all' }
    ],
    logoUrl: '/images/logos/house-js.png'
  },
  {
    name: 'Frontend CE',
    email: 'frontendce@example.com',
    description: 'Comunidade Frontend CE. Nosso objetivo é facilitar para todos o acesso a informação sobre tecnologia.',
    phone: '(85) 99999-9999',
    links: [
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/frontendce?igsh=MTZvbzNpYm81a2VwdQ==' },
      { type: 'LINKEDIN', url: 'https://www.linkedin.com/company/front-end-ce/posts/?feedView=all' },
      { type: 'GITHUB', url: 'https://github.com/frontend-ce' }
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
      { type: 'WEBSITE', url: 'https://coda-ce-page.vercel.app/' },
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/coda.ce?igsh=MWxhdDhjcTdzY3V3dA==' },
      { type: 'LINKEDIN', url: 'https://www.linkedin.com/company/coda-ce/' },
      { type: 'GITHUB', url: 'https://github.com/Coda-ce' }
    ],
    logoUrl: '/images/logos/coda-ce.png'
  },
  {
    name: 'Python Nordeste',
    email: 'py@example.com',
    description: 'Comunidade de tecnologia Python Nordeste.',
    phone: '(85) 99999-9999',
    links: [
      { type: 'WEBSITE', url: 'https://2025.pythonnordeste.org/' },
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/pythonnordeste/?igsh=bTJmZDQxYWVla2l2#' },
      { type: 'LINKEDIN', url: 'https://www.linkedin.com/company/pythonnordeste/posts/?feedView=all' },
      { type: 'GITHUB', url: 'https://github.com/pythonNordeste/' }
    ],
    logoUrl: '/images/logos/python-nordeste.png'
  },
  {
    name: 'RH Otimizado',
    email: 'rh@example.com',
    description: 'Comunidade de RH com propósito de compartilhar conteúdos da área de RH carreira, mercado de trabalho e currículo.',
    phone: '(85) 99999-9999',
    links: [
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/rh.otimizado/?igsh=ZDNuaTNnYmdrY3Nr#' }
    ],
    logoUrl: '/images/logos/rh-otimizado.png'
  },
  {
    name: 'JavaScript Ceará',
    email: 'js@example.com',
    description: 'Comunidade cearense de React.',
    phone: '(85) 99999-9999',
    links: [
      { type: 'WEBSITE', url: 'https://www.javascript-ceara.org/' },
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/reactjsceara?igsh=MWlhenR6bDdlcmZ1cA==' },
      { type: 'LINKEDIN', url: 'https://www.linkedin.com/company/javascript-ceara/' }
    ],
    logoUrl: '/images/logos/js-ce.png'
  },
  {
    name: 'GitHub Community Fortaleza',
    email: 'gh@example.com',
    description: 'Comunidade GitHub sobre OpenSource em Fortaleza-CE.',
    phone: '(85) 99999-9999',
    links: [
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/ghcfortaleza?igsh=a2gybWQ0Znk1bTN3' }
    ],
    logoUrl: '/images/logos/ghc.png'
  }
] satisfies ReadonlyArray<CommunitySeed>

export interface EventAddressSeed {
  cep: string
  streetAddress: string
  number: string
}

export interface EventSeed {
  community: string
  title: string
  description: string
  modality: string
  coverUrl: string
  link: string
  startDateTime: Date
  endDateTime: Date
  address?: EventAddressSeed
}

export const eventSeedData = [
  {
    community: 'Frontend CE',
    title: 'Frontend Day 2025',
    description:
      'Evento anual da comunidade Frontend CE com palestras, workshops e networking sobre as últimas tendências em desenvolvimento frontend.',
    modality: 'PRESENTIAL',
    address: {
      cep: '60060390',
      streetAddress: 'Rua Dragão do Mar',
      number: '81'
    },
    coverUrl: '/images/events/frontend-day-2025.jpg',
    link: 'https://frontendce.com/frontend-day-2025',
    startDateTime: new Date('2025-05-15T08:00:00-03:00'),
    endDateTime: new Date('2025-05-15T18:00:00-03:00')
  },
  {
    community: 'PHP com Rapadura',
    title: 'PHP com Rapadura Mentoria',
    description: 'Programa de mentoria para desenvolvedores PHP iniciantes e intermediários. Aprenda com os melhores profissionais da comunidade.',
    modality: 'ONLINE',
    coverUrl: '/images/events/php-mentoria-2025.jpg',
    link: 'https://phpcomrapadura.org/mentoria',
    startDateTime: new Date('2025-03-01T19:00:00-03:00'),
    endDateTime: new Date('2025-03-01T21:00:00-03:00')
  },
  {
    community: 'Python Nordeste',
    title: 'Python Nordeste 2025',
    description: 'A maior conferência de Python do Nordeste! Três dias de imersão com palestras, tutoriais, sprints e muito networking.',
    modality: 'HYBRID',
    address: {
      cep: '60811905',
      streetAddress: 'Av. Washington Soares',
      number: '1321'
    },
    coverUrl: '/images/events/python-nordeste-2025.jpg',
    link: 'https://2025.pythonnordeste.org',
    startDateTime: new Date('2025-06-19T08:00:00-03:00'),
    endDateTime: new Date('2025-06-21T18:00:00-03:00')
  }
] satisfies ReadonlyArray<EventSeed>
