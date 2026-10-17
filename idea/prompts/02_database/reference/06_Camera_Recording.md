# RubiVision AI — Camera, recording and privacy

## Assigned topic
Camera, recording and privacy

## Suggested files (adapt to existing repository)
features/camera/cameraService.ts, useCamera.ts, recordingService.ts, CameraPreview.tsx, types/recording.ts

## Implementation requirements
Request camera permission only after explicit action. Provide camera selection, live preview, framing guidance, MIME capability checks and MediaRecorder capture linked to solve. Optional auto-record begins before timing and ends at stop; timer must not depend on recording. Store metadata and optionally video blobs with quota controls; permit playback and deletion. Stop media tracks on teardown. Default recordings local; never upload without explicit opt-in.

## Acceptance tests and edge cases
Denied permission, no device, unsupported MIME, interrupted recording, low storage, synchronization offset between recording and timer.

## Agent operating instructions
You are an AI coding agent working on the existing RubiVision AI repository. First inspect the repository, package.json, current architecture, existing files, tests, and dependencies. Do not assume the proposed paths already exist or rebuild working features. State a short plan, implement ONLY this topic and necessary typed integration points, and preserve unrelated behavior. Use strict TypeScript for the web application; Python is allowed for offline dataset/training scripts. Write meaningful unit/integration tests and error states. Run available typecheck, tests and build, and report actual results. Do not fabricate test passes, measured ML performance, cube-state recognition, or completed features. For any ambiguous dependency, document a sensible choice. Output changed files, behavior, validation steps, limitations and next integration needs.

## Completion definition
The topic is complete only when its acceptance cases are demonstrably met, tests are run, and integration contracts are documented. Do not implement unrelated optional modules.
