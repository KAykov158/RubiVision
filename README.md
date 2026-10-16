# RubiVision AI

RubiVision AI is a React, TypeScript, and Vite application. The current source is the initial app foundation; feature pages and services are added in later prompts.

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
npm run build
```

`npm run preview` serves the production build locally. The app does not connect to Supabase yet; configuration placeholders are documented in `apps/web/.env.example` for the later cloud integration work.
