/**
 * Policies Page Tests
 *
 * Tests the Policies page rendering, accessibility, and structured data.
 * Ensures all policy sections are displayed correctly with the new UI.
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
      screen.getByText(
        /We operate with clarity and care so every family knows exactly what to expect/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders hero section with Transparency First badge', () => {
    renderPoliciesPage();

    expect(screen.getByText(/Transparency First/i)).toBeInTheDocument();
    expect(screen.getByText(/No hidden clauses, just honest commitments/i)).toBeInTheDocument();
  });

  it('renders trust signals bar', () => {
    renderPoliciesPage();

    expect(screen.getByText(/AKC Registered/i)).toBeInTheDocument();
    expect(screen.getByText(/Vet Certified/i)).toBeInTheDocument();
    expect(screen.getByText(/Secure Payments/i)).toBeInTheDocument();
  });

  it('renders all 6 policy sections', () => {
    renderPoliciesPage();

    expect(screen.getByRole('heading', { level: 2, name: /Deposit Policy/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Health Guarantee/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Delivery & Pickup/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Refunds & Exchanges/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Privacy & Payments/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Documents & Contracts/i }),
    ).toBeInTheDocument();
  });

  it('renders deposit policy content correctly', () => {
    renderPoliciesPage();

    expect(screen.getByText(/\$300 deposit/i)).toBeInTheDocument();
    expect(screen.getByText(/reserves your selected puppy/i)).toBeInTheDocument();
    expect(screen.getByText(/deposits are non-refundable/i)).toBeInTheDocument();
  });

  it('renders health guarantee content correctly', () => {
    renderPoliciesPage();

    expect(screen.getByText(/Every puppy receives a comprehensive vet exam/i)).toBeInTheDocument();
    expect(
      screen.getByText(/We guarantee against life-threatening congenital conditions for/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/12 months/i)).toBeInTheDocument();
  });

  it('renders delivery and pickup content correctly', () => {
    renderPoliciesPage();

    expect(
      screen.getByText(/Pickup takes place in Montgomery, AL by appointment/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Flight nanny transport/i)).toBeInTheDocument();
  });

  it('renders refunds and exchanges content correctly', () => {
    renderPoliciesPage();

    expect(
      screen.getByText(
        /Once reserved, refunds are not provided unless a licensed veterinarian documents a health concern/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/replacement puppy/i)).toBeInTheDocument();
  });

  it('renders privacy and payments content correctly', () => {
    renderPoliciesPage();

    expect(screen.getByText(/We process payments exclusively through/i)).toBeInTheDocument();
    expect(screen.getByText(/Stripe and PayPal/i)).toBeInTheDocument();
    expect(screen.getByText(/no wire transfers/i)).toBeInTheDocument();
  });

  it('renders documents and contracts content correctly', () => {
    renderPoliciesPage();

    expect(
      screen.getByText(/Adoption contracts, medical records, and AKC paperwork are compiled in a/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/secure client portal/i)).toBeInTheDocument();
  });

  it('renders breadcrumbs with correct links', () => {
    renderPoliciesPage();

    const homeLink = screen.getByRole('link', { name: /Home/i });
    expect(homeLink).toHaveAttribute('href', '/');

    // Policies breadcrumb should be in navigation (current page)
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveTextContent('Policies');
  });

  it('renders contact link in footer note', () => {
    renderPoliciesPage();

    expect(
      screen.getByText(/These policies are part of our legal contract provided upon reservation/i),
    ).toBeInTheDocument();

    const contactLink = screen.getByRole('link', { name: /Contact us/i });
    expect(contactLink).toHaveAttribute('href', '/contact');
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

    // 6 policy sections as articles
    const articles = container.querySelectorAll('article');
    expect(articles.length).toBe(6);
  });

  it('has proper styling classes for policy cards', () => {
    const { container } = renderPoliciesPage();

    const articles = container.querySelectorAll('article');
    articles.forEach((article) => {
      expect(article.className).toContain('rounded-[2rem]');
      expect(article.className).toContain('border');
      expect(article.className).toContain('bg-[#151e32]');
    });
  });

  it('renders section headings as h2 elements', () => {
    renderPoliciesPage();

    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    expect(h2Elements.length).toBe(6);
  });

  it('renders icons for each policy section', () => {
    const { container } = renderPoliciesPage();

    // Each article should have an icon container
    const iconContainers = container.querySelectorAll('article svg');
    expect(iconContainers.length).toBe(6);
  });

  it('applies hover effects to policy cards', () => {
    const { container } = renderPoliciesPage();

    const articles = container.querySelectorAll('article');
    articles.forEach((article) => {
      expect(article.className).toContain('hover:border-slate-600');
      expect(article.className).toContain('hover:bg-[#1a253a]');
      expect(article.className).toContain('group');
    });
  });
});
