# RubiVision AI — Experimental sticker scanning and solver

## Assigned topic
Experimental sticker scanning and solver

## Suggested files (adapt to existing repository)
features/vision/colorClassifier.ts, faceScanner.ts, cubeStateValidator.ts, CubeScanPage.tsx, features/solver/solverService.ts, solutionValidator.ts, SolutionViewer.tsx

## Implementation requirements
Build optional 3×3-only guided six-face scanner: grid overlay, sticker-center sampling, calibrated CIELAB colors, manual corrections, explicit face orientation, color counts and physical solvability checks. From a validated state, call a vetted Kociemba-style solver asynchronously; verify returned moves solve the supplied state and animate known sequence. Never call Kociemba output CFOP; do not pretend video motion detects cube state.

## Acceptance tests and edge cases
Reject impossible cube states, incomplete scans, poor color confidence, unsupported puzzle, solver timeout; correctness on known scrambles.

## Agent operating instructions
You are an AI coding agent working on the existing RubiVision AI repository. First inspect the repository, package.json, current architecture, existing files, tests, and dependencies. Do not assume the proposed paths already exist or rebuild working features. State a short plan, implement ONLY this topic and necessary typed integration points, and preserve unrelated behavior. Use strict TypeScript for the web application; Python is allowed for offline dataset/training scripts. Write meaningful unit/integration tests and error states. Run available typecheck, tests and build, and report actual results. Do not fabricate test passes, measured ML performance, cube-state recognition, or completed features. For any ambiguous dependency, document a sensible choice. Output changed files, behavior, validation steps, limitations and next integration needs.

## Completion definition
The topic is complete only when its acceptance cases are demonstrably met, tests are run, and integration contracts are documented. Do not implement unrelated optional modules.
