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

test('signed-out desktop navigation exposes one accessible Sign in link and account creation', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/timer');

  const signIn = page.locator('.app-sidebar').getByRole('link', { name: 'Sign in', exact: true });
  await expect(signIn).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toHaveCount(0);
  await signIn.focus();
  await expect(signIn).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/auth\/sign-in$/u);
  await expect(page.getByRole('heading', { name: 'Sign in to RubiVision' })).toBeVisible();
  const createAccount = page.getByRole('link', { name: 'Create account', exact: true });
  await expect(createAccount).toBeVisible();
  await createAccount.click();
  await expect(page).toHaveURL(/\/auth\/sign-up$/u);
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
});

test('signed-out mobile drawer exposes one keyboard-accessible Sign in link', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/timer');
  await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Session' })).toBeDisabled();

  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  const drawer = page.getByRole('dialog', { name: 'Navigation' });
  await expect(drawer).toBeVisible();
  const signIn = drawer.getByRole('link', { name: 'Sign in', exact: true });
  await expect(signIn).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toHaveCount(0);
  await signIn.focus();
  await expect(signIn).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/auth\/sign-in$/u);
  await expect(page.getByRole('heading', { name: 'Sign in to RubiVision' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create account', exact: true })).toBeVisible();
});
test('protected route redirects and mobile header sign-out clears access', async ({ page }) => {
  await signInFromProtectedRoute(page, 390);
  await signOutAndCheckProtection(page);
});

test('desktop shell keeps one Sign out action and clears protected access', async ({ page }) => {
  await signInFromProtectedRoute(page, 1024);
  await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in$/u);
  await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(0);
  await page.goto('/statistics');
  await expect(page).toHaveURL(/\/auth\/sign-in$/u);
});
