/**
 * Contact Page Tests
 *
 * Tests the Contact page rendering, accessibility, and proper integration
 * of ContactForm and ContactCards components with new dark UI.
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import ContactPage from './page';
import { expectNoA11yViolations } from '@/tests/helpers/axe';
import { getPuppyBySlug } from '@/lib/supabase/queries';

vi.mock('@/lib/supabase/queries', () => ({
  getPuppyBySlug: vi.fn().mockResolvedValue(null),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    prefetch,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }) => {
    void prefetch;
    return <a {...props}>{children}</a>;
  },
}));

vi.mock('@/components/analytics-provider', () => {
  const mockTrack = vi.fn();
  const Provider = ({ children }: { children: ReactNode }) => <>{children}</>;
  const useAnalytics = () => ({
    consent: 'granted' as const,
    grantConsent: vi.fn(),
    denyConsent: vi.fn(),
    trackEvent: mockTrack,
  });
  return { AnalyticsProvider: Provider, useAnalytics };
});

vi.mock('@hcaptcha/react-hcaptcha', () => ({
  __esModule: true,
  default: ({ onVerify }: { onVerify: (token: string) => void }) => (
    <div data-testid="hcaptcha-mock" onClick={() => onVerify('mock-captcha-token')} />
  ),
}));

async function renderContactPage(searchParams: { puppy?: string } = {}) {
  const Page = await ContactPage({ searchParams: Promise.resolve(searchParams) });
  return render(Page);
}

describe('Contact Page', () => {
  it('renders page heading with gradient text', async () => {
    await renderContactPage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Let's plan your bulldog match/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders hero description', async () => {
    await renderContactPage();

    expect(
      screen.getByText(/Share a bit about your family, desired timing, and any must-have traits/i),
    ).toBeInTheDocument();
  });

  it('renders Concierge Service badge in hero', async () => {
    await renderContactPage();

    expect(screen.getByText(/Concierge Service/i)).toBeInTheDocument();
  });

  it('renders business location in hero', async () => {
    await renderContactPage();

    // Check for location (city, state format - matches whatever is in BUSINESS_PROFILE)
    expect(screen.getByText(/[A-Za-z]+,\s+AL/i)).toBeInTheDocument();
  });

  it('renders business hours in hero', async () => {
    await renderContactPage();

    expect(screen.getByText(/9am – 7pm CT \(Mon-Sat\)/i)).toBeInTheDocument();
  });

  it('renders breadcrumbs with correct links (sr-only)', async () => {
    await renderContactPage();

    const nav = screen.getByRole('navigation', { name: /Breadcrumb/i });
    expect(nav).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: /Home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders contact form section with context heading', async () => {
    await renderContactPage();

    // Check that form context heading is present
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Send an introduction/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders Priority Waitlist feature in form context', async () => {
    await renderContactPage();

    expect(screen.getByText(/Priority Waitlist/i)).toBeInTheDocument();
    expect(screen.getByText(/Get notified before public listing/i)).toBeInTheDocument();
  });

  it('renders Facetime Meet & Greet feature in form context', async () => {
    await renderContactPage();

    expect(screen.getByText(/Facetime Meet & Greet/i)).toBeInTheDocument();
    expect(screen.getByText(/Schedule a live video call/i)).toBeInTheDocument();
  });

  it('renders contact form with required fields', async () => {
    await renderContactPage();

    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/How can we help/i)).toBeInTheDocument();
  });

  it('renders contact method cards', async () => {
    await renderContactPage();

    // Check for all contact cards. Telegram is intentionally omitted (see
    // lib/config/contact.ts TELEGRAM_CONFIRMED) until a confirmed @handle is available.
    expect(screen.getByText(/Business phone/i)).toBeInTheDocument();
    expect(screen.getAllByText(/WhatsApp/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/Telegram/i).length).toBe(0);
    expect(screen.getAllByText(/Email/i).length).toBeGreaterThan(0);
  });

  it('renders copy buttons for contact methods', async () => {
    await renderContactPage();

    const copyButtons = screen.getAllByTitle(/Copy to clipboard/i);
    expect(copyButtons.length).toBeGreaterThan(0);
  });

  it('passes accessibility checks', async () => {
    const { container } = await renderContactPage();
    await expectNoA11yViolations(container);
    expect(container).toBeTruthy();
  });

  it('has dark theme background', async () => {
    const { container } = await renderContactPage();

    const mainContainer = container.querySelector('.bg-\\[\\#0B1120\\]');
    expect(mainContainer).toBeInTheDocument();
  });

  describe('with a ?puppy= query param', () => {
    it('prefills the heading, description, and message with the puppy name', async () => {
      vi.mocked(getPuppyBySlug).mockResolvedValueOnce({
        id: 'puppy-1',
        slug: 'sunny',
        name: 'Sunny',
      } as never);

      await renderContactPage({ puppy: 'sunny' });

      expect(
        screen.getByRole('heading', { level: 1, name: /Let's talk about Sunny/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/schedule a video call or visit for Sunny/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/How can we help/i)).toHaveValue("I'm interested in Sunny. ");
    });

    it('falls back to the default heading when the puppy slug is not found', async () => {
      vi.mocked(getPuppyBySlug).mockResolvedValueOnce(null as never);

      await renderContactPage({ puppy: 'does-not-exist' });

      expect(
        screen.getByRole('heading', { level: 1, name: /Let's plan your bulldog match/i }),
      ).toBeInTheDocument();
    });
  });
});
