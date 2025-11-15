import { describe, expect, it } from 'vitest';

import { resolveLocalImage } from './images';

describe('resolveLocalImage', () => {
  it('returns fallback when url is empty', () => {
    expect(resolveLocalImage(undefined, '/fallback.jpg')).toBe('/fallback.jpg');
  });

  it('returns local urls unchanged', () => {
    expect(resolveLocalImage('/puppies/photo.jpg')).toBe('/puppies/photo.jpg');
  });

  it('allows https remote urls', () => {
    expect(resolveLocalImage('https://cdn.test/puppy.jpg')).toBe('https://cdn.test/puppy.jpg');
  });

  it('falls back for unsupported protocols', () => {
    expect(resolveLocalImage('ftp://example.com/image.jpg', '/fallback.jpg')).toBe('/fallback.jpg');
  });
});
