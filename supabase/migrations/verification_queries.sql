-- Post-Migration Verification Queries
-- Run these after all 4 stages to verify successful migration

-- 1. Verify function signatures updated correctly
SELECT
  proname as function_name,
  pg_get_function_result(oid) as return_type,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc
WHERE proname IN ('create_reservation_transaction', 'expire_pending_reservations', 'check_puppy_availability')
ORDER BY proname;

-- Expected results:
-- create_reservation_transaction | reservations | (11 parameters including p_expires_at)
-- expire_pending_reservations | integer | (empty - no parameters)
-- check_puppy_availability | trigger | (empty - trigger function)

-- 2. Verify trigger exists and is active
SELECT
  tgname as trigger_name,
  tgenabled as enabled,
  pg_get_triggerdef(oid) as definition
FROM pg_trigger
WHERE tgname = 'enforce_puppy_availability';

-- Expected: 1 row with tgenabled = 'O' (origin enabled)

-- 3. Test expire_pending_reservations function returns INTEGER
SELECT expire_pending_reservations() as expired_count;

-- Expected: Returns a number (0 or more)

-- 4. Verify GRANT exists for service_role (CRITICAL!)
SELECT
  has_function_privilege('service_role',
    'create_reservation_transaction(uuid,text,text,text,text,numeric,numeric,text,text,timestamptz,text)',
    'EXECUTE') as service_role_can_execute;

-- Expected: true

-- 5. Check current reservations state
SELECT
  id,
  puppy_id,
  status,
  expires_at,
  CASE
    WHEN expires_at IS NULL THEN 'no expiry'
    WHEN expires_at > NOW() THEN 'active'
    ELSE 'expired'
  END as expiry_status,
  created_at
FROM reservations
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Expected: Shows current pending reservations with expiry status

-- 6. Verify no puppies stuck in 'reserved' status without active reservations
SELECT
  p.id,
  p.name,
  p.slug,
  p.status as puppy_status,
  COUNT(r.id) FILTER (WHERE r.status = 'paid' OR (r.status = 'pending' AND (r.expires_at IS NULL OR r.expires_at > NOW()))) as active_reservations
FROM puppies p
LEFT JOIN reservations r ON p.id = r.puppy_id
WHERE p.status = 'reserved'
GROUP BY p.id, p.name, p.slug, p.status
HAVING COUNT(r.id) FILTER (WHERE r.status = 'paid' OR (r.status = 'pending' AND (r.expires_at IS NULL OR r.expires_at > NOW()))) = 0;

-- Expected: 0 rows (all reserved puppies should have active reservations)

RAISE NOTICE 'All verification queries completed. Review results above.';
