# Definição do Projeto e Regras de Negócio

## Visão Geral

O **EventDev-Server** é uma plataforma backend para gerenciamento de eventos técnicos e comunidades de desenvolvedores. O sistema permite que organizadores criem comunidades, publiquem eventos (online, presenciais ou híbridos) e gerenciem ingressos, enquanto participantes podem descobrir eventos e se inscrever.

## Regras de Negócio Atuais

### 1. Comunidades

- **Criação**: Uma comunidade pode ser criada via cadastro público (`/auth/signup/community`) ou por um administrador.
- **Propriedade**: Cada comunidade possui um usuário "dono" (Owner) que tem permissão total sobre ela.
- **Visibilidade**: Comunidades podem ser ativas ou inativas. Apenas comunidades ativas aparecem nas listagens públicas.

### 2. Eventos

- **Vínculo**: Todo evento deve pertencer a uma comunidade.
- **Modalidade**: Eventos podem ser `ONLINE`, `PRESENTIAL` ou `HYBRID`.
- **Endereço**: Eventos presenciais ou híbridos devem possuir um endereço físico cadastrado.
- **Datas**: A data de fim deve ser posterior à data de início.

### 3. Autenticação e Autorização

- **SuperTokens**: O sistema utiliza SuperTokens para autenticação (sessão e senha).
- **Papéis (Roles)**:
  - `PLATFORM_ADMIN`: Administrador global do sistema.
  - `COMMUNITY_OWNER`: Dono de uma comunidade.
  - `COMMUNITY_MEMBER`: Membro da equipe de uma comunidade (futuro).
  - `USER`: Usuário comum (participante).
- **Permissões**: O acesso aos recursos é controlado por Guards (`PermissionsGuard`, `RolesGuard`) e Decorators (`@RequireOwnership`).

### 4. Ingressos (Tickets)

- **Emissão**: Participantes podem adquirir ingressos para eventos.
- **Tipos**: Gratuitos ou Pagos (integração de pagamento futura).
- **Validação**: O sistema deve impedir a emissão de ingressos esgotados ou para eventos passados.

## Histórias de Usuário (Exemplos)

### História 1: Cadastro de Organizador de Comunidade

**Como** um organizador de eventos de tecnologia,
**Quero** criar uma conta e registrar minha comunidade na plataforma,
**Para que** eu possa começar a publicar meus meetups e workshops.

**Critérios de Aceite:**

- O usuário deve fornecer email, senha e dados básicos da comunidade (nome, descrição).
- Ao finalizar o cadastro, o usuário já deve estar logado.
- A comunidade deve ser criada automaticamente e vinculada ao usuário como dono.
- O usuário deve receber o papel de `COMMUNITY_OWNER`.

### História 2: Publicação de Evento Online

**Como** dono da comunidade "Tech Community Brasil",
**Quero** publicar um novo workshop online sobre NestJS,
**Para que** os membros da minha comunidade possam se inscrever e participar.

**Critérios de Aceite:**

- O evento deve ter título, descrição, data/hora de início e fim.
- A modalidade deve ser `ONLINE` e um link de transmissão deve ser fornecido.
- O evento deve aparecer na listagem pública da comunidade imediatamente (se ativo).
- Apenas eu (ou administradores da minha comunidade) posso editar este evento.

### História 3: Descoberta de Eventos

**Como** um desenvolvedor interessado em aprender,
**Quero** listar os próximos eventos de tecnologia,
**Para que** eu possa encontrar atividades relevantes para minha carreira.

**Critérios de Aceite:**

- A listagem deve permitir filtrar por nome ou descrição.
- A paginação deve funcionar corretamente (skip/take).
- A resposta deve incluir links HATEOAS para navegação.
