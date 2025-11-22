'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface ParentPhotoUploadProps {
  parentType?: 'sire' | 'dam';
  /**
   * Override the default label text (otherwise derived from parentType)
   */
  label?: string;
  /**
   * Override the hidden field / input id (otherwise derived from parentType)
   */
  inputName?: string;
  /**
   * Helper copy displayed beneath the uploader
   */
  helpText?: string;
  /**
   * Optional max file count (defaults to 3)
   */
  maxFiles?: number;
  disabled?: boolean;
  /**
   * Callback when files are selected and ready to upload
   * Parent component should call uploadFiles() when ready
   */
  onFilesSelected?: (files: File[]) => void;
  /**
   * Uploaded photo URLs (controlled by parent)
   */
  uploadedUrls?: string[];
  /**
   * Upload progress (0-100)
   */
  uploadProgress?: number;
  /**
   * Whether upload is in progress
   */
  isUploading?: boolean;
  /**
   * Existing photos from database (for edit mode)
   */
  existingPhotos?: string[];
  /**
   * Callback when existing photo should be deleted
   */
  onDeleteExisting?: (url: string) => void;
  /**
   * Controlled files state (for edit mode)
   */
  files?: File[];
  /**
   * Callback to update files state
   */
  onFilesChange?: (files: File[]) => void;
}

export function ParentPhotoUpload({
  parentType,
  label,
  inputName,
  helpText,
  maxFiles = 3,
  disabled,
  onFilesSelected,
  uploadedUrls = [],
  uploadProgress = 0,
  isUploading = false,
  existingPhotos = [],
  onDeleteExisting,
  files,
  onFilesChange,
}: ParentPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Use controlled files if provided, otherwise use internal state
  const effectiveFiles = files ?? selectedFiles;
  const updateFiles = onFilesChange ?? setSelectedFiles;

  const fallbackLabel =
    parentType === 'dam' ? 'Dam Photos' : parentType === 'sire' ? 'Sire Photos' : 'Photos';
  const resolvedLabel = label ?? fallbackLabel;
  const resolvedInputName =
    inputName ??
    (parentType === 'dam' ? 'damPhotoUrls' : parentType === 'sire' ? 'sirePhotoUrls' : 'photoUrls');
  const resolvedHelpText = helpText ?? 'Accepted formats: JPG, PNG, WebP. Maximum 3 photos.';
  const showLabel = resolvedLabel.trim().length > 0;
  const altLabel = showLabel ? resolvedLabel : fallbackLabel;

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);

    // Calculate how many files can be added
    const currentCount = existingPhotos.length + effectiveFiles.length;
    const availableSlots = maxFiles - currentCount;
    const limitedFiles = newFiles.slice(0, availableSlots);

    // Create preview URLs
    const newPreviews = limitedFiles.map((file) => URL.createObjectURL(file));

    // Clean up old previews
    previews.forEach((url) => URL.revokeObjectURL(url));

    setPreviews(newPreviews);
    updateFiles(limitedFiles);

    // Notify parent component
    onFilesSelected?.(limitedFiles);
  };

  const handleRemove = (index: number) => {
    if (!fileInputRef.current) return;

    // Remove the preview
    const newPreviews = previews.filter((_, i) => i !== index);
    const newFiles = effectiveFiles.filter((_, i) => i !== index);

    // Clean up removed preview URL
    URL.revokeObjectURL(previews[index]);

    setPreviews(newPreviews);
    updateFiles(newFiles);

    // Clear the file input
    fileInputRef.current.value = '';

    // Notify parent component
    onFilesSelected?.(newFiles);
  };

  // Show either previews (before upload) or uploaded URLs (after upload)
  const displayImages = uploadedUrls.length > 0 ? uploadedUrls : previews;
  const showUploadProgress = isUploading && uploadProgress > 0;

  const totalPhotos = existingPhotos.length + effectiveFiles.length;
  const canAddMore = totalPhotos < maxFiles;

  return (
    <div className="space-y-3 text-slate-100">
      {showLabel ? (
        <label
          htmlFor={`${resolvedInputName}-file`}
          className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400"
        >
          {resolvedLabel} {maxFiles ? `(${totalPhotos}/${maxFiles})` : null}
        </label>
      ) : null}

      {/* Existing photos section */}
      {existingPhotos.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {existingPhotos.map((url) => (
            <div key={url} className="relative">
              <Image
                src={url}
                alt={`Existing ${altLabel}`}
                width={96}
                height={96}
                className="h-24 w-24 rounded-xl border border-slate-700 bg-slate-900 object-cover"
                unoptimized
              />
              {onDeleteExisting && (
                <button
                  type="button"
                  onClick={() => onDeleteExisting(url)}
                  disabled={disabled}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] text-white shadow hover:bg-red-600 disabled:opacity-50"
                  aria-label="Delete existing photo"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New files preview */}
      {displayImages.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-3">
          {displayImages.map((imageUrl, index) => (
            <div key={imageUrl} className="relative">
              <Image
                src={imageUrl}
                alt={`${altLabel} ${index + 1}`}
                width={96}
                height={96}
                className="h-24 w-24 rounded-xl border border-slate-700 bg-slate-900 object-cover"
                unoptimized
              />
              {!isUploading && uploadedUrls.length === 0 && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] text-white shadow hover:bg-red-600 disabled:opacity-50"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  ×
                </button>
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload progress bar */}
      {showUploadProgress && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-purple-500 transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* File input - only show if can add more */}
      {canAddMore && (
        <input
          ref={fileInputRef}
          type="file"
          id={`${resolvedInputName}-file`}
          accept="image/*"
          multiple
          disabled={disabled || isUploading}
          onChange={handleFileChange}
          className="block w-full cursor-pointer rounded-xl border border-dashed border-slate-700 bg-[#0B1120] px-4 py-3 text-sm text-slate-400 transition hover:border-orange-500 file:mr-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-orange-500 file:to-orange-600 file:px-4 file:py-2 file:text-white file:font-semibold file:shadow-orange-500/20 hover:file:from-orange-400 hover:file:to-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
        />
      )}

      <p className="text-xs text-slate-500">{resolvedHelpText}</p>
    </div>
  );
}
