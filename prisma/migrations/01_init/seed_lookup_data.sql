-- ============================================================================
-- SEED DATA FOR LOOKUP TABLES
-- This script should be run after the migration to populate reference data
-- ============================================================================

-- Seed CommunityUserRequestStatus
INSERT INTO "community_user_request_status" ("code", "name", "description", "is_active") VALUES
    ('PENDING', 'Pending', 'Request is pending review', true),
    ('APPROVED', 'Approved', 'Request has been approved', true),
    ('REJECTED', 'Rejected', 'Request has been rejected', true)
ON CONFLICT ("code") DO NOTHING;

-- Seed EventModality
INSERT INTO "event_modality" ("code", "name", "description", "is_active") VALUES
    ('PRESENTIAL', 'Presencial', 'In-person event', true),
    ('ONLINE', 'Online', 'Virtual/online event', true),
    ('HYBRID', 'Híbrido', 'Both in-person and online', true)
ON CONFLICT ("code") DO NOTHING;

-- Seed LinkType
INSERT INTO "link_type" ("code", "name", "description", "is_active") VALUES
    ('WEBSITE', 'Website', 'Official website', true),
    ('INSTAGRAM', 'Instagram', 'Instagram profile', true),
    ('LINKEDIN', 'LinkedIn', 'LinkedIn profile', true),
    ('GITHUB', 'GitHub', 'GitHub repository', true),
    ('TWITTER', 'Twitter/X', 'Twitter/X profile', true),
    ('FACEBOOK', 'Facebook', 'Facebook page', true),
    ('YOUTUBE', 'YouTube', 'YouTube channel', true),
    ('DISCORD', 'Discord', 'Discord server', true),
    ('TELEGRAM', 'Telegram', 'Telegram group', true),
    ('WHATSAPP', 'WhatsApp', 'WhatsApp group', true),
    ('OTHER', 'Other', 'Other type of link', true)
ON CONFLICT ("code") DO NOTHING;

-- Seed UserRole
INSERT INTO "user_role" ("code", "name", "description", "level", "is_active") VALUES
    ('OWNER', 'Owner', 'Community owner with full permissions', 1, true),
    ('ADMIN', 'Administrator', 'Administrator with management permissions', 2, true),
    ('MODERATOR', 'Moderator', 'Moderator with content management permissions', 3, true),
    ('MEMBER', 'Member', 'Regular community member', 4, true)
ON CONFLICT ("code") DO NOTHING;

-- Seed TicketStatus
INSERT INTO "ticket_status" ("code", "name", "description", "is_active") VALUES
    ('PENDING', 'Pending', 'Ticket purchase is pending confirmation', true),
    ('CONFIRMED', 'Confirmed', 'Ticket purchase confirmed', true),
    ('CANCELLED', 'Cancelled', 'Ticket has been cancelled', true),
    ('REFUNDED', 'Refunded', 'Ticket has been refunded', true),
    ('USED', 'Used', 'Ticket has been used/checked-in', true)
ON CONFLICT ("code") DO NOTHING;

-- Seed OrderStatus
INSERT INTO "order_status" ("code", "name", "description", "is_active") VALUES
    ('PENDING', 'Pending', 'Order is pending payment confirmation', true),
    ('CONFIRMED', 'Confirmed', 'Order has been confirmed and paid', true),
    ('PROCESSING', 'Processing', 'Order is being processed', true),
    ('COMPLETED', 'Completed', 'Order has been completed and delivered', true),
    ('CANCELLED', 'Cancelled', 'Order has been cancelled', true),
    ('REFUNDED', 'Refunded', 'Order has been refunded', true)
ON CONFLICT ("code") DO NOTHING;

-- Seed OrderItemType
INSERT INTO "order_item_type" ("code", "name", "description", "is_active") VALUES
    ('TICKET', 'Event Ticket', 'Ticket for event admission', true),
    ('PRODUCT', 'Physical Product', 'Physical merchandise or product', true),
    ('MERCHANDISE', 'Merchandise', 'Community branded merchandise', true),
    ('DONATION', 'Donation', 'Monetary donation to community or event', true),
    ('MEMBERSHIP', 'Membership', 'Community membership subscription', true),
    ('SERVICE', 'Service', 'Service or consultation', true)
ON CONFLICT ("code") DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES (Optional - for testing)
-- ============================================================================

-- SELECT * FROM "community_user_request_status";
-- SELECT * FROM "event_modality";
-- SELECT * FROM "link_type";
-- SELECT * FROM "user_role";
-- SELECT * FROM "ticket_status";
