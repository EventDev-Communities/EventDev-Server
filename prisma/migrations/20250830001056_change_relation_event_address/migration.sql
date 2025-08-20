/*
  Warnings:

  - A unique constraint covering the columns `[id_address]` on the table `event` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."event" ALTER COLUMN "id_address" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "event_id_address_key" ON "public"."event"("id_address");
