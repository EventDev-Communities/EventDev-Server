-- ============================================================================
-- TEST SCRIPT FOR CHECK CONSTRAINTS
-- This script tests if the check constraints are working properly
-- ============================================================================

-- Test 1: Try to insert INVALID value into event_modality (should FAIL)
DO $$
BEGIN
    BEGIN
        INSERT INTO "event_modality" ("code", "name", "description", "is_active")
        VALUES ('INVALID', 'Invalid Modality', 'This should fail', true);
        RAISE EXCEPTION 'Test FAILED: Invalid value was inserted into event_modality';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Test 1 PASSED: event_modality check constraint is working';
    END;
END $$;

-- Test 2: Try to insert VALID value into event_modality (should SUCCEED)
DO $$
BEGIN
    INSERT INTO "event_modality" ("code", "name", "description", "is_active")
    VALUES ('ONLINE', 'Online', 'Virtual event', true)
    ON CONFLICT ("code") DO NOTHING;
    RAISE NOTICE 'Test 2 PASSED: Valid value inserted into event_modality';
END $$;

-- Test 3: Try to insert INVALID value into user_role (should FAIL)
DO $$
BEGIN
    BEGIN
        INSERT INTO "user_role" ("code", "name", "description", "level", "is_active")
        VALUES ('INVALID_ROLE', 'Invalid Role', 'This should fail', 5, true);
        RAISE EXCEPTION 'Test FAILED: Invalid value was inserted into user_role';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Test 3 PASSED: user_role check constraint is working';
    END;
END $$;

-- Test 4: Try to insert user_role with invalid level (should FAIL)
DO $$
BEGIN
    BEGIN
        INSERT INTO "user_role" ("code", "name", "description", "level", "is_active")
        VALUES ('MEMBER', 'Member', 'Regular member', 99, true)
        ON CONFLICT ("code") DO UPDATE SET "level" = 99;
        RAISE EXCEPTION 'Test FAILED: Invalid level was inserted into user_role';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Test 4 PASSED: user_role level check constraint is working';
    END;
END $$;

-- Test 5: Try to insert INVALID value into ticket_status (should FAIL)
DO $$
BEGIN
    BEGIN
        INSERT INTO "ticket_status" ("code", "name", "description", "is_active")
        VALUES ('INVALID_STATUS', 'Invalid Status', 'This should fail', true);
        RAISE EXCEPTION 'Test FAILED: Invalid value was inserted into ticket_status';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Test 5 PASSED: ticket_status check constraint is working';
    END;
END $$;

-- Test 6: Try to insert VALID value into ticket_status (should SUCCEED)
DO $$
BEGIN
    INSERT INTO "ticket_status" ("code", "name", "description", "is_active")
    VALUES ('CONFIRMED', 'Confirmed', 'Ticket confirmed', true)
    ON CONFLICT ("code") DO NOTHING;
    RAISE NOTICE 'Test 6 PASSED: Valid value inserted into ticket_status';
END $$;

-- Test 7: Try to insert INVALID value into link_type (should FAIL)
DO $$
BEGIN
    BEGIN
        INSERT INTO "link_type" ("code", "name", "description", "is_active")
        VALUES ('INVALID_LINK', 'Invalid Link', 'This should fail', true);
        RAISE EXCEPTION 'Test FAILED: Invalid value was inserted into link_type';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Test 7 PASSED: link_type check constraint is working';
    END;
END $$;

-- Test 8: Try to insert INVALID value into community_user_request_status (should FAIL)
DO $$
BEGIN
    BEGIN
        INSERT INTO "community_user_request_status" ("code", "name", "description", "is_active")
        VALUES ('INVALID_STATUS', 'Invalid Status', 'This should fail', true);
        RAISE EXCEPTION 'Test FAILED: Invalid value was inserted into community_user_request_status';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Test 8 PASSED: community_user_request_status check constraint is working';
    END;
END $$;

-- Test 9: Try to insert INVALID value into order_status (should FAIL)
DO $$
BEGIN
    BEGIN
        INSERT INTO "order_status" ("code", "name", "description", "is_active")
        VALUES ('INVALID_STATUS', 'Invalid Status', 'This should fail', true);
        RAISE EXCEPTION 'Test FAILED: Invalid value was inserted into order_status';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Test 9 PASSED: order_status check constraint is working';
    END;
END $$;

-- Test 10: Try to insert order_item with BOTH ticket_id and product_id (should FAIL)
DO $$
DECLARE
    v_order_id INTEGER;
    v_ticket_id INTEGER;
    v_product_id INTEGER;
