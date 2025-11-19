import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

import { submitReview } from './actions';

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  verifyHCaptcha: vi.fn(),
  createServiceRoleClient: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: mocks.headers,
}));

vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock('@/lib/captcha/hcaptcha', () => ({
  verifyHCaptcha: mocks.verifyHCaptcha,
}));

vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

type FormOverrides = Partial<{
  name: string;
  location: string;
  visitMonth: string;
  rating: string;
  story: string;
  'h-captcha-response': string;
  photoUrls: string[];
}>;

function createFormData(overrides: FormOverrides = {}) {
  const defaults: Record<string, string> = {
    name: 'Sarah W.',
    location: 'Huntsville, AL',
    visitMonth: '2025-06',
    rating: '5',
    story:
      'Charlie came home healthy and happy. The breeder kept us updated the entire time and the pickup was so smooth.',
    'h-captcha-response': 'captcha-token',
  };

  const defaultPhotoUrls = [
    'https://example.supabase.co/storage/v1/object/public/reviews/a.jpg',
    'https://example.supabase.co/storage/v1/object/public/reviews/b.jpg',
  ];

  const { photoUrls, ...fieldOverrides } = overrides;

  const data = new FormData();
  const entries = { ...defaults, ...fieldOverrides };
  Object.entries(entries).forEach(([key, value]) => {
    if (value !== undefined) {
      data.set(key, value);
    }
  });

  const photos = photoUrls !== undefined ? (photoUrls ?? []) : defaultPhotoUrls;
  photos.forEach((url) => data.append('photoUrls', url));

  return data;
}

function mockHeaders(values: Record<string, string | undefined> = {}) {
  const headers = new Headers({
    'x-forwarded-for': '198.51.100.3, 10.0.0.1',
    ...values,
  });
  mocks.headers.mockReturnValue(headers);
  return headers;
}

function mockSupabaseInsert(returnValue: { error: unknown }) {
  const insert = vi.fn().mockResolvedValue(returnValue);
  const from = vi.fn().mockReturnValue({ insert });
  mocks.createServiceRoleClient.mockReturnValue({ from });
  return { insert, from };
}

describe('submitReview', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders();
    mocks.verifyHCaptcha.mockResolvedValue({ ok: true, message: 'Captcha verified' });
    mocks.revalidatePath.mockResolvedValue(undefined);
    mockSupabaseInsert({ error: null });
  });

  it('returns validation errors when form data is invalid', async () => {
    const result = await submitReview(
      { status: 'idle' },
      createFormData({
        name: 'A',
        location: '',
        visitMonth: '2025',
        rating: '9',
        story: 'Tiny',
        'h-captcha-response': '',
        photoUrls: [
          'https://example.supabase.co/storage/v1/object/public/reviews/1.jpg',
          'https://example.supabase.co/storage/v1/object/public/reviews/2.jpg',
          'https://example.supabase.co/storage/v1/object/public/reviews/3.jpg',
          'https://example.supabase.co/storage/v1/object/public/reviews/4.jpg',
        ],
      }),
    );

    expect(result.status).toBe('error');
    expect(result.message).toBe('Please correct the highlighted fields.');
    expect(result.fieldErrors).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        location: expect.any(String),
        visitMonth: expect.any(String),
        rating: expect.any(String),
        story: expect.any(String),
        captcha: expect.any(String),
        photos: expect.any(String),
      }),
    );
    expect(mocks.verifyHCaptcha).not.toHaveBeenCalled();
  });

  it('returns captcha error when verification fails', async () => {
    mocks.verifyHCaptcha.mockResolvedValue({
      ok: false,
      message: 'Captcha failed',
    });

    const result = await submitReview({ status: 'idle' }, createFormData());

    expect(result).toEqual({
      status: 'error',
      message: 'Captcha failed',
      fieldErrors: { captcha: 'Captcha failed' },
    });
  });

  it('returns persistence error when Supabase insert fails', async () => {
    const insertError = { message: 'DB down' };
    const { insert } = mockSupabaseInsert({ error: insertError });

    const result = await submitReview({ status: 'idle' }, createFormData());

    expect(insert).toHaveBeenCalled();
    expect(result).toEqual({
      status: 'error',
      message: "We couldn't save your review. Please try again shortly.",
    });
  });

  it('persists review and revalidates the page on success', async () => {
    const { insert } = mockSupabaseInsert({ error: null });

    const result = await submitReview({ status: 'idle' }, createFormData());

    expect(result.status).toBe('success');
    expect(result.message).toContain('Thanks for sharing your story');

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        author_name: 'Sarah W.',
        location: 'Huntsville, AL',
        visit_date: '2025-06-01',
        rating: 5,
        story: expect.stringContaining('Charlie came home'),
        photo_urls: [
          'https://example.supabase.co/storage/v1/object/public/reviews/a.jpg',
          'https://example.supabase.co/storage/v1/object/public/reviews/b.jpg',
        ],
        status: 'published',
        source: 'form',
        client_ip: '198.51.100.3',
      }),
    );
    expect(mocks.verifyHCaptcha).toHaveBeenCalledWith('captcha-token', '198.51.100.3');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/reviews');
  });

  it('skips persistence errors when Supabase client is unavailable outside production', async () => {
    mocks.createServiceRoleClient.mockImplementation(() => {
      throw new Error('missing env');
    });

    const result = await submitReview({ status: 'idle' }, createFormData());

    expect(result.status).toBe('success');
    expect(consoleWarnSpy).toHaveBeenCalled();
  });
});
