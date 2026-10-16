> **CLOUD-FIRST ADDITIVE REVISION (2026-10-16).** This original specification is preserved in full for traceability. Where it describes IndexedDB as the authoritative database, local-only accounts, optional/future cloud, or cloud synchronization postponed until after graduation, those statements are superseded by `master prompts/11_CLOUD_FIRST_DECISION_AND_OVERRIDES.md`. **Supabase PostgreSQL + Auth are required from category 02; IndexedDB is a resilience cache/outbox, not the authoritative store.** No other requirements are removed. Read the cloud addendum and the original content together.

# Change control and feature extensions

## Purpose
A completed module is **not frozen forever**. Features can be extended after acceptance without rebuilding the whole project. Treat each change as a small, testable revision to the existing module.

## Example: add a new timer function after category 04 is complete
1. **Describe the change:** e.g. add split timing, keyboard shortcut customization, Stackmat support, or an alternative inspection mode. State whether it is graduation-critical or optional.
2. **Find the owner:** timer behavior belongs in `prompts/04_timer/04_Timer_and_Inspection.md`. Puzzle notation belongs in `03_puzzles_scrambles`, persistence changes in `02_database`, and statistics changes in `06_statistics`. Do not create a new top-level category for a small timer enhancement.
3. **Append a versioned requirement:** add a subsection `Change Request TMR-001` with user story, exact behavior, UI, defaults, error handling, backward compatibility and acceptance tests. Keep the original requirement; document what changed and why.
4. **Assess dependencies:** identify state-machine transitions, saved data, session/statistics calculations, recording anchors, settings, mobile controls, keyboard handling, WCA-style practice rules, migrations and export compatibility. If the change touches other modules, update their specifications and the shared contracts.
5. **Checkpoint the working version:** commit to Git before the change and create a feature branch (`feature/timer-splits`) when practical.
6. **Ask OpenCode for a scoped implementation plan:** provide the existing module spec, shared regulations, relevant contracts, actual repository and this change request. Ask it to inspect current code, propose minimal modifications and **wait for approval**.
7. **Implement incrementally:** change only the necessary modules. Preserve existing public interfaces or provide explicit migration/adapters. Never rewrite the timer wholesale for a small enhancement without a documented reason.
8. **Test:** new unit/integration tests, existing timer tests, statistics/storage regression, touch/keyboard interaction, and a manual browser check.
9. **Record the outcome:** add a changelog entry, updated screenshots/docs, test results, known limitations and release/version note.

## Future OpenCode request template (use when ready)

```text
RubiVision AI change request: TMR-001
Read all shared master documents and prompts/04_timer/04_Timer_and_Inspection.md.
Inspect the existing repository and implemented timer before proposing changes.
Desired feature: [describe exact behavior].
Constraints: preserve current timer functionality, database compatibility, and 2x2–7x7 support.
First: give a short impact analysis, affected files/contracts, edge cases, tests and migration needs.
Do not edit code until I approve. Do not implement unrelated features.
After approval: implement the smallest safe change, add tests, run available checks and report real outcomes.
```

## Change request record

| Field | Fill in |
|---|---|
| ID and title | TMR-001 / ... |
| Priority and phase | Graduation / Bridge / Ultimate / Optional |
| User benefit | ... |
| Behavior and acceptance examples | ... |
| Affected modules and contracts | ... |
| Database/export migration | None / required |
| Regression tests | ... |
| Decision and date | ... |
| Implementation status | Proposed / approved / implemented / tested |

## Rules for any module
- Add a new requirement to the **existing owning module** unless it is a truly independent subsystem.
- If new capability spans several modules, write one cross-cutting decision and link to each owner.
- Do not renumber the existing 29 categories just because a new requirement appears.
- Preserve user data and make migrations explicit.
- Revisit graduation scope only if the supervisor requires it.
- Never call a feature complete without reproducible acceptance tests.
