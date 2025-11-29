'use client';

import { useMemo, useState, useTransition } from 'react';

import type { Review, ReviewSource } from '@/lib/reviews/types';
import {
  updateReviewStatusAction,
  updateReviewFeaturedAction,
  deleteReviewAction,
  updateReviewAction,
} from '@/app/admin/(dashboard)/reviews/actions';

const sourceLabels: Record<ReviewSource, string> = {
  manual: 'EBL Family',
  facebook_manual: 'Facebook',
  form: 'Form',
};

type EditorMode = 'create' | 'edit';

type EditorState = {
  open: boolean;
  mode: EditorMode;
  review?: Review;
};

type ReviewEditorForm = {
  authorName: string;
  authorLocation: string;
  rating: number;
  body: string;
  headline: string;
  visitDate: string;
  photoUrls: string[];
  sourceUrl: string;
  source: ReviewSource;
  isPublished: boolean;
  isFeatured: boolean;
};

type ReviewAdminPanelProps = {
  initialReviews: Review[];
};

function buildDefaultForm(mode: EditorMode, review?: Review): ReviewEditorForm {
  if (mode === 'edit' && review) {
    return {
      authorName: review.authorName,
      authorLocation: review.authorLocation ?? '',
      rating: review.rating,
      body: review.body,
      headline: review.headline ?? '',
      visitDate: review.visitDate ?? '',
      photoUrls: review.photoUrls ?? [],
      sourceUrl: review.sourceUrl ?? '',
      source: review.source,
      isPublished: review.isPublished,
      isFeatured: review.isFeatured,
    };
  }

  return {
    authorName: '',
    authorLocation: '',
    rating: 5,
    body: '',
    headline: '',
    visitDate: '',
    photoUrls: [],
    sourceUrl: '',
    source: 'facebook_manual',
    isPublished: true,
    isFeatured: false,
  };
}

