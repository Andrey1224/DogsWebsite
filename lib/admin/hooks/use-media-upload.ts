"use client";

import { useState } from "react";
import { getSignedUploadUrl, getPublicUrl } from "@/app/admin/(dashboard)/puppies/upload-actions";

export type UploadProgress = {
  fileName: string;
  progress: number; // 0-100
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  publicUrl?: string;
};

export type UploadResult = {
  success: boolean;
  publicUrl?: string;
  error?: string;
};

/**
 * Hook for uploading files directly to Supabase Storage
 * Uses signed URLs to bypass Server Action file size limits
 */
export function useMediaUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<Map<string, UploadProgress>>(new Map());

  /**
   * Upload a single file to Supabase Storage
   */
  const uploadFile = async (
    file: File,
    storagePath: string
  ): Promise<UploadResult> => {
    try {
      // Update progress: pending
      setProgress((prev) => {
        const next = new Map(prev);
        next.set(file.name, {
          fileName: file.name,
          progress: 0,
          status: "pending",
        });
        return next;
      });

      // Get signed upload URL from server
      const { signedUrl, path } = await getSignedUploadUrl(storagePath);

      // Update progress: uploading
      setProgress((prev) => {
        const next = new Map(prev);
        next.set(file.name, {
          fileName: file.name,
          progress: 10,
          status: "uploading",
        });
        return next;
      });

      // Upload file directly to Supabase Storage
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
          "x-upsert": "false",
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      // Update progress: getting public URL
      setProgress((prev) => {
        const next = new Map(prev);
        next.set(file.name, {
          fileName: file.name,
          progress: 90,
          status: "uploading",
        });
        return next;
      });

      // Get public URL
      const publicUrl = await getPublicUrl(path);

      // Update progress: completed
      setProgress((prev) => {
        const next = new Map(prev);
        next.set(file.name, {
          fileName: file.name,
          progress: 100,
          status: "completed",
          publicUrl,
        });
        return next;
      });

      return {
        success: true,
        publicUrl,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";

      // Update progress: error
      setProgress((prev) => {
        const next = new Map(prev);
        next.set(file.name, {
          fileName: file.name,
          progress: 0,
          status: "error",
          error: errorMessage,
        });
        return next;
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  /**
   * Upload multiple files to Supabase Storage
   * Returns array of public URLs in the same order as input files
   */
  const uploadFiles = async (
    files: File[],
    baseStoragePath: string
  ): Promise<string[]> => {
    setIsUploading(true);
    setProgress(new Map());

    const results: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now();
        const fileExt = file.name.split(".").pop() ?? "jpg";
        const storagePath = `${baseStoragePath}/${timestamp}-${i}.${fileExt}`;

        const result = await uploadFile(file, storagePath);

        if (result.success && result.publicUrl) {
          results.push(result.publicUrl);
        } else {
          throw new Error(result.error ?? `Failed to upload ${file.name}`);
        }
      }

      return results;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Clear upload progress state
   */
  const clearProgress = () => {
    setProgress(new Map());
  };

  return {
    uploadFiles,
    uploadFile,
    isUploading,
    progress: Array.from(progress.values()),
    clearProgress,
  };
}
