import { cache } from 'react';

import { createSupabaseClient } from '@/lib/supabase/client';

export type PublishedReview = {
  id: string;
  author: string;
  location: string;
  visitDate: string;
  rating: number;
  story: string;
  createdAt: string;
  photoUrls: string[];
};

async function fetchPublishedReviews(): Promise<PublishedReview[]> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('id, author_name, location, visit_date, rating, story, created_at, photo_urls')
      .eq('status', 'published')
      .order('visit_date', { ascending: false });

    if (error) {
      console.error('Failed to load reviews', error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      author: row.author_name,
      location: row.location,
      visitDate: row.visit_date,
      rating: row.rating,
      story: row.story,
      createdAt: row.created_at,
      photoUrls: Array.isArray(row.photo_urls) ? row.photo_urls : [],
    }));
  } catch (error) {
    console.warn('Supabase client unavailable; returning empty review list.', error);
    return [];
  }
}

export const getPublishedReviews = cache(fetchPublishedReviews);
