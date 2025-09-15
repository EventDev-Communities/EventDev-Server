# EventDev Server API

API backend para a plataforma EventDev construída com NestJS, Prisma, PostgreSQL, Redis e SuperTokens.

## Setup Rápido

### Desenvolvimento

```bash
make setup-dev    # Criar .env
make dev-up       # Iniciar containers
make dev-logs     # Ver logs
```

### Produção

```bash
# Configurar DNS: A api.eventdev.org → 192.168.1.100
make check-dns    # Verificar DNS
make setup-prod   # Criar .env (editar senhas!)
make prod-up      # Deploy com SSL automático
```

## Comandos

| Comando             | Descrição                   |
|---------------------|-----------------------------|
| `make dev-up`       | Desenvolvimento             |
| `make prod-up`      | Produção com SSL automático |
| `make health`       | Testar API HTTP             |
| `make health-https` | Testar API HTTPS            |
| `make status`       | Status dos containers       |
| `make clean`        | Limpar tudo                 |

### Banco de Dados

| Comando           | Descrição              |
|-------------------|------------------------|
| `make db-migrate` | Executar migrações     |
| `make db-seed`    | Popular dados iniciais |
| `make db-studio`  | Interface visual       |
| `make db-reset`   | Reset completo (dev)   |

### Logs

| Comando                | Descrição            |
|------------------------|----------------------|
| `make dev-logs`        | Logs desenvolvimento |
| `make prod-logs`       | Logs produção        |
| `make prod-nginx-logs` | Logs Nginx           |
| `make logs-all`        | Todos os logs        |

## Arquitetura

### Ambiente Dev

- Dockerfile.dev simplificado (sem build steps)
- Hot reload e debug port 9229
- Health checks similares ao prod
- Volume mapping para desenvolvimento

### Ambiente Prod

- SSL automático com certbot oficial
- Nginx reverse proxy
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

## SSL Automático

O SSL é configurado automaticamente usando **certbot oficial** no primeiro `make prod-up`:

1. Verifica DNS automaticamente
2. Usa certbot para Let's Encrypt se DNS estiver correto
3. Fallback para certificado auto-assinado se falhar
4. Configura Nginx automaticamente
5. Persiste certificados em volumes Docker

## Troubleshooting

### DNS não resolve

```bash
make check-dns
nslookup api.eventdev.org
```

### SSL falha

```bash
make check-dns    # DNS deve estar OK
make prod-up      # SSL automático
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

```text
EventDev-Server/
├── docker-compose.dev.yml    # Desenvolvimento
├── docker-compose.prod.yml   # Produção
├── Makefile                  # Comandos
├── .docker/
│   ├── nginx/nginx.conf      # Configuração Nginx
│   ├── ssl/                  # Certificados SSL
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
- **Nginx**: Proxy reverso
- **Let's Encrypt**: SSL gratuito

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
| SSL       | HTTP       | HTTPS automático |
| Logs      | Verbosos   | Estruturados     |
| Resources | Ilimitados | Limitados        |