function ReviewEditor({
  mode,
  review,
  onClose,
  onSave,
}: {
  mode: EditorMode;
  review?: Review;
  onClose: () => void;
  onSave: (payload: ReviewEditorForm) => void;
}) {
  const [form, setForm] = useState<ReviewEditorForm>(buildDefaultForm(mode, review));

  const handleChange = (
    key: keyof ReviewEditorForm,
    value: string | number | boolean | string[],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = {
      ...form,
      rating: Number(form.rating) || 1,
      isFeatured: form.isPublished ? form.isFeatured : false,
    } as ReviewEditorForm;
    onSave(normalized);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700/60 bg-[#0f172a] p-6 text-white shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {mode === 'create' ? 'Add Facebook review' : 'Edit review'}
            </p>
            <h3 className="text-xl font-semibold">
              {mode === 'create' ? 'New Facebook import' : review?.headline || review?.authorName}
            </h3>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-700 px-3 py-1 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-200">Name</label>
              <input
                value={form.authorName}
                onChange={(e) => handleChange('authorName', e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-[#0B1120] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="Sarah W."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-200">Location (optional)</label>
              <input
                value={form.authorLocation}
                onChange={(e) => handleChange('authorLocation', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-[#0B1120] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="Huntsville, AL"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-200">Headline (optional)</label>
              <input
                value={form.headline}
                onChange={(e) => handleChange('headline', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-[#0B1120] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="Healthiest pup we have owned"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-200">Visit date (optional)</label>
              <input
                type="date"
                value={form.visitDate}
                onChange={(e) => handleChange('visitDate', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-[#0B1120] px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-200">Rating</label>
              <select
                value={form.rating}
                onChange={(e) => handleChange('rating', Number(e.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-[#0B1120] px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value} stars
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-200">Source URL (optional)</label>
              <input
                value={form.sourceUrl}
                onChange={(e) => handleChange('sourceUrl', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-[#0B1120] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-200">Review body</label>
            <textarea
              value={form.body}
              onChange={(e) => handleChange('body', e.target.value)}
              rows={4}
              required
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-[#0B1120] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="Paste the review text"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-200">
                Photo URLs (optional, one per line)
              </label>
              <textarea
                value={form.photoUrls.join('\n')}
                onChange={(e) =>
                  handleChange(
                    'photoUrls',
                    e.target.value.split('\n').filter((url) => url.trim()),
                  )
                }
                rows={3}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-[#0B1120] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="https://.../reviews/image1.webp&#10;https://.../reviews/image2.webp"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-200">Source</label>
              <select
                value={form.source}
                onChange={(e) => handleChange('source', e.target.value as ReviewSource)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-[#0B1120] px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                disabled={mode === 'create'}
              >
                <option value="manual">Manual</option>
                <option value="facebook_manual">Facebook manual</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => handleChange('isPublished', e.target.checked)}
              />
              Published
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
              <input
                type="checkbox"
                checked={form.isFeatured && form.isPublished}
                onChange={(e) => handleChange('isFeatured', e.target.checked)}
                disabled={!form.isPublished}
              />
              Featured
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-400 hover:to-orange-500"
            >
              {mode === 'create' ? 'Add review' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ReviewAdminPanel({ initialReviews }: ReviewAdminPanelProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [filter, setFilter] = useState<'all' | 'published' | 'pending'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | ReviewSource>('all');
  const [message, setMessage] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>({ open: false, mode: 'create' });
  const [, startTransition] = useTransition();

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const statusMatch =
        filter === 'all' ? true : filter === 'published' ? review.isPublished : !review.isPublished;
      const sourceMatch = sourceFilter === 'all' ? true : review.source === sourceFilter;
      return statusMatch && sourceMatch;
    });
  }, [reviews, filter, sourceFilter]);

  const updateReview = (id: string, updater: (review: Review) => Review) => {
    setReviews((prev) => prev.map((review) => (review.id === id ? updater(review) : review)));
  };

  const handlePublishToggle = async (id: string) => {
    const review = reviews.find((r) => r.id === id);
    if (!review) return;

    const newStatus = review.isPublished ? 'pending' : 'published';

    // Optimistic update
    updateReview(id, (r) => ({
      ...r,
      isPublished: !r.isPublished,
      isFeatured: r.isPublished ? false : r.isFeatured,
      updatedAt: new Date().toISOString(),
    }));

    startTransition(async () => {
      const result = await updateReviewStatusAction(id, newStatus);
      if (!result.success) {
        // Revert on error
        updateReview(id, (r) => ({
          ...r,
          isPublished: review.isPublished,
          isFeatured: review.isFeatured,
        }));
        setMessage(`Error: ${result.error}`);
      } else {
        setMessage(
          `Review ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
        );
      }
    });
  };

  const handleFeatureToggle = async (id: string) => {
    const review = reviews.find((item) => item.id === id);
    if (!review) return;
    if (!review.isPublished) {
      setMessage('Publish the review before featuring it.');
      return;
    }

    const newFeatured = !review.isFeatured;

    // Optimistic update
    updateReview(id, (r) => ({
      ...r,
      isFeatured: newFeatured,
      updatedAt: new Date().toISOString(),
    }));

    startTransition(async () => {
      const result = await updateReviewFeaturedAction(id, newFeatured);
      if (!result.success) {
        // Revert on error
        updateReview(id, (r) => ({
          ...r,
          isFeatured: review.isFeatured,
        }));
        setMessage(`Error: ${result.error}`);
      } else {
        setMessage(`Review ${newFeatured ? 'featured' : 'unfeatured'} successfully`);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review? This cannot be undone.')) {
      return;
    }

    // Optimistic update
    setReviews((prev) => prev.filter((review) => review.id !== id));

    startTransition(async () => {
      const result = await deleteReviewAction(id);
      if (!result.success) {
        // Revert on error - refetch from initial reviews
        setReviews(initialReviews);
        setMessage(`Error: ${result.error}`);
      } else {
        setMessage('Review deleted successfully');
      }
    });
  };

  const openEditor = (mode: EditorMode, review?: Review) => {
    setEditor({ open: true, mode, review });
  };

  const handleSave = async (payload: ReviewEditorForm) => {
    if (editor.mode === 'edit' && editor.review) {
      // Optimistic update
      const updatedReview = {
        ...editor.review,
        ...payload,
        authorLocation: payload.authorLocation || null,
        headline: payload.headline || null,
        visitDate: payload.visitDate || null,
        photoUrls: payload.photoUrls,
        sourceUrl: payload.sourceUrl || null,
        isFeatured: payload.isPublished ? payload.isFeatured : false,
        isPublished: payload.isPublished,
        updatedAt: new Date().toISOString(),
      };

      setReviews((prev) =>
        prev.map((item) => (item.id === editor.review?.id ? updatedReview : item)),
      );

      // Save to database
      const result = await updateReviewAction(editor.review.id, {
        authorName: payload.authorName,
        authorLocation: payload.authorLocation || null,
        rating: payload.rating,
        body: payload.body,
        visitDate: payload.visitDate || null,
        photoUrls: payload.photoUrls,
        status: payload.isPublished ? 'published' : 'pending',
        featured: payload.isPublished ? payload.isFeatured : false,
      });

      if (!result.success) {
        // Revert optimistic update on error
        setReviews((prev) =>
          prev.map((item) => (item.id === editor.review?.id ? editor.review : item)),
        );
        setMessage(`Error: ${result.error}`);
        return;
      }

      setMessage('Review updated successfully!');
    } else {
      const now = new Date().toISOString();
      const newReview: Review = {
        id: crypto.randomUUID ? crypto.randomUUID() : `review-${Date.now()}`,
        source: payload.source,
        isPublished: payload.isPublished,
        isFeatured: payload.isPublished ? payload.isFeatured : false,
        authorName: payload.authorName,
        authorLocation: payload.authorLocation || null,
        rating: payload.rating,
        body: payload.body,
        headline: payload.headline || null,
        visitDate: payload.visitDate || null,
        photoUrls: payload.photoUrls,
        sourceUrl: payload.sourceUrl || null,
        createdAt: now,
        updatedAt: now,
      };
      setReviews((prev) => [newReview, ...prev]);
      setMessage('Facebook review added (mock).');
    }

    setEditor({ open: false, mode: 'create', review: undefined });
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Review status filters">
          {[
            { value: 'all', label: 'All' },
            { value: 'published', label: 'Published' },
            { value: 'pending', label: 'Pending' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={filter === option.value}
              onClick={() => setFilter(option.value as typeof filter)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                filter === option.value
                  ? 'border-orange-500/30 bg-orange-500/10 text-orange-100'
                  : 'border-slate-800 bg-[#1E293B]/60 text-slate-300 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as 'all' | ReviewSource)}
            className="rounded-xl border border-slate-700 bg-[#0B1120] px-3 py-2 text-sm text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          >
            <option value="all">All sources</option>
            <option value="manual">EBL Family</option>
            <option value="facebook_manual">Facebook</option>
            <option value="form">Form</option>
          </select>
          <button
            type="button"
            className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-400 hover:to-orange-500"
            onClick={() => openEditor('create')}
          >
            Add Facebook review
          </button>
        </div>
      </div>

      {message ? (
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
          {message}
        </div>
      ) : null}

      {filteredReviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-[#1E293B]/60 p-8 text-center">
          <p className="text-lg font-semibold text-white">No reviews match this filter</p>
          <p className="mt-2 text-sm text-slate-400">
            Adjust the status or source filters to see more results.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800/60 bg-[#1E293B]/60">
          <div className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 border-b border-slate-800 bg-[#0f172a] px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 max-md:hidden">
            <span>Name</span>
            <span>Source</span>
            <span>Published</span>
            <span>Featured</span>
            <span className="text-right">Actions</span>
          </div>
          <ul className="divide-y divide-slate-800/60" data-testid="admin-review-list">
            {filteredReviews.map((review) => (
              <li
                key={review.id}
                className="grid items-center gap-4 px-5 py-4 max-md:grid-cols-1 md:grid-cols-[2fr,1fr,1fr,1fr,auto]"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{review.authorName}</p>
                  <p className="text-xs text-slate-400">
                    {review.authorLocation || 'Location not provided'} • {review.rating}★
                  </p>
                  <p className="text-xs text-slate-400">
                    {review.headline ? review.headline : review.body.slice(0, 90)}
                  </p>
                </div>
                <div className="text-sm font-semibold text-white">
                  <span className="rounded-full border border-slate-700 bg-[#0B1120] px-3 py-1 text-[11px] uppercase tracking-wide text-slate-200">
                    {sourceLabels[review.source]}
                  </span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handlePublishToggle(review.id)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition ${
                      review.isPublished
                        ? 'border border-green-500/30 bg-green-500/15 text-green-200'
                        : 'border border-dashed border-slate-700 text-slate-400'
                    }`}
                  >
                    {review.isPublished ? 'Published' : 'Pending'}
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleFeatureToggle(review.id)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition ${
                      review.isFeatured
                        ? 'border border-orange-500/30 bg-orange-500/15 text-orange-100'
                        : 'border border-dashed border-slate-700 text-slate-400'
                    }`}
                  >
                    {review.isFeatured ? 'Featured' : 'Not featured'}
                  </button>
                </div>
                <div className="flex flex-wrap justify-end gap-2 text-sm font-semibold">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-200 transition hover:bg-slate-800"
                    onClick={() => openEditor('edit', review)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-red-500/40 px-3 py-1.5 text-red-200 transition hover:bg-red-500/10"
                    onClick={() => handleDelete(review.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editor.open ? (
        <ReviewEditor
          mode={editor.mode}
          review={editor.review}
          onClose={() => setEditor({ open: false, mode: 'create', review: undefined })}
          onSave={handleSave}
        />
      ) : null}
    </div>
  );
}
