# Prompt 7 browser verification

**Run date:** 2026-10-16  
**Browser:** Playwright-managed Chromium 156.0.8078.4  
**Runner:** `@playwright/test` 1.64.1  
**Command:** `npm run test:e2e` from `apps/web`

## Results

All 13 browser tests passed. The suite checked light and dark system color schemes at 320, 375, 768, 1024, and 1440 CSS pixels; document/body scroll widths; Timer display clipping; overlap among Timer page blocks; visible control bounds and 44px touch targets; menu/sidebar breakpoint behavior; browser console and page errors; system theme changes and explicit theme overrides; keyboard operation of the puzzle selector and skip link; native mobile dialog focus wrap, Escape dismissal and focus restoration; and focus after route navigation.

At 320px and 375px, the mobile menu is visible and the persistent sidebar is hidden. At 768px and wider, the menu is hidden and the sidebar is visible. No horizontal page overflow, timer digit clipping, Timer block overlap, or browser console/page errors were detected at the tested sizes.

The first browser run found that the mobile menu button remained visible at tablet and desktop widths, initial route focus skipped the skip link, and Tab could move focus out of the native mobile dialog. Prompt 7 verification fixed the responsive display rule, limited route focus movement to path changes, and added a focus boundary handler to the shared modal dialog. The final run passed all related checks.

Node emitted a non-failing environment warning that `NO_COLOR` is ignored while `FORCE_COLOR` is set. It did not correspond to a browser console error or test failure.

## Screenshots

Screenshots are test artifacts under the ignored `apps/web/test-results/` directory. The ten viewport/theme captures use these filenames:

| Width | Light | Dark |
|---:|---|---|
| 320px | `timer-light-320.png` | `timer-dark-320.png` |
| 375px | `timer-light-375.png` | `timer-dark-375.png` |
| 768px | `timer-light-768.png` | `timer-dark-768.png` |
| 1024px | `timer-light-1024.png` | `timer-dark-1024.png` |
| 1440px | `timer-light-1440.png` | `timer-dark-1440.png` |

The mobile drawer capture is `timer-mobile-navigation-open.png` at 375px.

## Git and ignored artifacts

Portable Git for Windows 2.55.0.windows.5 was extracted to the current user's Programs directory after the WinGet installer stalled at its administrator elevation prompt. The portable archive was downloaded from the [official Git for Windows release](https://github.com/git-for-windows/git/releases/tag/v2.55.0.windows.5) and its SHA-256 was verified as `5aa8a20f6e9abb2c755f0e73c91c687701a46b309ad84a0ca6509380fa4ae290`, matching the [Scoop release manifest](https://github.com/ScoopInstaller/Versions/blob/master/bucket/git-without-openssh.json).

Git reported version 2.55.0.windows.5. Since the project had no `.git` directory, a repository was initialized as authorized. No files were staged, no commit was created, and no remote was configured. The working tree lists the existing project roots as untracked because this is an empty repository.

`git check-ignore` verified dependency, build, coverage, Playwright report, test-results, temporary browser profile, and secret-file patterns. `apps/web/.env.example` remains unignored by the explicit exception.
