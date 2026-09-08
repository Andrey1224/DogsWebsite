import { test, expect } from '@playwright/test';

test.describe('Blog SEO & Structure', () => {
  test('Sitemap should not contain duplicate slugs for blog posts', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();

    const xml = await response.text();
    const urls = xml.match(/<loc>(.*?)<\/loc>/g)?.map((loc) => loc.replace(/<\/?loc>/g, '')) || [];

    const blogUrls = urls.filter((url) => url.includes('/blog/'));

    // Check for duplicates
    const uniqueBlogUrls = new Set(blogUrls);
    expect(blogUrls.length).toBe(uniqueBlogUrls.size);

    // Ensure the high-carb post is in the sitemap
    expect(
      blogUrls.some((url) => url.includes('high-carb-commercial-dog-food-risks')),
    ).toBeTruthy();
  });

  test('Blog article pages should have a canonical tag and article schema', async ({ page }) => {
    // Navigate to a known local blog post
    await page.goto('/blog/ultimate-guide-for-new-bulldog-owners');

    // Check canonical
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain('/blog/ultimate-guide-for-new-bulldog-owners');

    // Check OpenGraph type is article
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
    expect(ogType).toBe('article');

    // Check Schema
    const schemaContent = await page
      .locator('script[id="blog-posting-ultimate-guide-for-new-bulldog-owners"]')
      .textContent();
    expect(schemaContent).toBeTruthy();
    if (schemaContent) {
      const schema = JSON.parse(schemaContent);
      expect(schema['@type']).toBe('BlogPosting');
    }
  });
});
