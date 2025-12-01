# Plano de Integração Ágil (Frontend & Mobile)

Este documento define a estratégia para integrar o backend EventDev-Server com os clientes Frontend (Web/Next.js) e Mobile (Flutter) com foco em **agilidade** e **consistência**.

## 1. Visão Geral da Estratégia

Para acelerar o desenvolvimento, utilizaremos a documentação OpenAPI como "Source of Truth" e dados seedados para testes imediatos.

- **Backend**: Pronto e estável (verificado via `pnpm verify-all`).
- **Dados de Teste**: O banco já vem populado (`pnpm seed`) com usuários, comunidades e eventos.
- **Autenticação**: Centralizada no SuperTokens.

## 2. Recursos para Desenvolvedores Frontend/Mobile

### 2.1. Documentação da API

- **Swagger UI**: `http://localhost:5122/api/docs`
  - Use para explorar endpoints e testar requisições (Try it out).
- **OpenAPI JSON**: `http://localhost:5122/api/docs-json`
  - Use para gerar clientes automaticamente (se desejado).

### 2.2. Credenciais de Teste (Seed Data)

Use estas credenciais para não perder tempo criando usuários:

| Perfil | Email | Senha | Contexto |
| :--- | :--- | :--- | :--- |
| **Platform Admin** | `admin@eventdev.org` | `Senha123!` | Gestão total do sistema. |
| **Community Owner** | `php@example.com` | `password123` | Dono da comunidade "PHP com Rapadura". |
| **Usuário Comum** | `user@example.com` | `password123` | Comprador de ingressos. |

## 3. Integração Frontend (Web - Next.js/React)

**Foco**: Painel Administrativo e Fluxo de Compra.

### 3.1. Autenticação (SuperTokens)

- **SDK**: `supertokens-auth-react`
- **Configuração**:
  - `apiDomain`: `http://localhost:5122`
  - `websiteDomain`: `http://localhost:3000`
  - `apiBasePath`: `/api/v1/auth`
- **Estratégia**:
  - Use o componente `<SuperTokensWrapper>` para proteger rotas.
  - Use `useSessionContext()` para verificar estado de login.

### 3.2. Consumo de API

- **Recomendação Ágil**: Use `axios` ou `ky` com um interceptor para incluir credenciais.
- **Interceptor**: O SuperTokens injeta cookies automaticamente, mas garanta `credentials: 'include'` nas requisições.

### 3.3. Fluxos Prioritários

1. **Login**: Implementar tela de login usando componentes do SuperTokens ou custom UI chamando a API.
2. **Dashboard**: Listar comunidades (`GET /api/v1/communities/me`).
3. **Eventos**: Criar evento (`POST /api/v1/events`) e listar (`GET /api/v1/events`).
4. **Checkout (Pagamento)**:
   - Chamar `POST /api/v1/orders` com os dados do ingresso.
   - A API retornará `{ initPoint: 'https://...' }`.
   - Redirecionar o usuário para essa URL (Mercado Pago).
   - O usuário paga (Pix ou Cartão) no ambiente do Mercado Pago.
   - O Mercado Pago redireciona de volta para a URL de sucesso configurada (ex: `/checkout/status`).

### 3.4. Variáveis de Ambiente (Sugestão)

```env
NEXT_PUBLIC_API_URL=http://localhost:5122
NEXT_PUBLIC_APP_DOMAIN=http://localhost:3000
```

## 4. Integração Mobile (Flutter)

**Foco**: Carteira de Ingressos e Check-in.

### 4.1. Autenticação

- **Opção Ágil**: WebView para Login (se o SDK nativo for complexo de início) ou `supertokens-flutter` (se disponível/estável).
- **Token Management**: Armazenar `sAccessToken` e `sRefreshToken` de forma segura (`flutter_secure_storage`).
- **Headers**: Diferente da Web (Cookies), no Mobile você deve enviar os tokens nos headers se não usar o cookie manager automático do SDK.
  - `Authorization: Bearer <sAccessToken>` (se configurado para header-based) ou Cookie jar.
  - **Recomendação**: Use o SDK oficial do SuperTokens para Flutter para gerenciar a sessão automaticamente.

### 4.2. Geração de Código (Opcional mas Recomendado)

- Use `openapi-generator` para criar modelos Dart a partir do `docs/openapi.json`.
- Isso garante tipagem forte e evita erros de "magic strings".

### 4.3. Fluxos Prioritários

1. **Login**: Autenticar e obter sessão.
2. **Meus Ingressos**: Listar ingressos do usuário (`GET /api/v1/tickets`).
   - **Payload Resposta**: Lista de objetos contendo `id`, `status`, `event` (título, data), `qrCode` (string para gerar imagem).
3. **QR Code**: Exibir QR Code do ingresso para validação na entrada.
   - Use uma lib de QR Code no Flutter passando a string retornada no campo `qrCode` ou `id` do ingresso.
4. **Discovery**: Listar eventos públicos (`GET /api/v1/events`).

### 4.4. Testes em Dispositivo Físico

Para testar no celular real (não emulador), o `localhost` não funcionará.

1. Descubra seu IP local (ex: `192.168.1.50`).
2. No backend `.env`, adicione seu IP em `ALLOWED_ORIGINS`.
3. No App Flutter, aponte a `BASE_URL` para `http://192.168.1.50:5122`.

## 5. Ciclo de Desenvolvimento Ágil

1. **Backend Up**: Mantenha o backend rodando (`make dev-up`).
2. **Verificação**: Se algo falhar, rode `pnpm verify-all` no backend para garantir que não é o servidor.
3. **Mocking**: Se um endpoint novo for necessário, combine o contrato (JSON) primeiro, o Frontend "mocka" a resposta enquanto o Backend implementa.

## 6. Tratamento de Erros Comum

| Status Code | Significado | Ação no Front |
| :--- | :--- | :--- |
| `401 Unauthorized` | Sessão expirada ou inválida. | Tentar refresh token ou redirecionar para Login. |
| `403 Forbidden` | Sem permissão (ex: não é admin). | Mostrar mensagem "Acesso Negado". |
| `429 Too Many Requests` | Rate Limit excedido. | Exibir "Tente novamente em instantes". |

---
**Nota**: Este plano é vivo. Atualize-o conforme novas descobertas ou mudanças na arquitetura.
