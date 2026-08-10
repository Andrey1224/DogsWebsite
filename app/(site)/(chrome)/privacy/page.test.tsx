/**
 * Privacy Policy Page Tests
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { AnchorHTMLAttributes } from 'react';

import PrivacyPage from './page';
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

function renderPrivacyPage() {
  return render(<PrivacyPage />);
}

describe('Privacy Policy Page', () => {
  it('renders page heading', () => {
    renderPrivacyPage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /What we collect.*how it.s used/is,
      }),
    ).toBeInTheDocument();
  });

  it('describes what is collected from forms and reservations', () => {
    renderPrivacyPage();

    expect(screen.getByText(/name, email, phone \(optional\), and message/i)).toBeInTheDocument();
  });

  it('does not claim data is never shared with third parties', () => {
    renderPrivacyPage();

    expect(screen.queryByText(/never shared with third part/i)).not.toBeInTheDocument();
  });

  it('accurately describes what payment data is and is not stored', () => {
    renderPrivacyPage();

    expect(
      screen.getByText(/do not process or store your full card number or security code/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/We do store/i)).toBeInTheDocument();
    expect(screen.getAllByText(/transaction reference/i).length).toBeGreaterThan(0);
  });

  it('lists the services that may process data', () => {
    renderPrivacyPage();

    expect(screen.getByText(/Meta Pixel & Meta Conversions API/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Google Analytics/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Vercel Analytics & hosting/i)).toBeInTheDocument();
    expect(screen.getByText(/Stripe & PayPal/i)).toBeInTheDocument();
    expect(screen.getByText(/hCaptcha/i)).toBeInTheDocument();
    expect(screen.getByText(/Resend/i)).toBeInTheDocument();
  });

  it('explains when Meta Pixel loads relative to consent', () => {
    renderPrivacyPage();

    expect(
      screen.getByText(/are not loaded and do not run until you click Accept/i),
    ).toBeInTheDocument();
  });

  it('explains how to change consent choice', () => {
    renderPrivacyPage();

    expect(screen.getByText(/Privacy settings/i)).toBeInTheDocument();
    expect(screen.getByText(/reopens the consent banner/i)).toBeInTheDocument();
  });

  it('explains how to request access or deletion', () => {
    renderPrivacyPage();

    expect(screen.getByText(/To ask what information we hold about you/i)).toBeInTheDocument();
  });

  it('links to Terms of Service', () => {
    renderPrivacyPage();

    const link = screen.getByRole('link', { name: /Terms of Service/i });
    expect(link).toHaveAttribute('href', '/terms');
  });

  it('renders breadcrumbs with correct links', () => {
    renderPrivacyPage();

    const homeLink = screen.getByRole('link', { name: /Home/i });
    expect(homeLink).toHaveAttribute('href', '/');

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveTextContent('Privacy Policy');
  });

  it('passes accessibility checks', async () => {
    const { container } = renderPrivacyPage();
    await expectNoA11yViolations(container);
    expect(container).toBeTruthy();
  });
});
