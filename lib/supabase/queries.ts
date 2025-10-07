import "server-only";

import { cache } from "react";

import { createServiceRoleClient } from "./client";
import type { Litter, Parent, Puppy, PuppyStatus, PuppyWithRelations } from "./types";

let cachedClient: ReturnType<typeof createServiceRoleClient> | null = null;

function getSupabaseClient() {
  if (!cachedClient) {
    cachedClient = createServiceRoleClient();
  }
  return cachedClient;
}

export type PuppyFilter = {
  status?: PuppyStatus | "all";
  breed?: "french_bulldog" | "english_bulldog" | "all";
};

export const getPuppies = cache(async () => {
  const { data, error } = await getSupabaseClient()
    .from("puppies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Puppy[];
});

export const getParents = cache(async () => {
  const { data, error } = await getSupabaseClient().from("parents").select("*").order("name");
  if (error) {
    throw error;
  }
  return (data ?? []) as Parent[];
});

export const getLitters = cache(async () => {
  const { data, error } = await getSupabaseClient().from("litters").select("*").order("born_at", { ascending: false });
  if (error) {
    throw error;
  }
  return (data ?? []) as Litter[];
});

export function applyPuppyFilters(
  puppies: PuppyWithRelations[],
  filter: PuppyFilter = {},
) {
  return puppies.filter((puppy) => {
    const matchesStatus =
      !filter.status || filter.status === "all" || puppy.status === filter.status;

    const sireBreed = puppy.parents?.sire?.breed;
    const damBreed = puppy.parents?.dam?.breed;
    const resolvedBreed = sireBreed ?? damBreed ?? undefined;
    const matchesBreed =
      !filter.breed || filter.breed === "all" || resolvedBreed === filter.breed;

    return matchesStatus && matchesBreed;
  });
}

export const getPuppiesWithRelations = cache(async () => {
  const [puppies, litters, parents] = await Promise.all([
    getPuppies(),
    getLitters(),
    getParents(),
  ]);

  const parentById = new Map<string, Parent>();
  parents.forEach((parent) => {
    parentById.set(parent.id, parent);
  });

  const litterById = new Map<string, Litter>();
  litters.forEach((litter) => {
    litterById.set(litter.id, litter);
  });

  return puppies.map<PuppyWithRelations>((puppy) => {
    const litter = puppy.litter_id ? litterById.get(puppy.litter_id) ?? null : null;
    const sire = litter?.sire_id ? parentById.get(litter.sire_id) ?? null : null;
    const dam = litter?.dam_id ? parentById.get(litter.dam_id) ?? null : null;

    return {
      ...puppy,
      litter: litter ?? null,
      parents: {
        sire,
        dam,
      },
    };
  });
});

export const getFilteredPuppies = cache(async (filter: PuppyFilter = {}) => {
  const puppies = await getPuppiesWithRelations();
  return applyPuppyFilters(puppies, filter);
});

export const getPuppyBySlug = cache(async (slug: string) => {
  const { data, error } = await getSupabaseClient().from("puppies").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const litters = await getLitters();
  const litter = data.litter_id ? litters.find((l) => l.id === data.litter_id) ?? null : null;

  const parentsList = await getParents();
  const parents = litter
    ? {
        sire: litter.sire_id ? parentsList.find((p) => p.id === litter.sire_id) ?? null : null,
        dam: litter.dam_id ? parentsList.find((p) => p.id === litter.dam_id) ?? null : null,
      }
    : null;

  return {
    ...(data as Puppy),
    litter,
    parents,
  } as PuppyWithRelations;
});
