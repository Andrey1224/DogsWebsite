import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { vi, describe, it, expect, beforeEach } from "vitest";

let ContactForm: (typeof import("./contact-form"))["ContactForm"];

// Mock dependencies
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("@/components/analytics-provider", () => ({
  useAnalytics: () => ({
    trackEvent: vi.fn(),
  }),
}));

vi.mock("@hcaptcha/react-hcaptcha", () => ({
  default: vi.fn(({ onVerify }) => {
    return (
      <button type="button" onClick={() => onVerify("mock-token")} data-testid="hcaptcha-widget">
        Mock HCaptcha
      </button>
    );
  }),
}));

vi.mock("@/app/contact/actions", () => ({
  submitContactInquiry: vi.fn(async () => ({
    status: "success" as const,
    message: "Thank you for your inquiry!",
  })),
}));

describe("ContactForm", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/contact");

    process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY = "test-site-key";
    process.env.NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN = "";

    vi.resetModules();
    ({ ContactForm } = await import("./contact-form"));
  });

  describe("Rendering", () => {
    it("renders all form fields", () => {
      render(<ContactForm />);

      expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/how can we help/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /share my inquiry/i })).toBeInTheDocument();
    });

    it("renders with custom heading", () => {
      render(
        <ContactForm
          heading={{
            eyebrow: "Get in Touch",
            title: "Contact Us",
            description: "We'd love to hear from you",
          }}
        />,
      );

      expect(screen.getByText("Get in Touch")).toBeInTheDocument();
      expect(screen.getByText("Contact Us")).toBeInTheDocument();
      expect(screen.getByText("We'd love to hear from you")).toBeInTheDocument();
    });

    it("renders without heading when not provided", () => {
      const { container } = render(<ContactForm />);

      expect(container.querySelector("header")).not.toBeInTheDocument();
    });

  });

  describe("Form Fields", () => {
    it("has correct input types", () => {
      render(<ContactForm />);

      expect(screen.getByLabelText(/your name/i)).toHaveAttribute("type", "text");
      expect(screen.getByLabelText(/email/i)).toHaveAttribute("type", "email");
      expect(screen.getByLabelText(/phone/i)).toHaveAttribute("type", "tel");
    });

    it("marks required fields correctly", () => {
      render(<ContactForm />);

      expect(screen.getByLabelText(/your name/i)).toBeRequired();
      expect(screen.getByLabelText(/email/i)).toBeRequired();
      expect(screen.getByLabelText(/how can we help/i)).toBeRequired();
      expect(screen.getByLabelText(/phone/i)).not.toBeRequired();
    });

    it("has correct placeholders", () => {
      render(<ContactForm />);

      expect(screen.getByLabelText(/your name/i)).toHaveAttribute("placeholder", "Jane Doe");
      expect(screen.getByLabelText(/email/i)).toHaveAttribute(
        "placeholder",
        "you@example.com",
      );
      expect(screen.getByLabelText(/phone/i)).toHaveAttribute(
        "placeholder",
        "+1 (205) 555-1234",
      );
    });

    it("has autocomplete attributes", () => {
      render(<ContactForm />);

      expect(screen.getByLabelText(/email/i)).toHaveAttribute("autocomplete", "email");
      expect(screen.getByLabelText(/phone/i)).toHaveAttribute("autocomplete", "tel");
    });
  });

  describe("Context Props", () => {
    it("includes puppy context in hidden fields", () => {
      const { container } = render(
        <ContactForm
          context={{
            puppyId: "123",
            puppySlug: "bella-frenchie",
          }}
        />,
      );

      const puppyIdInput = container.querySelector('input[name="puppyId"]');
      const puppySlugInput = container.querySelector('input[name="puppySlug"]');

      expect(puppyIdInput).toHaveValue("123");
      expect(puppySlugInput).toHaveValue("bella-frenchie");
    });

    it("handles null context values", () => {
      const { container } = render(
        <ContactForm
          context={{
            puppyId: null,
            puppySlug: null,
          }}
        />,
      );

      const puppyIdInput = container.querySelector('input[name="puppyId"]');
      const puppySlugInput = container.querySelector('input[name="puppySlug"]');

      expect(puppyIdInput).toHaveValue("");
      expect(puppySlugInput).toHaveValue("");
    });

    it("includes context path in hidden field", () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/puppies/bella");

      const { container } = render(<ContactForm />);

      const contextPathInput = container.querySelector('input[name="contextPath"]');
      expect(contextPathInput).toHaveValue("/puppies/bella");
    });
  });

  describe("Form Validation", () => {
    it("accepts valid form data", async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      await user.type(screen.getByLabelText(/your name/i), "John Doe");
      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/phone/i), "+1 205 555 1234");
      await user.type(screen.getByLabelText(/how can we help/i), "Interested in a puppy");
      await user.click(screen.getByTestId("hcaptcha-widget"));

      const submitButton = screen.getByRole("button", { name: /share my inquiry/i });
      expect(submitButton).not.toBeDisabled();
    });

    it("allows user to fill out form fields", async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const nameInput = screen.getByLabelText(/your name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/how can we help/i);

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(messageInput, "Interested in a puppy");

      expect(nameInput).toHaveValue("John Doe");
      expect(emailInput).toHaveValue("john@example.com");
      expect(messageInput).toHaveValue("Interested in a puppy");
    });
  });

  describe("Captcha Integration", () => {
    it("has captcha field in form", () => {
      render(<ContactForm />);

      // Hidden captcha response field is always present
      const captchaInput = document.querySelector('input[name="h-captcha-response"]');
      expect(captchaInput).toBeInTheDocument();
    });

    it("enables submit button after captcha verification", async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const submitButton = screen.getByRole("button", { name: /share my inquiry/i });
      expect(submitButton).toBeDisabled();

      await user.click(screen.getByTestId("hcaptcha-widget"));
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("has error rendering mechanism", () => {
      // Test that the component structure supports error display
      // Actual error state is managed by server action and tested in E2E
      render(<ContactForm />);

      const nameInput = screen.getByLabelText(/your name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/how can we help/i);

      // All inputs have aria-invalid set to false initially
      expect(nameInput).toHaveAttribute("aria-invalid", "false");
      expect(emailInput).toHaveAttribute("aria-invalid", "false");
      expect(messageInput).toHaveAttribute("aria-invalid", "false");
    });

    it("shows consent and response time information", () => {
      render(<ContactForm />);

      expect(
        screen.getByText(/we respond within one business day/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/by submitting, you consent to be contacted/i),
      ).toBeInTheDocument();
    });
  });

  describe("Submit Button", () => {
    it("has submit button with correct initial text", () => {
      render(<ContactForm />);

      const submitButton = screen.getByRole("button", { name: /share my inquiry/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("submit button becomes enabled after captcha verification", async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const submitButton = screen.getByRole("button", { name: /share my inquiry/i });
      expect(submitButton).toBeDisabled();

      await user.click(screen.getByTestId("hcaptcha-widget"));
      expect(submitButton).not.toBeDisabled();
    });

    it("has proper button styling classes", () => {
      render(<ContactForm />);

      const submitButton = screen.getByRole("button", { name: /share my inquiry/i });
      expect(submitButton.className).toContain("rounded-full");
    });
  });

  describe("Accessibility", () => {
    it("has proper label associations", () => {
      render(<ContactForm />);

      const nameInput = screen.getByLabelText(/your name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/phone/i);
      const messageInput = screen.getByLabelText(/how can we help/i);

      expect(nameInput).toHaveAccessibleName();
      expect(emailInput).toHaveAccessibleName();
      expect(phoneInput).toHaveAccessibleName();
      expect(messageInput).toHaveAccessibleName();
    });

    it("indicates optional field in label", () => {
      render(<ContactForm />);

      expect(screen.getByText(/phone \(optional\)/i)).toBeInTheDocument();
    });

    it("provides consent information", () => {
      render(<ContactForm />);

      expect(
        screen.getByText(/we respond within one business day/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/by submitting, you consent to be contacted/i),
      ).toBeInTheDocument();
    });
  });
});
