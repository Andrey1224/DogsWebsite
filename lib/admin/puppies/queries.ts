import 'server-only';

import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { getAdminSupabaseClient } from '@/lib/admin/supabase';
import type { Puppy } from '@/lib/supabase/types';
import { isArchiveColumnMissingError, runArchiveAwareQuery } from '@/lib/supabase/archive-support';
import {
  CreatePuppyInput,
  deletePuppySchema,
  priceUsdSchema,
  updatePuppyPriceSchema,
  updatePuppyStatusSchema,
  archivePuppySchema,
  restorePuppySchema,
} from './schema';

const ADMIN_PUPPY_BASE_FIELDS =
  'id,name,slug,status,price_usd,birth_date,litter_id,photo_urls,created_at,updated_at';

function getAdminPuppyFields(includeArchiveColumn: boolean) {
  return includeArchiveColumn ? `${ADMIN_PUPPY_BASE_FIELDS},is_archived` : ADMIN_PUPPY_BASE_FIELDS;
}

export type AdminPuppyRecord = Pick<
  Puppy,
  | 'id'
  | 'name'
  | 'slug'
  | 'status'
  | 'price_usd'
  | 'birth_date'
  | 'litter_id'
  | 'photo_urls'
  | 'is_archived'
  | 'created_at'
  | 'updated_at'
>;

// Type for insertion with required slug
type CreatePuppyPayload = Omit<CreatePuppyInput, 'slug'> & { slug: string };

function mapCreatePayload(
  input: CreatePuppyPayload & {
    sirePhotoUrls?: string[];
    damPhotoUrls?: string[];
    photoUrls?: string[];
  },
) {
  return {
    name: input.name,
    slug: input.slug,
    status: input.status,
    price_usd: input.priceUsd ?? null,
    birth_date: input.birthDate ?? null,
    breed: input.breed ?? null,
    sire_id: input.sireId ?? null,
    dam_id: input.damId ?? null,
    sire_name: input.sireName ?? null,
    dam_name: input.damName ?? null,
    sire_photo_urls: input.sirePhotoUrls ?? null,
    dam_photo_urls: input.damPhotoUrls ?? null,
    sex: input.sex ?? null,
    color: input.color ?? null,
    weight_oz: input.weightOz ?? null,
    description: input.description ?? null,
    photo_urls: input.photoUrls ?? null,
  };
}

export type AdminPuppyRecordWithState = AdminPuppyRecord & {
  has_active_reservation?: boolean;
};

export async function fetchAdminPuppies(
  options: { archived?: boolean; includeReservationState?: boolean } = {},
): Promise<AdminPuppyRecordWithState[]> {
  const supabase = getAdminSupabaseClient();
  const archived = options.archived ?? false;

  const { data, error, usedArchiveColumn } = await runArchiveAwareQuery<AdminPuppyRecord[]>(
    async ({ useArchiveColumn }) => {
      let query = supabase
        .from('puppies')
        .select(getAdminPuppyFields(useArchiveColumn))
        .order('created_at', { ascending: false });

      if (useArchiveColumn) {
        query = query.eq('is_archived', archived);
      }

      const response = await query.returns<AdminPuppyRecord[]>();
      return {
        data: response.data ?? [],
        error: response.error,
      };
    },
  );

  if (error) {
    throw error;
  }

  const rows = data ?? [];

  let normalizedRows: AdminPuppyRecordWithState[];
  if (usedArchiveColumn) {
    normalizedRows = rows;
  } else if (archived) {
    normalizedRows = [];
  } else {
    normalizedRows = rows.map((row) => ({
      ...row,
      is_archived: false,
    }));
  }

  if (!options.includeReservationState) {
    return normalizedRows;
  }

  // Early return if no puppies
  if (normalizedRows.length === 0) {
    return [];
  }

  // Batch query all reservations for these puppies in one round-trip
  const { data: reservationData } = await supabase
    .from('reservations')
    .select('puppy_id, status, expires_at')
    .in(
      'puppy_id',
      normalizedRows.map((row) => row.id),
    )
    .in('status', ['pending', 'paid']);

  // Build lookup map for O(1) access
  const now = new Date();
  const reservationMap = new Map<string, boolean>();

  if (reservationData) {
    for (const reservation of reservationData) {
      // Only count as active if not expired
      const isExpired = reservation.expires_at && new Date(reservation.expires_at) < now;
      if (!isExpired) {
        reservationMap.set(reservation.puppy_id, true);
      }
    }
  }

  // Map results in single pass (O(n) instead of O(n²))
  const rowsWithState = normalizedRows.map((row) => ({
    ...row,
    has_active_reservation: reservationMap.get(row.id) ?? false,
  }));

  return rowsWithState;
}

