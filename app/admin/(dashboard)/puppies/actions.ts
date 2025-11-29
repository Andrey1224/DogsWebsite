'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/lib/admin/session';
import {
  deleteAdminPuppy,
  getAdminPuppyById,
  insertAdminPuppy,
  isPuppySlugTaken,
  updateAdminPuppyPrice,
  updateAdminPuppyStatus,
  hasActiveReservations,
  archivePuppy,
  restorePuppy,
  fetchFullAdminPuppyById,
  updateAdminPuppy,
} from '@/lib/admin/puppies/queries';
import {
  createPuppySchema,
  deletePuppySchema,
  priceUsdSchema,
  updatePuppyPriceSchema,
  updatePuppyStatusSchema,
  archivePuppySchema,
  restorePuppySchema,
  updatePuppySchema,
} from '@/lib/admin/puppies/schema';
import { generateUniqueSlug, slugifyName } from '@/lib/admin/puppies/slug';
import type { CreatePuppyState, UpdatePuppyState } from './types';

function revalidateCatalog(slug?: string | null) {
  revalidatePath('/admin/puppies');
  revalidatePath('/puppies');
  if (slug) {
    revalidatePath(`/puppies/${slug}`);
  }
}

async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function fetchPuppyForEditAction(puppyId: string) {
  try {
    await requireAdminSession();
    const puppy = await fetchFullAdminPuppyById(puppyId);
    if (!puppy) {
      return { success: false, error: 'Puppy not found' };
    }
    return { success: true, puppy };
  } catch (error) {
    console.error('Fetch puppy for edit error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load puppy data',
    };
  }
}

export async function updatePuppyStatusAction(input: {
  id: string;
  status: string;
  slug?: string | null;
}) {
  await requireAdminSession();
  const parsed = updatePuppyStatusSchema.parse({ id: input.id, status: input.status });
  await updateAdminPuppyStatus(parsed);
  revalidateCatalog(input.slug);

  // If status changed to 'sold', database trigger will auto-archive
  const archived = parsed.status === 'sold';
  return { success: true, archived };
}

export async function updatePuppyPriceAction(input: {
  id: string;
  priceUsd: string;
  slug?: string | null;
}) {
  await requireAdminSession();
  const priceValue = priceUsdSchema.parse(input.priceUsd);
  const parsed = updatePuppyPriceSchema.parse({ id: input.id, priceUsd: priceValue });
  await updateAdminPuppyPrice(parsed);
  revalidateCatalog(input.slug);
  return { success: true };
}

export async function createPuppyAction(
  _: CreatePuppyState,
  formData: FormData,
): Promise<CreatePuppyState> {
  try {
    await requireAdminSession();

    const photoUrls = formData
      .getAll('photoUrls')
      .filter((url): url is string => typeof url === 'string' && url.length > 0);

    const submission = {
      name: formData.get('name'),
      status: formData.get('status') ?? 'available',
      priceUsd: formData.get('priceUsd'),
      birthDate: formData.get('birthDate'),
      slug: formData.get('slug'),
      breed: formData.get('breed'),
      sireId: formData.get('sireId'),
      damId: formData.get('damId'),
      sireName: formData.get('sireName'),
      damName: formData.get('damName'),
      sex: formData.get('sex'),
      color: formData.get('color'),
      weightOz: formData.get('weightOz'),
      description: formData.get('description'),
      photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
    };

    const parsed = createPuppySchema.safeParse(submission);
    if (!parsed.success) {
      const { fieldErrors, formErrors } = parsed.error.flatten();
      return {
        status: 'error',
        fieldErrors,
        formError: formErrors?.[0],
      };
    }

    const payload = parsed.data;
    let slug =
      payload.slug && payload.slug.trim().length > 0
        ? payload.slug.trim()
        : slugifyName(payload.name);

    if (!slug || slug.trim().length === 0) {
      return {
        status: 'error',
        formError: 'Unable to generate a valid slug. Please use a name with letters or numbers.',
      };
    }

    if (await isPuppySlugTaken(slug)) {
      slug = await generateUniqueSlug(payload.name, (candidate) => isPuppySlugTaken(candidate));
    }

    // Extract photo URLs from FormData (already uploaded by client)
    const sirePhotoUrls = formData
      .getAll('sirePhotoUrls')
      .filter((url): url is string => typeof url === 'string' && url.length > 0);
    const damPhotoUrls = formData
      .getAll('damPhotoUrls')
      .filter((url): url is string => typeof url === 'string' && url.length > 0);

    await insertAdminPuppy({
      ...payload,
      slug,
      sirePhotoUrls: sirePhotoUrls.length > 0 ? sirePhotoUrls : undefined,
      damPhotoUrls: damPhotoUrls.length > 0 ? damPhotoUrls : undefined,
      photoUrls: payload.photoUrls && payload.photoUrls.length > 0 ? payload.photoUrls : undefined,
    });

    revalidateCatalog(slug);

    return {
      status: 'success',
    };
  } catch (error) {
    console.error('Create puppy action error:', error);
    return {
      status: 'error',
      formError:
        error instanceof Error ? error.message : 'Failed to create puppy. Please try again.',
    };
  }
}

