'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { ParentPhotoUpload } from '@/components/admin/parent-photo-upload';
import { useMediaUpload } from '@/lib/admin/hooks/use-media-upload';
import { fetchPuppyForEditAction, updatePuppyAction } from './actions';
import type { UpdatePuppyState } from './types';

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

  // Form submission state
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<UpdatePuppyState>({
    status: 'idle',
  });

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

    startTransition(async () => {
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
        const finalSirePhotos = [
          ...existingSirePhotoUrls.filter((url) => !deletedSirePhotos.has(url)),
          ...newSirePhotoUrls,
        ];
        const finalDamPhotos = [
          ...existingDamPhotoUrls.filter((url) => !deletedDamPhotos.has(url)),
          ...newDamPhotoUrls,
        ];
        const finalPuppyPhotos = [
          ...existingPuppyPhotoUrls.filter((url) => !deletedPuppyPhotos.has(url)),
          ...newPuppyPhotoUrls,
        ];

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

        // Call the server action directly
        const result = await updatePuppyAction(formState, filteredFormData);
        setFormState(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        toast.error(errorMessage);
        setFormState({
          status: 'error',
          formError: errorMessage,
        });
      }
    });
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

  if (loadError) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-bg shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-text">Edit Puppy</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition hover:bg-hover hover:text-text"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-muted">{loadError}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-bg shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-text">Edit Puppy</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition hover:bg-hover hover:text-text"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-muted">Loading puppy data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col overflow-y-auto bg-bg shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg px-6 py-4">
        <h2 className="text-lg font-semibold text-text">Edit Puppy</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-muted transition hover:bg-hover hover:text-text"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-text">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              aria-describedby={fieldError('name') ? 'name-error' : undefined}
              aria-invalid={!!fieldError('name')}
            />
            {fieldError('name') ? (
              <p id="name-error" className="text-xs text-red-600">
                {fieldError('name')}
              </p>
            ) : null}
          </div>

          {/* Slug - Read Only */}
          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium text-text">
              Slug (read-only)
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={slug}
              readOnly
              disabled
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted cursor-not-allowed"
              aria-describedby="slug-hint"
            />
            <p id="slug-hint" className="text-xs text-muted">
              Slug cannot be changed after creation
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium text-text">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label htmlFor="priceUsd" className="text-sm font-medium text-text">
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
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              aria-describedby={fieldError('priceUsd') ? 'priceUsd-error' : undefined}
              aria-invalid={!!fieldError('priceUsd')}
            />
            {fieldError('priceUsd') ? (
              <p id="priceUsd-error" className="text-xs text-red-600">
                {fieldError('priceUsd')}
              </p>
            ) : null}
          </div>

          {/* Birth Date */}
          <div className="space-y-2">
            <label htmlFor="birthDate" className="text-sm font-medium text-text">
              Birth Date
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              aria-describedby={fieldError('birthDate') ? 'birthDate-error' : undefined}
              aria-invalid={!!fieldError('birthDate')}
            />
            {fieldError('birthDate') ? (
              <p id="birthDate-error" className="text-xs text-red-600">
                {fieldError('birthDate')}
              </p>
            ) : null}
          </div>

          {/* Breed */}
          <div className="space-y-2">
            <label htmlFor="breed" className="text-sm font-medium text-text">
              Breed
            </label>
            <select
              id="breed"
              name="breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Select breed</option>
              <option value="french_bulldog">French Bulldog</option>
              <option value="english_bulldog">English Bulldog</option>
            </select>
          </div>

          {/* Sex */}
          <div className="space-y-2">
            <label htmlFor="sex" className="text-sm font-medium text-text">
              Sex
            </label>
            <select
              id="sex"
              name="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Select sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <label htmlFor="color" className="text-sm font-medium text-text">
              Color
            </label>
            <input
              id="color"
              name="color"
              type="text"
              placeholder="Lilac, Blue, etc."
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <label htmlFor="weightOz" className="text-sm font-medium text-text">
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
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-text">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Describe the puppy's personality, health, and features..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Parent Information */}
        <div className="space-y-4 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-text">Parent Information</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="sireName" className="text-sm font-medium text-text">
                Sire Name
              </label>
              <input
                id="sireName"
                name="sireName"
                type="text"
                placeholder="Optional"
                value={sireName}
                onChange={(e) => setSireName(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="damName" className="text-sm font-medium text-text">
                Dam Name
              </label>
              <input
                id="damName"
                name="damName"
                type="text"
                placeholder="Optional"
                value={damName}
                onChange={(e) => setDamName(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Sire Photos */}
          <ParentPhotoUpload
            label="Sire Photos"
            maxFiles={2}
            existingPhotos={existingSirePhotoUrls.filter((url) => !deletedSirePhotos.has(url))}
            onDeleteExisting={(url) => handleDeletePhoto(url, 'sire')}
            files={sireFiles}
            onFilesChange={setSireFiles}
          />

          {/* Dam Photos */}
          <ParentPhotoUpload
            label="Dam Photos"
            maxFiles={2}
            existingPhotos={existingDamPhotoUrls.filter((url) => !deletedDamPhotos.has(url))}
            onDeleteExisting={(url) => handleDeletePhoto(url, 'dam')}
            files={damFiles}
            onFilesChange={setDamFiles}
          />
        </div>

        {/* Puppy Gallery */}
        <div className="space-y-4 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-text">Puppy Gallery (max 3 photos)</h3>
          <ParentPhotoUpload
            label="Gallery Photos"
            maxFiles={3}
            existingPhotos={existingPuppyPhotoUrls.filter((url) => !deletedPuppyPhotos.has(url))}
            onDeleteExisting={(url) => handleDeletePhoto(url, 'puppy')}
            files={puppyFiles}
            onFilesChange={setPuppyFiles}
          />
        </div>

        {/* Submit Buttons */}
        <div className="sticky bottom-0 z-10 flex justify-end gap-3 border-t border-border bg-bg pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending || isUploading}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text transition hover:bg-hover disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || isUploading}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isPending || isUploading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
