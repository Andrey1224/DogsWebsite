/**
 * FAQ Page Tests
 *
 * Tests the FAQ page rendering, accessibility, and structured data.
 * Ensures all FAQ items are displayed correctly and links are functional.
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
  it('renders page heading and description', () => {
    renderFaqPage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Frequently asked questions about our bulldog program/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/Explore the breeding standards/i)).toBeInTheDocument();
  });

  it('renders all FAQ items', () => {
    renderFaqPage();

    // Check for specific FAQ questions
    expect(
      screen.getByRole('heading', { level: 2, name: /How do I place a deposit?/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: /Is the deposit refundable?/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /What are the pickup and delivery options?/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: /What documents come with the puppy?/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: /Can we visit before reserving?/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: /How do I know the site is legitimate?/i }),
    ).toBeInTheDocument();
  });

  it('renders FAQ answers with correct information', () => {
    renderFaqPage();

    expect(
      screen.getByText(/Open the puppy's detail page and tap Reserve with Stripe or PayPal/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Deposits are non-refundable because we pause all other inquiries/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/You can pick up in Montgomery by appointment or choose courier delivery/i),
    ).toBeInTheDocument();
  });

  it('renders breadcrumbs with correct links', () => {
    renderFaqPage();

    const homeLink = screen.getByRole('link', { name: /Home/i });
    expect(homeLink).toHaveAttribute('href', '/');

    // FAQ breadcrumb should be plain text (current page)
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  it('renders contact CTA section', () => {
    renderFaqPage();

    expect(screen.getByText(/Still have a question?/i)).toBeInTheDocument();
    expect(
      screen.getByText(/We love connecting with future bulldog families/i),
    ).toBeInTheDocument();

    const contactLink = screen.getByRole('link', { name: /Contact us/i });
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('renders JSON-LD structured data script', () => {
    const { container } = renderFaqPage();

    const jsonLdScript = container.querySelector('script[type="application/ld+json"]');
    expect(jsonLdScript).toBeInTheDocument();

    if (jsonLdScript) {
      const structuredData = JSON.parse(jsonLdScript.textContent || '{}');
      expect(structuredData['@type']).toBe('FAQPage');
      expect(structuredData.mainEntity).toBeInstanceOf(Array);
      expect(structuredData.mainEntity.length).toBeGreaterThan(0);
      expect(structuredData.mainEntity[0]['@type']).toBe('Question');
    }
  });

  it('passes accessibility checks', async () => {
    const { container } = renderFaqPage();
    await expectNoA11yViolations(container);
    expect(container).toBeTruthy();
  });

  it('renders all FAQ items with proper article structure', () => {
    const { container } = renderFaqPage();

    const articles = container.querySelectorAll('article');
    expect(articles.length).toBe(6); // 6 FAQ items
  });

  it('has proper styling classes for cards', () => {
    const { container } = renderFaqPage();

    const articles = container.querySelectorAll('article');
    articles.forEach((article) => {
      expect(article.className).toContain('rounded-3xl');
      expect(article.className).toContain('border');
      expect(article.className).toContain('bg-card');
    });
  });
});
