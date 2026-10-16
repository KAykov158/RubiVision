# 13_SECURITY_PRIVACY — Security, privacy, quotas and resilience hardening

## Objective and background
You are implementing one bounded phase of RubiVision AI, a speedcubing web application with cloud persistence and experimental camera-based movement/pause analysis. This prompt is an implementation assignment, not a request for a proposal only. Do not attempt all phases at once.

## Detailed implementation assignment
Threat model multi-tenant data, Supabase RLS, signed media access, uploads, auth lifecycle, XSS, CSV injection, malicious imports, privacy of videos, secrets, quotas, account deletion and audit logs. Set size/type validation and server-enforced quotas, retry/backoff and reconciliation of partial storage operations. Verify no service-role credentials in client bundles, logs or repository. Write privacy and deletion documentation.

## Expected files and deliverables
Suggested paths (adapt to the actual repository): docs/THREAT_MODEL.md, docs/PRIVACY.md, tests/security/.

## Concrete acceptance gate
Cross-account DB and Storage probes denied; malicious import handled; delete and quota failures recover safely.

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

