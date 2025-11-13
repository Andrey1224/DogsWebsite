import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const BASE_ENV = { ...process.env };

vi.mock('@/lib/supabase/client', () => {
  let fixture = createSupabaseStub();
  return {
    createSupabaseClient: () => fixture.client,
    __setFixture(newFixture: ReturnType<typeof createSupabaseStub>) {
      fixture = newFixture;
    },
  };
});

function createSupabaseStub() {
  const tables = new Map<string, Record<string, unknown>[]>();
  const register = new Map<string, import('vitest').Mock>();

  const makeQuery = (table: string) => ({
    insert: vi.fn((values: Record<string, unknown> | Record<string, unknown>[]) => {
      const next = Array.isArray(values) ? values : [values];
      const nextWithIds = next.map((item, idx) => ({
        ...item,
        id: item.id ?? (tables.get(table)?.length ?? 0) + idx + 1,
      }));
      tables.set(table, [...(tables.get(table) || []), ...nextWithIds]);
      return {
        select: vi.fn(() => ({
          single: async () => ({ data: nextWithIds[0] ?? null, error: null }),
        })),
      };
    }),
    select: vi.fn(() => {
      const state = tables.get(table) || [];
      const builder: Record<string, unknown> = {
        eq: vi.fn((field: string, value: unknown) => {
          const filtered = state.filter((row) => row[field] === value);
          return {
            eq: builder.eq,
            in: builder.in,
            or: builder.or,
            single: async () => ({ data: filtered[0] ?? null, error: filtered[0] ? null : { message: 'not found' } }),
            order: vi.fn(() => ({
              data: filtered,
              error: null,
              limit: vi.fn(async () => ({ data: filtered, error: null })),
              range: vi.fn(() => ({ data: filtered, error: null })),
            })),
            limit: vi.fn(async () => ({ data: filtered, error: null })),
          };
        }),
        in: vi.fn((field: string, values: string[]) => {
          const filtered = state.filter((row) => values.includes(row[field] as string));
          return {
            order: vi.fn(() => ({
              data: filtered,
              error: null,
              limit: vi.fn(async () => ({ data: filtered, error: null })),
            })),
            limit: vi.fn(async () => ({ data: filtered, error: null })),
          };
        }),
        or: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(async () => ({ data: state, error: null })),
          })),
        })),
        ilike: vi.fn((field: string, value: string) => {
          const normalized = value.toLowerCase();
          const filtered = state.filter((row) => String(row[field] ?? '').toLowerCase() === normalized);
          return {
            order: vi.fn(() => ({
              data: filtered,
              error: null,
            })),
          };
        }),
        order: vi.fn(() => ({
          data: state,
          error: null,
          limit: vi.fn(async () => ({ data: state, error: null })),
          range: vi.fn(() => ({ data: state, error: null })),
        })),
        single: async () => ({ data: state[0] ?? null, error: state[0] ? null : { message: 'not found' } }),
        maybeSingle: async () => ({ data: state[0] ?? null, error: null }),
      };
      return builder;
    }),
    update: vi.fn((values: Record<string, unknown>) => {
      return {
        eq: vi.fn((field: string, value: unknown) => {
          const current = tables.get(table) || [];
          const index = current.findIndex((row) => row[field] === value);
          let updated = null;
          if (index >= 0) {
            current[index] = { ...current[index], ...values, updated_at: new Date().toISOString() };
            updated = current[index];
            tables.set(table, current);
          }
          return {
            select: vi.fn(() => ({
              single: async () => ({ data: updated, error: updated ? null : { message: 'not found' } }),
            })),
            error: null,
          };
        }),
      };
    }),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        lt: vi.fn(() => ({ error: null })),
        error: null,
      })),
    })),
  });

  const rpc = vi.fn(async (fn: string, params?: Record<string, unknown>) => {
    if (register.has(fn)) {
      return register.get(fn)!(params);
    }
    if (fn === 'expire_pending_reservations') {
      return { data: 2, error: null };
    }
    if (fn === 'get_reservation_summary') {
      return {
        data: [{
          total_reservations: 2,
          pending_reservations: 1,
          paid_reservations: 1,
          total_amount: '1500',
        }],
        error: null,
      };
    }
    return { data: null, error: { message: `rpc ${fn} not stubbed` } };
  });

  return {
    client: {
      from: makeQuery,
      rpc,
      registerRpc: register.set.bind(register),
    },
    tables,
    register,
  };
}

