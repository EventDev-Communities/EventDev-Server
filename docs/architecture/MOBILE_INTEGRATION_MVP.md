# Plano de Integração Mobile (MVP) - Guia de Implementação Detalhado

Este documento serve como um guia passo a passo para a implementação do aplicativo móvel (MVP) do EventDev. Ele foi desenhado para ser seguido por um agente de IA ou desenvolvedor, cobrindo desde a configuração inicial até os fluxos de usuário.

**Objetivo**: Criar um app para Organizadores de Eventos realizarem check-in e gestão básica.

---

## 1. Configuração do Ambiente e Stack Sugerida

* **Ambiente**: Todo o desenvolvimento e testes serão realizados em **localhost**. O backend e banco de dados rodam via Docker localmente. Não é necessário configurações de produção (HTTPS, domínios reais) neste momento. O foco é funcionalidade em ambiente de desenvolvimento.
* **Framework**: Flutter (Recomendado) ou React Native.
* **Autenticação**: SuperTokens (Frontend SDK).
* **HTTP Client**: Dio (Flutter) ou Axios (React Native/JS).
* **QR Code**: Mobile Scanner (Flutter) ou react-native-vision-camera.

---

## 2. Passo a Passo de Implementação

### Fase 1: Camada de Rede e Autenticação

O backend utiliza **SuperTokens** com cookies `HttpOnly` para sessões web, mas para mobile, geralmente utilizamos o cabeçalho `Authorization` ou gerenciamento de cookies via `cookie_jar`.

#### Tarefa 1.1: Configurar Cliente HTTP

1. Crie uma instância do cliente HTTP (ex: Dio).
2. Defina a `BaseUrl` para a API (ex: `https://api.eventdev.com` ou IP local).
3. Configure um **Interceptor** para adicionar o token de sessão (se usar Header-based auth) ou garantir a persistência de cookies.
   * *Nota*: O SuperTokens gerencia a renovação de sessão automaticamente se configurado corretamente com o SDK deles. Caso contrário, trate o erro `401 Unauthorized` para redirecionar ao login.

#### Tarefa 1.2: Tela de Login

1. Crie uma tela com campos `Email` e `Senha`.
2. Chame o endpoint de login do SuperTokens (geralmente `/auth/signin`).
3. **Importante**: O backend espera credenciais e retorna a sessão.
4. Ao sucesso, navegue para a "Tela de Carregamento Inicial".

---

### Fase 2: Contexto do Usuário (Splash/Loading)

Antes de mostrar o dashboard, precisamos saber quem é o usuário e qual comunidade ele administra.

#### Tarefa 2.1: Obter Dados da Comunidade

1. Chame `GET /api/v1/communities/me`.
2. **Cenário A (Sucesso - 200)**:
   * O JSON retorna os dados da comunidade (`id`, `name`, `logo`).
   * Armazene o `communityId` e `communityName` no estado global (ou Singleton/Provider).
   * Navegue para **Dashboard de Eventos**.
3. **Cenário B (Erro - 404/403)**:
   * O usuário não possui comunidade.
   * Exiba uma mensagem: "Este app é exclusivo para organizadores de comunidades."
   * Ofereça botão de "Sair".

---

### Fase 3: Dashboard de Eventos (Lista)

O usuário precisa selecionar o evento que está ocorrendo.

#### Tarefa 3.1: Listar Eventos

1. Chame `GET /api/v1/events`.
2. Envie os parâmetros:
   * `communityId`: (ID armazenado na Fase 2).
   * `take`: 50.
   * `skip`: 0.
   * `isActive`: `true` (opcional, para ver apenas ativos).
3. Renderize uma lista vertical.
   * **Item da Lista**:
     * Título do Evento (`title`).
     * Data/Hora (`startDateTime` formatado).
     * Local (`address` se disponível ou `modality`).
4. Ao clicar em um item, navegue para **Detalhes do Evento**, passando o objeto `event` ou apenas o `eventId` como argumento.

