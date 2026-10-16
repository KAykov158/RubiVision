import { expect, test } from '@playwright/test';

test.describe('browser compatibility smoke', () => {
  test.use({ hasTouch: true, viewport: { width: 375, height: 812 } });

  test('direct routes and reloads have no application console or network failures', async ({ page, browser }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const failedRequests: string[] = [];
    const badResponses: string[] = [];
    const routeHeadings = [
      ['/timer', 'Timer'],
      ['/solves', 'Solves'],
      ['/statistics', 'Statistics'],
      ['/analyze', 'Analyze'],
      ['/challenges', 'Challenges'],
      ['/settings', 'Settings'],
    ] as const;

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (request) => {
      if (request.url().startsWith('http://127.0.0.1:5173/')) {
        failedRequests.push(`${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`);
      }
    });
    page.on('response', (response) => {
      if (response.url().startsWith('http://127.0.0.1:5173/') && response.status() >= 400) {
        badResponses.push(`${response.status()} ${response.url()}`);
      }
    });

    console.info(`Browser engine: ${browser.browserType().name()} ${browser.version()}`);
    for (const [route, title] of routeHeadings) {
      const response = await page.goto(route);
      expect(response?.status(), `${route} direct navigation`).toBe(200);
      await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
      const reload = await page.reload();
      expect([200, 304], `${route} reload status`).toContain(reload?.status());
      await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
    }

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(badResponses).toEqual([]);
  });

  test('touch navigation works without enabling unavailable features', async ({ page }) => {
    await page.goto('/timer');
    const touchAvailable = await page.evaluate(() => 'ontouchstart' in window);
    test.skip(!touchAvailable, 'This browser context does not expose touch events');

    await page.getByRole('button', { name: 'Open navigation menu' }).tap();
    const navigation = page.getByRole('dialog', { name: 'Navigation' });
    await expect(navigation).toBeVisible();
    await navigation.getByRole('link', { name: 'Challenges' }).tap();
    await expect(page).toHaveURL(/\/challenges$/);
    await expect(page.getByRole('heading', { name: 'Challenges', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Join a challenge' })).toBeDisabled();
  });

  test('application remains usable when browser web storage access is denied', async ({ page, context }) => {
    await context.addInitScript(() => {
      for (const name of ['localStorage', 'sessionStorage'] as const) {
        Object.defineProperty(window, name, {
          configurable: true,
          get: () => {
            throw new DOMException('Storage access denied by the browser', 'SecurityError');
          },
        });
      }
    });

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Color theme' })).toBeEnabled();
    await page.getByRole('combobox', { name: 'Color theme' }).selectOption('dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('.app-preferences__status')).toContainText('for this session');
  });

  test('connectivity status responds to offline and online browser events', async ({ page }) => {
    await page.goto('/timer');
    await expect(page.getByRole('heading', { name: 'Timer', level: 1 })).toBeVisible();
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await expect(page.locator('.app-connectivity')).toContainText('Your browser reports that you are offline');
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await expect(page.locator('.rv-visually-hidden[role="status"]')).toContainText('network connection is available again');
  });

  test('browser APIs are not required for placeholder feature routes', async ({ page }) => {
    await page.goto('/analyze');
    const support = await page.evaluate(() => ({
      mediaDevices: typeof navigator.mediaDevices,
      getUserMedia: typeof navigator.mediaDevices?.getUserMedia,
      cssGrid: CSS.supports('display', 'grid'),
      reducedMotionQuery: typeof window.matchMedia === 'function',
      localStorageDescriptor: Object.getOwnPropertyDescriptor(window, 'localStorage')?.get !== undefined,
    }));

    console.info(`Browser API support: ${JSON.stringify(support)}`);
    expect(support.cssGrid).toBe(true);
    expect(support.reducedMotionQuery).toBe(true);
    await expect(page.getByRole('button', { name: 'Start camera recording' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Choose a video' })).toBeDisabled();
  });

});
