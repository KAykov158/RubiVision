# Prompt 2 — Bootstrap and Tooling Report

**Date:** 2026-10-16 (Europe/Sofia)  
**Scope:** `idea/prompts/01_foundation_ui/PROMPTS/02_02_BOOTSTRAP_TOOLING.md` only.

## Repository and toolchain

The workspace had no application source, package manifest, lockfile, or tests. The prompt files are retained under `idea/`; the app was created at `apps/web` to follow the master repository blueprint.

I checked PATH and common Windows installation locations, then searched recursively under the user Local/Roaming AppData, Program Files, and ProgramData roots. Neither `git.exe` nor `node.exe` was present. `winget` was available. With approval, I installed Node.js LTS in user scope. It installed Node **24.20.0** and npm **11.19.0**. The installer updated the user PATH, but the current shell retained its old PATH; verification commands explicitly prepended the installed Node directory. Open a new terminal to pick up the updated PATH normally.

With no existing lockfile to select a package manager, this scaffold uses npm and commits `apps/web/package-lock.json` for repeatable installs. Resolved versions in the lockfile include:

| Package | Version |
|---|---:|
| React / React DOM | 19.3.1 |
| React Router | 8.4.0 |
| Vite | 8.3.4 |
| `@vitejs/plugin-react` | 6.1.2 |
| TypeScript | 6.0.3 |
| Vitest | 5.0.5 |
| ESLint / `@eslint/js` | 10.12.0 / 10.0.1 |

The initial ESLint 9 dependency emitted an upstream unsupported-version warning during install. I moved the manifest and lockfile to ESLint 10 and reran a clean install without that warning. No Tailwind dependency was added.

## Implemented in Prompt 2

- Initialized the Vite React/TypeScript app under `apps/web` with strict TypeScript checks and scripts for `dev`, `build`, `preview`, `typecheck`, `lint`, `test`, and `test:watch`.
- Added the root render, `BrowserRouter` provider composition, and app-level error boundary with a user-facing recovery message.
- Added a minimal entry screen and base stylesheet; no feature pages or later-category behavior.
- Configured Vitest, jsdom, Testing Library, ESLint flat config, and two component tests plus one provider integration test.
- Added a root `.gitignore`, fresh-start README, and `.env.example` with only commented public Supabase placeholders. There is no Supabase client, database schema, IndexedDB, or other persistent application database in this prompt.

## Verification

All commands ran from `apps/web`, except the local HTTP request. npm commands used Node 24.20.0/npm 11.19.0.

| Command | Result |
|---|---|
| `npm install --no-audit --no-fund` | PASS, exit 0; generated npm lockfile and installed declared dependencies |
| `npm ci --no-audit --no-fund` | PASS, exit 0; clean install added 243 packages |
| `npm run typecheck` | PASS, exit 0 on final run. The first run failed for missing Vite client types; `vite/client` was added to the app tsconfig and the rerun passed. |
| `npm run lint` | PASS, exit 0 |
| `npm test` | PASS, exit 0; 3 test files, 3 tests passed |
| `npm run build` | PASS, exit 0; Vite 8.3.4 production build completed. JS 256.82 kB (81.60 kB gzip); CSS 0.38 kB (0.29 kB gzip). |
| `npm run dev -- --host 127.0.0.1` | PASS; Vite ready in 422 ms at `http://127.0.0.1:5173/`; server stopped after smoke check |
| `Invoke-WebRequest http://127.0.0.1:5173/` | PASS, HTTP 200; response contained the app root and `RubiVision AI` title |

The first TypeScript check failed with two setup errors (`ImportMeta.env` and the CSS side-effect import); both were fixed by including Vite client declarations. The final check table records the passing rerun. No browser automation runner was installed, so visual browser checks were not performed. `git status` and branch/commit checks remain unavailable because Git is not installed; no Git metadata was visible in the workspace root.

## Prompt boundary and next step

The scaffold contains only app startup and developer tooling. It does not implement design tokens, routes/pages, theme settings, timer logic, Supabase integration, or any other later prompt. **Next: Prompt 3, `03_03_ARCHITECTURE_AND_CONTRACTS.md`.**
