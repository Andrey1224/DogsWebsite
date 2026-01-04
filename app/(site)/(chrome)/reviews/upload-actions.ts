'use server';

import crypto from 'node:crypto';

import { createServiceRoleClient } from '@/lib/supabase/client';

const BUCKET_ID = 'reviews';
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

function normalizeExtension(extension: string) {
  const cleaned = extension.trim().toLowerCase().replace(/^\./, '');
  if (!ALLOWED_EXTENSIONS.has(cleaned)) {
    throw new Error('Unsupported file type. Use JPG, PNG, or WebP.');
  }
  return cleaned;
}

function buildObjectPath(extension: string) {
  const timestamp = Date.now();
  const random = crypto.randomUUID();
  return `submissions/${new Date().getUTCFullYear()}/${timestamp}-${random}.${extension}`;
}

export async function createReviewPhotoUploadTarget({ extension }: { extension: string }) {
  const normalizedExtension = normalizeExtension(extension);
  const supabase = createServiceRoleClient();
  const objectPath = buildObjectPath(normalizedExtension);

  const { data, error } = await supabase.storage.from(BUCKET_ID).createSignedUploadUrl(objectPath);

  if (error || !data?.signedUrl || !data?.path) {
    console.error('Failed to create review upload URL', error);
    throw new Error('Unable to prepare upload. Please try again.');
  }

  return {
    signedUrl: data.signedUrl,
    path: data.path,
  };
}

export async function getReviewPhotoPublicUrl(path: string) {
  const supabase = createServiceRoleClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_ID).getPublicUrl(path);

  if (!publicUrl) {
    console.error('Failed to resolve review photo URL for path:', path);
    throw new Error('Unable to finalize photo upload.');
  }

  return publicUrl;
}
