-- CreateTable
CREATE TABLE "public"."community" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" VARCHAR(255),
    "logo_url" VARCHAR(255) NOT NULL,
    "telefone" VARCHAR(255),
    "link_instagram" VARCHAR(255),
    "link_linkedin" VARCHAR(255),
    "link_website" VARCHAR(255),
    "link_github" VARCHAR(255),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "atualizado_em" TIMESTAMP(6),
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."address" (
    "id" TEXT NOT NULL,
    "cep" VARCHAR(8) NOT NULL,
    "state" VARCHAR(25) NOT NULL,
    "city" VARCHAR(50) NOT NULL,
    "neighborhood" VARCHAR(50) NOT NULL,
    "streetAddress" VARCHAR(50) NOT NULL,
    "number" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event" (
    "id" SERIAL NOT NULL,
    "id_comunidade" INTEGER NOT NULL,
    "id_address" TEXT NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "capa_url" VARCHAR(255) NOT NULL,
    "descricao" VARCHAR(255) NOT NULL,
    "data_hora_inicial" TIMESTAMP(6) NOT NULL,
    "data_hora_final" TIMESTAMP(6) NOT NULL,
    "link" VARCHAR(255),
    "evento_online" BOOLEAN DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "atualizado_em" TIMESTAMP(6),
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post" (
    "id" SERIAL NOT NULL,
    "id_comunidade" INTEGER NOT NULL,
    "texto" VARCHAR(255) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "atualizado_em" TIMESTAMP(6),
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usuario" (
    "id" SERIAL NOT NULL,
    "id_comunidade" INTEGER,
    "email" VARCHAR(255) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "funcao" VARCHAR(255) NOT NULL,
    "usuario_root" BOOLEAN DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "atualizado_em" TIMESTAMP(6),
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "address_state_city_idx" ON "public"."address"("state", "city");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "public"."usuario"("email");

-- AddForeignKey
ALTER TABLE "public"."event" ADD CONSTRAINT "event_id_address_fkey" FOREIGN KEY ("id_address") REFERENCES "public"."address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event" ADD CONSTRAINT "event_id_comunidade_fkey" FOREIGN KEY ("id_comunidade") REFERENCES "public"."community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."post" ADD CONSTRAINT "post_id_comunidade_fkey" FOREIGN KEY ("id_comunidade") REFERENCES "public"."community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."usuario" ADD CONSTRAINT "usuario_id_comunidade_fkey" FOREIGN KEY ("id_comunidade") REFERENCES "public"."community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
