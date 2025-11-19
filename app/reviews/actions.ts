'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { verifyHCaptcha } from '@/lib/captcha/hcaptcha';
import { reviewSubmissionSchema } from '@/lib/reviews/schema';
import { createServiceRoleClient } from '@/lib/supabase/client';

export type ReviewFormState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

function asString(value: FormDataEntryValue | null): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asStringArray(values: FormDataEntryValue[]): string[] {
  return values.map((value) => (typeof value === 'string' ? value : '')).filter(Boolean);
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
    'name',
    'location',
    'visitMonth',
    'rating',
    'story',
    'captcha',
    'photos',
  ]);

  const entries = Object.entries(flattened.fieldErrors ?? {}).flatMap(([key, messages]) => {
    const normalizedKey =
      key === 'hcaptchaToken' ? 'captcha' : key === 'photoUrls' ? 'photos' : key;
    if (!allowedFields.has(normalizedKey) || !Array.isArray(messages) || messages.length === 0) {
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
  const fields = {
    name: asString(formData.get('name')),
    location: asString(formData.get('location')),
    visitMonth: asString(formData.get('visitMonth')),
    rating: asString(formData.get('rating')),
    story: asString(formData.get('story')),
    photoUrls: asStringArray(formData.getAll('photoUrls')),
    hcaptchaToken: asString(formData.get('h-captcha-response')),
  };

  const parsed = reviewSubmissionSchema.safeParse(fields);
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

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from('reviews').insert({
      author_name: submission.name,
      location: submission.location,
      visit_date: submission.visitMonth,
      rating: submission.rating,
      story: submission.story,
      photo_urls: submission.photoUrls,
      status: 'published',
      source: 'form',
      client_ip: clientIp ?? null,
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

  revalidatePath('/reviews');

  return {
    status: 'success',
    message: 'Thanks for sharing your story! Your review is now live.',
  };
}
