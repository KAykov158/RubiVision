# 12 — Supabase-only Architecture and Source Layout

## Architecture
React + TypeScript + Vite → feature services / typed repositories → Supabase JS client → Supabase Auth + PostgreSQL (RLS). Optional Supabase Storage for explicitly uploaded video. Python training/evaluation remains independent; trained browser-compatible inference assets are versioned and loaded by the web app.

## Suggested repository
```text
RubiVision/
  apps/web/src/
    app/                    # routes, providers, navigation
    features/
      auth/ timer/ scrambles/ sessions/ statistics/
      camera/ annotation/ analysis/ settings/
    shared/
      components/ domain/ repositories/ supabase/
  supabase/
    migrations/             # versioned PostgreSQL SQL
    seed.sql                # non-sensitive dev fixtures
    config.toml
  ml/
    data_prep/ features/ baselines/ training/ evaluation/
  tests/
    unit/ integration/ e2e/ security/
  docs/
  .env.example
```

## Boundaries
- `supabase/client.ts` constructs browser client with public configuration.
- `repositories/*` own persistence calls and convert Supabase rows into domain models.
- React UI and timer logic never issue direct database calls.
- All persistent data lives in Supabase PostgreSQL; no IndexedDB database.
- Camera recordings may exist as temporary user-selected local files, but not as a persistent application database; optional user-consented uploads use Supabase Storage.
- Python training datasets may be maintained in research files; this is not a second application database.

## Operational concerns
Network errors, server save acknowledgment, RLS, idempotent retries, migrations, generated TypeScript types, export/import, privacy and cross-device verification.
