import { expect, test } from '@playwright/test';

test('unknown routes recover to Timer and browser back/forward preserves route state', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/timer');
  await page.getByRole('link', { name: 'Solves' }).click();
  await expect(page).toHaveURL(/\/solves$/);
  await page.goto('/prompt-11-unknown-route');
  await expect(page.getByRole('heading', { name: 'Page not found', level: 1 })).toBeVisible();

  await page.getByRole('link', { name: 'Go to Timer' }).click();
  await expect(page).toHaveURL(/\/timer$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/prompt-11-unknown-route$/);
  await expect(page.getByRole('heading', { name: 'Page not found', level: 1 })).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/timer$/);
  await expect(page.getByRole('heading', { name: 'Timer', level: 1 })).toBeVisible();
});

test('theme selection remains session-only when preferences service is unavailable', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/settings');

  const theme = page.getByRole('combobox', { name: 'Color theme' });
  await theme.selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.app-preferences__status')).toContainText('for this session');

  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Color theme' })).toHaveValue('system');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'system');
  await expect.poll(() => page.locator('html').evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--color-background').trim(),
  )).toBe('#f5f6f8');
});
