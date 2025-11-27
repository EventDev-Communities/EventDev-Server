# Regras de Negócio (Business Rules)

Este documento descreve as regras de negócio invariantes do sistema **EventDev-Server**. Estas regras definem o comportamento esperado do domínio e independem da tecnologia utilizada.

## 1. Comunidades (Communities)

### 1.1. Criação e Propriedade

- **RN-COM-01**: Toda comunidade deve ter obrigatoriamente um usuário "Dono" (Owner) no momento da criação.
- **RN-COM-02**: O nome da comunidade deve ser único no sistema (não podem existir duas comunidades com o mesmo nome exato).
- **RN-COM-03**: A criação de novas comunidades é restrita a administradores da plataforma. Comunidades criadas nascem ativas por padrão.

### 1.2. Gestão de Membros

- **RN-COM-04**: Um usuário pode ser membro de múltiplas comunidades.
- **RN-COM-05**: O dono da comunidade não pode ser removido da lista de membros, a menos que a propriedade seja transferida para outro usuário antes.
- **RN-COM-06**: Apenas administradores da comunidade ou o dono podem aprovar solicitações de entrada (se a comunidade for privada).

## 2. Eventos (Events)

### 2.1. Vínculo e Estrutura

- **RN-EVE-01**: Todo evento deve pertencer a uma única comunidade.
- **RN-EVE-02**: Um evento não pode ser criado sem um título e uma data de início definida.
- **RN-EVE-03**: A data de término do evento deve ser obrigatoriamente posterior à data de início.

### 2.2. Modalidade e Localização

- **RN-EVE-04**: Se a modalidade do evento for `PRESENTIAL` ou `HYBRID`, o cadastro de um endereço físico é obrigatório.
- **RN-EVE-05**: Se a modalidade do evento for `ONLINE` ou `HYBRID`, o cadastro de um link de transmissão é obrigatório (pode ser adicionado posteriormente, mas deve existir antes do início).

### 2.3. Status e Visibilidade

- **RN-EVE-06**: Eventos cancelados não podem receber novas inscrições.
- **RN-EVE-07**: Apenas eventos de comunidades ativas são visíveis na listagem pública global.

### 2.4. Gestão de Vagas

- **RN-EVE-08**: A quantidade total de ingressos (vagas) de um evento nunca pode ser reduzida para um número inferior ao total de ingressos já emitidos/vendidos.
- **RN-EVE-09**: O valor do ingresso (se pago) deve respeitar o limite mínimo operacional (ex: R$ 1,00).

## 3. Ingressos (Tickets)

### 3.1. Emissão e Validação

- **RN-TIC-01**: Um usuário não pode adquirir mais de um ingresso para o mesmo evento (regra atual de unicidade por participante).
- **RN-TIC-02**: Não é possível emitir ingressos para eventos que já terminaram.
- **RN-TIC-03**: Não é possível emitir ingressos para eventos cancelados.
- **RN-TIC-04**: Se o evento tiver limite de vagas, a emissão deve ser bloqueada assim que o limite for atingido.

### 3.2. Cancelamento e Transferência

- **RN-TIC-05**: Um ingresso pode ser cancelado pelo usuário até X horas antes do evento (configuração a definir).
- **RN-TIC-06**: Ingressos cancelados liberam a vaga de volta para o evento (se houver limite).

### 3.3. Check-in e Presença

- **RN-TIC-07**: O check-in só pode ser realizado por membros autorizados da comunidade (Owner ou Staff).
- **RN-TIC-08**: Um ingresso só pode ser validado (check-in) uma única vez. Tentativas subsequentes devem retornar erro ou aviso de "já utilizado".
- **RN-TIC-09**: O check-in só é permitido no dia do evento (ou em janela de tempo configurável, ex: 2h antes).

## 4. Pedidos e Produtos (Orders & Products)

### 4.1. Processamento de Pedidos

- **RN-ORD-01**: Um pedido finalizado (pago) não pode ter seus itens alterados.
- **RN-ORD-02**: O valor total do pedido deve ser a soma exata dos valores dos itens (ingressos/produtos).

### 4.2. Gestão de Produtos

- **RN-PROD-01**: Produtos com estoque zero não podem ser adicionados a novos pedidos.
- **RN-PROD-02**: A exclusão de um produto não deve apagar o histórico de pedidos que o contêm (soft delete ou desativação).

### 4.3. Pagamentos (Payments)

- **RN-PAY-01**: O status do pedido deve ser atualizado automaticamente via Webhook do provedor de pagamento (Mercado Pago).
- **RN-PAY-02**: Pagamentos rejeitados devem cancelar o pedido e liberar o estoque/vagas reservados.
- **RN-PAY-03**: A confirmação do pagamento (status `approved`) deve disparar a emissão definitiva dos ingressos.

## 5. Notificações (Notifications)

### 5.1. Segurança de Mensagens

- **RN-NOT-01**: Emails de recuperação de senha devem conter tokens únicos com validade limitada (ex: 1 hora) e de uso único.
- **RN-NOT-02**: O sistema não deve confirmar explicitamente se um email existe ou não durante o fluxo de recuperação de senha (para evitar enumeração de usuários).

## 6. Usuários e Acesso (Users & Access)

### 6.1. Identidade

- **RN-USR-01**: O email é o identificador único do usuário no sistema.
- **RN-USR-02**: Todo usuário do sistema deve possuir um registro correspondente no provedor de identidade (SuperTokens).

### 6.2. Permissões Globais

- **RN-USR-03**: Apenas usuários com papel `PLATFORM_ADMIN` podem gerenciar configurações globais do sistema ou intervir em qualquer comunidade.
- **RN-USR-04**: A exclusão de uma conta de usuário deve anonimizar seus dados pessoais, mas manter o histórico de ingressos para fins de auditoria (se necessário).
