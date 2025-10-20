import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import AboutPage from "./page";
import { expectNoA11yViolations } from "@/tests/helpers/axe";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("@/components/analytics-provider", () => {
  const mockTrack = vi.fn();
  const Provider = ({ children }: { children: ReactNode }) => <>{children}</>;
  const useAnalytics = () => ({
    consent: "granted" as const,
    grantConsent: vi.fn(),
    denyConsent: vi.fn(),
    trackEvent: mockTrack,
  });
  return { AnalyticsProvider: Provider, useAnalytics };
});

function renderAboutPage() {
  return render(<AboutPage />);
}

describe("About Page", () => {
  it("renders hero heading and CTA", () => {
    renderAboutPage();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /A boutique breeding program built on trust, transparency, and care/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /Meet Our Puppies/i,
      }),
    ).toHaveAttribute("href", "/puppies");
  });

  it("displays program highlights", () => {
    renderAboutPage();

    expect(screen.getByRole("heading", { level: 2, name: /Health-first philosophy/i })).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: /Enrichment-driven raising/i })).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: /Lifetime breeder support/i })).toBeDefined();
  });

  it("renders facility and veterinary cards with CTA", () => {
    renderAboutPage();

    expect(screen.getByRole("heading", { level: 3, name: /Our facility/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /Veterinary partners/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /See available puppies/i,
      }),
    ).toHaveAttribute("href", "/puppies");
  });

  it("passes accessibility checks", async () => {
    const { container } = renderAboutPage();
    await expectNoA11yViolations(container);
    expect(container).toBeTruthy();
  });
});
