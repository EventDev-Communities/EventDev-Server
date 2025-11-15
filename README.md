# EventDev Server API

API RESTful backend para a plataforma EventDev construída com NestJS, Prisma, PostgreSQL, Redis e SuperTokens.

## Documentação da API

A documentação interativa completa está disponível via Swagger:

- **Desenvolvimento**: <http://localhost:5122/api/docs>
- **Produção**: <https://api.eventdev.org/api/docs>

## Setup Rápido

### Desenvolvimento

```bash
make setup-dev    # Criar .env
make dev-up       # Iniciar containers
make dev-logs     # Ver logs
```

### Endpoints Principais

#### Autenticação (`/auth`)

- `POST /auth/signin` - Login de usuário
- `POST /auth/signout` - Logout
- `GET /auth/me` - Dados do usuário logado
- `POST /auth/signup/community` - Cadastro público de comunidade
- `POST /auth/bootstrap/admin` - Criar primeiro admin (uso único)
- `POST /auth/admin/users` - \[ADMIN\] Criar usuário
- `POST /auth/admin/communities` - \[ADMIN\] Criar comunidade

#### Comunidades (`/communities`)

- `GET /communities` - Listar comunidades (público)
- `GET /communities/:id` - Buscar por ID (público)
- `GET /communities/me` - Minha comunidade (requer autenticação)
- `POST /communities` - Criar comunidade
- `PUT /communities/:id` - Atualizar (apenas dono)
- `DELETE /communities/:id` - Deletar (apenas dono)

#### Eventos (`/events`)

- `GET /events` - Listar eventos (público)
- `GET /events/:id` - Buscar por ID (público)
- `POST /events` - Criar evento (requer papel COMMUNITY)
- `PATCH /events/:id` - Atualizar (apenas dono da comunidade)
- `DELETE /events/:id` - Deletar (apenas dono da comunidade)

#### Tickets (`/tickets`)

- `GET /tickets` - Listar tickets (público)
- `GET /tickets/:id` - Buscar por ID (público)
- `POST /tickets` - Criar ticket (requer papel COMMUNITY)
- `PATCH /tickets/:id` - Atualizar (apenas dono)
- `DELETE /tickets/:id` - Deletar (apenas dono)

## Sistema de Autorização

### Papéis (Roles)

- `PLATFORM_ADMIN` - Acesso total ao sistema
- `ADMIN` - Gerenciamento geral
- `COMMUNITY` - Gerenciar comunidade e eventos
- `USER` - Usuário final

### Permissões Granulares

35 permissões específicas incluindo:

- `COMMUNITY_CREATE`, `COMMUNITY_UPDATE`, `COMMUNITY_DELETE`
- `EVENT_CREATE`, `EVENT_MANAGE_OWN`, `EVENT_MANAGE_ALL`
- `TICKET_CREATE`, `TICKET_MANAGE_OWN`
- `ADMIN_ALL` - Wildcard para administradores

### Validações de Propriedade

Guards automáticos validam:

- Comunidades só podem ser editadas por seus donos
- Eventos pertencem à comunidade que os criou
- Tickets são gerenciados pela comunidade do evento

## Arquitetura

### Padrões Implementados

- **Adapter Pattern** - SuperTokens desacoplado via `IAuthAdapter`
- **Guards Chain** - `AuthGuard → RolesGuard → PermissionsGuard → OwnershipGuard`
- **Repository Pattern** - Camada de abstração do Prisma
- **DTO Validation** - class-validator em todas as entradas
- **RESTful Design** - Recursos nomeados no plural, verbos HTTP corretos

****

### Testes Locais (Simula Produção)

```bash
make test-run     # Teste completo da arquitetura
make test-up      # Ambiente de teste local
make test-api     # Testar endpoints da API
make test-down    # Parar ambiente de teste
```

**URLs de Teste:**

- HTTP: <http://localhost:8080>
- HTTPS: <https://localhost:8443> (certificado auto-assinado)
- API Direta: <http://localhost:5123>

### Produção

#### Antes de Tudo: Configurar DNS

> &nbsp;
> Adicionar Registro (Painel de Domínios)
>
> - Type: A
> - Hostname: api.eventdev.org
> - Value: IP_DO_SEU_SERVIDOR
> &nbsp;

```bash
make check-dns    # 1. Verificar DNS
make setup-prod   # 2. Criar .env (editar senhas!)
make prod-up      # 3. Deploy completo
```

