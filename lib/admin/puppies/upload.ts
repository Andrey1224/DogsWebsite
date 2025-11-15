import 'server-only';

import { getAdminSupabaseClient } from '@/lib/admin/supabase';

/**
 * Upload parent photos to Supabase Storage
 * @param files Array of File objects (max 3)
 * @param parentType 'sire' or 'dam'
 * @param puppyId Unique identifier for the puppy (used in file path)
 * @returns Array of public URLs for uploaded photos
 */
export async function uploadParentPhotos(
  files: File[],
  parentType: 'sire' | 'dam',
  puppyId: string,
): Promise<string[]> {
  const supabase = getAdminSupabaseClient();
  const uploadedUrls: string[] = [];

  // Limit to 3 files
  const limitedFiles = files.slice(0, 3);

  for (let i = 0; i < limitedFiles.length; i++) {
    const file = limitedFiles[i];
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop() ?? 'jpg';
    const fileName = `${puppyId}/${parentType}/${timestamp}-${i}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from('puppies').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error(`Failed to upload ${parentType} photo ${i}:`, error);
      throw new Error(`Failed to upload ${parentType} photo: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('puppies').getPublicUrl(data.path);

    uploadedUrls.push(publicUrl);
  }

  return uploadedUrls;
}

/**
 * Delete parent photos from Supabase Storage
 * @param photoUrls Array of photo URLs to delete
 */
export async function deleteParentPhotos(photoUrls: string[]): Promise<void> {
  if (photoUrls.length === 0) return;

  const supabase = getAdminSupabaseClient();

  // Extract file paths from URLs
  const paths = photoUrls
    .map((url) => {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/puppies/');
      return pathParts[1] ?? '';
    })
    .filter(Boolean);

  if (paths.length === 0) return;

  const { error } = await supabase.storage.from('puppies').remove(paths);

  if (error) {
    console.error('Failed to delete parent photos:', error);
    // Don't throw - deletion is best-effort
  }
}
