'use client';

import Image from 'next/image';
import { useActionState, useEffect, useId, useRef, useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useRouter } from 'next/navigation';

import type { ReviewFormState } from '@/app/reviews/actions';
import { submitReview } from '@/app/reviews/actions';
import {
  createReviewPhotoUploadTarget,
  getReviewPhotoPublicUrl,
} from '@/app/reviews/upload-actions';
import { useAnalytics } from '@/components/analytics-provider';

const HC_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
const HC_BYPASS_TOKEN = process.env.NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN;
const MAX_REVIEW_PHOTOS = 3;
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const INITIAL_STATE: ReviewFormState = {
  status: 'idle',
};

type FieldName = 'name' | 'location' | 'visitMonth' | 'rating' | 'story' | 'captcha' | 'photos';

const ratingOptions = [1, 2, 3, 4, 5];

export function ReviewForm() {
  const formRef = useRef<HTMLFormElement>(null);
  type HCaptchaInstance = InstanceType<typeof HCaptcha>;
  const captchaRef = useRef<HCaptchaInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const { trackEvent } = useAnalytics();
  const [state, formAction, isPending] = useActionState<ReviewFormState, FormData>(
    submitReview,
    INITIAL_STATE,
  );
  const nameId = useId();
  const locationId = useId();
  const visitMonthId = useId();
  const storyId = useId();
  const [captchaToken, setCaptchaToken] = useState<string | null>(HC_BYPASS_TOKEN ?? null);
  const [formValues, setFormValues] = useState({
    name: '',
    location: '',
    visitMonth: '',
    rating: '5',
    story: '',
  });
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const showCaptchaWarning = !HC_SITE_KEY && !HC_BYPASS_TOKEN;
  const isBypass = Boolean(HC_BYPASS_TOKEN);

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
      setFormValues({
        name: '',
        location: '',
        visitMonth: '',
        rating: '5',
        story: '',
      });
      setCaptchaToken(HC_BYPASS_TOKEN ?? null);
      setUploadedPhotos([]);
      setUploadError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (!isBypass) {
        captchaRef.current?.resetCaptcha();
      }
      router.refresh();
      trackEvent('review_form_success');
    }
  }, [isBypass, router, state.status, trackEvent]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const data = new FormData(event.currentTarget);
    setFormValues({
      name: (data.get('name') as string) ?? '',
      location: (data.get('location') as string) ?? '',
      visitMonth: (data.get('visitMonth') as string) ?? '',
      rating: (data.get('rating') as string) ?? '5',
      story: (data.get('story') as string) ?? '',
    });
    trackEvent('review_form_submit');
  };

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    if (!captchaToken) {
      setUploadError('Complete the captcha before uploading photos.');
      event.target.value = '';
      return;
    }

    const remainingSlots = MAX_REVIEW_PHOTOS - uploadedPhotos.length;
    if (remainingSlots <= 0) {
      setUploadError('You can upload up to three photos.');
      event.target.value = '';
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploadingPhotos(true);
    setUploadError(null);

    try {
      for (const file of filesToUpload) {
        if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
          setUploadError('Use JPG, PNG, or WebP images.');
          continue;
        }

        if (file.size > MAX_PHOTO_SIZE_BYTES) {
          setUploadError('Each photo must be under 5MB.');
          continue;
        }

        try {
          const extension = (file.name.split('.').pop() || 'jpg').toLowerCase();
          const { signedUrl, path } = await createReviewPhotoUploadTarget({ extension });
          const response = await fetch(signedUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
              'x-upsert': 'false',
            },
          });

          if (!response.ok) {
            throw new Error(`Upload failed with status ${response.status}`);
          }

          const publicUrl = await getReviewPhotoPublicUrl(path);
          setUploadedPhotos((prev) => {
            const next = [...prev, publicUrl];
            return next.slice(0, MAX_REVIEW_PHOTOS);
          });
          trackEvent('review_photo_upload_success');
        } catch (uploadError) {
          console.error('Photo upload failed', uploadError);
          setUploadError('Upload failed. Please try again.');
          break;
        }
      }
    } finally {
      setIsUploadingPhotos(false);
      event.target.value = '';
    }
  };

  const handleRemovePhoto = (url: string) => {
    setUploadedPhotos((prev) => prev.filter((photo) => photo !== url));
  };

  const fieldErrors = state.fieldErrors ?? {};

  const renderError = (field: FieldName) => {
    const message = fieldErrors[field];
    if (!message) return null;
    return <p className="text-xs text-red-600">{message}</p>;
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm"
    >
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-aux">
          Share your experience
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Leave a review</h2>
        <p className="text-sm text-muted">
          Tell future families what the adoption process felt like — we publish reviews instantly.
        </p>
      </header>
      {uploadedPhotos.map((url) => (
        <input key={url} type="hidden" name="photoUrls" value={url} />
      ))}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-text" htmlFor={nameId}>
            Your name
          </label>
          <input
            id={nameId}
            name="name"
            type="text"
            required
            placeholder="Jordan M."
            defaultValue={formValues.name}
            className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm shadow-sm focus:border-accent focus:outline-none"
            aria-invalid={fieldErrors.name ? 'true' : 'false'}
          />
          {renderError('name')}
        </div>
        <div>
          <label className="block text-sm font-semibold text-text" htmlFor={locationId}>
            City & state
          </label>
          <input
            id={locationId}
            name="location"
            type="text"
            required
            placeholder="Atlanta, GA"
            defaultValue={formValues.location}
            className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm shadow-sm focus:border-accent focus:outline-none"
            aria-invalid={fieldErrors.location ? 'true' : 'false'}
          />
          {renderError('location')}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-text" htmlFor={visitMonthId}>
            When did you pick up your puppy?
          </label>
          <input
            id={visitMonthId}
            name="visitMonth"
            type="month"
            required
            defaultValue={formValues.visitMonth}
            className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm shadow-sm focus:border-accent focus:outline-none"
            aria-invalid={fieldErrors.visitMonth ? 'true' : 'false'}
          />
          {renderError('visitMonth')}
        </div>
        <div>
          <span className="block text-sm font-semibold text-text">Rate the experience</span>
          <div className="mt-2 flex gap-2">
            {ratingOptions.map((value) => (
              <label key={value} className="flex-1">
                <input
                  type="radio"
                  name="rating"
                  value={value}
                  defaultChecked={formValues.rating === String(value)}
                  className="peer sr-only"
                />
                <div className="flex h-12 items-center justify-center rounded-2xl border border-border bg-bg text-sm font-semibold text-muted transition peer-checked:border-accent peer-checked:text-accent">
                  {value}★
                </div>
              </label>
            ))}
          </div>
          {renderError('rating')}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text" htmlFor={storyId}>
          What should new families know?
        </label>
        <textarea
          id={storyId}
          name="story"
          rows={4}
          required
          placeholder="Share how pickup day felt, what stood out during the process, or how your pup is doing now."
          defaultValue={formValues.story}
          className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm shadow-sm focus:border-accent focus:outline-none"
          aria-invalid={fieldErrors.story ? 'true' : 'false'}
        />
        {renderError('story')}
      </div>

      <div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-text">Add photos (optional)</span>
          <p className="text-xs text-muted">Up to 3 JPG, PNG, or WebP photos under 5MB each.</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {uploadedPhotos.map((url, index) => (
            <div
              key={url}
              className="group relative h-20 w-20 overflow-hidden rounded-2xl border border-border"
            >
              <Image
                src={url}
                alt={`Review photo ${index + 1} from ${formValues.name || 'review'}`}
                fill
                sizes="80px"
                className="object-cover"
              />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => handleRemovePhoto(url)}
                className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100"
              >
                Remove
              </button>
            </div>
          ))}
          {uploadedPhotos.length < MAX_REVIEW_PHOTOS ? (
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border text-center text-xs text-muted transition hover:border-accent hover:text-accent">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_MIME_TYPES.join(',')}
                multiple
                className="sr-only"
                onChange={handlePhotoSelect}
                disabled={isUploadingPhotos || showCaptchaWarning}
              />
              {isUploadingPhotos ? (
                <span>Uploading…</span>
              ) : (
                <>
                  <span>Upload</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted">
                    {MAX_REVIEW_PHOTOS - uploadedPhotos.length} left
                  </span>
                </>
              )}
            </label>
          ) : null}
        </div>
        {uploadError ? <p className="mt-2 text-xs text-red-600">{uploadError}</p> : null}
        {renderError('photos')}
      </div>

      <div className="space-y-2">
        {showCaptchaWarning ? (
          <p className="rounded-2xl border border-dashed border-accent/50 bg-[color:color-mix(in srgb, var(--accent) 18%, var(--bg))] px-4 py-3 text-sm text-accent-aux">
            Add `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` and `HCAPTCHA_SECRET_KEY` to enable spam protection.
          </p>
        ) : isBypass ? (
          <p className="rounded-2xl border border-dashed border-accent-aux/40 bg-[color:color-mix(in srgb, var(--accent-aux) 14%, var(--bg))] px-4 py-3 text-sm text-accent-aux">
            Captcha bypass enabled for local testing. Remove `NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN` in
            production.
          </p>
        ) : (
          <HCaptcha
            ref={(instance) => {
              captchaRef.current = instance;
            }}
            sitekey={HC_SITE_KEY!}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
            theme="light"
          />
        )}
        <input type="hidden" name="h-captcha-response" value={captchaToken ?? ''} />
        {renderError('captcha')}
      </div>

      <p className="text-xs text-muted">
        We only publish your first name/last initial. By submitting you agree we may quote your
        story on ExoticBulldogLegacy.com and marketing emails.
      </p>

      <button
        type="submit"
        className="w-full rounded-full bg-[color:var(--btn-bg)] px-6 py-3 text-sm font-semibold text-[color:var(--btn-text)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-75"
        disabled={isPending || showCaptchaWarning || !captchaToken || isUploadingPhotos}
      >
        {isPending ? 'Publishing…' : 'Publish my review'}
      </button>

      {state.status === 'success' ? (
        <p className="rounded-2xl bg-[color:color-mix(in srgb, var(--accent) 18%, var(--bg))] px-4 py-3 text-sm text-accent-aux">
          {state.message}
        </p>
      ) : null}

      {state.status === 'error' && state.message ? (
        <p className="rounded-2xl bg-red-50/80 px-4 py-3 text-sm text-red-700">{state.message}</p>
      ) : null}
    </form>
  );
}
