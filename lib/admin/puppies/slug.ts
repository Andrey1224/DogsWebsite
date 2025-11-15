const FALLBACK_SLUG_PREFIX = 'puppy';
const MAX_SLUG_ATTEMPTS = 25;

export function slugifyName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80);
}

export async function generateUniqueSlug(
  name: string,
  isTaken: (candidate: string) => Promise<boolean>,
  options?: { maxAttempts?: number },
): Promise<string> {
  const baseSlug = slugifyName(name) || `${FALLBACK_SLUG_PREFIX}-${Date.now()}`;
  const maxAttempts = options?.maxAttempts ?? MAX_SLUG_ATTEMPTS;

  if (!(await isTaken(baseSlug))) {
    return baseSlug;
  }

  for (let attempt = 2; attempt <= maxAttempts; attempt += 1) {
    const candidate = `${baseSlug}-${attempt}`;
    if (!(await isTaken(candidate))) {
      return candidate;
    }
  }

  throw new Error('Unable to generate a unique slug. Please try a different name.');
}
