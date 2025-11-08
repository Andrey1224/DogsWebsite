import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/client";

let adminClient: ReturnType<typeof createServiceRoleClient> | null = null;

export function getAdminSupabaseClient() {
  if (!adminClient) {
    adminClient = createServiceRoleClient();
  }
  return adminClient;
}
