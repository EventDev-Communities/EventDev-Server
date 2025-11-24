-- CreateTable
CREATE TABLE "community_user_request_status" (
-- CreateTable
CREATE TABLE "event_modality" (
-- CreateTable
CREATE TABLE "link_type" (
-- CreateTable
CREATE TABLE "user_role" (
-- CreateTable
CREATE TABLE "ticket_status" (
-- CreateTable
CREATE TABLE "user" (
-- CreateTable
CREATE TABLE "community" (
-- CreateTable
CREATE TABLE "community_link" (
-- CreateTable
CREATE TABLE "community_user" (
-- CreateTable
CREATE TABLE "community_user_request" (
-- CreateTable
CREATE TABLE "post" (
-- CreateTable
CREATE TABLE "event" (
-- CreateTable
CREATE TABLE "address" (
-- CreateTable
CREATE TABLE "order_status" (
-- CreateTable
CREATE TABLE "order_item_type" (
-- CreateTable
CREATE TABLE "order" (
-- CreateTable
CREATE TABLE "order_item" (
-- CreateTable
CREATE TABLE "product" (
-- CreateTable
CREATE TABLE "ticket" (
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
