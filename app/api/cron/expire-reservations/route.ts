import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/client';
import { alertWebhookError } from '@/lib/monitoring/webhook-alerts';

export const runtime = 'nodejs';

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }

  const headerValue = request.headers.get('authorization');
  return headerValue === `Bearer ${cronSecret}`;
}

function alertCronFailure(error: string) {
  void alertWebhookError({
    provider: 'stripe',
    eventType: 'reservation-expiry-cron',
    eventId: `cron:${new Date().toISOString().slice(0, 13)}`,
    paymentId: 'reservation-expiry-cron',
    error,
    timestamp: new Date(),
  }).catch((alertError) => console.error('[Cron] Failed to send cron alert:', alertError));
}

export async function POST(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    alertCronFailure('CRON_SECRET is not configured');
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 });
  }

  if (!isAuthorized(request)) {
    if (request.headers.get('user-agent')?.includes('vercel-cron')) {
      alertCronFailure('Vercel reservation expiry cron was unauthorized');
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.rpc('expire_pending_reservations');

    if (error) {
      console.error('[Cron] Failed to expire reservations:', error);
      alertCronFailure(`Failed to expire reservations: ${error.message}`);
      return NextResponse.json({ error: 'Failed to expire reservations' }, { status: 500 });
    }

    return NextResponse.json({
      expired: typeof data === 'number' ? data : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Unexpected error:', error);
    alertCronFailure(error instanceof Error ? error.message : 'Unexpected cron error');
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
