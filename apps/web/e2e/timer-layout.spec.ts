import { expect, test } from '@playwright/test';
import { signInFromProtectedRoute } from './support/mockAuth';

const widths = [320, 360, 375, 390, 430, 768, 1024, 1440];
const themes = ['light', 'dark'] as const;

for (const theme of themes) {
  for (const width of widths) {
    test(`Timer layout has no overflow or clipping at ${width}px in ${theme} mode`, async ({ page }, testInfo) => {
      const browserErrors: string[] = [];
      page.on('pageerror', (error) => browserErrors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error' && !message.text().includes('ERR_NETWORK_ACCESS_DENIED')) browserErrors.push(message.text());
      });

      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto('/timer');
      await expect(page.getByRole('heading', { name: 'Timer', level: 1 })).toBeVisible();
      await expect(page.getByRole('combobox', { name: 'Puzzle type' })).toBeVisible();
      await expect(page.getByRole('combobox', { name: 'Session' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Start timer' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Stop timer' })).toHaveCount(0);
      await expect(page.locator('.timer-page__scramble textarea')).toHaveCount(0);
      await expect(page.locator('.timer-page__scramble input')).toHaveCount(0);
      await expect(page.getByRole('timer')).toHaveText('00.00');

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
        const selectorSafety = [...document.querySelectorAll<HTMLElement>('.timer-page__selector-control')].map((control) => {
          const select = control.querySelector<HTMLSelectElement>('select');
          const icon = control.querySelector<HTMLElement>('.timer-page__selector-icon');
          const chevron = control.querySelector<HTMLElement>('.timer-page__selector-chevron');
          if (!select || !icon || !chevron) return null;
          const selectRect = select.getBoundingClientRect();
          const iconRect = icon.getBoundingClientRect();
          const chevronRect = chevron.getBoundingClientRect();
          const style = getComputedStyle(select);
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (context) context.font = style.font;
          const selectedText = select.selectedOptions[0]?.textContent?.trim() ?? '';
          const availableWidth = select.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight);
          const measuredTextWidth = context?.measureText(selectedText).width ?? 0;
          return {
            name: select.getAttribute('aria-label'),
            displayedText: selectedText,
            measuredTextWidth,
            availableWidth,
            iconClearance: Number.parseFloat(style.paddingLeft) - (iconRect.right - selectRect.left),
            chevronClearance: Number.parseFloat(style.paddingRight) - (selectRect.right - chevronRect.left),
            textFits: availableWidth >= measuredTextWidth,
          };
        });
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
          timerAccessibleLabel: timer?.getAttribute('aria-label') ?? null,
          header: rect(header),
          menu: rect(menu),
          menuDisplay: menu ? getComputedStyle(menu).display : null,
          brand: rect(brand),
          sidebarDisplay: sidebar ? getComputedStyle(sidebar).display : null,
          mainChildOverlaps: overlaps,
          outOfBoundsControls,
          undersizedTouchTargets,
          selectorSafety,
          background: getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim(),
          navigationListStyle: sidebar ? getComputedStyle(sidebar.querySelector('.app-navigation')!).listStyleType : null,
          profileVisible: sidebar ? visible(sidebar.querySelector<HTMLElement>('.app-sidebar__profile')!) : false,
          scramble: rect(document.querySelector('.timer-page__scramble')),
          readout: rect(document.querySelector('.timer-page__readout')),
          sevenSegment: rect(document.querySelector('.timer-page__seven-segment')),
          stats: rect(document.querySelector('.timer-page__stats-section')),
          sessionRail: rect(document.querySelector('.timer-page__session-rail')),
        };
      });

      expect(layout.documentWidth, JSON.stringify(layout)).toBeLessThanOrEqual(width);
      expect(layout.bodyWidth, JSON.stringify(layout)).toBeLessThanOrEqual(width);
      expect(layout.timer).not.toBeNull();
      expect(layout.timerScrollWidth).toBeLessThanOrEqual((layout.timerClientWidth ?? 0) + 1);
      expect(layout.timerAccessibleLabel).toBe('00.00');
      expect(layout.sevenSegment?.left).toBeGreaterThanOrEqual((layout.readout?.left ?? 0) - 1);
      expect(layout.sevenSegment?.right).toBeLessThanOrEqual((layout.readout?.right ?? width) + 1);
      expect(Math.abs(((layout.sevenSegment?.left ?? 0) + (layout.sevenSegment?.right ?? 0)) / 2 - ((layout.readout?.left ?? 0) + (layout.readout?.right ?? 0)) / 2)).toBeLessThanOrEqual(1);
      expect(layout.mainChildOverlaps, JSON.stringify(layout)).toEqual([]);
      expect(layout.outOfBoundsControls, JSON.stringify(layout)).toEqual([]);
      expect(layout.undersizedTouchTargets, JSON.stringify(layout)).toEqual([]);
      expect(layout.selectorSafety, JSON.stringify(layout)).toHaveLength(2);
      for (const selector of layout.selectorSafety) {
        expect(selector?.iconClearance, JSON.stringify(layout)).toBeGreaterThanOrEqual(4);
        expect(selector?.chevronClearance, JSON.stringify(layout)).toBeGreaterThanOrEqual(4);
        expect(selector?.textFits, JSON.stringify(layout)).toBe(true);
      }
      expect(layout.background).toBe(theme === 'dark' ? '#0c0e12' : '#f5f6f8');
      expect(layout.navigationListStyle).toBe('none');
      expect(layout.profileVisible).toBe(width >= 768);
      expect(layout.sevenSegment?.height).toBeGreaterThan(50);
      if (width >= 1280) expect(layout.sevenSegment?.height).toBeGreaterThan(160);
      else if (width >= 768) {
        expect(layout.sevenSegment?.height).toBeGreaterThan(90);
        expect(layout.sevenSegment?.height).toBeLessThan(120);
      } else expect(layout.sevenSegment?.height).toBeLessThan(90);
      const selectorOrder = await page.locator('.timer-page__selector-field').evaluateAll((fields) => fields.map((field) => field.querySelector('select')?.getAttribute('aria-label')));
      expect(selectorOrder).toEqual(['Puzzle type', 'Session']);
      const [puzzleSelectorBox, sessionSelectorBox] = await page.locator('.timer-page__selector-field').all().then((fields) => Promise.all(fields.map((field) => field.boundingBox())));
      expect(puzzleSelectorBox).not.toBeNull();
      expect(sessionSelectorBox).not.toBeNull();
      if (width > 480 && puzzleSelectorBox && sessionSelectorBox) {
        expect(Math.abs(puzzleSelectorBox.y - sessionSelectorBox.y)).toBeLessThanOrEqual(1);
        expect(sessionSelectorBox.x).toBeGreaterThan(puzzleSelectorBox.x);
      } else if (puzzleSelectorBox && sessionSelectorBox) {
        expect(sessionSelectorBox.y).toBeGreaterThanOrEqual(puzzleSelectorBox.y + puzzleSelectorBox.height);
      }
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

