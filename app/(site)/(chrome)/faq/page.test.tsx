/**
 * FAQ Page Tests
 *
 * Tests the FAQ page rendering, accessibility, and structured data.
 * Tests new dark UI with search, categories, and accordion.
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import FaqPage from './page';
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

function renderFaqPage() {
  return render(<FaqPage />);
}

describe('FAQ Page', () => {
  it('renders page heading', () => {
    renderFaqPage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /How can we help you/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders Support Center badge', () => {
    renderFaqPage();

    expect(screen.getByText(/Support Center/i)).toBeInTheDocument();
  });

  it('renders description', () => {
    renderFaqPage();

    expect(screen.getByText(/Explore the breeding standards/i)).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderFaqPage();

    expect(screen.getByPlaceholderText(/Search for/i)).toBeInTheDocument();
  });

  it('renders category headings', () => {
    renderFaqPage();

    expect(
      screen.getByRole('heading', { level: 2, name: /Reservation & Payments/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: /Pickup & Delivery/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: /Health & Veterinary/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: /Breeding Program/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /AKC Registration/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Ongoing Support/i })).toBeInTheDocument();
  });

  it('renders FAQ questions as accordion buttons', () => {
    renderFaqPage();

    // Questions are h3 inside buttons
    expect(
      screen.getByRole('heading', { level: 3, name: /How do I place a deposit?/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 3, name: /Is the deposit refundable?/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 3, name: /What are the pickup and delivery options?/i }),
    ).toBeInTheDocument();
  });

  it('renders breadcrumbs (sr-only for SEO)', () => {
    renderFaqPage();

    const nav = screen.getByRole('navigation', { name: /Breadcrumb/i });
    expect(nav).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: /Home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders contact CTA section', () => {
    renderFaqPage();

    expect(
      screen.getByRole('heading', { level: 2, name: /Still have questions/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We love connecting with future bulldog families/i),
    ).toBeInTheDocument();
  });

  it('renders contact action links', () => {
    renderFaqPage();

    const chatLink = screen.getByRole('link', { name: /Chat with us/i });
    expect(chatLink).toHaveAttribute('href', '/contact');

    const emailLink = screen.getByRole('link', { name: /Email Support/i });
    expect(emailLink).toHaveAttribute('href', '/contact');
  });

  it('renders JSON-LD structured data script', () => {
    const { container } = renderFaqPage();

    const jsonLdScripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(jsonLdScripts.length).toBeGreaterThan(0);

    // Find the FAQPage schema
    const schemas = Array.from(jsonLdScripts).map((script) =>
      JSON.parse(script.textContent || '{}'),
    );
    const faqSchema = schemas.find((schema) => schema['@type'] === 'FAQPage');

    expect(faqSchema).toBeTruthy();
    expect(faqSchema?.mainEntity).toBeInstanceOf(Array);
    expect(faqSchema?.mainEntity.length).toBeGreaterThan(0);
    expect(faqSchema?.mainEntity[0]['@type']).toBe('Question');
  });

  it('passes accessibility checks', async () => {
    const { container } = renderFaqPage();
    await expectNoA11yViolations(container);
    expect(container).toBeTruthy();
  });

  it('has dark theme background', () => {
    const { container } = renderFaqPage();

    const mainContainer = container.querySelector('.bg-\\[\\#0B1120\\]');
    expect(mainContainer).toBeInTheDocument();
  });

  it('renders accordion buttons for FAQ items', () => {
    renderFaqPage();

    // FAQ items are rendered as buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(25);
  });
});
