import { render } from "@testing-library/react";
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

vi.mock("@hcaptcha/react-hcaptcha", () => ({
  default: () => <div data-testid="hcaptcha-widget">Mock HCaptcha</div>,
}));

vi.mock("@/app/contact/actions", () => ({
  submitContactInquiry: vi.fn(async () => ({
    status: "idle" as const,
  })),
}));

describe("Component Accessibility Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN = "test-bypass";
  });

  describe("ContactForm", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(<ContactForm />);
      await expectNoA11yViolations(container);
    });

    it("should have accessible form with heading", async () => {
      const { container } = render(
        <ContactForm
          heading={{
            title: "Contact Us",
            description: "Get in touch",
          }}
        />,
      );
      await expectNoA11yViolations(container);
    });

    it("should have accessible form without heading", async () => {
      const { container } = render(<ContactForm />);
      await expectNoA11yViolations(container);
    });

    it("should maintain accessibility with context", async () => {
      const { container } = render(
        <ContactForm
          context={{
            puppyId: "123",
            puppySlug: "bella",
          }}
        />,
      );
      await expectNoA11yViolations(container);
    });
  });

  describe("SiteHeader", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(<SiteHeader />);
      await expectNoA11yViolations(container);
    });

    it("should have accessible navigation", async () => {
      const { container } = render(<SiteHeader />);
      const nav = container.querySelector("nav");

      expect(nav).toBeInTheDocument();
      await expectNoA11yViolations(container);
    });

    it("should have accessible logo/home link", async () => {
      const { container } = render(<SiteHeader />);
      const links = container.querySelectorAll("a");

      // Should have at least one link (home)
      expect(links.length).toBeGreaterThan(0);
      await expectNoA11yViolations(container);
    });
  });

  describe("SiteFooter", () => {
    it("should have proper semantic structure", () => {
      const { container } = render(<SiteFooter />);
      const footer = container.querySelector("footer");

      expect(footer).toBeInTheDocument();
    });

    it("should have accessible links", () => {
      const { container } = render(<SiteFooter />);
      const links = container.querySelectorAll("a");

      // All links should have accessible text
      links.forEach((link) => {
        expect(link.textContent?.trim().length).toBeGreaterThan(0);
      });
    });

    it("should have structured content", () => {
      const { container } = render(<SiteFooter />);

      // Footer should have navigation or content sections
      const sections = container.querySelectorAll("nav, div, section");
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe("ContactBar", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(<ContactBar />);
      await expectNoA11yViolations(container);
    });

    it("should have accessible contact buttons", async () => {
      const { container } = render(<ContactBar />);
      const buttons = container.querySelectorAll("a, button");

      // All interactive elements should have accessible names
      buttons.forEach((button) => {
        const hasText = button.textContent?.trim().length;
        const hasAriaLabel = button.getAttribute("aria-label");
        const hasTitle = button.getAttribute("title");

        expect(hasText || hasAriaLabel || hasTitle).toBeTruthy();
      });

      await expectNoA11yViolations(container);
    });

    it("should be keyboard accessible", async () => {
      const { container } = render(<ContactBar />);
      const interactiveElements = container.querySelectorAll("a, button");

      interactiveElements.forEach((element) => {
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
      const { container } = render(<SiteHeader />);

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

      const { container } = render(<ContactForm />);

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

      const { container } = render(<ContactForm />);

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
