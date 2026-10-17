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
        const timerText = timer?.firstChild;
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
          timerDigitLines: timerText ? (() => { const range = document.createRange(); range.selectNodeContents(timerText); return range.getClientRects().length; })() : null,
          header: rect(header),
          menu: rect(menu),
          menuDisplay: menu ? getComputedStyle(menu).display : null,
          brand: rect(brand),
          sidebarDisplay: sidebar ? getComputedStyle(sidebar).display : null,
          mainChildOverlaps: overlaps,
          outOfBoundsControls,
          undersizedTouchTargets,
          background: getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim(),
          navigationListStyle: sidebar ? getComputedStyle(sidebar.querySelector('.app-navigation')!).listStyleType : null,
          profileVisible: sidebar ? visible(sidebar.querySelector<HTMLElement>('.app-sidebar__profile')!) : false,
          scramble: rect(document.querySelector('.timer-page__scramble')),
          readout: rect(document.querySelector('.timer-page__readout')),
          stats: rect(document.querySelector('.timer-page__stats-section')),
          sessionRail: rect(document.querySelector('.timer-page__session-rail')),
        };
      });

      expect(layout.documentWidth, JSON.stringify(layout)).toBeLessThanOrEqual(width);
      expect(layout.bodyWidth, JSON.stringify(layout)).toBeLessThanOrEqual(width);
      expect(layout.timer).not.toBeNull();
      expect(layout.timerScrollWidth).toBeLessThanOrEqual((layout.timerClientWidth ?? 0) + 1);
      expect(layout.timerDigitLines).toBe(1);
      expect(layout.mainChildOverlaps, JSON.stringify(layout)).toEqual([]);
      expect(layout.outOfBoundsControls, JSON.stringify(layout)).toEqual([]);
      expect(layout.undersizedTouchTargets, JSON.stringify(layout)).toEqual([]);
      expect(layout.background).toBe(theme === 'dark' ? '#0c0e12' : '#f5f6f8');
      expect(layout.navigationListStyle).toBe('none');
      expect(layout.profileVisible).toBe(width >= 768);
      expect(layout.scramble?.top).toBeLessThan(layout.readout?.top ?? 0);
      await expect(page.getByRole('heading', { name: 'Session overview' })).toBeVisible();

      if (width < 768) {
        expect(layout.readout?.top).toBeLessThan(layout.stats?.top ?? 0);
        expect(layout.menuDisplay).not.toBe('none');
        expect(layout.sidebarDisplay).toBe('none');
        expect(layout.header?.right).toBeLessThanOrEqual(width);
        expect(layout.menu?.right).toBeLessThanOrEqual(layout.brand?.left ?? 0);
      } else {
        expect(layout.menuDisplay).toBe('none');
        expect(layout.sidebarDisplay).not.toBe('none');
      }

      if (width >= 1024) {
        expect(layout.sessionRail?.width).toBeGreaterThan(0);
      }

      await page.screenshot({ path: testInfo.outputPath(`timer-${theme}-${width}.png`), fullPage: true });
      expect(browserErrors, browserErrors.join('\n')).toEqual([]);
    });
  }
}

test('long service-provided scramble notation wraps at the viewport widths without page overflow', async ({ page }) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/timer');
    await expect(page.locator('.timer-page__scramble-empty')).toBeVisible();
    const longNotation = Array.from({ length: 48 }, (_, index) => ['R', "U'", 'F2', 'D', "L'", 'B2'][index % 6]).join(' ');

    await page.evaluate((notation) => {
      const placeholder = document.querySelector('.timer-page__scramble-empty');
      if (!placeholder) throw new Error('Scramble placeholder was not rendered');
      const content = document.createElement('p');
      content.className = 'timer-page__scramble-notation';
      content.textContent = notation;
      placeholder.replaceWith(content);
    }, longNotation);

    const layout = await page.locator('.timer-page__scramble-notation').evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return {
        lineCount: range.getClientRects().length,
        elementWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        documentWidth: document.documentElement.scrollWidth,
        text: element.textContent,
      };
    });

    expect(layout.lineCount, `${width}px: scramble should wrap`).toBeGreaterThan(1);
    expect(layout.scrollWidth, `${width}px: scramble should not clip`).toBeLessThanOrEqual(layout.elementWidth + 1);
    expect(layout.documentWidth, `${width}px: page should not overflow`).toBeLessThanOrEqual(width);
    expect(layout.text).toBe(longNotation);
  }
});

for (const theme of themes) {
  for (const width of [320, 1440]) {
    test(`timer selectors support all puzzles and keyboard focus at ${width}px in ${theme} mode`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto('/timer');

      const puzzle = page.getByRole('combobox', { name: 'Puzzle type' });
      const session = page.getByRole('combobox', { name: 'Session' });
      await expect(puzzle).toBeVisible();
      await expect(puzzle.locator('option')).toHaveCount(6);
      await expect(session).toBeVisible();
      await expect(session).toBeDisabled();
      await expect(session).toHaveValue('');
      await expect(session.locator('option')).toHaveText('Sessions unavailable');

      for (const value of ['222', '333', '444', '555', '666', '777']) {
        await puzzle.selectOption(value);
        await expect(puzzle).toHaveValue(value);
        await expect(page.locator('.timer-page__scramble > .timer-page__hint strong')).toHaveText(`${value[0]}\u00D7${value[0]}\u00D7${value[0]}`);
      }

      await puzzle.selectOption('333');
      await puzzle.focus();
      await page.keyboard.press('ArrowDown');
      await expect(puzzle).toHaveValue('444');
      await page.keyboard.press('Escape');
      await expect(puzzle).toBeFocused();
      const selectorLayout = await page.evaluate(() => {
        const toolbar = document.querySelector<HTMLElement>('.timer-page__toolbar');
        const controls = [...document.querySelectorAll<HTMLElement>('.timer-page__selector-control')];
        return {
          documentWidth: document.documentElement.scrollWidth,
          toolbarWidth: toolbar?.clientWidth ?? 0,
          toolbarScrollWidth: toolbar?.scrollWidth ?? 0,
          controlsWithinToolbar: controls.every((control) => {
            const parent = control.parentElement;
            if (!parent) return false;
            const controlRect = control.getBoundingClientRect();
            const parentRect = parent.getBoundingClientRect();
            return controlRect.left >= parentRect.left && controlRect.right <= parentRect.right;
          }),
        };
      });
      expect(selectorLayout.documentWidth).toBeLessThanOrEqual(width);
      expect(selectorLayout.toolbarScrollWidth).toBeLessThanOrEqual(selectorLayout.toolbarWidth + 1);
      expect(selectorLayout.controlsWithinToolbar).toBe(true);
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
  await expect.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--color-background').trim())).toBe('#0c0e12');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--color-background').trim())).toBe('#0c0e12');

  await theme.selectOption('light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--color-background').trim())).toBe('#f5f6f8');

  await theme.selectOption('system');
  await expect.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--color-background').trim())).toBe('#0c0e12');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--color-background').trim())).toBe('#f5f6f8');
});

test('keyboard navigation opens the mobile drawer and focuses the new route', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/timer');

  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeAttached();
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
