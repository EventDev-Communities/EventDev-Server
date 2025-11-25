# Testes - EventDev Server

Este diretório contém a configuração e os arquivos para testes de integração (E2E).

## Estrutura

- `integration.e2e-spec.ts`: Arquivo principal de testes E2E que valida os fluxos críticos da API.
- `setup-e2e.ts`: Configurações globais para o ambiente de teste.
- `jest-e2e.json`: Configuração do Jest específica para testes E2E.
- `helpers/`: Funções auxiliares para criar cenários de teste (ex: criar usuários, comunidades).

## Executando Testes

### Todos os Testes

Para garantir a integridade completa do sistema:

```bash
pnpm test-all
```

### Apenas E2E

```bash
pnpm test-e2e
```

### Cobertura

O projeto exige uma cobertura mínima de **90%**.

```bash
pnpm test-cov
```

## Notas sobre o Banco de Dados de Teste

Os testes E2E utilizam um banco de dados real (PostgreSQL). O script de teste gerencia a limpeza e o seed dos dados necessários automaticamente.
