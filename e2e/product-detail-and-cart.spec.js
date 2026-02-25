// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E: Product Detail Modal (US3) + Cart Management (US5)
 *
 * Covers:
 *   - Clicking a product card body opens the detail modal
 *   - Modal shows product heading and close button works
 *   - Pressing Escape closes the modal
 *   - Removing an item from the cart updates the drawer
 *   - Removing the last item shows the empty cart state
 */

test.describe('Product Detail Modal', () => {
  test('opens modal on card click and closes via close button', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('article').first().waitFor({ state: 'visible', timeout: 5000 });

    // Card body has role="button" and aria-label="View details for {title}"
    await page.getByRole('button', { name: /^View details for /i }).first().click();

    // ProductDetailModal uses aria-labelledby (not aria-label) — distinguishes it from cart drawer
    const productModal = page.locator('[role="dialog"][aria-labelledby]');
    await expect(productModal).toBeVisible({ timeout: 3000 });

    // Modal must show a heading with product title
    const heading = productModal.getByRole('heading').first();
    await expect(heading).toBeVisible();
    expect((await heading.textContent())?.trim().length).toBeGreaterThan(0);

    // Close via the close button (aria-label="Close")
    await productModal.getByRole('button', { name: 'Close' }).click();
    await expect(productModal).not.toBeVisible({ timeout: 2000 });
  });

  test('closes modal on Escape key', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('article').first().waitFor({ state: 'visible', timeout: 5000 });

    await page.getByRole('button', { name: /^View details for /i }).first().click();

    const productModal = page.locator('[role="dialog"][aria-labelledby]');
    await expect(productModal).toBeVisible({ timeout: 3000 });

    await page.keyboard.press('Escape');
    await expect(productModal).not.toBeVisible({ timeout: 2000 });
  });
});

test.describe('Cart Management', () => {
  test('removing an item from cart updates the drawer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('article').nth(1).waitFor({ state: 'visible', timeout: 5000 });

    const cards = page.getByRole('article');

    // Add two products — wait between clicks for "Added!" state to clear (800ms)
    await cards.nth(0).getByRole('button', { name: 'Add to Cart' }).click();
    await page.waitForTimeout(900);
    await cards.nth(1).getByRole('button', { name: 'Add to Cart' }).click();

    // Open cart drawer
    await page.getByRole('button', { name: /^Cart, \d+ items$/ }).click();
    const drawer = page.getByRole('dialog', { name: 'Shopping cart' });
    await expect(drawer).toBeVisible();

    const lineItems = drawer.locator('ul > li');
    await expect(lineItems).toHaveCount(2);

    // Remove button has aria-label="Remove {product title}"
    await lineItems.first().getByRole('button', { name: /^Remove /i }).click();
    await expect(lineItems).toHaveCount(1);
  });

  test('removing all items shows empty cart state', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('article').first().waitFor({ state: 'visible', timeout: 5000 });

    // Add one product
    await page.getByRole('article').first().getByRole('button', { name: 'Add to Cart' }).click();

    // Open cart
    await page.getByRole('button', { name: /^Cart, \d+ items$/ }).click();
    const drawer = page.getByRole('dialog', { name: 'Shopping cart' });
    await expect(drawer).toBeVisible();

    // Remove the only item
    await drawer.locator('ul > li').first().getByRole('button', { name: /^Remove /i }).click();

    // Empty state — exact text from CartDrawer.jsx
    await expect(drawer.getByText('Your cart is empty.')).toBeVisible();
    await expect(drawer.getByRole('button', { name: 'Continue Shopping' })).toBeVisible();
  });
});
