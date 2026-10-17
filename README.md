# RubiVision AI

RubiVision AI is a React, TypeScript, and Vite application. Phase 1 provides a responsive UI shell for Timer, Solves, Statistics, Analyze, Challenges, and Settings, with typed feature-service boundaries and an accessible theme system. Most feature operations and all Supabase integrations remain unconfigured; the shell does not fabricate solve, statistics, challenge, or analysis data.

The current architecture designates Supabase PostgreSQL as the sole persistent application database. This foundation has no configured database adapter and does not persist application data in browser storage. See [the architecture and contracts](docs/phase1/architecture-and-contracts.md) and [the Prompt 12 audit](docs/phase1/prompt12-final-audit.md) for scope and verification evidence.

## Requirements

- Node.js 24 LTS (npm is included)
- Windows, macOS, or Linux

## Start the web app

```powershell
cd apps/web
npm ci
npm run dev
```

Vite prints the local development URL after the server starts.

## Checks

Run these commands from `apps/web`:

```powershell
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

`npm run preview` serves the production build locally. The Playwright suite tests the app's development server; production hosting and SPA fallback rewrites have not been verified. Direct route entry is covered in Chromium against Vite's development server.

The app does not connect to Supabase yet. `apps/web/.env.example` contains placeholders only for later cloud integration; do not add service-role keys or other private credentials to client configuration.
