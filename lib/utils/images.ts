const DEFAULT_PLACEHOLDER = '/reviews/cameron-milo.webp';
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
