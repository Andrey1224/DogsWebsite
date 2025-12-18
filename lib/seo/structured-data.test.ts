/**
 * SEO Structured Data Tests
 *
 * Tests JSON-LD schema generation for Organization, LocalBusiness, Product,
 * FAQPage, and MerchantReturnPolicy. Critical for SEO and rich results.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getOrganizationSchema,
  getLocalBusinessSchema,
  getProductSchema,
  getFaqSchema,
  getMerchantReturnPolicySchema,
} from './structured-data';
import type { PuppyWithRelations } from '@/lib/supabase/types';

vi.mock('@/lib/utils/env', () => ({
  getSiteUrl: vi.fn(() => 'https://exoticbulldoglegacy.com'),
}));

vi.mock('@/lib/utils/images', () => ({
  resolveLocalImage: vi.fn((path: string | undefined, fallback: string) => path || fallback),
}));

vi.mock('@/lib/config/business', () => ({
  BUSINESS_PROFILE: {
    name: 'Exotic Bulldog Legacy',
    legalName: 'Exotic Bulldog Legacy Kennels LLC',
    slogan: 'Trusted French & English bulldogs raised with southern warmth.',
    description:
      'Responsible French & English bulldog breeding program in Montgomery, Alabama with concierge placement support.',
    logo: 'https://exoticbulldoglegacy.com/favicon.ico',
    imageGallery: [
      '/reviews/sarah-charlie.webp',
      '/reviews/mark-lisa-duke.webp',
      '/reviews/cameron-milo.webp',
    ],
    priceRange: '$$$',
    areaServed: ['Alabama', 'Georgia', 'Florida', 'Tennessee'],
    address: {
      streetAddress: 'Private kennel (appointment only)',
      addressLocality: 'Montgomery',
      addressRegion: 'AL',
      postalCode: '36117',
      addressCountry: 'US',
      formatted: 'Private kennel (appointment only), Montgomery, AL 36117',
      display: 'Montgomery, AL',
    },
    coordinates: {
      latitude: 32.3668,
      longitude: -86.3,
    },
    hours: [
      { day: 'Monday', opens: '09:00', closes: '19:00' },
      { day: 'Tuesday', opens: '09:00', closes: '19:00' },
      { day: 'Wednesday', opens: '09:00', closes: '19:00' },
      { day: 'Thursday', opens: '09:00', closes: '19:00' },
      { day: 'Friday', opens: '09:00', closes: '19:00' },
      { day: 'Saturday', opens: '09:00', closes: '17:00' },
    ],
  },
}));

vi.mock('@/lib/config/contact', () => ({
  CONTACT_DETAILS: {
    phone: {
      display: '+1 (205) 555-1234',
      e164: '+12055551234',
    },
    email: {
      address: 'hello@exoticbulldoglegacy.com',
    },
    whatsapp: {
      link: 'https://wa.me/12055551234',
    },
    telegram: {
      handle: 'exoticbulldoglevel',
      link: 'https://t.me/exoticbulldoglevel',
    },
    instagram: {
      handle: 'exoticbuldoglevel',
      link: 'https://instagram.com/exoticbuldoglevel',
    },
  },
}));

describe('SEO Structured Data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrganizationSchema', () => {
    it('generates valid Organization schema', () => {
      const schema = getOrganizationSchema();

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('Exotic Bulldog Legacy');
      expect(schema.legalName).toBe('Exotic Bulldog Legacy Kennels LLC');
      expect(schema.url).toBe('https://exoticbulldoglegacy.com');
    });

    it('includes correct contact point information', () => {
      const schema = getOrganizationSchema();

      expect(schema.contactPoint).toHaveLength(1);
      expect(schema.contactPoint[0]).toMatchObject({
        '@type': 'ContactPoint',
        telephone: '+12055551234',
        email: 'hello@exoticbulldoglegacy.com',
        contactType: 'customer service',
        availableLanguage: ['English'],
        areaServed: ['Alabama', 'Georgia', 'Florida', 'Tennessee'],
      });
    });

    it('includes social media sameAs links', () => {
      const schema = getOrganizationSchema();

      expect(schema.sameAs).toContain('https://wa.me/12055551234');
      expect(schema.sameAs).toContain('https://t.me/exoticbulldoglevel');
      expect(schema.sameAs).toContain('https://instagram.com/exoticbuldoglevel');
      expect(schema.sameAs).toContain('https://exoticbulldoglegacy.com');
    });

    it('includes business slogan and description', () => {
      const schema = getOrganizationSchema();

      expect(schema.slogan).toBe('Trusted French & English bulldogs raised with southern warmth.');
      expect(schema.description).toContain('Responsible French & English bulldog breeding');
    });
  });

  describe('getLocalBusinessSchema', () => {
    it('generates valid PetStore schema', () => {
      const schema = getLocalBusinessSchema();

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('PetStore');
      expect(schema.additionalType).toBe('https://schema.org/LocalBusiness');
      expect(schema['@id']).toBe('https://exoticbulldoglegacy.com#localbusiness');
    });

    it('includes complete postal address', () => {
      const schema = getLocalBusinessSchema();

      expect(schema.address).toMatchObject({
        '@type': 'PostalAddress',
        streetAddress: 'Private kennel (appointment only)',
        addressLocality: 'Montgomery',
        addressRegion: 'AL',
        postalCode: '36117',
        addressCountry: 'US',
      });
    });

    it('includes geo coordinates', () => {
      const schema = getLocalBusinessSchema();

      expect(schema.geo).toMatchObject({
        '@type': 'GeoCoordinates',
        latitude: 32.3668,
        longitude: -86.3,
      });
    });

    it('includes opening hours specification', () => {
      const schema = getLocalBusinessSchema();

      expect(schema.openingHoursSpecification).toHaveLength(6);
      expect(schema.openingHoursSpecification[0]).toMatchObject({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Monday',
        opens: '09:00',
        closes: '19:00',
      });
    });

    it('includes area served with administrative regions', () => {
      const schema = getLocalBusinessSchema();

      expect(schema.areaServed).toHaveLength(4);
      expect(schema.areaServed[0]).toMatchObject({
        '@type': 'AdministrativeArea',
        name: 'Alabama',
      });
    });

    it('includes contact information and price range', () => {
      const schema = getLocalBusinessSchema();

      expect(schema.telephone).toBe('+12055551234');
      expect(schema.email).toBe('hello@exoticbulldoglegacy.com');
      expect(schema.priceRange).toBe('$$$');
    });

    it('includes image gallery', () => {
      const schema = getLocalBusinessSchema();

      expect(schema.image).toEqual([
        '/reviews/sarah-charlie.webp',
        '/reviews/mark-lisa-duke.webp',
        '/reviews/cameron-milo.webp',
      ]);
    });
  });

  describe('getProductSchema', () => {
    const basePuppy: PuppyWithRelations = {
      id: 'puppy-123',
      slug: 'bella',
      name: 'Bella',
      status: 'available',
      price_usd: 3500,
      color: 'Blue Fawn',
      weight_oz: 120,
      description: 'Beautiful blue fawn French Bulldog puppy with excellent temperament.',
      photo_urls: ['/puppies/bella-1.webp', '/puppies/bella-2.webp'],
      birth_date: null,
      breed: 'french_bulldog',
      dam_id: null,
      dam_name: null,
      dam_photo_urls: null,
      dam_color_notes: null,
      dam_health_notes: null,
      dam_temperament_notes: null,
      dam_weight_notes: null,
      is_archived: false,
      sold_at: null,
      litter_id: null,
      paypal_enabled: true,
      sex: 'female',
      sire_id: null,
      sire_name: null,
      sire_photo_urls: null,
      sire_color_notes: null,
      sire_health_notes: null,
      sire_temperament_notes: null,
      sire_weight_notes: null,
      stripe_payment_link: null,
      updated_at: null,
      video_urls: null,
      created_at: new Date().toISOString(),
      litter: null,
      parents: {
        sire: {
          id: 'sire-1',
          name: 'Duke',
          breed: 'french_bulldog',
          photo_urls: [],
          birth_date: null,
          color: null,
          created_at: null,
          description: null,
          health_clearances: null,
          sex: 'male',
          slug: null,
          video_urls: null,
          weight_lbs: null,
        },
        dam: {
          id: 'dam-1',
          name: 'Luna',
          breed: 'french_bulldog',
          photo_urls: [],
          birth_date: null,
          color: null,
          created_at: null,
          description: null,
          health_clearances: null,
          sex: 'female',
          slug: null,
          video_urls: null,
          weight_lbs: null,
        },
      },
    };

    it('generates valid Product schema for available puppy', () => {
      const schema = getProductSchema(basePuppy);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Product');
      expect(schema.name).toBe('Bella');
      expect(schema.sku).toBe('puppy-123');
      expect(schema.category).toBe('Pets & Animals > Dogs & Puppies');
      expect(schema.url).toBe('https://exoticbulldoglegacy.com/puppies/bella');
    });

    it('uses puppy description when provided', () => {
      const schema = getProductSchema(basePuppy);

      expect(schema.description).toBe(
        'Beautiful blue fawn French Bulldog puppy with excellent temperament.',
      );
    });

    it('generates default description when not provided', () => {
      const puppy = { ...basePuppy, description: null };
      const schema = getProductSchema(puppy);

      expect(schema.description).toContain('Health-tested french bulldog puppy');
      expect(schema.description).toContain('Montgomery, Alabama');
    });

    it('includes brand as breed label', () => {
      const schema = getProductSchema(basePuppy);

      expect(schema.brand).toMatchObject({
        '@type': 'Brand',
        name: 'French Bulldog',
      });
    });

    it('handles English Bulldog breed correctly', () => {
      const puppy: PuppyWithRelations = {
        ...basePuppy,
        parents: {
          sire: {
            id: 'sire-2',
            name: 'Tank',
            breed: 'english_bulldog',
            photo_urls: [],
            birth_date: null,
            color: null,
            created_at: null,
            description: null,
            health_clearances: null,
            sex: 'male',
            slug: null,
            video_urls: null,
            weight_lbs: null,
          },
          dam: null,
        },
      };

      const schema = getProductSchema(puppy);
      expect(schema.brand).toMatchObject({
        '@type': 'Brand',
        name: 'English Bulldog',
      });
    });

    it('includes photo URLs as images', () => {
      const schema = getProductSchema(basePuppy);

      expect(schema.image).toEqual(['/puppies/bella-1.webp', '/puppies/bella-2.webp']);
    });

    it('uses fallback image when no photos provided', () => {
      const puppy = { ...basePuppy, photo_urls: [] };
      const schema = getProductSchema(puppy);

      expect(schema.image).toEqual(['/reviews/mark-lisa-duke.webp']);
    });

    it('includes color when provided', () => {
      const schema = getProductSchema(basePuppy);

      expect(schema.color).toBe('Blue Fawn');
    });

    it('includes weight in ounces when provided', () => {
      const schema = getProductSchema(basePuppy);

      expect(schema.weight).toMatchObject({
        '@type': 'QuantitativeValue',
        value: 120,
        unitCode: 'OZ',
      });
    });

    it('omits weight when not provided', () => {
      const puppy = { ...basePuppy, weight_oz: null };
      const schema = getProductSchema(puppy);

      expect(schema.weight).toBeUndefined();
    });

    it('includes offer with correct pricing for available puppy', () => {
      const schema = getProductSchema(basePuppy);

      expect(schema.offers).toMatchObject({
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: 3500,
        availability: 'https://schema.org/InStock',
        url: 'https://exoticbulldoglegacy.com/puppies/bella',
        seller: {
          '@type': 'Organization',
          name: 'Exotic Bulldog Legacy',
          url: 'https://exoticbulldoglegacy.com',
        },
      });
    });

    it('maps reserved status to PreOrder availability', () => {
      const puppy = { ...basePuppy, status: 'reserved' as const };
      const schema = getProductSchema(puppy);

      expect(schema.offers?.availability).toBe('https://schema.org/PreOrder');
    });

    it('maps upcoming status to PreOrder availability', () => {
      const puppy = { ...basePuppy, status: 'upcoming' as const };
      const schema = getProductSchema(puppy);

      expect(schema.offers?.availability).toBe('https://schema.org/PreOrder');
    });

    it('maps sold status to SoldOut availability', () => {
      const puppy = { ...basePuppy, status: 'sold' as const };
      const schema = getProductSchema(puppy);

      expect(schema.offers?.availability).toBe('https://schema.org/SoldOut');
    });

    it('omits offers when price is not set', () => {
      const puppy = { ...basePuppy, price_usd: null };
      const schema = getProductSchema(puppy);

      expect(schema.offers).toBeUndefined();
    });

    it('generates default name when puppy name is not provided', () => {
      const puppy = { ...basePuppy, name: null };
      const schema = getProductSchema(puppy);

      expect(schema.name).toBe('French Bulldog Puppy');
    });

    it('uses site URL as fallback when slug is missing', () => {
      const puppy = { ...basePuppy, slug: null };
      const schema = getProductSchema(puppy);

      expect(schema.url).toBe('https://exoticbulldoglegacy.com');
    });

    it('handles puppy without parents gracefully', () => {
      const puppy: PuppyWithRelations = {
        ...basePuppy,
        parents: { sire: null, dam: null },
      };
      const schema = getProductSchema(puppy);

      expect(schema.brand).toMatchObject({
        '@type': 'Brand',
        name: 'Bulldog',
      });
    });
  });

  describe('getFaqSchema', () => {
    it('generates valid FAQPage schema', () => {
      const items = [
        {
          question: 'What health testing do you provide?',
          answer:
            'All breeding dogs undergo comprehensive health testing including cardiac, patella, and genetic screening.',
        },
        {
          question: 'Do you offer a health guarantee?',
          answer: 'Yes, we provide a 12-month genetic health guarantee on all puppies.',
        },
      ];

      const schema = getFaqSchema(items);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('FAQPage');
      expect(schema.mainEntity).toHaveLength(2);
    });

    it('structures FAQ items correctly', () => {
      const items = [
        {
          question: 'What is your deposit policy?',
          answer: 'We require a $300 non-refundable deposit to reserve a puppy.',
        },
      ];

      const schema = getFaqSchema(items);

      expect(schema.mainEntity[0]).toMatchObject({
        '@type': 'Question',
        name: 'What is your deposit policy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We require a $300 non-refundable deposit to reserve a puppy.',
        },
      });
    });

    it('handles empty FAQ list', () => {
      const schema = getFaqSchema([]);

      expect(schema.mainEntity).toEqual([]);
    });

    it('handles multiple FAQ items with long answers', () => {
      const items = [
        {
          question: 'How do you socialize your puppies?',
          answer:
            'Our puppies are raised in a family environment with daily human interaction, exposure to various sounds and textures, and early neurological stimulation following the Puppy Culture protocol.',
        },
        {
          question: 'What comes with each puppy?',
          answer:
            'Each puppy comes with full AKC registration, up-to-date vaccinations, deworming, microchip, health certificate, starter food kit, and lifetime breeder support.',
        },
      ];

      const schema = getFaqSchema(items);

      expect(schema.mainEntity).toHaveLength(2);
      expect(schema.mainEntity[1].acceptedAnswer.text).toContain('AKC registration');
    });
  });

  describe('getMerchantReturnPolicySchema', () => {
    it('generates valid MerchantReturnPolicy schema with defaults', () => {
      const schema = getMerchantReturnPolicySchema({
        name: 'No Returns Policy',
      });

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('MerchantReturnPolicy');
      expect(schema.name).toBe('No Returns Policy');
      expect(schema.merchantReturnDays).toBe(0);
      expect(schema.returnPolicyCategory).toBe('https://schema.org/MerchantReturnNotPermitted');
      expect(schema.returnFees).toBe('https://schema.org/NonRefundable');
      expect(schema.returnMethod).toBe('https://schema.org/ReturnInStore');
      expect(schema.returnPolicyCountry).toBe('US');
      expect(schema.applicableCountry).toBe('US');
    });

    it('allows custom return days', () => {
      const schema = getMerchantReturnPolicySchema({
        name: '14-Day Return Policy',
        days: 14,
      });

      expect(schema.merchantReturnDays).toBe(14);
    });

    it('allows custom return policy category', () => {
      const schema = getMerchantReturnPolicySchema({
        name: 'Limited Returns',
        category: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      });

      expect(schema.returnPolicyCategory).toBe(
        'https://schema.org/MerchantReturnFiniteReturnWindow',
      );
    });

    it('allows custom return fees', () => {
      const schema = getMerchantReturnPolicySchema({
        name: 'Refundable Policy',
        fees: 'https://schema.org/FreeReturn',
      });

      expect(schema.returnFees).toBe('https://schema.org/FreeReturn');
    });

    it('allows custom policy country', () => {
      const schema = getMerchantReturnPolicySchema({
        name: 'Canada Policy',
        policyCountry: 'CA',
      });

      expect(schema.returnPolicyCountry).toBe('CA');
    });

    it('allows custom return method', () => {
      const schema = getMerchantReturnPolicySchema({
        name: 'Mail Returns',
        method: 'https://schema.org/ReturnByMail',
      });

      expect(schema.returnMethod).toBe('https://schema.org/ReturnByMail');
    });

    it('combines all custom options correctly', () => {
      const schema = getMerchantReturnPolicySchema({
        name: 'Full Custom Policy',
        days: 30,
        category: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        fees: 'https://schema.org/FreeReturn',
        policyCountry: 'CA',
        method: 'https://schema.org/ReturnByMail',
      });

      expect(schema).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'MerchantReturnPolicy',
        name: 'Full Custom Policy',
        merchantReturnDays: 30,
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        returnFees: 'https://schema.org/FreeReturn',
        returnPolicyCountry: 'CA',
        returnMethod: 'https://schema.org/ReturnByMail',
        applicableCountry: 'US',
      });
    });
  });
});
