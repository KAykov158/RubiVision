# RubiVision AI — Computer Vision Agent Implementation Pack

This pack contains **15 executable coding-agent task prompts**, plus original reference Markdown documents. The tasks are not implemented code and do not imply test success.

## How to use
1. Put the repository and reference specifications in an agent-accessible workspace.
2. Run `prompts/00_REPOSITORY_AUDIT.md` first. Then run prompts 01–14 in order, unless the audit documents an existing implementation and a justified skip.
3. Give each prompt to Codex/OpenCode as the complete task. Ask the agent to commit or checkpoint only after tests and a truthful handoff.
4. Never ask the agent to implement the whole pack in one shot. Review its test output and modified files between tasks.

## Architecture decisions and known specification conflicts
- The uploaded 2026-10-16 module explicitly supersedes older IndexedDB/offline-outbox requirements with **Supabase PostgreSQL as the only persistent application database**. Older reference files still contain conflicting local-first language. The newer addendum takes precedence for persistence, but in-browser frame processing stays local.
- References to master sections 11–15 and category 02A are not included in the supplied reference pack; coding agents must locate them in the repository or explicitly report missing dependencies.
- The uploaded module is labelled **09 Computer Vision Feature Extraction**, while the older roadmap calls the CV module **07** and **09** means inference. Use descriptive module names to avoid accidental collision.
- The 15 prompts cover **computer-vision feature extraction and its integration**. They do not independently implement the full RubiVision app, model training or exact move detection.

## What finished means
A completed CV module processes consented local video into validated timestamped feature windows; handles blur, low light, missing hands and invalid input; supports progress/cancellation; does not freeze the timer; matches its training manifest; passes deterministic and browser integration tests; and truthfully reports measured performance. Supabase writes, where enabled, are owner-scoped and never silently upload video frames.

## Agent run order
00. `00_REPOSITORY_AUDIT.md` — Repository audit and architecture reconciliation
01. `01_CONTRACTS_MANIFEST.md` — Typed contracts and feature manifest
02. `02_VIDEO_DECODING.md` — Video decoding and timestamp sampling
03. `03_PREPROCESSING_ROI.md` — Preprocessing, ROI and image quality
04. `04_MOTION_FEATURES.md` — Frame difference and motion statistics
05. `05_OPTICAL_FLOW.md` — Optional optical flow adapter
06. `06_HAND_LANDMARKS.md` — Optional hand landmarks and tracking
07. `07_WINDOW_AGGREGATION.md` — Timestamp windows and feature aggregation
08. `08_WORKERS_CANCELLATION.md` — Worker execution, progress and cancellation
09. `09_PIPELINE_ORCHESTRATION.md` — Vision pipeline and user-facing integration
10. `10_TRAINING_PARITY.md` — Python/browser feature parity
11. `11_SUPABASE_PRIVACY.md` — Supabase integration, privacy and failure semantics
12. `12_PERFORMANCE.md` — Browser profiling and performance budget
13. `13_TEST_SUITE.md` — Comprehensive automated regression tests
14. `14_FINAL_AUDIT.md` — Final audit, handoff and graduation evidence
