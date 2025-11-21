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

function renderContactPage() {
  return render(<ContactPage />);
}

describe('Contact Page', () => {
  it('renders page heading with gradient text', () => {
    renderContactPage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Let's plan your bulldog match/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders hero description', () => {
    renderContactPage();

    expect(
      screen.getByText(/Share a bit about your family, desired timing, and any must-have traits/i),
    ).toBeInTheDocument();
  });

  it('renders Concierge Service badge in hero', () => {
    renderContactPage();

    expect(screen.getByText(/Concierge Service/i)).toBeInTheDocument();
  });

  it('renders business location in hero', () => {
    renderContactPage();

    // Check for location (city, state format)
    expect(screen.getByText(/Montgomery, AL/i)).toBeInTheDocument();
  });

  it('renders business hours in hero', () => {
    renderContactPage();

    expect(screen.getByText(/9am – 7pm CT \(Mon-Sat\)/i)).toBeInTheDocument();
  });

  it('renders breadcrumbs with correct links (sr-only)', () => {
    renderContactPage();

    const nav = screen.getByRole('navigation', { name: /Breadcrumb/i });
    expect(nav).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: /Home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders contact form section with context heading', () => {
    renderContactPage();

    // Check that form context heading is present
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Send an introduction/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders Priority Waitlist feature in form context', () => {
    renderContactPage();

    expect(screen.getByText(/Priority Waitlist/i)).toBeInTheDocument();
    expect(screen.getByText(/Get notified before public listing/i)).toBeInTheDocument();
  });

  it('renders Facetime Meet & Greet feature in form context', () => {
    renderContactPage();

    expect(screen.getByText(/Facetime Meet & Greet/i)).toBeInTheDocument();
    expect(screen.getByText(/Schedule a live video call/i)).toBeInTheDocument();
  });

  it('renders contact form with required fields', () => {
    renderContactPage();

    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/How can we help/i)).toBeInTheDocument();
  });

  it('renders contact method cards', () => {
    renderContactPage();

    // Check for all 3 contact cards
    expect(screen.getByText(/Call or text/i)).toBeInTheDocument();
    expect(screen.getAllByText(/WhatsApp/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Email/i).length).toBeGreaterThan(0);
  });

  it('renders copy buttons for contact methods', () => {
    renderContactPage();

    const copyButtons = screen.getAllByTitle(/Copy to clipboard/i);
    expect(copyButtons.length).toBeGreaterThan(0);
  });

  it('passes accessibility checks', async () => {
    const { container } = renderContactPage();
    await expectNoA11yViolations(container);
    expect(container).toBeTruthy();
  });

  it('has dark theme background', () => {
    const { container } = renderContactPage();

    const mainContainer = container.querySelector('.bg-\\[\\#0B1120\\]');
    expect(mainContainer).toBeInTheDocument();
  });
});
