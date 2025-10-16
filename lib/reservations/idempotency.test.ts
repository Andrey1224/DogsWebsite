import { describe, it, expect, vi, afterEach, type Mock } from 'vitest';

vi.mock('@/lib/supabase/client', () => ({
  createSupabaseClient: () => ({
    from: vi.fn(),
    rpc: vi.fn(),
  }),
}));

import {
  IdempotencyKeyGenerator,
  createWebhookEventWithIdempotency,
  idempotencyManager,
} from './idempotency';

describe('Idempotency utilities', () => {
  const originalSupabase = (idempotencyManager as unknown as { supabase?: unknown }).supabase;

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    if (originalSupabase) {
      (idempotencyManager as unknown as { supabase?: unknown }).supabase = originalSupabase;
    }
  });

  it('delegates webhook creation and flags duplicates', async () => {
    const createSpy = vi
      .spyOn(idempotencyManager, 'createWebhookEvent')
      .mockResolvedValueOnce({
        success: true,
        isDuplicate: false,
        webhookEvent: { id: 1 } as import('@/lib/reservations/types').WebhookEvent,
      })
      .mockResolvedValueOnce({
        success: true,
        isDuplicate: true,
      });

    const params = {
      provider: 'stripe' as const,
      eventId: 'evt_1',
      eventType: 'payment',
      payload: { foo: 'bar' },
    };

    const first = await createWebhookEventWithIdempotency(params);
    const second = await createWebhookEventWithIdempotency(params);

    expect(first).toMatchObject({ success: true, isDuplicate: false });
    expect(second).toMatchObject({ success: true, isDuplicate: true });
    expect(createSpy).toHaveBeenCalledTimes(2);
  });

  it('creates stable keys for retries with deterministic timestamp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789);

    const webhookKey = IdempotencyKeyGenerator.forWebhook('stripe', 'evt_123', {
      foo: '1',
      bar: '2',
    });
    const reservationKey = IdempotencyKeyGenerator.forReservation('stripe', 'pay_1', 'puppy_1');
    const retryKey = IdempotencyKeyGenerator.forRetry('reservation', 1);

    expect(webhookKey).toBe('stripe:evt_123:bar=2&foo=1');
    expect(reservationKey).toBe('stripe:pay_1:puppy_1');
    expect(retryKey.startsWith('reservation:1704110400')).toBe(true);
  });

  it('marks webhook as processed and attaches reservation id', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    (idempotencyManager as unknown as { supabase: { from: Mock } }).supabase = {
      from: vi.fn(() => ({
        update: vi.fn(() => ({
          eq,
        })),
      })),
    };

    const result = await idempotencyManager.markAsProcessed(42, 'res_42');
    expect(result).toBe(true);
    expect(eq).toHaveBeenCalledWith('id', 42);
  });

  it('marks webhook as failed when update returns error', async () => {
    const eq = vi.fn().mockResolvedValue({ error: { message: 'failed' } });
    (idempotencyManager as unknown as { supabase: { from: Mock } }).supabase = {
      from: vi.fn(() => ({
        update: vi.fn(() => ({
          eq,
        })),
      })),
    };

    const result = await idempotencyManager.markAsProcessed(13);
    expect(result).toBe(false);
  });

  it('marks webhook as failed and records error message', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    (idempotencyManager as unknown as { supabase: { from: Mock } }).supabase = {
      from: vi.fn(() => ({
        update: vi.fn(() => ({
          eq,
        })),
      })),
    };

    const result = await idempotencyManager.markAsFailed(99, 'timeout');
    expect(result).toBe(true);
    expect(eq).toHaveBeenCalledWith('id', 99);
  });

  it('locks webhook event for processing', async () => {
    const finalEq = vi.fn().mockResolvedValue({ error: null });
    const lockSupabase = {
      from: vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            is: vi.fn(() => ({
              eq: finalEq,
            })),
          })),
        })),
      })),
    };
    (idempotencyManager as unknown as { supabase: { from: Mock } }).supabase = lockSupabase;

    const result = await idempotencyManager.lockForProcessing(7);
    expect(result).toBe(true);
    expect(finalEq).toHaveBeenCalled();
  });

  it('cleans up old events via delete + lt', async () => {
    const lt = vi.fn(() => ({ error: null }));
    (idempotencyManager as unknown as { supabase: { from: Mock } }).supabase = {
      from: vi.fn(() => ({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            lt,
          })),
        })),
      })),
    };

    const deleted = await idempotencyManager.cleanupOldEvents(15);
    expect(deleted).toBe(1);
    expect(lt).toHaveBeenCalled();
  });

  it('returns pending events limited by query', async () => {
    const events = [{ id: 1, provider: 'stripe', event_id: 'evt_1', processed: false }];
    (idempotencyManager as unknown as { supabase: { from: Mock } }).supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            or: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(async () => ({ data: events, error: null })),
              })),
            })),
          })),
        })),
      })),
    };

    const pending = await idempotencyManager.getPendingEvents(5);
    expect(pending).toEqual(events);
  });
});
