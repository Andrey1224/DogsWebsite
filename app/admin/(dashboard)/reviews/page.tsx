import { ReviewAdminPanel } from '@/components/admin/reviews/review-admin-panel';
import { mockReviews } from '@/lib/reviews/mock-data';

export default function AdminReviewsPage() {
  return (
    <div className="space-y-8 text-white">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Admin Console
        </p>
        <div>
          <h2 className="text-3xl font-bold">Review moderation</h2>
          <p className="text-sm text-slate-400">
            Publish, feature, edit, or delete customer stories.
          </p>
        </div>
      </div>

      <ReviewAdminPanel initialReviews={mockReviews} />
    </div>
  );
}
