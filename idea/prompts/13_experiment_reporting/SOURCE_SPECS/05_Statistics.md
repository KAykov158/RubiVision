# RubiVision AI — Statistics and charts

## Assigned topic
Statistics and charts

## Suggested files (adapt to existing repository)
features/statistics/statisticsEngine.ts, StatisticsPanel.tsx, StatisticsPage.tsx, statisticsEngine.test.ts

## Implementation requirements
Create pure tested functions for count, best, worst, mean of valid solves, rolling ao5/ao12/ao50/ao100, best rolling averages, DNF rate, puzzle/session breakdown, trends and histograms. Follow documented WCA-style trimmed average conventions and correct +2/DNF treatment; do not confuse mean and average. UI provides charts, date/session/puzzle filters and insufficient-data states.

## Acceptance tests and edge cases
Golden test vectors, multiple DNF windows, penalty edits, boundary windows, zero solves, chart accessibility.

## Agent operating instructions
You are an AI coding agent working on the existing RubiVision AI repository. First inspect the repository, package.json, current architecture, existing files, tests, and dependencies. Do not assume the proposed paths already exist or rebuild working features. State a short plan, implement ONLY this topic and necessary typed integration points, and preserve unrelated behavior. Use strict TypeScript for the web application; Python is allowed for offline dataset/training scripts. Write meaningful unit/integration tests and error states. Run available typecheck, tests and build, and report actual results. Do not fabricate test passes, measured ML performance, cube-state recognition, or completed features. For any ambiguous dependency, document a sensible choice. Output changed files, behavior, validation steps, limitations and next integration needs.

## Completion definition
The topic is complete only when its acceptance cases are demonstrably met, tests are run, and integration contracts are documented. Do not implement unrelated optional modules.
