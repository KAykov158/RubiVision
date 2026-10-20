import { expect, type Page } from '@playwright/test';

export const browserUser = {
  id: 'd1e79f7e-816c-468f-9a66-312f50712b37',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'browser-user@example.test',
  email_confirmed_at: '2026-10-18T00:00:00.000Z',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { display_name: 'Browser Test User' },
  created_at: '2026-10-18T00:00:00.000Z',
};

export async function signInFromProtectedRoute(page: Page, width: number, height = 844) {
  await page.setViewportSize({ width, height });
  const expiry = Math.floor(Date.now() / 1000) + 3600;
  const payload = Buffer.from(JSON.stringify({ sub: browserUser.id, aud: 'authenticated', role: 'authenticated', exp: expiry })).toString('base64url');

  await page.route(/\/auth\/v1\/user(?:\?|$)/u, (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(browserUser),
  }));
  await page.route(/\/auth\/v1\/token\?grant_type=password/u, (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      access_token: `header.${payload}.signature`,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: expiry,
      refresh_token: 'browser-test-refresh-token',
      user: browserUser,
    }),
  }));
  await page.route(/\/auth\/v1\/logout/u, (route) => route.fulfill({ status: 204, body: '' }));
  await page.route(/\/rest\/v1\//u, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));

  await page.goto('/statistics');
  await expect(page).toHaveURL(/\/auth\/sign-in$/u);
  await expect(page.getByRole('heading', { name: 'Sign in to RubiVision' })).toBeVisible();
  await page.getByLabel('Email').fill(browserUser.email);
  await page.getByLabel('Password').fill('browser-test-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/statistics$/u);
  await expect(page.getByRole('heading', { name: 'Statistics', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
}
