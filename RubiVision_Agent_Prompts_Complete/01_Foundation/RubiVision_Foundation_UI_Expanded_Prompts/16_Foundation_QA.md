# RubiVision AI — Foundation quality gate and handoff

## Agent role and source of truth
You are implementing ONE scoped Foundation/UI task in an existing RubiVision AI React/TypeScript repository. Before coding, read `00_MASTER_INSTRUCTIONS.md`, `00_DATA_CONTRACTS.md`, `00_PROJECT_ROADMAP.md`, `00_INTEGRATION_CHECKLIST.md`, and `01_Foundation_UI.md`. Inspect the actual source tree, package.json, installed versions, scripts and tests. Existing working code and canonical data contracts take precedence over suggested paths. Do not silently change data contracts or implement unrelated timer, scramble, database, camera or AI logic.

## Task objective
Run available unit, integration, accessibility and browser tests. Add navigation, responsive, theme, error-boundary and state-preservation tests. Document implementation evidence and next-module interfaces.

## Suggested file ownership (adapt to repository)
tests/foundation/*; docs/foundation-handoff.md; 00_INTEGRATION_CHECKLIST.md

## Detailed implementation requirements
Verify all routes, desktop/mobile breakpoints, theme, keyboard operation, deep-link refresh, error recovery, timer continuity and no direct storage access from UI. Record environment, commands, dates and actual outcomes.

## Implementation procedure
1. Audit relevant existing code; report what is already implemented and what is missing.
2. Write a concise plan naming files, dependencies, risks and acceptance criteria.
3. Implement the smallest coherent change, retaining established conventions and strict TypeScript.
4. Keep view components presentation-only. Domain logic belongs to services; persistence belongs to repositories.
5. Handle loading, empty, unavailable and failure cases honestly. No fake data, no pretend working controls.
6. Add targeted unit/component/integration tests for behavior and edge cases.
7. Run actual available lint, typecheck, test and build scripts. Diagnose failures; never report unrun tests as passing.
8. Summarize files changed, observed behavior, executed commands and results, known limitations, and handoff to next prompt.

## Acceptance criteria
Only mark complete after passing applicable checks; document any blocked or unrun checks and remaining dependencies.

## Integration constraints
- The timer must not reset when changing pages; keep its runtime state independent of route component lifecycle.
- Core timing and history must remain usable without camera, AI model, cloud account or network.
- Canonical `PuzzleType`, `Scramble`, `Session`, `Solve`, `Recording`, and `SolveAnalysis` come from shared contracts; avoid duplicate incompatible types.
- UI must never directly read or write IndexedDB.
- No unsupported claims about exact cube moves, CFOP detection, model accuracy, or WCA certification.
- Any placeholder should be a truthful unavailable/empty state, not fabricated demo results.

## Required agent handoff
Return: (a) current repository findings; (b) implementation summary; (c) changed files; (d) commands and exact pass/fail results; (e) manual verification; (f) blockers and remaining work; (g) contract changes, if any.
