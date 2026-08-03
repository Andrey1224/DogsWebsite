type FacebookPixel = NonNullable<Window['fbq']>;
type FbqCommand = Parameters<FacebookPixel>;

/**
 * Creates the queue shape used by Meta's official browser snippet until
 * fbevents.js replaces callMethod. A compatible bootstrap avoids duplicate
 * version warnings and preserves events fired while the script is loading.
 */
export function ensureMetaPixelQueue(): FacebookPixel {
  if (window.fbq) return window.fbq;

  const placeholder: FacebookPixel = ((...args: FbqCommand) => {
    if (placeholder.callMethod) {
      placeholder.callMethod(...args);
      return;
    }
    (placeholder.queue ||= []).push(args);
  }) as FacebookPixel;

  placeholder.queue = [];
  placeholder.loaded = true;
  placeholder.push = placeholder;
  placeholder.version = '2.0';
  window.fbq = placeholder;
  window._fbq = placeholder;

  return placeholder;
}
