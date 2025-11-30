# Definição do Projeto e Regras de Negócio

## Visão Geral

O **EventDev-Server** é uma plataforma backend para gerenciamento de eventos técnicos e comunidades de desenvolvedores. O sistema permite que organizadores criem comunidades, publiquem eventos (online, presenciais ou híbridos) e gerenciem ingressos, enquanto participantes podem descobrir eventos, se inscrever em comunidades e obter ingressos.

## Regras de Negócio Atuais

### 1. Comunidades

- **Criação**: Uma comunidade pode ser criada via cadastro público (`/auth/signup/community`) ou por um administrador.
  - *Nota*: Atualmente, o fluxo é público e cria o usuário dono imediatamente.
  - *(FUTURO)*: A criação será restrita a aprovação de administradores ou via convite.
- **Gerenciamento**: A comunidade (através de seu dono) pode cadastrar, editar e ocultar eventos.
- **Propriedade**: Cada comunidade possui um usuário "dono" (Owner) que tem permissão total sobre ela.
- **Visibilidade**: Comunidades podem ser ativas ou inativas. Apenas comunidades ativas aparecem nas listagens públicas.
- **Links Sociais**: Comunidades podem cadastrar links para redes sociais (Instagram, LinkedIn, GitHub, Website) para facilitar o contato.
- **Posts e Anúncios**: A comunidade pode criar postagens (feed) para comunicar novidades aos membros.
- *(FUTURO)* **Membros da Equipe**: O dono poderá adicionar membros (staff) com permissões granulares (ex: check-in, editar perfil comunidade).

### 2. Eventos

- **Vínculo**: Todo evento deve pertencer a uma comunidade.
- **Modalidade**: Eventos podem ser `ONLINE`, `PRESENTIAL` ou `HYBRID`.
- **Endereço**: Eventos presenciais ou híbridos devem possuir um endereço físico cadastrado (CEP, Rua, Número, etc.).
  - *Nota*: O sistema valida o CEP e armazena a localização estruturada.
- **Datas**:
  - A data de fim deve ser posterior à data de início.
  - A listagem padrão deve ordenar do mais recente para o mais antigo (ou próximo evento).
- **Ingressos (Vagas)**:
  - O organizador define a quantidade total de vagas.
  - O sistema deve impedir a venda/emissão se as vagas esgotarem ("ESGOTADO").
  - A quantidade de vagas só pode ser aumentada, nunca diminuída abaixo do número já vendido.
  - **Preço**: Se pago, o valor mínimo é R$ 1,00 (limitação de gateways).
- **Check-in**:
  - O sistema deve fornecer um endpoint para validar ingressos via QR Code.
  - O App Mobile (Flutter) consumirá este endpoint para realizar o check-in dos participantes.

### 3. Autenticação e Autorização

- **SuperTokens**: O sistema utiliza SuperTokens para autenticação (sessão e senha).
- **Papéis (Roles)**:
  - `PLATFORM_ADMIN`: Administrador global do sistema.
  - `COMMUNITY_OWNER`: Dono de uma comunidade.
  - `USER`: Usuário comum (participante).
  - *(FUTURO)* `COMMUNITY_MEMBER`: Membro da equipe da comunidade.
- **Permissões**: O acesso aos recursos é controlado por Guards (`PermissionsGuard`, `RolesGuard`) e Decorators (`@RequireOwnership`).
- **Recuperação de Conta**: Usuários podem redefinir senhas via link seguro enviado por email.

### 4. Ingressos (Tickets)

- **Emissão**: Participantes autenticados podem adquirir ingressos.
- **Tipos**: Gratuitos ou Pagos.
- **Pagamento**: Integração via **Mercado Pago Checkout Pro**.
  - O usuário é redirecionado para o ambiente seguro do Mercado Pago.
  - Suporte nativo a Pix, Cartão de Crédito, Boleto e Saldo MP.
- **Validação**: O sistema impede emissão para eventos passados, cancelados ou esgotados.
- **Identificador Único**: Cada ingresso possui um UUID ou Hash único para geração de QR Code e validação no Check-in.

### 5. Pedidos e Produtos (E-commerce)

- **Pedidos Unificados**: O sistema possui um módulo de pedidos (`Order`) capaz de processar compras de diferentes tipos de itens (Ingressos, Produtos, etc.) em uma única transação.
- **Produtos**: Comunidades podem cadastrar produtos físicos ou digitais (ex: camisetas, adesivos, cursos) para venda.
- **Estoque**: O sistema gerencia o estoque de produtos automaticamente a cada pedido confirmado.

### 6. Notificações

- **Email**: O sistema utiliza provedor SMTP para envio de emails transacionais.
- **Casos de Uso**: Atualmente utilizado para recuperação de senha. Futuramente para confirmação de ingressos e comunicados da comunidade.

### 7. Segurança e Infraestrutura

- **Rate Limiting**: A API implementa limitação de taxa (via Redis) para proteger rotas públicas e autenticadas contra abuso e ataques de força bruta.
- **Proteção de Sessão**: Tokens de acesso e refresh são armazenados exclusivamente em **Cookies HttpOnly e Secure**, prevenindo acesso via JavaScript (XSS).
- **Dados Sensíveis**: Senhas nunca trafegam em texto plano internamente e são gerenciadas exclusivamente pelo core do SuperTokens.

## Histórias de Usuário

Consulte o arquivo [USER_STORIES.md](./USER_STORIES.md) para a lista completa e detalhada de histórias de usuário.
