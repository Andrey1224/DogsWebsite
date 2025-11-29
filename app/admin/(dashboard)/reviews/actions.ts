'use server';

import { revalidatePath } from 'next/cache';

import { createServiceRoleClient } from '@/lib/supabase/client';

export async function updateReviewStatusAction(reviewId: string, status: 'published' | 'pending') {
  try {
    const supabase = createServiceRoleClient();

    const { error } = await supabase.from('reviews').update({ status }).eq('id', reviewId);

    if (error) {
      console.error('[Admin Reviews] Failed to update status:', error);
      return { success: false, error: error.message };
    }

    // Revalidate pages that display reviews
    revalidatePath('/admin/reviews');
    revalidatePath('/reviews');

    return { success: true };
  } catch (err) {
    console.error('[Admin Reviews] Unexpected error updating status:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

export async function updateReviewFeaturedAction(reviewId: string, featured: boolean) {
  try {
    const supabase = createServiceRoleClient();

    // First check if review is published
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('status')
      .eq('id', reviewId)
      .single();

    if (fetchError || !review) {
      console.error('[Admin Reviews] Failed to fetch review:', fetchError);
      return { success: false, error: 'Review not found' };
    }

    if (review.status !== 'published' && featured) {
      return { success: false, error: 'Cannot feature an unpublished review' };
    }

    const { error } = await supabase.from('reviews').update({ featured }).eq('id', reviewId);

    if (error) {
      console.error('[Admin Reviews] Failed to update featured status:', error);
      return { success: false, error: error.message };
    }

    // Revalidate pages that display reviews
    revalidatePath('/admin/reviews');
    revalidatePath('/reviews');

    return { success: true };
  } catch (err) {
    console.error('[Admin Reviews] Unexpected error updating featured:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

export async function updateReviewAction(
  reviewId: string,
  data: {
    authorName: string;
    authorLocation?: string | null;
    rating: number;
    body: string;
    visitDate?: string | null;
    photoUrls: string[];
    status: 'published' | 'pending';
    featured: boolean;
  },
) {
  try {
    const supabase = createServiceRoleClient();

    // Map TypeScript fields to database column names
    const updateData: Record<string, unknown> = {
      author_name: data.authorName,
      location: data.authorLocation || '',
      rating: data.rating,
      story: data.body,
      visit_date: data.visitDate || new Date().toISOString().split('T')[0],
      photo_urls: data.photoUrls,
      status: data.status,
      featured: data.featured,
    };

    const { error } = await supabase.from('reviews').update(updateData).eq('id', reviewId);

    if (error) {
      console.error('[Admin Reviews] Failed to update review:', error);
      return { success: false, error: error.message };
    }

    // Revalidate pages
    revalidatePath('/admin/reviews');
    revalidatePath('/reviews');
    revalidatePath('/');

    return { success: true };
  } catch (err) {
    console.error('[Admin Reviews] Unexpected error updating review:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

export async function deleteReviewAction(reviewId: string) {
  try {
    const supabase = createServiceRoleClient();

    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);

    if (error) {
      console.error('[Admin Reviews] Failed to delete review:', error);
      return { success: false, error: error.message };
    }

    // Revalidate pages
    revalidatePath('/admin/reviews');
    revalidatePath('/reviews');

    return { success: true };
  } catch (err) {
    console.error('[Admin Reviews] Unexpected error deleting review:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
}
