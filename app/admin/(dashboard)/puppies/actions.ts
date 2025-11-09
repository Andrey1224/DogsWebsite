'use server';

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin/session";
import {
  deleteAdminPuppy,
  getAdminPuppyById,
  insertAdminPuppy,
  isPuppySlugTaken,
  updateAdminPuppyPrice,
  updateAdminPuppyStatus,
} from "@/lib/admin/puppies/queries";
import {
  createPuppySchema,
  deletePuppySchema,
  priceUsdSchema,
  updatePuppyPriceSchema,
  updatePuppyStatusSchema,
} from "@/lib/admin/puppies/schema";
import { generateUniqueSlug, slugifyName } from "@/lib/admin/puppies/slug";
import { uploadParentPhotos } from "@/lib/admin/puppies/upload";
import type { CreatePuppyState } from "./types";

function revalidateCatalog(slug?: string | null) {
  revalidatePath("/admin/puppies");
  revalidatePath("/puppies");
  if (slug) {
    revalidatePath(`/puppies/${slug}`);
  }
}

async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function updatePuppyStatusAction(input: { id: string; status: string; slug?: string | null }) {
  await requireAdminSession();
  const parsed = updatePuppyStatusSchema.parse({ id: input.id, status: input.status });
  await updateAdminPuppyStatus(parsed);
  revalidateCatalog(input.slug);
  return { success: true };
}

export async function updatePuppyPriceAction(input: { id: string; priceUsd: string; slug?: string | null }) {
  await requireAdminSession();
  const priceValue = priceUsdSchema.parse(input.priceUsd);
  const parsed = updatePuppyPriceSchema.parse({ id: input.id, priceUsd: priceValue });
  await updateAdminPuppyPrice(parsed);
  revalidateCatalog(input.slug);
  return { success: true };
}

export async function createPuppyAction(_: CreatePuppyState, formData: FormData): Promise<CreatePuppyState> {
  try {
    await requireAdminSession();

    const submission = {
      name: formData.get("name"),
      status: formData.get("status") ?? "available",
      priceUsd: formData.get("priceUsd"),
      birthDate: formData.get("birthDate"),
      slug: formData.get("slug"),
      sireId: formData.get("sireId"),
      damId: formData.get("damId"),
      sireName: formData.get("sireName"),
      damName: formData.get("damName"),
      sex: formData.get("sex"),
      color: formData.get("color"),
      weightOz: formData.get("weightOz"),
      description: formData.get("description"),
    };

    const parsed = createPuppySchema.safeParse(submission);
    if (!parsed.success) {
      const { fieldErrors, formErrors } = parsed.error.flatten();
      return {
        status: "error",
        fieldErrors,
        formError: formErrors?.[0],
      };
    }

    const payload = parsed.data;
    let slug = payload.slug && payload.slug.trim().length > 0
      ? payload.slug.trim()
      : slugifyName(payload.name);

    if (!slug || slug.trim().length === 0) {
      return {
        status: "error",
        formError: "Unable to generate a valid slug. Please use a name with letters or numbers.",
      };
    }

    if (await isPuppySlugTaken(slug)) {
      slug = await generateUniqueSlug(payload.name, (candidate) => isPuppySlugTaken(candidate));
    }

    // Generate a temporary ID for photo uploads (will use actual ID after insert)
    const tempId = crypto.randomUUID();

    // Handle file uploads
    let sirePhotoUrls: string[] | undefined;
    let damPhotoUrls: string[] | undefined;

    const sirePhotos = formData.getAll("sirePhotos") as File[];
    if (sirePhotos.length > 0 && sirePhotos[0].size > 0) {
      sirePhotoUrls = await uploadParentPhotos(sirePhotos, "sire", tempId);
    }

    const damPhotos = formData.getAll("damPhotos") as File[];
    if (damPhotos.length > 0 && damPhotos[0].size > 0) {
      damPhotoUrls = await uploadParentPhotos(damPhotos, "dam", tempId);
    }

    await insertAdminPuppy({
      ...payload,
      slug,
      sirePhotoUrls,
      damPhotoUrls,
    });

    revalidateCatalog(slug);

    return {
      status: "success",
    };
  } catch (error) {
    console.error("Create puppy action error:", error);
    return {
      status: "error",
      formError: error instanceof Error ? error.message : "Failed to create puppy. Please try again.",
    };
  }
}

export async function deletePuppyAction(input: { id: string; confirmName: string }) {
  await requireAdminSession();
  const payload = deletePuppySchema.parse({ id: input.id });
  const record = await getAdminPuppyById(payload.id);

  if (!record) {
    return { success: false, error: "Puppy not found." };
  }

  const expectedName = (record.name ?? "").trim().toLowerCase();
  const provided = (input.confirmName ?? "").trim().toLowerCase();

  if (!expectedName || expectedName.length === 0) {
    return { success: false, error: "Puppy name missing in database; please refresh and try again." };
  }

  if (expectedName !== provided) {
    return { success: false, error: "Confirmation name does not match." };
  }

  await deleteAdminPuppy(payload);
  revalidateCatalog(record.slug);

  return { success: true };
}
