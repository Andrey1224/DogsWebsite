import { cache } from 'react';

import { computeAggregate, mockFeaturedReviews, mockPublishedReviews } from './mock-data';
import type { Review, ReviewAggregate, ReviewSource } from './types';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type ReviewRow = Database['public']['Tables']['reviews']['Row'];

function mapRowToReview(row: ReviewRow): Review {
  const source = (row.source as ReviewSource) ?? 'form';
  return {
    id: row.id,
    source,
    isPublished: row.status === 'published',
    isFeatured: row.featured ?? false,
    authorName: row.author_name,
    authorLocation: row.location ?? null,
    rating: row.rating,
    body: row.story,
    headline: null,
    visitDate: row.visit_date ?? null,
    photoUrls: Array.isArray(row.photo_urls) ? row.photo_urls : [],
    sourceUrl: null,
    createdAt: row.created_at,
    updatedAt: row.created_at,
  };
}

async function fetchPublishedReviewsFromSupabase(): Promise<Review[] | null> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('[Reviews] Supabase query failed:', error?.message, error);
      console.warn('[Reviews] Falling back to mock published reviews');
      return null;
    }

    return data.map(mapRowToReview);
  } catch (err) {
    console.error('[Reviews] Supabase client error:', err);
    console.warn('[Reviews] Falling back to mock published reviews');
    return null;
  }
}

const resolvePublishedReviews = cache(async (): Promise<Review[]> => {
  const supabaseReviews = await fetchPublishedReviewsFromSupabase();
  if (supabaseReviews && supabaseReviews.length > 0) {
    return supabaseReviews;
  }
  return mockPublishedReviews;
});

async function fetchFeaturedReviewsFromSupabase(): Promise<Review[] | null> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'published')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !data) {
      console.error('[Reviews] Failed to fetch featured reviews:', error?.message, error);
      console.warn('[Reviews] Falling back to mock featured reviews');
      return null;
    }

    return data.map(mapRowToReview);
  } catch (err) {
    console.error('[Reviews] Supabase client error (featured):', err);
    console.warn('[Reviews] Falling back to mock featured reviews');
    return null;
  }
}

const resolveFeaturedReviews = cache(async (): Promise<Review[]> => {
  const supabaseFeatured = await fetchFeaturedReviewsFromSupabase();
  if (supabaseFeatured && supabaseFeatured.length > 0) {
    return supabaseFeatured;
  }
  return mockFeaturedReviews;
});

export async function getPublishedReviews(): Promise<Review[]> {
  return resolvePublishedReviews();
}

export async function getFeaturedReviews(): Promise<Review[]> {
  return resolveFeaturedReviews();
}

export function getAggregate(reviews: Review[]): ReviewAggregate {
  return computeAggregate(reviews);
}
