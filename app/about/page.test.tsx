import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import AboutPage from './page';
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

function renderAboutPage() {
  return render(<AboutPage />);
}

describe('About Page', () => {
  it('renders hero heading and CTA', () => {
    renderAboutPage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /A boutique breeding program built on trust, transparency, and care/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: /Meet Our Puppies/i,
      }),
    ).toHaveAttribute('href', '/puppies');
  });

  it('displays program highlights', () => {
    renderAboutPage();

    expect(
      screen.getByRole('heading', { level: 2, name: /Health-first philosophy/i }),
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 2, name: /Enrichment-driven raising/i }),
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 2, name: /Lifetime breeder support/i }),
    ).toBeDefined();
  });

  it('renders breed descriptions', () => {
    renderAboutPage();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /French Bulldog: The Square Flask of Joy and Sass/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /English Bulldog: Your Personal, Wrinkly Cloud of Happiness/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/The Master of the Comedic Glare/i)).toBeInTheDocument();
    expect(screen.getByText(/Compact Comfort Energy/i)).toBeInTheDocument();
  });

  it('renders final CTA', () => {
    renderAboutPage();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Schedule a visit or a live video walkthrough/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /See available puppies/i,
      }),
    ).toHaveAttribute('href', '/puppies');
  });

  it('passes accessibility checks', async () => {
    const { container } = renderAboutPage();
    await expectNoA11yViolations(container);
    expect(container).toBeTruthy();
  });
});
