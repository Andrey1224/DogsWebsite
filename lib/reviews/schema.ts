import { z } from 'zod';

const monthInputPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
const reviewPhotoUrlPattern = /\/storage\/v1\/object\/public\/reviews\//;

function normalizeMonthToDate(value: string) {
  return `${value}-01`;
}

const reviewPhotoUrlSchema = z
  .string()
  .trim()
  .url('Photo URL is invalid')
  .refine((value) => reviewPhotoUrlPattern.test(value), {
    message: 'Photo URL must come from Exotic Bulldog Legacy storage.',
  });

export const reviewSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name should be at least 2 characters')
    .max(80, 'Name should be under 80 characters'),
  location: z
    .string()
    .trim()
    .min(2, 'Location should be at least 2 characters')
    .max(120, 'Location should be under 120 characters'),
  visitMonth: z
    .string()
    .trim()
    .regex(monthInputPattern, 'Select the month you visited')
    .transform(normalizeMonthToDate),
  rating: z
    .string()
    .trim()
    .regex(/^[1-5]$/, 'Choose a rating between 1 and 5')
    .transform((value) => Number(value))
    .refine((value) => value >= 1 && value <= 5, {
      message: 'Choose a rating between 1 and 5',
    }),
  story: z
    .string()
    .trim()
    .min(40, 'Share at least 40 characters about your experience')
    .max(900, 'Stories should stay under 900 characters'),
  photoUrls: z
    .array(reviewPhotoUrlSchema)
    .max(3, 'You can upload up to 3 photos')
    .optional()
    .transform((value) => value ?? []),
  hcaptchaToken: z.string().trim().min(1, 'Complete the captcha'),
});

export type ReviewSubmission = z.infer<typeof reviewSubmissionSchema>;
