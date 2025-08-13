-- CreateEnum
CREATE TYPE "public"."community_user_request_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "public"."event" DROP CONSTRAINT "event_id_community_fkey";

-- DropForeignKey
ALTER TABLE "public"."post" DROP CONSTRAINT "post_id_community_fkey";

-- CreateTable
CREATE TABLE "public"."community_user_request" (
    "community_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" VARCHAR(255),
    "status" "public"."community_user_request_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_user_request_pkey" PRIMARY KEY ("community_id","user_id")
);

-- AddForeignKey
ALTER TABLE "public"."event" ADD CONSTRAINT "event_id_community_fkey" FOREIGN KEY ("id_community") REFERENCES "public"."community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post" ADD CONSTRAINT "post_id_community_fkey" FOREIGN KEY ("id_community") REFERENCES "public"."community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_user_request" ADD CONSTRAINT "community_user_request_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_user_request" ADD CONSTRAINT "community_user_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
