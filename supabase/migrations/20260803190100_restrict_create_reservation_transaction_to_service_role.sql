-- create_reservation_transaction is SECURITY DEFINER and was still executable by
-- anon/authenticated via PostgREST RPC (Postgres grants EXECUTE to PUBLIC by
-- default on function creation; the original migration granted service_role but
-- never revoked the default PUBLIC grant). This let unauthenticated callers mark
-- puppies 'reserved'/'sold' without any real payment. Restrict to service_role only.

REVOKE ALL ON FUNCTION create_reservation_transaction(
  UUID, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION create_reservation_transaction(
  UUID, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT
) TO service_role;
