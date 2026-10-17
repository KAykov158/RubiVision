# RUBIVISION AI — MANDATORY AGENT OPERATING CONTRACT

You are a coding agent working on the user's ACTUAL repository. Uploaded specifications are requirements, NOT proof that code exists. Do not claim implementation without inspection and test evidence.

## Precedence and conflict resolution
1. Explicit latest user instruction and verified repository behavior.
2. The 2026-10-16 Supabase-only override in `08_Video_Import_and_Manual_Annotation.md`: Supabase PostgreSQL is the ONLY durable app database; do not add IndexedDB, SQLite, localStorage persistence, or an offline outbox for application records. Temporary in-memory browser state and local video file handles/object URLs are allowed but not durable.
3. Compatible feature requirements from supplied topic specifications and the master specification.
4. Earlier offline-first/IndexedDB wording is superseded wherever contradictory. Missing referenced master 11–15 and category 02A are NOT included in this supplied source set: ask for them or document assumptions, do not invent their text.
5. If real repository conventions differ, propose a minimal compatibility path and record an ADR before destructive changes.

## Operating sequence for EVERY stage
A. Inspect repository status, package manager, relevant modules, migrations, current tests, README, git diff, environment and exact installed dependency versions. Read the relevant attached original specification(s).
B. Report existing functionality vs missing functionality, relevant dependencies, intended files, migration risk, security implications, acceptance tests and smallest complete vertical slice.
C. Implement production-quality typed code with separation of domain logic, UI, persistence, media and ML. Reuse existing working code. No invented API signatures.
D. Add meaningful unit, integration and where applicable browser E2E tests, negative tests, error states and accessibility.
E. Execute actual available lint, typecheck, test, build and focused security commands. If credentials or infrastructure are unavailable, mark tests BLOCKED and provide exact instructions; never say PASS.
F. Summarize changed files, database migrations, behavior, command outputs, test counts, manual steps, risks, unresolved decisions and next safe stage.
G. Stop if prerequisite contracts or infrastructure are absent, or if proceeding would require destructive changes, leaked credentials, unverifiable scientific claims, or a second persistent database.

## Global invariants
- Puzzle IDs 222,333,444,555,666,777; stable UUIDs; ISO UTC timestamps; finite integer millisecond durations.
- Penalty NONE/PLUS_TWO/DNF; effective time derived, never independently editable; DNF is not a numeric result.
- Segment intervals are [startMs,endMs), finite, ordered, non-overlapping, within video duration; labels MOVEMENT/PAUSE/UNCERTAIN.
- Preserve human annotations, predictions and verified evidence separately with provenance and schema/model versions.
- User-owned Supabase rows must be RLS-protected; no browser service-role credentials; test cross-user access denial.
- Camera opt-in; imported files need no camera permission; no silent raw-video uploads; revoke URLs/stop tracks.
- Timer measurement must not depend on React render ticks, model processing, camera or network. Network failure may prevent durable save: show an honest unsaved/error state, never falsely claim persistence.
- Motion does not establish exact cube moves, cube state, CFOP phases or TPS.
- Never fabricate accuracy, WCA certification, performance, browser support, consent or test success.

## Standard agent response format
1. Audit findings; 2. implementation plan; 3. changes made; 4. acceptance matrix (PASS/FAIL/BLOCKED/NOT RUN with evidence); 5. commands/results; 6. migrations/security; 7. limitations; 8. next task.
