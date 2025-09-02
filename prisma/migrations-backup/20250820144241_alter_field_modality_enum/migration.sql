/*
  Warnings:

  - You are about to drop the column `event_online` on the `event` table. All the data in the column will be lost.
  - Added the required column `modality` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."modality_event" AS ENUM ('ONLINE', 'PRESENTIAL', 'HYBRID');

-- AlterTable
ALTER TABLE "public"."event" DROP COLUMN "event_online",
ADD COLUMN     "modality" "public"."modality_event" NOT NULL;
