import { createServiceRoleClient } from '@/lib/supabase/client';

const RATE_LIMIT_WINDOW_MINUTES = 15;
const EMAIL_LIMIT = 3;
const IP_LIMIT = 5;

export type RateLimitResult = { ok: true } | { ok: false; reason: 'email' | 'ip'; message: string };

function getWindowStartIso() {
  const now = Date.now();
  const windowMs = RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;
  return new Date(now - windowMs).toISOString();
}

export async function checkInquiryRateLimit({
  email,
  clientIp,
}: {
  email: string;
  clientIp?: string | null;
}): Promise<RateLimitResult> {
  const supabase = createServiceRoleClient();
  const sinceIso = getWindowStartIso();

  if (email) {
    const { count, error } = await supabase
      .from('inquiries')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', sinceIso);

    if (error) {
      throw error;
    }

    if ((count ?? 0) >= EMAIL_LIMIT) {
      return {
        ok: false,
        reason: 'email',
        message: 'You’ve already sent a few inquiries. We’ll be in touch shortly.',
      };
    }
  }

  if (clientIp) {
    const { count, error } = await supabase
      .from('inquiries')
      .select('id', { count: 'exact', head: true })
      .eq('client_ip', clientIp)
      .gte('created_at', sinceIso);

    if (error) {
      throw error;
    }

    if ((count ?? 0) >= IP_LIMIT) {
      return {
        ok: false,
        reason: 'ip',
        message:
          'Looks like several inquiries came from this connection. Please wait before submitting again.',
      };
    }
  }

  return { ok: true };
}
