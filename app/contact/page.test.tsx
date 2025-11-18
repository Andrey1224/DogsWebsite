/**
 * Contact Page Tests
 *
 * Tests the Contact page rendering, accessibility, and proper integration
 * of ContactForm and ContactCards components.
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
  it('renders page heading and description', () => {
    renderContactPage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Let's plan your bulldog match/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Send an inquiry or tap the quick actions in the contact bar/i),
    ).toBeInTheDocument();
  });

  it('renders breadcrumbs with correct links', () => {
    renderContactPage();

    const nav = screen.getByRole('navigation', { name: /Breadcrumb/i });
    expect(nav).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: /Home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders contact form section', () => {
    renderContactPage();

    // Check that form heading is present
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Send an introduction/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders contact form with required fields', () => {
    renderContactPage();

    expect(screen.getByLabelText(/Your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/How can we help/i)).toBeInTheDocument();
  });

  it('passes accessibility checks', async () => {
    const { container } = renderContactPage();
    await expectNoA11yViolations(container);
    expect(container).toBeTruthy();
  });

  it('has proper page structure', () => {
    const { container } = renderContactPage();

    const mainContainer = container.querySelector('.mx-auto.max-w-4xl');
    expect(mainContainer).toBeInTheDocument();
  });
});
