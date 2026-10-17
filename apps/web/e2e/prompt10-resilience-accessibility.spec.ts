import { expect, test } from '@playwright/test';

const routes = ['/timer', '/solves', '/statistics', '/analyze', '/challenges', '/settings'];

test('each route has one top-level heading, a main landmark, and a working skip link', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveCount(1);
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Skip to content' });
    await expect(skipLink).toBeFocused();
    const focusStyle = await skipLink.evaluate((element) => ({
      outlineStyle: getComputedStyle(element).outlineStyle,
      outlineWidth: getComputedStyle(element).outlineWidth,
    }));
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
    expect(focusStyle.outlineStyle).not.toBe('none');
    expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThanOrEqual(3);
  }
});

test('mobile navigation traps focus, dismisses on Escape, and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/timer');
  const trigger = page.getByRole('button', { name: 'Open navigation menu' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Navigation' });
  await expect(dialog).toBeVisible();

  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('link', { name: 'Settings' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('offline status is informational and navigation remains usable', async ({ page, context, browserName }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/timer');
  await context.setOffline(true);
  await expect.poll(() => page.evaluate(() => navigator.onLine)).toBe(false);
  test.skip(browserName === 'webkit', 'Playwright WebKit changes navigator.onLine but does not deliver the offline event; event handling is tested separately.');
  await expect(page.locator('.app-connectivity')).toContainText('Your browser reports that you are offline');

  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.getByRole('dialog', { name: 'Navigation' }).getByRole('link', { name: 'Challenges' }).click();
  await expect(page).toHaveURL(/\/challenges$/);
  await expect(page.getByRole('heading', { name: 'Challenges', level: 1 })).toBeVisible();
  await expect(page.locator('.app-connectivity')).toContainText('Your browser reports that you are offline');

  await context.setOffline(false);
  await expect(page.locator('.rv-visually-hidden[role="status"]')).toContainText('network connection is available again');
});

test('text and button color pairs retain normal-text contrast in light and dark modes', async ({ page }) => {
  const ratio = (foreground: string, background: string) => {
    const luminance = (color: string) => {
      const channels = color.match(/[\da-f]{2}/gi)?.slice(-3).map((part) => Number.parseInt(part, 16) / 255) ?? [];
      if (channels.length !== 3) return Number.NaN;
      const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
      return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722;
    };
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0]! + 0.05) / (values[1]! + 0.05);
  };

  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/settings');
    const colors = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return Object.fromEntries(['--color-text', '--color-text-muted', '--color-surface', '--color-background', '--color-on-accent', '--color-accent']
        .map((name) => [name, style.getPropertyValue(name).trim()]));
    });
    expect(ratio(colors['--color-text']!, colors['--color-background']!)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(colors['--color-text-muted']!, colors['--color-surface']!)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(colors['--color-on-accent']!, colors['--color-accent']!)).toBeGreaterThanOrEqual(4.5);
  }
});
