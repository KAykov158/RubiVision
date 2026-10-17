# RubiVision AI — Settings, JSON/CSV export and import

## Assigned topic
Settings, JSON/CSV export and import

## Suggested files (adapt to existing repository)
features/settings/settingsService.ts, settingsSchema.ts, SettingsPanel.tsx, features/export/exportService.ts, importService.ts, fileValidator.ts

## Implementation requirements
Implement validated persisted settings for timer/inspection, default puzzle, theme, camera, analysis sensitivity, privacy and retention. Add CSV solve export and versioned JSON backup covering related sessions, solves, scrambles and analyses. Validate imports, preview counts, detect duplicate IDs, use transactions and preserve referential integrity. Document schema and conflict strategy.

## Acceptance tests and edge cases
Round-trip export/import, malformed file, duplicates, quota failures, invalid settings reset, no partial corrupted imports.

## Agent operating instructions
You are an AI coding agent working on the existing RubiVision AI repository. First inspect the repository, package.json, current architecture, existing files, tests, and dependencies. Do not assume the proposed paths already exist or rebuild working features. State a short plan, implement ONLY this topic and necessary typed integration points, and preserve unrelated behavior. Use strict TypeScript for the web application; Python is allowed for offline dataset/training scripts. Write meaningful unit/integration tests and error states. Run available typecheck, tests and build, and report actual results. Do not fabricate test passes, measured ML performance, cube-state recognition, or completed features. For any ambiguous dependency, document a sensible choice. Output changed files, behavior, validation steps, limitations and next integration needs.

## Completion definition
The topic is complete only when its acceptance cases are demonstrably met, tests are run, and integration contracts are documented. Do not implement unrelated optional modules.
