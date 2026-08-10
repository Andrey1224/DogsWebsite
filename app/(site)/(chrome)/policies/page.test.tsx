/**
 * Policies Hub Page Tests
 *
 * Tests the Policies hub page, which links out to /privacy and /terms
 * rather than duplicating legal text.
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { AnchorHTMLAttributes } from 'react';

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

function renderPoliciesPage() {
  return render(<PoliciesPage />);
}

describe('Policies Hub Page', () => {
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
  });

  it('links to the Privacy Policy page', () => {
    renderPoliciesPage();

    const link = screen.getByRole('link', { name: /Read Privacy Policy/i });
    expect(link).toHaveAttribute('href', '/privacy');
  });

  it('links to the Terms of Service page', () => {
    renderPoliciesPage();

    const link = screen.getByRole('link', { name: /Read Terms of Service/i });
    expect(link).toHaveAttribute('href', '/terms');
  });

  it('does not duplicate legal text on this page', () => {
    renderPoliciesPage();

    expect(screen.queryByText(/12 months/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/non-refundable/i)).not.toBeInTheDocument();
  });

  it('mentions secure payments via Stripe and PayPal', () => {
    renderPoliciesPage();

    expect(
      screen.getByText(/Payments are processed securely through Stripe and PayPal/i),
    ).toBeInTheDocument();
  });

  it('renders breadcrumbs with correct links', () => {
    renderPoliciesPage();

    const homeLink = screen.getByRole('link', { name: /Home/i });
    expect(homeLink).toHaveAttribute('href', '/');

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveTextContent('Policies');
  });

  it('renders contact link', () => {
    renderPoliciesPage();

    const contactLink = screen.getByRole('link', { name: /Contact us/i });
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('passes accessibility checks', async () => {
    const { container } = renderPoliciesPage();
    await expectNoA11yViolations(container);
    expect(container).toBeTruthy();
  });
});
