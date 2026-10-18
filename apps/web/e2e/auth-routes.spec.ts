import { expect, test } from '@playwright/test';
import { signInFromProtectedRoute } from './support/mockAuth';

async function signOutAndCheckProtection(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in$/u);
  await expect(page.getByRole('heading', { name: 'Sign in to RubiVision' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(0);
  await page.goto('/statistics');
  await expect(page).toHaveURL(/\/auth\/sign-in$/u);
}

test('protected route redirects and mobile header sign-out clears access', async ({ page }) => {
  await signInFromProtectedRoute(page, 390);
  await signOutAndCheckProtection(page);
});

test('desktop sidebar provides sign-out and clears protected access', async ({ page }) => {
  await signInFromProtectedRoute(page, 1280);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in$/u);
  await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(0);
  await page.goto('/statistics');
  await expect(page).toHaveURL(/\/auth\/sign-in$/u);
});
