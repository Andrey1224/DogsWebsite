import type { SupabaseFixture } from '../tests/fixtures/supabase-client-fixture';

declare global {
  var __SUPABASE_FIXTURE__: SupabaseFixture;
}

export {};
