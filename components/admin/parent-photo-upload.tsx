"use client";

import Image from "next/image";
import { useRef, useState } from "react";

interface ParentPhotoUploadProps {
  parentType: "sire" | "dam";
  disabled?: boolean;
}

export function ParentPhotoUpload({ parentType, disabled }: ParentPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    // Limit to 3 files
    const limitedFiles = files.slice(0, 3);

    // Create preview URLs
    const newPreviews = limitedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleRemove = (index: number) => {
    if (!fileInputRef.current) return;

    // Remove the preview
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);

    // Clear the file input and recreate with remaining files would be complex
    // Instead, we'll clear it and the user can re-select
    fileInputRef.current.value = "";

    // Clean up object URL
    URL.revokeObjectURL(previews[index]);
  };

  const label = parentType === "sire" ? "Sire Photos" : "Dam Photos";
  const inputName = parentType === "sire" ? "sirePhotos" : "damPhotos";

  return (
    <div className="space-y-2">
      <label htmlFor={inputName} className="block text-sm font-medium">
        {label} (up to 3)
      </label>

      <input
        ref={fileInputRef}
        type="file"
        id={inputName}
        name={inputName}
        accept="image/*"
        multiple
        disabled={disabled}
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-accent-gradient file:text-white hover:file:opacity-90 disabled:opacity-50"
      />

      {previews.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {previews.map((preview, index) => (
            <div key={preview} className="relative">
              <Image
                src={preview}
                alt={`${label} preview ${index + 1}`}
                width={80}
                height={80}
                className="w-20 h-20 object-cover rounded border border-border"
                unoptimized
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
                aria-label={`Remove photo ${index + 1}`}
              >
                ×
              </button>
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
