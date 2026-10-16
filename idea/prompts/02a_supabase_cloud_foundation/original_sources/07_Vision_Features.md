# RubiVision AI — Computer vision and motion feature extraction

## Assigned topic
Computer vision and motion feature extraction

## Suggested files (adapt to existing repository)
features/vision/frameProcessor.ts, motionExtractor.ts, handTracker.ts, visionPipeline.ts, workers/vision.worker.ts, types/features.ts

## Implementation requirements
Process saved video frames at configurable 10–15 FPS starting point; resize, grayscale/normalize, optional manual ROI, mean absolute frame difference, active-pixel ratio, smoothing, motion variance/max, hand displacement and confidence if MediaPipe available. Aggregate into 250–500 ms timestamped windows; include quality flags for poor lighting/blur/occlusion and cancellation/progress. Use video timestamps, not wall-clock processing time. Keep CPU-heavy work off UI thread. No claims of exact moves or CFOP phases.

## Acceptance tests and edge cases
Static scene, motion, dropped frames, different FPS, absent hands, empty/short videos, cancellation, deterministic feature order.

## Agent operating instructions
You are an AI coding agent working on the existing RubiVision AI repository. First inspect the repository, package.json, current architecture, existing files, tests, and dependencies. Do not assume the proposed paths already exist or rebuild working features. State a short plan, implement ONLY this topic and necessary typed integration points, and preserve unrelated behavior. Use strict TypeScript for the web application; Python is allowed for offline dataset/training scripts. Write meaningful unit/integration tests and error states. Run available typecheck, tests and build, and report actual results. Do not fabricate test passes, measured ML performance, cube-state recognition, or completed features. For any ambiguous dependency, document a sensible choice. Output changed files, behavior, validation steps, limitations and next integration needs.

## Completion definition
The topic is complete only when its acceptance cases are demonstrably met, tests are run, and integration contracts are documented. Do not implement unrelated optional modules.
