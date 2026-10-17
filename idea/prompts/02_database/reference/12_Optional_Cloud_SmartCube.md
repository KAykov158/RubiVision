# RubiVision AI — Optional cloud sync and Bluetooth smart cubes

## Assigned topic
Optional cloud sync and Bluetooth smart cubes

## Suggested files (adapt to existing repository)
features/auth/authService.ts, features/sync/syncService.ts, storage/cloudRepository.ts, features/smartcube/bluetoothService.ts, deviceAdapters/, moveDecoder.ts

## Implementation requirements
Keep optional features behind flags. Cloud: user authentication, per-user row-level authorization, offline-first sync, conflict handling, status, export/delete and no secret keys in browser. Smart cube: explicit Bluetooth pairing, manufacturer-specific verified protocol adapters, timestamped decoded moves, disconnect/reconnect and known-move replay. Distinguish device-reported moves from camera predictions. Core app must work without either.

## Acceptance tests and edge cases
Offline and conflict tests, permissions, unsupported devices, connection loss, no cloud requirement for local solves.

## Agent operating instructions
You are an AI coding agent working on the existing RubiVision AI repository. First inspect the repository, package.json, current architecture, existing files, tests, and dependencies. Do not assume the proposed paths already exist or rebuild working features. State a short plan, implement ONLY this topic and necessary typed integration points, and preserve unrelated behavior. Use strict TypeScript for the web application; Python is allowed for offline dataset/training scripts. Write meaningful unit/integration tests and error states. Run available typecheck, tests and build, and report actual results. Do not fabricate test passes, measured ML performance, cube-state recognition, or completed features. For any ambiguous dependency, document a sensible choice. Output changed files, behavior, validation steps, limitations and next integration needs.

## Completion definition
The topic is complete only when its acceptance cases are demonstrably met, tests are run, and integration contracts are documented. Do not implement unrelated optional modules.