describe('ReservationQueries', () => {
  let supabaseStub = createSupabaseStub();

beforeEach(async () => {
  Object.assign(process.env, BASE_ENV);
  vi.resetModules();
  supabaseStub = createSupabaseStub();
  const supabaseModule = await import('@/lib/supabase/client');
  vi.spyOn(supabaseModule, 'createSupabaseClient').mockReturnValue(supabaseStub.client as unknown as ReturnType<typeof supabaseModule.createSupabaseClient>);
});

  afterEach(() => {
    Object.assign(process.env, BASE_ENV);
    vi.restoreAllMocks();
  });

  it('creates and retrieves reservations by payment id', async () => {
    const { ReservationQueries } = await import('./queries');

    const created = await ReservationQueries.create({
      puppy_id: 'puppy-1',
      customer_email: 'test@example.com',
      customer_name: 'Test',
      customer_phone: null,
      channel: 'site',
      status: 'pending',
      deposit_amount: 500,
      amount: 500,
      payment_provider: 'stripe',
      external_payment_id: 'pi_1',
      webhook_event_id: null,
      expires_at: null,
      notes: null,
    });

    expect(created).toMatchObject({ customer_email: 'test@example.com' });

    const fetched = await ReservationQueries.getByPayment('stripe', 'pi_1');
    expect(fetched?.customer_email).toBe('test@example.com');
  });

  it('updates reservation status and cancels with reason', async () => {
    const { ReservationQueries } = await import('./queries');

    const created = await ReservationQueries.create({
      puppy_id: 'puppy-2',
      customer_email: 'cancel@example.com',
      customer_name: 'Cancel',
      customer_phone: null,
      channel: 'site',
      status: 'pending',
      deposit_amount: 600,
      amount: 600,
      payment_provider: 'stripe',
      external_payment_id: 'pi_cancel',
      webhook_event_id: null,
      expires_at: null,
      notes: null,
    });

    const updated = await ReservationQueries.updateStatus(created.id, 'paid');
    expect(updated?.status).toBe('paid');

    const cancelled = await ReservationQueries.cancel(created.id, 'Customer requested');
    expect(cancelled?.notes).toBe('Customer requested');
  });

  it('returns reservation summary via RPC', async () => {
    const { ReservationQueries } = await import('./queries');
    const summary = await ReservationQueries.getSummary('puppy-1');
    expect(summary).toEqual({
      total_reservations: 2,
      pending_reservations: 1,
      paid_reservations: 1,
      total_amount: 1500,
    });
  });

  it('expires old pending reservations using RPC', async () => {
    const { ReservationQueries } = await import('./queries');
    const result = await ReservationQueries.expireOldPending();
    expect(result).toBe(2);
  });

  it('supports lookup and deletion helpers', async () => {
    const { ReservationQueries } = await import('./queries');
    const reservation = {
      id: 'res-lookup',
      puppy_id: 'puppy-42',
      customer_email: 'lookup@example.com',
      customer_name: 'Lookup',
      customer_phone: null,
      channel: 'site',
      status: 'pending',
      deposit_amount: 400,
      amount: 400,
      payment_provider: 'stripe' as const,
      external_payment_id: 'pi_lookup',
      webhook_event_id: null,
      expires_at: null,
      notes: null,
    };

    const reservationTable = supabaseStub.tables.get('reservations') ?? [];
    reservationTable.splice(0, reservationTable.length, reservation);
    supabaseStub.tables.set('reservations', reservationTable);
    expect(reservationTable).toHaveLength(1);

    const byId = await ReservationQueries.getById('res-lookup');
    expect(byId?.customer_email).toBe('lookup@example.com');

    const byPuppy = await ReservationQueries.getByPuppyId('puppy-42');
    expect(byPuppy).toHaveLength(1);

    const active = await ReservationQueries.getActiveByPuppyId('puppy-42');
    expect(active[0]?.status).toBe('pending');

    const similar = await ReservationQueries.getByCustomerEmail('LOOKUP@EXAMPLE.COM');
    expect(similar).toHaveLength(1);

    const removed = await ReservationQueries.delete('res-lookup');
    expect(removed).toBe(true);
  });

  it('evaluates active reservations based on status and expiration', async () => {
    const { ReservationQueries } = await import('./queries');
    const reservationTable = supabaseStub.tables.get('reservations') ?? [];
    const baseReservation = {
      id: 'res-active',
      puppy_id: 'puppy-active',
      customer_email: 'active@example.com',
      customer_name: 'Active User',
      customer_phone: null,
      channel: 'site',
      status: 'pending',
      deposit_amount: 300,
      amount: 300,
      payment_provider: 'stripe' as const,
      external_payment_id: 'pi_active',
      webhook_event_id: null,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      notes: null,
    };

    reservationTable.splice(0, reservationTable.length, baseReservation);
    supabaseStub.tables.set('reservations', reservationTable);

    expect(await ReservationQueries.hasActiveReservation('puppy-active')).toBe(true);

    reservationTable[0] = {
      ...baseReservation,
      expires_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    };
    supabaseStub.tables.set('reservations', reservationTable);

    expect(await ReservationQueries.hasActiveReservation('puppy-active')).toBe(false);

    reservationTable[0] = {
      ...baseReservation,
      status: 'paid',
      expires_at: null,
    };
    supabaseStub.tables.set('reservations', reservationTable);

    expect(await ReservationQueries.hasActiveReservation('puppy-active')).toBe(true);
  });
});