export async function insertAdminPuppy(
  input: CreatePuppyPayload & {
    sirePhotoUrls?: string[];
    damPhotoUrls?: string[];
    photoUrls?: string[];
  },
): Promise<AdminPuppyRecord> {
  const supabase = getAdminSupabaseClient();
  const { data, error, usedArchiveColumn } = await runArchiveAwareQuery<AdminPuppyRecord>(
    async ({ useArchiveColumn }) => {
      const response = await supabase
        .from('puppies')
        .insert(mapCreatePayload(input))
        .select(getAdminPuppyFields(useArchiveColumn))
        .single()
        .returns<AdminPuppyRecord>();

      return {
        data: response.data ?? null,
        error: response.error,
      };
    },
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Failed to insert puppy record');
  }

  if (usedArchiveColumn) {
    return data;
  }

  return {
    ...data,
    is_archived: false,
  };
}

export async function updateAdminPuppyStatus(input: {
  id: string;
  status: AdminPuppyRecord['status'];
}) {
  const payload = updatePuppyStatusSchema.parse(input);
  const supabase = getAdminSupabaseClient();
  const { error } = await supabase
    .from('puppies')
    .update({ status: payload.status })
    .eq('id', payload.id);

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
    .from('puppies')
    .update({ price_usd: parsed.priceUsd })
    .eq('id', parsed.id);

  if (error) {
    throw error;
  }
}

export async function deleteAdminPuppy(input: { id: string }) {
  const payload = deletePuppySchema.parse(input);
  const supabase = getAdminSupabaseClient();
  const { error } = await supabase.from('puppies').delete().eq('id', payload.id);
  if (error) {
    throw error;
  }
}

export async function isPuppySlugTaken(slug: string, options: { excludeId?: string } = {}) {
  const supabase = getAdminSupabaseClient();
  let query = supabase
    .from('puppies')
    .select('id', { head: true, count: 'exact' })
    .eq('slug', slug);
  if (options.excludeId) {
    query = query.neq('id', options.excludeId);
  }

  const response = (await query) as PostgrestSingleResponse<null>;
  if (response.error) {
    throw response.error;
  }

  return (response.count ?? 0) > 0;
}

export async function getAdminPuppyById(
  id: string,
): Promise<Pick<AdminPuppyRecord, 'id' | 'name' | 'slug'> | null> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('puppies')
    .select('id,name,slug')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Pick<AdminPuppyRecord, 'id' | 'name' | 'slug'>) ?? null;
}

/**
 * Fetch full puppy data for editing
 * Returns all editable fields including photos, parent metadata, etc.
 */
export async function fetchFullAdminPuppyById(id: string): Promise<Puppy | null> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase.from('puppies').select('*').eq('id', id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Puppy) ?? null;
}

type RawAdminLitterWithParents = {
  id: string;
  name: string | null;
  sire: { name: string }[] | null;
  dam: { name: string }[] | null;
};

export type AdminLitterWithParents = {
  id: string;
  name: string | null;
  sire: { name: string } | null;
  dam: { name: string } | null;
};

export async function fetchAdminLittersWithParents(): Promise<AdminLitterWithParents[]> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('litters')
    .select(
      `
      id,
      name,
      sire:parents!litters_sire_id_fkey(name),
      dam:parents!litters_dam_id_fkey(name)
    `,
    )
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  const rawData = (data ?? []) as RawAdminLitterWithParents[];

  return rawData.map((litter) => ({
    id: litter.id,
    name: litter.name,
    sire: litter.sire?.[0] ?? null,
    dam: litter.dam?.[0] ?? null,
  }));
}

export type AdminParent = {
  id: string;
  name: string;
  breed: 'french_bulldog' | 'english_bulldog' | null;
  photo_urls: string[] | null;
};

export async function fetchAdminSires(): Promise<AdminParent[]> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('parents')
    .select('id,name,breed,photo_urls')
    .eq('sex', 'male')
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminParent[];
}

export async function fetchAdminDams(): Promise<AdminParent[]> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('parents')
    .select('id,name,breed,photo_urls')
    .eq('sex', 'female')
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminParent[];
}

/**
 * Check if puppy has active (pending or paid) reservations
 */
export async function hasActiveReservations(puppyId: string): Promise<boolean> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('reservations')
    .select('status, expires_at')
    .eq('puppy_id', puppyId)
    .in('status', ['pending', 'paid']);

  if (error) {
    throw error;
  }

  if (!data) {
    return false;
  }

  const now = Date.now();
  return data.some((reservation) => {
    if (reservation.status === 'paid') {
      return true;
    }

    if (!reservation.expires_at) {
      return true;
    }

    const expiresAt = new Date(reservation.expires_at as string).getTime();
    return Number.isFinite(expiresAt) && expiresAt > now;
  });
}

/**
 * Archive a puppy (soft delete)
 */
