import { z } from 'zod';

const reviewPhotoUrlPattern = /\/storage\/v1\/object\/public\/reviews\//;

const reviewPhotoUrlSchema = z
  .string()
  .trim()
  .url('Photo URL is invalid')
  .refine((value) => reviewPhotoUrlPattern.test(value), {
    message: 'Photo must be stored in the reviews bucket.',
  });

export const publicReviewSubmissionSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(2, 'Name should be at least 2 characters')
    .max(80, 'Name should be under 80 characters'),
  authorLocation: z
    .string()
    .trim()
    .max(120, 'Location should be under 120 characters')
    .optional()
    .transform((value) => (value ? value : null)),
  rating: z
    .string()
    .trim()
    .regex(/^[1-5]$/, 'Choose a rating between 1 and 5')
    .transform((value) => Number(value))
    .refine((value) => value >= 1 && value <= 5, {
      message: 'Choose a rating between 1 and 5',
    }),
  body: z
    .string()
    .trim()
    .min(20, 'Share at least 20 characters about your experience')
    .max(2000, 'Keep your story under 2000 characters'),
  photoUrls: z
    .array(reviewPhotoUrlSchema)
    .max(3, 'Maximum 3 photos allowed')
    .optional()
    .default([]),
  hcaptchaToken: z.string().trim().min(1, 'Complete the captcha'),
  agreeToPublish: z.literal('on').refine((val) => val === 'on', {
    message: 'You must agree to publish your review.',
  }),
});

export type PublicReviewSubmission = z.infer<typeof publicReviewSubmissionSchema>;