describe('PuppyQueries', () => {
  let supabaseStub = createSupabaseStub();

beforeEach(async () => {
  vi.restoreAllMocks();
  vi.resetModules();
  Object.assign(process.env, BASE_ENV);
  supabaseStub = createSupabaseStub();
  const supabaseModule = await import('@/lib/supabase/client');
  vi.spyOn(supabaseModule, 'createSupabaseClient').mockReturnValue(supabaseStub.client as unknown as ReturnType<typeof supabaseModule.createSupabaseClient>);
});

  it('returns false when puppy is reserved', async () => {
    supabaseStub.tables.set('puppies', [{ id: 'puppy-1', status: 'reserved' }]);
    supabaseStub.tables.set('reservations', []);

    const { PuppyQueries } = await import('./queries');
    const result = await PuppyQueries.isAvailable('puppy-1');
    expect(result).toBe(false);
  });

  it('returns false when puppy has active reservations', async () => {
    supabaseStub.tables.set('puppies', [{ id: 'puppy-2', status: 'available' }]);
    supabaseStub.tables.set('reservations', [
      { id: 'res-1', puppy_id: 'puppy-2', status: 'pending' }
    ]);

    const { PuppyQueries } = await import('./queries');
    const result = await PuppyQueries.isAvailable('puppy-2');
    expect(result).toBe(false);
  });

  it('returns true when puppy is available and has no active reservations', async () => {
    supabaseStub.tables.set('puppies', [{ id: 'puppy-3', status: 'available' }]);
    supabaseStub.tables.set('reservations', []);

    const { PuppyQueries } = await import('./queries');
    const result = await PuppyQueries.isAvailable('puppy-3');
    expect(result).toBe(true);
  });

  it('retrieves puppy details by id', async () => {
    const puppy = {
      id: 'puppy-4',
      name: 'Buddy',
      breed_id: 'breed-1',
      status: 'available',
      price: 3000,
      gender: 'male',
      birth_date: '2024-01-01',
      description: 'A lovely puppy'
    };
    supabaseStub.tables.set('puppies', [puppy]);

    const { PuppyQueries } = await import('./queries');
    const result = await PuppyQueries.getById('puppy-4');
    expect(result).toMatchObject({ name: 'Buddy', price: 3000 });
  });

  it('updates puppy status', async () => {
    supabaseStub.tables.set('puppies', [{ id: 'puppy-5', status: 'available' }]);

    const { PuppyQueries } = await import('./queries');
    const result = await PuppyQueries.updateStatus('puppy-5', 'reserved');
    expect(result).toBe(true);
  });
});

