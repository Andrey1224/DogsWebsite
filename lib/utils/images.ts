const DEFAULT_PLACEHOLDER = '/images/reviews/cameron-milo.webp';
const ALLOWED_REMOTE_PROTOCOLS = ['http://', 'https://', 'data:', 'blob:'];

export function resolveLocalImage(
  url: string | null | undefined,
  fallback: string = DEFAULT_PLACEHOLDER,
): string {
  if (!url) return fallback;

  if (url.startsWith('/')) {
    return url;
  }

  if (ALLOWED_REMOTE_PROTOCOLS.some((protocol) => url.startsWith(protocol))) {
    return url;
  }

  return fallback;
}

/**
 * Remote (Supabase-hosted) images are served pre-compressed from their own CDN,
 * so we skip Next.js image optimization for them to avoid consuming the
 * Vercel Image Optimization quota on every new upload.
 */
export function isRemoteImage(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}
