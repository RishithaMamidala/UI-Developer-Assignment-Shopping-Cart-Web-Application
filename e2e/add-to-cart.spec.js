// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E: Add to Cart Flow (US4 + US5)
 *
 * Covers:
 *   - First product: set quantity to 2, Add to Cart → badge shows "2"
 *   - Second product: default quantity 1, Add to Cart → badge shows "3"
 *   - Click cart icon → drawer slides in
 *   - Drawer shows exactly 2 line items
 *   - Order Total is visible and formatted as a price
 */

test.describe('Add to Cart Flow', () => {
  test('adds products to cart and verifies badge count', async ({ page }) => {
    await page.goto('/');

    // Wait for at least 2 product cards to be visible
    const cards = page.getByRole('article');
    await cards.nth(1).waitFor({ state: 'visible', timeout: 5000 });

    // --- First product: quantity = 2 ---
    const firstCard = cards.nth(0);

    // Click "Increase quantity" once to go from 1 → 2
    await firstCard.getByRole('button', { name: 'Increase quantity' }).click();

    // Verify the spinbutton (number input) shows 2
    await expect(firstCard.getByRole('spinbutton')).toHaveValue('2');

    // Click Add to Cart
    await firstCard.getByRole('button', { name: 'Add to Cart' }).click();

    // Cart badge should now show 2 items
    const cartButton = page.getByRole('button', { name: /^Cart, \d+ items$/ });
    await expect(cartButton).toHaveAttribute('aria-label', 'Cart, 2 items');

    // --- Second product: default quantity = 1 ---
    const secondCard = cards.nth(1);

    // Click Add to Cart with default quantity
    await secondCard.getByRole('button', { name: 'Add to Cart' }).click();

    // Badge should show 3 items now
    await expect(cartButton).toHaveAttribute('aria-label', 'Cart, 3 items');
  });

  test('opens cart drawer with 2 line items and correct order total', async ({ page }) => {
    await page.goto('/');

    // Wait for product cards
    const cards = page.getByRole('article');
    await cards.nth(1).waitFor({ state: 'visible', timeout: 5000 });

    // Add first product with qty 2
    const firstCard = cards.nth(0);
    await firstCard.getByRole('button', { name: 'Increase quantity' }).click();
    await firstCard.getByRole('button', { name: 'Add to Cart' }).click();

    // Add second product with qty 1
    const secondCard = cards.nth(1);
    await secondCard.getByRole('button', { name: 'Add to Cart' }).click();

    // Open cart drawer by clicking the cart button
    const cartButton = page.getByRole('button', { name: /^Cart, \d+ items$/ });
    await cartButton.click();

    // Drawer should be visible
    const drawer = page.getByRole('dialog', { name: 'Shopping cart' });
    await expect(drawer).toBeVisible();

    // Should have exactly 2 line items
    const lineItems = drawer.locator('ul > li');
    await expect(lineItems).toHaveCount(2);

    // Order Total section should be visible with a dollar amount
    await expect(drawer.getByText('Order Total')).toBeVisible();
    const totalAmount = drawer.locator('span.text-lg.font-bold');
    await expect(totalAmount).toBeVisible();
    const totalText = await totalAmount.textContent();
    expect(totalText).toMatch(/^\$\d+\.\d{2}$/);
  });
});
