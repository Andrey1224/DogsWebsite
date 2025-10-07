import { createClient } from "@supabase/supabase-js";

export function createSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase client misconfigured: SUPABASE_URL or SUPABASE_ANON_KEY missing");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
    },
  });
}
