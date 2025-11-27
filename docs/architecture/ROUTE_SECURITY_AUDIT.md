# Auditoria de Segurança de Rotas

**Data:** 25 de Novembro de 2025
**Status:** Revisão Necessária (Pontos problemáticos identificados)

Este documento lista o estado atual da proteção de rotas na aplicação.

## Resumo

A maioria das rotas de escrita (POST, PATCH, DELETE) está protegida por sessão (`@VerifySession`) e, em muitos casos, por verificação de propriedade (`@RequireOwnership`) ou papéis (`@Roles`).
As rotas de leitura (GET) "List All" são majoritariamente públicas, o que pode ser um ponto de atenção dependendo da sensibilidade dos dados.

## Detalhamento por Controller

### CommunityController (`/communities`)

| Método | Rota | Acesso | Decorators | Observações |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/` | **Público** | `@PublicAccess` | Lista todas as comunidades. |
| GET | `/me` | Protegido | `@VerifySession`, `@Roles(COMMUNITY)` | Retorna comunidade do usuário logado. |
| POST | `/` | Protegido | `@VerifySession`, `@Roles(PLATFORM_ADMIN)` | Criação de comunidade (apenas admin). |
| GET | `/:id` | **Público** | `@PublicAccess` | Detalhes de uma comunidade. |
| PATCH | `/:id` | Protegido | `@VerifySession`, `@RequireOwnership(COMMUNITY)` | Apenas dono pode editar. |
| DELETE | `/:id` | Protegido | `@VerifySession`, `@RequireOwnership(COMMUNITY)` | Apenas dono pode deletar. |
| POST | `/invite` | Protegido | `@VerifySession`, `@Roles(PLATFORM_ADMIN)` | Convite para nova comunidade. |
| GET | `/invite/:token` | **Público** | `@PublicAccess` | Validação de token de convite. |
| POST | `/:id/join` | Protegido | `@VerifySession` | Entrar na comunidade. |
| POST | `/:id/leave` | Protegido | `@VerifySession` | Sair da comunidade. |
| GET | `/:id/members` | **Público** | `@PublicAccess` | Lista membros da comunidade. |
| DELETE | `/:id/members/:userId` | Protegido | `@VerifySession` | Remover membro (Banir). |

### TicketController (`/tickets`)

| Método | Rota | Acesso | Decorators | Observações |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/` | Protegido | `@VerifySession`, `@Roles(COMMUNITY)` | Criar tipo de ticket. |
| GET | `/:id` | **Público** | `@PublicAccess` | Detalhes do ticket. |
| GET | `/` | **Público** | `@PublicAccess` | Lista todos os tickets. |
| PATCH | `/:id` | Protegido | `@VerifySession`, `@RequireOwnership(TICKET)` | Editar ticket. |
| DELETE | `/:id` | Protegido | `@VerifySession`, `@RequireOwnership(TICKET)` | Deletar ticket. |

### EventController (`/events`)

| Método | Rota | Acesso | Decorators | Observações |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/` | Protegido | `@VerifySession`, `@Roles(COMMUNITY)` | Criar evento. |
| GET | `/:id` | **Público** | `@PublicAccess` | Detalhes do evento. |
| GET | `/` | **Público** | `@PublicAccess` | Lista todos os eventos. |
| PATCH | `/:id` | Protegido | `@VerifySession`, `@RequireOwnership(EVENT)` | Editar evento. |
| DELETE | `/:id` | Protegido | `@VerifySession`, `@RequireOwnership(EVENT)` | Deletar evento. |

### AddressController (`/address`)

| Método | Rota | Acesso | Decorators | Observações |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/` | **Público** | `@PublicAccess` | **ATENÇÃO:** Lista todos os endereços do sistema sem filtro aparente. |
| POST | `/` | Protegido | `@VerifySession` | Criar endereço. |

### AuthController (`/auth`)

| Método | Rota | Acesso | Decorators | Observações |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/signin` | **Público** | `@PublicAccess` | Login. |
| POST | `/signout` | Protegido | `@VerifySession` | Logout. |
| POST | `/password/reset/token` | **Público** | `@PublicAccess` | Solicitar reset de senha. |
| POST | `/password/reset` | **Público** | `@PublicAccess` | Efetuar reset de senha. |
| GET | `/me` | Protegido | `@VerifySession` | Perfil do usuário. |
| POST | `/admin/users` | Protegido | `@VerifySession` | Criar usuário (Admin). |
| POST | `/admin/communities` | Protegido | `@VerifySession` | Criar comunidade (Admin). |
| POST | `/bootstrap/admin` | **Público** | `@PublicAccess` | Inicialização do sistema (deve travar após uso). |
| POST | `/signup/community` | **Público** | `@PublicAccess` | Registro público de comunidade. |
| POST | `/invite/accept` | **Público** | `@PublicAccess` | Aceitar convite. |

### OrderController (`/orders`)

| Método | Rota | Acesso | Decorators | Observações |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/` | Protegido | `@VerifySession` | Cria uma nova ordem de compra. |
| GET | `/` | Protegido | `@VerifySession` | Lista ordens do usuário logado. |
| GET | `/:id` | Protegido | `@VerifySession` | Detalhes de uma ordem específica. |

### OrderWebhookController (`/webhooks/mercadopago`)

| Método | Rota | Acesso | Decorators | Observações |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/` | **Público** | `@PublicAccess` | Recebe notificações de pagamento. Valida assinatura HMAC. |

### AppController (`/`)

| Método | Rota | Acesso | Decorators | Observações |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/` | **Público** | `@PublicAccess` | Status da API. |
| GET | `/health` | **Público** | `@PublicAccess` | Health check. |

## Pontos de Atenção Identificados

1. **AddressController (`GET /`)**: Expor todos os endereços publicamente pode ser um risco de privacidade (PII) se endereços de usuários estiverem misturados ou se endereços de eventos privados forem expostos.
2. **Listagens Públicas (`GET /`)**: `TicketController` e `EventController` permitem listar todos os recursos. Verificar se filtros de privacidade (ex: eventos privados) estão sendo aplicados no Service/Repository.
