-- CreateEnum
CREATE TYPE "public"."modality_event" AS ENUM ('ONLINE', 'PRESENTIAL', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."community_user_request_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."community" (
    "id" SERIAL NOT NULL,
    "supertokens_id" VARCHAR(255) NOT NULL,
    "logo_url" VARCHAR(255),
    "link_instagram" VARCHAR(255),
    "link_linkedin" VARCHAR(255),
    "link_website" VARCHAR(255),
    "link_github" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "name" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(255),
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."address" (
    "id" SERIAL NOT NULL,
    "cep" VARCHAR(8) NOT NULL,
    "state" VARCHAR(25) NOT NULL,
    "city" VARCHAR(50) NOT NULL,
    "neighborhood" VARCHAR(50) NOT NULL,
    "streetAddress" VARCHAR(50) NOT NULL,
    "number" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event" (
    "id" SERIAL NOT NULL,
    "id_community" INTEGER NOT NULL,
    "id_address" INTEGER,
    "title" VARCHAR(255) NOT NULL,
    "capa_url" VARCHAR(255),
    "link" VARCHAR(255),
    "description" VARCHAR(255) NOT NULL,
    "modality" "public"."modality_event" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date_time" TIMESTAMP(6) NOT NULL,
    "end_date_time" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_community" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "text" VARCHAR(255) NOT NULL,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" SERIAL NOT NULL,
    "supertokens_id" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "usuario_root" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."community_user" (
    "community_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "community_user_pkey" PRIMARY KEY ("community_id","user_id")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "community_supertokens_id_key" ON "public"."community"("supertokens_id");

-- CreateIndex
CREATE INDEX "address_state_city_idx" ON "public"."address"("state", "city");

-- CreateIndex
CREATE UNIQUE INDEX "user_supertokens_id_key" ON "public"."user"("supertokens_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- AddForeignKey
ALTER TABLE "public"."event" ADD CONSTRAINT "event_id_address_fkey" FOREIGN KEY ("id_address") REFERENCES "public"."address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event" ADD CONSTRAINT "event_id_community_fkey" FOREIGN KEY ("id_community") REFERENCES "public"."community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."post" ADD CONSTRAINT "post_id_community_fkey" FOREIGN KEY ("id_community") REFERENCES "public"."community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_user" ADD CONSTRAINT "community_user_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_user" ADD CONSTRAINT "community_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_user_request" ADD CONSTRAINT "community_user_request_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_user_request" ADD CONSTRAINT "community_user_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