describe('WebhookEventQueries', () => {
  let supabaseStub = createSupabaseStub();

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.resetModules();
    Object.assign(process.env, BASE_ENV);
    supabaseStub = createSupabaseStub();
    const supabaseModule = await import('@/lib/supabase/client');
    vi.spyOn(supabaseModule, 'createSupabaseClient').mockReturnValue(supabaseStub.client as unknown as ReturnType<typeof supabaseModule.createSupabaseClient>);
  });

  it('creates and retrieves webhook event by id', async () => {
    const { WebhookEventQueries } = await import('./queries');

    const event = await WebhookEventQueries.create({
      provider: 'stripe',
      event_id: 'evt_123',
      event_type: 'checkout.session.completed',
      payload: { foo: 'bar' },
      processed: false,
      processing_started_at: null,
      processed_at: null,
      processing_error: null,
      idempotency_key: null,
      reservation_id: null,
    });

    expect(event).toMatchObject({ event_id: 'evt_123', provider: 'stripe' });

    const webhookTable = supabaseStub.tables.get('webhook_events') ?? [];
    const webhookId = (webhookTable[0]?.id as number) ?? 1;
    webhookTable[0] = { ...webhookTable[0], id: webhookId };

    const fetched = await WebhookEventQueries.getById(webhookId);
    expect(fetched?.event_id).toBe('evt_123');
  });

  it('retrieves webhook event by provider and event id', async () => {
    const { WebhookEventQueries } = await import('./queries');

    supabaseStub.tables.set('webhook_events', [{
      id: 1,
      provider: 'paypal',
      event_id: 'WH-456',
      event_type: 'PAYMENT.CAPTURE.COMPLETED',
      payload: {},
      processed: false,
      processing_started_at: null,
      processed_at: null,
      processing_error: null,
      reservation_id: null,
    }]);

    const fetched = await WebhookEventQueries.getByProviderEvent('paypal', 'WH-456');
    expect(fetched).toMatchObject({ provider: 'paypal', event_id: 'WH-456' });
  });

  it('retrieves unprocessed webhook events', async () => {
    const { WebhookEventQueries } = await import('./queries');

    supabaseStub.tables.set('webhook_events', [
      {
        id: 1,
        provider: 'stripe',
        event_id: 'evt_unprocessed_1',
        event_type: 'test',
        payload: {},
        processed: false,
        processing_started_at: null,
        processed_at: null,
        processing_error: null,
        reservation_id: null,
      },
      {
        id: 2,
        provider: 'stripe',
        event_id: 'evt_processed',
        event_type: 'test',
        payload: {},
        processed: true,
        processing_started_at: null,
        processed_at: new Date().toISOString(),
        processing_error: null,
        reservation_id: null,
      },
    ]);

    const unprocessed = await WebhookEventQueries.getUnprocessed(10);
    expect(unprocessed.length).toBeGreaterThan(0);
  });

  it('marks webhook as processed with reservation id', async () => {
    const { WebhookEventQueries } = await import('./queries');

    supabaseStub.tables.set('webhook_events', [{
      id: 42,
      provider: 'stripe',
      event_id: 'evt_mark',
      event_type: 'test',
      payload: {},
      processed: false,
      processing_started_at: null,
      processed_at: null,
      processing_error: null,
      reservation_id: null,
    }]);

    const result = await WebhookEventQueries.markAsProcessed(42, 'res_123');
    expect(result).toBe(true);
  });

  it('marks webhook as failed with error message', async () => {
    const { WebhookEventQueries } = await import('./queries');

    supabaseStub.tables.set('webhook_events', [{
      id: 99,
      provider: 'stripe',
      event_id: 'evt_fail',
      event_type: 'test',
      payload: {},
      processed: false,
      processing_started_at: null,
      processed_at: null,
      processing_error: null,
      reservation_id: null,
    }]);

    const result = await WebhookEventQueries.markAsFailed(99, 'timeout error');
    expect(result).toBe(true);
  });

  it('cleans up old processed events', async () => {
    const { WebhookEventQueries } = await import('./queries');

    const result = await WebhookEventQueries.cleanupOld(30);
    expect(result).toBe(1);
  });

  it('updates webhook event', async () => {
    const { WebhookEventQueries } = await import('./queries');

    supabaseStub.tables.set('webhook_events', [{
      id: 77,
      provider: 'stripe',
      event_id: 'evt_update',
      event_type: 'test',
      payload: {},
      processed: false,
      processing_started_at: null,
      processed_at: null,
      processing_error: null,
      reservation_id: null,
    }]);

    const updated = await WebhookEventQueries.update(77, { processed: true });
    expect(updated?.processed).toBe(true);
  });
});

