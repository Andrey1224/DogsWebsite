import { describe, it, expect } from 'vitest';

import { reviewSubmissionSchema } from './schema';

describe('reviewSubmissionSchema', () => {
  it('accepts valid review submissions and normalizes values', () => {
    const result = reviewSubmissionSchema.safeParse({
      name: 'Maya R.',
      location: 'Chattanooga, TN',
      visitMonth: '2025-08',
      rating: '5',
      story:
        'We picked up Bruno last summer and the entire experience was seamless. He adjusted immediately and is the star of every walk!',
      photoUrls: [
        'https://example.supabase.co/storage/v1/object/public/reviews/submissions/photo.webp',
      ],
      hcaptchaToken: 'token',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.rating).toBe(5);
    expect(result.data.visitMonth).toBe('2025-08-01');
  });

  it('returns descriptive errors for invalid entries', () => {
    const result = reviewSubmissionSchema.safeParse({
      name: 'A',
      location: '',
      visitMonth: 'not-a-month',
      rating: '9',
      story: 'Too short',
      hcaptchaToken: '',
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
    expect(fieldErrors.name?.[0]).toMatch(/at least 2 characters/i);
    expect(fieldErrors.location?.[0]).toMatch(/at least 2/i);
    expect(fieldErrors.visitMonth?.[0]).toMatch(/month/i);
    expect(fieldErrors.rating?.[0]).toMatch(/between 1 and 5/i);
    expect(fieldErrors.story?.[0]).toMatch(/40 characters/i);
    expect(fieldErrors.hcaptchaToken?.[0]).toMatch(/captcha/i);
    expect(fieldErrors.photoUrls?.[0]).toMatch(/up to 3 photos/i);
  });

  it('rejects photo urls outside the reviews bucket', () => {
    const result = reviewSubmissionSchema.safeParse({
      name: 'Valid Name',
      location: 'Nashville, TN',
      visitMonth: '2025-10',
      rating: '5',
      story: 'This is a valid story with enough characters to pass validation easily.',
      photoUrls: ['https://example.com/not-supabase.jpg'],
      hcaptchaToken: 'token',
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    const { fieldErrors } = result.error.flatten();
    expect(fieldErrors.photoUrls?.[0]).toMatch(/storage/i);
  });
});
