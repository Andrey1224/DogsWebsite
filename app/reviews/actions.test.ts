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
  authorName: string;
  authorLocation: string;
  rating: string;
  body: string;
  'h-captcha-response': string;
  photoUrls: string[];
  agreeToPublish: string | null;
}>;

function createFormData(overrides: FormOverrides = {}) {
  const defaults: Record<string, string | string[]> = {
    authorName: 'Sarah W.',
    authorLocation: 'Huntsville, AL',
    rating: '5',
    body: 'Charlie came home healthy and happy. The breeder kept us updated the entire time and the pickup was so smooth.',
    'h-captcha-response': 'captcha-token',
    agreeToPublish: 'on',
    photoUrls: [],
  };

  const entries = { ...defaults, ...overrides } as Record<
    string,
    string | string[] | null | undefined
  >;
  const data = new FormData();

  Object.entries(entries).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => data.append(`${key}[]`, v));
      } else {
        data.set(key, value);
      }
    }
  });

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
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    mockHeaders();
    mocks.verifyHCaptcha.mockResolvedValue({ ok: true, message: 'Captcha verified' });
    mocks.revalidatePath.mockResolvedValue(undefined);
    mockSupabaseInsert({ error: null });
  });

  it('returns validation errors when form data is invalid', async () => {
    const result = await submitReview(
      { status: 'idle' },
      createFormData({
        authorName: 'A',
        authorLocation: '',
        rating: '9',
        body: 'Tiny',
        'h-captcha-response': '',
        agreeToPublish: null,
        photoUrls: ['https://example.com/invalid.jpg'],
      }),
    );

    expect(result.status).toBe('error');
    expect(result.message).toBe('Please correct the highlighted fields.');
    expect(result.fieldErrors).toEqual(
      expect.objectContaining({
        authorName: expect.any(String),
        rating: expect.any(String),
        body: expect.any(String),
        captcha: expect.any(String),
        agreeToPublish: expect.any(String),
        photoUrls: expect.any(String),
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
        author_location: 'Huntsville, AL',
        rating: 5,
        body: expect.stringContaining('Charlie came home'),
        photo_urls: null,
        source: 'manual',
        is_published: false,
        is_featured: false,
      }),
    );
    expect(mocks.verifyHCaptcha).toHaveBeenCalledWith('captcha-token', '198.51.100.3');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/reviews');
  });

  it('skips persistence when Supabase client is unavailable outside production', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    mocks.createServiceRoleClient.mockImplementation(() => {
      throw new Error('missing env');
    });

    const result = await submitReview({ status: 'idle' }, createFormData());

    expect(result.status).toBe('success');
    expect(result.message).toContain('Thanks for sharing your story');

    vi.unstubAllEnvs();
  });
});