export async function archivePuppy(id: string): Promise<void> {
  const payload = archivePuppySchema.parse({ id });
  const supabase = getAdminSupabaseClient();

  const { error } = await supabase
    .from('puppies')
    .update({
      is_archived: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.id);

  if (error) {
    if (isArchiveColumnMissingError(error)) {
      throw new Error(
        'Cannot archive puppy because the `is_archived` column has not been added. Run the latest Supabase migrations.',
      );
    }
    throw error;
  }
}

/**
 * Restore an archived puppy
 */
export async function restorePuppy(id: string): Promise<void> {
  const payload = restorePuppySchema.parse({ id });
  const supabase = getAdminSupabaseClient();

  const { error } = await supabase
    .from('puppies')
    .update({
      is_archived: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.id);

  if (error) {
    if (isArchiveColumnMissingError(error)) {
      throw new Error(
        'Cannot restore puppy because the `is_archived` column has not been added. Run the latest Supabase migrations.',
      );
    }
    throw error;
  }
}

// Type for update payload (similar to CreatePuppyPayload but without slug)
type UpdatePuppyPayload = {
  id: string;
  name?: string;
  status?: string;
  priceUsd?: number | null;
  birthDate?: string | null;
  breed?: string | null;
  sireId?: string | null;
  damId?: string | null;
  sireName?: string | null;
  damName?: string | null;
  sirePhotoUrls?: string[] | null;
  damPhotoUrls?: string[] | null;
  sex?: string | null;
  color?: string | null;
  weightOz?: number | null;
  description?: string | null;
  photoUrls?: string[] | null;
  videoUrls?: string[] | null;
  stripePaymentLink?: string | null;
  paypalEnabled?: boolean | null;
  sireWeightNotes?: string | null;
  sireColorNotes?: string | null;
  sireHealthNotes?: string | null;
  sireTemperamentNotes?: string | null;
  damWeightNotes?: string | null;
  damColorNotes?: string | null;
  damHealthNotes?: string | null;
  damTemperamentNotes?: string | null;
};

function mapUpdatePayload(input: UpdatePuppyPayload) {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  // Only include fields that are explicitly provided
  if (input.name !== undefined) payload.name = input.name;
  if (input.status !== undefined) payload.status = input.status;
  if (input.priceUsd !== undefined) payload.price_usd = input.priceUsd;
  if (input.birthDate !== undefined) payload.birth_date = input.birthDate;
  if (input.breed !== undefined) payload.breed = input.breed;
  if (input.sireId !== undefined) payload.sire_id = input.sireId;
  if (input.damId !== undefined) payload.dam_id = input.damId;
  if (input.sireName !== undefined) payload.sire_name = input.sireName;
  if (input.damName !== undefined) payload.dam_name = input.damName;
  if (input.sirePhotoUrls !== undefined) payload.sire_photo_urls = input.sirePhotoUrls;
  if (input.damPhotoUrls !== undefined) payload.dam_photo_urls = input.damPhotoUrls;
  if (input.sex !== undefined) payload.sex = input.sex;
  if (input.color !== undefined) payload.color = input.color;
  if (input.weightOz !== undefined) payload.weight_oz = input.weightOz;
  if (input.description !== undefined) payload.description = input.description;
  if (input.photoUrls !== undefined) payload.photo_urls = input.photoUrls;
  if (input.videoUrls !== undefined) payload.video_urls = input.videoUrls;
  if (input.stripePaymentLink !== undefined) payload.stripe_payment_link = input.stripePaymentLink;
  if (input.paypalEnabled !== undefined) payload.paypal_enabled = input.paypalEnabled;
  if (input.sireWeightNotes !== undefined) payload.sire_weight_notes = input.sireWeightNotes;
  if (input.sireColorNotes !== undefined) payload.sire_color_notes = input.sireColorNotes;
  if (input.sireHealthNotes !== undefined) payload.sire_health_notes = input.sireHealthNotes;
  if (input.sireTemperamentNotes !== undefined)
    payload.sire_temperament_notes = input.sireTemperamentNotes;
  if (input.damWeightNotes !== undefined) payload.dam_weight_notes = input.damWeightNotes;
  if (input.damColorNotes !== undefined) payload.dam_color_notes = input.damColorNotes;
  if (input.damHealthNotes !== undefined) payload.dam_health_notes = input.damHealthNotes;
  if (input.damTemperamentNotes !== undefined)
    payload.dam_temperament_notes = input.damTemperamentNotes;

  return payload;
}

/**
 * Update puppy with partial data
 * Note: slug cannot be updated (read-only after creation)
 */
export async function updateAdminPuppy(input: UpdatePuppyPayload): Promise<void> {
  const supabase = getAdminSupabaseClient();
  const payload = mapUpdatePayload(input);

  const { error } = await supabase.from('puppies').update(payload).eq('id', input.id);

  if (error) {
    throw error;
  }
}
