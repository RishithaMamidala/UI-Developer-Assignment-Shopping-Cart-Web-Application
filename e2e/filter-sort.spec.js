// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E: Filter & Sort (US2)
 *
 * Covers:
 *   - Category tabs render after products load
 *   - Clicking a category tab filters the product grid
 *   - "All Categories" tab restores the full grid
 *   - Sort by price (low to high) reorders products
 */

test.describe('Filter & Sort', () => {
  test('category tabs appear and filter the product grid', async ({ page }) => {
    await page.goto('/');

    // Wait for products to load
    await page.getByRole('article').first().waitFor({ state: 'visible', timeout: 5000 });

    const allCount = await page.getByRole('article').count();
    expect(allCount).toBeGreaterThan(1);

    // Find any non-"All" category tab and click it
    const tabList = page.getByRole('tablist');
    const tabs = tabList.getByRole('tab');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(1); // "All" + at least one category

    // Click the second tab (first real category)
    const categoryTab = tabs.nth(1);
    const categoryName = await categoryTab.textContent();
    await categoryTab.click();

    // Grid should now show fewer (or equal) products
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    const filteredCount = await page.getByRole('article').count();
    expect(filteredCount).toBeLessThanOrEqual(allCount);
    expect(filteredCount).toBeGreaterThan(0);

    console.log(`Filtered to "${categoryName}": ${filteredCount} of ${allCount} products`);
  });

  test('"All Categories" tab restores full grid', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('article').first().waitFor({ state: 'visible', timeout: 5000 });

    const allCount = await page.getByRole('article').count();

    // Click second category tab to filter
    const tabList = page.getByRole('tablist');
    await tabList.getByRole('tab').nth(1).click();

    // Click "All Categories" to restore
    await tabList.getByRole('tab', { name: /all categories/i }).click();

    await expect(tabList.getByRole('tab', { name: /all categories/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    const restoredCount = await page.getByRole('article').count();
    expect(restoredCount).toBe(allCount);
  });

  test('sort by price low to high reorders products', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('article').first().waitFor({ state: 'visible', timeout: 5000 });

    // Select "Price: Low to High"
    await page.getByRole('combobox').selectOption('price_asc');

    // Wait for rerender
    await page.waitForTimeout(300);

    // Collect prices from product cards
    const priceEls = page.getByRole('article').locator('p.text-primary, p[class*="text-primary"]');
    const count = await priceEls.count();
    expect(count).toBeGreaterThan(1);

    const prices = [];
    for (let i = 0; i < count; i++) {
      const text = await priceEls.nth(i).textContent();
      const value = parseFloat(text?.replace('$', '') ?? '0');
      prices.push(value);
    }

    // Verify ascending order
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });
});
