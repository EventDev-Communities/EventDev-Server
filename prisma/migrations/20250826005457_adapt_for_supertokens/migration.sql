/*
  Warnings:

  - You are about to drop the column `auth_user_id` on the `community` table. All the data in the column will be lost.
  - You are about to drop the column `auth_user_id` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[supertokens_id]` on the table `community` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[supertokens_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `supertokens_id` to the `community` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supertokens_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."community" DROP COLUMN "auth_user_id",
ADD COLUMN     "supertokens_id" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "auth_user_id",
ADD COLUMN     "supertokens_id" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "community_supertokens_id_key" ON "public"."community"("supertokens_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_supertokens_id_key" ON "public"."user"("supertokens_id");
