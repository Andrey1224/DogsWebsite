import type { Review, ReviewSource } from './types';
import { mockReviews } from './mock-data';
import { createServiceRoleClient } from '@/lib/supabase/client';
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

export async function getReviewsForAdmin(): Promise<Review[]> {
  const hasServiceRole = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE,
  );

  if (!hasServiceRole) {
    console.warn('[Admin Reviews] SUPABASE_SERVICE_ROLE_KEY not configured - using mock data');
    return mockReviews;
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('[Admin Reviews] Supabase query failed:', error?.message, error);
      console.warn('[Admin Reviews] Falling back to mock reviews');
      return mockReviews;
    }

    return data.map(mapRowToReview);
  } catch (err) {
    console.error('[Admin Reviews] Supabase client error:', err);
    console.warn('[Admin Reviews] Falling back to mock reviews');
    return mockReviews;
  }
}
