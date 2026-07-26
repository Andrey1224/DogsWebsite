import { beforeEach, describe, expect, it, vi } from 'vitest';

import sitemap from './sitemap';
import { getPuppies } from '@/lib/supabase/queries';

vi.mock('@/lib/supabase/queries', () => ({
  getPuppies: vi.fn(),
}));

vi.mock('@/lib/utils/env', () => ({
  getSiteUrl: () => 'https://example.com',
}));

vi.mock('@/sanity/lib/client', () => ({
  sanityFetch: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/lib/data/locations', () => ({
  getIndexableLocations: () => [],
}));

describe('sitemap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('includes public sold puppy profiles', async () => {
    vi.mocked(getPuppies).mockResolvedValue([
      {
        id: 'sold-1',
        slug: 'mocha',
        name: 'Mocha',
        status: 'sold',
        is_archived: false,
        updated_at: '2026-06-18T00:00:00.000Z',
      },
    ] as Awaited<ReturnType<typeof getPuppies>>);

    const entries = await sitemap();

    expect(entries).toContainEqual(
      expect.objectContaining({
        url: 'https://example.com/puppies/mocha',
      }),
    );
  });
});