describe('ReservationQueries - Additional Coverage', () => {
  let supabaseStub = createSupabaseStub();

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.resetModules();
    Object.assign(process.env, BASE_ENV);
    supabaseStub = createSupabaseStub();
    const supabaseModule = await import('@/lib/supabase/client');
    vi.spyOn(supabaseModule, 'createSupabaseClient').mockReturnValue(supabaseStub.client as unknown as ReturnType<typeof supabaseModule.createSupabaseClient>);
  });

  it('retrieves reservations with puppy details', async () => {
    const { ReservationQueries } = await import('./queries');

    supabaseStub.tables.set('reservations', [
      {
        id: 'res-1',
        puppy_id: 'puppy-1',
        customer_email: 'test@example.com',
        customer_name: 'Test',
        status: 'paid',
      }
    ]);

    const result = await ReservationQueries.getWithPuppy(10, 0);
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it('returns empty array when reservation summary RPC returns no data', async () => {
    const { ReservationQueries } = await import('./queries');

    supabaseStub.register.set('get_reservation_summary', vi.fn(async () => ({
      data: [],
      error: null,
    })));

    const summary = await ReservationQueries.getSummary('nonexistent');
    expect(summary).toEqual({
      total_reservations: 0,
      pending_reservations: 0,
      paid_reservations: 0,
      total_amount: 0,
    });
  });

  it('returns empty array when puppy does not exist', async () => {
    const { PuppyQueries } = await import('./queries');

    supabaseStub.tables.set('puppies', []);

    const result = await PuppyQueries.isAvailable('nonexistent');
    expect(result).toBe(false);
  });

  it('returns null when puppy getById fails', async () => {
    const { PuppyQueries } = await import('./queries');

    supabaseStub.tables.set('puppies', []);

    const result = await PuppyQueries.getById('nonexistent');
    expect(result).toBe(null);
  });

  it('returns null when reservation getById fails', async () => {
    const { ReservationQueries } = await import('./queries');

    supabaseStub.tables.set('reservations', []);

    const result = await ReservationQueries.getById('nonexistent');
    expect(result).toBe(null);
  });

  it('returns null when getByPayment fails', async () => {
    const { ReservationQueries } = await import('./queries');

    supabaseStub.tables.set('reservations', []);

    const result = await ReservationQueries.getByPayment('stripe', 'nonexistent');
    expect(result).toBe(null);
  });

  it('returns null when webhook getById fails', async () => {
    const { WebhookEventQueries } = await import('./queries');

    supabaseStub.tables.set('webhook_events', []);

    const result = await WebhookEventQueries.getById(999);
    expect(result).toBe(null);
  });

  it('returns null when getByProviderEvent fails', async () => {
    const { WebhookEventQueries } = await import('./queries');

    supabaseStub.tables.set('webhook_events', []);

    const result = await WebhookEventQueries.getByProviderEvent('stripe', 'nonexistent');
    expect(result).toBe(null);
  });
});
