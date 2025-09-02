-- AlterTable
ALTER TABLE "public"."community" ADD COLUMN     "auth_user_id" VARCHAR(255);

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "auth_user_id" VARCHAR(255);
