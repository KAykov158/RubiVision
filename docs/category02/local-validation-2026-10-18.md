# Category 02 local validation — 2026-10-18

Repository: this checkout; branch: `category-02-database`. The three earlier local commits (`5137f46`, `f69545f`, `863664f`) were present. No hosted Supabase project was linked, accessed, reset, or changed. Nothing was pushed, merged, or deployed.

## Local environment

| Component | Verified state |
| --- | --- |
| Windows | Windows 11 Pro 25H2, build 26200.9711, 64-bit. |
| CPU and virtualization | AMD Ryzen 3 1200; firmware virtualization enabled. |
| WSL | 3.0.3.0, kernel 6.18.54.1-1, default version 2; `docker-desktop` distribution running as WSL 2. Windows Subsystem for Linux and Virtual Machine Platform optional features both report installed. A separate Linux distribution was not needed. |
| Docker | Desktop 4.95.0, Linux engine 29.8.2; `docker info` and `docker ps` reached the server. |
| Node and npm | Node 24.19.0; npm 11.17.0. |
| Supabase CLI | Project-local 2.121.0, installed from the pinned root lockfile. |

Docker Desktop was already installed. Starting it brought up a working Linux engine; no WSL reinstall, Windows feature change, firmware change, or restart was needed on this PC. The first local Supabase startup pulled its images. A temporary mail image registry 429 was retried successfully. Optional analytics Vector repeatedly restarted because it could not connect to Docker Desktop's internal TCP endpoint at `192.168.65.254:2375`; setting `[analytics] enabled = false` removed that optional local collector. After restart, the enabled database, API, Auth, Storage, Studio, and related containers were running; containers with health checks reported healthy.

## Database validation

| Check | Result |
| --- | --- |
| `supabase start` | Passed against the disposable local Docker stack. Both Category 02 migrations applied at first startup. |
| `supabase db reset --local` | Passed twice, including after the final analytics configuration change. Both migrations replayed from a clean database. |
| Live catalog | All 12 expected `public` tables exist and all 12 have RLS enabled (`12|12`). |
| `supabase test db` | Passed twice: 2 files, 59 pgTAP assertions. |
| Access denial | pgTAP confirms no Category 02 policies, no `SELECT`/`INSERT`/`UPDATE`/`DELETE` grants for `anon` or `authenticated` on owned tables, no client usage on the private trigger schema, and actual read/write attempts fail under each client role. |
| Integrity | pgTAP covers valid and invalid records, owner and puzzle consistent references, protected scramble and solve evidence, session deletion, and annotation intervals. |
| Static SQL preflight | Passed: 12 locked tables, 2 migrations, test plans match. PostgreSQL tests above are the authoritative result. |

The migrations create profiles, user settings, sessions, scrambles, solves, recordings, annotations, analysis runs and segments, model versions, dataset metadata, and experiment runs. UUID keys, checked values, composite foreign keys, uniqueness rules, and indexes are defined by the committed SQL. No Category 02A access policies or Auth flows were added.

## Type generation and application regression

Generated `apps/web/src/shared/database/database.types.ts` from the migrated local database. The generation script strips whitespace from otherwise blank output lines so Git's whitespace check passes. A second generation produced the same SHA-256 hash, `D1F1406BAAB661C4A60ECD55CAF2E7D75815C1ED6BEC91C08C1277F33A883BB7`. `npm.cmd run db:types:check` passed before and after the final clean reset. The generated file stays separate from application domain contracts.

| Check | Result |
| --- | --- |
| TypeScript typecheck | Passed. |
| ESLint | Passed. |
| Unit tests | 79 passed in 15 files. |
| Production build | Passed. |
| Playwright browser tests | 121 passed; runner exited 0. The spawned Vite server remained open after the last case and delayed teardown; stopping that test-only server let Playwright print its success summary and exit. |
| Git diff checks | Passed before commit. |

No manual actions remain for local Category 02 validation. The local Supabase stack was left running for development. Category 02 is ready for **staging review**, subject to ordinary code review; staging promotion itself was not performed. Category 02A cloud access policies, Auth flows, and remote verification remain separate future work.
