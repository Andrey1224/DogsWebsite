"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ParentPhotoUploadProps {
  parentType: "sire" | "dam";
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
}

export function ParentPhotoUpload({
  parentType,
  disabled,
  onFilesSelected,
  uploadedUrls = [],
  uploadProgress = 0,
  isUploading = false,
}: ParentPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const label = parentType === "sire" ? "Sire Photos" : "Dam Photos";
  const inputName = parentType === "sire" ? "sirePhotoUrls" : "damPhotoUrls";

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    // Limit to 3 files
    const limitedFiles = files.slice(0, 3);

    // Create preview URLs
    const newPreviews = limitedFiles.map((file) => URL.createObjectURL(file));

    // Clean up old previews
    previews.forEach((url) => URL.revokeObjectURL(url));

    setPreviews(newPreviews);
    setSelectedFiles(limitedFiles);

    // Notify parent component
    onFilesSelected?.(limitedFiles);
  };

  const handleRemove = (index: number) => {
    if (!fileInputRef.current) return;

    // Remove the preview
    const newPreviews = previews.filter((_, i) => i !== index);
    const newFiles = selectedFiles.filter((_, i) => i !== index);

    // Clean up removed preview URL
    URL.revokeObjectURL(previews[index]);

    setPreviews(newPreviews);
    setSelectedFiles(newFiles);

    // Clear the file input
    fileInputRef.current.value = "";

    // Notify parent component
    onFilesSelected?.(newFiles);
  };

  // Show either previews (before upload) or uploaded URLs (after upload)
  const displayImages = uploadedUrls.length > 0 ? uploadedUrls : previews;
  const showUploadProgress = isUploading && uploadProgress > 0;

  return (
    <div className="space-y-2">
      <label htmlFor={inputName} className="block text-sm font-medium">
        {label} (up to 3)
      </label>

      <input
        ref={fileInputRef}
        type="file"
        id={`${inputName}-file`}
        accept="image/*"
        multiple
        disabled={disabled || isUploading}
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-accent-gradient file:text-white hover:file:opacity-90 disabled:opacity-50"
      />

      {/* Hidden inputs to submit uploaded URLs in FormData */}
      {uploadedUrls.map((url, index) => (
        <input
          key={index}
          type="hidden"
          name={inputName}
          value={url}
        />
      ))}

      {/* Upload progress bar */}
      {showUploadProgress && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-accent-gradient h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {displayImages.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {displayImages.map((imageUrl, index) => (
            <div key={imageUrl} className="relative">
              <Image
                src={imageUrl}
                alt={`${label} ${index + 1}`}
                width={80}
                height={80}
                className="w-20 h-20 object-cover rounded border border-border"
                unoptimized
              />
              {!isUploading && uploadedUrls.length === 0 && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  ×
                </button>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted">
        Accepted formats: JPG, PNG, WebP. Maximum 3 photos.
      </p>
    </div>
  );
}
