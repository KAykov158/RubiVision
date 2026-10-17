import { expect, test } from '@playwright/test';

const widths = [320, 375, 768, 1024, 1440];
const themes = ['light', 'dark'] as const;
const pages = [
  { path: '/analyze', title: 'Analyze' },
  { path: '/challenges', title: 'Challenges' },
  { path: '/settings', title: 'Settings' },
] as const;

for (const route of pages) {
  for (const theme of themes) {
    for (const width of widths) {
      test(`${route.title} layout at ${width}px in ${theme} theme`, async ({ page }, testInfo) => {
        const pageErrors: string[] = [];
        page.on('pageerror', (error) => pageErrors.push(error.message));
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(route.path);
        await expect(page.getByRole('heading', { name: route.title, level: 1 })).toBeVisible();
        await expect(page.locator('.app-sidebar .app-navigation__link[aria-current="page"]')).toHaveText(route.title);
        const layout = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
          main: document.querySelector<HTMLElement>('#main-content')?.getBoundingClientRect().width ?? 0,
          headerRight: document.querySelector<HTMLElement>('.app-header')?.getBoundingClientRect().right ?? 0,
          background: getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim(),
        }));
        expect(layout.document, JSON.stringify(layout)).toBeLessThanOrEqual(width);
        expect(layout.body, JSON.stringify(layout)).toBeLessThanOrEqual(width);
        expect(layout.main).toBeGreaterThan(0);
        expect(layout.headerRight).toBeLessThanOrEqual(width + 1);
        expect(layout.background).toBe(theme === 'dark' ? '#0c0e12' : '#f5f6f8');

        if (route.path === '/analyze') {
          await expect(page.getByRole('button', { name: 'Start camera recording' })).toBeDisabled();
          await expect(page.getByRole('button', { name: 'Choose a video' })).toBeDisabled();
          await expect(page.getByRole('img', { name: /No recording selected/ })).toBeVisible();
          await expect(page.getByText(/do not identify exact cube moves/)).toBeVisible();
        } else if (route.path === '/challenges') {
          await expect(page.getByRole('heading', { name: 'No challenge entries are available' })).toBeVisible();
          await expect(page.getByRole('heading', { name: 'Challenge participation unavailable' })).toBeVisible();
          await expect(page.getByRole('button', { name: 'Join a challenge' })).toBeDisabled();
        } else {
          await expect(page.getByRole('combobox', { name: 'Color theme' })).toBeEnabled();
          await expect(page.getByRole('combobox', { name: 'Display language' })).toBeDisabled();
          await expect(page.getByRole('heading', { name: 'Account settings unavailable' })).toBeVisible();
        }

        await page.screenshot({ path: testInfo.outputPath(`${route.title.toLowerCase()}-${theme}-${width}.png`), fullPage: true });
        expect(pageErrors).toEqual([]);
      });
    }
  }
}

test('mobile drawer routes through Analyze, Challenges, and Settings with focus and history support', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/analyze');
  const openMenu = page.getByRole('button', { name: 'Open navigation menu' });
  await openMenu.click();
  const dialog = page.getByRole('dialog', { name: 'Navigation' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('link', { name: 'Challenges' }).click();
  await expect(page).toHaveURL(/\/challenges$/);
  await expect(page.locator('#main-content')).toBeFocused();
  await openMenu.click();
  await page.getByRole('dialog', { name: 'Navigation' }).getByRole('link', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/challenges$/);
  await expect(page.getByRole('heading', { name: 'Challenges', level: 1 })).toBeVisible();
});

test('Analyze respects reduced-motion preferences', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/analyze');
  const transitionDuration = await page.locator('.analyze-entry-card .rv-button').first().evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(Math.max(...transitionDuration.split(',').map((duration) => Number.parseFloat(duration)))).toBeLessThanOrEqual(0.00001);
});
