# Testes E2E - Estrutura Organizada

Este diretório contém todos os testes end-to-end (e2e) do EventDev Server, organizados por domínio e funcionalidade.

## Estrutura de Pastas

```bash
test/
├── auth/                          # Testes de autenticação
│   ├── auth-session.e2e-spec.ts   # Testes de cookies de sessão SuperTokens
│   └── auth-signup.e2e-spec.ts    # Testes de cadastro
│
├── community/                     # Testes de comunidades (futuro)
│
├── event/                         # Testes de eventos (futuro)
│
├── infrastructure/                # Testes de infraestrutura
│   ├── diagnostic.e2e-spec.ts     # Smoke test (inicialização da aplicação)
│   └── rate-limit.e2e-spec.ts     # Testes de rate limiting
│
├── helpers/                       # Utilitários de teste
│   └── auth.helper.ts             # Helpers para criar usuários/comunidades
│
├── integration.e2e-spec.ts        # Testes de integração geral (múltiplos módulos)
│
└── README.md                      # Este arquivo
```

## Suítes de Testes

### Autenticação (`test/auth/`)

- **auth-session.e2e-spec.ts** (8 testes)
  - Criação de cookies de sessão
  - Persistência de sessão
  - Validação de identidade via cookies
  - Segurança (HttpOnly, SameSite)

- **auth-signup.e2e-spec.ts** (1 teste)
  - Teste rápido de cadastro de comunidade

### Infraestrutura (`test/infrastructure/`)

- **diagnostic.e2e-spec.ts** (1 teste)
  - Smoke test para CI/CD
  - Valida inicialização da aplicação sem erros

- **rate-limit.e2e-spec.ts** (10 testes)
  - Rate limiting em rotas públicas
  - Rate limiting em rotas de auth
  - Diferentes limites por grupo de rotas
  - Headers de rate limit
  - Bypass de configuração

### Integração (`test/integration.e2e-spec.ts`)

- **21 testes** cobrindo:
  - Fluxo completo de autenticação
  - API de comunidades
  - API de eventos (rotas públicas)
  - Tratamento de erros
  - Validação de dados
  - Segurança (XSS, SQL injection)

## Total de Testes

### 41 testes e2e passando (100%)

- 8 testes de sessão (auth/)
- 1 teste de signup (auth/)
- 1 teste de diagnóstico (infrastructure/)
- 10 testes de rate limit (infrastructure/)
- 21 testes de integração (root)

## Como Executar

```bash
# Todos os testes e2e
make test-e2e

# Rodar com --detectOpenHandles
make test-e2e-debug

# Preparar banco/Redis manualmente
make prepare-test-db
```

> Para executar apenas uma suíte específica, use diretamente `pnpm test-e2e -- path/do/arquivo`. Os comandos `make` acima já encapsulam as dependências e o pretest.

### Pré-requisitos rápidos

1. **Suba as dependências externas** (Postgres, Redis e SuperTokens) antes de rodar os testes:

```bash
make test-deps-up
```

Use `make test-deps-down` para desligar os containers auxiliares quando terminar.

1. **Deixe o script de preparação trabalhar por você**. Os comandos `make test-e2e` e `make test-e2e-debug` executam automaticamente `tools/testing/prepare-test-db.mjs`, que:

- Cria o banco `gt_test` (caso não exista) e aplica as migrações via Prisma.
- Faz flush do banco Redis de rate limiting, garantindo que os testes `rate-limit.e2e-spec.ts` sempre iniciem sem resíduos de execuções anteriores.

Se precisar executar o preparo manualmente (por exemplo em uma pipeline), use:

```bash
make prepare-test-db
```

### Modos especiais

- **Debug com open handles**: `make test-e2e-debug` roda `jest --detectOpenHandles` e também dispara o script de preparação.
- **Execução sequencial**: quando precisar rodar tudo em série, use diretamente `pnpm jest --config ./test/jest-e2e.json --runInBand`.

## Componentes relevantes

- `src/module/auth/auth.module.ts`: registra o `AuthService`, injeta o `SuperTokensAdapter` (`IAuthAdapter`) e expõe o módulo para outras features. Se os testes precisarem mockar autenticação, é aqui que o provider deve ser sobreposto.
- `src/module/auth/auth.service.ts`: contém todos os fluxos de signup/signin usados nas suítes de autenticação e integração. O método `signInWithSession` utiliza `SessionRecipe` para criar cookies reais durante os testes.
- `src/common/rate-limiter/rate-limiter.service.ts`: implementação do algoritmo de sliding window em Redis. O `onApplicationShutdown` fecha o client para evitar avisos de handles abertos no Jest; por isso, sempre use o script de preparação para garantir que a base do Redis esteja limpa antes de iniciar os testes.

## Helpers de Teste

O arquivo `helpers/auth.helper.ts` fornece funções utilitárias:

- `createTestUser()` - Cria usuário de teste no banco
- `createTestCommunity()` - Cria comunidade de teste
- `createTestCommunityUser()` - Cria usuário + comunidade
- `verifyUserExists()` - Verifica existência de usuário
- `verifyCommunityExists()` - Verifica existência de comunidade
- `cleanupTestUsers()` - Limpa usuários de teste
- `cleanupTestCommunities()` - Limpa comunidades de teste

Esses helpers permitem testar a lógica de negócio sem depender de cookies de sessão.

## Convenções

1. **Nomenclatura**: `[feature].e2e-spec.ts`
2. **Organização**: Por domínio/funcionalidade
3. **Isolamento**: Cada arquivo de teste deve limpar seus próprios dados
4. **Timeout**: 20 segundos (configurado em `jest-e2e.json`)
5. **Rate Limiting**: Desabilitado por padrão em `.env.test`

## Padrões de Teste

### Testes de Integração

Testam múltiplos módulos trabalhando juntos, focando em:

- Fluxos completos de usuário
- Validações de negócio
- Tratamento de erros
- Segurança

  - Validação de dados
  - Segurança

### Testes de Infraestrutura

Testam componentes técnicos como:

- Inicialização da aplicação
- Rate limiting
- Middlewares
  - Guards

### Testes de Domínio

Focam em funcionalidades específicas:

- Autenticação e autorização
- Gestão de comunidades
- Gestão de eventos

## Próximos Passos

Para adicionar novos testes:

1. **Identifique o domínio**: auth, community, event, etc.
2. **Crie o arquivo**: `test/[domínio]/[feature].e2e-spec.ts`
3. **Use helpers**: Aproveite `helpers/auth.helper.ts` para setup
4. **Limpe dados**: Garanta limpeza no `afterAll()`
5. **Execute**: `pnpm test-e2e -- [seu-arquivo]`

## Cobertura

Os testes e2e cobrem:

- Autenticação (signup, signin, sessão)
- Comunidades (CRUD, busca, filtros)
- Eventos (listagem, paginação, filtros)
- Rate limiting
- Tratamento de erros
- Validações de segurança
- HATEOAS navigation links
- 🚧 Tickets (a ser implementado)
- 🚧 Pedidos (a ser implementado)
