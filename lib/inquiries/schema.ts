import { z } from "zod";

const phoneRegex = /^(?:\+?[0-9]{1,3})?[\s.-]?(?:\(?\d{2,4}\)?)[\s.-]?\d{2,4}[\s.-]?\d{2,6}$/;
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const inquirySubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name should be at least 2 characters")
    .max(80, "Name should be under 80 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Enter an email")
    .email("Provide a valid email")
    .transform((value) => value.toLowerCase()),
  phone: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined)
    .refine((value) => !value || phoneRegex.test(value), {
      message: "Phone number looks incorrect",
    }),
  message: z
    .string()
    .trim()
    .min(20, "Message should be at least 20 characters")
    .max(1200, "Message should be under 1200 characters"),
  puppyId: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined)
    .refine((value) => !value || uuidRegex.test(value), {
      message: "Invalid puppy id",
    }),
  puppySlug: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined)
    .refine((value) => !value || value.length <= 120, {
      message: "Slug should be 120 characters or fewer",
    }),
  contextPath: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined)
    .refine((value) => !value || value.length <= 160, {
      message: "Context path is too long",
    }),
  hcaptchaToken: z
    .string()
    .trim()
    .min(1, "Complete the captcha"),
});

export type InquirySubmission = z.infer<typeof inquirySubmissionSchema>;
