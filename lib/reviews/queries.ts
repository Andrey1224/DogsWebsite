import { cache } from 'react';

import { computeAggregate, mockFeaturedReviews, mockPublishedReviews } from './mock-data';
import type { Review, ReviewAggregate } from './types';

const resolvePublishedReviews = cache(async (): Promise<Review[]> => mockPublishedReviews);

const resolveFeaturedReviews = cache(async (): Promise<Review[]> => mockFeaturedReviews);

export async function getPublishedReviews(): Promise<Review[]> {
  return resolvePublishedReviews();
}

export async function getFeaturedReviews(): Promise<Review[]> {
  return resolveFeaturedReviews();
}

export function getAggregate(reviews: Review[]): ReviewAggregate {
  return computeAggregate(reviews);
}
