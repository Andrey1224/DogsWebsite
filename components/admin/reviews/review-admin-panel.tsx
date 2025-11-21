'use client';

import { useMemo, useState } from 'react';

import type { Review, ReviewSource } from '@/lib/reviews/types';

const sourceLabels: Record<ReviewSource, string> = {
  manual: 'EBL Family',
  facebook_manual: 'Facebook',
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
  photoUrl: string;
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
      photoUrl: review.photoUrl ?? '',
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
    photoUrl: '',
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

  const handleChange = (key: keyof ReviewEditorForm, value: string | number | boolean) => {
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
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              {mode === 'create' ? 'Add Facebook review' : 'Edit review'}
            </p>
            <h3 className="text-xl font-semibold text-text">
              {mode === 'create' ? 'New Facebook import' : review?.headline || review?.authorName}
            </h3>
          </div>
          <button
            type="button"
            className="rounded-full border border-border px-3 py-1 text-sm font-semibold text-text hover:bg-hover"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-text">Name</label>
              <input
                value={form.authorName}
                onChange={(e) => handleChange('authorName', e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-2.5 text-sm"
                placeholder="Sarah W."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-text">Location (optional)</label>
              <input
                value={form.authorLocation}
                onChange={(e) => handleChange('authorLocation', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-2.5 text-sm"
                placeholder="Huntsville, AL"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-text">Headline (optional)</label>
              <input
                value={form.headline}
                onChange={(e) => handleChange('headline', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-2.5 text-sm"
                placeholder="Healthiest pup we have owned"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-text">Visit date (optional)</label>
              <input
                type="date"
                value={form.visitDate}
                onChange={(e) => handleChange('visitDate', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-text">Rating</label>
              <select
                value={form.rating}
                onChange={(e) => handleChange('rating', Number(e.target.value))}
                className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-2.5 text-sm"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value} stars
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-text">Source URL (optional)</label>
              <input
                value={form.sourceUrl}
                onChange={(e) => handleChange('sourceUrl', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-2.5 text-sm"
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-text">Review body</label>
            <textarea
              value={form.body}
              onChange={(e) => handleChange('body', e.target.value)}
              rows={4}
              required
              className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-2.5 text-sm"
              placeholder="Paste the review text"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-text">Photo URL (optional)</label>
              <input
                value={form.photoUrl}
                onChange={(e) => handleChange('photoUrl', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-2.5 text-sm"
                placeholder="https://.../reviews/image.webp"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-text">Source</label>
              <select
                value={form.source}
                onChange={(e) => handleChange('source', e.target.value as ReviewSource)}
                className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-2.5 text-sm"
                disabled={mode === 'create'}
              >
                <option value="manual">Manual</option>
                <option value="facebook_manual">Facebook manual</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-text">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => handleChange('isPublished', e.target.checked)}
              />
              Published
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-text">
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
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-hover"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[color:var(--btn-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--btn-text)] shadow-sm hover:brightness-105"
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

  const handlePublishToggle = (id: string) => {
    updateReview(id, (review) => ({
      ...review,
      isPublished: !review.isPublished,
      isFeatured: review.isPublished ? false : review.isFeatured,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleFeatureToggle = (id: string) => {
    const review = reviews.find((item) => item.id === id);
    if (!review) return;
    if (!review.isPublished) {
      setMessage('Publish the review before featuring it.');
      return;
    }

    updateReview(id, (r) => ({
      ...r,
      isFeatured: !r.isFeatured,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleDelete = (id: string) => {
    setReviews((prev) => prev.filter((review) => review.id !== id));
    setMessage('Review deleted (mock).');
  };

  const openEditor = (mode: EditorMode, review?: Review) => {
    setEditor({ open: true, mode, review });
  };

  const handleSave = (payload: ReviewEditorForm) => {
    if (editor.mode === 'edit' && editor.review) {
      setReviews((prev) =>
        prev.map((item) =>
          item.id === editor.review?.id
            ? {
                ...item,
                ...payload,
                authorLocation: payload.authorLocation || null,
                headline: payload.headline || null,
                visitDate: payload.visitDate || null,
                photoUrl: payload.photoUrl || null,
                sourceUrl: payload.sourceUrl || null,
                isFeatured: payload.isPublished ? payload.isFeatured : false,
                isPublished: payload.isPublished,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
      setMessage('Review updated (mock).');
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
        photoUrl: payload.photoUrl || null,
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
    <div className="space-y-4">
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
                  ? 'border-accent bg-[color:color-mix(in_srgb,_var(--accent)_14%,_var(--bg))] text-text'
                  : 'border-border bg-card text-muted hover:text-text'
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
            className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text"
          >
            <option value="all">All sources</option>
            <option value="manual">EBL Family</option>
            <option value="facebook_manual">Facebook</option>
          </select>
          <button
            type="button"
            className="rounded-full bg-[color:var(--btn-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--btn-text)] shadow-sm transition hover:brightness-105"
            onClick={() => openEditor('create')}
          >
            Add Facebook review
          </button>
        </div>
      </div>

      {message ? (
        <div className="rounded-xl border border-accent/40 bg-[color:color-mix(in_srgb,_var(--accent)_12%,_var(--bg))] px-4 py-3 text-sm text-text">
          {message}
        </div>
      ) : null}

      {filteredReviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-bg/60 p-8 text-center">
          <p className="text-lg font-semibold text-text">No reviews match this filter</p>
          <p className="mt-2 text-sm text-muted">
            Adjust the status or source filters to see more results.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 border-b border-border bg-bg px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted max-md:hidden">
            <span>Name</span>
            <span>Source</span>
            <span>Published</span>
            <span>Featured</span>
            <span className="text-right">Actions</span>
          </div>
          <ul className="divide-y divide-border" data-testid="admin-review-list">
            {filteredReviews.map((review) => (
              <li
                key={review.id}
                className="grid items-center gap-4 px-5 py-4 max-md:grid-cols-1 md:grid-cols-[2fr,1fr,1fr,1fr,auto]"
              >
                <div>
                  <p className="text-sm font-semibold text-text">{review.authorName}</p>
                  <p className="text-xs text-muted">
                    {review.authorLocation || 'Location not provided'} • {review.rating}★
                  </p>
                  <p className="text-xs text-muted">
                    {review.headline ? review.headline : review.body.slice(0, 90)}
                  </p>
                </div>
                <div className="text-sm font-semibold text-text">
                  <span className="rounded-full bg-black/5 px-3 py-1 text-[11px] uppercase tracking-wide text-text/70 dark:bg-white/5">
                    {sourceLabels[review.source]}
                  </span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handlePublishToggle(review.id)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                      review.isPublished
                        ? 'bg-[color:color-mix(in_srgb,_var(--accent)_18%,_var(--bg))] text-text'
                        : 'border border-dashed border-border text-muted'
                    }`}
                  >
                    {review.isPublished ? 'Published' : 'Pending'}
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleFeatureToggle(review.id)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                      review.isFeatured
                        ? 'bg-[color:color-mix(in_srgb,_var(--accent-aux)_18%,_var(--bg))] text-text'
                        : 'border border-dashed border-border text-muted'
                    }`}
                  >
                    {review.isFeatured ? 'Featured' : 'Not featured'}
                  </button>
                </div>
                <div className="flex flex-wrap justify-end gap-2 text-sm font-semibold text-accent">
                  <button
                    type="button"
                    className="rounded-lg border border-border px-3 py-1 text-text hover:bg-hover"
                    onClick={() => openEditor('edit', review)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 px-3 py-1 text-red-700 hover:bg-red-50"
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
