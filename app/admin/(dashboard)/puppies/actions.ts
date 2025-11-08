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

export type CreatePuppyState = {
  status: "idle" | "success" | "error";
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

export const initialCreatePuppyState: CreatePuppyState = {
  status: "idle",
};

export async function createPuppyAction(_: CreatePuppyState, formData: FormData): Promise<CreatePuppyState> {
  await requireAdminSession();

  const submission = {
    name: formData.get("name"),
    status: formData.get("status") ?? "available",
    priceUsd: formData.get("priceUsd"),
    birthDate: formData.get("birthDate"),
    litterId: formData.get("litterId"),
    slug: formData.get("slug"),
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
  let slug = payload.slug && payload.slug.length > 0 ? payload.slug : slugifyName(payload.name);
  if (!slug) {
    return {
      status: "error",
      formError: "Unable to generate slug from the provided name.",
    };
  }

  if (await isPuppySlugTaken(slug)) {
    slug = await generateUniqueSlug(payload.name, (candidate) => isPuppySlugTaken(candidate));
  }

  await insertAdminPuppy({
    ...payload,
    slug,
  });

  revalidateCatalog(slug);

  return {
    status: "success",
  };
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
