/**
 * About Page Tests
 *
 * Tests the About page rendering, accessibility, and content.
 * Tests new dark UI with breed spotlights.
 */

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
  it('renders hero heading with gradient text', () => {
    renderAboutPage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /A boutique program built on trust & transparency/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders Our Story badge', () => {
    renderAboutPage();

    // Badge text is uppercase "OUR STORY" via CSS
    expect(screen.getAllByText(/Our Story/i).length).toBeGreaterThan(0);
  });

  it('renders stats section', () => {
    renderAboutPage();

    expect(screen.getByText('35+')).toBeInTheDocument();
    expect(screen.getByText('400+')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText(/Years with bulldogs/i)).toBeInTheDocument();
  });

  it('renders quote block', () => {
    renderAboutPage();

    expect(
      screen.getByText(/Every puppy deserves a healthy start and a loving home/i),
    ).toBeInTheDocument();
  });

  it('renders Award Winning badge', () => {
    renderAboutPage();

    expect(screen.getByText(/Award Winning/i)).toBeInTheDocument();
  });

  it('displays program values', () => {
    renderAboutPage();

    expect(
      screen.getByRole('heading', { level: 2, name: /Health-first philosophy/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Enrichment-driven raising/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Lifetime breeder support/i }),
    ).toBeInTheDocument();
  });

  it('renders French Bulldog spotlight', () => {
    renderAboutPage();

    expect(screen.getByText(/The Entertainer/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /French Bulldog.*The Square Flask of Joy/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /Master of the Comedic Glare/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /Compact Comfort Energy/i }),
    ).toBeInTheDocument();
  });

  it('renders English Bulldog spotlight', () => {
    renderAboutPage();

    expect(screen.getByText(/The Classic/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /English Bulldog.*Your Wrinkly Cloud of Happiness/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Perfect Partner For/i)).toBeInTheDocument();
    expect(screen.getByText(/Movie Nights/i)).toBeInTheDocument();
    expect(screen.getByText(/Reading Books/i)).toBeInTheDocument();
    expect(screen.getByText(/Quiet Walks/i)).toBeInTheDocument();
  });

  it('renders CTA section', () => {
    renderAboutPage();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Ready to add a.*Cloud of Happiness.*to your life/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /See available puppies/i,
      }),
    ).toHaveAttribute('href', '/puppies');
  });

  it('renders breadcrumbs (sr-only for SEO)', () => {
    renderAboutPage();

    const nav = screen.getByRole('navigation', { name: /Breadcrumb/i });
    expect(nav).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: /Home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('has dark theme background', () => {
    const { container } = renderAboutPage();

    const mainContainer = container.querySelector('.bg-\\[\\#0B1120\\]');
    expect(mainContainer).toBeInTheDocument();
  });

  it('passes accessibility checks', async () => {
    const { container } = renderAboutPage();
    await expectNoA11yViolations(container);
    expect(container).toBeTruthy();
  });
});
