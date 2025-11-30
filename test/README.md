# Testes - EventDev Server

Este diretório contém a configuração e os arquivos para testes automatizados (Unitários e E2E).

## Estrutura de Diretórios

A suíte de testes foi reorganizada para melhor escalabilidade e separação de responsabilidades:

- **`e2e/`**: Testes de ponta a ponta (End-to-End).
  - `integration.e2e-spec.ts`: Teste de jornada crítica (Happy Path).
  - `features/`: Testes E2E específicos por funcionalidade.
  - `infrastructure/`: Testes E2E de infraestrutura (Health Check, Rate Limit, etc).
- **`unit/`**: Testes unitários isolados.
  - `features/`: Testes unitários de regras de negócio (Services, Controllers).
  - `infrastructure/`: Testes unitários de adaptadores e configurações.
- **`setup/`**: Scripts de configuração global.
  - `setup-e2e.ts`: Configuração do ambiente de testes E2E (SuperTokens, Env vars).
  - `prepare-test-db.ts`: Script para preparar o banco de dados de teste (Reset + Seed).
  - `snapshot-resolver.ts`: Configuração para resolução de snapshots do Jest.
- **`helpers/`**: Funções auxiliares e factories para os testes.

## Executando Testes

### Todos os Testes

Para garantir a integridade completa do sistema (Unitários + E2E):

```bash
pnpm test-all
```

### Apenas E2E

Executa a suíte de testes de integração. Requer Docker (Postgres/Redis) rodando.

```bash
pnpm test-e2e
```

### Apenas Unitários

Executa a suíte de testes unitários. Não requer banco de dados.

```bash
pnpm test
```

### Cobertura

O projeto mantém uma política estrita de qualidade de código.
**Meta de Cobertura**: > 90%

```bash
pnpm test-cov
```

## Notas sobre o Banco de Dados de Teste

Os testes E2E utilizam um banco de dados real (PostgreSQL). O script `test/setup/prepare-test-db.ts` é executado automaticamente antes dos testes (`pretest-e2e`) para garantir que o banco esteja limpo e com os dados de seed necessários.
