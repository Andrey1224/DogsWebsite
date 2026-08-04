// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { randomUUID } from 'node:crypto';

const databaseUrl = process.env.SUPABASE_TEST_DB_URL;
const isLocalDatabase = Boolean(
  databaseUrl?.includes('127.0.0.1') || databaseUrl?.includes('localhost'),
);
const describeOrSkip = isLocalDatabase ? describe : describe.skip;

describeOrSkip('reservation integrity database contract', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: databaseUrl });
  });

  beforeEach(async () => {
    await pool.query(
      'TRUNCATE TABLE webhook_alert_buckets, webhook_events, reservations, puppies RESTART IDENTITY CASCADE;',
    );
  });

  afterAll(async () => {
    await pool.end();
  });

  async function insertPuppy(status = 'available', price = 2000) {
    const id = randomUUID();
    await pool.query(
      `INSERT INTO puppies (id, name, slug, price_usd, status)
       VALUES ($1, 'Integrity Puppy', $2, $3, $4)`,
      [id, `integrity-${id}`, price, status],
    );
    return id;
  }

  async function createReservation(puppyId: string, paymentId: string, paymentType = 'deposit') {
    return pool.query(
      `SELECT * FROM public.create_reservation_transaction(
        $1, 'Test Customer', 'test@example.com', '+15555555555', 'site',
        $2, $2, 'stripe', $3, NOW() + INTERVAL '15 minutes', NULL, $4
      )`,
      [puppyId, paymentType === 'full' ? 2000 : 300, paymentId, paymentType],
    );
  }

  it('never expires a paid-signal pending reservation', async () => {
    const puppyId = await insertPuppy('reserved');
    const reservationId = randomUUID();
    await pool.query(
      `INSERT INTO reservations (
        id, puppy_id, customer_email, channel, status, deposit_amount, amount,
        payment_provider, external_payment_id, expires_at
      ) VALUES ($1, $2, 'paid@example.com', 'site', 'pending', 300, 300,
        'stripe', 'pi_paid_signal', NOW() - INTERVAL '1 hour')`,
      [reservationId, puppyId],
    );

    expect((await pool.query('SELECT expire_pending_reservations() AS count')).rows[0].count).toBe(
      0,
    );
    expect(
      (await pool.query('SELECT status FROM reservations WHERE id=$1', [reservationId])).rows[0]
        .status,
    ).toBe('pending');
    expect(
      (await pool.query('SELECT status FROM puppies WHERE id=$1', [puppyId])).rows[0].status,
    ).toBe('reserved');
  });

  it('expires an unpaid stale hold and releases its puppy', async () => {
    const puppyId = await insertPuppy('reserved');
    const reservationId = randomUUID();
    await pool.query(
      `INSERT INTO reservations (id, puppy_id, customer_email, channel, status, expires_at)
       VALUES ($1, $2, 'hold@example.com', 'site', 'pending', NOW() - INTERVAL '1 hour')`,
      [reservationId, puppyId],
    );

    expect((await pool.query('SELECT expire_pending_reservations() AS count')).rows[0].count).toBe(
      1,
    );
    expect(
      (await pool.query('SELECT status FROM reservations WHERE id=$1', [reservationId])).rows[0]
        .status,
    ).toBe('expired');
    expect(
      (await pool.query('SELECT status FROM puppies WHERE id=$1', [puppyId])).rows[0].status,
    ).toBe('available');
  });

  it('does not release a manual puppy hold with no reservation rows', async () => {
    const puppyId = await insertPuppy('reserved');
    expect((await pool.query('SELECT expire_pending_reservations() AS count')).rows[0].count).toBe(
      0,
    );
    expect(
      (await pool.query('SELECT status FROM puppies WHERE id=$1', [puppyId])).rows[0].status,
    ).toBe('reserved');
  });

  it('allows exactly one concurrent reservation for a puppy', async () => {
    const puppyId = await insertPuppy();
    const results = await Promise.allSettled([
      createReservation(puppyId, 'pi_concurrent_1'),
      createReservation(puppyId, 'pi_concurrent_2'),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    const failure = results.find((result) => result.status === 'rejected');
    expect(failure).toBeDefined();
    if (failure?.status === 'rejected') {
      expect(String(failure.reason)).toContain('PUPPY_NOT_AVAILABLE');
      expect(String(failure.reason)).not.toContain('duplicate key value');
    }
  });

  it('maps a genuine duplicate provider payment without reserving the second puppy', async () => {
    const firstPuppyId = await insertPuppy();
    const secondPuppyId = await insertPuppy();
    await createReservation(firstPuppyId, 'pi_duplicate');
    await expect(createReservation(secondPuppyId, 'pi_duplicate')).rejects.toThrow(
      /DUPLICATE_EXTERNAL_PAYMENT/,
    );
    expect(
      (await pool.query('SELECT status FROM puppies WHERE id=$1', [secondPuppyId])).rows[0].status,
    ).toBe('available');
  });

  it('marks a newer reservation paid while an older expired row exists', async () => {
    const puppyId = await insertPuppy('reserved');
    await pool.query(
      `INSERT INTO reservations (id, puppy_id, customer_email, channel, status, expires_at)
       VALUES ($1, $2, 'old@example.com', 'site', 'expired', NOW() - INTERVAL '1 hour')`,
      [randomUUID(), puppyId],
    );
    const activeId = randomUUID();
    await pool.query(
      `INSERT INTO reservations (
        id, puppy_id, customer_email, channel, status, payment_provider,
        external_payment_id, expires_at
      ) VALUES ($1, $2, 'new@example.com', 'site', 'pending', 'stripe',
        'pi_newer', NOW() + INTERVAL '15 minutes')`,
      [activeId, puppyId],
    );
    await expect(
      pool.query("UPDATE reservations SET status='paid' WHERE id=$1", [activeId]),
    ).resolves.toBeDefined();
  });

  it('releases after a full refund, permits resale, and refuses release while paid', async () => {
    const puppyId = await insertPuppy();
    const first = await createReservation(puppyId, 'pi_full_1', 'full');
    const firstReservationId = first.rows[0].id;
    await pool.query("UPDATE reservations SET status='paid' WHERE id=$1", [firstReservationId]);
    expect(
      (
        await pool.query('SELECT release_puppy_if_no_active_reservations($1) AS released', [
          puppyId,
        ])
      ).rows[0].released,
    ).toBe(false);
    await pool.query("UPDATE reservations SET status='refunded' WHERE id=$1", [firstReservationId]);
    expect(
      (
        await pool.query('SELECT release_puppy_if_no_active_reservations($1) AS released', [
          puppyId,
        ])
      ).rows[0].released,
    ).toBe(true);
    await expect(createReservation(puppyId, 'pi_full_2')).resolves.toBeDefined();
  });

  it('durably aggregates repeated alert-bucket claims', async () => {
    expect(
      (await pool.query("SELECT claim_webhook_alert_bucket('stripe','stale',15) AS count")).rows[0]
        .count,
    ).toBe(1);
    expect(
      (await pool.query("SELECT claim_webhook_alert_bucket('stripe','stale',15) AS count")).rows[0]
        .count,
    ).toBe(0);
    expect(
      (
        await pool.query(
          "SELECT pending_count FROM webhook_alert_buckets WHERE provider='stripe' AND bucket_key='stale'",
        )
      ).rows[0].pending_count,
    ).toBe(1);
    await pool.query(
      "UPDATE webhook_alert_buckets SET last_alerted_at=NOW()-INTERVAL '16 minutes' WHERE provider='stripe' AND bucket_key='stale'",
    );
    expect(
      (await pool.query("SELECT claim_webhook_alert_bucket('stripe','stale',15) AS count")).rows[0]
        .count,
    ).toBe(2);
  });
});
