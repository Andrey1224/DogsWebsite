import { z } from "zod";

export const adminPuppyStatusSchema = z.enum(["available", "reserved", "sold", "upcoming"]);

export const adminPuppyIdSchema = z
  .string()
  .uuid("Invalid puppy identifier");

const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(120, "Name must be 120 characters or fewer");

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(80, "Slug must be 80 characters or fewer")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single dashes")
  .transform((value) => value.toLowerCase());

const priceNumberSchema = z
  .number()
  .refine((value) => Number.isFinite(value), "Price must be a number")
  .min(0.01, "Price must be at least $0.01");

export const priceUsdSchema = z.preprocess((value) => {
  if (value === null || typeof value === "undefined") {
    return undefined;
  }
  if (typeof value === "number") {
    return value;
  }
  const numeric = Number(String(value).trim());
  return Number.isNaN(numeric) ? Number.NaN : numeric;
}, priceNumberSchema.optional());

const birthDateSchema = z.preprocess((value) => {
  if (value === null || typeof value === "undefined") {
    return undefined;
  }
  const stringValue = String(value).trim();
  return stringValue.length === 0 ? undefined : stringValue;
}, z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid birth date")
  .refine((value) => {
    const inputDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate <= today;
  }, "Birth date cannot be in the future")
  .optional());

const parentIdSchema = z.preprocess((value) => {
  if (value === null || typeof value === "undefined") {
    return undefined;
  }
  const stringValue = String(value).trim();
  return stringValue.length === 0 ? undefined : stringValue;
}, z.string().uuid("Invalid parent identifier").optional());

const parentNameSchema = z.preprocess((value) => {
  if (value === null || typeof value === "undefined") {
    return undefined;
  }
  const stringValue = String(value).trim();
  return stringValue.length === 0 ? undefined : stringValue;
}, z.string().max(120, "Parent name must be 120 characters or fewer").optional());

const sexSchema = z.preprocess((value) => {
  if (value === null || typeof value === "undefined") {
    return undefined;
  }
  const stringValue = String(value).trim();
  return stringValue.length === 0 ? undefined : stringValue;
}, z.enum(["male", "female"]).optional());

const colorSchema = z.preprocess((value) => {
  if (value === null || typeof value === "undefined") {
    return undefined;
  }
  const stringValue = String(value).trim();
  return stringValue.length === 0 ? undefined : stringValue;
}, z.string().max(50, "Color must be 50 characters or fewer").optional());

const weightOzSchema = z.preprocess((value) => {
  if (value === null || typeof value === "undefined") {
    return undefined;
  }
  const stringValue = String(value).trim();
  if (stringValue.length === 0) {
    return undefined;
  }
  const numeric = Number(stringValue);
  return Number.isNaN(numeric) ? Number.NaN : numeric;
}, z.number().int("Weight must be a whole number").positive("Weight must be positive").optional());

const descriptionSchema = z.preprocess((value) => {
  if (value === null || typeof value === "undefined") {
    return undefined;
  }
  const stringValue = String(value).trim();
  return stringValue.length === 0 ? undefined : stringValue;
}, z.string().max(1000, "Description must be 1000 characters or fewer").optional());

const breedSchema = z.preprocess((value) => {
  if (value === null || typeof value === "undefined") {
    return undefined;
  }
  const stringValue = String(value).trim();
  return stringValue.length === 0 ? undefined : stringValue;
}, z.enum(["french_bulldog", "english_bulldog"]).optional());

export const createPuppySchema = z.object({
  name: nameSchema,
  status: adminPuppyStatusSchema.default("available"),
  priceUsd: priceUsdSchema,
  birthDate: birthDateSchema,
  slug: slugSchema.optional(),
  breed: breedSchema,
  sireId: parentIdSchema,
  damId: parentIdSchema,
  sireName: parentNameSchema,
  damName: parentNameSchema,
  sex: sexSchema,
  color: colorSchema,
  weightOz: weightOzSchema,
  description: descriptionSchema,
});

export const updatePuppyStatusSchema = z.object({
  id: adminPuppyIdSchema,
  status: adminPuppyStatusSchema,
});

export const updatePuppyPriceSchema = z.object({
  id: adminPuppyIdSchema,
  priceUsd: priceNumberSchema,
});

export const deletePuppySchema = z.object({
  id: adminPuppyIdSchema,
});

export type CreatePuppyInput = z.infer<typeof createPuppySchema>;
export type UpdatePuppyStatusInput = z.infer<typeof updatePuppyStatusSchema>;
export type UpdatePuppyPriceInput = z.infer<typeof updatePuppyPriceSchema>;
