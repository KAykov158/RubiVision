# RubiVision AI — Preprocessing, ROI and image quality

## Role and operating procedure
You are an autonomous senior TypeScript/computer-vision engineering agent working in the EXISTING RubiVision AI repository. Inspect source tree, package.json, lockfile, installed dependencies, tests, README, and existing services before editing. Read `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, `00_INTEGRATION_CHECKLIST.md`, and `09_Computer_Vision_Feature_Extraction.md`. This pack is a task plan, not evidence that functionality exists. Summarize discovered reality and contradictions before coding. Work in small vertical slices, never replace unrelated code, never fabricate test results. If dependencies are missing, create a narrow tested adapter or report a blocker. Do not ask for approval on routine implementation choices; record the choice and reason.

## Architecture precedence (critical)
The 2026-10-16 Supabase-only addendum supersedes older IndexedDB/local-database/offline-outbox statements. Supabase PostgreSQL is the ONLY durable application database. Browser processing of user-selected media remains local; transient in-memory blobs/object URLs are allowed but not durable offline databases. Network failure must not be represented as successful persistence. User must be clearly informed that unsaved cloud data may be lost if the tab closes. Do not silently upload video or frames. Read any newer repository-side master sections 11–15 and category 02A if available; report missing references rather than inventing their content. Authentication/owner-scoped RLS and migrations belong to existing repositories/services, not direct writes from vision components.

## Non-negotiable scientific boundary
MOVEMENT, PAUSE and UNCERTAIN describe visible solve-related motion, not exact cube moves, state, TPS, or CFOP phase. Missing hands are missing evidence, never proof of pause. Store original recording and raw features independently from model-derived output. Any numbers described as benchmarks must come from actual measurements.

## Task
Implement deterministic resizing, crop/ROI, grayscale and normalization with image-quality diagnostics.

## Detailed implementation steps
1. Specify pixel channel ordering, alpha handling, resize interpolation, aspect-ratio behavior, ROI normalization, padding and coordinate transforms
2. Add optional user-configurable cube/hand ROI with clear validation and full-frame fallback
3. Compute luminance, contrast, Laplacian-style sharpness or validated blur metric, exposure clipping, lighting shifts, and quality flags; calibrate thresholds on representative fixtures rather than claiming universal robustness
4. Document browser/Python parity strategy and pixel tolerances
5. Keep quality scores separate from motion labels.

## Required tests and adversarial cases
Solid black/white, sudden lighting change, glare, heavily blurred, moving background, ROI partly outside image, zero-size frame, mirrored camera, resolution change.

## Acceptance criteria / definition of done
Golden-image preprocessing fixtures and quality warnings are deterministic with defined tolerance.

## Deliverables and mandatory agent response
1. Repository audit and brief implementation plan, including dependencies and risks.
2. Focused production code with typed, versioned contracts and explicit error handling.
3. Automated tests with deterministic fixtures and manual reproduction steps.
4. Run actual available typecheck, lint, unit tests, integration tests, and production build; report commands, pass/fail/skip and environment.
5. Enumerate files changed, schema or dependency changes, performance observations, remaining blockers, and next prompt to execute. Never say completed if a criterion is unverified.
