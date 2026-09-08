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

  test('High Carb article image should return HTTP 200 and related links should be unique', async ({
    page,
    request,
  }) => {
    const response = await page.goto('/blog/high-carb-commercial-dog-food-risks');
    expect(response?.status()).toBe(200);

    // Verify image 200
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();
    if (ogImage) {
      const imgRes = await request.get(ogImage);
      expect(imgRes.status()).toBe(200);
    }

    // Verify no duplicates in related links
    const relatedLinks = await page.locator('section:has-text("You might also like") a').all();
    const hrefs = [];
    for (const link of relatedLinks) {
      const href = await link.getAttribute('href');
      if (href) hrefs.push(href);
    }
    const uniqueHrefs = new Set(hrefs);
    expect(hrefs.length).toBe(uniqueHrefs.size);
  });

  test('Blog listing page should not contain duplicate posts', async ({ page }) => {
    const response = await page.goto('/blog');
    expect(response?.status()).toBe(200);

    // Get all article links
    const articleLinks = await page.locator('article a').all();
    const hrefs = [];
    for (const link of articleLinks) {
      const href = await link.getAttribute('href');
      if (href && href.includes('/blog/')) {
        hrefs.push(href);
      }
    }

    // There can be an image link and a text link to the same article inside one <article> component,
    // so we need to deduplicate by finding unique article cards.
    // Instead of links, let's count the number of article cards and ensure their titles are unique.
    const titles = await page.locator('article h2, article h3').allTextContents();
    const uniqueTitles = new Set(titles);
    expect(titles.length).toBe(uniqueTitles.size);
  });
});
