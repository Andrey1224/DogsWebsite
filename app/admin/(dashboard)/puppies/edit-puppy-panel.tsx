'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef, useState, useTransition, type ReactNode } from 'react';
import { AlertCircle, Calendar, Lock, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { ParentPhotoUpload } from '@/components/admin/parent-photo-upload';
import { useMediaUpload } from '@/lib/admin/hooks/use-media-upload';
import { fetchPuppyForEditAction, updatePuppyAction } from './actions';
import { initialUpdatePuppyState, type UpdatePuppyState } from './types';

type StatusOption = {
  value: string;
  label: string;
};

interface EditPuppyPanelProps {
  puppyId: string;
  statusOptions: StatusOption[];
  onClose: () => void;
}

export function EditPuppyPanel({ puppyId, statusOptions, onClose }: EditPuppyPanelProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const processedSuccessRef = useRef(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form fields state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState(''); // Read-only
  const [status, setStatus] = useState(statusOptions[0]?.value ?? 'available');
  const [priceUsd, setPriceUsd] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState('');
  const [color, setColor] = useState('');
  const [weightOz, setWeightOz] = useState('');
  const [description, setDescription] = useState('');
  const [sireName, setSireName] = useState('');
  const [damName, setDamName] = useState('');

  // Parent notes state
  const [sireWeightNotes, setSireWeightNotes] = useState('');
  const [sireColorNotes, setSireColorNotes] = useState('');
  const [sireHealthNotes, setSireHealthNotes] = useState('');
  const [sireTemperamentNotes, setSireTemperamentNotes] = useState('');
  const [damWeightNotes, setDamWeightNotes] = useState('');
  const [damColorNotes, setDamColorNotes] = useState('');
  const [damHealthNotes, setDamHealthNotes] = useState('');
  const [damTemperamentNotes, setDamTemperamentNotes] = useState('');

  // File upload state
  const { uploadFiles, isUploading } = useMediaUpload();

  // Existing photo URLs (from database)
  const [existingSirePhotoUrls, setExistingSirePhotoUrls] = useState<string[]>([]);
  const [existingDamPhotoUrls, setExistingDamPhotoUrls] = useState<string[]>([]);
  const [existingPuppyPhotoUrls, setExistingPuppyPhotoUrls] = useState<string[]>([]);

  // Photos marked for deletion
  const [deletedSirePhotos, setDeletedSirePhotos] = useState<Set<string>>(new Set());
  const [deletedDamPhotos, setDeletedDamPhotos] = useState<Set<string>>(new Set());
  const [deletedPuppyPhotos, setDeletedPuppyPhotos] = useState<Set<string>>(new Set());

  // New files to upload
  const [sireFiles, setSireFiles] = useState<File[]>([]);
  const [damFiles, setDamFiles] = useState<File[]>([]);
  const [puppyFiles, setPuppyFiles] = useState<File[]>([]);

  // Form submission state using useActionState
  const [formState, formAction, isPending] = useActionState<UpdatePuppyState, FormData>(
    updatePuppyAction,
    initialUpdatePuppyState,
  );
  const [isTransitioning, startTransition] = useTransition();

  // Derived values for display
  const visibleSirePhotos = existingSirePhotoUrls.filter((url) => !deletedSirePhotos.has(url));
  const visibleDamPhotos = existingDamPhotoUrls.filter((url) => !deletedDamPhotos.has(url));
  const visiblePuppyPhotos = existingPuppyPhotoUrls.filter((url) => !deletedPuppyPhotos.has(url));
  const galleryCount = visiblePuppyPhotos.length + puppyFiles.length;

  const inputClasses =
    'w-full rounded-xl border border-slate-800 bg-[#0F172A] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-60';
  const labelClasses = 'text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400';
  const helperTextClasses = 'text-xs text-slate-500';
  const sectionHeadingClasses =
    'flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400';
  const busy = isPending || isTransitioning || isUploading;

  // Load puppy data on mount
  useEffect(() => {
    const loadPuppyData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const result = await fetchPuppyForEditAction(puppyId);

        if (!result.success || !result.puppy) {
          setLoadError(result.error || 'Puppy not found');
          toast.error(result.error || 'Puppy not found');
          return;
        }

        const puppy = result.puppy;

        // Pre-populate form fields
        setName(puppy.name || '');
        setSlug(puppy.slug || '');
        setStatus(puppy.status || 'available');
        setPriceUsd(puppy.price_usd !== null ? String(puppy.price_usd) : '');
        setBirthDate(puppy.birth_date || '');
        setBreed(puppy.breed || '');
        setSex(puppy.sex || '');
        setColor(puppy.color || '');
        setWeightOz(puppy.weight_oz !== null ? String(puppy.weight_oz) : '');
        setDescription(puppy.description || '');
        setSireName(puppy.sire_name || '');
        setDamName(puppy.dam_name || '');

        // Load parent notes
        setSireWeightNotes(puppy.sire_weight_notes || '');
        setSireColorNotes(puppy.sire_color_notes || '');
        setSireHealthNotes(puppy.sire_health_notes || '');
        setSireTemperamentNotes(puppy.sire_temperament_notes || '');
        setDamWeightNotes(puppy.dam_weight_notes || '');
        setDamColorNotes(puppy.dam_color_notes || '');
        setDamHealthNotes(puppy.dam_health_notes || '');
        setDamTemperamentNotes(puppy.dam_temperament_notes || '');

        // Set existing photos
        setExistingSirePhotoUrls(puppy.sire_photo_urls || []);
        setExistingDamPhotoUrls(puppy.dam_photo_urls || []);
        setExistingPuppyPhotoUrls(puppy.photo_urls || []);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load puppy data';
        setLoadError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadPuppyData();
  }, [puppyId]);

  // Handle form success/error
  useEffect(() => {
    if (formState.status === 'success' && !processedSuccessRef.current) {
      processedSuccessRef.current = true;
      toast.success('Puppy updated successfully');
      router.refresh();
      onClose();
    } else if (formState.status === 'error' && formState.formError) {
      toast.error(formState.formError);
    }

    if (formState.status === 'idle') {
      processedSuccessRef.current = false;
    }
  }, [formState, router, onClose]);

  const fieldError = (field: string) => formState.fieldErrors?.[field]?.[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;

    try {
      const tempId = puppyId; // Use existing puppy ID for storage paths

      // Upload new photos
      let newSirePhotoUrls: string[] = [];
      let newDamPhotoUrls: string[] = [];
      let newPuppyPhotoUrls: string[] = [];

      if (sireFiles.length > 0) {
        toast.info('Uploading sire photos...');
        newSirePhotoUrls = await uploadFiles(sireFiles, `${tempId}/sire`);
      }

      if (damFiles.length > 0) {
        toast.info('Uploading dam photos...');
        newDamPhotoUrls = await uploadFiles(damFiles, `${tempId}/dam`);
      }

      if (puppyFiles.length > 0) {
        toast.info('Uploading puppy photos...');
        newPuppyPhotoUrls = await uploadFiles(puppyFiles, `${tempId}/gallery`);
      }

      // Combine existing (not deleted) + new photos
      const finalSirePhotos = [...visibleSirePhotos, ...newSirePhotoUrls];
      const finalDamPhotos = [...visibleDamPhotos, ...newDamPhotoUrls];
      const finalPuppyPhotos = [...visiblePuppyPhotos, ...newPuppyPhotoUrls];

      // Build FormData without File objects
      const rawFormData = new FormData(formElement);
      const filteredFormData = new FormData();

      // Add puppy ID
      filteredFormData.append('id', puppyId);

      // Copy non-file fields
      rawFormData.forEach((value, key) => {
        if (!(value instanceof File)) {
          filteredFormData.append(key, value);
        }
      });

      // Add photo URLs
      filteredFormData.delete('sirePhotoUrls');
      finalSirePhotos.forEach((url) => {
        filteredFormData.append('sirePhotoUrls', url);
      });

      filteredFormData.delete('damPhotoUrls');
      finalDamPhotos.forEach((url) => {
        filteredFormData.append('damPhotoUrls', url);
      });

      filteredFormData.delete('photoUrls');
      finalPuppyPhotos.forEach((url) => {
        filteredFormData.append('photoUrls', url);
      });

      // Call the form action wrapped in startTransition
      startTransition(() => {
        formAction(filteredFormData);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast.error(errorMessage);
    }
  };

  const handleDeletePhoto = (url: string, type: 'sire' | 'dam' | 'puppy') => {
    if (type === 'sire') {
      setDeletedSirePhotos((prev) => new Set(prev).add(url));
    } else if (type === 'dam') {
      setDeletedDamPhotos((prev) => new Set(prev).add(url));
    } else {
      setDeletedPuppyPhotos((prev) => new Set(prev).add(url));
    }
  };

  const panelHeader = (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-[#0B1120]/90 px-6 py-4 backdrop-blur-xl">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">Edit Puppy</h2>
          <span className="max-w-[240px] truncate rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-[11px] font-mono uppercase tracking-wide text-slate-300">
            ID: {puppyId}
          </span>
        </div>
        <p className="text-sm text-slate-400">Update details, pricing, and media.</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full border border-transparent bg-slate-800/70 p-2 text-slate-300 transition hover:border-slate-700 hover:bg-slate-700 hover:text-white"
        aria-label="Close panel"
      >
        <X size={18} />
      </button>
    </div>
  );

  const renderShell = (body: ReactNode) => (
    <div className="fixed inset-x-0 inset-y-10 z-50 flex justify-end sm:inset-x-4 sm:inset-y-12">
      <div
        className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex h-full max-h-[calc(100vh-80px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1120] shadow-2xl">
        {panelHeader}
        {body}
      </div>
    </div>
  );

  if (loadError) {
    return renderShell(
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-[#0F172A] px-6 py-8 text-center text-white">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-300">
            <AlertCircle size={24} />
          </div>
          <p className="text-sm text-slate-200">{loadError}</p>
          <p className={helperTextClasses}>Close the panel and try again.</p>
        </div>
      </div>,
    );
  }

  if (isLoading) {
    return renderShell(
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#0F172A] px-5 py-4 text-slate-200">
          <span className="h-3 w-3 animate-ping rounded-full bg-orange-500" />
          <p className="text-sm">Loading puppy data...</p>
        </div>
      </div>,
    );
  }

  return renderShell(
    <form ref={formRef} onSubmit={handleSubmit} className="flex h-full flex-col text-white">
      <div className="flex-1 space-y-8 overflow-y-auto px-6 pb-8 pt-6">
        {/* Core Details */}
        <section className="space-y-5">
          <p className={sectionHeadingClasses}>
            <span className="h-px w-8 bg-orange-500" /> Core Details
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-slate-100">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClasses}
                aria-describedby={fieldError('name') ? 'name-error' : undefined}
                aria-invalid={!!fieldError('name')}
              />
              {fieldError('name') ? (
                <p id="name-error" className="text-[11px] text-red-400">
                  {fieldError('name')}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="slug"
                className="flex items-center gap-2 text-sm font-semibold text-slate-300"
              >
                Slug (read-only) <Lock size={14} className="text-slate-500" />
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                value={slug}
                readOnly
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-[#111827] px-4 py-3 text-sm text-slate-500"
                aria-describedby="slug-hint"
              />
              <p id="slug-hint" className={helperTextClasses}>
                Slug cannot be changed after creation to prevent SEO issues.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-semibold text-slate-100">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`${inputClasses} cursor-pointer`}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="priceUsd" className="text-sm font-semibold text-slate-100">
                Price (USD)
              </label>
              <input
                id="priceUsd"
                name="priceUsd"
                type="number"
                step="0.01"
                min="0"
                placeholder="3000"
                value={priceUsd}
                onChange={(e) => setPriceUsd(e.target.value)}
                className={`${inputClasses} font-mono`}
                aria-describedby={fieldError('priceUsd') ? 'priceUsd-error' : undefined}
                aria-invalid={!!fieldError('priceUsd')}
              />
              {fieldError('priceUsd') ? (
                <p id="priceUsd-error" className="text-[11px] text-red-400">
                  {fieldError('priceUsd')}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <div className="h-px rounded-full bg-slate-800/70" />

        {/* Physical Traits */}
        <section className="space-y-4">
          <p className={sectionHeadingClasses}>
            <span className="h-px w-8 bg-blue-500" /> Physical Traits
          </p>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="birthDate" className={labelClasses}>
                Birth Date
              </label>
              <div className="relative">
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className={`${inputClasses} pr-10`}
                  aria-describedby={fieldError('birthDate') ? 'birthDate-error' : undefined}
                  aria-invalid={!!fieldError('birthDate')}
                />
                <Calendar
                  size={16}
                  className="pointer-events-none absolute right-3 top-3 text-slate-500"
                />
              </div>
              {fieldError('birthDate') ? (
                <p id="birthDate-error" className="text-[11px] text-red-400">
                  {fieldError('birthDate')}
                </p>
              ) : null}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label htmlFor="breed" className={labelClasses}>
                Breed
              </label>
              <select
                id="breed"
                name="breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className={`${inputClasses} cursor-pointer`}
              >
                <option value="">Select breed</option>
                <option value="french_bulldog">French Bulldog</option>
                <option value="english_bulldog">English Bulldog</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="sex" className={labelClasses}>
                Sex
              </label>
              <select
                id="sex"
                name="sex"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className={`${inputClasses} cursor-pointer`}
              >
                <option value="">Select sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="color" className={labelClasses}>
                Color
              </label>
              <input
                id="color"
                name="color"
                type="text"
                placeholder="Lilac, Blue, etc."
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label htmlFor="weightOz" className={labelClasses}>
                Weight (oz)
              </label>
              <input
                id="weightOz"
                name="weightOz"
                type="number"
                step="1"
                min="0"
                placeholder="24"
                value={weightOz}
                onChange={(e) => setWeightOz(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className={labelClasses}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe the puppy's personality, health, and features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClasses} min-h-[120px] resize-none leading-relaxed`}
            />
          </div>
        </section>

        <div className="h-px rounded-full bg-slate-800/70" />

        {/* Parent Information */}
        <section className="space-y-4">
          <p className={sectionHeadingClasses}>
            <span className="h-px w-8 bg-purple-500" /> Lineage & Parents
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="sireName" className={labelClasses}>
                Sire Name (Dad)
              </label>
              <input
                id="sireName"
                name="sireName"
                type="text"
                placeholder="Optional"
                value={sireName}
                onChange={(e) => setSireName(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="damName" className={labelClasses}>
                Dam Name (Mom)
              </label>
              <input
                id="damName"
                name="damName"
                type="text"
                placeholder="Optional"
                value={damName}
                onChange={(e) => setDamName(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Sire Photos</p>
                  <p className={helperTextClasses}>Up to 2 photos</p>
                </div>
                <span className="text-xs text-slate-500">
                  {visibleSirePhotos.length + sireFiles.length}/2
                </span>
              </div>
              <ParentPhotoUpload
                parentType="sire"
                label=""
                maxFiles={2}
                existingPhotos={visibleSirePhotos}
                onDeleteExisting={(url) => handleDeletePhoto(url, 'sire')}
                files={sireFiles}
                onFilesChange={setSireFiles}
                disabled={busy}
                isUploading={isUploading}
              />
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Dam Photos</p>
                  <p className={helperTextClasses}>Up to 2 photos</p>
                </div>
                <span className="text-xs text-slate-500">
                  {visibleDamPhotos.length + damFiles.length}/2
                </span>
              </div>
              <ParentPhotoUpload
                parentType="dam"
                label=""
                maxFiles={2}
                existingPhotos={visibleDamPhotos}
                onDeleteExisting={(url) => handleDeletePhoto(url, 'dam')}
                files={damFiles}
                onFilesChange={setDamFiles}
                disabled={busy}
                isUploading={isUploading}
              />
            </div>
          </div>

          {/* Sire Notes Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Sire / Father Details</h3>
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
                  disabled={busy}
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
                  disabled={busy}
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
                  disabled={busy}
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
                  disabled={busy}
                  className={inputClasses}
                />
                <p className="text-xs text-slate-500">
                  {sireTemperamentNotes.length}/500 characters
                </p>
              </div>
            </div>
          </div>

          {/* Dam Notes Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Dam / Mother Details</h3>
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
                  disabled={busy}
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
                  disabled={busy}
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
                  disabled={busy}
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
                  disabled={busy}
                  className={inputClasses}
                />
                <p className="text-xs text-slate-500">
                  {damTemperamentNotes.length}/500 characters
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px rounded-full bg-slate-800/70" />

        {/* Puppy Gallery */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className={sectionHeadingClasses}>
              <span className="h-px w-8 bg-orange-400" /> Puppy Gallery
            </p>
            <span className="text-xs text-slate-500">{galleryCount}/3 photos</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-4">
            <ParentPhotoUpload
              label=""
              maxFiles={3}
              existingPhotos={visiblePuppyPhotos}
              onDeleteExisting={(url) => handleDeletePhoto(url, 'puppy')}
              files={puppyFiles}
              onFilesChange={setPuppyFiles}
              disabled={busy}
              isUploading={isUploading}
            />
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2.5">
              <AlertCircle size={16} className="mt-[2px] text-blue-300" />
              <p className="text-xs text-blue-100/80">
                Drag-and-drop ordering coming soon. The first photo becomes the main cover image.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-slate-800 bg-[#0B1120]/95 backdrop-blur-xl px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="w-full rounded-xl border border-slate-800 bg-slate-800/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-700 sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:from-purple-500 hover:to-orange-400 sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex items-center justify-center gap-2">
              <Save size={16} />
              {busy ? 'Saving...' : 'Save Changes'}
            </span>
          </button>
        </div>
      </div>
    </form>,
  );
}
