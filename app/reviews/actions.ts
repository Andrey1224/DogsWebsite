'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { verifyHCaptcha } from '@/lib/captcha/hcaptcha';
import { publicReviewSubmissionSchema } from '@/lib/reviews/schema';
import { createServiceRoleClient } from '@/lib/supabase/client';

export type ReviewFormState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

function asString(value: FormDataEntryValue | null): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

type HeaderList = Awaited<ReturnType<typeof headers>>;

function getClientIp(headerList: HeaderList): string | null {
  const forwarded = headerList.get('x-forwarded-for');
  if (!forwarded) return null;
  const first = forwarded.split(',')[0]?.trim();
  return first || null;
}

function extractFieldErrors(error: unknown): Partial<Record<string, string>> {
  if (typeof error !== 'object' || !error || !('flatten' in error)) {
    return {};
  }

  const flattened = (
    error as { flatten: () => { fieldErrors?: Record<string, string[]> } }
  ).flatten();
  const allowedFields = new Set([
    'authorName',
    'authorLocation',
    'rating',
    'body',
    'photoUrls',
    'hcaptchaToken',
    'agreeToPublish',
  ]);

  const entries = Object.entries(flattened.fieldErrors ?? {}).flatMap(([key, messages]) => {
    const normalizedKey = key === 'hcaptchaToken' ? 'captcha' : key;
    if (!allowedFields.has(key) || !Array.isArray(messages) || messages.length === 0) {
      return [];
    }
    return [[normalizedKey, messages[0]]];
  });

  return Object.fromEntries(entries) as Partial<Record<string, string>>;
}

export async function submitReview(
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  // Extract photo URLs array
  const photoUrls = formData
    .getAll('photoUrls[]')
    .filter((v): v is string => typeof v === 'string');

  const fields = {
    authorName: asString(formData.get('authorName')),
    authorLocation: asString(formData.get('authorLocation')),
    rating: asString(formData.get('rating')),
    body: asString(formData.get('body')),
    photoUrls,
    hcaptchaToken: asString(formData.get('h-captcha-response')),
    agreeToPublish: asString(formData.get('agreeToPublish')),
  };

  const parsed = publicReviewSubmissionSchema.safeParse(fields);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please correct the highlighted fields.',
      fieldErrors: extractFieldErrors(parsed.error),
    };
  }

  const submission = parsed.data;
  const headerList = await headers();
  const clientIp = getClientIp(headerList);

  const captchaResult = await verifyHCaptcha(submission.hcaptchaToken, clientIp);
  if (!captchaResult.ok) {
    return {
      status: 'error',
      message: captchaResult.message,
      fieldErrors: {
        captcha: captchaResult.message,
      },
    };
  }

  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (hasServiceRole) {
    try {
      const supabase = createServiceRoleClient();
      const { error } = await supabase.from('reviews').insert({
        source: 'manual',
        is_published: false,
        is_featured: false,
        author_name: submission.authorName,
        author_location: submission.authorLocation,
        rating: submission.rating,
        body: submission.body,
        photo_urls: submission.photoUrls.length > 0 ? submission.photoUrls : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        visit_date: null,
        source_url: null,
      });

      if (error) {
        console.error('Failed to persist review', error);
        return {
          status: 'error',
          message: "We couldn't save your review. Please try again shortly.",
        };
      }
    } catch (clientError) {
      if (process.env.NODE_ENV === 'production') {
        console.error('Supabase service role client misconfigured.', clientError);
        return {
          status: 'error',
          message: "We couldn't save your review. Please try again shortly.",
        };
      }
      console.warn(
        'Supabase service role client unavailable; skipping review persistence in non-production environment.',
        clientError,
      );
    }
  }

  revalidatePath('/reviews');

  return {
    status: 'success',
    message: 'Thanks for sharing your story! We will publish it after a quick review.',
  };
}
