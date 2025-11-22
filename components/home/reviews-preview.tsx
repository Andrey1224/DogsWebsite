import { ReviewCarousel } from '@/components/reviews/review-carousel';
import { getFeaturedReviews } from '@/lib/reviews/queries';

export async function ReviewsPreview() {
  const reviews = await getFeaturedReviews();
  return <ReviewCarousel reviews={reviews} />;
}
