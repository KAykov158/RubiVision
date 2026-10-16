import { expect, test } from '@playwright/test';

const widths = [320, 375, 768, 1024, 1440];
const themes = ['light', 'dark'] as const;
const pages = [
  { path: '/solves', title: 'Solves', key: 'solves-table-wrap' },
  { path: '/statistics', title: 'Statistics', key: 'statistics-chart' },
] as const;

for (const pageSpec of pages) {
  for (const theme of themes) {
    for (const width of widths) {
      test(`${pageSpec.title} layout at ${width}px in ${theme} theme`, async ({ page }, testInfo) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(pageSpec.path);
        await expect(page.getByRole('heading', { name: pageSpec.title, level: 1 })).toBeVisible();
        await expect(page.locator('.app-sidebar .app-navigation__link[aria-current="page"]')).toHaveText(pageSpec.title);
        const metrics = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
          main: document.querySelector<HTMLElement>('#main-content')?.getBoundingClientRect().width ?? 0,
          headerRight: document.querySelector<HTMLElement>('.app-header')?.getBoundingClientRect().right ?? 0,
          chartOrTableWidth: document.querySelector<HTMLElement>('.solves-table-wrap, .statistics-chart')?.getBoundingClientRect().width ?? 0,
          background: getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim(),
        }));
        expect(metrics.document, JSON.stringify(metrics)).toBeLessThanOrEqual(width);
        expect(metrics.body, JSON.stringify(metrics)).toBeLessThanOrEqual(width);
        expect(metrics.main).toBeGreaterThan(0);
        expect(metrics.headerRight).toBeLessThanOrEqual(width + 1);
        expect(metrics.background).toBe(theme === 'dark' ? '#101828' : '#f5f6f8');
        if (pageSpec.path === '/solves') {
          await expect(page.getByRole('combobox', { name: 'Puzzle' })).toBeVisible();
          await expect(page.getByRole('searchbox')).toBeVisible();
          await expect(page.getByRole('heading', { name: 'Solve history unavailable' })).toBeVisible();
        } else {
          await expect(page.getByRole('table', { name: 'Accessible trend data table' })).toBeVisible();
          await expect(page.getByRole('heading', { name: 'Average of 5' })).toBeVisible();
        }
        await page.screenshot({ path: testInfo.outputPath(`${pageSpec.title.toLowerCase()}-${theme}-${width}.png`), fullPage: true });
        expect(errors).toEqual([]);
      });
    }
  }
}

test('keyboard navigation moves between Solves and Statistics and browser back restores Solves', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/solves');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.getByRole('button', { name: 'Open navigation menu' }).focus();
  await page.keyboard.press('Enter');
  const drawer = page.getByRole('dialog', { name: 'Navigation' });
  await expect(drawer).toBeVisible();
  await drawer.getByRole('link', { name: 'Statistics' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/statistics$/);
  await expect(page.locator('#main-content')).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/solves$/);
  await expect(page.getByRole('heading', { name: 'Solves', level: 1 })).toBeVisible();
});