test('Settings icon keeps the shared navigation alignment and sizing', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/timer');
  const settingsLink = page.getByRole('link', { name: 'Settings' });
  await expect(settingsLink).toBeVisible();
  const alignment = await settingsLink.evaluate((link) => {
    const icon = link.querySelector<SVGElement>('.app-navigation__icon');
    const referenceIcon = document.querySelector<SVGElement>('.app-navigation__link:not(:has(.app-navigation__icon--settings)) .app-navigation__icon');
    if (!icon || !referenceIcon) return null;
    return {
      navigationAlignItems: getComputedStyle(link).alignItems,
      iconWidth: getComputedStyle(icon).width,
      iconHeight: getComputedStyle(icon).height,
      referenceIconWidth: getComputedStyle(referenceIcon).width,
      referenceIconHeight: getComputedStyle(referenceIcon).height,
      transform: getComputedStyle(icon).transform,
      circleCenters: [...icon.querySelectorAll('circle')].map((circle) => [circle.getAttribute('cx'), circle.getAttribute('cy')]),
    };
  });
  expect(alignment?.navigationAlignItems).toBe('center');
  expect(alignment?.iconWidth).toBe(alignment?.referenceIconWidth);
  expect(alignment?.iconHeight).toBe(alignment?.referenceIconHeight);
  expect(alignment?.transform).toBe('none');
  expect(alignment?.circleCenters).toEqual([['12', '12'], ['12', '12']]);
});