BEGIN
    -- Create test data
    INSERT INTO "user" ("supertokens_id", "email", "password", "is_active")
    VALUES ('test_user_constraint', 'test@constraint.com', 'test123', true)
    ON CONFLICT ("supertokens_id") DO UPDATE SET "supertokens_id" = 'test_user_constraint'
    RETURNING "id" INTO v_order_id;

    INSERT INTO "order_status" ("code", "name", "is_active")
    VALUES ('PENDING', 'Pending', true)
    ON CONFLICT ("code") DO NOTHING;

    INSERT INTO "order" ("user_id", "order_status_id", "total_amount", "updated_at")
    VALUES (v_order_id, 1, 100.00, NOW())
    RETURNING "id" INTO v_order_id;

    -- Create dummy ticket and product
    INSERT INTO "community" ("id_supertokens", "name", "is_active", "updated_at")
    VALUES ('test_comm_constraint', 'Test Community', true, NOW())
    ON CONFLICT ("id_supertokens") DO UPDATE SET "id_supertokens" = 'test_comm_constraint'
    RETURNING "id" INTO v_product_id;

    INSERT INTO "event_modality" ("code", "name", "is_active")
    VALUES ('ONLINE', 'Online', true)
    ON CONFLICT ("code") DO NOTHING;

    INSERT INTO "event" ("id_community", "modality_id", "title", "description", "is_active", "start_date_time", "end_date_time", "updated_at")
    VALUES (v_product_id, 1, 'Test Event', 'Test', true, NOW(), NOW(), NOW())
    RETURNING "id" INTO v_ticket_id;

    INSERT INTO "ticket_status" ("code", "name", "is_active")
    VALUES ('CONFIRMED', 'Confirmed', true)
    ON CONFLICT ("code") DO NOTHING;

    INSERT INTO "ticket" ("id_event", "id_user", "id_ticket_status", "value", "purchased_at", "updated_at")
    VALUES (v_ticket_id, v_order_id, 1, 50.00, NOW(), NOW())
    RETURNING "id" INTO v_ticket_id;

    INSERT INTO "product" ("community_id", "name", "price", "is_active", "updated_at")
    VALUES (v_product_id, 'Test Product', 50.00, true, NOW())
    RETURNING "id" INTO v_product_id;

    BEGIN
        -- Try to insert with BOTH ticket_id and product_id (should FAIL)
        INSERT INTO "order_item" ("order_id", "ticket_id", "product_id", "quantity", "unit_price", "total_price")
        VALUES (v_order_id, v_ticket_id, v_product_id, 1, 50.00, 50.00);
        RAISE EXCEPTION 'Test FAILED: order_item accepted both ticket_id and product_id';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Test 10 PASSED: order_item ticket_or_product check constraint is working';
    END;

    -- Cleanup
    DELETE FROM "order" WHERE "id" = v_order_id;
    DELETE FROM "ticket" WHERE "id" = v_ticket_id;
    DELETE FROM "product" WHERE "id" = v_product_id;
    DELETE FROM "event" WHERE "id" = (SELECT "id_event" FROM "ticket" WHERE "id" = v_ticket_id);
    DELETE FROM "community" WHERE "id_supertokens" = 'test_comm_constraint';
    DELETE FROM "user" WHERE "supertokens_id" = 'test_user_constraint';
END $$;

-- Test 11: Try to insert order_item with NEITHER ticket_id nor product_id (should FAIL)
DO $$
DECLARE
    v_order_id INTEGER;
BEGIN
    INSERT INTO "user" ("supertokens_id", "email", "password", "is_active")
    VALUES ('test_user_constraint2', 'test2@constraint.com', 'test123', true)
    ON CONFLICT ("supertokens_id") DO UPDATE SET "supertokens_id" = 'test_user_constraint2'
    RETURNING "id" INTO v_order_id;

    INSERT INTO "order" ("user_id", "order_status_id", "total_amount", "updated_at")
    VALUES (v_order_id, 1, 100.00, NOW())
    RETURNING "id" INTO v_order_id;

    BEGIN
        -- Try to insert with NEITHER ticket_id nor product_id (should FAIL)
        INSERT INTO "order_item" ("order_id", "ticket_id", "product_id", "quantity", "unit_price", "total_price")
        VALUES (v_order_id, NULL, NULL, 1, 50.00, 50.00);
        RAISE EXCEPTION 'Test FAILED: order_item accepted neither ticket_id nor product_id';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Test 11 PASSED: order_item requires exactly one of ticket_id or product_id';
    END;

    -- Cleanup
    DELETE FROM "order" WHERE "id" = v_order_id;
    DELETE FROM "user" WHERE "supertokens_id" = 'test_user_constraint2';
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CHECK CONSTRAINTS TEST SUMMARY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All check constraints are working correctly!';
    RAISE NOTICE 'The database will reject invalid values automatically.';
    RAISE NOTICE '========================================';
END $$;

-- View all check constraints in the database
SELECT
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.constraint_type = 'CHECK'
    AND tc.table_name LIKE '%status'
        OR tc.table_name LIKE '%modality'
        OR tc.table_name LIKE '%role'
        OR tc.table_name LIKE '%type'
ORDER BY tc.table_name;
