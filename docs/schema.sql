-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";
-- CreateTable
CREATE TABLE "public"."community_user_request_status" (
-- CreateTable
CREATE TABLE "public"."event_modality" (
-- CreateTable
CREATE TABLE "public"."link_type" (
-- CreateTable
CREATE TABLE "public"."user_role" (
-- CreateTable
CREATE TABLE "public"."ticket_status" (
-- CreateTable
CREATE TABLE "public"."user" (
-- CreateTable
CREATE TABLE "public"."community" (
-- CreateTable
CREATE TABLE "public"."community_link" (
-- CreateTable
CREATE TABLE "public"."community_user" (
-- CreateTable
CREATE TABLE "public"."community_user_request" (
-- CreateTable
CREATE TABLE "public"."post" (
-- CreateTable
CREATE TABLE "public"."event" (
-- CreateTable
CREATE TABLE "public"."address" (
-- CreateTable
CREATE TABLE "public"."order_status" (
-- CreateTable
CREATE TABLE "public"."order_item_type" (
-- CreateTable
CREATE TABLE "public"."order" (
-- CreateTable
CREATE TABLE "public"."order_item" (
-- CreateTable
CREATE TABLE "public"."product" (
-- CreateTable
CREATE TABLE "public"."ticket" (
-- CreateIndex
CREATE UNIQUE INDEX "community_user_request_status_code_key" ON "public"."community_user_request_status"("code");
-- CreateIndex
CREATE UNIQUE INDEX "event_modality_code_key" ON "public"."event_modality"("code");
-- CreateIndex
CREATE UNIQUE INDEX "link_type_code_key" ON "public"."link_type"("code");
-- CreateIndex
CREATE UNIQUE INDEX "user_role_code_key" ON "public"."user_role"("code");
-- CreateIndex
CREATE UNIQUE INDEX "ticket_status_code_key" ON "public"."ticket_status"("code");
-- CreateIndex
CREATE UNIQUE INDEX "user_supertokens_id_key" ON "public"."user"("supertokens_id");
-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");
-- CreateIndex
CREATE UNIQUE INDEX "community_id_supertokens_key" ON "public"."community"("id_supertokens");
-- CreateIndex
CREATE INDEX "community_name_idx" ON "public"."community"("name");
-- CreateIndex
CREATE INDEX "community_is_active_idx" ON "public"."community"("is_active");
-- CreateIndex
CREATE INDEX "community_link_community_id_link_type_id_idx" ON "public"."community_link"("community_id", "link_type_id");
-- CreateIndex
CREATE INDEX "community_user_user_id_idx" ON "public"."community_user"("user_id");
-- CreateIndex
CREATE INDEX "community_user_role_id_idx" ON "public"."community_user"("role_id");
-- CreateIndex
CREATE INDEX "community_user_request_status_id_idx" ON "public"."community_user_request"("status_id");
-- CreateIndex
CREATE INDEX "post_id_community_is_active_idx" ON "public"."post"("id_community", "is_active");
-- CreateIndex
CREATE INDEX "event_id_community_is_active_idx" ON "public"."event"("id_community", "is_active");
-- CreateIndex
CREATE INDEX "event_start_date_time_end_date_time_idx" ON "public"."event"("start_date_time", "end_date_time");
-- CreateIndex
CREATE INDEX "event_modality_id_idx" ON "public"."event"("modality_id");
-- CreateIndex
CREATE INDEX "address_state_city_idx" ON "public"."address"("state", "city");
-- CreateIndex
CREATE INDEX "address_cep_idx" ON "public"."address"("cep");
-- CreateIndex
CREATE UNIQUE INDEX "order_status_code_key" ON "public"."order_status"("code");
-- CreateIndex
CREATE UNIQUE INDEX "order_item_type_code_key" ON "public"."order_item_type"("code");
-- CreateIndex
CREATE INDEX "order_user_id_idx" ON "public"."order"("user_id");
-- CreateIndex
CREATE INDEX "order_order_status_id_idx" ON "public"."order"("order_status_id");
-- CreateIndex
CREATE INDEX "order_created_at_idx" ON "public"."order"("created_at");
-- CreateIndex
CREATE INDEX "order_item_order_id_idx" ON "public"."order_item"("order_id");
-- CreateIndex
CREATE INDEX "order_item_item_type_id_idx" ON "public"."order_item"("item_type_id");
-- CreateIndex
CREATE INDEX "order_item_item_id_idx" ON "public"."order_item"("item_id");
-- CreateIndex
CREATE INDEX "order_item_item_type_id_item_id_idx" ON "public"."order_item"("item_type_id", "item_id");
-- CreateIndex
CREATE INDEX "product_community_id_idx" ON "public"."product"("community_id");
-- CreateIndex
CREATE INDEX "product_is_active_idx" ON "public"."product"("is_active");
-- CreateIndex
CREATE INDEX "ticket_id_event_id_user_idx" ON "public"."ticket"("id_event", "id_user");
-- CreateIndex
CREATE INDEX "ticket_id_user_idx" ON "public"."ticket"("id_user");
-- CreateIndex
CREATE INDEX "ticket_id_ticket_status_idx" ON "public"."ticket"("id_ticket_status");
-- AddForeignKey
ALTER TABLE "public"."community_link" ADD CONSTRAINT "community_link_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."community_link" ADD CONSTRAINT "community_link_link_type_id_fkey" FOREIGN KEY ("link_type_id") REFERENCES "public"."link_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."community_user" ADD CONSTRAINT "community_user_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."community_user" ADD CONSTRAINT "community_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."community_user" ADD CONSTRAINT "community_user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."user_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."community_user_request" ADD CONSTRAINT "community_user_request_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."community_user_request" ADD CONSTRAINT "community_user_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."community_user_request" ADD CONSTRAINT "community_user_request_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."community_user_request_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."post" ADD CONSTRAINT "post_id_community_fkey" FOREIGN KEY ("id_community") REFERENCES "public"."community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."event" ADD CONSTRAINT "event_id_community_fkey" FOREIGN KEY ("id_community") REFERENCES "public"."community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."event" ADD CONSTRAINT "event_id_address_fkey" FOREIGN KEY ("id_address") REFERENCES "public"."address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."event" ADD CONSTRAINT "event_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "public"."event_modality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."order" ADD CONSTRAINT "order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."order" ADD CONSTRAINT "order_order_status_id_fkey" FOREIGN KEY ("order_status_id") REFERENCES "public"."order_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."order_item" ADD CONSTRAINT "order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."order_item" ADD CONSTRAINT "order_item_item_type_id_fkey" FOREIGN KEY ("item_type_id") REFERENCES "public"."order_item_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."product" ADD CONSTRAINT "product_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."community"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."ticket" ADD CONSTRAINT "ticket_id_event_fkey" FOREIGN KEY ("id_event") REFERENCES "public"."event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."ticket" ADD CONSTRAINT "ticket_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."ticket" ADD CONSTRAINT "ticket_id_ticket_status_fkey" FOREIGN KEY ("id_ticket_status") REFERENCES "public"."ticket_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