test('Space uses red hold, green arm, release to start, and press to stop', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/timer');
  const timer = page.getByRole('timer');
  const control = page.getByRole('button', { name: 'Timer control' });
  await expect(timer).toHaveText('00.00');
  await expect(page.getByRole('button', { name: 'Start timer' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Stop timer' })).toHaveCount(0);
  expect(await timer.locator('.timer-page__digit').count()).toBe(4);
  expect(await timer.locator('.timer-page__digit-segment').count()).toBe(28);
  expect(await timer.locator('.timer-page__decimal circle').count()).toBe(1);
  const initialWidth = (await timer.boundingBox())?.width;
  const colors = await page.evaluate(() => {
    const resolve = (token: string) => {
      const probe = document.createElement('span');
      probe.style.color = `var(${token})`;
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    };
    return { danger: resolve('--color-danger'), success: resolve('--color-success') };
  });

  await page.keyboard.down('Space');
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await expect(timer).toHaveCSS('color', colors.danger);
  await page.waitForTimeout(560);
  await expect(timer).toHaveCSS('color', colors.success);
  await expect(control).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.up('Space');
  await expect(control).toHaveAttribute('aria-pressed', 'true');
  expect((await timer.boundingBox())?.width).toBe(initialWidth);
  const centering = await page.evaluate(() => {
    const display = document.querySelector('.timer-page__seven-segment')!.getBoundingClientRect();
    const panel = document.querySelector('.timer-page__readout')!.getBoundingClientRect();
    return { displayCenter: (display.left + display.right) / 2, panelCenter: (panel.left + panel.right) / 2 };
  });
  expect(Math.abs(centering.displayCenter - centering.panelCenter)).toBeLessThanOrEqual(1);
  await expect(timer).not.toHaveCSS('color', colors.success);
  await page.waitForTimeout(240);
  await page.keyboard.down('Space');
  await expect(control).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.up('Space');
  await expect(page.getByRole('heading', { name: 'Solve not saved' })).toBeVisible();
  const stoppedTime = await timer.textContent();
  await page.waitForTimeout(100);
  await expect(timer).toHaveText(stoppedTime ?? '');
});

test('timer display provides accessible pointer hold-to-start and tap-to-stop', async ({ page }) => {
  await page.goto('/timer');
  const timer = page.getByRole('timer');
  const control = page.getByRole('button', { name: 'Timer control' });
  await expect(control).toHaveAttribute('aria-keyshortcuts', 'Space');
  await expect(control).toHaveAttribute('aria-describedby', 'timer-touch-instructions');
  await control.dispatchEvent('pointerdown', { pointerType: 'touch', pointerId: 1, isPrimary: true, button: 0, buttons: 1 });
  await expect(timer).toHaveCSS('color', 'rgb(161, 34, 34)');
  await page.waitForTimeout(560);
  await expect(timer).toHaveCSS('color', 'rgb(23, 99, 60)');
  await control.dispatchEvent('pointerup', { pointerType: 'touch', pointerId: 1, isPrimary: true, button: 0, buttons: 0 });
  await expect(control).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(120);
  await control.dispatchEvent('pointerdown', { pointerType: 'touch', pointerId: 1, isPrimary: true, button: 0, buttons: 1 });
  await control.dispatchEvent('pointerup', { pointerType: 'touch', pointerId: 1, isPrimary: true, button: 0, buttons: 0 });
  await expect(control).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('heading', { name: 'Solve not saved' })).toBeVisible();
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
      await expect(session.locator('option')).toHaveText('Sign in for sessions');
      await expect(session).toHaveAttribute('aria-describedby', 'timer-session-hint');
      await expect(page.locator('#timer-session-hint')).toBeVisible();

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

test('short mobile navigation drawer scrolls its links while keeping the close button visible', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 320 });
  await page.goto('/timer');
  const menu = page.getByRole('button', { name: 'Open navigation menu' });
  await menu.click();
  const drawer = page.getByRole('dialog', { name: 'Navigation' });
  const close = drawer.getByRole('button', { name: 'Close dialog' });
  const content = drawer.locator('.rv-dialog__content');

  await expect(drawer).toBeVisible();
  await expect(close).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  const scrollable = await content.evaluate((element) => element.scrollHeight > element.clientHeight);
  expect(scrollable).toBe(true);
  await content.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await expect(close).toBeVisible();
  const closeWithinViewport = await close.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= document.documentElement.clientHeight;
  });
  expect(closeWithinViewport).toBe(true);

  await close.click();
  await expect(drawer).not.toBeVisible();
  await expect(menu).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

const drawerViewports = [
  { width: 320, height: 568 },
  { width: 360, height: 740 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 900 },
  { width: 568, height: 320 },
  { width: 740, height: 360 },
];

