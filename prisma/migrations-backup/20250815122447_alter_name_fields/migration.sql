/*
  Warnings:

  - The primary key for the `address` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `address` table. All the data in the column will be lost.
  - The `id` column on the `address` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `ativo` on the `community` table. All the data in the column will be lost.
  - You are about to drop the column `atualizado_em` on the `community` table. All the data in the column will be lost.
  - You are about to drop the column `criado_em` on the `community` table. All the data in the column will be lost.
  - You are about to drop the column `descricao` on the `community` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `community` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `community` table. All the data in the column will be lost.
  - You are about to drop the column `ativo` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `atualizado_em` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `criado_em` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `data_hora_final` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `data_hora_inicial` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `descricao` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `evento_online` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `id_comunidade` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `titulo` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `ativo` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `atualizado_em` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `criado_em` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `id_comunidade` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `texto` on the `post` table. All the data in the column will be lost.
  - You are about to drop the `usuario` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `community` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date_time` to the `event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_community` to the `event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date_time` to the `event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `event` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id_address` on the `event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `id_community` to the `post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."event" DROP CONSTRAINT "event_id_address_fkey";

-- DropForeignKey
ALTER TABLE "public"."event" DROP CONSTRAINT "event_id_comunidade_fkey";

-- DropForeignKey
ALTER TABLE "public"."post" DROP CONSTRAINT "post_id_comunidade_fkey";

-- DropForeignKey
ALTER TABLE "public"."usuario" DROP CONSTRAINT "usuario_id_comunidade_fkey";

-- AlterTable
ALTER TABLE "public"."address" DROP CONSTRAINT "address_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "address_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."community" DROP COLUMN "ativo",
DROP COLUMN "atualizado_em",
DROP COLUMN "criado_em",
DROP COLUMN "descricao",
DROP COLUMN "nome",
DROP COLUMN "telefone",
ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" VARCHAR(255),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" VARCHAR(255) NOT NULL,
ADD COLUMN     "phone_number" VARCHAR(255),
ADD COLUMN     "updated_at" TIMESTAMP(6);

-- AlterTable
ALTER TABLE "public"."event" DROP COLUMN "ativo",
DROP COLUMN "atualizado_em",
DROP COLUMN "criado_em",
DROP COLUMN "data_hora_final",
DROP COLUMN "data_hora_inicial",
DROP COLUMN "descricao",
DROP COLUMN "evento_online",
DROP COLUMN "id_comunidade",
DROP COLUMN "titulo",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" VARCHAR(255) NOT NULL,
ADD COLUMN     "end_date_time" TIMESTAMP(6) NOT NULL,
ADD COLUMN     "event_online" BOOLEAN DEFAULT false,
ADD COLUMN     "id_community" INTEGER NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "start_date_time" TIMESTAMP(6) NOT NULL,
ADD COLUMN     "title" VARCHAR(255) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id_address",
ADD COLUMN     "id_address" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."post" DROP COLUMN "ativo",
DROP COLUMN "atualizado_em",
DROP COLUMN "criado_em",
DROP COLUMN "id_comunidade",
DROP COLUMN "texto",
ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id_community" INTEGER NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "text" VARCHAR(255) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(6);

-- DropTable
DROP TABLE "public"."usuario";

-- CreateTable
CREATE TABLE "public"."user" (
    "id" SERIAL NOT NULL,
    "id_community" INTEGER,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "function" VARCHAR(255) NOT NULL,
    "usuario_root" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- AddForeignKey
ALTER TABLE "public"."event" ADD CONSTRAINT "event_id_address_fkey" FOREIGN KEY ("id_address") REFERENCES "public"."address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event" ADD CONSTRAINT "event_id_community_fkey" FOREIGN KEY ("id_community") REFERENCES "public"."community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."post" ADD CONSTRAINT "post_id_community_fkey" FOREIGN KEY ("id_community") REFERENCES "public"."community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_id_community_fkey" FOREIGN KEY ("id_community") REFERENCES "public"."community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