## Comandos

| Comando                | Descrição                     |
|------------------------|-------------------------------|
| `make dev-up`          | Desenvolvimento               |
| `make test-run`        | Teste completo da arquitetura |
| `make test-up`         | Ambiente de teste local       |
| `make prod-up`         | Produção                      |
| `make health`          | Testar API HTTP               |
| `make health-https`    | Testar API HTTPS              |
| `make create-networks` | Criar redes Docker            |
| `make status`          | Status dos containers         |
| `make clean`           | Limpar tudo                   |

### Banco de Dados

| Comando           | Descrição              |
|-------------------|------------------------|
| `make db-migrate` | Executar migrações     |
| `make db-seed`    | Popular dados iniciais |
| `make db-studio`  | Interface visual       |
| `make db-reset`   | Reset completo (dev)   |

### Documentação

| Comando               | Descrição                                      |
|-----------------------|------------------------------------------------|
| `make docs-generate`  | Gerar schemas DBML e SQL (docs/schema.*)       |
| `make start-dev`      | Inicia servidor local e gera openapi.json      |

### Logs

| Comando                | Descrição            |
|------------------------|----------------------|
| `make dev-logs`        | Logs desenvolvimento |
| `make prod-logs`       | Logs produção        |
| `make logs-all`        | Todos os logs        |

## Ambientes

### Ambiente Dev

- Dockerfile.dev simplificado (sem build steps)
- Hot reload e debug port 9229
- Health checks similares ao prod
- Volume mapping para desenvolvimento

### Ambiente Prod

- Health checks robustos
- Limites de recursos definidos

## URLs de Acesso

### Dev

- API: <http://localhost:5122>
- Health: <http://localhost:5122/health>
- Debug: `localhost:9229`

### Prod

- API: <https://api.eventdev.org>
- Health: <https://api.eventdev.org/health>

## Configuração DNS

Configure no provedor DNS:

```text
Tipo: A
Nome: api.eventdev.org
Valor: 192.168.1.100
```

Verificar: `make check-dns`

## Troubleshooting

### DNS não resolve

```bash
make check-dns
nslookup api.eventdev.org
```

### Containers não iniciam

```bash
make status
make prod-logs
make clean        # Reset completo
```

## Configuração

### Dev (.env)

```bash
NODE_ENV=development
NODE_PORT=5122
DATABASE_URL="postgresql://user:pass@localhost:5432/eventdev"
REDIS_URL="redis://localhost:6379"
```

### Prod (.env)

```bash
NODE_ENV=production
NODE_PORT=5122
DATABASE_URL="postgresql://user:STRONG_PASS@postgres-db:5432/eventdev"
REDIS_URL="redis://redis-cache:6379"
ALLOWED_ORIGINS="https://eventdev.org,https://api.eventdev.org"
```

## Estrutura

```sh
EventDev-Server/
├── docker-compose.dev.yml    # Desenvolvimento
├── docker-compose.prod.yml   # Produção
├── Makefile                  # Comandos
├── .docker/
│   └── node/
│       ├── Dockerfile.dev    # Build desenvolvimento
│       └── Dockerfile.prod   # Build produção
├── src/                      # Código fonte
└── prisma/                   # Schema e migrações
```

## Tecnologias

- **NestJS**: Framework Node.js
- **Prisma**: ORM TypeScript
- **PostgreSQL**: Banco relacional
- **Redis**: Cache e sessões
- **SuperTokens**: Autenticação
- **Docker**: Containerização

## Deploy

```bash
git pull
make prod-down
make prod-up
make health-https
```

## Monitoramento

### Health Checks

- API, Database, Cache, Auth
- Checks a cada 30s
- Restart automático

### Log Files

```bash
make dev-logs | grep ERROR
make prod-logs | grep -i health
```

## Diferenças Dev vs Prod

| Aspecto   | Dev        | Prod             |
|-----------|------------|------------------|
| Build     | Hot reload | Otimizado        |
| Debug     | Port 9229  | Disabled         |
| Logs      | Verbosos   | Estruturados     |
| Resources | Ilimitados | Limitados        |

## Integração

Este backend funciona em conjunto com o [EventDev-Front](https://github.com/EventDev-Communities/EventDev-Front), utilizando redes Docker compartilhadas para comunicação entre os serviços.
