import { beforeEach, describe, expect, it, vi } from 'vitest';

const { sendEmail } = vi.hoisted(() => ({
  sendEmail: vi.fn().mockResolvedValue({ id: 'email_1' }),
}));

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendEmail };
  },
}));

describe('webhook alerts', () => {
  beforeEach(() => {
    vi.resetModules();
    sendEmail.mockClear();
    process.env.RESEND_API_KEY = 'test-key';
    process.env.RESEND_DELIVERY_MODE = 'always';
    process.env.ALERT_EMAILS = '';
    process.env.OWNER_EMAIL = 'owner@example.com';
    delete process.env.SLACK_WEBHOOK_URL;
  });

  it('falls back to OWNER_EMAIL when ALERT_EMAILS is blank', async () => {
    const { alertWebhookError } = await import('./webhook-alerts');
    await alertWebhookError({
      provider: 'stripe',
      eventType: 'checkout.session.completed',
      eventId: 'evt_1',
      paymentId: 'pi_1',
      error: 'test failure',
      timestamp: new Date('2026-08-03T12:00:00Z'),
    });

    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: ['owner@example.com'] }));
  });

  it('caps distinct failures to ten alerts per minute', async () => {
    const { alertWebhookError } = await import('./webhook-alerts');
    await Promise.all(
      Array.from({ length: 50 }, (_, index) =>
        alertWebhookError({
          provider: 'stripe',
          eventType: 'checkout.session.completed',
          eventId: `evt_${index}`,
          paymentId: `pi_${index}`,
          error: 'test failure',
          timestamp: new Date(),
        }),
      ),
    );

    expect(sendEmail).toHaveBeenCalledTimes(10);
  });
});
