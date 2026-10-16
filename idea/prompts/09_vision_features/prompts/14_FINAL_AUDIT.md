# RubiVision AI — Final audit, handoff and graduation evidence

## Role and operating procedure
You are an autonomous senior TypeScript/computer-vision engineering agent working in the EXISTING RubiVision AI repository. Inspect source tree, package.json, lockfile, installed dependencies, tests, README, and existing services before editing. Read `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, `00_INTEGRATION_CHECKLIST.md`, and `09_Computer_Vision_Feature_Extraction.md`. This pack is a task plan, not evidence that functionality exists. Summarize discovered reality and contradictions before coding. Work in small vertical slices, never replace unrelated code, never fabricate test results. If dependencies are missing, create a narrow tested adapter or report a blocker. Do not ask for approval on routine implementation choices; record the choice and reason.

## Architecture precedence (critical)
The 2026-10-16 Supabase-only addendum supersedes older IndexedDB/local-database/offline-outbox statements. Supabase PostgreSQL is the ONLY durable application database. Browser processing of user-selected media remains local; transient in-memory blobs/object URLs are allowed but not durable offline databases. Network failure must not be represented as successful persistence. User must be clearly informed that unsaved cloud data may be lost if the tab closes. Do not silently upload video or frames. Read any newer repository-side master sections 11–15 and category 02A if available; report missing references rather than inventing their content. Authentication/owner-scoped RLS and migrations belong to existing repositories/services, not direct writes from vision components.

## Non-negotiable scientific boundary
MOVEMENT, PAUSE and UNCERTAIN describe visible solve-related motion, not exact cube moves, state, TPS, or CFOP phase. Missing hands are missing evidence, never proof of pause. Store original recording and raw features independently from model-derived output. Any numbers described as benchmarks must come from actual measurements.

## Task
Conduct an adversarial end-to-end audit and produce complete handoff documentation.

## Detailed implementation steps
1. Re-read original spec and every prompt, build requirements-to-tests traceability matrix, verify recorded sample import -> windows -> classifier interface -> timeline integration, privacy and network-failure semantics
2. Distinguish CV extraction completion from trained model completion
3. Include architecture diagram, feature manifest reference, equations, API usage, measured performance, dataset parity, known limitations, exact run commands, reproducible demo, screenshots checklist, and report suitable for graduation defense
4. Generate docs/vision-completion-report.md with each criterion PASS/FAIL/NOT RUN and evidence path/command.

## Required tests and adversarial cases
Verify incomplete tests are not passed, no fake accuracy/TPS/CFOP, no raw video upload, no IndexedDB persistence, no orphan data, all resources released.

## Acceptance criteria / definition of done
Completion only if all mandatory tests and integration gates have recorded evidence; otherwise give blocker list and next fix.

## Deliverables and mandatory agent response
1. Repository audit and brief implementation plan, including dependencies and risks.
2. Focused production code with typed, versioned contracts and explicit error handling.
3. Automated tests with deterministic fixtures and manual reproduction steps.
4. Run actual available typecheck, lint, unit tests, integration tests, and production build; report commands, pass/fail/skip and environment.
5. Enumerate files changed, schema or dependency changes, performance observations, remaining blockers, and next prompt to execute. Never say completed if a criterion is unverified.
