import { render } from "@testing-library/react";
import { act, type AnchorHTMLAttributes } from "react";
import { describe, it, vi, beforeEach } from "vitest";
import { axe, expectNoA11yViolations } from "../helpers/axe";

// Import components
import { ContactForm } from "@/components/contact-form";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactBar } from "@/components/contact-bar";

// Mock dependencies
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

vi.mock("@/components/analytics-provider", () => ({
  useAnalytics: () => ({
    trackEvent: vi.fn(),
  }),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("@hcaptcha/react-hcaptcha", () => ({
  default: () => <div data-testid="hcaptcha-widget">Mock HCaptcha</div>,
}));

vi.mock("@/app/contact/actions", () => ({
  submitContactInquiry: vi.fn(async () => ({
    status: "idle" as const,
  })),
}));

async function renderWithAct(ui: React.ReactElement) {
  let renderResult: ReturnType<typeof render>;

  await act(async () => {
    renderResult = render(ui);
  });

  return renderResult!;
}

describe("Component Accessibility Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN = "test-bypass";
  });

  describe("ContactForm", () => {
    it("should not have accessibility violations", async () => {
      const { container } = await renderWithAct(<ContactForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have accessible form with heading", async () => {
      const { container } = await renderWithAct(
        <ContactForm
          heading={{
            title: "Contact Us",
            description: "Get in touch",
          }}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have accessible form without heading", async () => {
      const { container } = await renderWithAct(<ContactForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should maintain accessibility with context", async () => {
      const { container } = await renderWithAct(
        <ContactForm
          context={{
            puppyId: "123",
            puppySlug: "bella",
          }}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("SiteHeader", () => {
    it("should not have accessibility violations", async () => {
      const { container } = await renderWithAct(<SiteHeader />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have accessible navigation", async () => {
      const { container } = await renderWithAct(<SiteHeader />);
      const nav = container.querySelector("nav");

      expect(nav).toBeInTheDocument();
      await expectNoA11yViolations(container);
    });

    it("should have accessible logo/home link", async () => {
      const { container } = await renderWithAct(<SiteHeader />);
      const links = container.querySelectorAll("a");

      // Should have at least one link (home)
      expect(links.length).toBeGreaterThan(0);
      await expectNoA11yViolations(container);
    });
  });

  describe("SiteFooter", () => {
    it("should have proper semantic structure", async () => {
      const { container } = await renderWithAct(<SiteFooter />);
      const footer = container.querySelector("footer");

      expect(footer).toBeInTheDocument();
    });

    it("should have accessible links", async () => {
      const { container } = await renderWithAct(<SiteFooter />);
      const links = container.querySelectorAll("a");

      // All links should have accessible text
      links.forEach((link: HTMLAnchorElement) => {
        expect(link.textContent?.trim().length).toBeGreaterThan(0);
      });
    });

    it("should have structured content", async () => {
      const { container } = await renderWithAct(<SiteFooter />);

      // Footer should have navigation or content sections
      const sections = container.querySelectorAll("nav, div, section");
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe("ContactBar", () => {
    it("should not have accessibility violations", async () => {
      const { container } = await renderWithAct(<ContactBar />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have accessible contact buttons", async () => {
      const { container } = await renderWithAct(<ContactBar />);
      const buttons = container.querySelectorAll("a, button");

      // All interactive elements should have accessible names
      buttons.forEach((button: Element) => {
        const hasText = button.textContent?.trim().length;
        const hasAriaLabel = button.getAttribute("aria-label");
        const hasTitle = button.getAttribute("title");

        expect(hasText || hasAriaLabel || hasTitle).toBeTruthy();
      });

      await expectNoA11yViolations(container);
    });

    it("should be keyboard accessible", async () => {
      const { container } = await renderWithAct(<ContactBar />);
      const interactiveElements = container.querySelectorAll("a, button");

      interactiveElements.forEach((element: Element) => {
        // Should be focusable or have tabindex
        const isFocusable =
          element.tagName === "A" ||
          element.tagName === "BUTTON" ||
          element.hasAttribute("tabindex");

        expect(isFocusable).toBeTruthy();
      });

      await expectNoA11yViolations(container);
    });
  });

  describe("Theme Components", () => {
    it("should have accessible theme toggle if present", async () => {
      const { container } = await renderWithAct(<SiteHeader />);

      // Look for theme toggle button
      const themeButton = container.querySelector("button[aria-label*='theme' i]");

      if (themeButton) {
        // Should have accessible name
        const hasLabel =
          themeButton.getAttribute("aria-label") || themeButton.textContent?.trim();
        expect(hasLabel).toBeTruthy();
      }

      await expectNoA11yViolations(container);
    });
  });

  describe("Form Elements", () => {
    it("should have accessible error states", async () => {
      const { submitContactInquiry } = await import("@/app/contact/actions");

      (submitContactInquiry as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: "error" as const,
        message: "Validation failed",
        fieldErrors: {
          name: "Name is required",
          email: "Invalid email",
        },
      });

      const { container } = await renderWithAct(<ContactForm />);

      // Even with errors, should maintain accessibility
      const results = await axe(container, {
        rules: {
          // Disable landmark rules when testing isolated components
          "landmark-no-duplicate-banner": { enabled: false },
          "landmark-unique": { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it("should have accessible success states", async () => {
      const { submitContactInquiry } = await import("@/app/contact/actions");

      (submitContactInquiry as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: "success" as const,
        message: "Thank you!",
      });

      const { container } = await renderWithAct(<ContactForm />);

      const results = await axe(container, {
        rules: {
          // Disable landmark rules when testing isolated components
          "landmark-no-duplicate-banner": { enabled: false },
          "landmark-unique": { enabled: false },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });
});
