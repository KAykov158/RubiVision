# 16_OPTIONAL_TRACKING — Experimental live cube-state and move tracking research

## Objective and background
You are implementing one bounded phase of RubiVision AI, a speedcubing web application with cloud persistence and experimental camera-based movement/pause analysis. This prompt is an implementation assignment, not a request for a proposal only. Do not attempt all phases at once.

## Detailed implementation assignment
Only after stable MVP: establish calibrated fixed camera, visible face observations, identity tracking and turn event candidates. Define observability limits: unseen faces and occlusions prevent guaranteed full state. Build synthetic cube renderer dataset, manually labeled turn clips, calibration protocol, confidence gating, correction UI and resynchronization. Compare predictions to verified move ground truth, report move precision/recall and state consistency; do not invent turns or TPS. Consider smart-cube ground truth as separate verified sensor source.

## Expected files and deliverables
Suggested paths (adapt to the actual repository): research/tracking/, docs/TRACKING_RESEARCH.md, tests/tracking/.

## Concrete acceptance gate
Documented controlled-condition experiment with measured errors; uncertain state displayed rather than fabricated.

## Additional edge cases and integration checks
- Test a fresh account with no data, populated account, stale authentication, denied permissions where relevant, and malformed input.
- Preserve immutable scramble association and millisecond timing precision through the complete data flow.
- Validate ownership on the server, not only in React UI. Explicitly report any security behavior not tested.
- Ensure network failures do not masquerade as successful persistence; ensure camera and AI failures cannot corrupt timer or solve records.
- Record any mismatch between the original project specification and the Supabase-only architectural decision.
- Where this phase needs a real browser, real footage, a hosted Supabase project or labeled dataset, clearly distinguish automated evidence, manual evidence and unverified conditions.

## Suggested agent workflow
A. Inventory current implementation and existing tests.
B. Draft minimal data flow and interface changes; note dependencies.
C. Implement one cohesive vertical slice and SQL migration if needed.
D. Add unit, integration, security and end-to-end tests appropriate to scope.
E. Run checks, fix failures and document exact commands and output summaries.
F. Produce a handoff for the next phase without beginning unrelated work.

## Agent execution protocol — mandatory
1. Inspect the actual repository, package manager, versions, environment files (never print secrets), tests, schema migrations, and prior phase reports. Do not assume this project is empty.
2. Read docs/ARCHITECTURE_DECISIONS.md and reference/02_Supabase_PostgreSQL_Schema.md, plus the relevant original specification. If files are not copied into the repository, ask for their location; never silently ignore them.
3. Produce an inventory of existing vs missing functionality and a concrete file-level plan before editing. Implement the smallest complete vertical slice; preserve unrelated functionality.
4. Validate all input at boundaries; use strict TypeScript and typed repositories. Never put privileged Supabase credentials in browser code. Prefer existing dependencies; verify actual installed APIs.
5. Add deterministic unit tests, integration tests where applicable, negative tests and explicit UI error handling. Run available lint, typecheck, tests, production build, and relevant Supabase local checks. If unavailable, state why.
6. Do not claim measured accuracy, WCA certification, exact camera-derived moves, CFOP phases, successful database writes or test passes without evidence.
7. Deliver: changed files; design decisions; migrations and data impact; test commands and actual results; manual QA; remaining risks; handoff instructions. Update docs/PHASE_STATUS.md. Do not mark complete if acceptance criteria fail.
8. Do not use IndexedDB, OPFS databases, offline save queues, or client-side persistent solve storage. Supabase PostgreSQL is the only persistent application database. In-memory state is allowed but is volatile. Explain that offline timing works while saving does not.

