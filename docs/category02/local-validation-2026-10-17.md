# Category 02 local validation checkpoint — 2026-10-17

Historical checkpoint. Category 02 was validated on 2026-10-18; see [the current record](local-validation-2026-10-18.md).

Branch: `category-02-database`. No hosted Supabase project was linked, reset, or changed. No branch was pushed or merged.

## Completed setup

- Installed official Docker Desktop 4.95.0 with `winget`; its CLI is Docker 29.8.2. The installed CLI directory is on the machine `PATH`, but the current terminal predates that installation and needs a new session.
- Installed WSL 3.0.3.0 and kernel 6.18.54.1-1. With user approval, ran elevated `wsl --install --no-distribution` to enable WSL 2 prerequisites. Windows may need a restart to finish feature changes.
- Pinned Supabase CLI 2.121.0 as a root development dependency. `npm.cmd ci` and `npx.cmd --no-install supabase --version` succeeded.

## Results

| Check | Result |
| --- | --- |
| `node scripts/check-db-static.mjs` | Passed: 12 locked tables, 2 migrations, test plans match. This is a text preflight, not SQL execution. |
| Web TypeScript typecheck | Passed. |
| Web ESLint | Passed. |
| Web unit tests | Passed: 79 tests in 15 files. |
| Web production build | Passed. |
| Web Playwright E2E | Passed: 121 tests. |
| Docker CLI | Installed: 29.8.2. |
| `docker info` | Failed: Docker API pipe `//./pipe/docker_engine` does not exist; engine unavailable. |
| `supabase start` | Failed: after adding Docker's installed CLI directory to the process `PATH`, Docker API pipe is unavailable. |
| Migration reset, pgTAP database tests | Not run: local Supabase stack cannot start. |
| Type generation and reproducibility | Not completed: `npm.cmd run db:types:check` failed because the local database is unavailable; generated types remain absent. |

## Restart checkpoint

Windows reports that WSL 2 cannot start because virtualization is disabled. Firmware virtualization was also reported disabled by `Win32_Processor.VirtualizationFirmwareEnabled`; the CPU supports SLAT. Enable Intel VT-x or AMD-V in BIOS/UEFI and restart Windows. After restart, verify `wsl --status` and confirm Virtual Machine Platform is enabled if WSL still reports it missing. Start Docker Desktop, complete its first-run setup, then verify `docker info` and `docker ps` reach the server. Use a new terminal so Docker is on `PATH`.

Once the local engine works, run the disposable local sequence from the repository root: `npm.cmd ci`, `npx.cmd supabase start`, `npx.cmd supabase db reset --local`, `npx.cmd supabase test db`, `npm.cmd run db:types`, `npm.cmd run db:types:check`, and `npx.cmd supabase stop`. Review SQL failures and generated type diff, fix any failures, rerun the checks, then commit the generated types. Do not use `--linked`, a remote database URL, or a remote reset.

Category 02 remains incomplete and is not ready for staging promotion until migrations, database security tests, and type reproducibility pass against a disposable local PostgreSQL instance.
