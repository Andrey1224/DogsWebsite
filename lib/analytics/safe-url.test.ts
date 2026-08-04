import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { getSafeUrlParts, sanitizeUrlValue } from './safe-url';

describe('safe-url', () => {
  describe('getSafeUrlParts', () => {
    it('strips PII query params while keeping allowlisted marketing params', () => {
      const { safeLocation, safePath } = getSafeUrlParts(
        'https://example.com/contact?email=test@example.com&token=secret&utm_source=google',
      );

      expect(safeLocation).not.toContain('email');
      expect(safeLocation).not.toContain('token');
      expect(safeLocation).not.toContain('secret');
      expect(safeLocation).toContain('utm_source=google');
      expect(safeLocation).toBe('https://example.com/contact?utm_source=google');

      expect(safePath).not.toContain('email');
      expect(safePath).not.toContain('token');
      expect(safePath).toBe('/contact?utm_source=google');
    });

    it('keeps all allowlisted marketing/attribution params', () => {
      const href =
        'https://example.com/puppies?utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_term=bulldog&utm_content=ad1&gclid=abc&dclid=def&fbclid=ghi&msclkid=jkl';
      const { safeLocation } = getSafeUrlParts(href);

      for (const param of [
        'utm_source=google',
        'utm_medium=cpc',
        'utm_campaign=spring',
        'utm_term=bulldog',
        'utm_content=ad1',
        'gclid=abc',
        'dclid=def',
        'fbclid=ghi',
        'msclkid=jkl',
      ]) {
        expect(safeLocation).toContain(param);
      }
    });

    it('drops every non-allowlisted param, including ones not on the explicit denylist', () => {
      const { safeLocation } = getSafeUrlParts(
        'https://example.com/?ref=newsletter&foo=bar&session_id=cs_test_123',
      );
      expect(safeLocation).toBe('https://example.com/');
    });

    it('drops session_id (Stripe checkout redirect) query params', () => {
      const { safeLocation, safePath } = getSafeUrlParts(
        'https://example.com/puppies/sunny/reserved?session_id=cs_test_a1b2c3',
      );
      expect(safeLocation).toBe('https://example.com/puppies/sunny/reserved');
      expect(safePath).toBe('/puppies/sunny/reserved');
    });

    it('returns a URL with no query string when there is none', () => {
      const { safeLocation, safePath } = getSafeUrlParts('https://example.com/about');
      expect(safeLocation).toBe('https://example.com/about');
      expect(safePath).toBe('/about');
    });

    describe('on parse failure', () => {
      const originalLocation = window.location;

      beforeEach(() => {
        Object.defineProperty(window, 'location', {
          configurable: true,
          value: { origin: 'https://example.com', pathname: '/current-page' },
        });
      });

      afterEach(() => {
        Object.defineProperty(window, 'location', {
          configurable: true,
          value: originalLocation,
        });
      });

      it('never returns the raw/original input and falls back to origin+pathname only', () => {
        const result = getSafeUrlParts('not a valid url ?email=leak@example.com');
        expect(result.safeLocation).not.toContain('leak@example.com');
        expect(result.safeLocation).not.toContain('not a valid url');
        expect(result.safeLocation).toBe('https://example.com/current-page');
        expect(result.safePath).toBe('/current-page');
      });
    });
  });

  describe('sanitizeUrlValue', () => {
    it('sanitizes a bare path with query string', () => {
      expect(sanitizeUrlValue('/contact?email=test@example.com&utm_source=google')).toBe(
        '/contact?utm_source=google',
      );
    });

    it('sanitizes a full absolute URL and preserves the origin', () => {
      expect(sanitizeUrlValue('https://example.com/puppies?token=abc&gclid=xyz')).toBe(
        'https://example.com/puppies?gclid=xyz',
      );
    });

    it('leaves a clean path untouched', () => {
      expect(sanitizeUrlValue('/puppies/sunny')).toBe('/puppies/sunny');
    });
  });
});