for (const theme of themes) {
  for (const viewport of drawerViewports) {
    test(`navigation drawer fits ${viewport.width}x${viewport.height} in ${theme} theme`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ colorScheme: theme });
      await page.goto('/timer');
      const menu = page.getByRole('button', { name: 'Open navigation menu' });
      await menu.click();
      const dialog = page.getByRole('dialog', { name: 'Navigation' });
      await expect(dialog).toBeVisible();

      const layout = await dialog.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const header = element.querySelector<HTMLElement>('.rv-dialog__header')!.getBoundingClientRect();
        const close = element.querySelector<HTMLElement>('.rv-dialog__header button')!.getBoundingClientRect();
        const content = element.querySelector<HTMLElement>('.rv-dialog__content')!;
        const links = [...element.querySelectorAll<HTMLElement>('.app-navigation__link')].map((link) => link.getBoundingClientRect().height);
        const backdrop = getComputedStyle(element, '::backdrop').backgroundColor;
        const alpha = Number(backdrop.match(/,\s*([\d.]+)\)$/)?.[1] ?? 0);
        return {
          drawer: { left: rect.left, top: rect.top, right: rect.right, width: rect.width, height: rect.height },
          header: { left: header.left, right: header.right, top: header.top, bottom: header.bottom },
          close: { left: close.left, right: close.right, top: close.top, bottom: close.bottom, width: close.width, height: close.height },
          contentScrollable: content.scrollHeight > content.clientHeight,
          bodyOverflow: document.body.style.overflow,
          links,
          backdrop,
          backdropAlpha: alpha,
          documentWidth: document.documentElement.scrollWidth,
        };
      });

      expect(layout.drawer.left).toBe(0);
      expect(layout.drawer.top).toBe(0);
      expect(layout.drawer.height).toBe(viewport.height);
      expect(layout.drawer.width).toBeLessThanOrEqual(Math.min(256, viewport.width - 64) + 1);
      expect(layout.drawer.right).toBeLessThan(viewport.width);
      expect(layout.header.left).toBeGreaterThanOrEqual(layout.drawer.left);
      expect(layout.header.right).toBeLessThanOrEqual(layout.drawer.right);
      expect(layout.close.left).toBeGreaterThanOrEqual(layout.drawer.left);
      expect(layout.close.right).toBeLessThanOrEqual(layout.drawer.right);
      expect(layout.close.width).toBeGreaterThanOrEqual(44);
      expect(layout.close.height).toBeGreaterThanOrEqual(44);
      expect(layout.bodyOverflow).toBe('hidden');
      expect(layout.backdropAlpha).toBeCloseTo(0.62, 2);
      expect(layout.documentWidth).toBeLessThanOrEqual(viewport.width);
      expect(layout.links.every((height) => height >= 44)).toBe(true);
      if (viewport.height <= 360) expect(layout.contentScrollable).toBe(true);

      const startScroll = await page.evaluate(() => window.scrollY);
      await page.mouse.move(viewport.width - 8, viewport.height / 2);
      await page.mouse.wheel(0, 360);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(startScroll);
      await page.screenshot({ path: testInfo.outputPath(`drawer-${theme}-${viewport.width}x${viewport.height}.png`) });

      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(menu).toBeFocused();
      await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    });
  }
}

for (const viewport of [{ width: 568, height: 320 }, { width: 740, height: 360 }]) {
  test(`timer selectors remain usable in landscape at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/timer');
    const puzzle = page.getByRole('combobox', { name: 'Puzzle type' });
    const session = page.getByRole('combobox', { name: 'Session' });
    await expect(puzzle).toBeVisible();
    await expect(session).toBeDisabled();
    const layout = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      controlsFit: [...document.querySelectorAll<HTMLElement>('.timer-page__selector-control')].every((element) => {
        const rect = element.getBoundingClientRect();
        const bounds = element.parentElement!.getBoundingClientRect();
        return rect.left >= bounds.left && rect.right <= bounds.right;
      }),
      toolbarScrollWidth: document.querySelector<HTMLElement>('.timer-page__toolbar')!.scrollWidth,
      toolbarWidth: document.querySelector<HTMLElement>('.timer-page__toolbar')!.clientWidth,
    }));
    expect(layout.documentWidth).toBeLessThanOrEqual(viewport.width);
    expect(layout.controlsFit).toBe(true);
    expect(layout.toolbarScrollWidth).toBeLessThanOrEqual(layout.toolbarWidth + 1);
  });
}

test('theme settings override system theme while system mode follows it', async ({ page }) => {
  await signInFromProtectedRoute(page, 1024, 900);
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
  await signInFromProtectedRoute(page, 320, 740);
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
