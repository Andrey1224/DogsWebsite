'use server';

import { getAdminSession } from '@/lib/admin/session';
import { getAdminSupabaseClient } from '@/lib/admin/supabase';

async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

/**
 * Generate a signed upload URL for direct client-side upload to Supabase Storage
 * @param filePath - Full path in storage bucket (e.g., "puppy-123/sire/photo-0.jpg")
 * @returns Signed upload URL and path
 */
export async function getSignedUploadUrl(filePath: string) {
  await requireAdminSession();

  const supabase = getAdminSupabaseClient();

  // Generate signed upload URL (valid for 60 seconds)
  const { data, error } = await supabase.storage.from('puppies').createSignedUploadUrl(filePath);

  if (error) {
    console.error('Failed to create signed upload URL:', error);
    throw new Error(`Failed to create upload URL: ${error.message}`);
  }

  return {
    signedUrl: data.signedUrl,
    path: data.path,
    token: data.token,
  };
}

/**
 * Get public URL for an uploaded file
 * @param path - Storage path of the file
 * @returns Public URL
 */
export async function getPublicUrl(path: string) {
  await requireAdminSession();

  const supabase = getAdminSupabaseClient();

  const {
    data: { publicUrl },
  } = supabase.storage.from('puppies').getPublicUrl(path);

  return publicUrl;
}
