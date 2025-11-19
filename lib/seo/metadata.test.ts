/**
 * SEO Metadata Tests
 *
 * Tests metadata generation for pages including OpenGraph, Twitter Cards,
 * canonical URLs, and noIndex handling. Critical for SEO performance.
 */

import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { buildMetadata, getDefaultMetadata } from './metadata';

vi.mock('@/lib/utils/env', () => ({
  getSiteUrl: vi.fn(() => 'https://exoticbulldoglegacy.com'),
}));

vi.mock('@/lib/utils/images', () => ({
  resolveLocalImage: vi.fn((path: string, fallback: string) => path || fallback),
}));

describe('SEO Metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDefaultMetadata', () => {
    it('returns default metadata with site name and description', () => {
      const metadata = getDefaultMetadata();

      expect(metadata.title).toEqual({
        default: 'Exotic Bulldog Legacy',
        template: '%s | Exotic Bulldog Legacy',
      });

      expect(metadata.description).toContain('Health-first French & English bulldog breeding');
      expect(metadata.metadataBase).toEqual(new URL('https://exoticbulldoglegacy.com'));
    });

    it('includes OpenGraph configuration', () => {
      const metadata = getDefaultMetadata();

      expect(metadata.openGraph).toMatchObject({
        type: 'website',
        locale: 'en_US',
        url: 'https://exoticbulldoglegacy.com',
        siteName: 'Exotic Bulldog Legacy',
        title: 'Exotic Bulldog Legacy',
      });

      expect(metadata.openGraph?.images).toBeDefined();
      expect(Array.isArray(metadata.openGraph?.images)).toBe(true);
    });

    it('includes Twitter Card configuration', () => {
      const metadata = getDefaultMetadata();

      expect(metadata.twitter).toMatchObject({
        card: 'summary_large_image',
        title: 'Exotic Bulldog Legacy',
      });

      expect(metadata.twitter?.description).toBeTruthy();
      expect(metadata.twitter?.images).toBeDefined();
    });

    it('enables indexing by default', () => {
      const metadata = getDefaultMetadata();

      expect(metadata.robots).toMatchObject({
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      });
    });
  });

  describe('buildMetadata', () => {
    it('builds metadata with title and description', () => {
      const metadata = buildMetadata({
        title: 'About Us',
        description: 'Learn about our bulldog breeding program',
      });

      expect(metadata.title).toBe('About Us');
      expect(metadata.description).toBe('Learn about our bulldog breeding program');
    });

    it('generates canonical URL from path', () => {
      const metadata = buildMetadata({
        title: 'Puppies',
        description: 'Available puppies',
        path: '/puppies',
      });

      expect(metadata.alternates).toEqual({
        canonical: 'https://exoticbulldoglegacy.com/puppies',
      });
    });

    it('handles path without leading slash', () => {
      const metadata = buildMetadata({
        title: 'About',
        description: 'About us',
        path: 'about',
      });

      expect(metadata.alternates).toEqual({
        canonical: 'https://exoticbulldoglegacy.com/about',
      });
    });

    it('uses site URL as canonical when path is not provided', () => {
      const metadata = buildMetadata({
        title: 'Home',
        description: 'Home page',
      });

      expect(metadata.alternates).toEqual({
        canonical: 'https://exoticbulldoglegacy.com',
      });
    });

    it('includes OpenGraph metadata', () => {
      const metadata = buildMetadata({
        title: 'FAQ',
        description: 'Frequently asked questions',
        path: '/faq',
      });

      expect(metadata.openGraph).toMatchObject({
        type: 'website',
        url: 'https://exoticbulldoglegacy.com/faq',
        title: 'FAQ',
        description: 'Frequently asked questions',
        siteName: 'Exotic Bulldog Legacy',
      });
    });

    it('includes Twitter Card metadata', () => {
      const metadata = buildMetadata({
        title: 'Contact',
        description: 'Get in touch',
        path: '/contact',
      });

      expect(metadata.twitter).toMatchObject({
        card: 'summary_large_image',
        title: 'Contact',
        description: 'Get in touch',
      });
    });

    it('uses custom image when provided as string', () => {
      const metadata = buildMetadata({
        title: 'Gallery',
        description: 'Photo gallery',
        image: '/gallery/hero.webp',
      });

      expect(metadata.openGraph?.images).toContainEqual(
        expect.objectContaining({
          url: '/gallery/hero.webp',
        }),
      );

      expect(metadata.twitter?.images).toContain('/gallery/hero.webp');
    });

    it('uses custom image when provided as object', () => {
      const metadata = buildMetadata({
        title: 'Product',
        description: 'Product page',
        image: {
          url: '/product.webp',
          alt: 'Product image',
          width: 1200,
          height: 630,
        },
      });

      expect(metadata.openGraph?.images).toContainEqual(
        expect.objectContaining({
          url: '/product.webp',
          alt: 'Product image',
          width: 1200,
          height: 630,
        }),
      );
    });

    it('disables indexing when noIndex is true', () => {
      const metadata = buildMetadata({
        title: 'Draft Page',
        description: 'Draft content',
        noIndex: true,
      });

      expect(metadata.robots).toMatchObject({
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      });
    });

    it('does not set robots when noIndex is false', () => {
      const metadata = buildMetadata({
        title: 'Public Page',
        description: 'Public content',
        noIndex: false,
      });

      expect(metadata.robots).toBeUndefined();
    });

    it('handles missing image gracefully with default', () => {
      const metadata = buildMetadata({
        title: 'Page',
        description: 'Description',
      });

      // Should use default image
      expect(metadata.openGraph?.images).toBeDefined();
      expect(metadata.twitter?.images).toBeDefined();
    });

    it('preserves image alt text when provided', () => {
      const metadata = buildMetadata({
        title: 'Puppy Detail',
        description: 'Puppy description',
        image: {
          url: '/puppy.webp',
          alt: 'Cute bulldog puppy',
        },
      });

      expect(metadata.openGraph?.images).toContainEqual(
        expect.objectContaining({
          alt: 'Cute bulldog puppy',
        }),
      );
    });

    it('handles complex paths correctly', () => {
      const metadata = buildMetadata({
        title: 'Puppy Detail',
        description: 'Puppy description',
        path: '/puppies/bella',
      });

      expect(metadata.alternates).toEqual({
        canonical: 'https://exoticbulldoglegacy.com/puppies/bella',
      });

      expect(metadata.openGraph).toMatchObject({
        url: 'https://exoticbulldoglegacy.com/puppies/bella',
      });
    });

    it('handles query parameters in path', () => {
      const metadata = buildMetadata({
        title: 'Search',
        description: 'Search results',
        path: '/puppies?filter=available',
      });

      expect(metadata.alternates).toEqual({
        canonical: 'https://exoticbulldoglegacy.com/puppies?filter=available',
      });
    });

    it('handles hash fragments in path', () => {
      const metadata = buildMetadata({
        title: 'Section',
        description: 'Page section',
        path: '/about#team',
      });

      expect(metadata.alternates).toEqual({
        canonical: 'https://exoticbulldoglegacy.com/about#team',
      });
    });
  });

  describe('Image Resolution', () => {
    it('uses custom image when provided as string', () => {
      const metadata = buildMetadata({
        title: 'Test',
        description: 'Test',
        image: '/custom.webp',
      });

      // Custom images are passed through resolveLocalImage in the implementation
      expect(metadata.openGraph?.images).toBeDefined();
      expect(metadata.twitter?.images).toBeDefined();
    });

    it('uses default image when no image provided', () => {
      const metadata = buildMetadata({
        title: 'Test',
        description: 'Test',
      });

      // When no image is provided, default image is used
      expect(metadata.openGraph?.images).toEqual([
        {
          url: '/reviews/sarah-charlie.webp',
          alt: 'French and English bulldogs from Exotic Bulldog Legacy',
        },
      ]);
      expect(metadata.twitter?.images).toEqual(['/reviews/sarah-charlie.webp']);
    });
  });
});
