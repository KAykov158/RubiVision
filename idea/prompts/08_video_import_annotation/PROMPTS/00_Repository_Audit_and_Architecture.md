# PHASE 00 — Repository Audit and Architecture

## Paste this complete task into the coding agent

You are the lead implementation agent for RubiVision AI. Read `00_AGENT_GLOBAL_CONTRACT.md`, `ARCHITECTURE_DECISIONS.md`, `COMPLETION_GATES.md`, and the relevant original specification(s) in `ORIGINAL_SOURCES/` BEFORE changing code. The repository is authoritative about what is already implemented; the supplied specifications describe intended behavior.

### Mission
Inspect package manifests, scripts, git status, feature inventory, current routes, database usage, browser compatibility and security posture. Produce a factual gap analysis and prioritized implementation backlog. No application changes in this stage.

### Required deliverables
architecture audit; file inventory; dependency matrix; risk register; exact commands and baseline outcomes.

### Detailed execution procedure
1. Inventory the actual files, dependencies, database migrations, tests, routes and services related to this phase. Record whether each requested capability already exists, partially exists or is absent; include file paths and evidence.
2. Write a focused plan naming modules and exported types/interfaces, UI states, database entities and migration impacts. Keep it as a vertical slice. Do not implement unrelated future modules.
3. Define input/output contracts and validate them at boundaries. Prefer pure functions for business rules, a typed service/repository for persistence and separate components for UI. Do not let React components issue arbitrary cross-feature table writes.
4. Explicitly handle invalid input, absent permissions, unsupported browser features, cancellation, slow operations, empty states, concurrent actions, duplicate events, network errors and failed writes where relevant. Avoid broad catches that mask failures.
5. Maintain stable UUIDs, UTC ISO timestamps, integer milliseconds, half-open video intervals, explicit source/provenance and versioned schemas. Use Supabase PostgreSQL only for durable app records, and test owner-scoped RLS where this phase touches persistence.
6. Implement accessibility: keyboard navigation, visible focus, semantic labels, accessible errors, contrast and non-color-only status. Add responsive states if UI is changed.
7. Add unit tests for invariants and boundaries, integration tests for service contracts, negative tests for failure paths, and Playwright tests for key browser journeys when practical. Never substitute mocks for all database authorization tests.
8. Run actual relevant lint, TypeScript typecheck, unit tests, production build, migration/security tests and E2E tests when available. Preserve command output and report blocked infrastructure honestly.
9. Update docs: architecture decisions, configuration, migration instructions, user-visible limitations, test evidence and integration checklist. Preserve original raw footage and earlier analysis artifacts when generating derived results.
10. Return a completion report with changed paths, behavior, commands, evidence, failures, limitations, next dependency gate and whether the phase is PASS/FAIL/BLOCKED.

### Phase-specific engineering questions to resolve
- Which repository modules already implement part of `Repository Audit and Architecture` and should be reused rather than replaced?
- What exact source-of-truth schema, unit definitions and version tags apply to this feature?
- How will a user recognize success versus a failed/unsaved/uncertain result?
- What race conditions or destructive operations could corrupt linked records?
- What deterministic fixture proves the happy path and which negative fixture proves error handling?
- Which upstream and downstream services consume the output and how are their contracts tested?
- What is the minimum fully demonstrable vertical slice and what should remain explicitly deferred?

### Acceptance matrix: must provide evidence
| Case | Required verification | Status | Evidence |
|---|---|---|---|
| Happy path | Execute realistic example end-to-end | NOT RUN | Fill in |
| Boundary conditions | Deterministic unit fixtures | NOT RUN | Fill in |
| Invalid input | Reject safely and show useful error | NOT RUN | Fill in |
| Concurrency / interruption | No duplicate or corrupted outcome | NOT RUN | Fill in |
| Data contracts | Schema/units/provenance preserved | NOT RUN | Fill in |
| Security / privacy | Owner isolation and consent as applicable | NOT RUN | Fill in |
| Integration | Prior working modules still pass | NOT RUN | Fill in |
| Build | Lint/typecheck/tests/build executed | NOT RUN | Fill in |

### Stop conditions
Stop and report a blocker rather than guessing when: the needed repository is unavailable; the referenced missing 11–15/02A specifications contain essential unresolved requirements; a migration would destroy data; an unsupported API is required; credentials or test data are missing; or evidence does not support a requested accuracy/feature claim.

### Mandatory final response
Provide: 1. verified current state, 2. plan executed, 3. changed files and database migrations, 4. commands and actual outcomes, 5. acceptance matrix, 6. user manual test instructions, 7. unresolved risks, 8. recommended next phase. Do not claim completion when critical acceptance rows are NOT RUN or BLOCKED.
