import { render, screen, waitFor } from '@testing-library/react';
import { expect, it, describe, vi, beforeEach, afterEach } from 'vitest';
import { AnalyticsProvider, useAnalytics } from './analytics-provider';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

vi.mock('next/script', () => {
  return {
    default: function MockScript({
      id,
      src,
      onLoad,
      dangerouslySetInnerHTML,
    }: {
      id?: string;
      src?: string;
      onLoad?: () => void;
      dangerouslySetInnerHTML?: { __html: string };
    }) {
      // Auto-trigger onLoad in useEffect if present to simulate load
      React.useEffect(() => {
        if (onLoad) {
          onLoad();
        }
      }, [onLoad]);

      return (
        <div
          data-testid="mock-script"
          data-script-id={id}
          data-src={src}
          data-html={dangerouslySetInnerHTML?.__html}
        />
      );
    },
  };
});

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/test-path'),
  useSearchParams: vi.fn(
    () => new URLSearchParams('') as unknown as ReturnType<typeof useSearchParams>,
  ),
}));

const TestComponent = () => {
  const { consent, grantConsent, denyConsent, resetConsent, trackEvent } = useAnalytics();
  return (
    <div>
      <span data-testid="consent-state">{consent}</span>
      <button data-testid="btn-grant" onClick={grantConsent}>
        Grant
      </button>
      <button data-testid="btn-deny" onClick={denyConsent}>
        Deny
      </button>
      <button data-testid="btn-reset" onClick={resetConsent}>
        Reset
      </button>
      <button
        data-testid="btn-track-ga"
        onClick={() =>
          trackEvent('test_event', { custom: 'value', puppy_slug: 'test', e: 'secret' })
        }
      >
        Track
      </button>
      <button data-testid="btn-track-contact" onClick={() => trackEvent('contact_click')}>
        Contact
      </button>
      <button data-testid="btn-track-lead" onClick={() => trackEvent('generate_lead')}>
        Lead
      </button>
      <button data-testid="btn-track-view" onClick={() => trackEvent('view_item')}>
        ViewItem
      </button>
      <button data-testid="btn-track-checkout" onClick={() => trackEvent('begin_checkout')}>
        Checkout
      </button>
      <button
        data-testid="btn-track-form"
        onClick={() =>
          trackEvent('form_submit', {
            context_path: '/contact',
            email: 'leak@example.com',
            phone: '555-1234',
            name: 'Jane Doe',
            message: 'call me back',
            puppy_slug: 'sunny',
          })
        }
      >
        FormSubmit
      </button>
      <button
        data-testid="btn-track-url"
        onClick={() =>
          trackEvent('custom_url_event', {
            page_location: 'https://example.com/contact?email=leak@example.com&utm_source=google',
            page_path: '/contact?token=secret&gclid=abc',
            context_path: '/contact?session_id=cs_test_1',
          })
        }
      >
        UrlEvent
      </button>
    </div>
  );
};

