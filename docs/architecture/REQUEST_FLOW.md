# Fluxo de Requisição e Rede da API

Este documento ilustra o fluxo de uma requisição HTTP através da infraestrutura do EventDev Server, detalhando as camadas de rede, segurança e persistência.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Client (Web/Mobile)
    participant API as NestJS API (Port 5122)
    participant Redis as Redis (Cache/RateLimit)
    participant Auth as SuperTokens Core
    participant DB as PostgreSQL

    Note over Client, API: Início da Requisição

    Client->>API: HTTP Request (GET/POST/PATCH...)

    rect rgb(240, 248, 255)
        Note right of API: 1. Camada de Infraestrutura (Global)
        API->>API: Middlewares (Helmet, CORS, Logger)

        API->>Redis: Verificar Rate Limit (Throttler)
        alt Limite Excedido
            Redis-->>API: Blocked
            API-->>Client: 429 Too Many Requests
        else Permitido
            Redis-->>API: Allowed
        end
    end

    rect rgb(255, 250, 240)
        Note right of API: 2. Camada de Segurança (Guards)
        API->>Auth: Validar Sessão/JWT
        Auth-->>API: Session Info / User ID

        API->>API: AuthGuard (Is Authenticated?)
        API->>API: RolesGuard (Has Role?)
        API->>API: PermissionsGuard (Has Permission?)

        alt Acesso Negado
            API-->>Client: 401 Unauthorized / 403 Forbidden
        end
    end

    rect rgb(240, 255, 240)
        Note right of API: 3. Camada de Negócio
        API->>API: ValidationPipe (DTO Check)
        API->>API: Controller -> Service

        opt Cache Hit
            API->>Redis: Get Cached Data
            Redis-->>API: Data
        end

        API->>DB: Prisma Query (Find/Create/Update)
        DB-->>API: Result Data
    end

    rect rgb(255, 240, 245)
        Note right of API: 4. Resposta
        API->>API: Interceptors (Transform/Serialize)
        API->>API: Exception Filters (Error Handling)
    end

    API-->>Client: HTTP Response (JSON)

    rect rgb(255, 255, 240)
        Note right of API: 5. Fluxo de Webhook (Pagamentos)
        participant MP as Mercado Pago
        MP->>API: POST /webhooks/mercadopago (Signature Header)
        API->>API: Validate HMAC Signature
        API->>MP: 200 OK (Ack)
        API->>DB: Update Order Status
        opt Approved
            API->>DB: Create Tickets
        end
    end
```

## Detalhes dos Componentes

| Componente | Porta Interna | Porta Exposta (Dev) | Função |
| :--- | :--- | :--- | :--- |
| **NestJS API** | 3000 | 5122 | Gateway principal, lógica de negócio, validação. |
| **SuperTokens** | 3567 | 3567 | Gerenciamento de sessões, tokens e identidade. |
| **Redis** | 6379 | 6379 | Rate limiting, cache de respostas e filas (futuro). |
| **PostgreSQL** | 5439 | 5432 | Persistência de dados relacional. |

## Fluxo de Rede (Docker)

No ambiente Docker (Dev e Prod), os serviços se comunicam através de uma rede interna (`eventdev-dev-network` ou `eventdev-prod-network`).

- A **API** acessa o banco via hostname `postgres-db`.
- A **API** acessa o cache via hostname `redis-cache`.
- A **API** acessa o auth via hostname `supertokens-auth`.
- O **Cliente** acessa a API via `localhost:5122` (Dev) ou `api.eventdev.org` (Prod).
