# 15 OPTIONAL SCANNER SOLVER — executable coding-agent prompt

**Copy the entire content of this file to your coding agent.**

## Mandatory agent execution contract
You are an autonomous coding agent with access to the EXISTING RubiVision AI repository. Before editing, inspect source tree, git status, package.json, lockfile, installed versions, tests, migrations, README, and original_specs in this pack. The real repository is the truth about implementation, while the specs describe intended behavior. Never claim a feature exists without inspecting and testing it. Never erase working code or overwrite uncommitted changes. Prefer the smallest coherent vertical slice, preserve public contracts, and use strict TypeScript. First output an audit of relevant existing behavior, a short implementation plan, dependencies, risks and concrete acceptance criteria; then IMPLEMENT the assigned task, not merely propose it. If access or credentials are missing, build testable boundaries and document exact blocker instead of faking a pass. Add unit/integration/security/e2e tests as appropriate, run real available commands, and record output and failures. Do not fabricate accuracy, WCA certification, video fps, exact cube turns, or model compatibility. No secret keys in frontend or git. Ask only when a blocking decision is genuinely impossible to resolve safely.

## Architecture precedence (important)
The newest user-supplied 04_Timer_and_Inspection.md header says Supabase PostgreSQL is the only persistent APP DATABASE and no durable offline save is promised. Older files contradict this and mention IndexedDB/offline-first, including an internally conflicting addendum in that same file. Treat Supabase-only as the chosen implementation policy for this pack, subject to explicit user confirmation if existing code or unseen master 11–17 overrides it. Local ephemeral browser memory and local video processing are permitted; no IndexedDB, local database or durable outbox. Auth and network are required to confirm persistent records. The timer itself must work without a network. Preserve solve data in memory on transient failure, display UNSAVED and allow retry, but warn on reload/closing. Never imply server persistence before server acknowledgment. No upload of videos without explicit consent. Source document's graduation scope is 3x3 MVP; 2x2–7x7 may be expanded where newer category requirements require it, without delaying 3x3 demo.

## Completion report (required)
1. Existing files and behavior inspected. 2. Files changed and reason. 3. Database migrations/security policies if any. 4. Tests added and exact commands/results. 5. Manual verification steps. 6. Errors, blocked items and known limitations. 7. Contracts affected. 8. Next phase readiness. Do not mark complete when acceptance criteria remain unverified.


## Task objective
Experimental 3x3 six-face sticker scanner and solver; not graduation blocker.

## Implementation instructions — detailed scope
Guided fixed orientation per face, sticker sampling and color calibration, manual correction, 9-per-color count, corner/edge orientation and permutation parity solvability validation; vetted Kociemba-style solver, verify returned sequence on state, timeout handling. No claim of automatic video cube tracking. Feature flag, separate test fixtures.

## Required engineering procedure
1. Inspect existing implementation and related original specifications; quote relevant file paths and installed library versions. Identify prerequisites and dependency mismatches.
2. Draw a concrete task-level architecture, state/data flow and interfaces before touching files. Record decisions in docs/decision-log.md.
3. Define positive, negative, boundary, concurrency, accessibility, privacy and security cases appropriate to this feature. Use fixtures rather than invented external outcomes.
4. Implement cohesive production code using current repository conventions. Keep pure logic separated from React and network/storage adapters. Use cancellation, typed errors and stable IDs where needed.
5. Add tests that would fail if the core behavior were wrong. Prefer fake clocks and deterministic fixtures; avoid flaky timeouts. Validate idempotency and race conditions wherever state can change asynchronously.
6. Run available lint, typecheck, unit tests, relevant integration/e2e tests and production build. If a command is unavailable, say so explicitly; do not mark it passed.
7. Update user-facing documentation, migration notes, and requirement traceability. Show actual outputs, not estimated numbers.
8. Stop if blocked by unavailable credentials, missing ground truth, incompatible APIs or unverified safety-critical assumptions. Report the smallest safe next action.

## Exit gate and proof required
Reject impossible states, verify known scrambles and inverse solution, handle camera/lighting failures.

## Deliverable format
Provide (a) existing-state audit, (b) implementation plan, (c) actual changes, (d) tests/commands and their outcomes, (e) manual reproduction, (f) known limitations, (g) integration impact, (h) PASS/BLOCKED verdict. Do not start the next phase automatically.
