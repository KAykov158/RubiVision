# RubiVision AI — Scrambles and cube visualization

## Assigned topic
Scrambles and cube visualization

## Suggested files (adapt to existing repository)
features/scramble/scrambleService.ts, scrambleParser.ts, ScrambleDisplay.tsx, features/cube/cubeState.ts, CubeViewer.tsx

## Implementation requirements
Generate valid 2×2–7×7 puzzle-specific WCA-style scrambles via a vetted compatible library, asynchronously when necessary. Keep scramble fixed while timer runs and save its exact text and generator version. Allow copy/regenerate and reject stale async responses. Add optional cube viewer for supported puzzle types, using cubing.js/Three.js; viewer shows scramble-derived known state, never inferred physical state.

## Acceptance tests and edge cases
Validate notation and puzzle mapping; scramble ID uniqueness; inverse move restores state; unavailable viewer never blocks timing.

## Agent operating instructions
You are an AI coding agent working on the existing RubiVision AI repository. First inspect the repository, package.json, current architecture, existing files, tests, and dependencies. Do not assume the proposed paths already exist or rebuild working features. State a short plan, implement ONLY this topic and necessary typed integration points, and preserve unrelated behavior. Use strict TypeScript for the web application; Python is allowed for offline dataset/training scripts. Write meaningful unit/integration tests and error states. Run available typecheck, tests and build, and report actual results. Do not fabricate test passes, measured ML performance, cube-state recognition, or completed features. For any ambiguous dependency, document a sensible choice. Output changed files, behavior, validation steps, limitations and next integration needs.

## Completion definition
The topic is complete only when its acceptance cases are demonstrably met, tests are run, and integration contracts are documented. Do not implement unrelated optional modules.
