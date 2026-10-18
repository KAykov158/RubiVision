import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { signInFromProtectedRoute } from './support/mockAuth';

const fixtureUserId = 'd1e79f7e-816c-468f-9a66-312f50712b37';
const fixtureSessionId = '11111111-1111-4111-8111-111111111111';
const fixtureScrambleId = '22222222-2222-4222-8222-222222222222';
const fixtureNotation = "R U R' U'";

async function completeKeyboardSolve(page: Page) {
  await page.locator('#main-content').focus();
  await page.keyboard.down('Space');
  await expect(page.locator('.timer-page__digits')).toHaveClass(/timer-page__digits--holding/u);
  await expect(page.locator('.timer-page__digits')).toHaveClass(/timer-page__digits--armed/u);
  await page.keyboard.up('Space');
  await expect(page.getByRole('button', { name: 'Timer control' })).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(180);
  await page.keyboard.down('Space');
  await page.keyboard.up('Space');
}

test('protected-route sign-in returns to the requested route and Settings reflects connected Auth', async ({ page }) => {
  await signInFromProtectedRoute(page, 1280);
  await expect(page).toHaveURL(/\/statistics$/u);
  await page.goto('/settings');
  await expect(page.getByText('Supabase Auth is not connected.')).toHaveCount(0);
  await expect(page.getByText('browser-user@example.test')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
  await expect(page.getByText('browser-user@example.test')).toBeVisible();
});

test('public timer remains usable without a scramble and exposes volatile recovery', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/timer');
  await expect(page.getByRole('timer')).toHaveAttribute('aria-label', '00.00');
  await expect(page.locator('.timer-page__scramble-empty')).toBeVisible();
  await completeKeyboardSolve(page);
  await expect(page.getByRole('heading', { name: 'Solve not saved' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Saved', exact: true })).toHaveCount(0);
  const recovery = JSON.parse(await page.getByRole('textbox', { name: 'Volatile recovery data' }).inputValue()) as { solve: { scrambleId: string | null; rawTimeMs: number } };
  expect(recovery.solve.scrambleId).toBeNull();
  expect(recovery.solve.rawTimeMs).toBeGreaterThanOrEqual(0);
  await expect(page.getByRole('button', { name: 'Retry save' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Copy recovery data' }).click();
  const copied = JSON.parse(await page.evaluate(() => navigator.clipboard.readText())) as typeof recovery;
  expect(copied.solve.rawTimeMs).toBe(recovery.solve.rawTimeMs);
  await page.getByRole('link', { name: 'Solves' }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in$/u);
  await page.goBack();
  await expect(page).toHaveURL(/\/timer$/u);
  await expect(page.getByRole('heading', { name: 'Solve not saved' })).toBeVisible();
  let sawReloadWarning = false;
  page.once('dialog', async (dialog) => {
    sawReloadWarning = dialog.type() === 'beforeunload';
    await dialog.accept();
  });
  await page.reload();
  expect(sawReloadWarning).toBe(true);
  await expect(page.getByRole('heading', { name: 'Solve not saved' })).toHaveCount(0);
});

test('mocked cloud failure stays unsaved, exports the exact fixture, and retries with one solve UUID', async ({ page }, testInfo) => {
  await signInFromProtectedRoute(page, 1280);
  const fixtureUser = {
    id: fixtureUserId,
    aud: 'authenticated', role: 'authenticated',
    email: 'browser-user@example.test',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { display_name: 'Browser Test User' },
    created_at: '2026-10-18T00:00:00.000Z',
  };
  await page.route(/\/auth\/v1\/user(?:\?|$)/u, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixtureUser) }));
  await page.route(/\/src\/shared\/supabase\/repositories\.ts(?:\?|$)/u, async (route) => {
    const response = await route.fetch();
    const source = await response.text();
    const pattern = /scrambles: \{ async generate\(\) \{\s*return unavailable\("UNSUPPORTED"\);/u;
    if (!pattern.test(source)) throw new Error('Fixture injection did not find the unsupported scramble adapter.');
    const replacement = `scrambles: { async generate(puzzle) { return { status: "success", data: { id: "${fixtureScrambleId}", puzzle, notation: "${fixtureNotation}", generatorVersion: "browser-fixture-v1", createdAt: "2026-10-18T12:00:00.000Z" } };`;
    await route.fulfill({ response, body: source.replace(pattern, replacement) });
  });
  const sessions = [
    { id: fixtureSessionId, name: 'Practice', puzzle: '333', created_at: '2026-10-18T12:00:00.000Z', updated_at: '2026-10-18T12:00:00.000Z' },
    { id: '33333333-3333-4333-8333-333333333333', name: 'Evening', puzzle: '333', created_at: '2026-10-18T13:00:00.000Z', updated_at: '2026-10-18T13:00:00.000Z' },
  ];
  await page.route(/\/rest\/v1\/sessions(?:\?|$)/u, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(sessions) }));
  const scramblePosts: Array<Record<string, unknown>> = [];
  await page.route(/\/rest\/v1\/scrambles(?:\?|$)/u, (route) => {
    scramblePosts.push(JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>);
    return route.fulfill({ status: 201, contentType: 'application/json', body: '' });
  });
  const solvePosts: Array<Record<string, unknown>> = [];
  await page.route(/\/rest\/v1\/solves(?:\?|$)/u, (route) => {
    if (route.request().method() !== 'POST') return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    solvePosts.push(JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>);
    return route.fulfill(solvePosts.length === 1
      ? { status: 503, contentType: 'application/json', body: JSON.stringify({ code: 'FETCH_ERROR', message: 'network error' }) }
      : { status: 201, contentType: 'application/json', body: '' });
  });

  await page.goto('/timer');
  await expect(page.getByText(fixtureNotation, { exact: true })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Session' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Session' }).selectOption(fixtureSessionId);
  await completeKeyboardSolve(page);
  await expect(page.getByRole('heading', { name: 'Solve not saved' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Saved', exact: true })).toHaveCount(0);
  const recovery = JSON.parse(await page.getByRole('textbox', { name: 'Volatile recovery data' }).inputValue()) as { solve: { id: string; sessionId: string; scrambleId: string; rawTimeMs: number }; scramble: { notation: string } };
  expect(recovery.solve.sessionId).toBe(fixtureSessionId);
  expect(recovery.solve.scrambleId).toBe(fixtureScrambleId);
  expect(recovery.scramble.notation).toBe(fixtureNotation);
  expect(recovery.solve.rawTimeMs).toBeGreaterThanOrEqual(100);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download recovery file' }).click();
  const download = await downloadPromise;
  await download.saveAs(testInfo.outputPath('unsaved-solve.json'));
  const downloaded = JSON.parse(await readFile(testInfo.outputPath('unsaved-solve.json'), 'utf8')) as typeof recovery;
  expect(downloaded.solve.id).toBe(recovery.solve.id);
  await page.getByRole('button', { name: 'Retry save' }).click();
  await expect(page.getByRole('heading', { name: 'Saved', exact: true })).toBeVisible();
  expect(solvePosts).toHaveLength(2);
  expect(solvePosts[0]?.id).toBe(recovery.solve.id);
  expect(solvePosts[1]?.id).toBe(recovery.solve.id);
  expect(solvePosts[1]?.session_id).toBe(fixtureSessionId);
  expect(solvePosts[1]?.scramble_id).toBe(fixtureScrambleId);
  expect(solvePosts[1]?.owner_id).toBe(fixtureUserId);
  expect(Number.isSafeInteger(solvePosts[1]?.raw_time_ms)).toBe(true);
  expect(Date.parse(String(solvePosts[1]?.started_at))).toBeLessThanOrEqual(Date.parse(String(solvePosts[1]?.completed_at)));
  expect(scramblePosts).toHaveLength(2);
  expect(scramblePosts.every((scramble) => scramble.id === fixtureScrambleId && scramble.owner_id === fixtureUserId && scramble.notation === fixtureNotation)).toBe(true);
});

test('Auth forms validate input, show a pending state, and keep server errors generic', async ({ page }) => {
  let releaseSignIn: (() => void) | undefined;
  let signInRequests = 0;
  await page.route(/\/auth\/v1\/token\?grant_type=password/u, async (route) => {
    signInRequests += 1;
    await new Promise<void>((resolve) => { releaseSignIn = resolve; });
    await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid login credentials' }) });
  });
  await page.route(/\/auth\/v1\/signup/u, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: fixtureUserId, email: 'new@example.test' }, session: null }) }));
  await page.route(/\/auth\/v1\/recover/u, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.goto('/auth/sign-in');
  await page.getByRole('button', { name: 'Sign in' }).click();
  expect(signInRequests).toBe(0);
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  expect(signInRequests).toBe(0);
  await page.getByLabel('Email').fill('browser-user@example.test');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('button', { name: /Please wait/u })).toBeDisabled();
  expect(signInRequests).toBe(1);
  releaseSignIn?.();
  await expect(page.getByRole('status')).toContainText('Check the email and password');
  await page.getByRole('link', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  await page.getByLabel('Email').fill('new@example.test');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('status')).toContainText('Check your email to confirm your account');
  await page.getByRole('link', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await expect(page.getByRole('heading', { name: 'Reset password' })).toBeVisible();
  await page.getByLabel('Email').fill('browser-user@example.test');
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByRole('status')).toContainText('If that account exists');
});

