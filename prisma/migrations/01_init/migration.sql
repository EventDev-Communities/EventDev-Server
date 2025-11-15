-- ============================================================================
-- LOOKUP TABLES
-- ============================================================================

-- CreateTable: CommunityUserRequestStatus (Lookup Table)
CREATE TABLE "community_user_request_status" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_user_request_status_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "community_user_request_status_code_check" CHECK (
        "code" IN ('PENDING', 'APPROVED', 'REJECTED')
    )
);

-- CreateTable: EventModality (Lookup Table)
CREATE TABLE "event_modality" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_modality_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "event_modality_code_check" CHECK (
        "code" IN ('PRESENTIAL', 'ONLINE', 'HYBRID')
    )
);

-- CreateTable: LinkType (Lookup Table)
CREATE TABLE "link_type" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "link_type_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "link_type_code_check" CHECK (
        "code" IN (
            'WEBSITE', 'INSTAGRAM', 'LINKEDIN', 'GITHUB',
            'TWITTER', 'FACEBOOK', 'YOUTUBE', 'DISCORD',
            'TELEGRAM', 'WHATSAPP', 'OTHER'
        )
    )
);

-- CreateTable: UserRole (Lookup Table)
CREATE TABLE "user_role" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "level" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_role_code_check" CHECK (
        "code" IN ('OWNER', 'ADMIN', 'MODERATOR', 'MEMBER')
    ),
    CONSTRAINT "user_role_level_check" CHECK (
        "level" BETWEEN 1 AND 10
    )
);

-- CreateTable: TicketStatus (Lookup Table)
CREATE TABLE "ticket_status" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_status_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ticket_status_code_check" CHECK (
        "code" IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED', 'USED')
    )
);

-- ============================================================================
-- MAIN TABLES
-- ============================================================================

