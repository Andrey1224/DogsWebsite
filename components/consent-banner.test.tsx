import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

import { ConsentBanner } from './consent-banner';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <a {...props}>{children}</a>
  ),
}));

const grantConsentMock = vi.fn();
const denyConsentMock = vi.fn();
let mockConsent: 'unknown' | 'granted' | 'denied' = 'unknown';

vi.mock('@/components/analytics-provider', () => ({
  useAnalytics: () => ({
    consent: mockConsent,
    grantConsent: grantConsentMock,
    denyConsent: denyConsentMock,
  }),
}));

describe('ConsentBanner', () => {
  beforeEach(() => {
    mockConsent = 'unknown';
    grantConsentMock.mockClear();
    denyConsentMock.mockClear();
  });

  it('never calls grantConsent automatically, even when navigator.webdriver is true', async () => {
    Object.defineProperty(navigator, 'webdriver', { value: true, configurable: true });

    render(<ConsentBanner />);

    await screen.findByRole('button', { name: /accept & continue/i }, { timeout: 3000 });

    expect(grantConsentMock).not.toHaveBeenCalled();
  });

  it('shows the banner after a delay when consent is unknown, without needing to click anything', async () => {
    render(<ConsentBanner />);

    expect(screen.queryByRole('button', { name: /accept & continue/i })).not.toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /accept & continue/i })).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(grantConsentMock).not.toHaveBeenCalled();
  });

  it('does not render when consent is already granted', async () => {
    mockConsent = 'granted';
    render(<ConsentBanner />);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(screen.queryByRole('button', { name: /accept & continue/i })).not.toBeInTheDocument();
  });

  it('does not render when consent is already denied', async () => {
    mockConsent = 'denied';
    render(<ConsentBanner />);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(screen.queryByRole('button', { name: /accept & continue/i })).not.toBeInTheDocument();
  });

  it('renders the required copy without the removed "Analytics Only" / "Data is anonymous" claims', async () => {
    render(<ConsentBanner />);

    await waitFor(
      () => {
        expect(screen.getByText(/analytics & advertising measurement/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(
      screen.getByText(/cookieless measurement before you make a choice/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/analytics only/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/data is anonymous/i)).not.toBeInTheDocument();
  });

  it('calls denyConsent when Decline is clicked', async () => {
    render(<ConsentBanner />);

    const declineButton = await screen.findByRole(
      'button',
      { name: /decline/i },
      { timeout: 3000 },
    );
    declineButton.click();

    expect(denyConsentMock).toHaveBeenCalledTimes(1);
  });

  it('calls grantConsent only on explicit user click of Accept & Continue', async () => {
    render(<ConsentBanner />);

    const acceptButton = await screen.findByRole(
      'button',
      { name: /accept & continue/i },
      { timeout: 3000 },
    );
    expect(grantConsentMock).not.toHaveBeenCalled();

    acceptButton.click();

    expect(grantConsentMock).toHaveBeenCalledTimes(1);
  });
});
