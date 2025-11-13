import "server-only";

import { cache } from "react";

import { createServiceRoleClient } from "./client";
import { runArchiveAwareQuery } from "./archive-support";
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

function normalizeArchiveFlag<T extends { is_archived?: boolean | null }>(
  records: T[],
  usedArchiveColumn: boolean,
): T[] {
  if (usedArchiveColumn) {
    return records;
  }

  return records.map((record) => ({
    ...record,
    is_archived: record.is_archived ?? false,
  }));
}

function normalizeArchiveFlagForRecord<T extends { is_archived?: boolean | null }>(
  record: T | null,
  usedArchiveColumn: boolean,
): T | null {
  if (!record) {
    return null;
  }

  if (usedArchiveColumn) {
    return record;
  }

  return {
    ...record,
    is_archived: record.is_archived ?? false,
  };
}

export const getPuppies = cache(async () => {
  const { data, error, usedArchiveColumn } = await runArchiveAwareQuery<Puppy[]>(async ({ useArchiveColumn }) => {
    let query = getSupabaseClient()
      .from("puppies")
      .select("*")
      .order("created_at", { ascending: false });

    if (useArchiveColumn) {
      query = query.eq("is_archived", false);
    }

    const response = await query;
    return {
      data: (response.data ?? []) as Puppy[],
      error: response.error,
    };
  });

  if (error) {
    throw error;
  }

  return normalizeArchiveFlag((data ?? []) as Puppy[], usedArchiveColumn);
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

    const breedFilter = filter.breed ?? "all";
    if (breedFilter === "all") {
      return matchesStatus;
    }

    const sireBreed = puppy.parents?.sire?.breed;
    const damBreed = puppy.parents?.dam?.breed;
    const matchesBreed =
      puppy.breed === breedFilter ||
      sireBreed === breedFilter ||
      damBreed === breedFilter;

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

    // Get parents directly from puppy's sire_id/dam_id (new approach)
    // Falls back to litter parents if direct IDs are not set (backward compatibility)
    const sire = puppy.sire_id
      ? parentById.get(puppy.sire_id) ?? null
      : litter?.sire_id
        ? parentById.get(litter.sire_id) ?? null
        : null;

    const dam = puppy.dam_id
      ? parentById.get(puppy.dam_id) ?? null
      : litter?.dam_id
        ? parentById.get(litter.dam_id) ?? null
        : null;

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
  const { data, error, usedArchiveColumn } = await runArchiveAwareQuery<Puppy | null>(async ({ useArchiveColumn }) => {
    let query = getSupabaseClient()
      .from("puppies")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (useArchiveColumn) {
      query = query.eq("is_archived", false);
    }

    const response = await query;
    return {
      data: (response.data as Puppy | null) ?? null,
      error: response.error,
    };
  });

  if (error) {
    throw error;
  }

  const record = normalizeArchiveFlagForRecord((data as Puppy | null) ?? null, usedArchiveColumn);

  if (!record) {
    return null;
  }

  const litters = await getLitters();
  const litter = record.litter_id ? litters.find((l) => l.id === record.litter_id) ?? null : null;

  const parentsList = await getParents();

  // Get parents directly from puppy's sire_id/dam_id (new approach)
  // Falls back to litter parents if direct IDs are not set (backward compatibility)
  const parents = {
    sire: record.sire_id
      ? parentsList.find((p) => p.id === record.sire_id) ?? null
      : litter?.sire_id
        ? parentsList.find((p) => p.id === litter.sire_id) ?? null
        : null,
    dam: record.dam_id
      ? parentsList.find((p) => p.id === record.dam_id) ?? null
      : litter?.dam_id
        ? parentsList.find((p) => p.id === litter.dam_id) ?? null
        : null,
  };

  return {
    ...(record as Puppy),
    litter,
    parents,
  } as PuppyWithRelations;
});
