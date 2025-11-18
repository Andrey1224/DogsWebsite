/**
 * Slug Generation Tests
 *
 * Tests the slug generation utility for admin puppy creation/editing.
 * Validates normalization, collision detection, special character handling,
 * and fallback mechanisms.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { slugifyName, generateUniqueSlug } from './slug';

describe('slugifyName', () => {
  it('converts basic string to lowercase slug', () => {
    expect(slugifyName('Bella')).toBe('bella');
    expect(slugifyName('MAX')).toBe('max');
    expect(slugifyName('Charlie Brown')).toBe('charlie-brown');
  });

  it('handles special characters and spaces', () => {
    expect(slugifyName('Bella & Max!')).toBe('bella-max');
    expect(slugifyName('Rocky (The Great)')).toBe('rocky-the-great');
    expect(slugifyName('Duke#1')).toBe('duke-1');
  });

  it('normalizes unicode characters', () => {
    expect(slugifyName('Café')).toBe('cafe');
    expect(slugifyName('Björk')).toBe('bjork');
    expect(slugifyName('José')).toBe('jose');
    expect(slugifyName('Müller')).toBe('muller');
  });

  it('removes leading and trailing hyphens', () => {
    expect(slugifyName('-Bella-')).toBe('bella');
    expect(slugifyName('---Max---')).toBe('max');
    expect(slugifyName('-')).toBe('');
  });

  it('collapses multiple hyphens into single hyphen', () => {
    expect(slugifyName('Bella---Max')).toBe('bella-max');
    expect(slugifyName('Charlie  Brown')).toBe('charlie-brown');
    expect(slugifyName('Rocky___Duke')).toBe('rocky-duke');
  });

  it('handles empty string', () => {
    expect(slugifyName('')).toBe('');
    expect(slugifyName('   ')).toBe('');
  });

  it('handles only special characters', () => {
    expect(slugifyName('!!!')).toBe('');
    expect(slugifyName('###')).toBe('');
    expect(slugifyName('@@@')).toBe('');
  });

  it('truncates to 80 characters', () => {
    const longName = 'a'.repeat(100);
    const slug = slugifyName(longName);
    expect(slug.length).toBe(80);
  });

  it('handles numbers correctly', () => {
    expect(slugifyName('Bella 2')).toBe('bella-2');
    expect(slugifyName('2Fast2Furious')).toBe('2fast2furious');
  });

  it('handles mixed case with numbers', () => {
    expect(slugifyName('Rocky3')).toBe('rocky3');
    expect(slugifyName('Milo #7')).toBe('milo-7');
  });

  it('handles emoji and non-latin characters', () => {
    expect(slugifyName('Bella 🐶')).toBe('bella');
    expect(slugifyName('犬')).toBe('');
    expect(slugifyName('Собака')).toBe('');
  });

  it('handles apostrophes and quotes', () => {
    expect(slugifyName("Bella's Puppy")).toBe('bella-s-puppy');
    expect(slugifyName('"Max"')).toBe('max');
  });

  it('handles underscores', () => {
    expect(slugifyName('Bella_Max')).toBe('bella-max');
    expect(slugifyName('Charlie_Brown_Jr')).toBe('charlie-brown-jr');
  });
});

describe('generateUniqueSlug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns base slug when not taken', async () => {
    const isTaken = vi.fn().mockResolvedValue(false);

    const result = await generateUniqueSlug('Bella', isTaken);

    expect(result).toBe('bella');
    expect(isTaken).toHaveBeenCalledTimes(1);
    expect(isTaken).toHaveBeenCalledWith('bella');
  });

  it('appends -2 when base slug is taken', async () => {
    const isTaken = vi
      .fn()
      .mockResolvedValueOnce(true) // bella is taken
      .mockResolvedValueOnce(false); // bella-2 is available

    const result = await generateUniqueSlug('Bella', isTaken);

    expect(result).toBe('bella-2');
    expect(isTaken).toHaveBeenCalledTimes(2);
    expect(isTaken).toHaveBeenNthCalledWith(1, 'bella');
    expect(isTaken).toHaveBeenNthCalledWith(2, 'bella-2');
  });

  it('increments suffix until unique slug is found', async () => {
    const isTaken = vi
      .fn()
      .mockResolvedValueOnce(true) // bella is taken
      .mockResolvedValueOnce(true) // bella-2 is taken
      .mockResolvedValueOnce(true) // bella-3 is taken
      .mockResolvedValueOnce(false); // bella-4 is available

    const result = await generateUniqueSlug('Bella', isTaken);

    expect(result).toBe('bella-4');
    expect(isTaken).toHaveBeenCalledTimes(4);
  });

  it('throws error when max attempts exhausted (default 25)', async () => {
    const isTaken = vi.fn().mockResolvedValue(true); // Always taken

    await expect(generateUniqueSlug('Bella', isTaken)).rejects.toThrow(
      'Unable to generate a unique slug',
    );

    expect(isTaken).toHaveBeenCalledTimes(25); // 1 base + 24 attempts (2-25)
  });

  it('respects custom maxAttempts option', async () => {
    const isTaken = vi.fn().mockResolvedValue(true); // Always taken

    await expect(generateUniqueSlug('Bella', isTaken, { maxAttempts: 5 })).rejects.toThrow(
      'Unable to generate a unique slug',
    );

    expect(isTaken).toHaveBeenCalledTimes(5); // 1 base + 4 attempts (2-5)
  });

  it('uses fallback for empty name with timestamp', async () => {
    const isTaken = vi.fn().mockResolvedValue(false);

    const beforeTime = Date.now();
    const result = await generateUniqueSlug('', isTaken);
    const afterTime = Date.now();

    expect(result).toMatch(/^puppy-\d+$/);

    // Extract timestamp from slug
    const timestamp = parseInt(result.replace('puppy-', ''), 10);
    expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(timestamp).toBeLessThanOrEqual(afterTime);
  });

  it('uses fallback for name with only special characters', async () => {
    const isTaken = vi.fn().mockResolvedValue(false);

    const result = await generateUniqueSlug('!!!', isTaken);

    expect(result).toMatch(/^puppy-\d+$/);
  });

  it('handles collision on fallback slug', async () => {
    const isTaken = vi
      .fn()
      .mockResolvedValueOnce(true) // fallback-timestamp is taken
      .mockResolvedValueOnce(false); // fallback-timestamp-2 is available

    const result = await generateUniqueSlug('', isTaken);

    expect(result).toMatch(/^puppy-\d+-2$/);
    expect(isTaken).toHaveBeenCalledTimes(2);
  });

  it('handles async isTaken function correctly', async () => {
    const isTaken = vi.fn().mockImplementation(async (slug: string) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return slug === 'bella';
    });

    const result = await generateUniqueSlug('Bella', isTaken);

    expect(result).toBe('bella-2');
  });

  it('preserves hyphenated names correctly', async () => {
    const isTaken = vi.fn().mockResolvedValue(false);

    const result = await generateUniqueSlug('Charlie-Brown', isTaken);

    expect(result).toBe('charlie-brown');
  });

  it('handles very long names with collision', async () => {
    const longName = 'a'.repeat(100);
    const isTaken = vi
      .fn()
      .mockResolvedValueOnce(true) // truncated slug is taken
      .mockResolvedValueOnce(false); // truncated-2 is available

    const result = await generateUniqueSlug(longName, isTaken);

    // Should be truncated to 80 chars + suffix
    expect(result).toBe('a'.repeat(80) + '-2');
  });

  it('handles name normalization with collision', async () => {
    const isTaken = vi
      .fn()
      .mockResolvedValueOnce(true) // café is taken
      .mockResolvedValueOnce(false); // café-2 is available

    const result = await generateUniqueSlug('Café', isTaken);

    expect(result).toBe('cafe-2');
  });

  it('handles maxAttempts of 1 (only base slug)', async () => {
    const isTaken = vi.fn().mockResolvedValue(true);

    await expect(generateUniqueSlug('Bella', isTaken, { maxAttempts: 1 })).rejects.toThrow(
      'Unable to generate a unique slug',
    );

    expect(isTaken).toHaveBeenCalledTimes(1); // Only base slug
  });

  it('handles names with existing numeric suffixes', async () => {
    const isTaken = vi.fn().mockResolvedValue(false);

    const result = await generateUniqueSlug('Bella-3', isTaken);

    // Should preserve the existing suffix as part of the name
    expect(result).toBe('bella-3');
  });

  it('handles collision on names with existing numeric suffixes', async () => {
    const isTaken = vi
      .fn()
      .mockResolvedValueOnce(true) // bella-3 is taken
      .mockResolvedValueOnce(false); // bella-3-2 is available

    const result = await generateUniqueSlug('Bella-3', isTaken);

    expect(result).toBe('bella-3-2');
  });
});
