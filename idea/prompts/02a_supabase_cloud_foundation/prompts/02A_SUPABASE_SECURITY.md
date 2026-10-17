# Mandatory instructions for every coding agent

You are implementing RubiVision AI in an EXISTING repository. Read `AGENTS.md`, `docs/ARCHITECTURE_DECISIONS.md`, `docs/DOMAIN_CONTRACTS.md`, `docs/PHASE_GATES.md` and the original sources before changing code. Audit the real repository, scripts, dependency versions, tests, and existing behavior; never invent files, APIs, results, datasets, or credentials. Present a concise plan and exact acceptance criteria, then implement one complete vertical slice. Preserve unrelated working features. Keep domain logic independent from React, Supabase, media, and ML adapters. Use strict TypeScript, runtime validation at untrusted boundaries, accessible UI, and deterministic tests. Do not declare completion until checks actually execute. Report changed files, commands, results, manual verification, limitations, and next dependencies.

**Overriding architecture:** the newer 02A document supersedes legacy IndexedDB/offline-first/cloud-optional guidance. Supabase is the only persistent application database. Never create IndexedDB/localStorage-backed application records, an offline mutation queue, or a conflict-sync engine. Auth SDK session storage may use its standard browser mechanism; this is NOT an application data store. Solves that fail to save remain in volatile memory only, with explicit manual retry and download/copy. Camera footage may be held locally for the current user workflow, and optionally downloaded as a user-selected file; do not silently upload or persist media. Never equate client connectivity signals with confirmed server persistence.

**Truthful AI scope:** motion/pause/uncertain classification is not cube-turn recognition, TPS, cube-state tracking, or CFOP recognition. Only demonstrate these advanced abilities when an independently tested evidence-based pipeline actually supports them.

**Required agent output:** (1) repository findings; (2) plan; (3) implemented changes; (4) test evidence with exact commands; (5) unmet criteria/blockers; (6) docs and contract updates; (7) next safe phase. Stop and ask for credentials or external setup when required; never fake infrastructure.

# Coding agent task: Supabase auth, RLS and operations

## Mission
Set up separate development/production Supabase configuration, local CLI config and SQL migrations. Implement signup/signin/signout/password reset/session restore, generated database types, and typed repositories. Enforce RLS on EVERY user-owned table for SELECT/INSERT/UPDATE/DELETE, database-level same-owner foreign keys, private Storage policies, and server-controlled ownership on imports. Browser receives public key only. Provide save statuses, in-memory unsaved solve recovery, manual retry and export, idempotent UUID retries for transient failures, 401/403/429 handling, pagination, and cross-device persistence. No IndexedDB or offline sync engine.

## Implementation method
1. Inspect actual repository and upstream phase outputs. Identify real dependencies and name exact files to modify; suggested names are not mandates.
2. State existing behavior and acceptance checklist before coding. Record any conflict with 02A supremacy and update dependent contracts/docs in the same change.
3. Implement smallest complete vertical slice with strict types, runtime validation, errors and accessibility. Preserve all existing data and working modules. Do not add mock production behavior to hide missing dependencies.
4. Add meaningful deterministic unit tests, integration tests and Playwright tests as appropriate. Test unhappy paths, cancellations, permissions and resource cleanup.
5. Run the repository's real lint, typecheck, unit, integration and production build commands. Capture outputs and distinguish skipped/unavailable from passed.
6. Update docs/verification-log.md with commit, environment, exact command, outcome, and unresolved risks. Provide human manual test instructions.

## Detailed acceptance and adversarial tests
Run real direct REST RLS tests with two distinct users and anonymous requests; owner vs stranger CRUD, FK injection, storage denial, retry deduplication, save failure, session expiration, multi-device reload, and production migration checks.

## Additional engineering requirements
- Follow AGENTS.md and docs/ARCHITECTURE_DECISIONS.md. Do not create a persistent local application database or offline queue.
- Database writes must confirm Supabase success before showing Saved; a timer may work without network but unsaved records are volatile.
- Use ownership-consistent foreign keys and RLS, never UI-only authorization. Keep service-role keys out of the browser.
- Keep all times and units explicit; UTC persisted timestamps and monotonic timer clock; IDs are stable UUIDs.
- Media and ML must not block timer; do not upload video without explicit user action.
- Never fabricate WCA certification, cube state, exact turns, CFOP phases, TPS, model accuracy or executed tests.

## Deliverables
Working code and tests, updated contracts/migrations as needed, manual verification guide, exact command outputs, concise changed-file inventory, blockers and next-phase integration notes. If a dependency is unavailable, implement a tested interface only when safe and stop with an explicit blocker.
