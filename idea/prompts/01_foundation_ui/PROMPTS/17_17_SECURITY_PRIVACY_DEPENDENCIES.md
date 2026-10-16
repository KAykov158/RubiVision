# RubiVision AI — Phase 1 extension task 17: Frontend security and privacy review

## Copy this entire file to a coding agent

You are a senior engineer working on an existing offline-first RubiVision AI codebase. This is a focused follow-up task to improve Phase 1 reliability and completeness, not permission to implement later features.

## Detailed requirements

1. Inspect package versions, lockfile integrity, exposed environment variables, committed credentials and browser storage use.
2. Run available package-manager dependency audit, interpret severity and exploitability; do not automatically force-upgrade breaking dependencies.
3. Check untrusted text rendering and avoid unsafe HTML injection. Validate external link behavior and no accidental sensitive query parameters.
4. Ensure Phase 1 never requests camera, microphone, Bluetooth or cloud permissions; future settings labels must not imply consent or upload.
5. Check third-party fonts, analytics, CDNs and external resources against offline-first/privacy goals; document any network dependencies.
6. Confirm errors and logs do not expose personal or secret data; add user-friendly failure messages.
7. Document threat model relevant to UI: local storage tampering, malicious imported content (future), dependency risk, clickjacking (deployment-level), CSP considerations.
8. Do not claim a full penetration test; provide evidence-backed risk register and safe remediation.

## Explicit acceptance criteria

- [ ] No secrets in frontend/repository or risks documented
- [ ] No silent permissions/uploads
- [ ] Dependency audit executed or unavailable documented
- [ ] Threat model and mitigations recorded

## Mandatory execution protocol
- Read `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, `00_INTEGRATION_CHECKLIST.md`, and `01_Foundation_and_UI.md` before edits. Inspect actual repository and prior phase reports.
- First show a short evidence-based plan, existing files to reuse, exact intended edits, assumptions and dependencies. Do not delete or replace unrelated working code.
- Scope strictly to Foundation/UI. Do not implement actual timing, scramble generation, solve persistence, statistics calculations, camera recording, ML, or cloud. Never present placeholders as functioning features.
- Keep domain logic pure and UI dependent on typed interfaces. Preserve canonical identifiers, UTC timestamps, integer millisecond durations, schema and provenance semantics.
- Implement positive and negative paths, test with representative inputs, run available typecheck/lint/unit tests/build and applicable Playwright checks. Report exact commands, exit codes and environment; never invent successful tests.
- If browser or tools unavailable, mark browser checks NOT VERIFIED, not PASS. If no repo exists, report and use approved bootstrap task.
- Stop after this task and provide: changed files, decisions, verification matrix, remaining risks and next-step handoff.

## Required acceptance evidence format
| Criterion | PASS / FAIL / NOT VERIFIED | Evidence (test/command/manual step) | Notes |
|---|---|---|---|
| [each criterion below] | | | |

A passing typecheck alone is not proof of accessibility, correct UX or runtime behavior.
