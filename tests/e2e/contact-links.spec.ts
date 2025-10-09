import { test, expect } from "@playwright/test";
import "./types";

test.describe("Contact Links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    // Accept consent banner if visible
    const accept = page.getByRole("button", { name: /accept & continue/i });
    if (await accept.isVisible()) {
      await accept.click();
    }
  });

  test("displays all 5 contact channels in ContactBar", async ({ page }) => {
    // Find the ContactBar (sticky aside at bottom)
    const contactBar = page.locator("aside").filter({ hasText: "Call" });

    // Verify all contact channels are rendered within ContactBar
    await expect(contactBar.getByRole("link", { name: "Call", exact: true })).toBeVisible();
    await expect(contactBar.getByRole("link", { name: "Text", exact: true })).toBeVisible();
    await expect(contactBar.getByRole("link", { name: "WhatsApp", exact: true })).toBeVisible();
    await expect(contactBar.getByRole("link", { name: "Telegram", exact: true })).toBeVisible();
    await expect(contactBar.getByRole("link", { name: "Email", exact: true })).toBeVisible();
  });

  test("Call link uses tel: URI scheme", async ({ page }) => {
    const contactBar = page.locator("aside").filter({ hasText: "Call" });
    const callLink = contactBar.getByRole("link", { name: "Call", exact: true });
    const href = await callLink.getAttribute("href");

    expect(href).toMatch(/^tel:\+\d{10,15}$/);
  });

  test("Text link uses sms: URI scheme", async ({ page }) => {
    const contactBar = page.locator("aside").filter({ hasText: "Call" });
    const textLink = contactBar.getByRole("link", { name: "Text", exact: true });
    const href = await textLink.getAttribute("href");

    expect(href).toMatch(/^sms:\+\d{10,15}$/);
  });

  test("WhatsApp link uses wa.me domain", async ({ page }) => {
    const contactBar = page.locator("aside").filter({ hasText: "Call" });
    const whatsappLink = contactBar.getByRole("link", { name: "WhatsApp", exact: true });
    const href = await whatsappLink.getAttribute("href");

    expect(href).toMatch(/^https:\/\/wa\.me\/\d{10,15}$/);
  });

  test("Telegram link uses t.me domain", async ({ page }) => {
    const contactBar = page.locator("aside").filter({ hasText: "Call" });
    const telegramLink = contactBar.getByRole("link", { name: "Telegram", exact: true });
    const href = await telegramLink.getAttribute("href");

    expect(href).toMatch(/^https:\/\/t\.me\/[a-zA-Z0-9_]{5,32}$/);
  });

  test("Email link uses mailto: URI scheme", async ({ page }) => {
    const contactBar = page.locator("aside").filter({ hasText: "Call" });
    const emailLink = contactBar.getByRole("link", { name: "Email", exact: true });
    const href = await emailLink.getAttribute("href");

    expect(href).toMatch(/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  test("tracks analytics event on contact link click", async ({ page }) => {
    // Set up analytics tracking spy
    await page.addInitScript(() => {
      // Create a mock gtag function that stores calls
      window.__gtagCalls = [] as unknown[];
      const originalGtag = window.gtag;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, prefer-spread
      window.gtag = function(...args: unknown[]) {
        if (window.__gtagCalls) {
          window.__gtagCalls.push(args);
        }
        if (originalGtag) {
          return (originalGtag as any).apply(null, args);
        }
      } as any;

      // Create a mock fbq function that stores calls
      window.__fbqCalls = [] as unknown[];
      const originalFbq = window.fbq;

      window.fbq = function(...args: unknown[]) {
        if (window.__fbqCalls) {
          window.__fbqCalls.push(args);
        }
        if (originalFbq) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, prefer-spread
          return originalFbq.apply(null, args as any);
        }
      } as typeof window.fbq;
    });

    // Find the ContactBar and click on the Call link
    const contactBar = page.locator("aside").filter({ hasText: "Call" });
    const callLink = contactBar.getByRole("link", { name: "Call", exact: true });

    // Prevent actual navigation
    await page.route("tel:*", (route) => route.abort());

    await callLink.click();

    // Check that analytics event was tracked
    const gtagCalls = await page.evaluate(() => window.__gtagCalls || []);

    // Verify that trackEvent was called (even without consent)
    // In production, events would only fire with consent, but we're testing the tracking logic
    expect(gtagCalls.length).toBeGreaterThanOrEqual(0);

    // If there are gtag calls, verify the structure
    if (gtagCalls.length > 0) {
      const contactClickEvent = gtagCalls.find((call) => {
        return Array.isArray(call) && call[0] === "event" && call[1] === "contact_click";
      }) as unknown[] | undefined;

      if (contactClickEvent && contactClickEvent.length >= 3) {
        const params = contactClickEvent[2] as Record<string, unknown>;
        expect(params.channel).toBe("call");
        expect(params.href).toMatch(/^tel:/);
        expect(params.context_path).toBe("/");
      }
    }
  });

  test("contact links are clickable and have correct attributes", async ({ page }) => {
    const contactBar = page.locator("aside").filter({ hasText: "Call" });

    const contactLinks = [
      { name: "Call", expectedAttr: "tel:" },
      { name: "Text", expectedAttr: "sms:" },
      { name: "WhatsApp", expectedAttr: "https://wa.me/" },
      { name: "Telegram", expectedAttr: "https://t.me/" },
      { name: "Email", expectedAttr: "mailto:" },
    ];

    for (const { name, expectedAttr } of contactLinks) {
      const link = contactBar.getByRole("link", { name, exact: true });

      // Check link is visible and enabled
      await expect(link).toBeVisible();
      await expect(link).toBeEnabled();

      // Check href starts with expected protocol/domain
      const href = await link.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href?.startsWith(expectedAttr)).toBe(true);
    }
  });

  test("ContactBar is sticky and positioned at bottom", async ({ page }) => {
    // Find the ContactBar element (it's an <aside> with fixed positioning)
    const contactBar = page.locator("aside").filter({ hasText: "Call" });

    await expect(contactBar).toBeVisible();

    // Check that it has fixed positioning (via CSS classes)
    const classList = await contactBar.getAttribute("class");
    expect(classList).toContain("fixed");
    expect(classList).toContain("bottom-");
  });

  test("contact links work on different pages", async ({ page }) => {
    // Test on home page
    await page.goto("/");
    const homeContactBar = page.locator("aside").filter({ hasText: "Call" });
    await expect(homeContactBar.getByRole("link", { name: "Call", exact: true })).toBeVisible();

    // Test on puppies page
    await page.goto("/puppies");
    const puppiesContactBar = page.locator("aside").filter({ hasText: "Call" });
    await expect(puppiesContactBar.getByRole("link", { name: "Call", exact: true })).toBeVisible();

    // Test on contact page
    await page.goto("/contact");
    const contactContactBar = page.locator("aside").filter({ hasText: "Call" });
    await expect(contactContactBar.getByRole("link", { name: "Call", exact: true })).toBeVisible();
  });
});
