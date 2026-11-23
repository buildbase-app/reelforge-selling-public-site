import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('should load and display heading', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ReelForge/);
  });

  test('should have sign in button', async ({ page }) => {
    await page.goto('/');
    // The header's button: the pricing cards on / have "Sign in to buy" too.
    const signInButton = page
      .getByRole('banner')
      .getByRole('button', { name: /^sign in$/i });
    await expect(signInButton).toBeVisible();
  });

  test('should have theme toggle', async ({ page }) => {
    await page.goto('/');
    // The footer has a second theme toggle; this checks the header's.
    const themeToggle = page
      .getByRole('banner')
      .getByRole('button', { name: /toggle theme/i });
    await expect(themeToggle).toBeVisible();
  });
});
