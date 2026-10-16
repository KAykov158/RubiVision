import { expect, test } from '@playwright/test';

const widths = [320, 375, 768, 1024, 1440];
const themes = ['light', 'dark'] as const;

for (const theme of themes) {
  for (const width of widths) {
    test(`Timer layout has no overflow or clipping at ${width}px in ${theme} mode`, async ({ page }, testInfo) => {
      const browserErrors: string[] = [];
      page.on('pageerror', (error) => browserErrors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') browserErrors.push(message.text());
      });

      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto('/timer');
      await expect(page.getByRole('heading', { name: 'Timer', level: 1 })).toBeVisible();
      await expect(page.getByRole('combobox', { name: 'Puzzle type' })).toBeVisible();

      const layout = await page.evaluate(() => {
        const timer = document.querySelector<HTMLElement>('[role="timer"]');
        const main = document.querySelector<HTMLElement>('#main-content');
        const header = document.querySelector<HTMLElement>('.app-header');
        const menu = document.querySelector<HTMLElement>('.app-header__menu');
        const brand = document.querySelector<HTMLElement>('.app-header__brand');
        const sidebar = document.querySelector<HTMLElement>('.app-sidebar');
        const viewportWidth = document.documentElement.clientWidth;
        const visible = (element: HTMLElement) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
        const rect = (element: Element | null) => {
          if (!element) return null;
          const { left, right, top, bottom, width, height } = element.getBoundingClientRect();
          return { left, right, top, bottom, width, height };
        };
        const children = main ? [...main.children] : [];
        const overlaps: string[] = [];
        for (let leftIndex = 0; leftIndex < children.length; leftIndex += 1) {
          for (let rightIndex = leftIndex + 1; rightIndex < children.length; rightIndex += 1) {
            const leftElement = children[leftIndex];
            const rightElement = children[rightIndex];
            if (!leftElement || !rightElement) continue;
            const left = leftElement.getBoundingClientRect();
            const right = rightElement.getBoundingClientRect();
            if (left.left < right.right && left.right > right.left && left.top < right.bottom && left.bottom > right.top) {
              overlaps.push(`${leftElement.tagName}:${leftIndex}/${rightElement.tagName}:${rightIndex}`);
            }
          }
        }
        const visibleControls = [...document.querySelectorAll<HTMLElement>('.app-header button, .timer-page button, .timer-page select')].filter(visible);
        const outOfBoundsControls = visibleControls.flatMap((element) => {
          const { left, right } = element.getBoundingClientRect();
          return left < -1 || right > viewportWidth + 1 ? [element.getAttribute('aria-label') ?? element.textContent?.trim() ?? element.tagName] : [];
        });
        const undersizedTouchTargets = visibleControls.flatMap((element) => {
          const { width, height } = element.getBoundingClientRect();
          return width < 44 || height < 44 ? [element.getAttribute('aria-label') ?? element.textContent?.trim() ?? element.tagName] : [];
        });

        return {
          viewportWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          timer: rect(timer),
          timerScrollWidth: timer?.scrollWidth ?? null,
          timerClientWidth: timer?.clientWidth ?? null,
          header: rect(header),
          menu: rect(menu),
          menuDisplay: menu ? getComputedStyle(menu).display : null,
          brand: rect(brand),
          sidebarDisplay: sidebar ? getComputedStyle(sidebar).display : null,
          mainChildOverlaps: overlaps,
          outOfBoundsControls,
          undersizedTouchTargets,
          background: getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim(),
        };
      });

      expect(layout.documentWidth, JSON.stringify(layout)).toBeLessThanOrEqual(width);
      expect(layout.bodyWidth, JSON.stringify(layout)).toBeLessThanOrEqual(width);
      expect(layout.timer).not.toBeNull();
      expect(layout.timerScrollWidth).toBeLessThanOrEqual((layout.timerClientWidth ?? 0) + 1);
      expect(layout.mainChildOverlaps, JSON.stringify(layout)).toEqual([]);
      expect(layout.outOfBoundsControls, JSON.stringify(layout)).toEqual([]);
      expect(layout.undersizedTouchTargets, JSON.stringify(layout)).toEqual([]);
      expect(layout.background).toBe(theme === 'dark' ? '#101828' : '#f5f6f8');

      if (width < 768) {
        expect(layout.menuDisplay).not.toBe('none');
        expect(layout.sidebarDisplay).toBe('none');
        expect(layout.header?.right).toBeLessThanOrEqual(width);
        expect(layout.menu?.right).toBeLessThanOrEqual(layout.brand?.left ?? 0);
      } else {
        expect(layout.menuDisplay).toBe('none');
        expect(layout.sidebarDisplay).not.toBe('none');
      }

      await page.screenshot({ path: testInfo.outputPath(`timer-${theme}-${width}.png`), fullPage: true });
      expect(browserErrors, browserErrors.join('\n')).toEqual([]);
    });
  }
}

test('native mobile navigation traps focus, closes on Escape, and restores focus', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/timer');
  const menu = page.getByRole('button', { name: 'Open navigation menu' });
  const dialog = page.getByRole('dialog', { name: 'Navigation' });

  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);

  const close = dialog.getByRole('button', { name: 'Close dialog' });
  const lastLink = dialog.getByRole('link', { name: 'Settings' });
  await page.screenshot({ path: testInfo.outputPath('timer-mobile-navigation-open.png'), fullPage: true });
  await lastLink.focus();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(lastLink).toBeFocused();
  await page.keyboard.press('Escape');

  await expect(dialog).not.toBeVisible();
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
});

test('theme settings override system theme while system mode follows it', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/settings');
  const theme = page.getByRole('combobox', { name: 'Color theme' });

  await theme.selectOption('dark');
  await expect.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--color-background').trim())).toBe('#101828');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--color-background').trim())).toBe('#101828');

  await theme.selectOption('light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--color-background').trim())).toBe('#f5f6f8');

  await theme.selectOption('system');
  await expect.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--color-background').trim())).toBe('#101828');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--color-background').trim())).toBe('#f5f6f8');
});

test('keyboard navigation opens the mobile drawer and focuses the new route', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/timer');

  const skip = page.getByRole('link', { name: 'Skip to content' });
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();

  const puzzle = page.getByRole('combobox', { name: 'Puzzle type' });
  await puzzle.focus();
  await page.keyboard.press('ArrowDown');
  await expect(puzzle).toHaveValue('444');

  const menu = page.getByRole('button', { name: 'Open navigation menu' });
  await menu.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Navigation' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('link', { name: 'Solves' }).focus();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/solves$/);
  await expect(page.getByRole('heading', { name: 'Solves', level: 1 })).toBeVisible();
  await expect(page.locator('#main-content')).toBeFocused();
  await expect(dialog).not.toBeVisible();
});