---

### Fase 4: Detalhes do Evento (Home do Evento)

Esta é a tela central de operação.

#### Tarefa 4.1: Layout da Tela

1. Exiba o Título do Evento no topo.
2. Crie dois botões grandes de ação (Cards ou Botões flutuantes):
   * **Botão A**: "Realizar Check-in" (Ícone de QR Code).
   * **Botão B**: "Ver Participantes" (Ícone de Lista).

---

### Fase 5: Leitor de QR Code (Check-in)

Funcionalidade crítica. Deve ser rápida e dar feedback imediato.

#### Tarefa 5.1: Interface de Câmera

1. Abra a câmera em modo de leitura de QR Code.
2. Desenhe um "overlay" (quadrado na tela) para orientar o usuário.

#### Tarefa 5.2: Processar Leitura

1. Ao detectar um código, pause a leitura (para não enviar múltiplas requisições).
2. O código lido será o `ticketId` (ex: "15").
3. Faça a requisição `POST /api/v1/tickets/{ticketId}/check-in`.
   * Substitua `{ticketId}` pelo valor lido.

#### Tarefa 5.3: Feedback Visual (Modal ou Tela de Resultado)

1. **Sucesso (200 OK)**:
   * Mostre uma tela/modal **VERDE**.
   * Ícone de "Check" grande.
   * Texto: "Check-in Realizado!".
   * Exiba dados do retorno: Nome do Participante (`ticket.participant`) e Tipo de Ingresso (`ticket.type`).
   * Botão: "Ler Próximo".
2. **Erro - Já Utilizado (400 Bad Request)**:
   * Mostre uma tela/modal **AMARELA/LARANJA**.
   * Ícone de "Alerta".
   * Texto: "Ingresso Já Utilizado!".
   * Exiba a data de uso se disponível (ou apenas a mensagem).
   * Botão: "Ler Próximo".
3. **Erro - Inválido/Não Encontrado (404/400)**:
   * Mostre uma tela/modal **VERMELHA**.
   * Ícone de "X".
   * Texto: "Ingresso Inválido".
   * Botão: "Tentar Novamente".

---

### Fase 6: Lista de Participantes

Para consulta manual caso o QR Code falhe ou para controle.

#### Tarefa 6.1: Buscar Dados

1. Chame `GET /api/v1/tickets`.
2. Parâmetros:
   * `eventId`: (ID do evento atual).
   * `take`: 100.
3. Renderize a lista.

#### Tarefa 6.2: Item da Lista

1. Nome do Usuário (`user.name` ou `user.email`).
2. Tipo de Ingresso (`ticketType.name`).
3. **Indicador de Status**:
   * Se `status.code == 'USED'` -> Bolinha Verde ou Texto "Check-in Feito".
   * Se `status.code == 'CONFIRMED'` -> Bolinha Cinza ou Texto "Pendente".

---

## 3. Resumo dos Endpoints

| Ação | Método | Rota | Payload/Params | Retorno Chave |
| :--- | :--- | :--- | :--- | :--- |
| **Login** | `POST` | `/auth/signin` | `{email, password}` | Sessão |
| **Contexto** | `GET` | `/api/v1/communities/me` | - | `id`, `name` |
| **Eventos** | `GET` | `/api/v1/events` | `?communityId=X` | `[{id, title, ...}]` |
| **Check-in** | `POST` | `/api/v1/tickets/:id/check-in` | - | `{status: 'success', ticket: {...}}` |
| **Tickets** | `GET` | `/api/v1/tickets` | `?eventId=X` | `[{id, user, status, ...}]` |

## 4. Tratamento de Erros Padrão

* **401 Unauthorized**: Token expirou ou inválido. -> Redirecionar para Login.
* **403 Forbidden**: Usuário tentou acessar evento de outra comunidade. -> Mostrar "Acesso Negado".
* **500 Internal Server Error**: Erro no servidor. -> Mostrar "Erro no sistema, tente novamente".
