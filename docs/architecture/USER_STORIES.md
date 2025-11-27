# Histórias de Usuário (User Stories)

Este documento reúne as histórias de usuário que guiam o desenvolvimento das funcionalidades do **EventDev-Server**.

## 1. Gestão de Comunidades

### US-COM-01: Criação de Comunidade (Admin)

**Como** um administrador da plataforma,
**Quero** registrar uma nova comunidade no sistema,
**Para que** eu possa disponibilizar o acesso para os organizadores.

**Critérios de Aceite:**

- Apenas usuários com perfil de Administrador da Plataforma podem acessar esta funcionalidade.
- O administrador deve fornecer os dados básicos da comunidade (nome, descrição).
- A comunidade deve ser criada e vinculada a um usuário específico (informado no cadastro) como dono inicial.
- A comunidade nasce ativa.

### US-COM-02: Personalização do Perfil

**Como** dono de uma comunidade,
**Quero** adicionar links para minhas redes sociais (Instagram, LinkedIn) e um logo,
**Para que** os participantes possam encontrar mais informações sobre meu grupo.

**Critérios de Aceite:**

- O sistema deve validar se as URLs fornecidas são válidas.
- O logo deve ser uma URL de imagem válida.
- As informações devem aparecer publicamente na página da comunidade.

## 2. Gestão de Eventos

### US-EVE-01: Publicação de Evento Online

**Como** dono da comunidade "Tech Community Brasil",
**Quero** publicar um novo workshop online sobre NestJS,
**Para que** os membros da minha comunidade possam se inscrever e participar.

**Critérios de Aceite:**

- O evento deve ter título, descrição, data/hora de início e fim.
- A modalidade deve ser `ONLINE` e um link de transmissão deve ser fornecido.
- O evento deve aparecer na listagem pública da comunidade imediatamente (se ativo).
- Apenas eu (ou administradores da minha comunidade) posso editar este evento.

### US-EVE-02: Evento Presencial com Vagas Limitadas

**Como** organizador de um meetup presencial,
**Quero** limitar o número de inscritos a 50 pessoas e exigir endereço físico,
**Para que** eu não ultrapasse a capacidade do auditório.

**Critérios de Aceite:**

- O sistema deve exigir o cadastro completo do endereço (CEP, Rua, Número).
- O sistema deve bloquear novas inscrições automaticamente quando atingir 50 ingressos emitidos.
- O evento deve exibir o status "ESGOTADO" na listagem pública.

## 3. Experiência do Participante

### US-PAR-01: Descoberta de Eventos

**Como** um desenvolvedor interessado em aprender,
**Quero** listar os próximos eventos de tecnologia,
**Para que** eu possa encontrar atividades relevantes para minha carreira.

**Critérios de Aceite:**

- A listagem deve permitir filtrar por nome ou descrição.
- A paginação deve funcionar corretamente (skip/take).
- A resposta deve incluir links HATEOAS para navegação.

### US-PAR-02: Inscrição e Ingresso

**Como** participante,
**Quero** me inscrever em um evento gratuito e receber meu ingresso,
**Para que** eu possa garantir minha vaga e fazer check-in no dia.

**Critérios de Aceite:**

- O sistema deve gerar um ingresso único vinculado à minha conta.
- O ingresso deve conter um QR Code (ou hash) para validação.
- Não devo conseguir me inscrever duas vezes no mesmo evento.

## 4. Operação e Check-in

### US-OPS-01: Check-in via Mobile

**Como** staff do evento na portaria,
**Quero** ler o QR Code do participante usando o App Mobile,
**Para que** eu possa validar sua entrada rapidamente e evitar filas.

**Critérios de Aceite:**

- O App deve consultar a API para validar o código do ingresso.
- Se o ingresso for válido e for a primeira leitura, o sistema deve registrar o check-in (sucesso).
- Se o ingresso já foi usado, o sistema deve alertar "JÁ UTILIZADO" (erro).
- Se o ingresso for inválido ou de outro evento, deve alertar "INVÁLIDO".

## 5. Pagamentos e Integrações (PAY)

### US-PAY-01: Compra de Ingresso Pago

**Como** participante,
**Quero** comprar um ingresso pago para um evento,
**Para** garantir minha participação mediante pagamento.

**Critérios de Aceite:**

- O sistema deve criar uma "Order" com status PENDING.
- O sistema deve retornar um link de pagamento (Checkout Pro) do Mercado Pago.
- O ingresso só deve ser gerado após a confirmação do pagamento via Webhook.

### US-PAY-02: Processamento de Pagamento (Webhook)

**Como** sistema,
**Quero** receber notificações de pagamento do Mercado Pago,
**Para** atualizar o status dos pedidos e liberar os ingressos automaticamente.

**Critérios de Aceite:**

- O endpoint deve validar a assinatura HMAC do Mercado Pago para garantir autenticidade.
- Se o pagamento for aprovado, o status da Order muda para COMPLETED e os Tickets são gerados.
- Se o pagamento for rejeitado, o status da Order muda para CANCELLED.
- O endpoint deve ser idempotente (processar o mesmo evento apenas uma vez).

## 6. E-commerce (Futuro)

### US-ECO-01: Venda de Produtos

**Como** dono da comunidade,
**Quero** vender camisetas e adesivos da minha comunidade,
**Para que** eu possa arrecadar fundos para manter o projeto.

**Critérios de Aceite:**

- Devo poder cadastrar produtos com nome, preço, foto e estoque inicial.
- O sistema deve impedir vendas se o estoque acabar.
- O participante deve poder comprar produtos e ingressos no mesmo pedido.
