# RubiVision AI — Puzzles & Scrambles: implementation pack

**Scope:** detailed implementation of uploaded `03_Puzzles_and_Scrambles(1).md` with integration to timer, sessions, solves, Supabase and optional cube viewer/daily challenge. These are **instructions, not implemented code**. No repository was provided for execution, so agent must inspect it before coding.

## Recommended execution order
1. `prompts/00_REPOSITORY_AUDIT.md` (read-only audit)
2. `prompts/01_CONTRACTS_AND_ARCHITECTURE.md`
3. `prompts/02_GENERATORS_AND_VALIDATION.md`
4. `prompts/03_UI_AND_SELECTION.md`
5. `prompts/04_TIMER_LOCK_AND_SOLVE.md`
6. `prompts/05_SUPABASE_PERSISTENCE_AND_SECURITY.md`
7. `prompts/06_HISTORY_AND_RECOVERY.md`
8. `prompts/07_VIEWER_OPTIONAL.md`
9. `prompts/08_DAILY_CHALLENGE.md`
10. `prompts/09_TESTING_AND_RELEASE.md`
11. `prompts/10_FINAL_REVIEW.md`

Run one prompt per agent session/commit; paste the full file or point the agent to its path. `MASTER_ONE_SHOT_ORCHESTRATOR.md` directs sequential execution, not a single uncontrolled rewrite. `reference/` includes detailed design and acceptance tables. `source/` preserves the uploaded specification and shared contracts for context.

## Crucial interpretation
- Offline: generation and running timer are available offline; PostgreSQL is the **only durable app database**. Offline save is not guaranteed. On network failure preserve unsaved result in live UI state and offer retry/export without claiming durability after reload.
- Latest uploaded requirement explicitly includes 2×2–7×7; older 3×3-only MVP text is narrower and must not silently reduce scope.
- Daily challenges and 3D viewer are isolated optional slices if the core is not stable; uploaded daily-challenge separation is mandatory as a design boundary.
- Exact move reconstruction from a camera is NOT part of this module.

## What completion means
Verified scramble generation for each supported event; correct parser and provenance; stable timer/scramble relationship; Supabase ownership and persistence; history and error states; accessibility; test evidence and a reproducible demo. See `reference/DEFINITION_OF_DONE.md`.
