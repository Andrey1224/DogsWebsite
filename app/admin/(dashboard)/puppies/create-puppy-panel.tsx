'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { slugifyName } from '@/lib/admin/puppies/slug';
import { ParentPhotoUpload } from '@/components/admin/parent-photo-upload';
import { useMediaUpload } from '@/lib/admin/hooks/use-media-upload';
import { createPuppyAction } from './actions';
import { initialCreatePuppyState, type CreatePuppyState } from './types';

type StatusOption = {
  value: string;
  label: string;
};

interface CreatePuppyPanelProps {
  statusOptions: StatusOption[];
}

export function CreatePuppyPanel({ statusOptions }: CreatePuppyPanelProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const processedSuccessRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [status, setStatus] = useState(statusOptions[0]?.value ?? 'available');

  // File upload state
  const { uploadFiles, isUploading } = useMediaUpload();
  const [sireFiles, setSireFiles] = useState<File[]>([]);
  const [damFiles, setDamFiles] = useState<File[]>([]);
  const [sirePhotoUrls, setSirePhotoUrls] = useState<string[]>([]);
  const [damPhotoUrls, setDamPhotoUrls] = useState<string[]>([]);
  const [puppyFiles, setPuppyFiles] = useState<File[]>([]);
  const [puppyPhotoUrls, setPuppyPhotoUrls] = useState<string[]>([]);

  const [state, formAction, pending] = useActionState<CreatePuppyState, FormData>(
    createPuppyAction,
    initialCreatePuppyState,
  );

  useEffect(() => {
    if (state.status === 'success' && !processedSuccessRef.current) {
      processedSuccessRef.current = true;
      toast.success('Puppy created');
      formRef.current?.reset();
      setName('');
      setSlug('');
      setSlugManuallyEdited(false);
      setStatus(statusOptions[0]?.value ?? 'available');
      setSireFiles([]);
      setDamFiles([]);
      setSirePhotoUrls([]);
      setDamPhotoUrls([]);
      setPuppyFiles([]);
      setPuppyPhotoUrls([]);
      setIsOpen(false);
      router.refresh();
    } else if (state.status === 'error' && state.formError) {
      toast.error(state.formError);
    }

    // Reset flag when starting new submission
    if (state.status === 'idle') {
      processedSuccessRef.current = false;
    }
  }, [state, router, statusOptions]);

  useEffect(() => {
    if (!slugManuallyEdited) {
      const nextSlug = slugifyName(name);
      setSlug(nextSlug);
    }
  }, [name, slugManuallyEdited]);

  const fieldError = (field: string) => state.fieldErrors?.[field]?.[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;

    try {
      // Generate a temporary ID for storage paths
      const tempId = crypto.randomUUID();

      let nextSirePhotoUrls = sirePhotoUrls;
      let nextDamPhotoUrls = damPhotoUrls;
      let nextPuppyPhotoUrls = puppyPhotoUrls;

      // Upload sire photos if any
      if (sireFiles.length > 0) {
        toast.info('Uploading sire photos...');
        const urls = await uploadFiles(sireFiles, `${tempId}/sire`);
        nextSirePhotoUrls = urls;
        setSirePhotoUrls(urls);
      }

      // Upload dam photos if any
      if (damFiles.length > 0) {
        toast.info('Uploading dam photos...');
        const urls = await uploadFiles(damFiles, `${tempId}/dam`);
        nextDamPhotoUrls = urls;
        setDamPhotoUrls(urls);
      }

      if (puppyFiles.length > 0) {
        toast.info('Uploading puppy photos...');
        const urls = await uploadFiles(puppyFiles, `${tempId}/gallery`);
        nextPuppyPhotoUrls = urls;
        setPuppyPhotoUrls(urls);
      }

      // Remove any file inputs before submitting to server action
      const rawFormData = new FormData(formElement);
      const filteredFormData = new FormData();

      rawFormData.forEach((value, key) => {
        if (value instanceof File) {
          return;
        }
        filteredFormData.append(key, value);
      });

      filteredFormData.delete('sirePhotoUrls');
      nextSirePhotoUrls.forEach((url) => {
        filteredFormData.append('sirePhotoUrls', url);
      });

      filteredFormData.delete('damPhotoUrls');
      nextDamPhotoUrls.forEach((url) => {
        filteredFormData.append('damPhotoUrls', url);
      });

      filteredFormData.delete('photoUrls');
      nextPuppyPhotoUrls.forEach((url) => {
        filteredFormData.append('photoUrls', url);
      });

      formAction(filteredFormData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text">Add new puppy</p>
          <p className="text-xs text-muted">
            Create a listing with name, status, price, and optional birth date.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text transition hover:bg-hover"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? 'Close form' : 'Add puppy'}
        </button>
      </div>

      {isOpen ? (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          aria-label="Create puppy form"
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-text">
              Name
            </label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              disabled={pending}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            {fieldError('name') ? (
              <p className="text-xs text-red-500">{fieldError('name')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium text-text">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugManuallyEdited(true);
              }}
              disabled={pending}
              required
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            {fieldError('slug') ? (
              <p className="text-xs text-red-500">{fieldError('slug')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium text-text">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={pending}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldError('status') ? (
              <p className="text-xs text-red-500">{fieldError('status')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="breed" className="text-sm font-medium text-text">
              Breed
            </label>
            <select
              id="breed"
              name="breed"
              disabled={pending}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <option value="">Select breed</option>
              <option value="french_bulldog">French Bulldog</option>
              <option value="english_bulldog">English Bulldog</option>
            </select>
            {fieldError('breed') ? (
              <p className="text-xs text-red-500">{fieldError('breed')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="sex" className="text-sm font-medium text-text">
              Sex
            </label>
            <select
              id="sex"
              name="sex"
              disabled={pending}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <option value="">Select sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {fieldError('sex') ? <p className="text-xs text-red-500">{fieldError('sex')}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="color" className="text-sm font-medium text-text">
              Color
            </label>
            <input
              id="color"
              name="color"
              placeholder="e.g., Fawn, Brindle, Blue"
              disabled={pending}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            {fieldError('color') ? (
              <p className="text-xs text-red-500">{fieldError('color')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="priceUsd" className="text-sm font-medium text-text">
              Price (USD)
            </label>
            <input
              id="priceUsd"
              name="priceUsd"
              type="number"
              inputMode="decimal"
              step="100"
              placeholder="4200"
              disabled={pending}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            {fieldError('priceUsd') ? (
              <p className="text-xs text-red-500">{fieldError('priceUsd')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="birthDate" className="text-sm font-medium text-text">
              Birth date
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              disabled={pending}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            {fieldError('birthDate') ? (
              <p className="text-xs text-red-500">{fieldError('birthDate')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="weightOz" className="text-sm font-medium text-text">
              Weight (oz)
            </label>
            <input
              id="weightOz"
              name="weightOz"
              type="number"
              inputMode="numeric"
              step="1"
              placeholder="e.g., 12"
              disabled={pending}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            {fieldError('weightOz') ? (
              <p className="text-xs text-red-500">{fieldError('weightOz')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="sireName" className="text-sm font-medium text-text">
              Sire / Father Name (optional)
            </label>
            <input
              id="sireName"
              name="sireName"
              placeholder="e.g., Pierre, Sir Winston"
              disabled={pending}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            {fieldError('sireName') ? (
              <p className="text-xs text-red-500">{fieldError('sireName')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="damName" className="text-sm font-medium text-text">
              Dam / Mother Name (optional)
            </label>
            <input
              id="damName"
              name="damName"
              placeholder="e.g., Colette, Lady Clementine"
              disabled={pending}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            {fieldError('damName') ? (
              <p className="text-xs text-red-500">{fieldError('damName')}</p>
            ) : null}
          </div>

          <div className="col-span-full">
            <ParentPhotoUpload
              label="Puppy gallery photos"
              inputName="photoUrls"
              helpText="Displayed on the public puppy gallery. Up to 3 images."
              disabled={pending || isUploading}
              onFilesSelected={setPuppyFiles}
              uploadedUrls={puppyPhotoUrls}
              isUploading={isUploading}
            />
            {fieldError('photoUrls') ? (
              <p className="text-xs text-red-500">{fieldError('photoUrls')}</p>
            ) : null}
          </div>

          <div className="col-span-full md:col-span-1">
            <ParentPhotoUpload
              parentType="sire"
              disabled={pending || isUploading}
              onFilesSelected={setSireFiles}
              uploadedUrls={sirePhotoUrls}
              isUploading={isUploading}
            />
          </div>

          <div className="col-span-full md:col-span-1">
            <ParentPhotoUpload
              parentType="dam"
              disabled={pending || isUploading}
              onFilesSelected={setDamFiles}
              uploadedUrls={damPhotoUrls}
              isUploading={isUploading}
            />
          </div>

          <div className="col-span-full space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-text">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Enter puppy description, temperament, special features, etc."
              disabled={pending}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent resize-y"
            />
            {fieldError('description') ? (
              <p className="text-xs text-red-500">{fieldError('description')}</p>
            ) : null}
          </div>

          {state.formError ? (
            <div className="col-span-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.formError}
            </div>
          ) : null}

          <div className="col-span-full flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={pending || isUploading}
              className="rounded-lg bg-[color:var(--btn-bg,#0D1A44)] px-4 py-2 text-sm font-semibold text-[color:var(--btn-text,#FFFFFF)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? 'Uploading photos...' : pending ? 'Saving...' : 'Create puppy'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (pending) return;
                setIsOpen(false);
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-hover"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
