import { expect, test } from '@playwright/test';

test('root page exists', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Solar API demo');
  await expect(page.locator('main')).toBeVisible();
});
