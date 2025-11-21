import { ReviewAdminPanel } from '@/components/admin/reviews/review-admin-panel';
import { mockReviews } from '@/lib/reviews/mock-data';

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-text">Manage reviews</h2>
        <p className="text-sm text-muted">Publish, feature, edit, or delete customer stories.</p>
      </div>

      <ReviewAdminPanel initialReviews={mockReviews} />
    </div>
  );
}
