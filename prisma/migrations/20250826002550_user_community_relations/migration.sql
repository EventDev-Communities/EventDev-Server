/*
  Warnings:

  - You are about to drop the column `id_community` on the `user` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."community_user_roles" AS ENUM ('LEADER', 'MEMBER');

-- DropForeignKey
ALTER TABLE "public"."user" DROP CONSTRAINT "user_id_community_fkey";

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "id_community";

-- CreateTable
CREATE TABLE "public"."community_user" (
    "community_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" "public"."community_user_roles" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "community_user_pkey" PRIMARY KEY ("community_id","user_id")
);

-- AddForeignKey
ALTER TABLE "public"."community_user" ADD CONSTRAINT "community_user_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_user" ADD CONSTRAINT "community_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
