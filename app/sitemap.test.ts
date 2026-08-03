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
  getIndexableLocations: () => [
    { slug: 'birmingham-al' },
    { slug: 'huntsville-al' },
    { slug: 'cullman-al' },
    { slug: 'decatur-al' },
  ],
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

  it('does not publish fabricated current timestamps for static and location pages', async () => {
    vi.mocked(getPuppies).mockResolvedValue([]);

    const entries = await sitemap();
    const homeEntry = entries.find((entry) => entry.url === 'https://example.com');
    const locationEntry = entries.find(
      (entry) => entry.url === 'https://example.com/locations/huntsville-al',
    );

    expect(homeEntry).toBeDefined();
    expect(homeEntry?.lastModified).toBeUndefined();
    expect(locationEntry).toBeDefined();
    expect(locationEntry?.lastModified).toBeUndefined();
  });

  it('uses the real update date for revised local articles', async () => {
    vi.mocked(getPuppies).mockResolvedValue([]);

    const entries = await sitemap();
    const articleEntry = entries.find(
      (entry) => entry.url === 'https://example.com/blog/ultimate-guide-for-new-bulldog-owners',
    );

    expect(articleEntry?.lastModified).toEqual(new Date('2026-08-02T21:30:00.000Z'));
  });

  it('includes the Cullman and Decatur service-area pages', async () => {
    vi.mocked(getPuppies).mockResolvedValue([]);

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://example.com/locations/cullman-al');
    expect(urls).toContain('https://example.com/locations/decatur-al');
  });
});
