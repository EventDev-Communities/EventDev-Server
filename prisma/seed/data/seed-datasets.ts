export interface AddressSeed {
  cep: string
  streetAddress: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

const ADDRESS_DRAGAO = {
  cep: '60060390',
  streetAddress: 'Rua Dragão do Mar',
  number: '81',
  complement: 'Centro Dragão do Mar de Arte e Cultura',
  neighborhood: 'Praia de Iracema',
  city: 'Fortaleza',
  state: 'CE'
}

const ADDRESS_UNIFOR = {
  cep: '60811905',
  streetAddress: 'Av. Washington Soares',
  number: '1321',
  complement: 'Universidade de Fortaleza - UNIFOR',
  neighborhood: 'Edson Queiroz',
  city: 'Fortaleza',
  state: 'CE'
}

const ADDRESS_RIOMAR = {
  cep: '60175055',
  streetAddress: 'Rua Desembargador Lauro Nogueira',
  number: '1500',
  complement: 'Teatro RioMar Fortaleza',
  neighborhood: 'Papicu',
  city: 'Fortaleza',
  state: 'CE'
}

export const addressSeedData = [
  ADDRESS_DRAGAO,
  ADDRESS_UNIFOR,
  ADDRESS_RIOMAR
] satisfies ReadonlyArray<AddressSeed>

export interface CommunityLinkSeed {
  type: string
  url: string
}

export interface CommunitySeed {
  name: string
  email: string
  description: string
  phone?: string
  links: CommunityLinkSeed[]
  logoUrl: string
}

export const communitySeedData = [
  {
    name: 'PHP com Rapadura',
    email: 'phpcomrapadura@eventdev.org',
    description: 'Unidos através de uma doce ligação, a Rapadura.',
    links: [
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/phpcomrapadura' },
      { type: 'TELEGRAM', url: 'https://t.me/phpcomrapadura' },
      { type: 'WEBSITE', url: 'https://phpcomrapadura.org' },
      { type: 'LINKEDIN', url: 'https://www.linkedin.com/company/phpcomrapadura' },
      { type: 'GITHUB', url: 'https://github.com/phpcomrapadura' }
    ],
    logoUrl: '/assets/images/communities/logos/php-com-rapadura.png'
  },
  {
    name: 'Comunidade HouseJS',
    email: 'comunidadehousejs@eventdev.org',
    description: 'Conectando desenvolvedores no Ceará.',
    links: [
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/comunidadehousejs' },
      { type: 'WHATSAPP', url: 'https://chat.whatsapp.com/JkCeEgWsaIw5CWTxcULspy' },
      { type: 'YOUTUBE', url: 'https://www.youtube.com/@comunidadehousejs' },
      { type: 'LINKEDIN', url: 'https://www.linkedin.com/company/comunidade-house-js' }
    ],
    logoUrl: '/assets/images/communities/logos/comunidade-house-js.png'
  },
  {
    name: 'Comunidade Front-end CE',
    email: 'frontendce@eventdev.org',
    description: 'Comunidade se faz com GENTE!',
    links: [
      { type: 'WEBSITE', url: 'https://frontendce.com.br' },
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/frontendce' },
      { type: 'TELEGRAM', url: 'https://t.me/frontendceara' },
      { type: 'WHATSAPP', url: 'https://chat.whatsapp.com/JRO1j1Jq5ty3kxBCqfDsTA' },
      { type: 'LINKEDIN', url: 'https://www.linkedin.com/company/front-end-ce' },
      { type: 'GITHUB', url: 'https://github.com/frontend-ce' }
    ],
    logoUrl: '/assets/images/communities/logos/frontend-ce.png'
  },
  {
    name: 'Coda.ce',
    email: 'codace@eventdev.org',
    description: 'Venha se codar com a gente.',
    links: [
      { type: 'WEBSITE', url: 'https://coda-ce-page.vercel.app' },
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/coda.ce' },
      { type: 'LINKEDIN', url: 'https://www.linkedin.com/company/coda-ce' },
      { type: 'WHATSAPP', url: 'https://chat.whatsapp.com/JKXDuqzPU0x4NgmZX4slrN' }
    ],
    logoUrl: '/assets/images/communities/logos/coda-ce.png'
  },
  {
    name: 'GDG Fortaleza',
    email: 'gdgfortaleza@eventdev.org',
    description: 'Google Developers Groups Fortaleza.',
    links: [
      { type: 'WEBSITE', url: 'https://www.gdgfortaleza.com' },
      { type: 'EMAIL', url: 'gdgfortaleza@gmail.com' },
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/gdgfortalezaoficial' },
      { type: 'LINKEDIN', url: 'https://www.linkedin.com/company/gdgfortaleza' },
      { type: 'GITHUB', url: 'https://github.com/gdgfortaleza' },
      { type: 'WHATSAPP', url: 'https://chat.whatsapp.com/DRmEep9fxj99KUdFPz8Ehu' },
    ],
    logoUrl: '/assets/images/communities/logos/gdg-fortaleza.png'
  },
  {
    name: 'RH Otimizado',
    email: 'rhotimizado@eventdev.org',
    description: 'Comunidade de RH com propósito de compartilhar conteúdos da área de RH carreira, mercado de trabalho e currículo.',
    links: [
      { type: 'WEBSITE', url: 'https://rhotimizado.github.io' },
      { type: 'WHATSAPP', url: ' https://chat.whatsapp.com/Jz8Su9eYlhhA9RvS5fPWuw' },
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/rh.otimizado' },
      { type: 'LINKEDIN', url: 'https://www.linkedin.com/company/rh-otimizado' },
      { type: 'EMAIL', url: 'comunidaderh23@gmail.com' }
    ],
    logoUrl: '/assets/images/communities/logos/rh-otimizado.png'
  },
  {
    name: 'JavaScript Ceará',
    email: 'javascriptceara@eventdev.org',
    description: 'Comunidade cearense de JavaScript.',
    links: [
      { type: 'WEBSITE', url: 'https://www.javascript-ceara.org' },
      { type: 'WHATSAPP', url: 'https://chat.whatsapp.com/H0wNWNHLwsiDGOeK0wY1Jr' },
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/javascriptceara' },
      { type: 'YOUTUBE', url: 'https://www.youtube.com/@javascriptceara' },
      { type: 'LINKEDIN', url: 'https://www.linkedin.com/company/javascript-ceara' }
    ],
    logoUrl: '/assets/images/communities/logos/javascript-ce.png'
  },
  {
    name: 'GitTogether Fortaleza',
    email: 'gittogether@eventdev.org',
    description: 'Comunidade OpenSource em Fortaleza-CE.',
    links: [
      { type: 'WHATSAPP', url: 'https://chat.whatsapp.com/B5nuZOxxHNqEMoxvDC679B' },
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/gtcfortaleza' }
    ],
    logoUrl: '/assets/images/communities/logos/gittogether-fortaleza.png'
  },
  {
    name: 'Mobile Devs Ceará',
    email: 'mobiledevsceara@eventdev.org',
    description: 'A Mobile Devs Ceará é uma comunidade de Desenvolvimento Mobile, criada em 2023 com o objetivo de promover o aprendizado e o uso de tecnologias mobile.',
    links: [
      { type: 'WHATSAPP', url: 'https://chat.whatsapp.com/FHvcHHHzHd94sd4OsBN4Aj' },
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/mobiledevsceara' }
    ],
    logoUrl: '/assets/images/communities/logos/mobile-devs-ceara.png'
  },
  {
    name: 'Cocoa Heads Fortaleza',
    email: 'cocoaheadsfortaleza@eventdev.org',
    description: 'O maior evento da comunidade de desenvolvimento iOS de Fortaleza.',
    links: [
      { type: 'WHATSAPP', url: 'https://chat.whatsapp.com/JRdpQz1k6Jw5UtN2TaXvip' },
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/cocoaheadsfortaleza' },
      { type: 'LINKEDIN', url: 'https://www.linkedin.com/company/cocoaheads-fortaleza' }
    ],
    logoUrl: '/assets/images/communities/logos/cocoa-heads-fortaleza.png'
  },
  {
    name: 'Agilizem Podcast',
    email: 'agilizempodcast@eventdev.org',
    description: 'O maior Podcast de agilidade Nordeste.',
    links: [
      { type: 'WHATSAPP', url: 'https://chat.whatsapp.com/GygSHs00qMe9dDIbEvH4sy' },
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/agilizempodcast' },
      { type: 'LINKEDIN', url: 'https://www.linkedin.com/company/agilizem-podcast' },
      { type: 'YOUTUBE', url: 'https://www.youtube.com/@agilizempodcast' }
    ],
    logoUrl: '/assets/images/communities/logos/agilizem-podcast.png'
  },
  {
    name: 'Javax Ce',
    email: 'javaxce@eventdev.org',
    description: 'Comunidade de Java do Ceará.',
    links: [
      { type: 'WHATSAPP', url: 'https://chat.whatsapp.com/KRvBeHJThGyBVFBK92m3IR' },
      { type: 'INSTAGRAM', url: 'https://www.instagram.com/javaxce' },
      { type: 'LINKEDIN', url: 'https://www.linkedin.com/company/javaxce' },
      { type: 'YOUTUBE', url: 'https://www.youtube.com/@JavaxCE' }
    ],
    logoUrl: '/assets/images/communities/logos/javax-ce.png'
  }
] satisfies ReadonlyArray<CommunitySeed>

export interface VisitorSeed {
  email: string
  name: string
}

export const visitorSeedData = [
  { email: 'visitor1@eventdev.org', name: 'Visitor One' },
  { email: 'visitor2@eventdev.org', name: 'Visitor Two' },
  { email: 'visitor3@eventdev.org', name: 'Visitor Three' }
] satisfies ReadonlyArray<VisitorSeed>

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
  // PHP com Rapadura
  {
    community: 'PHP com Rapadura',
    title: 'PHP Community Summit 2024',
    description: 'O maior evento de PHP do Nordeste, reunindo desenvolvedores de todo o Brasil.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/php-summit.jpg',
    link: 'https://phpcomrapadura.org/summit',
    startDateTime: new Date('2024-09-14T08:00:00'),
    endDateTime: new Date('2024-09-15T18:00:00'),
    address: ADDRESS_UNIFOR
  },
  {
    community: 'PHP com Rapadura',
    title: 'PHP Day Fortaleza 2024',
    description: 'Um dia inteiro de palestras e workshops sobre PHP e ecossistema.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/php-day.jpg',
    link: 'https://phpcomrapadura.org/day',
    startDateTime: new Date('2024-05-18T09:00:00'),
    endDateTime: new Date('2024-05-18T17:00:00'),
    address: ADDRESS_DRAGAO
  },
  {
    community: 'PHP com Rapadura',
    title: 'Meetup PHP com Rapadura - Edição Especial',
    description: 'Edição especial de fim de ano com networking e palestras.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/php-meetup.jpg',
    link: 'https://meetup.com/phpcomrapadura',
    startDateTime: new Date('2023-11-25T19:00:00'),
    endDateTime: new Date('2023-11-25T22:00:00'),
    address: ADDRESS_RIOMAR
  },
  {
    community: 'PHP com Rapadura',
    title: 'PHP com Rapadura Talks',
    description: 'Série de palestras online sobre boas práticas e arquitetura.',
    modality: 'ONLINE',
    coverUrl: '/assets/images/events/php-talks.jpg',
    link: 'https://youtube.com/phpcomrapadura',
    startDateTime: new Date('2024-03-10T19:00:00'),
    endDateTime: new Date('2024-03-10T21:00:00')
  },

  // Comunidade HouseJS
  {
    community: 'Comunidade HouseJS',
    title: 'HouseJS Conf 2024',
    description: 'Conferência anual da comunidade HouseJS com foco em JavaScript e Web.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/housejs-conf.jpg',
    link: 'https://housejs.com.br/conf',
    startDateTime: new Date('2024-10-05T08:00:00'),
    endDateTime: new Date('2024-10-05T18:00:00'),
    address: ADDRESS_UNIFOR
  },
  {
    community: 'Comunidade HouseJS',
    title: 'HouseJS Meetup #15',
    description: 'Encontro mensal da comunidade para discutir novidades do ecossistema JS.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/housejs-meetup.jpg',
    link: 'https://meetup.com/housejs',
    startDateTime: new Date('2024-06-15T19:00:00'),
    endDateTime: new Date('2024-06-15T22:00:00'),
    address: ADDRESS_DRAGAO
  },
  {
    community: 'Comunidade HouseJS',
    title: 'Workshop HouseJS: Construindo APIs',
    description: 'Aprenda a construir APIs RESTful com Node.js e Express.',
    modality: 'ONLINE',
    coverUrl: '/assets/images/events/housejs-workshop.jpg',
    link: 'https://youtube.com/housejs',
    startDateTime: new Date('2024-02-20T19:00:00'),
    endDateTime: new Date('2024-02-20T21:00:00')
  },
  {
    community: 'Comunidade HouseJS',
    title: 'HouseJS Talks: O Futuro do JS',
    description: 'Discussão sobre as novas features do ECMAScript e o futuro da linguagem.',
    modality: 'ONLINE',
    coverUrl: '/assets/images/events/housejs-talks.jpg',
    link: 'https://youtube.com/housejs',
    startDateTime: new Date('2023-12-10T20:00:00'),
    endDateTime: new Date('2023-12-10T21:30:00')
  },

  // Comunidade Front-end CE
  {
    community: 'Comunidade Front-end CE',
    title: 'Front-End Day 2025',
    description: 'O maior evento de Front-end do Ceará, com palestrantes nacionais e internacionais.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/frontend-day.jpg',
    link: 'https://frontendce.com.br/day',
    startDateTime: new Date('2025-05-24T08:00:00'),
    endDateTime: new Date('2025-05-24T18:00:00'),
    address: ADDRESS_UNIFOR
  },
  {
    community: 'Comunidade Front-end CE',
    title: 'Front-End CE Meetup #22',
    description: 'Encontro da comunidade com palestras sobre React, Vue e CSS.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/frontend-meetup.jpg',
    link: 'https://meetup.com/frontendce',
    startDateTime: new Date('2024-08-10T14:00:00'),
    endDateTime: new Date('2024-08-10T17:00:00'),
    address: ADDRESS_RIOMAR
  },
  {
    community: 'Comunidade Front-end CE',
    title: 'Front-End CE Workshop: Acessibilidade',
    description: 'Workshop prático sobre como criar interfaces acessíveis na web.',
    modality: 'ONLINE',
    coverUrl: '/assets/images/events/frontend-a11y.jpg',
    link: 'https://youtube.com/frontendce',
    startDateTime: new Date('2024-04-15T19:00:00'),
    endDateTime: new Date('2024-04-15T21:00:00')
  },
  {
    community: 'Comunidade Front-end CE',
    title: 'Front-End CE: React & Beyond',
    description: 'Explorando o ecossistema React e suas ferramentas.',
    modality: 'ONLINE',
    coverUrl: '/assets/images/events/frontend-react.jpg',
    link: 'https://youtube.com/frontendce',
    startDateTime: new Date('2023-11-05T19:00:00'),
    endDateTime: new Date('2023-11-05T20:30:00')
  },

  // Coda.ce
  {
    community: 'Coda.ce',
    title: 'Coda.ce Summit 2024',
    description: 'Evento anual reunindo todas as comunidades de tecnologia do Ceará.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/codace-summit.jpg',
    link: 'https://coda.ce/summit',
    startDateTime: new Date('2024-11-15T09:00:00'),
    endDateTime: new Date('2024-11-16T18:00:00'),
    address: ADDRESS_UNIFOR
  },
  {
    community: 'Coda.ce',
    title: 'Coda.ce Meetup: Carreira Dev',
    description: 'Painel sobre carreira, mercado de trabalho e dicas para devs.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/codace-career.jpg',
    link: 'https://meetup.com/codace',
    startDateTime: new Date('2024-07-20T14:00:00'),
    endDateTime: new Date('2024-07-20T17:00:00'),
    address: ADDRESS_DRAGAO
  },
  {
    community: 'Coda.ce',
    title: 'Coda.ce Hackathon',
    description: 'Maratona de programação para resolver problemas reais da comunidade.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/codace-hackathon.jpg',
    link: 'https://coda.ce/hackathon',
    startDateTime: new Date('2024-03-23T08:00:00'),
    endDateTime: new Date('2024-03-24T18:00:00'),
    address: ADDRESS_RIOMAR
  },
  {
    community: 'Coda.ce',
    title: 'Coda.ce Talks: Inovação',
    description: 'Palestras sobre inovação, startups e tecnologia.',
    modality: 'ONLINE',
    coverUrl: '/assets/images/events/codace-talks.jpg',
    link: 'https://youtube.com/codace',
    startDateTime: new Date('2024-01-15T19:00:00'),
    endDateTime: new Date('2024-01-15T20:30:00')
  },

  // GDG Fortaleza
  {
    community: 'GDG Fortaleza',
    title: 'DevFest Fortaleza 2024',
    description: 'O maior evento da comunidade Google em Fortaleza, com diversas trilhas de conhecimento.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/devfest.jpg',
    link: 'https://devfest.gdgfortaleza.com',
    startDateTime: new Date('2024-12-07T08:00:00'),
    endDateTime: new Date('2024-12-07T18:00:00'),
    address: ADDRESS_UNIFOR
  },
  {
    community: 'GDG Fortaleza',
    title: 'Google I/O Extended Fortaleza 2024',
    description: 'Versão local do Google I/O, trazendo as novidades apresentadas na Califórnia.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/io-extended.jpg',
    link: 'https://gdgfortaleza.com/io',
    startDateTime: new Date('2024-07-13T13:00:00'),
    endDateTime: new Date('2024-07-13T18:00:00'),
    address: ADDRESS_RIOMAR
  },
  {
    community: 'GDG Fortaleza',
    title: 'International Women\'s Day 2024',
    description: 'Evento em celebração ao Dia Internacional da Mulher, focado em tecnologia e liderança feminina.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/iwd.jpg',
    link: 'https://wtm.gdgfortaleza.com',
    startDateTime: new Date('2024-04-06T09:00:00'),
    endDateTime: new Date('2024-04-06T17:00:00'),
    address: ADDRESS_DRAGAO
  },
  {
    community: 'GDG Fortaleza',
    title: 'Cloud Hero: Google Cloud Study Jam',
    description: 'Workshop prático de Google Cloud Platform com laboratórios e desafios.',
    modality: 'ONLINE',
    coverUrl: '/assets/images/events/cloud-hero.jpg',
    link: 'https://youtube.com/gdgfortaleza',
    startDateTime: new Date('2023-10-20T19:00:00'),
    endDateTime: new Date('2023-10-20T21:00:00')
  },

  // RH Otimizado
  {
    community: 'RH Otimizado',
    title: 'RH Tech Summit 2024',
    description: 'Evento focado na intersecção entre Recursos Humanos e Tecnologia.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/rh-summit.jpg',
    link: 'https://rhotimizado.com/summit',
    startDateTime: new Date('2024-09-21T09:00:00'),
    endDateTime: new Date('2024-09-21T17:00:00'),
    address: ADDRESS_UNIFOR
  },
  {
    community: 'RH Otimizado',
    title: 'Workshop: Agilidade no RH',
    description: 'Como aplicar metodologias ágeis nos processos de RH.',
    modality: 'ONLINE',
    coverUrl: '/assets/images/events/rh-agile.jpg',
    link: 'https://youtube.com/rhotimizado',
    startDateTime: new Date('2024-06-10T19:00:00'),
    endDateTime: new Date('2024-06-10T21:00:00')
  },
  {
    community: 'RH Otimizado',
    title: 'RH Otimizado Meetup: Cultura Organizacional',
    description: 'Debate sobre construção e manutenção de cultura em empresas de tecnologia.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/rh-meetup.jpg',
    link: 'https://meetup.com/rhotimizado',
    startDateTime: new Date('2024-03-15T18:30:00'),
    endDateTime: new Date('2024-03-15T21:00:00'),
    address: ADDRESS_DRAGAO
  },
  {
    community: 'RH Otimizado',
    title: 'Webinar: Futuro do Trabalho',
    description: 'Tendências e desafios para o futuro do trabalho no setor tech.',
    modality: 'ONLINE',
    coverUrl: '/assets/images/events/rh-webinar.jpg',
    link: 'https://youtube.com/rhotimizado',
    startDateTime: new Date('2023-11-10T19:00:00'),
    endDateTime: new Date('2023-11-10T20:30:00')
  },

  // JavaScript Ceará
  {
    community: 'JavaScript Ceará',
    title: '12º Meetup JavaScript Ceará',
    description: 'Encontro focado em desenvolvimento fullstack com palestras sobre Next.js e Supabase.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/js-meetup-12.jpg',
    link: 'https://meetup.com/javascriptceara',
    startDateTime: new Date('2024-12-14T14:00:00'),
    endDateTime: new Date('2024-12-14T18:00:00'),
    address: ADDRESS_UNIFOR
  },
  {
    community: 'JavaScript Ceará',
    title: '5º Meetup ReactJS Ceará',
    description: 'Edição especial do meetup de ReactJS organizado em parceria com a comunidade JavaScript Ceará.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/react-meetup.jpg',
    link: 'https://meetup.com/javascriptceara',
    startDateTime: new Date('2024-10-19T14:00:00'),
    endDateTime: new Date('2024-10-19T17:00:00'),
    address: ADDRESS_RIOMAR
  },
  {
    community: 'JavaScript Ceará',
    title: 'I.A. no dia a dia do desenvolvedor',
    description: 'Bate-papo e palestras sobre os impactos e ferramentas de inteligência artificial no cotidiano.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/js-ai.jpg',
    link: 'https://meetup.com/javascriptceara',
    startDateTime: new Date('2024-09-28T09:00:00'),
    endDateTime: new Date('2024-09-28T12:00:00'),
    address: ADDRESS_DRAGAO
  },
  {
    community: 'JavaScript Ceará',
    title: 'JavaScript Ceará: Node.js Deep Dive',
    description: 'Mergulho profundo nas funcionalidades avançadas do Node.js.',
    modality: 'ONLINE',
    coverUrl: '/assets/images/events/js-node.jpg',
    link: 'https://youtube.com/javascriptceara',
    startDateTime: new Date('2024-05-20T19:00:00'),
    endDateTime: new Date('2024-05-20T21:00:00')
  },

  // GitTogether Fortaleza
  {
    community: 'GitTogether Fortaleza',
    title: 'GitTogether - Edição Abril 2024',
    description: 'Encontro da comunidade com palestras técnicas sobre Git, GitHub e Open Source.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/gittogether-apr.jpg',
    link: 'https://meetup.com/gittogether',
    startDateTime: new Date('2024-04-13T14:00:00'),
    endDateTime: new Date('2024-04-13T17:00:00'),
    address: ADDRESS_UNIFOR
  },
  {
    community: 'GitTogether Fortaleza',
    title: 'GitTogether - Edição Outubro 2023',
    description: 'Meetup presencial com palestras sobre carreira e tecnologia.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/gittogether-oct.jpg',
    link: 'https://meetup.com/gittogether',
    startDateTime: new Date('2023-10-21T14:00:00'),
    endDateTime: new Date('2023-10-21T17:00:00'),
    address: ADDRESS_RIOMAR
  },
  {
    community: 'GitTogether Fortaleza',
    title: 'GitTogether - Kick-off 2024',
    description: 'Primeiro evento do ano reunindo a comunidade para alinhar expectativas.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/gittogether-kickoff.jpg',
    link: 'https://meetup.com/gittogether',
    startDateTime: new Date('2024-01-20T09:00:00'),
    endDateTime: new Date('2024-01-20T12:00:00'),
    address: ADDRESS_DRAGAO
  },
  {
    community: 'GitTogether Fortaleza',
    title: 'GitTogether: Open Source Night',
    description: 'Noite dedicada a contribuições open source e networking.',
    modality: 'ONLINE',
    coverUrl: '/assets/images/events/gittogether-osn.jpg',
    link: 'https://youtube.com/gittogether',
    startDateTime: new Date('2024-07-10T19:00:00'),
    endDateTime: new Date('2024-07-10T21:00:00')
  },

  // Mobile Devs Ceará
  {
    community: 'Mobile Devs Ceará',
    title: 'DevFest Fortaleza 2024 (Parceiro)',
    description: 'A comunidade Mobile Devs Ceará atuou como parceira oficial no maior evento de tecnologia do GDG.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/mobile-devfest.jpg',
    link: 'https://devfest.gdgfortaleza.com',
    startDateTime: new Date('2024-12-07T08:00:00'),
    endDateTime: new Date('2024-12-07T18:00:00'),
    address: ADDRESS_UNIFOR
  },
  {
    community: 'Mobile Devs Ceará',
    title: 'DevOpsDays Fortaleza 2024 (Parceiro)',
    description: 'Participação e apoio da comunidade no evento focado em cultura DevOps.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/mobile-devops.jpg',
    link: 'https://devopsdays.org/fortaleza',
    startDateTime: new Date('2024-09-14T08:00:00'),
    endDateTime: new Date('2024-09-14T18:00:00'),
    address: ADDRESS_RIOMAR
  },
  {
    community: 'Mobile Devs Ceará',
    title: 'Google I/O Extended 2024 Fortaleza',
    description: 'Encontro para discutir as novidades apresentadas no Google I/O, com foco em mobile.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/mobile-io.jpg',
    link: 'https://gdgfortaleza.com/io',
    startDateTime: new Date('2024-07-13T13:00:00'),
    endDateTime: new Date('2024-07-13T18:00:00'),
    address: ADDRESS_UNIFOR
  },
  {
    community: 'Mobile Devs Ceará',
    title: 'Mobile Devs Meetup: Flutter & Kotlin',
    description: 'Palestras técnicas sobre desenvolvimento híbrido e nativo.',
    modality: 'ONLINE',
    coverUrl: '/assets/images/events/mobile-meetup.jpg',
    link: 'https://youtube.com/mobiledevsceara',
    startDateTime: new Date('2024-03-20T19:00:00'),
    endDateTime: new Date('2024-03-20T21:00:00')
  },

  // Cocoa Heads Fortaleza
  {
    community: 'Cocoa Heads Fortaleza',
    title: 'CocoaHeads Fortaleza - Edição Dezembro 2024',
    description: 'Encontro de encerramento do ano com palestras sobre o ecossistema Apple.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/cocoa-dec.jpg',
    link: 'https://meetup.com/cocoaheadsfortaleza',
    startDateTime: new Date('2024-12-10T19:00:00'),
    endDateTime: new Date('2024-12-10T22:00:00'),
    address: ADDRESS_UNIFOR
  },
  {
    community: 'Cocoa Heads Fortaleza',
    title: '20º CocoaHeads Fortaleza',
    description: 'Edição comemorativa do encontro da comunidade Apple Developers do Ceará.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/cocoa-20.jpg',
    link: 'https://meetup.com/cocoaheadsfortaleza',
    startDateTime: new Date('2024-11-12T19:00:00'),
    endDateTime: new Date('2024-11-12T22:00:00'),
    address: ADDRESS_DRAGAO
  },
  {
    community: 'Cocoa Heads Fortaleza',
    title: '18º CocoaHeads Fortaleza',
    description: 'Meetup técnico com apresentações sobre as novidades da linguagem Swift.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/cocoa-18.jpg',
    link: 'https://meetup.com/cocoaheadsfortaleza',
    startDateTime: new Date('2023-11-14T19:00:00'),
    endDateTime: new Date('2023-11-14T22:00:00'),
    address: ADDRESS_RIOMAR
  },
  {
    community: 'Cocoa Heads Fortaleza',
    title: 'CocoaHeads: WWDC 24 Recap',
    description: 'Resumo das novidades apresentadas na WWDC 2024.',
    modality: 'ONLINE',
    coverUrl: '/assets/images/events/cocoa-wwdc.jpg',
    link: 'https://youtube.com/cocoaheadsfortaleza',
    startDateTime: new Date('2024-06-15T10:00:00'),
    endDateTime: new Date('2024-06-15T12:00:00')
  },

  // Agilizem Podcast
  {
    community: 'Agilizem Podcast',
    title: 'Podcast Agilizem - Esquenta Agile Brazil',
    description: 'Episódio especial ao vivo discutindo o cenário de agilidade no Nordeste.',
    modality: 'ONLINE',
    coverUrl: '/assets/images/events/agilizem-esquenta.jpg',
    link: 'https://youtube.com/agilizempodcast',
    startDateTime: new Date('2024-09-05T19:00:00'),
    endDateTime: new Date('2024-09-05T20:30:00')
  },
  {
    community: 'Agilizem Podcast',
    title: 'IWD 2024 - Podcast Agilizem ao Vivo',
    description: 'Gravação especial durante o International Women\'s Day, abordando liderança feminina.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/agilizem-iwd.jpg',
    link: 'https://agilizempodcast.com',
    startDateTime: new Date('2024-04-06T14:00:00'),
    endDateTime: new Date('2024-04-06T16:00:00'),
    address: ADDRESS_UNIFOR
  },
  {
    community: 'Agilizem Podcast',
    title: 'Agile Day com Podcast Agilizem',
    description: 'Evento presencial imersivo com workshops e gravações sobre metodologias ágeis.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/agilizem-day.jpg',
    link: 'https://agilizempodcast.com',
    startDateTime: new Date('2023-11-18T09:00:00'),
    endDateTime: new Date('2023-11-18T17:00:00'),
    address: ADDRESS_DRAGAO
  },
  {
    community: 'Agilizem Podcast',
    title: 'Agilizem Talks: Liderança Ágil',
    description: 'Conversa sobre os desafios da liderança em ambientes ágeis.',
    modality: 'ONLINE',
    coverUrl: '/assets/images/events/agilizem-talks.jpg',
    link: 'https://youtube.com/agilizempodcast',
    startDateTime: new Date('2024-02-15T19:00:00'),
    endDateTime: new Date('2024-02-15T20:30:00')
  },

  // Javax Ce
  {
    community: 'Javax Ce',
    title: '3º Meetup Presencial Javax CE',
    description: 'Encontro da comunidade Java do Ceará com palestras sobre arquitetura de software.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/javax-3.jpg',
    link: 'https://meetup.com/javaxce',
    startDateTime: new Date('2024-11-09T14:00:00'),
    endDateTime: new Date('2024-11-09T17:00:00'),
    address: ADDRESS_UNIFOR
  },
  {
    community: 'Javax Ce',
    title: '2º Meetup Presencial Javax CE',
    description: 'Meetup focado em networking e compartilhamento de conhecimento sobre Java.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/javax-2.jpg',
    link: 'https://meetup.com/javaxce',
    startDateTime: new Date('2024-07-27T14:00:00'),
    endDateTime: new Date('2024-07-27T17:00:00'),
    address: ADDRESS_RIOMAR
  },
  {
    community: 'Javax Ce',
    title: '1º Meetup Presencial Javax CE (Retomada)',
    description: 'Evento de retomada das atividades presenciais da comunidade.',
    modality: 'PRESENTIAL',
    coverUrl: '/assets/images/events/javax-1.jpg',
    link: 'https://meetup.com/javaxce',
    startDateTime: new Date('2024-05-18T14:00:00'),
    endDateTime: new Date('2024-05-18T17:00:00'),
    address: ADDRESS_DRAGAO
  },
  {
    community: 'Javax Ce',
    title: 'Javax CE: Spring Boot 3 Launch Party',
    description: 'Celebrando o lançamento do Spring Boot 3 com palestras e demos.',
    modality: 'ONLINE',
    coverUrl: '/assets/images/events/javax-spring.jpg',
    link: 'https://youtube.com/javaxce',
    startDateTime: new Date('2023-12-05T19:00:00'),
    endDateTime: new Date('2023-12-05T21:00:00')
  }
] satisfies ReadonlyArray<EventSeed>
