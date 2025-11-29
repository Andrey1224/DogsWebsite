import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase client misconfigured: SUPABASE_URL or SUPABASE_ANON_KEY missing');
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
    },
  });
}

export function createServiceRoleClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !serviceKey) {
    throw new Error(
      'Supabase service role client misconfigured: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing',
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
    },
  });
}
