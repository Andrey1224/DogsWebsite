import { afterEach, describe, expect, it, vi } from 'vitest';

import { ensureMetaPixelQueue } from './meta-pixel';

describe('ensureMetaPixelQueue', () => {
  afterEach(() => {
    delete window.fbq;
    delete window._fbq;
  });

  it('creates Meta-compatible queue fields and preserves early events', () => {
    const pixel = ensureMetaPixelQueue();

    pixel('track', 'PageView');

    expect(pixel.loaded).toBe(true);
    expect(pixel.version).toBe('2.0');
    expect(pixel.push).toBe(pixel);
    expect(window._fbq).toBe(pixel);
    expect(pixel.queue).toEqual([['track', 'PageView']]);
  });

  it('delegates to Meta callMethod after the library becomes ready', () => {
    const pixel = ensureMetaPixelQueue();
    pixel.callMethod = vi.fn();

    pixel('track', 'Lead', { content_name: 'contact_page' });

    expect(pixel.callMethod).toHaveBeenCalledWith('track', 'Lead', {
      content_name: 'contact_page',
    });
  });
});
