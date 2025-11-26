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
  const inputClasses =
    'w-full rounded-xl border border-slate-700 bg-[#0B1120] px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-60';
  const labelClasses = 'text-sm font-semibold text-white';

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

  // Parent notes state
  const [sireWeightNotes, setSireWeightNotes] = useState('');
  const [sireColorNotes, setSireColorNotes] = useState('');
  const [sireHealthNotes, setSireHealthNotes] = useState('');
  const [sireTemperamentNotes, setSireTemperamentNotes] = useState('');
  const [damWeightNotes, setDamWeightNotes] = useState('');
  const [damColorNotes, setDamColorNotes] = useState('');
  const [damHealthNotes, setDamHealthNotes] = useState('');
  const [damTemperamentNotes, setDamTemperamentNotes] = useState('');

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
    <div className="rounded-[2rem] border border-slate-800/50 bg-[#1E293B]/60 p-6 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Quick add
          </p>
          <p className="text-xl font-semibold text-white">Draft a new listing</p>
          <p className="text-xs text-slate-400">
            Create a profile, upload gallery, and parent photos.
          </p>
        </div>
        <button
          type="button"
          aria-expanded={isOpen}
          className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-400 hover:to-orange-500"
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
            <label htmlFor="name" className={labelClasses}>
              Name
            </label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              disabled={pending}
              className={inputClasses}
            />
            {fieldError('name') ? (
              <p className="text-xs text-red-400">{fieldError('name')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className={labelClasses}>
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
              className={inputClasses}
            />
            {fieldError('slug') ? (
              <p className="text-xs text-red-400">{fieldError('slug')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className={labelClasses}>
              Status
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={pending}
              className={`${inputClasses} cursor-pointer`}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldError('status') ? (
              <p className="text-xs text-red-400">{fieldError('status')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="breed" className={labelClasses}>
              Breed
            </label>
            <select
              id="breed"
              name="breed"
              disabled={pending}
              className={`${inputClasses} cursor-pointer`}
            >
              <option value="">Select breed</option>
              <option value="french_bulldog">French Bulldog</option>
              <option value="english_bulldog">English Bulldog</option>
            </select>
            {fieldError('breed') ? (
              <p className="text-xs text-red-400">{fieldError('breed')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="sex" className={labelClasses}>
              Sex
            </label>
            <select
              id="sex"
              name="sex"
              disabled={pending}
              className={`${inputClasses} cursor-pointer`}
            >
              <option value="">Select sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {fieldError('sex') ? <p className="text-xs text-red-400">{fieldError('sex')}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="color" className={labelClasses}>
              Color
            </label>
            <input
              id="color"
              name="color"
              placeholder="e.g., Fawn, Brindle, Blue"
              disabled={pending}
              className={inputClasses}
            />
            {fieldError('color') ? (
              <p className="text-xs text-red-400">{fieldError('color')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="priceUsd" className={labelClasses}>
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
              className={inputClasses}
            />
            {fieldError('priceUsd') ? (
              <p className="text-xs text-red-400">{fieldError('priceUsd')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="birthDate" className={labelClasses}>
              Birth date
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              disabled={pending}
              className={`${inputClasses} cursor-pointer`}
            />
            {fieldError('birthDate') ? (
              <p className="text-xs text-red-400">{fieldError('birthDate')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="weightOz" className={labelClasses}>
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
              className={inputClasses}
            />
            {fieldError('weightOz') ? (
              <p className="text-xs text-red-400">{fieldError('weightOz')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="sireName" className={labelClasses}>
              Sire / Father Name (optional)
            </label>
            <input
              id="sireName"
              name="sireName"
              placeholder="e.g., Pierre, Sir Winston"
              disabled={pending}
              className={inputClasses}
            />
            {fieldError('sireName') ? (
              <p className="text-xs text-red-400">{fieldError('sireName')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="damName" className={labelClasses}>
              Dam / Mother Name (optional)
            </label>
            <input
              id="damName"
              name="damName"
              placeholder="e.g., Colette, Lady Clementine"
              disabled={pending}
              className={inputClasses}
            />
            {fieldError('damName') ? (
              <p className="text-xs text-red-400">{fieldError('damName')}</p>
            ) : null}
          </div>

          {/* Sire Notes Section */}
          <div className="col-span-full">
            <h3 className="mb-4 text-sm font-semibold text-white">Sire / Father Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="sireWeightNotes" className={labelClasses}>
                  Weight Notes (optional)
                </label>
                <input
                  id="sireWeightNotes"
                  name="sireWeightNotes"
                  type="text"
                  maxLength={200}
                  value={sireWeightNotes}
                  onChange={(e) => setSireWeightNotes(e.target.value)}
                  placeholder="e.g., 28 lbs, compact build"
                  disabled={pending}
                  className={inputClasses}
                />
                <p className="text-xs text-slate-500">{sireWeightNotes.length}/200 characters</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="sireColorNotes" className={labelClasses}>
                  Color Notes (optional)
                </label>
                <input
                  id="sireColorNotes"
                  name="sireColorNotes"
                  type="text"
                  maxLength={200}
                  value={sireColorNotes}
                  onChange={(e) => setSireColorNotes(e.target.value)}
                  placeholder="e.g., Blue fawn with black mask"
                  disabled={pending}
                  className={inputClasses}
                />
                <p className="text-xs text-slate-500">{sireColorNotes.length}/200 characters</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="sireHealthNotes" className={labelClasses}>
                  Health Notes (optional)
                </label>
                <input
                  id="sireHealthNotes"
                  name="sireHealthNotes"
                  type="text"
                  maxLength={200}
                  value={sireHealthNotes}
                  onChange={(e) => setSireHealthNotes(e.target.value)}
                  placeholder="e.g., OFA hips, heart tested"
                  disabled={pending}
                  className={inputClasses}
                />
                <p className="text-xs text-slate-500">{sireHealthNotes.length}/200 characters</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="sireTemperamentNotes" className={labelClasses}>
                  Temperament Notes (optional)
                </label>
                <textarea
                  id="sireTemperamentNotes"
                  name="sireTemperamentNotes"
                  maxLength={500}
                  rows={3}
                  value={sireTemperamentNotes}
                  onChange={(e) => setSireTemperamentNotes(e.target.value)}
                  placeholder="e.g., Calm, affectionate, great with kids..."
                  disabled={pending}
                  className={inputClasses}
                />
                <p className="text-xs text-slate-500">
                  {sireTemperamentNotes.length}/500 characters
                </p>
              </div>
            </div>
          </div>

          {/* Dam Notes Section */}
          <div className="col-span-full">
            <h3 className="mb-4 text-sm font-semibold text-white">Dam / Mother Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="damWeightNotes" className={labelClasses}>
                  Weight Notes (optional)
                </label>
                <input
                  id="damWeightNotes"
                  name="damWeightNotes"
                  type="text"
                  maxLength={200}
                  value={damWeightNotes}
                  onChange={(e) => setDamWeightNotes(e.target.value)}
                  placeholder="e.g., 24 lbs, petite frame"
                  disabled={pending}
                  className={inputClasses}
                />
                <p className="text-xs text-slate-500">{damWeightNotes.length}/200 characters</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="damColorNotes" className={labelClasses}>
                  Color Notes (optional)
                </label>
                <input
                  id="damColorNotes"
                  name="damColorNotes"
                  type="text"
                  maxLength={200}
                  value={damColorNotes}
                  onChange={(e) => setDamColorNotes(e.target.value)}
                  placeholder="e.g., Cream with dark points"
                  disabled={pending}
                  className={inputClasses}
                />
                <p className="text-xs text-slate-500">{damColorNotes.length}/200 characters</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="damHealthNotes" className={labelClasses}>
                  Health Notes (optional)
                </label>
                <input
                  id="damHealthNotes"
                  name="damHealthNotes"
                  type="text"
                  maxLength={200}
                  value={damHealthNotes}
                  onChange={(e) => setDamHealthNotes(e.target.value)}
                  placeholder="e.g., DNA health tested clear"
                  disabled={pending}
                  className={inputClasses}
                />
                <p className="text-xs text-slate-500">{damHealthNotes.length}/200 characters</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="damTemperamentNotes" className={labelClasses}>
                  Temperament Notes (optional)
                </label>
                <textarea
                  id="damTemperamentNotes"
                  name="damTemperamentNotes"
                  maxLength={500}
                  rows={3}
                  value={damTemperamentNotes}
                  onChange={(e) => setDamTemperamentNotes(e.target.value)}
                  placeholder="e.g., Sweet, playful, excellent mother..."
                  disabled={pending}
                  className={inputClasses}
                />
                <p className="text-xs text-slate-500">
                  {damTemperamentNotes.length}/500 characters
                </p>
              </div>
            </div>
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
              <p className="text-xs text-red-400">{fieldError('photoUrls')}</p>
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
            <label htmlFor="description" className={labelClasses}>
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Enter puppy description, temperament, special features, etc."
              disabled={pending}
              className={`${inputClasses} resize-y`}
            />
            {fieldError('description') ? (
              <p className="text-xs text-red-400">{fieldError('description')}</p>
            ) : null}
          </div>

          {state.formError ? (
            <div className="col-span-full rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {state.formError}
            </div>
          ) : null}

          <div className="col-span-full flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={pending || isUploading}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-400 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? 'Uploading photos...' : pending ? 'Saving...' : 'Create puppy'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (pending) return;
                setIsOpen(false);
              }}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
