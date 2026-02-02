'use client';

import Image from 'next/image';
import { useActionState, useEffect, useId, useRef, useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useRouter } from 'next/navigation';
import { Star, UploadCloud, ArrowRight, X } from 'lucide-react';

import type { ReviewFormState } from '@/app/(site)/(chrome)/reviews/actions';
import { submitReview } from '@/app/(site)/(chrome)/reviews/actions';
import {
  createReviewPhotoUploadTarget,
  getReviewPhotoPublicUrl,
} from '@/app/(site)/(chrome)/reviews/upload-actions';
import { useAnalytics } from '@/components/analytics-provider';

const HC_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
const HC_BYPASS_TOKEN = process.env.NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN;
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_PHOTOS = 3;
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const INITIAL_STATE: ReviewFormState = {
  status: 'idle',
};

type FieldName =
  | 'authorName'
  | 'authorLocation'
  | 'rating'
  | 'body'
  | 'photoUrl'
  | 'captcha'
  | 'agreeToPublish';

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
  const storyId = useId();
  const agreeId = useId();
  const [captchaToken, setCaptchaToken] = useState<string | null>(HC_BYPASS_TOKEN ?? null);
  const [formValues, setFormValues] = useState({
    authorName: '',
    authorLocation: '',
    rating: '5',
    body: '',
    agreeToPublish: false,
  });
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const showCaptchaWarning = !HC_SITE_KEY && !HC_BYPASS_TOKEN;
  const isBypass = Boolean(HC_BYPASS_TOKEN);

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
      setFormValues({
        authorName: '',
        authorLocation: '',
        rating: '5',
        body: '',
        agreeToPublish: false,
      });
      setCaptchaToken(HC_BYPASS_TOKEN ?? null);
      setPhotoUrls([]);
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
      authorName: (data.get('authorName') as string) ?? '',
      authorLocation: (data.get('authorLocation') as string) ?? '',
      rating: (data.get('rating') as string) ?? '5',
      body: (data.get('body') as string) ?? '',
      agreeToPublish: Boolean(data.get('agreeToPublish')),
    });
    trackEvent('review_form_submit');
  };

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (photoUrls.length >= MAX_PHOTOS) {
      setUploadError(`Maximum ${MAX_PHOTOS} photos allowed.`);
      event.target.value = '';
      return;
    }

    if (!captchaToken) {
      setUploadError('Complete the captcha before uploading a photo.');
      event.target.value = '';
      return;
    }

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      setUploadError('Use a JPG, PNG, or WebP image.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setUploadError('Photo must be under 5MB.');
      event.target.value = '';
      return;
    }

    setIsUploadingPhoto(true);
    setUploadError(null);

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
      setPhotoUrls((prev) => [...prev, publicUrl]);
      trackEvent('review_photo_upload_success');
    } catch (uploadErr) {
      console.error('Photo upload failed', uploadErr);
      setUploadError('Upload failed. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
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
      className="relative overflow-hidden rounded-[2.5rem] border border-slate-700 bg-[#1E293B]/80 p-8 shadow-2xl backdrop-blur-xl md:p-12"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-600/10 to-purple-600/5 opacity-50 blur-3xl" />

      <header className="mb-10 text-center">
        <h2 className="mb-3 text-3xl font-bold text-white">Share your experience</h2>
        <p className="text-slate-400">
          Tell future families what the adoption process felt like. We publish reviews instantly.
        </p>
      </header>

      {photoUrls.map((url, index) => (
        <input key={index} type="hidden" name="photoUrls[]" value={url} />
      ))}

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400"
            htmlFor={nameId}
          >
            Your Name
          </label>
          <input
            id={nameId}
            name="authorName"
            type="text"
            required
            placeholder="e.g. Jordan M."
            defaultValue={formValues.authorName}
            className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3 text-white transition-colors focus:border-orange-500 focus:outline-none"
            aria-invalid={fieldErrors.authorName ? 'true' : 'false'}
          />
          {renderError('authorName')}
        </div>
        <div className="space-y-2">
          <label
            className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400"
            htmlFor={locationId}
          >
            City & State
          </label>
          <input
            id={locationId}
            name="authorLocation"
            type="text"
            placeholder="e.g. Atlanta, GA"
            defaultValue={formValues.authorLocation}
            className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3 text-white transition-colors focus:border-orange-500 focus:outline-none"
            aria-invalid={fieldErrors.authorLocation ? 'true' : 'false'}
          />
          {renderError('authorLocation')}
        </div>
      </div>

      <div className="mb-6 space-y-2">
        <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400">
          How was the experience?
        </label>
        <div className="flex gap-2">
          {ratingOptions.map((value) => (
            <label key={value} className="flex-1">
              <input
                type="radio"
                name="rating"
                value={value}
                defaultChecked={formValues.rating === String(value)}
                className="peer sr-only"
              />
              <button
                type="button"
                className={`flex w-full items-center justify-center gap-1 rounded-xl border py-3 text-sm font-bold transition-all ${
                  formValues.rating === String(value)
                    ? 'border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'border-slate-700 bg-[#0B1120] text-slate-400 hover:border-slate-500 hover:text-white'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setFormValues((prev) => ({ ...prev, rating: String(value) }));
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  if (input) input.checked = true;
                }}
              >
                {value}{' '}
                <Star
                  size={14}
                  className={formValues.rating === String(value) ? 'fill-white' : ''}
                />
              </button>
            </label>
          ))}
        </div>
        {renderError('rating')}
      </div>

      <div className="mb-6 space-y-2">
        <label
          className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400"
          htmlFor={storyId}
        >
          Your Story
        </label>
        <textarea
          id={storyId}
          name="body"
          rows={4}
          required
          placeholder="Share how pickup day felt, what stood out during the process, or how your pup is doing now..."
          defaultValue={formValues.body}
          className="w-full resize-none rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3 text-white transition-colors focus:border-orange-500 focus:outline-none"
          aria-invalid={fieldErrors.body ? 'true' : 'false'}
        />
        {renderError('body')}
      </div>

      {/* Photo Upload */}
      <div className="mb-6">
        {photoUrls.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-3">
            {photoUrls.map((url, index) => (
              <div key={index} className="group relative h-24 w-24 overflow-hidden rounded-xl">
                <Image
                  src={url}
                  alt={`Review photo ${index + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
                <button
                  type="button"
                  aria-label={`Remove photo ${index + 1}`}
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {photoUrls.length < MAX_PHOTOS ? (
          <label className="group relative block cursor-pointer rounded-xl border-2 border-dashed border-slate-700 p-8 text-center transition-colors hover:bg-[#0B1120]/50">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_MIME_TYPES.join(',')}
              className="sr-only"
              onChange={handlePhotoSelect}
              disabled={isUploadingPhoto || showCaptchaWarning}
            />
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 transition-transform group-hover:scale-110">
              <UploadCloud className="text-orange-400" />
            </div>
            <p className="mb-1 text-sm font-medium text-white">
              {isUploadingPhoto ? 'Uploading...' : 'Add photos (optional)'}
            </p>
            <p className="text-xs text-slate-500">
              Up to {MAX_PHOTOS} JPG, PNG or WebP photos under 5MB each.
            </p>
          </label>
        ) : null}

        {uploadError ? <p className="mt-2 text-xs text-red-600">{uploadError}</p> : null}
        {renderError('photoUrl')}
      </div>

      {/* Captcha */}
      <div className="mb-6 space-y-2">
        {showCaptchaWarning ? (
          <p className="rounded-xl border border-dashed border-orange-500/50 bg-orange-500/10 px-4 py-3 text-sm text-orange-400">
            Add `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` and `HCAPTCHA_SECRET_KEY` to enable spam protection.
          </p>
        ) : isBypass ? (
          <p className="rounded-xl border border-dashed border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-400">
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
            theme="dark"
          />
        )}
        <input type="hidden" name="h-captcha-response" value={captchaToken ?? ''} />
        {renderError('captcha')}
      </div>

      <div className="mb-6 space-y-2">
        <div className="flex items-start gap-3 rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3">
          <input
            id={agreeId}
            name="agreeToPublish"
            type="checkbox"
            value="on"
            required
            defaultChecked={formValues.agreeToPublish}
            onChange={(event) =>
              setFormValues((prev) => ({ ...prev, agreeToPublish: event.target.checked }))
            }
            className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-orange-500 focus:ring-orange-500"
            aria-invalid={fieldErrors.agreeToPublish ? 'true' : 'false'}
          />
          <label htmlFor={agreeId} className="text-sm text-slate-300">
            I agree that my review and photos may be published on Exotic Bulldog Legacy and used in
            marketing communications.
          </label>
        </div>
        {renderError('agreeToPublish')}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 font-bold text-black shadow-xl transition-all hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-75"
        disabled={isPending || showCaptchaWarning || !captchaToken || isUploadingPhoto}
      >
        {isPending ? 'Submitting...' : 'Publish my review'} <ArrowRight size={18} />
      </button>

      <p className="text-center text-[10px] text-slate-600">
        By submitting you agree we may quote your story on ExoticBulldogLegacy.com and marketing
        emails.
      </p>

      {state.status === 'success' ? (
        <p className="rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {state.message}
        </p>
      ) : null}

      {state.status === 'error' && state.message ? (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{state.message}</p>
      ) : null}
    </form>
  );
}
