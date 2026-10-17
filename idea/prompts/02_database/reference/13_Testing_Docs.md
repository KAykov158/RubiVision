# RubiVision AI — Integration testing, documentation and graduation demo

## Assigned topic
Integration testing, documentation and graduation demo

## Suggested files (adapt to existing repository)
tests/unit/, tests/integration/, tests/e2e/, README.md, docs/architecture.md, docs/ai-methodology.md, docs/privacy.md, docs/evaluation.md

## Implementation requirements
Use Vitest and Playwright for timer-to-save, scramble association, penalties/statistics, camera denial, recording/analysis, persistence, migration and import/export. Document installation, run/build/test commands, data labeling, split design, baseline/model evaluation, limitations and privacy. Build a repeatable demo: scramble → timer → saved solve → statistics → recording → pause/movement analysis. Report only measured performance.

## Acceptance tests and edge cases
CI build/typecheck/tests pass; fresh install runs; graduation demo works without cloud; limitations clearly stated.

## Agent operating instructions
You are an AI coding agent working on the existing RubiVision AI repository. First inspect the repository, package.json, current architecture, existing files, tests, and dependencies. Do not assume the proposed paths already exist or rebuild working features. State a short plan, implement ONLY this topic and necessary typed integration points, and preserve unrelated behavior. Use strict TypeScript for the web application; Python is allowed for offline dataset/training scripts. Write meaningful unit/integration tests and error states. Run available typecheck, tests and build, and report actual results. Do not fabricate test passes, measured ML performance, cube-state recognition, or completed features. For any ambiguous dependency, document a sensible choice. Output changed files, behavior, validation steps, limitations and next integration needs.

## Completion definition
The topic is complete only when its acceptance cases are demonstrably met, tests are run, and integration contracts are documented. Do not implement unrelated optional modules.