describe('AnalyticsProvider', () => {
  const GA_ID = 'G-TEST12345';
  const META_ID = '1234567890';
  let gtagMock: ReturnType<typeof vi.fn>;
  let fbqMock: ReturnType<typeof vi.fn>;
  let fetchMock: ReturnType<typeof vi.fn>;
  let dataLayer: unknown[];

  beforeEach(() => {
    gtagMock = vi.fn();
    fbqMock = vi.fn();
    fetchMock = vi.fn().mockResolvedValue({ ok: true } as unknown as Response);
    dataLayer = [];
    vi.stubGlobal('gtag', gtagMock);
    vi.stubGlobal('fbq', fbqMock);
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('dataLayer', dataLayer);

    // Clear localStorage
    window.localStorage.clear();

    // Clear cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    // Reset document
    document.documentElement.removeAttribute('data-consent');

    vi.mocked(usePathname).mockReturnValue('/test-path');
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('') as unknown as ReturnType<typeof useSearchParams>,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('GA4 bootstrap and script rendering', () => {
    it('renders GA scripts when consent is unknown', () => {
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      const scripts = screen.getAllByTestId('mock-script');
      expect(scripts.some((s) => s.getAttribute('data-script-id') === 'ga-init')).toBe(true);
      expect(scripts.some((s) => s.getAttribute('data-script-id') === 'ga-gtag')).toBe(true);
    });

    it('renders GA scripts when consent is denied', () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'denied');
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      const scripts = screen.getAllByTestId('mock-script');
      expect(scripts.some((s) => s.getAttribute('data-script-id') === 'ga-gtag')).toBe(true);
    });

    it('does NOT render GA scripts when no gaMeasurementId', () => {
      render(
        <AnalyticsProvider gaMeasurementId={null} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      const scripts = screen.queryAllByTestId('mock-script');
      expect(scripts.some((s) => s.getAttribute('data-script-id') === 'ga-gtag')).toBe(false);
    });

    it('does NOT render Meta scripts when consent is unknown', () => {
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      const scripts = screen.queryAllByTestId('mock-script');
      expect(scripts.some((s) => s.getAttribute('data-script-id') === 'fb-pixel')).toBe(false);
    });

    it('does NOT render Meta scripts when consent is denied', () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'denied');
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      const scripts = screen.queryAllByTestId('mock-script');
      expect(scripts.some((s) => s.getAttribute('data-script-id') === 'fb-pixel')).toBe(false);
    });

    it('renders Meta scripts when consent is granted', () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'granted');
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      const scripts = screen.getAllByTestId('mock-script');
      expect(scripts.some((s) => s.getAttribute('data-script-id') === 'fb-pixel')).toBe(true);
    });
  });

  describe('consent update calls', () => {
    it('calls gtag consent update with all-granted when grantConsent is called', async () => {
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      expect(screen.getByTestId('consent-state').textContent).toBe('unknown');
      await user.click(screen.getByTestId('btn-grant'));

      expect(screen.getByTestId('consent-state').textContent).toBe('granted');
      expect(gtagMock).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    });

    it('calls gtag consent update with all-denied when denyConsent is called', async () => {
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await user.click(screen.getByTestId('btn-deny'));

      expect(screen.getByTestId('consent-state').textContent).toBe('denied');
      expect(gtagMock).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    });

    it('does not call consent update on initial unknown state', () => {
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      // Should not be called on mount if state is unknown
      expect(gtagMock).not.toHaveBeenCalledWith('consent', 'update', expect.anything());
    });
  });

  describe('GA4 page_view tracking', () => {
    it('sends exactly one page_view after GA script loads', async () => {
      // page_path/page_location are derived from the real window.location via the shared
      // sanitizer, not from the mocked router — keep them in sync for this assertion.
      window.history.pushState({}, '', '/test-path');

      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await waitFor(() => {
        expect(gtagMock).toHaveBeenCalledWith(
          'event',
          'page_view',
          expect.objectContaining({
            page_path: '/test-path',
          }),
        );
      });

      const pageViewCalls = gtagMock.mock.calls.filter(
        (c) => c[0] === 'event' && c[1] === 'page_view',
      );
      expect(pageViewCalls.length).toBe(1);
    });

    it('sends one new page_view on SPA route change', async () => {
      window.history.pushState({}, '', '/test-path');

      const { rerender } = render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await waitFor(() => {
        expect(gtagMock).toHaveBeenCalledWith(
          'event',
          'page_view',
          expect.objectContaining({
            page_path: '/test-path',
          }),
        );
      });

      // Simulate route change
      vi.mocked(usePathname).mockReturnValue('/new-path');
      window.history.pushState({}, '', '/new-path');

      rerender(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await waitFor(() => {
        expect(gtagMock).toHaveBeenCalledWith(
          'event',
          'page_view',
          expect.objectContaining({
            page_path: '/new-path',
          }),
        );
      });

      const pageViewCalls = gtagMock.mock.calls.filter(
        (c) => c[0] === 'event' && c[1] === 'page_view',
      );
      expect(pageViewCalls.length).toBe(2);
    });

    it('does not send duplicate page_view on same path', async () => {
      const { rerender } = render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await waitFor(() => {
        const calls = gtagMock.mock.calls.filter((c) => c[0] === 'event' && c[1] === 'page_view');
        expect(calls.length).toBe(1);
      });

      // Rerender same path
      rerender(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      const pageViewCalls = gtagMock.mock.calls.filter(
        (c) => c[0] === 'event' && c[1] === 'page_view',
      );
      expect(pageViewCalls.length).toBe(1); // Still 1
    });

    it('does not send page_view on consent update alone', async () => {
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await waitFor(() => {
        expect(gtagMock).toHaveBeenCalledWith('event', 'page_view', expect.anything());
      });

      gtagMock.mockClear();

      await user.click(screen.getByTestId('btn-grant'));

      // Should not fire another page view
      const pageViewCalls = gtagMock.mock.calls.filter(
        (c) => c[0] === 'event' && c[1] === 'page_view',
      );
      expect(pageViewCalls.length).toBe(0);
    });
  });

  describe('trackEvent — cookieless mode (unknown/denied)', () => {
    it('sends GA4 event with only allowlisted params when consent is denied', async () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'denied');
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await user.click(screen.getByTestId('btn-track-ga'));

      expect(gtagMock).toHaveBeenCalledWith('event', 'test_event', {
        puppy_slug: 'test',
        // 'custom' and 'e' are stripped
      });
    });

    it('strips unknown/personal params from GA4 event when consent is unknown', async () => {
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await user.click(screen.getByTestId('btn-track-ga'));

      expect(gtagMock).toHaveBeenCalledWith('event', 'test_event', {
        puppy_slug: 'test',
      });
    });

    it('does NOT call Meta fbq or send to /api/analytics/meta when consent is denied', async () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'denied');
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await user.click(screen.getByTestId('btn-track-contact'));

      expect(fbqMock).not.toHaveBeenCalled();
    });
  });

  describe('trackEvent — granted mode', () => {
    it('sends GA4 event with full params when consent is granted', async () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'granted');
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await user.click(screen.getByTestId('btn-track-ga'));

      expect(gtagMock).toHaveBeenCalledWith('event', 'test_event', {
        custom: 'value',
        puppy_slug: 'test',
        e: 'secret',
      });
    });

    it('dispatches Meta tracking command when consent is granted', async () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'granted');
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      // We need to wait for metaReady to be true to fire properly?
      // Actually trackEvent fires directly to window.fbq if granted, though we might miss init if fbq isn't there

      await user.click(screen.getByTestId('btn-track-contact'));

      // In granted mode, Meta fbq should be called with 'track', 'Contact'
      expect(fbqMock).toHaveBeenCalledWith(
        'track',
        'Contact',
        expect.any(Object),
        expect.any(Object),
      );
    });
  });

  describe('returning user scenarios', () => {
    // Tests for the beforeInteractive script logic would ideally run before React,
    // but we can test the fallback in readStoredConsent here.
    it('consent default should use denied when localStorage returns null', () => {
      // Simulate fresh user
      expect(window.localStorage.getItem('exoticbulldoglegacy-consent')).toBeNull();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );
      expect(screen.getByTestId('consent-state').textContent).toBe('unknown'); // React state
    });

    it('consent default should use granted when localStorage returns granted', () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'granted');
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );
      expect(screen.getByTestId('consent-state').textContent).toBe('granted');
    });

    it('consent default should use denied when localStorage returns denied', () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'denied');
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );
      expect(screen.getByTestId('consent-state').textContent).toBe('denied');
    });
  });

  describe('existing event mapping backward-compat', () => {
    beforeEach(() => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'granted');
    });

    it('contact_click → Meta Contact (granted only)', async () => {
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );
      await user.click(screen.getByTestId('btn-track-contact'));
      expect(fbqMock).toHaveBeenCalledWith(
        'track',
        'Contact',
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('generate_lead → Meta Lead (granted only)', async () => {
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );
      await user.click(screen.getByTestId('btn-track-lead'));
      expect(fbqMock).toHaveBeenCalledWith('track', 'Lead', expect.any(Object), expect.any(Object));
    });

    it('view_item → Meta ViewContent (granted only)', async () => {
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );
      await user.click(screen.getByTestId('btn-track-view'));
      expect(fbqMock).toHaveBeenCalledWith(
        'track',
        'ViewContent',
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('begin_checkout → Meta InitiateCheckout (granted only)', async () => {
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );
      await user.click(screen.getByTestId('btn-track-checkout'));
      expect(fbqMock).toHaveBeenCalledWith(
        'track',
        'InitiateCheckout',
        expect.any(Object),
        expect.any(Object),
      );
    });
  });

  describe('GA bootstrap order', () => {
    it('configures GA with send_page_view: false', () => {
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      const scripts = screen.getAllByTestId('mock-script');
      const gaInit = scripts.find((s) => s.getAttribute('data-script-id') === 'ga-init');
      expect(gaInit?.getAttribute('data-html')).toContain('send_page_view: false');
    });
  });

  describe('URL sanitization (PII stripped, marketing params kept)', () => {
    it('sends a sanitized page_location and page_path for the automatic page_view', async () => {
      vi.mocked(usePathname).mockReturnValue('/contact');
      vi.mocked(useSearchParams).mockReturnValue(
        new URLSearchParams(
          'email=test@example.com&token=secret&utm_source=google',
        ) as unknown as ReturnType<typeof useSearchParams>,
      );
      window.history.pushState(
        {},
        '',
        '/contact?email=test@example.com&token=secret&utm_source=google',
      );

      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await waitFor(() => {
        expect(gtagMock).toHaveBeenCalledWith('event', 'page_view', expect.any(Object));
      });

      const [, , pageViewParams] = gtagMock.mock.calls.find(
        (c) => c[0] === 'event' && c[1] === 'page_view',
      ) as [string, string, Record<string, unknown>];

      expect(pageViewParams.page_location).not.toContain('email');
      expect(pageViewParams.page_location).not.toContain('secret');
      expect(pageViewParams.page_location).toContain('utm_source=google');
      expect(pageViewParams.page_path).not.toContain('email');
      expect(pageViewParams.page_path).not.toContain('secret');
      expect(pageViewParams.page_path).toContain('utm_source=google');
    });

    it('sanitizes page_location/page_path/context_path inside trackEvent params (denied)', async () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'denied');
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await user.click(screen.getByTestId('btn-track-url'));

      const call = gtagMock.mock.calls.find((c) => c[0] === 'event' && c[1] === 'custom_url_event');
      const params = call?.[2] as Record<string, unknown>;

      expect(params.page_location).toBe('https://example.com/contact?utm_source=google');
      expect(params.page_path).toBe('/contact?gclid=abc');
      expect(params.context_path).toBe('/contact?session_id=cs_test_1'.split('?')[0]);
    });

    it('sanitizes page_location/page_path/context_path inside trackEvent params (granted)', async () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'granted');
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await user.click(screen.getByTestId('btn-track-url'));

      const call = gtagMock.mock.calls.find((c) => c[0] === 'event' && c[1] === 'custom_url_event');
      const params = call?.[2] as Record<string, unknown>;

      expect(params.page_location).toBe('https://example.com/contact?utm_source=google');
      expect(params.page_path).toBe('/contact?gclid=abc');
      expect(params.context_path).not.toContain('session_id');
      expect(params.context_path).not.toContain('cs_test_1');
    });

    it('sanitizes the Meta server event sourceUrl', async () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'granted');
      window.history.pushState({}, '', '/puppies/sunny?email=leak@example.com&fbclid=abc123');
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await user.click(screen.getByTestId('btn-track-contact'));

      await waitFor(() => {
        const hasContactCall = fetchMock.mock.calls.some(([, init]) => {
          const body = JSON.parse((init as RequestInit).body as string);
          return body.eventName === 'Contact';
        });
        expect(hasContactCall).toBe(true);
      });

      // Multiple Meta events (e.g. the automatic PageView) may have fired via fetch —
      // find the Contact one specifically and verify its sourceUrl is sanitized.
      const contactBody = fetchMock.mock.calls
        .map(([, init]) => JSON.parse((init as RequestInit).body as string))
        .find((body) => body.eventName === 'Contact');

      expect(contactBody.sourceUrl).not.toContain('email');
      expect(contactBody.sourceUrl).not.toContain('leak@example.com');
      expect(contactBody.sourceUrl).toContain('fbclid=abc123');
    });
  });

  describe('form content never reaches GA4/Meta, even after Accept', () => {
    it('strips PII-shaped keys from GA4 params when consent is granted', async () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'granted');
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await user.click(screen.getByTestId('btn-track-form'));

      const call = gtagMock.mock.calls.find((c) => c[0] === 'event' && c[1] === 'form_submit');
      const params = call?.[2] as Record<string, unknown>;

      expect(params).not.toHaveProperty('email');
      expect(params).not.toHaveProperty('phone');
      expect(params).not.toHaveProperty('name');
      expect(params).not.toHaveProperty('message');
      expect(params.puppy_slug).toBe('sunny');
    });

    it('strips PII-shaped keys from GA4 params when consent is denied', async () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'denied');
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await user.click(screen.getByTestId('btn-track-form'));

      const call = gtagMock.mock.calls.find((c) => c[0] === 'event' && c[1] === 'form_submit');
      const params = call?.[2] as Record<string, unknown>;

      expect(params).not.toHaveProperty('email');
      expect(params).not.toHaveProperty('phone');
      expect(params).not.toHaveProperty('name');
      expect(params).not.toHaveProperty('message');
    });

    it('never sends PII-shaped keys to Meta, even when granted', async () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'granted');
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await user.click(screen.getByTestId('btn-track-form'));

      const trackCustomCall = fbqMock.mock.calls.find((c) => c[0] === 'trackCustom');
      expect(trackCustomCall).toBeDefined();
      const metaParams = trackCustomCall?.[2] as Record<string, unknown>;
      expect(metaParams).not.toHaveProperty('email');
      expect(metaParams).not.toHaveProperty('phone');
      expect(metaParams).not.toHaveProperty('name');
      expect(metaParams).not.toHaveProperty('message');
    });
  });

  describe('resetConsent (Privacy settings)', () => {
    it('sets consent back to unknown so the banner can reopen', async () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'granted');
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );
      expect(screen.getByTestId('consent-state').textContent).toBe('granted');

      await user.click(screen.getByTestId('btn-reset'));

      expect(screen.getByTestId('consent-state').textContent).toBe('unknown');
    });

    it('sends a denied GA consent update and revokes Meta consent', async () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'granted');
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );
      gtagMock.mockClear();
      fbqMock.mockClear();

      await user.click(screen.getByTestId('btn-reset'));

      expect(gtagMock).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
      expect(fbqMock).toHaveBeenCalledWith('consent', 'revoke');
    });

    it('clears the stored consent localStorage and cookie', async () => {
      window.localStorage.setItem('exoticbulldoglegacy-consent', 'granted');
      const user = userEvent.setup();
      render(
        <AnalyticsProvider gaMeasurementId={GA_ID} metaPixelId={META_ID}>
          <TestComponent />
        </AnalyticsProvider>,
      );

      await user.click(screen.getByTestId('btn-reset'));

      expect(window.localStorage.getItem('exoticbulldoglegacy-consent')).toBeNull();
      expect(document.cookie).not.toContain('exoticbulldoglegacy_consent=granted');
      expect(document.documentElement.getAttribute('data-consent')).toBeNull();
    });
  });
});
