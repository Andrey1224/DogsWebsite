import { describe, it, expect } from 'vitest';

import { publicReviewSubmissionSchema } from './schema';

describe('publicReviewSubmissionSchema', () => {
  it('accepts valid review submissions and normalizes values', () => {
    const result = publicReviewSubmissionSchema.safeParse({
      authorName: 'Maya R.',
      authorLocation: 'Chattanooga, TN',
      rating: '5',
      body: 'We picked up Bruno last summer and the entire experience was seamless. He adjusted immediately and is the star of every walk!',
      photoUrls: [
        'https://example.supabase.co/storage/v1/object/public/reviews/submissions/photo.webp',
      ],
      hcaptchaToken: 'token',
      agreeToPublish: 'on',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.rating).toBe(5);
    expect(result.data.authorName).toBe('Maya R.');
  });

  it('returns descriptive errors for invalid entries', () => {
    const result = publicReviewSubmissionSchema.safeParse({
      authorName: 'A',
      authorLocation: '',
      rating: '9',
      body: 'Too short',
      hcaptchaToken: '',
      agreeToPublish: 'off',
      photoUrls: [
        'https://example.supabase.co/storage/v1/object/public/reviews/a.jpg',
        'https://example.supabase.co/storage/v1/object/public/reviews/b.jpg',
        'https://example.supabase.co/storage/v1/object/public/reviews/c.jpg',
        'https://example.supabase.co/storage/v1/object/public/reviews/d.jpg',
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    const { fieldErrors } = result.error.flatten();
    expect(fieldErrors.authorName?.[0]).toMatch(/at least 2 characters/i);
    expect(fieldErrors.rating?.[0]).toMatch(/between 1 and 5/i);
    expect(fieldErrors.body?.[0]).toMatch(/20 characters/i);
    expect(fieldErrors.hcaptchaToken?.[0]).toMatch(/captcha/i);
    expect(fieldErrors.photoUrls?.[0]).toMatch(/Maximum 3 photos/i);
  });

  it('rejects photo urls outside the reviews bucket', () => {
    const result = publicReviewSubmissionSchema.safeParse({
      authorName: 'Valid Name',
      authorLocation: 'Nashville, TN',
      rating: '5',
      body: 'This is a valid story with enough characters to pass validation easily and meet the minimum requirement.',
      photoUrls: ['https://example.com/not-supabase.jpg'],
      hcaptchaToken: 'token',
      agreeToPublish: 'on',
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    const { fieldErrors } = result.error.flatten();
    expect(fieldErrors.photoUrls?.[0]).toMatch(/reviews bucket/i);
  });

  it('accepts empty photoUrls array', () => {
    const result = publicReviewSubmissionSchema.safeParse({
      authorName: 'Valid Name',
      authorLocation: 'Nashville, TN',
      rating: '5',
      body: 'This is a valid story with enough characters to pass validation easily and meet the minimum requirement.',
      photoUrls: [],
      hcaptchaToken: 'token',
      agreeToPublish: 'on',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.photoUrls).toEqual([]);
  });
});
