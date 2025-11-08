import "server-only";

import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { getAdminSupabaseClient } from "@/lib/admin/supabase";
import type { Puppy } from "@/lib/supabase/types";
import {
  CreatePuppyInput,
  createPuppySchema,
  deletePuppySchema,
  priceUsdSchema,
  updatePuppyPriceSchema,
  updatePuppyStatusSchema,
} from "./schema";

const ADMIN_PUPPY_FIELDS =
  "id,name,slug,status,price_usd,birth_date,litter_id,created_at,updated_at";

export type AdminPuppyRecord = Pick<
  Puppy,
  "id" | "name" | "slug" | "status" | "price_usd" | "birth_date" | "litter_id" | "created_at" | "updated_at"
>;

function mapCreatePayload(input: CreatePuppyInput) {
  return {
    name: input.name,
    slug: input.slug,
    status: input.status,
    price_usd: input.priceUsd ?? null,
    birth_date: input.birthDate ?? null,
    litter_id: input.litterId ?? null,
  };
}

export async function fetchAdminPuppies(): Promise<AdminPuppyRecord[]> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("puppies")
    .select(ADMIN_PUPPY_FIELDS)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminPuppyRecord[];
}

export async function insertAdminPuppy(input: CreatePuppyInput): Promise<AdminPuppyRecord> {
  const payload = createPuppySchema.parse(input);
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("puppies")
    .insert(mapCreatePayload(payload))
    .select(ADMIN_PUPPY_FIELDS)
    .single();

  if (error) {
    throw error;
  }

  return data as AdminPuppyRecord;
}

export async function updateAdminPuppyStatus(input: { id: string; status: AdminPuppyRecord["status"] }) {
  const payload = updatePuppyStatusSchema.parse(input);
  const supabase = getAdminSupabaseClient();
  const { error } = await supabase
    .from("puppies")
    .update({ status: payload.status })
    .eq("id", payload.id);

  if (error) {
    throw error;
  }
}

export async function updateAdminPuppyPrice(input: { id: string; priceUsd: unknown }) {
  const parsed = updatePuppyPriceSchema.parse({
    id: input.id,
    priceUsd: priceUsdSchema.parse(input.priceUsd),
  });

  const supabase = getAdminSupabaseClient();
  const { error } = await supabase
    .from("puppies")
    .update({ price_usd: parsed.priceUsd })
    .eq("id", parsed.id);

  if (error) {
    throw error;
  }
}

export async function deleteAdminPuppy(input: { id: string }) {
  const payload = deletePuppySchema.parse(input);
  const supabase = getAdminSupabaseClient();
  const { error } = await supabase.from("puppies").delete().eq("id", payload.id);
  if (error) {
    throw error;
  }
}

export async function isPuppySlugTaken(slug: string, options: { excludeId?: string } = {}) {
  const supabase = getAdminSupabaseClient();
  let query = supabase.from("puppies").select("id", { head: true, count: "exact" }).eq("slug", slug);
  if (options.excludeId) {
    query = query.neq("id", options.excludeId);
  }

  const response = (await query) as PostgrestSingleResponse<null>;
  if (response.error) {
    throw response.error;
  }

  return (response.count ?? 0) > 0;
}
