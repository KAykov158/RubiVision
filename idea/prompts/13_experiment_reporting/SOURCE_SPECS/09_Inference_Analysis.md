# RubiVision AI — Model inference and video analysis timeline

## Assigned topic
Model inference and video analysis timeline

## Suggested files (adapt to existing repository)
features/ml/classifier.ts, modelLoader.ts, features/analysis/analysisService.ts, segmentBuilder.ts, AnalysisTimeline.tsx, AnalysisPage.tsx, types/analysis.ts

## Implementation requirements
Load versioned compatible model or baseline; enforce feature names/order/preprocessing, handle unavailable model and low-confidence outputs. Convert window predictions to contiguous MOVEMENT/PAUSE/UNCERTAIN segments using documented smoothing and minimum durations. Align with video playback, enable seek-to-segment and manual corrections. Calculate pause count, longest pause, total pause/movement duration and quality warnings. Save model version and analysis settings; permit reruns without silently overwriting results.

## Acceptance tests and edge cases
Timeline/video synchronization, model failure fallback, confidence display, no fabricated analysis, short pauses, overlapping windows, zero valid predictions.

## Agent operating instructions
You are an AI coding agent working on the existing RubiVision AI repository. First inspect the repository, package.json, current architecture, existing files, tests, and dependencies. Do not assume the proposed paths already exist or rebuild working features. State a short plan, implement ONLY this topic and necessary typed integration points, and preserve unrelated behavior. Use strict TypeScript for the web application; Python is allowed for offline dataset/training scripts. Write meaningful unit/integration tests and error states. Run available typecheck, tests and build, and report actual results. Do not fabricate test passes, measured ML performance, cube-state recognition, or completed features. For any ambiguous dependency, document a sensible choice. Output changed files, behavior, validation steps, limitations and next integration needs.

## Completion definition
The topic is complete only when its acceptance cases are demonstrably met, tests are run, and integration contracts are documented. Do not implement unrelated optional modules.
