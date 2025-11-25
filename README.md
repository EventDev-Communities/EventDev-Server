# EventDev Server

## Visão Geral

O **EventDev Server** é a API backend para a plataforma EventDev, construída com **NestJS**.

## Stack Tecnológica

- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL (via Prisma ORM)
- **Autenticação**: SuperTokens
- **Compilação**: SWC (Speedy Web Compiler) para desenvolvimento rápido.

## Scripts Principais

### Desenvolvimento

- `pnpm start-dev`: Inicia o servidor em modo de desenvolvimento (com hot-reload e SWC).
- `pnpm start-debug`: Inicia em modo debug.

### Testes

- `pnpm test`: Executa testes unitários.
- `pnpm test-e2e`: Executa testes de integração (E2E).
- `pnpm test-all`: Executa **todos** os testes (unitários e E2E).
- `pnpm verify-all`: Executa lint, todos os testes e build (verificação completa).
- `pnpm test-cov`: Executa testes com relatório de cobertura.

### Banco de Dados

- `pnpm migrate-prod`: Aplica migrações em produção.
- `pnpm seed-prod`: Popula o banco de dados com dados iniciais.

## Cobertura de Testes

O projeto mantém uma política estrita de qualidade de código.
**Meta de Cobertura**: > 90%

Para verificar a cobertura atual:

```bash
pnpm test-cov
```

## Documentação da API (Swagger)

A documentação interativa (Swagger UI) é gerada automaticamente.

- **URL (Dev)**: `http://localhost:5122/api/docs` (ou a porta configurada).
- A documentação é gerada utilizando o plugin CLI do NestJS, garantindo que DTOs e tipos sejam refletidos corretamente sem necessidade de arquivos de metadados manuais.

## Casos de Uso e Comandos

Abaixo estão os comandos essenciais organizados por ferramenta e caso de uso.

### Makefile (Gerenciamento de Ambiente)

O `Makefile` é a interface principal para gerenciar a infraestrutura Docker.

| Comando | Caso de Uso | Descrição |
| :--- | :--- | :--- |
| `make dev-up` | **Início do Dia** | Sobe todo o ambiente de desenvolvimento (API + Banco + Redis + Auth). |
| `make dev-down` | **Fim do Dia** | Para e remove todos os containers e volumes de desenvolvimento. |
| `make dev-logs` | **Monitoramento** | Exibe os logs da API em tempo real. |
| `make dev-shell` | **Debug Avançado** | Abre um terminal `sh` dentro do container da API. |
| `make test-deps-up` | **Testes Locais** | Sobe apenas as dependências (DB/Redis) para rodar testes locais (`pnpm test`). |
| `make verify-all` | **CI/CD** | Executa a verificação completa (lint, testes, build) dentro do container. |
| `make db-studio` | **Gestão de Dados** | Abre o Prisma Studio para visualizar/editar dados do banco. |

### PNPM (Ciclo de Desenvolvimento)

Comandos para o dia a dia de codificação.

| Comando | Caso de Uso | Descrição |
| :--- | :--- | :--- |
| `pnpm start-dev` | **Codificação** | Roda a API localmente com hot-reload (SWC). |
| `pnpm lint` | **Qualidade** | Verifica e corrige problemas de estilo de código. |
| `pnpm test-all` | **Validação** | Roda testes unitários e E2E em sequência. |
| `pnpm verify-all` | **CI/CD** | Roda lint, testes e build para garantir integridade total. |
| `pnpm build` | **Deploy** | Compila o projeto para a pasta `dist` (produção). |

### Docker (Infraestrutura)

Comandos diretos do Docker Compose (geralmente abstraídos pelo Makefile).

| Comando | Caso de Uso | Descrição |
| :--- | :--- | :--- |
| `docker compose -f docker-compose.dev.yml build` | **Atualização** | Reconstrói as imagens de desenvolvimento (útil após mudar `package.json`). |
| `docker compose -f docker-compose.prod.yml build` | **Simulação Prod** | Constrói a imagem otimizada de produção. |

### Nest CLI (Scaffolding)

Comandos para gerar código boilerplate.

| Comando | Caso de Uso | Descrição |
| :--- | :--- | :--- |
| `nest g resource module/nome` | **Nova Feature** | Cria um novo módulo completo (Controller, Service, DTOs, etc). |
| `nest g module module/nome` | **Estrutura** | Cria apenas o módulo. |
| `nest g service module/nome` | **Lógica** | Cria apenas o service. |

## Roadmap e Checklist

### Implementado e Funcional

- [x] **Infraestrutura Base**: Docker Compose (Dev/Prod), Makefile, CI/CD local (`verify-all`).
- [x] **Autenticação**: SuperTokens (Sessão, Email/Senha), Guards, Decorators (`@CurrentUser`, `@Roles`).
- [x] **Comunidades**: CRUD básico, listagem pública, vínculo com usuário dono.
- [x] **Eventos**: CRUD básico, vínculo com comunidade, modalidades (Online/Presencial).
- [x] **Endereços**: Cadastro e vínculo com eventos presenciais.
- [x] **Segurança**: Rate Limiting (Redis), Helmet, CORS, Cookies HttpOnly.
- [x] **Testes**: Configuração Jest (Unit/E2E), cobertura > 90% nos módulos principais.
- [x] **Banco de Dados**: Prisma ORM, Migrations, Seeds.

### Em Progresso / Parcialmente Implementado

- [ ] **Ingressos (Tickets)**:
  - [x] Estrutura de banco de dados (`Ticket`, `TicketStatus`).
  - [ ] Lógica de emissão (venda/gratuidade).
  - [ ] Controle de vagas (concorrência).
  - [ ] Geração de QR Code/Hash.
- [ ] **Pedidos (Orders)**:
  - [x] Estrutura de banco de dados (`Order`, `OrderItem`, `Product`).
  - [ ] Fluxo de checkout unificado.
- [ ] **Notificações**:
  - [x] Serviço de Email (SMTP) configurado.
  - [x] Envio de email de recuperação de senha.
  - [ ] Emails de confirmação de ingresso.

### Roadmap Futuro (Backlog)

- [ ] **Integração de Pagamento**: Mercado Pago (Pix/Cartão) para ingressos e produtos.
- [ ] **App Mobile (Flutter)**:
  - [ ] Login/Auth.
  - [ ] Leitura de QR Code para Check-in.
- [ ] **Gestão de Equipe**:
  - [ ] Convite de membros para staff da comunidade.
  - [ ] Permissões granulares.
- [ ] **Gamificação**: Badges e conquistas para participantes frequentes.
