# Event Dev Server API

API backend para a plataforma Event Dev, construída com NestJS, Prisma e PostgreSQL.

---

## 🚀 Começando

Siga estas instruções para configurar e rodar o ambiente de desenvolvimento em sua máquina local.

### ✅ Pré-requisitos

Antes de começar, garanta que você tem as seguintes ferramentas instaladas:
* [Node.js](https://nodejs.org/) (v22.x ou superior)
* [Docker](https://www.docker.com/products/docker-desktop/) e Docker Compose

---

### ⚙️ Instalação e Configuração

**1. Clone o Repositório**
```bash
git clone [https://github.com/mathewvieira/Event-Dev-Server.git](https://github.com/mathewvieira/Event-Dev-Server.git)
cd Event-Dev-Server
```
> Se precisar, troque para a branch desejada: `git checkout <nome-da-branch>`

**2. Configure as Variáveis de Ambiente**
Copie o arquivo de exemplo `.env.example` para um novo arquivo chamado `.env`. Este arquivo guardará suas senhas e configurações locais e não deve ser enviado para o Git.

```bash
# No Windows (PowerShell)
copy .env.example .env

# No Linux ou macOS
cp .env.example .env
```
> **Importante:** Revise o arquivo `.env` e ajuste as portas ou senhas se necessário.

---

### 📦 Rodando a Aplicação

#### Opção 1: Ambiente de Desenvolvimento (Recomendado)
Neste modo, o banco de dados e o PgAdmin rodam em contêineres Docker, enquanto a aplicação NestJS roda diretamente na sua máquina, permitindo o hot-reload.

**1. Inicie os Contêineres de Suporte**
Este comando irá iniciar o banco de dados PostgreSQL e o PgAdmin em segundo plano.

```bash
docker-compose up -d
```

**2. Prepare o Banco de Dados (Migrations & Seed)**
Este comando irá aplicar as migrações do Prisma para criar as tabelas e, em seguida, popular o banco com dados iniciais.
```bash
npx prisma migrate dev
npx prisma db seed
```
> **Nota:** Na primeira vez que rodar `migrate dev`, o Prisma pedirá um nome para a migração. Você pode dar um nome como "initial-setup".

**3. Inicie a Aplicação NestJS**
Finalmente, inicie o servidor de desenvolvimento. Ele irá recarregar automaticamente a cada alteração no código.
```bash
npm run start:dev
```

**Pronto!** 🎉 Sua aplicação estará rodando e acessível em:
* **API:** `http://localhost:5122` (ou a porta definida em `NODE_PORT`)
* **PgAdmin (Admin do Banco):** `http://localhost:5514` (ou a porta definida em `PGADMIN_PORT`)

#### Opção 2: Ambiente de Produção (Tudo com Docker)
Este comando constrói a imagem da sua aplicação e sobe todos os serviços (API, Banco de Dados, PgAdmin) em contêineres, simulando um ambiente de produção.

```bash
docker-compose --profile prod up --build -d
```
> Para parar todos os contêineres, use: `docker-compose down`

---

### 📜 Scripts Disponíveis

* `npm run start:dev`: Inicia a aplicação em modo de desenvolvimento com hot-reload.
* `npm run build`: Compila o código TypeScript para JavaScript.
* `npm run start:prod`: Inicia a aplicação em modo de produção (requer um build prévio).
* `npx prisma studio`: Abre a interface visual do Prisma para explorar seu banco de dados.
