-- CreateTable
CREATE TABLE "community_user_request_status" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_user_request_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_modality" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_modality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_type" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "link_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "level" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_status" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "supertokens_id" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "usuario_root" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community" (
    "id" SERIAL NOT NULL,
    "id_supertokens" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(500),
    "logo_url" VARCHAR(255),
    "phone_number" VARCHAR(20),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_link" (
    "id" SERIAL NOT NULL,
    "community_id" INTEGER NOT NULL,
    "link_type_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_user" (
    "community_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_user_pkey" PRIMARY KEY ("community_id","user_id")
);

-- CreateTable
CREATE TABLE "community_user_request" (
    "community_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,
    "message" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "community_user_request_pkey" PRIMARY KEY ("community_id","user_id")
);

-- CreateTable
CREATE TABLE "community_invitation" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(500),
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post" (
    "id" SERIAL NOT NULL,
    "id_community" INTEGER NOT NULL,
    "text" VARCHAR(1000) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" SERIAL NOT NULL,
    "id_community" INTEGER NOT NULL,
    "id_address" INTEGER,
    "modality_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "capa_url" VARCHAR(255),
    "link" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date_time" TIMESTAMP(6) NOT NULL,
    "end_date_time" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" SERIAL NOT NULL,
    "cep" VARCHAR(8) NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "neighborhood" VARCHAR(100) NOT NULL,
    "street_address" VARCHAR(255) NOT NULL,
    "number" VARCHAR(10) NOT NULL,
    "complement" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_type" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_item_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "order_status_id" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "payment_method" VARCHAR(50),
    "transaction_id" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "item_type_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "item_metadata" JSONB,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" SERIAL NOT NULL,
    "community_id" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(1000),
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "image_url" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket" (
    "id" SERIAL NOT NULL,
    "id_event" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_ticket_status" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "purchased_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "community_user_request_status_code_key" ON "community_user_request_status"("code");

-- CreateIndex
CREATE UNIQUE INDEX "event_modality_code_key" ON "event_modality"("code");

-- CreateIndex
CREATE UNIQUE INDEX "link_type_code_key" ON "link_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_code_key" ON "user_role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_status_code_key" ON "ticket_status"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_supertokens_id_key" ON "user"("supertokens_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "community_id_supertokens_key" ON "community"("id_supertokens");

-- CreateIndex
CREATE INDEX "community_name_idx" ON "community"("name");

-- CreateIndex
CREATE INDEX "community_is_active_idx" ON "community"("is_active");

-- CreateIndex
CREATE INDEX "community_link_community_id_link_type_id_idx" ON "community_link"("community_id", "link_type_id");

-- CreateIndex
CREATE INDEX "community_user_user_id_idx" ON "community_user"("user_id");

-- CreateIndex
CREATE INDEX "community_user_role_id_idx" ON "community_user"("role_id");

-- CreateIndex
CREATE INDEX "community_user_request_status_id_idx" ON "community_user_request"("status_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_invitation_token_key" ON "community_invitation"("token");

-- CreateIndex
CREATE INDEX "community_invitation_token_idx" ON "community_invitation"("token");

-- CreateIndex
CREATE INDEX "community_invitation_email_idx" ON "community_invitation"("email");

-- CreateIndex
CREATE INDEX "post_id_community_is_active_idx" ON "post"("id_community", "is_active");

-- CreateIndex
CREATE INDEX "event_id_community_is_active_idx" ON "event"("id_community", "is_active");

-- CreateIndex
CREATE INDEX "event_start_date_time_end_date_time_idx" ON "event"("start_date_time", "end_date_time");

-- CreateIndex
CREATE INDEX "event_modality_id_idx" ON "event"("modality_id");

-- CreateIndex
CREATE INDEX "address_state_city_idx" ON "address"("state", "city");

-- CreateIndex
CREATE INDEX "address_cep_idx" ON "address"("cep");

-- CreateIndex
CREATE UNIQUE INDEX "order_status_code_key" ON "order_status"("code");

-- CreateIndex
CREATE UNIQUE INDEX "order_item_type_code_key" ON "order_item_type"("code");

-- CreateIndex
CREATE INDEX "order_user_id_idx" ON "order"("user_id");

-- CreateIndex
CREATE INDEX "order_order_status_id_idx" ON "order"("order_status_id");

-- CreateIndex
CREATE INDEX "order_created_at_idx" ON "order"("created_at");

-- CreateIndex
CREATE INDEX "order_item_order_id_idx" ON "order_item"("order_id");

-- CreateIndex
CREATE INDEX "order_item_item_type_id_idx" ON "order_item"("item_type_id");

-- CreateIndex
CREATE INDEX "order_item_item_id_idx" ON "order_item"("item_id");

-- CreateIndex
CREATE INDEX "order_item_item_type_id_item_id_idx" ON "order_item"("item_type_id", "item_id");

-- CreateIndex
CREATE INDEX "product_community_id_idx" ON "product"("community_id");

-- CreateIndex
CREATE INDEX "product_is_active_idx" ON "product"("is_active");

-- CreateIndex
CREATE INDEX "ticket_id_event_id_user_idx" ON "ticket"("id_event", "id_user");

-- CreateIndex
CREATE INDEX "ticket_id_user_idx" ON "ticket"("id_user");

-- CreateIndex
CREATE INDEX "ticket_id_ticket_status_idx" ON "ticket"("id_ticket_status");

-- AddForeignKey
ALTER TABLE "community_link" ADD CONSTRAINT "community_link_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_link" ADD CONSTRAINT "community_link_link_type_id_fkey" FOREIGN KEY ("link_type_id") REFERENCES "link_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_user" ADD CONSTRAINT "community_user_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_user" ADD CONSTRAINT "community_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_user" ADD CONSTRAINT "community_user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "user_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_user_request" ADD CONSTRAINT "community_user_request_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_user_request" ADD CONSTRAINT "community_user_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_user_request" ADD CONSTRAINT "community_user_request_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "community_user_request_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_id_community_fkey" FOREIGN KEY ("id_community") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_id_community_fkey" FOREIGN KEY ("id_community") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_id_address_fkey" FOREIGN KEY ("id_address") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "event_modality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_order_status_id_fkey" FOREIGN KEY ("order_status_id") REFERENCES "order_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_item_type_id_fkey" FOREIGN KEY ("item_type_id") REFERENCES "order_item_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_id_event_fkey" FOREIGN KEY ("id_event") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_id_ticket_status_fkey" FOREIGN KEY ("id_ticket_status") REFERENCES "ticket_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

