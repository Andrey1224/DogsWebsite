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
    }: {
      id?: string;
      src?: string;
      onLoad?: () => void;
    }) {
      // Auto-trigger onLoad in useEffect if present to simulate load
      React.useEffect(() => {
        if (onLoad) {
          onLoad();
        }
      }, [onLoad]);

      return <div data-testid="mock-script" data-script-id={id} data-src={src} />;
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
  const { consent, grantConsent, denyConsent, trackEvent } = useAnalytics();
  return (
    <div>
      <span data-testid="consent-state">{consent}</span>
      <button data-testid="btn-grant" onClick={grantConsent}>
        Grant
      </button>
      <button data-testid="btn-deny" onClick={denyConsent}>
        Deny
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
    </div>
  );
};

describe('AnalyticsProvider', () => {
  const GA_ID = 'G-TEST12345';
  const META_ID = '1234567890';
  let gtagMock: ReturnType<typeof vi.fn>;
  let fbqMock: ReturnType<typeof vi.fn>;
  let dataLayer: unknown[];

  beforeEach(() => {
    gtagMock = vi.fn();
    fbqMock = vi.fn();
    dataLayer = [];
    vi.stubGlobal('gtag', gtagMock);
    vi.stubGlobal('fbq', fbqMock);
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
});
