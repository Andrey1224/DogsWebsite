export type ReviewSource = 'manual' | 'facebook_manual';

export type Review = {
  id: string;
  source: ReviewSource;
  isPublished: boolean;
  isFeatured: boolean;
  authorName: string;
  authorLocation?: string | null;
  rating: number;
  body: string;
  headline?: string | null;
  visitDate?: string | null;
  photoUrl?: string | null;
  sourceUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReviewAggregate = {
  averageRating: number;
  reviewCount: number;
};

export type ReviewFilters = {
  published?: boolean;
  source?: ReviewSource | 'all';
};
