// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E: Browse Product Catalogue (US1)
 *
 * Covers:
 *   - Skeleton cards visible during loading
 *   - Product cards appear within 5 s
 *   - At least 1 card renders with title and price text
 *   - No horizontal overflow at 375 px (mobile), 768 px (tablet), 1280 px (desktop)
 *     — all 3 canonical viewports per Constitution III
 */

test.describe('Browse Catalogue', () => {
  test('shows skeleton cards during loading then renders products', async ({ page }) => {
    await page.goto('/');

    // The loading container has aria-busy="true" while products are fetching
    const loadingGrid = page.locator('[aria-busy="true"][aria-label="Loading products"]');

    // Skeleton should appear during initial load; it may already be gone by the
    // time we check on fast machines — so just confirm we eventually see products.
    // (We only assert the skeleton existed if we catch it in time.)
    const loadingVisible = await loadingGrid.isVisible().catch(() => false);
    if (loadingVisible) {
      // Confirm skeleton cards are rendered (animate-pulse blocks inside the grid)
      await expect(loadingGrid.locator('.animate-pulse').first()).toBeVisible();
    }

    // Wait for at least one product article to appear (max 5 s)
    const firstCard = page.getByRole('article').first();
    await expect(firstCard).toBeVisible({ timeout: 5000 });
  });

  test('renders at least 1 product card with title and price', async ({ page }) => {
    await page.goto('/');

    // Wait for products to load
    await page.getByRole('article').first().waitFor({ state: 'visible', timeout: 5000 });

    const cards = page.getByRole('article');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // First card must have a visible heading (product title) and a price
    const firstCard = cards.first();
    const title = firstCard.locator('h2');
    await expect(title).toBeVisible();
    expect((await title.textContent())?.trim().length).toBeGreaterThan(0);

    // Price text should start with '$'
    const price = firstCard.locator('p.text-primary, p[class*="text-primary"]').first();
    await expect(price).toBeVisible();
    expect(await price.textContent()).toMatch(/^\$\d/);
  });

  const viewports = [
    { width: 375, height: 900, label: 'mobile (375 px)' },
    { width: 768, height: 900, label: 'tablet (768 px)' },
    { width: 1280, height: 900, label: 'desktop (1280 px)' },
  ];

  for (const { width, height, label } of viewports) {
    test(`no horizontal overflow at ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');

      // Wait for content to load so layout is fully rendered
      await page.getByRole('article').first().waitFor({ state: 'visible', timeout: 5000 });

      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasOverflow).toBe(false);
    });
  }
});
