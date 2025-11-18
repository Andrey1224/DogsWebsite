/**
 * Policies Page Tests
 *
 * Tests the Policies page rendering, accessibility, and structured data.
 * Ensures all policy sections are displayed correctly.
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import PoliciesPage from './page';
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

function renderPoliciesPage() {
  return render(<PoliciesPage />);
}

describe('Policies Page', () => {
  it('renders page heading and description', () => {
    renderPoliciesPage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Clear policies for a transparent adoption journey/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/We operate with clarity and care so every family knows what to expect/i),
    ).toBeInTheDocument();
  });

  it('renders all policy sections', () => {
    renderPoliciesPage();

    expect(screen.getByRole('heading', { level: 2, name: /Deposit policy/i })).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: /Refunds & exchanges/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: /Health guarantee/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: /Delivery & pickup/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: /Privacy & payments/i }),
    ).toBeInTheDocument();
  });

  it('renders deposit policy content correctly', () => {
    renderPoliciesPage();

    expect(screen.getByText(/A \$300 deposit reserves your selected puppy/i)).toBeInTheDocument();

    expect(screen.getByText(/deposits are non-refundable/i)).toBeInTheDocument();
  });

  it('renders refunds policy content correctly', () => {
    renderPoliciesPage();

    expect(
      screen.getByText(
        /Once a puppy is reserved, refunds are not provided unless a licensed veterinarian/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders health guarantee content correctly', () => {
    renderPoliciesPage();

    expect(
      screen.getByText(/Every puppy receives a comprehensive exam from our licensed veterinarian/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /We guarantee against life-threatening congenital conditions for 12 months/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders delivery and pickup content correctly', () => {
    renderPoliciesPage();

    expect(
      screen.getByText(/Pickup takes place in Montgomery, Alabama by appointment only/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Courier delivery or flight nanny transport is available/i),
    ).toBeInTheDocument();
  });

  it('renders privacy and payments content correctly', () => {
    renderPoliciesPage();

    expect(
      screen.getByText(/We process payments exclusively through Stripe and PayPal/i),
    ).toBeInTheDocument();

    expect(screen.getByText(/no wire transfers or cash apps/i)).toBeInTheDocument();
  });

  it('renders breadcrumbs with correct links', () => {
    renderPoliciesPage();

    const homeLink = screen.getByRole('link', { name: /Home/i });
    expect(homeLink).toHaveAttribute('href', '/');

    // Policies breadcrumb should be in navigation (current page)
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveTextContent('Policies');
  });

  it('renders documents section', () => {
    renderPoliciesPage();

    expect(screen.getByText(/Documents & contracts/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Adoption contracts, medical records, and AKC paperwork/i),
    ).toBeInTheDocument();
  });

  it('renders JSON-LD structured data script', () => {
    const { container } = renderPoliciesPage();

    const jsonLdScripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(jsonLdScripts.length).toBeGreaterThan(0);

    // Find the MerchantReturnPolicy schema (may have multiple schemas including BreadcrumbList)
    const schemas = Array.from(jsonLdScripts).map((script) =>
      JSON.parse(script.textContent || '{}'),
    );
    const returnPolicySchema = schemas.find((schema) => schema['@type'] === 'MerchantReturnPolicy');

    expect(returnPolicySchema).toBeTruthy();
    expect(returnPolicySchema?.returnPolicyCategory).toBeTruthy();
    expect(returnPolicySchema?.merchantReturnDays).toBeDefined();
  });

  it('passes accessibility checks', async () => {
    const { container } = renderPoliciesPage();
    await expectNoA11yViolations(container);
    expect(container).toBeTruthy();
  });

  it('renders all policy sections with proper article structure', () => {
    const { container } = renderPoliciesPage();

    // 5 policy sections + 1 documents section = 6 articles total
    const articles = container.querySelectorAll('article');
    expect(articles.length).toBeGreaterThanOrEqual(5);
  });

  it('has proper styling classes for cards', () => {
    const { container } = renderPoliciesPage();

    const articles = container.querySelectorAll('article');
    articles.forEach((article) => {
      expect(article.className).toContain('rounded-3xl');
      expect(article.className).toContain('border');
      expect(article.className).toContain('bg-card');
    });
  });

  it('renders section headings as h2 elements', () => {
    renderPoliciesPage();

    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    expect(h2Elements.length).toBeGreaterThanOrEqual(5);
  });
});