test('implemented routes navigate, refresh, restore Auth, and preserve history', async ({ page }) => {
  test.setTimeout(60_000);
  await signInFromProtectedRoute(page, 1440);
  const routes = [
    ['/timer', 'Timer'], ['/solves', 'Solves'], ['/statistics', 'Statistics'],
    ['/analyze', 'Analyze'], ['/challenges', 'Challenges'], ['/settings', 'Settings'],
  ] as const;
  for (const [path, heading] of routes) {
    await page.getByRole('link', { name: heading, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`, 'u'));
    await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
    await expect(page.locator(`.app-sidebar .app-navigation__link[href="${path}"]`)).toHaveAttribute('aria-current', 'page');
    await page.reload();
    await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
    await expect(page.locator('.app-sidebar')).toContainText('Browser Test User');
  }
  await page.goBack();
  await expect(page).toHaveURL(/\/challenges$/u);
  await page.goForward();
  await expect(page).toHaveURL(/\/settings$/u);
  await page.goto('/precommit-unknown');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await page.getByRole('link', { name: 'Go to Timer' }).click();
  await expect(page).toHaveURL(/\/timer$/u);
});

test('timer cancels early holds, repeat and blur; pointer control starts and stops once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/timer');
  const timer = page.getByRole('timer');
  const digits = page.locator('.timer-page__digits');
  await page.getByRole('combobox', { name: 'Puzzle type' }).evaluate((select) => {
    select.focus();
    select.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', bubbles: true }));
  });
  await expect(digits).not.toHaveClass(/timer-page__digits--holding/u);
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  await page.locator('#main-content').focus();
  await page.evaluate(() => window.scrollTo(0, 300));
  const scrollBeforeHold = await page.evaluate(() => window.scrollY);
  await page.keyboard.down('Space');
  await expect(digits).toHaveClass(/timer-page__digits--holding/u);
  await page.keyboard.up('Space');
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBeforeHold);
  await expect(timer).toHaveAttribute('aria-label', '00.00');
  await expect(page.getByRole('heading', { name: 'Solve not saved' })).toHaveCount(0);
  await page.evaluate(() => document.body.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', bubbles: true, repeat: true })));
  await expect(digits).not.toHaveClass(/timer-page__digits--holding/u);
  await page.keyboard.down('Space');
  await expect(digits).toHaveClass(/timer-page__digits--holding/u);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(digits).not.toHaveClass(/timer-page__digits--holding/u);
  await page.keyboard.up('Space');
  await expect(timer).toHaveAttribute('aria-label', '00.00');
  const control = page.getByRole('button', { name: 'Timer control' });
  await control.focus();
  await expect(control).toBeFocused();
  const box = await control.boundingBox();
  if (!box) throw new Error('Timer control has no browser bounds.');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(digits).toHaveClass(/timer-page__digits--armed/u);
  await page.mouse.up();
  await expect(control).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(180);
  await page.mouse.down();
  await page.mouse.up();
  await expect(page.getByRole('heading', { name: 'Solve not saved' })).toBeVisible();
  const recovery = JSON.parse(await page.getByRole('textbox', { name: 'Volatile recovery data' }).inputValue()) as { solve: { id: string } };
  await page.mouse.down();
  await page.mouse.up();
  await expect(page.getByRole('heading', { name: 'Solve not saved' })).toBeVisible();
  expect(JSON.parse(await page.getByRole('textbox', { name: 'Volatile recovery data' }).inputValue()).solve.id).toBe(recovery.solve.id);
});

test('mouse release outside the timer cannot leave an armed hold stuck', async ({ page }) => {
  await page.goto('/timer');
  const control = page.getByRole('button', { name: 'Timer control' });
  const box = await control.boundingBox();
  if (!box) throw new Error('Timer control has no browser bounds.');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(page.locator('.timer-page__digits')).toHaveClass(/timer-page__digits--armed/u);
  await page.mouse.move(0, 0);
  await page.mouse.up();
  await expect(page.locator('.timer-page__digits')).not.toHaveClass(/timer-page__digits--armed/u);
  await expect(control).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.down('Space');
  await page.keyboard.up('Space');
  await expect(page.getByRole('heading', { name: 'Solve not saved' })).toBeVisible();
});

test('an active run survives in-app route navigation without creating a second solve', async ({ page }) => {
  await signInFromProtectedRoute(page, 1440);
  await page.getByRole('link', { name: 'Timer', exact: true }).click();
  await expect(page.locator('.timer-page__scramble-empty')).toBeVisible();
  await page.locator('#main-content').focus();
  await page.keyboard.down('Space');
  await expect(page.locator('.timer-page__digits')).toHaveClass(/timer-page__digits--armed/u);
  await page.keyboard.up('Space');
  await expect(page.getByRole('button', { name: 'Timer control' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Timer', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Timer control' })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#main-content').focus();
  await page.keyboard.down('Space');
  await page.keyboard.up('Space');
  await expect(page.getByRole('heading', { name: 'Solve not saved' })).toBeVisible();
  const recovery = JSON.parse(await page.getByRole('textbox', { name: 'Volatile recovery data' }).inputValue()) as { solve: { id: string } };
  await page.keyboard.press('Space');
  await expect(page.getByRole('heading', { name: 'Solve not saved' })).toBeVisible();
  expect(JSON.parse(await page.getByRole('textbox', { name: 'Volatile recovery data' }).inputValue()).solve.id).toBe(recovery.solve.id);
});

test('long-running timer keeps all integer digits visible and centered', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.addInitScript(() => {
    const originalNow = performance.now.bind(performance);
    let offset = 0;
    Object.defineProperty(window.performance, 'now', { value: () => originalNow() + offset });
    (window as Window & { advanceTimerOffset?: (milliseconds: number) => void }).advanceTimerOffset = (milliseconds) => { offset += milliseconds; };
  });
  await page.goto('/timer');
  await page.locator('#main-content').focus();
  await page.keyboard.down('Space');
  await expect(page.locator('.timer-page__digits')).toHaveClass(/timer-page__digits--armed/u);
  await page.keyboard.up('Space');
  await page.evaluate(() => (window as Window & { advanceTimerOffset?: (milliseconds: number) => void }).advanceTimerOffset?.(100_000_000));
  await expect(page.getByRole('timer')).toHaveAttribute('aria-label', /^100000\./u);
  const layout = await page.evaluate(() => {
    const card = document.querySelector('.timer-page__readout')!.getBoundingClientRect();
    const svg = document.querySelector('.timer-page__seven-segment')!.getBoundingClientRect();
    const wrapper = document.querySelector('.timer-page__digits')!.getBoundingClientRect();
    return { offset: Math.abs((card.left + card.right - svg.left - svg.right) / 2), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, digits: document.querySelectorAll('.timer-page__digit').length, card: { left: card.left, right: card.right, width: card.width }, svg: { left: svg.left, right: svg.right, width: svg.width }, wrapper: { left: wrapper.left, right: wrapper.right, width: wrapper.width }, children: [...document.querySelectorAll('.timer-page__seven-segment > svg')].map((child) => ({ width: child.getBoundingClientRect().width, flex: getComputedStyle(child).flex })) };
  });
  expect(layout.digits).toBe(8);
  expect(layout.offset, JSON.stringify(layout)).toBeLessThanOrEqual(1);
  expect(layout.overflow).toBe(false);
  await page.screenshot({ path: testInfo.outputPath('long-timer-320.png') });
});

test('key routes fit six viewports in both supported themes', async ({ page }) => {
  test.setTimeout(180_000);
  await signInFromProtectedRoute(page, 1440);
  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['/timer', '/settings', '/solves', '/statistics', '/analyze', '/challenges']) {
        await page.goto(path);
        await expect(page.locator('#main-content')).toBeVisible();
        const size = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
        expect(size.scrollWidth, `${theme} ${width}px ${path}`).toBeLessThanOrEqual(size.width);
        if (path === '/timer') {
          const alignment = await page.evaluate(() => {
            const card = document.querySelector('.timer-page__readout')!.getBoundingClientRect();
            const svg = document.querySelector('.timer-page__seven-segment')!.getBoundingClientRect();
            return { offset: Math.abs((card.left + card.right - svg.left - svg.right) / 2), svgRight: svg.right, viewport: document.documentElement.clientWidth };
          });
          expect(alignment.offset, `${theme} ${width}px timer centering`).toBeLessThanOrEqual(1);
          expect(alignment.svgRight).toBeLessThanOrEqual(alignment.viewport + 1);
        }
      }
    }
  }
});

test('Auth forms fit mobile through wide desktop in light and dark themes', async ({ page }) => {
  test.setTimeout(90_000);
  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/auth/sign-in');
      await expect(page.getByRole('heading', { name: 'Sign in to RubiVision' })).toBeVisible();
      const layout = await page.evaluate(() => {
        const card = document.querySelector('.auth-card')!.getBoundingClientRect();
        const button = document.querySelector('.auth-card button')!.getBoundingClientRect();
        return { documentWidth: document.documentElement.scrollWidth, cardLeft: card.left, cardRight: card.right, buttonWidth: button.width, buttonHeight: button.height };
      });
      expect(layout.documentWidth, `${theme} ${width}px auth form`).toBeLessThanOrEqual(width);
      expect(layout.cardLeft).toBeGreaterThanOrEqual(0);
      expect(layout.cardRight).toBeLessThanOrEqual(width);
      expect(layout.buttonWidth).toBeGreaterThanOrEqual(44);
      expect(layout.buttonHeight).toBeGreaterThanOrEqual(44);
    }
  }
});
