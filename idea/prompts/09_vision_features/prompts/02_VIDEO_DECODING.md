# RubiVision AI — Video decoding and timestamp sampling

## Role and operating procedure
You are an autonomous senior TypeScript/computer-vision engineering agent working in the EXISTING RubiVision AI repository. Inspect source tree, package.json, lockfile, installed dependencies, tests, README, and existing services before editing. Read `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, `00_INTEGRATION_CHECKLIST.md`, and `09_Computer_Vision_Feature_Extraction.md`. This pack is a task plan, not evidence that functionality exists. Summarize discovered reality and contradictions before coding. Work in small vertical slices, never replace unrelated code, never fabricate test results. If dependencies are missing, create a narrow tested adapter or report a blocker. Do not ask for approval on routine implementation choices; record the choice and reason.

## Architecture precedence (critical)
The 2026-10-16 Supabase-only addendum supersedes older IndexedDB/local-database/offline-outbox statements. Supabase PostgreSQL is the ONLY durable application database. Browser processing of user-selected media remains local; transient in-memory blobs/object URLs are allowed but not durable offline databases. Network failure must not be represented as successful persistence. User must be clearly informed that unsaved cloud data may be lost if the tab closes. Do not silently upload video or frames. Read any newer repository-side master sections 11–15 and category 02A if available; report missing references rather than inventing their content. Authentication/owner-scoped RLS and migrations belong to existing repositories/services, not direct writes from vision components.

## Non-negotiable scientific boundary
MOVEMENT, PAUSE and UNCERTAIN describe visible solve-related motion, not exact cube moves, state, TPS, or CFOP phase. Missing hands are missing evidence, never proof of pause. Store original recording and raw features independently from model-derived output. Any numbers described as benchmarks must come from actual measurements.

## Task
Implement robust local video loading, metadata inspection and deterministic timestamp-driven sampling.

## Detailed implementation steps
1. Inspect support for HTMLVideoElement seeking, requestVideoFrameCallback, WebCodecs and fallback APIs
2. Choose an adapter and explain browser limitations
3. Validate MIME by actual decode, duration, dimensions and origin; handle variable FPS and non-seekable streams
4. Default target 10–15 FPS configurable
5. Sample at explicit media timestamps, not wall-clock, with epsilon deduplication and drift tolerance
6. Ensure frame resources released
7. Make short/zero-length/corrupt media errors explicit
8. Track requested vs actual frame timestamps and dropped samples
9. Ensure cancellation stops work and removes listeners
10. Avoid unnecessary full-video buffering.

## Required tests and adversarial cases
VFR, 1 FPS, 120 FPS, repeated frame timestamps, seek inaccuracies, zero duration, audio-only, codec mismatch, rotation metadata, tab backgrounding, cancel mid-seek.

## Acceptance criteria / definition of done
Sample timestamps are bounded, sorted, reproducible within documented decoder tolerance; no leaked object URLs.

## Deliverables and mandatory agent response
1. Repository audit and brief implementation plan, including dependencies and risks.
2. Focused production code with typed, versioned contracts and explicit error handling.
3. Automated tests with deterministic fixtures and manual reproduction steps.
4. Run actual available typecheck, lint, unit tests, integration tests, and production build; report commands, pass/fail/skip and environment.
5. Enumerate files changed, schema or dependency changes, performance observations, remaining blockers, and next prompt to execute. Never say completed if a criterion is unverified.
