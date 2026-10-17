# RubiVision AI — Foundation, UI and navigation

## Assigned topic
Foundation, UI and navigation

## Suggested files (adapt to existing repository)
App.tsx, router.tsx, providers.tsx, AppLayout.tsx, Navigation.tsx, TimerPage.tsx, HistoryPage.tsx, StatisticsPage.tsx, AnalysisPage.tsx, SettingsPage.tsx, global styles

## Implementation requirements
Create a responsive accessible React/TypeScript shell with dark/light themes, desktop/mobile layouts, loading/empty/error states, and routes for timer, history, statistics, analysis and settings. Keep presentation separate from domain services. Never reset a running timer on navigation; warn before destructive navigation if needed.

## Acceptance tests and edge cases
Keyboard accessibility, responsive breakpoints, no hidden overflow, error boundaries, page navigation, no direct IndexedDB calls from visual components.

## Agent operating instructions
You are an AI coding agent working on the existing RubiVision AI repository. First inspect the repository, package.json, current architecture, existing files, tests, and dependencies. Do not assume the proposed paths already exist or rebuild working features. State a short plan, implement ONLY this topic and necessary typed integration points, and preserve unrelated behavior. Use strict TypeScript for the web application; Python is allowed for offline dataset/training scripts. Write meaningful unit/integration tests and error states. Run available typecheck, tests and build, and report actual results. Do not fabricate test passes, measured ML performance, cube-state recognition, or completed features. For any ambiguous dependency, document a sensible choice. Output changed files, behavior, validation steps, limitations and next integration needs.

## Completion definition
The topic is complete only when its acceptance cases are demonstrably met, tests are run, and integration contracts are documented. Do not implement unrelated optional modules.
