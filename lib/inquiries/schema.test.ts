import { describe, expect, it } from 'vitest';

import { inquirySubmissionSchema } from '@/lib/inquiries/schema';

describe('inquirySubmissionSchema', () => {
  it('normalizes contact fields', () => {
    const result = inquirySubmissionSchema.parse({
      name: '  Jane Doe  ',
      email: 'USER@EXAMPLE.COM ',
      phone: ' +1 205 555 1234 ',
      message: "We'd like to learn more about Duke and timing.",
      puppyId: '11111111-1111-4111-8111-111111111111',
      puppySlug: ' duke-english-bulldog ',
      contextPath: '/puppies/duke',
      hcaptchaToken: 'token',
    });

    expect(result).toMatchObject({
      name: 'Jane Doe',
      email: 'user@example.com',
      phone: '+1 205 555 1234',
      puppyId: '11111111-1111-4111-8111-111111111111',
      puppySlug: 'duke-english-bulldog',
      contextPath: '/puppies/duke',
    });
  });

  it('drops optional blanks', () => {
    const result = inquirySubmissionSchema.parse({
      name: 'Jane',
      email: 'jane@example.com',
      phone: '',
      message: 'Share upcoming Frenchies, please.',
      puppyId: '',
      puppySlug: '',
      contextPath: '',
      hcaptchaToken: 'token',
    });

    expect(result.phone).toBeUndefined();
    expect(result.puppyId).toBeUndefined();
    expect(result.puppySlug).toBeUndefined();
    expect(result.contextPath).toBeUndefined();
  });

  it('rejects invalid phone numbers', () => {
    expect(() =>
      inquirySubmissionSchema.parse({
        name: 'Jane',
        email: 'jane@example.com',
        phone: 'hello',
        message: 'Tell me more about availability',
        hcaptchaToken: 'token',
      }),
    ).toThrowError(/phone number/i);
  });
});
