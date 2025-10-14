const DEFAULT_PLACEHOLDER = "/reviews/cameron-milo.webp";

export function resolveLocalImage(
  url: string | null | undefined,
  fallback: string = DEFAULT_PLACEHOLDER,
): string {
  if (!url) return fallback;
  if (url.startsWith("/")) return url;
  return fallback;
}