-- CreateTable: User
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "supertokens_id" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "usuario_root" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Community
CREATE TABLE "community" (
    "id" SERIAL NOT NULL,
    "id_supertokens" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(500),
    "logo_url" VARCHAR(255),
    "phone_number" VARCHAR(20),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CommunityLink
CREATE TABLE "community_link" (
    "id" SERIAL NOT NULL,
    "community_id" INTEGER NOT NULL,
    "link_type_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CommunityUser (Junction Table)
CREATE TABLE "community_user" (
    "community_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_user_pkey" PRIMARY KEY ("community_id","user_id")
);

-- CreateTable: CommunityUserRequest
CREATE TABLE "community_user_request" (
    "community_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,
    "message" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_user_request_pkey" PRIMARY KEY ("community_id","user_id")
);

-- CreateTable: Post
CREATE TABLE "post" (
    "id" SERIAL NOT NULL,
    "id_community" INTEGER NOT NULL,
    "text" VARCHAR(1000) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Address
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
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Event
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
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Ticket
CREATE TABLE "ticket" (
    "id" SERIAL NOT NULL,
    "id_event" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_ticket_status" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "purchased_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Lookup Tables Indexes
CREATE UNIQUE INDEX "community_user_request_status_code_key" ON "community_user_request_status"("code");
CREATE UNIQUE INDEX "event_modality_code_key" ON "event_modality"("code");
CREATE UNIQUE INDEX "link_type_code_key" ON "link_type"("code");
CREATE UNIQUE INDEX "user_role_code_key" ON "user_role"("code");
CREATE UNIQUE INDEX "ticket_status_code_key" ON "ticket_status"("code");

-- User Indexes
CREATE UNIQUE INDEX "user_supertokens_id_key" ON "user"("supertokens_id");
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- Community Indexes
CREATE UNIQUE INDEX "community_id_supertokens_key" ON "community"("id_supertokens");
CREATE INDEX "community_name_idx" ON "community"("name");
CREATE INDEX "community_is_active_idx" ON "community"("is_active");

-- CommunityLink Indexes
CREATE INDEX "community_link_community_id_link_type_id_idx" ON "community_link"("community_id", "link_type_id");

-- CommunityUser Indexes
CREATE INDEX "community_user_user_id_idx" ON "community_user"("user_id");
CREATE INDEX "community_user_role_id_idx" ON "community_user"("role_id");

-- CommunityUserRequest Indexes
CREATE INDEX "community_user_request_status_id_idx" ON "community_user_request"("status_id");

-- Post Indexes
CREATE INDEX "post_id_community_is_active_idx" ON "post"("id_community", "is_active");

-- Address Indexes
CREATE INDEX "address_state_city_idx" ON "address"("state", "city");
CREATE INDEX "address_cep_idx" ON "address"("cep");

-- Event Indexes
CREATE INDEX "event_id_community_is_active_idx" ON "event"("id_community", "is_active");
CREATE INDEX "event_start_date_time_end_date_time_idx" ON "event"("start_date_time", "end_date_time");
CREATE INDEX "event_modality_id_idx" ON "event"("modality_id");

-- Ticket Indexes
CREATE INDEX "ticket_id_event_id_user_idx" ON "ticket"("id_event", "id_user");
CREATE INDEX "ticket_id_user_idx" ON "ticket"("id_user");
CREATE INDEX "ticket_id_ticket_status_idx" ON "ticket"("id_ticket_status");

-- ============================================================================
-- FOREIGN KEYS
-- ============================================================================

-- CommunityLink Foreign Keys
ALTER TABLE "community_link" ADD CONSTRAINT "community_link_community_id_fkey"
    FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_link" ADD CONSTRAINT "community_link_link_type_id_fkey"
    FOREIGN KEY ("link_type_id") REFERENCES "link_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CommunityUser Foreign Keys
ALTER TABLE "community_user" ADD CONSTRAINT "community_user_community_id_fkey"
    FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_user" ADD CONSTRAINT "community_user_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_user" ADD CONSTRAINT "community_user_role_id_fkey"
    FOREIGN KEY ("role_id") REFERENCES "user_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CommunityUserRequest Foreign Keys
ALTER TABLE "community_user_request" ADD CONSTRAINT "community_user_request_community_id_fkey"
    FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_user_request" ADD CONSTRAINT "community_user_request_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_user_request" ADD CONSTRAINT "community_user_request_status_id_fkey"
    FOREIGN KEY ("status_id") REFERENCES "community_user_request_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Post Foreign Keys
ALTER TABLE "post" ADD CONSTRAINT "post_id_community_fkey"
    FOREIGN KEY ("id_community") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Event Foreign Keys
ALTER TABLE "event" ADD CONSTRAINT "event_id_community_fkey"
    FOREIGN KEY ("id_community") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "event" ADD CONSTRAINT "event_id_address_fkey"
    FOREIGN KEY ("id_address") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "event" ADD CONSTRAINT "event_modality_id_fkey"
    FOREIGN KEY ("modality_id") REFERENCES "event_modality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Ticket Foreign Keys
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_id_event_fkey"
    FOREIGN KEY ("id_event") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ticket" ADD CONSTRAINT "ticket_id_user_fkey"
    FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ticket" ADD CONSTRAINT "ticket_id_ticket_status_fkey"
    FOREIGN KEY ("id_ticket_status") REFERENCES "ticket_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================================
-- ORDER MODULE TABLES
-- ============================================================================

-- CreateTable: OrderStatus (Lookup Table)
CREATE TABLE "order_status" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "order_status_code_check" CHECK (
        "code" IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED')
    )
);

CREATE UNIQUE INDEX "order_status_code_key" ON "order_status"("code");

-- CreateTable: OrderItemType (Lookup Table for polymorphic relationships)
CREATE TABLE "order_item_type" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_item_type_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "order_item_type_code_check" CHECK (
        "code" IN ('TICKET', 'PRODUCT', 'MERCHANDISE', 'DONATION', 'MEMBERSHIP', 'SERVICE')
    )
);

CREATE UNIQUE INDEX "order_item_type_code_key" ON "order_item_type"("code");

-- CreateTable: Order
CREATE TABLE "order" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "order_status_id" INTEGER NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "payment_method" VARCHAR(50),
    "transaction_id" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "order_user_id_idx" ON "order"("user_id");
CREATE INDEX "order_order_status_id_idx" ON "order"("order_status_id");
CREATE INDEX "order_created_at_idx" ON "order"("created_at");

-- CreateTable: OrderItem (Polymorphic - supports any item type)
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

CREATE INDEX "order_item_order_id_idx" ON "order_item"("order_id");
CREATE INDEX "order_item_item_type_id_idx" ON "order_item"("item_type_id");
CREATE INDEX "order_item_item_id_idx" ON "order_item"("item_id");
CREATE INDEX "order_item_item_type_id_item_id_idx" ON "order_item"("item_type_id", "item_id");

-- CreateTable: Product
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

CREATE INDEX "product_community_id_idx" ON "product"("community_id");
CREATE INDEX "product_is_active_idx" ON "product"("is_active");

-- Order Foreign Keys
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order" ADD CONSTRAINT "order_order_status_id_fkey"
    FOREIGN KEY ("order_status_id") REFERENCES "order_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- OrderItem Foreign Keys
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_item" ADD CONSTRAINT "order_item_item_type_id_fkey"
    FOREIGN KEY ("item_type_id") REFERENCES "order_item_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Note: No direct foreign keys for item_id since it's polymorphic
-- Application layer must ensure referential integrity based on item_type_id

-- Product Foreign Keys
ALTER TABLE "product" ADD CONSTRAINT "product_community_id_fkey"
    FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE SET NULL ON UPDATE CASCADE;