export async function deletePuppyAction(input: { id: string; confirmName: string }) {
  await requireAdminSession();
  const payload = deletePuppySchema.parse({ id: input.id });
  const record = await getAdminPuppyById(payload.id);

  if (!record) {
    return { success: false, error: 'Puppy not found.' };
  }

  const expectedName = (record.name ?? '').trim().toLowerCase();
  const provided = (input.confirmName ?? '').trim().toLowerCase();

  if (!expectedName || expectedName.length === 0) {
    return {
      success: false,
      error: 'Puppy name missing in database; please refresh and try again.',
    };
  }

  if (expectedName !== provided) {
    return { success: false, error: 'Confirmation name does not match.' };
  }

  await deleteAdminPuppy(payload);
  revalidateCatalog(record.slug);

  return { success: true };
}

export async function updatePuppyAction(
  _: UpdatePuppyState,
  formData: FormData,
): Promise<UpdatePuppyState> {
  try {
    await requireAdminSession();

    const puppyId = formData.get('id');
    if (typeof puppyId !== 'string' || !puppyId) {
      return {
        status: 'error',
        formError: 'Puppy ID is required',
      };
    }

    // Extract photo arrays from FormData (already uploaded by client)
    const photoUrls = formData
      .getAll('photoUrls')
      .filter((url): url is string => typeof url === 'string' && url.length > 0);
    const sirePhotoUrls = formData
      .getAll('sirePhotoUrls')
      .filter((url): url is string => typeof url === 'string' && url.length > 0);
    const damPhotoUrls = formData
      .getAll('damPhotoUrls')
      .filter((url): url is string => typeof url === 'string' && url.length > 0);
    const videoUrls = formData
      .getAll('videoUrls')
      .filter((url): url is string => typeof url === 'string' && url.length > 0);

    // Helper to convert empty strings to null
    const emptyToNull = (value: FormDataEntryValue | null) =>
      typeof value === 'string' && value.trim() === '' ? null : value;

    // Helper to convert string to number or null
    const toNumberOrNull = (value: FormDataEntryValue | null) => {
      if (value === null || (typeof value === 'string' && value.trim() === '')) {
        return null;
      }
      const num = Number(value);
      return isNaN(num) ? null : num;
    };

    const submission = {
      id: puppyId,
      name: formData.get('name'),
      status: formData.get('status'),
      priceUsd: toNumberOrNull(formData.get('priceUsd')),
      birthDate: formData.get('birthDate'),
      breed: formData.get('breed'),
      sireId: formData.get('sireId'),
      damId: formData.get('damId'),
      sireName: formData.get('sireName'),
      damName: formData.get('damName'),
      sex: formData.get('sex'),
      color: formData.get('color'),
      weightOz: toNumberOrNull(formData.get('weightOz')),
      description: emptyToNull(formData.get('description')),
      stripePaymentLink: formData.get('stripePaymentLink'),
      paypalEnabled: formData.get('paypalEnabled'),
      photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
      sirePhotoUrls: sirePhotoUrls.length > 0 ? sirePhotoUrls : undefined,
      damPhotoUrls: damPhotoUrls.length > 0 ? damPhotoUrls : undefined,
      videoUrls: videoUrls.length > 0 ? videoUrls : undefined,
      sireWeightNotes: formData.get('sireWeightNotes'),
      sireColorNotes: formData.get('sireColorNotes'),
      sireHealthNotes: formData.get('sireHealthNotes'),
      sireTemperamentNotes: formData.get('sireTemperamentNotes'),
      damWeightNotes: formData.get('damWeightNotes'),
      damColorNotes: formData.get('damColorNotes'),
      damHealthNotes: formData.get('damHealthNotes'),
      damTemperamentNotes: formData.get('damTemperamentNotes'),
    };

    const parsed = updatePuppySchema.safeParse(submission);

    if (!parsed.success) {
      const { fieldErrors, formErrors } = parsed.error.flatten();
      return {
        status: 'error',
        fieldErrors: Object.fromEntries(
          Object.entries(fieldErrors).filter(([, value]) => value !== undefined),
        ) as Record<string, string[]>,
        formError: formErrors?.[0],
      };
    }

    const payload = parsed.data;

    // Get current puppy data for slug (needed for revalidation)
    const currentPuppy = await fetchFullAdminPuppyById(puppyId);
    if (!currentPuppy) {
      return {
        status: 'error',
        formError: 'Puppy not found',
      };
    }

    await updateAdminPuppy(payload);

    // Revalidate catalog with current slug
    revalidateCatalog(currentPuppy.slug);

    return {
      status: 'success',
    };
  } catch (error) {
    console.error('Update puppy action error:', error);
    return {
      status: 'error',
      formError:
        error instanceof Error ? error.message : 'Failed to update puppy. Please try again.',
    };
  }
}

export async function archivePuppyAction(input: { id: string; slug?: string | null }) {
  await requireAdminSession();
  const payload = archivePuppySchema.parse({ id: input.id });

  // Check for active reservations
  const hasReservations = await hasActiveReservations(payload.id);
  if (hasReservations) {
    return {
      success: false,
      error:
        'Cannot archive puppy with active reservations (pending/paid). Cancel reservations first.',
    };
  }

  await archivePuppy(payload.id);
  revalidateCatalog(input.slug);

  return { success: true };
}

export async function restorePuppyAction(input: { id: string; slug?: string | null }) {
  await requireAdminSession();
  const payload = restorePuppySchema.parse({ id: input.id });

  await restorePuppy(payload.id);
  revalidateCatalog(input.slug);

  return { success: true };
}
