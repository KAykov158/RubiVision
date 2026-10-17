# RubiVision AI — Complete Supabase-Only Documentation and Development Plan

**2026-10-16 — Revised project specification.** This edition preserves the original non-database scope and replaces local persistence with Supabase PostgreSQL + Supabase Auth. **There is no IndexedDB/local database schema, durable offline outbox, or automatic offline synchronization.** Saving requires connectivity. Some preserved original passages describe superseded designs and are explicitly historical.

## Current architecture and precedence

# 11 — Supabase-only Architecture Decision and Precedence

**Decision (2026-10-16):** Supabase PostgreSQL is RubiVision AI's **only persistent application database** from the start. Supabase Auth is required. Optional Supabase Storage handles explicitly uploaded media. No IndexedDB database, no local database schema, no offline outbox or automatic offline synchronization.

## Precedence
This file, updated category 02, category 02A and `master prompts/17_SUPABASE_ONLY_IMPLEMENTATION_GUIDE.md` override **only contradictory storage, authentication, sync and deployment statements** in earlier historical project descriptions. All original non-storage features, research boundaries, graduation evidence requirements, UI functionality and future categories remain intact. Any older sentence describing IndexedDB as required or local-first persistence is **historical and not an implementation instruction**.

## Offline limitation
The timer can operate offline, but reliable persistence requires network access. Show cloud save status; never call an unsaved solve saved. Keep failed results in transient memory for retry/copy while tab remains open. User explicitly accepts potential loss on refresh/closure during outage.

## GitHub
Store source, docs, SQL migrations and non-sensitive fixtures in GitHub. Never store user solves, passwords, private videos or live environment secrets there.

## Category sequence
01 Foundation → 02 Supabase PostgreSQL schema → 02A Supabase Auth/RLS/integration → 03 scrambles → 04 timer → 05 sessions → 06 statistics → remaining categories.


# 12 — Supabase-only Architecture and Source Layout

## Architecture
React + TypeScript + Vite → feature services / typed repositories → Supabase JS client → Supabase Auth + PostgreSQL (RLS). Optional Supabase Storage for explicitly uploaded video. Python training/evaluation remains independent; trained browser-compatible inference assets are versioned and loaded by the web app.

## Suggested repository
```text
RubiVision/
  apps/web/src/
    app/                    # routes, providers, navigation
    features/
      auth/ timer/ scrambles/ sessions/ statistics/
      camera/ annotation/ analysis/ settings/
    shared/
      components/ domain/ repositories/ supabase/
  supabase/
    migrations/             # versioned PostgreSQL SQL
    seed.sql                # non-sensitive dev fixtures
    config.toml
  ml/
    data_prep/ features/ baselines/ training/ evaluation/
  tests/
    unit/ integration/ e2e/ security/
  docs/
  .env.example
```

## Boundaries
- `supabase/client.ts` constructs browser client with public configuration.
- `repositories/*` own persistence calls and convert Supabase rows into domain models.
- React UI and timer logic never issue direct database calls.
- All persistent data lives in Supabase PostgreSQL; no IndexedDB database.
- Camera recordings may exist as temporary user-selected local files, but not as a persistent application database; optional user-consented uploads use Supabase Storage.
- Python training datasets may be maintained in research files; this is not a second application database.

## Operational concerns
Network errors, server save acknowledgment, RLS, idempotent retries, migrations, generated TypeScript types, export/import, privacy and cross-device verification.


# 13 — Supabase Schema, RLS, Migrations and Type Safety

**Authoritative database:** Supabase PostgreSQL. No local schema.

## Schema design
See `prompts/02_database/02_Supabase_PostgreSQL_Schema.md` for table contracts. Define profile, settings, sessions, solves, recording metadata, annotation, model and experiment metadata with stable UUIDs, UTC timestamps and integer millisecond durations. Add optional/future tables when their feature is implemented.

## RLS
Enable RLS for each user-owned table. Write explicit policies for select, insert, update and delete using authenticated ownership. Validate child-row ownership, not merely the child row's own `owner_id`. Apply Storage policies before allowing uploads. Test unauthorized direct REST queries.

## Migrations
Keep SQL files in `supabase/migrations`, use CLI for local test database and staged deployments. Generate TypeScript types after schema changes. Avoid dashboard-only drift. Document backups and restore verification; managed cloud does not remove the need for export and recovery plans.

## No browser secrets
Only public URL and publishable/anon key in browser. Service-role keys, privileged tokens and any sensitive provider secrets belong server-side only.


# 14 — Cloud-only Save Failures, Connectivity and Recovery

**This replaces the earlier offline-outbox design. No local database or persistent outbox is required.**

## Required behavior
- Timer measurement uses browser monotonic clock and must not block on the network.
- After stop, present result immediately as `Unsaved` or `Saving`; insert into Supabase asynchronously.
- Only show `Saved` after server acknowledgement.
- For errors (offline, 401, 403, timeout, 429, 5xx), display actionable error, retain pending result **in memory for the current tab only**, offer retry and copy/download JSON of unsaved result.
- Use client-generated UUID and idempotent upsert or conflict-aware insert to prevent duplicate solves when retrying uncertain outcomes.
- If the tab closes or reloads before successful save, the unsaved solve can be lost; communicate this limitation.
- On login expiration, reauthenticate before retrying. Do not associate an unsaved result with the wrong account.
- Never promise offline-first behavior or background sync in docs/UI.

## Tests
Online save, connection interruption, timeout after server commit, retry with same ID, auth expiration, multi-device retrieval, refresh with no pending record, manual JSON export of failed save.


# 15 — Supabase-only Testing, Deployment and Operations

## Required testing
1. SQL migrations apply to clean Supabase environment.
2. Owner can CRUD their data; stranger and anonymous cannot, even via direct API requests.
3. Solve duration/penalty constraints and owner-consistent session FK are enforced.
4. Timer is monotonic and UI responsive while cloud request is pending.
5. Failed saves are visibly unsaved; retry uses same UUID and cannot duplicate records.
6. Signed-in second device loads previously committed solves and settings.
7. Import/export validates schema and ownership; no silent destructive overwrite.
8. Optional Storage upload requires consent and restrictive bucket policies.
9. Browser tests include keyboard/touch accessibility, mobile view and poor network.
10. Graduation demo has a known-good network and test account; prepare a clearly labeled recorded fallback demo if internet fails, not a claim of live cloud persistence.

## Operations
Use separate dev/prod Supabase projects, environment variables, migrations, quota/billing monitoring, database backups/export and documented restore rehearsal. GitHub hosts source and migrations, never user data or secrets.


# 17 — Supabase-only Implementation Guide (New)

## Firm design choice
The application uses **Supabase PostgreSQL as its sole persistent database**. Supabase Auth handles identity. There is **no IndexedDB schema, offline outbox, local repository, local schema migration or automatic sync worker**. Users need an internet connection to save reliably; timer itself can measure offline.

## Setup checklist
1. Create development Supabase project and configure local Supabase CLI environment.
2. Commit `.env.example` listing `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (or supported anon key) without real secrets.
3. Implement versioned SQL migrations in `supabase/migrations` and generate TypeScript DB types.
4. Build auth UI and session handling, then typed cloud repositories.
5. Enable/test RLS and cross-account foreign-key ownership.
6. Integrate timer with save-status UI and idempotent retry.
7. Verify login from a second device retrieves the same solves.
8. Keep JSON backup/export and documented cloud recovery procedures.
9. Add optional Supabase Storage only after privacy, upload consent and RLS/storage policy review.
10. Keep Python AI training/evaluation workflow, baseline metrics and graduation evidence unchanged.

## Risks accepted
- Offline saves are not durable; app must communicate failure and offer immediate copy/export.
- Cloud outages and quotas affect saving and retrieval.
- RLS and auth add implementation complexity; tests must be part of acceptance gates.

## Category map
01 Foundation; 02 Supabase schema; 02A Supabase Auth/integration; 03 puzzles; 04 timer; 05 sessions; 06 stats; 07 camera; 08 annotation; 09 CV features; 10 AI dataset/training; 11 inference; 12 insights; 13 experiments; 14 settings/export/privacy; 15 quality/security; 16 graduation release; 17–18 verified moves and algorithms; 19–26 advanced vision/optimization/coaching; 27–29 optional scanner/smart cube/challenges.


# Original full project vision and graduation requirements (historical local-storage descriptions superseded)

> **CURRENT SUPABASE-ONLY DECISION:** Historical local-first sections below are retained as original project context, **not current implementation requirements**. For authoritative architecture see master 11/12/13/14/17 and updated 02/02A. All non-storage functionality is retained.

# RubiVision AI
## Comprehensive Project Concept, Technical Design, Graduation Alignment and Long-Term Research Roadmap

**Document type:** Product vision, feasibility analysis, software requirements, system architecture, AI research plan and graduation-project preparation guide  
**Version:** 2.0 — 15 October 2026  
**Status:** Planned system; this document does **not** claim that the application, datasets, trained model, results or experiments already exist.  
**Proposed diploma title (Bulgarian):** „RubiVision AI – уеб платформа за анализ на решаване на куб на Рубик чрез компютърно зрение и машинно обучение“  
**Proposed English title:** “RubiVision AI: A Web-Based Speedcubing Training Platform with Computer Vision and Machine Learning”  
**Profession:** 481040 „Програмист на изкуствен интелект“  
**Specialty:** 4810401 „Програмиране на изкуствен интелект“  
**Project owner, supervisor, school and submission date:** To be filled in after approval of the individual assignment.

> **Reading guide:** Sections 1–20 describe the planned product and technical implementation. Sections 21–25 cover graduation evidence and preparation. Sections 26–29 cover future research, risks, decisions and references. This is a **design and documentation baseline**, not a final diploma report containing fabricated implementation results.

---

## Contents

1. Executive summary
2. Motivation, problem statement and user needs
3. Proposed solution and distinctive contribution
4. Project objectives and measurable success criteria
5. Scope: graduation product, bridge features and ultimate vision
6. Users, scenarios and user experience
7. Functional requirements and feature catalogue
8. Timer, inspection, puzzles and scrambles
9. Database, persistence, sessions and statistics
10. Camera recording, video import and annotation
11. Computer vision and machine-learning pipeline
12. Dataset construction, consent and labeling
13. Model evaluation, experimental design and scientific integrity
14. Training insights and meaningful feedback
15. Architecture and technology decisions
16. Domain model, contracts and data provenance
17. User interface, accessibility and offline operation
18. Security, privacy, ethics and licensing
19. Quality assurance, testing and performance
20. Development roadmap, dependencies and acceptance gates
21. Alignment with Bulgarian qualification standard and diploma guidance
22. Suggested diploma-project structure and evidence
23. Demonstration, defense and examiner questions
24. Practical deliverables and reproducibility checklist
25. Project management, estimates and fallback strategy
26. Ultimate goal: automatic move recognition and state reconstruction
27. Ultimate goal: method-specific optimization and coaching
28. Limitations, research questions and unresolved decisions
29. References, glossary and appendices

---

# 1. Executive summary

**RubiVision AI** is an offline-first speedcubing practice and analysis platform for people solving physical twisty puzzles. The immediate product combines a reliable timer, scrambles for 2×2×2 through 7×7×7, persistent solve sessions, statistical progress tracking, camera recording and imported-video analysis. Its principal graduation-level AI task is to classify short intervals of a 3×3 solve recording as **MOVEMENT**, **PAUSE** or **UNCERTAIN**, visualize the classification on a synchronized timeline, and evaluate a trained model against a reproducible non-ML baseline.

The purpose is not merely to time a solve. It is to help a cuber identify when a solve is interrupted by hesitation, review those moments and measure whether training reduces them. The first release is useful even when it cannot identify exact cube turns.

The **ultimate goal** is a significantly more ambitious camera-based coach: detect physical turns and hand gestures, track the orientation and state of the cube, reconstruct the performed move sequence, recognize method stages (beginning with CFOP), and suggest alternative solutions suited to the user's method, skills and ergonomics. Ordinary single-camera video creates major challenges, including hidden stickers, hand occlusion, motion blur, fast turns and ambiguous rotations. Consequently this capability is a research roadmap, **not a graduation dependency**.

The project deliberately separates a verified source of truth (user-entered or smart-cube moves) from uncertain camera predictions. The same timeline and data model can later combine video, exact moves, cube state and personalized advice without replacing the initial application.

# 2. Motivation, problem statement and user needs

## 2.1 Context

Speedcubers usually measure solve time and track averages. A total time alone, however, does not reveal why a particular attempt was slower. A solve may lose time because of poor recognition, interrupted lookahead, unnecessary regrips, slow execution or difficult transitions between solving stages. A normal stopwatch cannot distinguish these causes.

Video replay helps, but manually scrubbing through many recordings is tedious. A more useful training tool should organize the data, connect the video to the solve record, locate likely pauses and allow the user to investigate them.

## 2.2 Problem definition

**Core graduation problem:** Given a video of a 3×3 solve, identify intervals of visible movement and inactivity reliably enough to support review, and quantify the model's limitations on previously unseen recordings.

**Long-term research problem:** Given a time-ordered camera stream and an initial cube state, infer the sequence of legal cube turns and maintain an internally consistent cube state, then derive useful, method-aware recommendations.

These are different technical tasks. Solving the first does **not** imply that the second has been solved.

## 2.3 Target users

- **Beginners:** Need accessible practice, reliable timing and understandable progress.
- **Intermediate speedcubers:** Want averages, session trends, pause review and stage timing.
- **Advanced cubers:** Eventually want exact move reconstruction, algorithm comparison and ergonomic coaching.
- **Teachers/examiners:** Need a runnable project, demonstrable own code, dataset provenance, experiments, tests and a clear explanation of limitations.
- **Researchers/developers:** May later use consented labeled recordings to evaluate gesture and turn-recognition methods.

## 2.4 User problems addressed

| Problem | Graduation solution | Future solution |
|---|---|---|
| Unreliable or scattered timing history | High-resolution timer, local sessions and backup | Cross-device sync (optional) |
| No visibility into progress | Averages, distributions, trends | Personalized training goals |
| Hard to find hesitation in a recording | AI-labeled video timeline | Automatic mapping to solve stages |
| Difficult to quantify execution versus pauses | Movement/pause statistics with uncertainty | Per-move execution and TPS from verified moves |
| Unknown inefficient algorithms | Manual stage review only | Verified move replay and method-aware alternatives |
| Difficult to analyze cube state | Not claimed from video | State reconstruction with error detection |

# 3. Proposed solution and distinctive contribution

RubiVision has four layers:

1. **Speedcubing application:** Timer, scramble, solve history, statistics and settings.
2. **Video observation:** Camera or imported footage, synchronization, manual labels and video playback.
3. **Machine-learning experiment:** Frame/landmark-derived features, a simple baseline, a trained classifier, held-out evaluation and browser inference.
4. **Future cube intelligence:** Verified move events, cube engine, camera turn recognition, state reconstruction and optimization.

The graduation-level original contribution should be the **end-to-end design and implementation of the data-to-insight pipeline**: data acquisition, annotation, preprocessing, feature engineering, baseline comparison, training, evaluation, browser integration and honest reporting. Third-party libraries are permitted as tools; they must not replace the student's own integration logic, experiments and understanding.

# 4. Objectives and measurable success criteria

## 4.1 Graduation objectives

**G1. Functional product.** The application runs locally and provides timing, scrambles, sessions, statistics and export/restore without requiring accounts.

**G2. Reproducible video analysis.** The application accepts an authorized recording, produces a time-aligned feature sequence and labels intervals using a versioned classifier.

**G3. Original ML work.** The student assembles a consented labeled dataset, implements a baseline and trains at least one classifier.

**G4. Credible evaluation.** The same held-out evaluation split is used for baseline and trained model. Report class-specific precision/recall/F1, macro F1, confusion matrix, boundary error, uncertainty behavior and processing latency.

**G5. Meaningful user benefit.** The user can navigate detected pauses and compare hesitation patterns across solves; manual annotations may supplement, but are not presented as automatic method recognition.

**G6. Reproducible defense.** An examiner can start the app, reproduce representative analyses and understand what is student-authored, what is library-provided and where the system fails.

## 4.2 Acceptance thresholds

No accuracy percentage should be invented before experiments. Instead, establish **pre-registered targets** in the individual project plan and measure actual results. Example engineering targets (proposed, not guaranteed): no lost solve records during normal operation; reproducible test/build; timeline timestamps remain within a measured synchronization tolerance; inference completes within a declared latency budget on a specified test machine; the model is compared fairly with baseline and limitations are documented even if the trained model does not win.

## 4.3 Ultimate-goal research criteria

Separate measurable goals for turn recognition, full-sequence reconstruction, state legality, recovery after missed turns, performance at increasing TPS, robustness to lighting and occlusion, method-stage detection and coaching quality. Do not equate frame classification accuracy with solve reconstruction accuracy.

# 5. Scope and release boundaries

| Capability | Graduation release | Bridge release | Ultimate research |
|---|---|---|---|
| 2×2–7×7 timer and scrambles | Required product target | Maintain | Maintain |
| Inspection, +2/DNF and configurable timer | Required | Maintain | Maintain |
| IndexedDB, sessions and statistics | Required | Maintain | Maintain |
| Recording and video import | Required | Maintain | Maintain |
| Manual video interval annotation | Required for data workflow | Maintain | Maintain |
| Movement/pause/uncertain classifier | Required AI contribution | Improve | Supporting signal |
| Manual Cross/F2L/OLL/PLL markers | Useful graduation feature | Maintain | Compare to auto labels |
| AI evaluation report | Required | Extend | Extend |
| Verified move entry, cube engine and replay | Not required for graduation | Required | Foundation |
| Exact camera turn recognition | Excluded | Research preparation | Main goal |
| Automatic cube-state tracking | Excluded | Research preparation | Main goal |
| CFOP/Roux/ZZ method-specific optimization | Excluded | CFOP prototype | Main goal |
| Gamification and daily challenge | Optional | Optional | Optional |
| Accounts, public leaderboards and cloud | Optional | Optional | Optional |

**Scope regulation:** If the graduation deadline approaches, protect the trained/evaluated AI pipeline, runnable app and defense evidence. Reduce decorative features before sacrificing experiments.

# 6. Users, scenarios and user experience

## 6.1 Primary workflow

1. The user opens RubiVision and selects 3×3.
2. The application displays a valid scramble and allows inspection if enabled.
3. The user starts the timer with keyboard or touch controls and solves the cube.
4. The completed solve is saved in the selected session with time, scramble and optional penalty.
5. The user optionally records the attempt or imports an existing video.
6. The video is linked to the solve using explicit start/end anchors and inspected for alignment.
7. The analysis runs locally, generating movement/pause/uncertain segments.
8. The timeline highlights possible hesitation and allows click-to-seek playback.
9. The user may manually mark Cross/F2L/OLL/PLL boundaries.
10. The dashboard shows verified timing metrics, AI-derived estimates and trends separately.

## 6.2 Other scenarios

- User declines camera permission: timer and statistics remain fully functional.
- User imports unsupported media: a clear error is shown; existing data remain safe.
- User uses a slow laptop: analysis processes sampled frames or a lower resolution and reports progress.
- User changes a solve penalty: all dependent statistics update correctly.
- User deletes a video: linked metadata and analyses are handled consistently; the user sees what will be removed.
- User has insufficient storage: the app warns and avoids partially saved media.
- User exports data: schema/version metadata are included; restore validates input before committing.

# 7. Functional requirements and feature catalogue

The chronological specification pack has 29 feature categories. The graduation release uses categories 01–16, the verified-move bridge uses 17–18, automatic camera research uses 19–26, and optional extensions use 27–29.

| ID | Category | Purpose | Phase |
|---|---|---|---|
| 01 | Foundation and UI | App shell, navigation, design system, routing | Graduation |
| 02 | Database | IndexedDB schema, repositories, migrations, integrity | Graduation |
| 03 | Puzzles and scrambles | 2×2–7×7 puzzle events and valid scrambles | Graduation |
| 04 | Timer | State machine, inspection, penalties, inputs | Graduation |
| 05 | Solve sessions | CRUD, session management, filtering and provenance | Graduation |
| 06 | Statistics | Averages, rolling results, trends and penalties | Graduation |
| 07 | Camera | Permissions, recording, synchronization | Graduation |
| 08 | Video import and annotation | Playback, labeling, aligned intervals | Graduation |
| 09 | Vision features | Frame sampling, image/motion features, quality flags | Graduation |
| 10 | Dataset and training | Labels, baseline, model training, split discipline | Graduation |
| 11 | Inference | Versioned browser predictions and confidence | Graduation |
| 12 | Training insights | Pauses, manual stages and progress comparison | Graduation |
| 13 | Experiment reporting | Held-out metrics and baseline comparison | Graduation |
| 14 | Settings and backup | Preferences, export/import, privacy controls | Graduation |
| 15 | Quality and security | Tests, accessibility, performance and data safety | Graduation |
| 16 | Graduation release | Installation, demo, technical report and defense | Graduation |
| 17 | Verified moves | Notation parser, cube simulator and replay | Bridge |
| 18 | Algorithm library | Method tags, algorithm storage and verification | Bridge |
| 19 | Turn/gesture dataset | Labeled turns, hand motion, difficult cases | Research |
| 20 | Cube/hand observation | Landmarks, face colors, orientation hypotheses | Research |
| 21 | Move recognition | Temporal classification of face turns | Research |
| 22 | State reconstruction | Cube-state update, consistency, recovery | Research |
| 23 | Method segmentation | CFOP stages, later Roux/ZZ | Research |
| 24 | Solve optimization | Alternative verified solutions | Research |
| 25 | Personalized coaching | User-specific constraints and training advice | Research |
| 26 | Real-time pipeline | Low-latency integrated tracking | Research |
| 27 | Scanner/solver | Sticker scanning and legal-state validation | Optional |
| 28 | Smart cube/cloud | Verified Bluetooth events, optional sync | Optional |
| 29 | Daily challenges | Daily scramble, streaks, achievements | Optional |

# 8. Timer, inspection, puzzles and scrambles

## 8.1 Supported puzzles

The graduation product target supports standard cube sizes **2×2×2, 3×3×3, 4×4×4, 5×5×5, 6×6×6 and 7×7×7** for scramble generation, timing, history and statistics. **3×3** is the primary AI dataset and evaluation event. Do not imply that an AI model trained on 3×3 footage generalizes to larger cubes.

## 8.2 Timer state machine

Proposed states: `IDLE`, `INSPECTION`, `ARMING`, `READY`, `RUNNING`, `STOPPED`, `SAVING` and `ERROR`. The exact implementation may simplify these names but must preserve transitions and tests.

- Use a monotonic high-resolution time source for durations, not wall-clock differences.
- Start and stop only on valid input transitions; ignore key repeats and duplicate touch events.
- Configurable hold-to-ready period and visible ready state.
- Keyboard Space support; touch support for mobile; prevent scrolling and accidental stop behavior.
- Optional inspection with audible/visual warnings and clearly defined thresholds.
- Practice modes may differ from competition rules; do not claim official WCA certification.
- +2, DNF, manual edit and deletion must be supported without corrupting the original recorded duration.
- Handle visibility changes, lost focus, suspended tabs, device sleep and refresh conservatively.
- Display precision is configurable; stored duration remains in milliseconds.
- New scrambles should not silently replace the scramble associated with a recorded solve.

## 8.3 Inspection and competition rules

The timer should offer a WCA-style inspection mode with warnings and the relevant +2/DNF thresholds. The **current official WCA regulations must be checked during implementation**; the project must distinguish “competition-style practice” from an officially approved competition timer. Rules may vary by event and change over time. Inspection can also be disabled for free practice.

## 8.4 Scramble requirements

Each puzzle has a puzzle-specific scramble generator or validated provider, clear notation and appropriate event handling. Generation should avoid obviously invalid move sequences and support reproducible saved scrambles. Larger-cube notation and wide moves require separate tests. A saved solve references the **exact scramble string and puzzle code** used.

# 9. Database, persistence, sessions and statistics

## 9.1 Why a dedicated database module exists

A reliable training application cannot treat solve history as incidental UI state. It needs durable, versioned persistence, integrity rules, storage quota handling, backup and migration. The graduation architecture uses **IndexedDB** for structured records; large video blobs may be stored through a browser-supported media storage adapter (for example IndexedDB blobs or OPFS), with capability detection and graceful fallback.

## 9.2 Proposed entities

| Entity | Key fields | Notes |
|---|---|---|
| `PuzzleEvent` | code, name, notation | 222–777 |
| `Session` | id, puzzleCode, name, createdAt | One or more sessions per event |
| `Solve` | id, sessionId, puzzleCode, scramble, rawDurationMs, penalty, createdAt | Preserve raw and effective time distinction |
| `VideoAsset` | id, solveId?, mimeType, durationMs, storageLocator, consentState | Large binary storage separate from index |
| `TimelineAnchor` | id, solveId, videoId, videoMs, solveMs, anchorType | Sync/re-sync |
| `Annotation` | id, videoId, startMs, endMs, label, annotator, version | Human ground truth |
| `FeatureRun` | id, videoId, extractorVersion, parameters, qualityFlags | Derived artifact |
| `ModelManifest` | id, modelVersion, featuresVersion, classes, provenance | Compatibility |
| `PredictionRun` | id, videoId, modelVersion, confidencePolicy | Versioned output |
| `PredictionSegment` | runId, startMs, endMs, label, confidence | Predicted, never silently ground truth |
| `StageMarker` | id, solveId, stageName, timeMs, source | Manual or future verified |
| `Settings` | key, value, schemaVersion | Per-user local preferences |
| `MoveEvent` | id, solveId, notation, startMs?, endMs?, source, confidence? | Bridge/future |
| `CubeStateSnapshot` | id, solveId, moveIndex, stateEncoding, validity | Bridge/future |
| `ExperimentRun` | id, datasetVersion, splitVersion, modelVersion, metrics | Reproducible evidence |

Relationships must be validated. Deletion of a solve must have explicit behavior for associated videos, analyses and annotations; never silently delete unrelated shared media.

## 9.3 Persistence rules

- Stable UUIDs and schema versioning; migrations are tested against old databases.
- UTC timestamps for records; monotonic milliseconds for solve/video offsets.
- Transactions for logically atomic operations.
- No silent overwriting of annotations, original times or model results.
- Export format is versioned and validated; malformed imports fail safely.
- Backups explain whether video files are included or require a separate archive.
- Storage quota warnings and user-controlled cleanup.
- Explicit distinction between `rawDurationMs`, penalty and effective/statistical result.

## 9.4 Statistics

Provide current/mean/median/best/worst, recent trend and event/session filtering. Include **ao5**, **ao12** and larger rolling averages as appropriate, with correctly documented DNF and +2 handling. Where a statistic follows WCA conventions, implement and test that convention; where it is a custom training metric, label it clearly. Provide graphs without hiding sample size or uncertainty.

# 10. Camera recording, video import and annotation

## 10.1 Recording

Camera access is requested only after a user action. The user chooses an available device and can preview framing. Recording must show a clear state, permission status, elapsed recording duration and stop control. Camera recording must not block the timer if unavailable.

Capture metadata include approximate frame rate, resolution, codec/container, orientation and device constraints when available. Browser recording behavior varies; never promise identical format support on all platforms.

## 10.2 Synchronization

A timer timestamp and a video timestamp are different clocks. Store explicit anchors (such as timer start corresponding to a video position), avoid assuming video begins exactly when the timer begins, and expose manual alignment adjustment. Measure drift on representative recordings. Synchronization confidence affects any claimed timing precision.

## 10.3 Video import

Import local videos with file-size and supported-format checks, preview and explicit confirmation. Provide progress and recoverable errors. Keep originals intact. Decode in a bounded way so long videos do not exhaust memory. Imported video should work even if camera access is denied.

## 10.4 Annotation interface

A human annotator selects a time range and labels it `MOVEMENT`, `PAUSE` or `UNCERTAIN`. Support timeline zoom, keyboard navigation, boundary adjustment, review, export and import. Record label definitions and annotator/source. Overlapping intervals require an explicit policy; gaps must not be silently treated as PAUSE.

Manual stage labels (Cross/F2L/OLL/PLL) are a **different annotation type** from movement labels. They are not automatic CFOP predictions.

# 11. Computer vision and machine-learning pipeline

## 11.1 Technical objective

Given a sampled sequence of frames or image-derived features from a 3×3 solve video, estimate the interval class: movement, pause or uncertain. This is **activity segmentation**, not recognition of `R`, `U`, `F` or other exact moves.

## 11.2 Candidate feature extraction

- Frame-to-frame pixel difference or optical-flow magnitude.
- Edge and texture change within a user-defined or automatically detected region of interest.
- Motion energy aggregated over short windows.
- Optional hand-landmark displacement and visibility, where supported.
- Optional cube-region displacement or stabilization features.
- Quality indicators: blur, lighting variation, occlusion, missing landmarks and dropped frames.
- Temporal context: windowed mean, variance, percentiles and adjacent-window differences.

Features must be defined identically for training and browser inference. If optional landmark tracking fails, the system should fall back to supported features or report incompatibility, not invent values.

## 11.3 Baseline

Implement a non-ML threshold or motion-energy heuristic with documented thresholds and smoothing. Tune parameters on training/validation data only. This baseline is essential: it tests whether training a classifier actually improves the task.

## 11.4 Candidate trained model

A **Random Forest** or another interpretable classifier is a reasonable initial choice for tabular motion features. Other candidates include logistic regression, gradient boosting or a small temporal model if the dataset justifies it. Model selection is an experiment, not a guarantee of superior accuracy.

Training can be performed in Python using NumPy/pandas/scikit-learn or equivalent tools. The resulting model must have a documented export/inference strategy for the browser (for example a supported portable representation, a compatible JavaScript runtime or a reproducible model-to-rule conversion). **A Python pickle file is not directly runnable in a browser.**

## 11.5 Inference stages

```text
Video file or camera recording
          |
          v
Decode and timestamp frames
          |
          v
Region selection / stabilization / quality checks
          |
          v
Feature extraction with versioned parameters
          |
          v
Baseline or trained model
          |
          v
Per-window scores and uncertainty
          |
          v
Temporal smoothing and segment boundaries
          |
          v
Video timeline + pause statistics + provenance
```

Postprocessing must not hide all uncertain windows merely to make the timeline look cleaner. Report low-confidence segments and allow the user to inspect the underlying footage.

# 12. Dataset construction, consent and labeling

## 12.1 Collection protocol

Record multiple independent 3×3 solves under a documented camera protocol: camera placement, lighting, distance, resolution, frame rate, puzzle and hand visibility. Capture variation deliberately rather than relying on a single perfectly controlled video. If other participants contribute, obtain appropriate consent; for minors, use school-approved consent procedures.

## 12.2 Labeling policy

Define classes operationally:

- **MOVEMENT:** Visible hand/cube motion relevant to the solve exceeds the labeling definition.
- **PAUSE:** A meaningful interval without relevant solving motion.
- **UNCERTAIN:** Occlusion, ambiguous motion, video degradation or insufficient evidence.

A brief finger adjustment is not automatically a cube turn. A stationary cube does not always mean the solver is mentally paused; labels describe visible evidence, not mental state.

## 12.3 Dataset manifest

Track recording ID, participant pseudonym, session ID, camera/setup, capture date, video properties, consent status, labeling version, annotation intervals and exclusion reasons. Keep raw videos and derived features traceable, but avoid including identifiable personal data in public sample datasets without permission.

## 12.4 Leakage-safe splitting

Split by **participant or recording session**, not by random neighboring frames. Frames from the same solve are strongly correlated; placing adjacent windows in train and test creates an inflated estimate. Document the split before reporting metrics and do not tune on the held-out test set.

## 12.5 Data quality

Check class balance, label agreement where feasible, timestamp validity, missing features, lighting and camera diversity. Maintain a small set of difficult failure cases. Never manufacture labels or report hypothetical test performance as real evidence.

# 13. Model evaluation and experimental design

## 13.1 Research questions

- Does a trained classifier outperform a tuned motion-threshold baseline on unseen recordings?
- Which classes are hardest to identify?
- How accurately are pause boundaries localized?
- How sensitive is performance to lighting, camera angle, occlusion and solving speed?
- Can the model run within a practical browser latency budget?

## 13.2 Metrics

| Metric | Meaning | Reporting requirement |
|---|---|---|
| Precision per class | Correct predictions among predicted instances | All three classes |
| Recall per class | Correctly found instances among true instances | All three classes |
| F1 per class | Harmonic mean of precision and recall | All three classes |
| Macro F1 | Average class F1, equal class weight | Main summary metric |
| Confusion matrix | Pattern of class errors | Counts, not just percentages |
| Pause boundary error | Distance between predicted and labeled boundaries | Define matching/tolerance rule |
| Segment-level score | Whether contiguous events are correctly found | Optional, strongly recommended |
| Processing latency | Decode/feature/inference wall time | Device and video size specified |
| Uncertain coverage | How often model abstains | Report with accuracy tradeoff |

Include dataset counts, recording counts, participants, split protocol, preprocessing versions, random seeds, hyperparameters and machine details. Compare baseline and trained model on the **same held-out examples**.

## 13.3 Results integrity

The final diploma report must contain measured values only after implementation. If the trained model underperforms, report it and analyze why; a failed hypothesis can still be a valid and educational experiment. Do not claim a model recognizes exact cube moves because it distinguishes activity and pauses.

# 14. Training insights and meaningful feedback

The first release can provide real value without pretending to reconstruct moves:

- Jump to likely hesitation moments in the recording.
- Show total detected pause duration and its share of the solve, with uncertainty.
- Compare hesitation metrics across sessions and similar puzzle types.
- Allow manual Cross/F2L/OLL/PLL stage boundaries and stage-specific timing.
- Separate manually measured stage time from automatically estimated movement intervals.
- Show quality warnings when camera conditions undermine conclusions.
- Encourage targeted practice based on observed patterns, not unverifiable claims.

**Example (illustrative, not measured):** “In this 20.0-second solve, 3.2 seconds were classified as pauses. The longest candidate pause occurred around 9.1 seconds. Review that interval.”  
**Not allowed in graduation mode:** “Your F2L algorithm used 11 moves instead of 8,” unless verified move/state evidence is available.

# 15. Architecture and technology decisions

## 15.1 Proposed technology stack

| Layer | Proposed technology | Rationale |
|---|---|---|
| Frontend | React + TypeScript + Vite | Modular browser application |
| UI | Accessible component system and CSS | Responsive timer and timeline |
| Structured local database | IndexedDB with a typed repository layer | Offline-first, versioned records |
| Media storage | Browser-supported blob/OPFS adapter | Large local video assets |
| Timer | `performance.now()`-based state machine | Monotonic elapsed timing |
| Video | MediaDevices/MediaRecorder, HTML video and frame extraction | Browser-native recording/playback |
| Vision | OpenCV-like algorithms / optional landmark library | Motion features |
| Training | Python, scikit-learn and reproducible scripts | Transparent classical ML experiment |
| Browser inference | Versioned JS-compatible model adapter | Local analysis without server |
| Tests | Unit, integration, browser end-to-end | Regressions and quality |
| Version control | Git | Traceable student-authored work |

The stack is a **proposal**. The school or supervisor may impose technology requirements. Prefer stable browser capabilities and verify actual support on target devices.

## 15.2 Layered design

```text
┌───────────────────────────────────────────────────────────────┐
│ UI: Timer · Sessions · Statistics · Video · Analysis · Settings│
├───────────────────────────────────────────────────────────────┤
│ Application services: timing, scrambles, recording, annotation │
│ analysis orchestration, insights, import/export                │
├───────────────────────────────────────────────────────────────┤
│ Domain contracts: Solve, Session, Video, Segment, Move, State  │
├───────────────────────────────────────────────────────────────┤
│ Adapters: IndexedDB · Media · Vision · Model · Export          │
├───────────────────────────────────────────────────────────────┤
│ Future adapters: Camera-turn model · Smart cube · Cloud       │
└───────────────────────────────────────────────────────────────┘
```

Heavy video work should run in workers where feasible. The timer must not depend on analysis completion. Optional features must not destabilize the core solve workflow.

## 15.3 Suggested repository layout

```text
rubivision/
├── apps/web/src/
│   ├── app/
│   ├── features/timer/
│   ├── features/scrambles/
│   ├── features/sessions/
│   ├── features/statistics/
│   ├── features/video/
│   ├── features/annotations/
│   ├── features/analysis/
│   ├── features/settings/
│   └── shared/
├── packages/domain/
├── packages/database/
├── packages/cube-engine/             # future
├── ml/
│   ├── data-manifests/
│   ├── labeling/
│   ├── features/
│   ├── baselines/
│   ├── training/
│   ├── evaluation/
│   └── exported-models/
├── tests/
├── docs/
│   ├── architecture/
│   ├── experiments/
│   ├── diploma/
│   └── feature-specifications/
└── README.md
```

This is an illustrative structure, not a requirement to adopt a monorepo immediately.

# 16. Domain model, contracts and data provenance

## 16.1 Representative TypeScript contracts

```ts
type PuzzleCode = "222" | "333" | "444" | "555" | "666" | "777";
type Penalty = "NONE" | "PLUS_TWO" | "DNF";
type ActivityLabel = "MOVEMENT" | "PAUSE" | "UNCERTAIN";
type EvidenceSource =
  | "manual" | "model" | "verified-moves"
  | "smartcube" | "camera-estimate";

interface Solve {
  id: string;
  sessionId: string;
  puzzleCode: PuzzleCode;
  scramble: string;
  rawDurationMs: number;
  penalty: Penalty;
  createdAtUtc: string;
  videoId?: string;
}

interface ActivitySegment {
  startMs: number;
  endMs: number;
  label: ActivityLabel;
  source: "manual" | "model";
  confidence?: number;
  analysisVersion: string;
}

interface MoveEvent {
  notation: string;
  startMs?: number;
  endMs?: number;
  source: "manual" | "verified-moves" | "smartcube" | "camera-estimate";
  confidence?: number;
}
```

These are **design examples**. The final implementation needs runtime validation, stable migrations and stronger invariants.

## 16.2 Trust hierarchy

- **Raw recording:** Source media, but not inherently ground-truth move labels.
- **Manual annotation:** Human-labeled evidence with annotator and protocol.
- **Verified move sequence:** Explicit move sequence validated by cube-state logic.
- **Smart-cube events:** Instrumented evidence subject to connection and calibration errors.
- **Camera-estimated move:** Probabilistic prediction, never automatically treated as verified.
- **Derived insight:** Traceable to a specific analysis version and its evidence.

The UI should visibly distinguish predictions from verified data. Never silently overwrite human labels with model predictions.

# 17. User interface, accessibility and offline operation

The primary navigation should make Timer, Sessions, Statistics, Video Analysis and Settings immediately discoverable. Advanced modules appear only when available. The timer should use large readable digits, strong focus states, keyboard and touch support, and controls that are usable under different lighting conditions.

The analysis view should show the video and a synchronized timeline with movement, pause and uncertain intervals, legend, seek controls, zoom and annotation tools. Colors alone must not communicate state; use labels or patterns as well.

The offline-first requirement means that timing, history, statistics, locally stored media and locally bundled inference assets can operate without a server once the application is installed/loaded. Do not promise complete offline operation unless all needed assets are cached and tested. Explain browser storage eviction and recommend backups.

# 18. Security, privacy, ethics and licensing

## 18.1 Camera and recording privacy

- Request camera permission explicitly; stop tracks when no longer needed.
- Prefer local processing; no upload without an explicit user choice.
- Provide deletion and export controls, with clear scope.
- Do not embed private videos or personal identifiers in public Git repositories.
- Use pseudonyms and consent records for research participants.
- Where minors participate, follow school-approved guardian/participant consent procedures.
- Treat footage as potentially identifiable personal data.

## 18.2 AI ethics and transparency

Describe the model's training population, limitations, uncertainty and potential failure modes. Avoid false claims about internal mental states (“you were thinking”) based only on visible motion. Explain what the model sees and what it cannot know. Give the user control over correcting or discarding an analysis.

## 18.3 Software security

Validate imports, sanitize text, avoid arbitrary code execution in data files, use safe browser permissions, maintain dependency updates, and test quota and migration failure. If cloud sync is introduced later, add authentication, authorization, encryption in transit, retention policies and account deletion.

## 18.4 Intellectual property and attribution

List all external libraries, models, datasets and their licenses. Clearly distinguish original student code from dependencies and AI-assisted code. Do not copy third-party algorithms or example code without attribution and license compliance.

# 19. Quality assurance, testing and performance

## 19.1 Test matrix

| Area | Required checks |
|---|---|
| Timer | State transitions, repeated keys, inspection boundaries, focus loss, sleep, save-once |
| Scrambles | Puzzle-specific notation, persistence, regeneration, 2×2–7×7 coverage |
| Database | CRUD, migrations, malformed data, transactional failure, quota, backup |
| Statistics | +2, DNF, ao5/ao12, small sample sizes, deletion recalculation |
| Recording | Permission denied, device disconnect, stop, video format, resource cleanup |
| Video sync | Start offset, duration mismatch, variable frame rate, drift |
| Annotation | Invalid intervals, overlaps, export/import, undo and boundary edits |
| ML | Leakage-safe splits, reproducibility, baseline parity, metric correctness |
| Inference | Feature/model version mismatch, uncertainty, performance, bad input |
| UI | Keyboard navigation, mobile layout, color contrast, screen reader labels |
| Release | Clean install, offline test, deployment paths, demo on target machine |

## 19.2 Performance approach

Profile frame decoding, image feature extraction and inference separately. Process video incrementally, avoid retaining unnecessary full-resolution frames, release media resources, and report actual test hardware. Use representative low-end and midrange machines. A powerful GPU may help research, but is not a requirement for a small classical-ML classifier.

# 20. Development roadmap, dependencies and acceptance gates

## Gate A — Working speedcubing foundation

**Categories 01–06.** Build UI, database, scrambles, timer, sessions and statistics. Exit when a user can time and persist a solve, reload the page, recover history and view correct rolling statistics.

## Gate B — Video and labeled dataset

**Categories 07–10.** Record/import footage, align timestamps, label intervals, extract versioned features and train baseline/model. Exit when a reproducible training run exists with documented data provenance.

## Gate C — User-facing AI and graduation release

**Categories 11–16.** Browser inference, training insights, evaluation dashboard, backup/privacy, tests, technical documentation and deployment. Exit when the product can be demonstrated reliably and experimental results can be reproduced.

## Gate D — Verified-move bridge

**Categories 17–18.** Notation parser, 3×3 state simulator, verified move replay and method-tagged algorithm library. Exit when known move sequences produce legal and testable cube states. This is a foundation for future coaching, not a camera-recognition claim.

## Gate E — Camera research

**Categories 19–22.** Gather labeled turn/gesture data, estimate hand/cube observations, recognize moves and reconstruct states with confidence and recovery. Begin with controlled, slow solves. Report per-turn accuracy and whole-sequence success separately.

## Gate F — Coaching and real-time integration

**Categories 23–26.** Method segmentation, verified-state alternative solutions, personalized advice and low-latency tracking. Do not optimize a guessed state as if it were certain.

## Gate G — Optional extensions

**Categories 27–29.** Scanner/solver, smart-cube/cloud and daily challenges. These are not prerequisites for the diploma defense.

# 21. Alignment with Bulgarian qualification standard and diploma guidance

## 21.1 Authoritative and supplied materials

The supplied official source is **Наредба № 6 от 7 април 2022 г.**, effective 19 April 2022, establishing the state educational standard for profession **481040 „Програмист на изкуствен интелект“** and specialty **4810401 „Програмиране на изкуствен интелект“**, third qualification degree. Its published standard includes learning outcomes for **ЕРУ 9: Моделиране на знания и проектиране на бази от знания**, **ЕРУ 10: Машинно обучение**, and **ЕРУ 12: Обработка на изображения и разпознаване на образи**.

The user also supplied **„Указания за разработване на дипломен проект“**. Those guidelines describe a theoretical/practical project, originality, data handling, evaluation, reproducibility, defense and a recommended written structure. The guidelines themselves explicitly defer exact volume, deadlines and scoring criteria to the **individual assignment**, the applicable **Наредба № 1 от 19.02.2020 г.**, and the qualification standard. They should not be treated as an individualized approval.

## 21.2 Alignment matrix

| Standard/guideline topic | RubiVision evidence to prepare | Evidence status |
|---|---|---|
| Real professional problem | Need for interpretable speedcubing video analysis | Planned problem statement |
| Student-authored programming logic | Timer, repositories, feature extraction, data validation, model integration | Must be implemented and explained |
| ERU 9 — data/knowledge analysis | Dataset manifest, preprocessing, storage, statistical analysis | Planned |
| ERU 10 — machine learning | Baseline, trained model, tuning, held-out metrics and interpretation | Core graduation contribution |
| ERU 12 — image processing/pattern recognition | Frame sampling, motion features, image quality checks, activity classification | Core graduation contribution |
| Testing and evaluation | Automated tests, confusion matrix, error analysis, latency | Must be measured |
| Theory and practical consistency | Explain actual architecture and actual model used | Required in final report |
| Ethical/legal awareness | Consent, privacy, provenance, licensing, limitations | Planned controls |
| Reproducibility | README, requirements, dataset protocol, scripts, model versions | Required |
| Presentation and defense | Slides, live demo, backup video, Q&A preparation | Required |
| Originality | Git history, authored code and explicit third-party attribution | Must be evidenced |

**Important nuance:** The standard also includes other learning outcomes, including natural-language processing. A single project is not necessarily expected to implement every topic from the entire qualification curriculum. The **school's individual diploma assignment determines which competencies must be demonstrated by this particular project**.

## 21.3 What is insufficient

A web page that merely calls a third-party AI API and displays a result would not demonstrate the planned independent work. Likewise, a visually attractive timer without a genuine, evaluated ML component would be weak evidence for an AI-programming diploma topic. RubiVision's defense should emphasize the dataset, the student-built processing pipeline, the trained model, the baseline comparison and the interpretation of real test results.

## 21.4 Approval and legal caution

Before locking the report, ask the supervisor to confirm: approved topic wording, deadline, minimum/maximum pages, mandatory formatting, whether external participants are permitted, whether a deployed website is necessary, required programming languages, rubric and whether any separate school-specific templates apply. Verify the **currently applicable legal framework** for the student's cohort; the supplied 2022 standard is a reference, not a substitute for school confirmation.

# 22. Suggested diploma-project structure and evidence

The user-supplied guidelines recommend:

1. **Title page:** School, student, profession/specialty, approved topic, supervisor, year.
2. **Contents:** Numbered headings and pages.
3. **Introduction (Увод):** Relevance, problem, goal, tasks, expected results and technologies.
4. **Theoretical part (Теоретична част):** Speedcubing context, image processing, supervised learning, feature extraction, classifiers, metrics, privacy, technical choices.
5. **Practical part (Практическа част):** Architecture, database, timer, video pipeline, labeling tool, model training, evaluation, implementation screenshots, code fragments, test cases and measured results.
6. **Conclusion (Заключение):** What was actually achieved, objective-by-objective, plus limitations and future research.
7. **References (Литература):** Official standards, technology documentation, papers, library licenses and relevant resources.
8. **Appendices (Приложения):** UML/ER diagrams, schema, sample annotations, test logs, selected code, dataset protocol and experiment tables.

**Do not copy this planning document as if it were a completed diploma report.** The final practical chapters must be rewritten around the implemented software and real experiment results.

# 23. Demonstration, defense and examiner questions

## 23.1 Suggested 8–12 minute demonstration flow

1. Introduce the problem and explain why total solve time is insufficient.
2. Show 3×3 timer, scramble, optional inspection and saved result.
3. Show sessions, statistics and a backup/export example.
4. Import a pre-consented recording or show camera capture.
5. Open the synchronized video and manually labeled ground truth.
6. Run the trained classifier; show MOVEMENT/PAUSE/UNCERTAIN timeline.
7. Show baseline-versus-model evaluation, confusion matrix and a failure case.
8. Explain what is original, what is library-provided and why the result is not exact move recognition.
9. Show the architecture path to verified moves and future cube-state tracking.
10. Summarize achieved goals, measured limitations and next steps.

Keep a prerecorded offline demo and sample dataset in case camera permissions or network access fail.

## 23.2 Likely defense questions

**Why is this AI rather than a normal timer?** Because a labeled video dataset is used to train and evaluate a classifier and integrate its predictions into user-facing analysis.

**Why a Random Forest?** A defensible answer would explain the chosen feature representation, dataset size, interpretability and comparison with alternatives. Do not claim it is universally best.

**What prevents data leakage?** Split by participant/session/solve before creating training and test windows.

**How is the model evaluated?** Same held-out set for baseline and trained model, class metrics, confusion matrix, boundary error and runtime.

**What does the camera not know?** Hidden cube faces, exact turns in ambiguous footage, mental state and reliable cube state without stronger evidence.

**What is your own contribution?** Explain the code, annotation protocol, feature extractor, training scripts, integration, testing and interpretation actually authored.

**Why not use a smart cube?** Smart-cube events can provide a useful verified reference, but the long-term research question is camera-based observation with ordinary equipment.

# 24. Practical deliverables and reproducibility checklist

## 24.1 Required graduation artifacts

- Source repository with commit history and licensing/attribution.
- Runnable frontend and documented setup instructions.
- Database schema and migration strategy.
- Functional timer/scramble/history/statistics modules.
- Camera recording or import workflow and annotation editor.
- Data dictionary and consent/collection protocol.
- Baseline algorithm and training scripts.
- Versioned trained model and compatible inference code.
- Held-out evaluation tables, plots and raw metric exports.
- Automated test results and known-issues list.
- Screenshots/architecture diagrams and final written diploma report.
- Defense slides and a repeatable demo script.

## 24.2 Reproducibility checklist

```text
[ ] Clone repository on a clean machine
[ ] Install dependencies from pinned versions
[ ] Start app and perform a timed solve
[ ] Reload and verify persistence
[ ] Import/record a test video
[ ] Apply manual labels and export them
[ ] Reproduce feature extraction
[ ] Train baseline and model with documented seed
[ ] Recompute metrics on held-out data
[ ] Load the model in the browser and run inference
[ ] Explain all third-party components and licenses
[ ] Demonstrate an AI failure case honestly
[ ] Restore from a validated backup
[ ] Present offline contingency demo
```

# 25. Project management, estimates and fallback strategy

## 25.1 Work sequencing

The roadmap is dependency-ordered, not a calendar promise. Development effort depends on prior coding experience, available time, number of recorded solves, camera reliability and the supervisor's rubric. Allocate time explicitly for data labeling, tests, debugging and writing the diploma report; these are often underestimated.

## 25.2 Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Too little labeled data | Weak or unstable model | Early data collection, clear labeling protocol, honest results |
| Train/test leakage | Misleadingly high scores | Participant/session-level split |
| Video/browser incompatibility | Demo failure | Import fallback and prerecorded supported media |
| Camera occlusion | Incorrect features | Quality flags and UNCERTAIN label |
| Storage quota or eviction | Lost recordings | Quota warnings, export, separate media storage |
| Timer inaccuracies | Loss of user trust | Monotonic clock and automated transition tests |
| AI underperforms threshold baseline | Weak claims | Report comparison honestly, revise features using validation only |
| Over-scoped ultimate features | Missed graduation deadline | Hard graduation gate before turn recognition |
| Missing school-specific requirements | Formal noncompliance | Obtain approved individual assignment early |
| AI-generated code not understood | Weak defense | Review, test, explain and document own contributions |

## 25.3 Fallback minimum viable defense

If video model quality is modest, the project can still present a legitimate AI experiment if data collection, training, evaluation and error analysis are real and well documented. If live camera fails, use imported consented footage. If cloud features are unfinished, keep the app offline-first. Do **not** substitute fabricated performance or a generic external API for missing experimental work.

# 26. Ultimate goal: automatic move recognition and state reconstruction

## 26.1 Research formulation

Given video observations \(I_1, I_2, \ldots, I_T\), an initial cube state \(S_0\) and a sequence of hypothesized legal moves \(m_1, m_2, \ldots\), maintain state estimates according to:

\[
S_{k+1} = T(S_k, m_k)
\]

where \(T\) is a deterministic cube transition function. The **transition is exact only if the starting state and move are correct**. Camera predictions must carry confidence and allow multiple hypotheses.

## 26.2 Technical pipeline

```text
Calibrated camera and initial scramble/state
                   |
                   v
Hand/cube localization and tracking
                   |
                   v
Sticker/face/orientation observations
                   |
                   v
Temporal turn candidate detection
                   |
                   v
Face-turn classification + confidence
                   |
                   v
Cube-state hypotheses + legality constraints
                   |
                   v
Resynchronization / manual correction
                   |
                   v
Verified or confidence-tagged move timeline
```

## 26.3 Key research challenges

- Hands obscure the cube and stickers.
- A single view cannot observe all six faces simultaneously.
- Camera and cube may move independently.
- `R`, `R'` and whole-cube rotations can appear similar in some views.
- Fast turns introduce blur; consecutive turns overlap.
- One missed move corrupts later state reconstruction.
- Different cube sizes require different move/state models.
- Recognition accuracy per move is not equal to accuracy for an entire solve.

## 26.4 Realistic research progression

Start with 3×3, fixed camera, controlled lighting, known starting scramble and slow solves. Measure single-turn classification on isolated examples; then short sequences; then full solves; then increased TPS, lighting variation and moving cameras. Introduce manual correction and resynchronization rather than pretending every frame is certain. Smart-cube move logs may be used as an evaluation reference if available, but are not mandatory for the graduation release.

# 27. Ultimate goal: method-specific optimization and coaching

## 27.1 Why “optimal” is not one number

The fewest-move solution is not always the fastest for a human. A recommendation may trade off move count, cube rotations, regrips, recognition difficulty, known algorithms and ergonomics. Define optimization objectives explicitly.

## 27.2 CFOP-first plan

From **verified cube states and moves**, identify Cross, F2L pair insertions, OLL and PLL transitions. Compare the user's actual sequence with a library of valid alternatives for the same state or local subproblem. Verify every alternative using the cube engine. Record why an alternative is suggested: fewer moves, fewer rotations or a familiar algorithm. Do not claim an alternative is faster without evidence or a calibrated cost model.

Later support Roux and ZZ using distinct stage definitions; do not force every method into CFOP stages.

## 27.3 Personalization

A user profile can store preferred method, known algorithms, dominant hand, practice goals and explicitly consented history. Recommendations should be explainable and adjustable. Personalized finger-trick claims require richer observation than movement/pause labels alone.

## 27.4 Real-time coaching

Real-time suggestions depend on robust, low-latency state tracking. They must not distract or interfere with timing and should be optional. A safer initial experience is **post-solve analysis**, where the system can verify and correct the move sequence before recommending improvements.

# 28. Limitations, research questions and unresolved decisions

## 28.1 Known limitations

The graduation AI detects visual activity categories, not exact moves or thoughts. Stage boundaries entered by users are manual evidence. A 3×3-trained model is not automatically valid for 2×2 or larger cubes. Browser video codecs, camera access, storage quotas and performance vary by platform. The project is not a WCA-certified timing system.

## 28.2 Decisions requiring supervisor/user confirmation

1. Exact diploma assignment, grading rubric, deadline and report formatting.
2. Whether school requires a particular programming language, database or hosting environment.
3. Whether the final report should be in Bulgarian (recommended for Bulgarian defense) or bilingual.
4. Whether recording participants other than the student is permitted and under which consent procedure.
5. Which target browsers and devices are mandatory.
6. Whether all six puzzle sizes must be fully demonstrated or only supported in product functionality.
7. Whether verified-move replay is a graduation stretch goal or post-graduation milestone.
8. Which performance thresholds will be accepted as project targets.
9. Whether a live defense can use prerecorded fallback footage.
10. Whether school requires diagrams, screenshots, code appendices or minimum test coverage.

These are **open decisions**, not silently assumed facts.

# 29. References, glossary and appendices

## 29.1 Legal and educational references

1. **Наредба № 6 от 7 април 2022 г.** за придобиване на квалификация по професията „Програмист на изкуствен интелект“, НАПОО:  
   https://www.navet.government.bg/bg/media/naredba-%E2%84%96-6-dos-programist-na-izkustven-intelekt.pdf
2. НАПОО, публикация за ДОС по професия 481040:  
   https://www.navet.government.bg/bg/481040-2/
3. **„Указания за разработване на дипломен проект“**, текст предоставен от възложителя в настоящия разговор; точните индивидуални изисквания подлежат на потвърждение.
4. **Наредба № 1 от 19.02.2020 г.**, посочена в предоставените указания; приложимата редакция и училищното задание следва да бъдат проверени от ръководителя.

## 29.2 Technical references to cite in the final report

- World Cube Association, official regulations and event/scramble rules: https://www.worldcubeassociation.org/regulations/
- MDN Web Docs, IndexedDB: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- MDN Web Docs, MediaRecorder: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- MDN Web Docs, High Resolution Time: https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/High_precision_timing
- scikit-learn documentation: https://scikit-learn.org/stable/
- React documentation: https://react.dev/
- TypeScript documentation: https://www.typescriptlang.org/docs/

These references identify relevant documentation; the final diploma bibliography should cite the specific pages, versions and access dates actually used.

## 29.3 Glossary

| Term | Definition |
|---|---|
| **Solve** | One timed attempt to solve a puzzle |
| **Scramble** | Move sequence defining the starting puzzle state |
| **Inspection** | Pre-solve viewing period under selected practice rules |
| **ao5 / ao12** | Rolling average of 5 / 12 results with defined penalty treatment |
| **CFOP** | Cross, First Two Layers, Orientation and Permutation of Last Layer |
| **TPS** | Turns per second; requires a trustworthy turn count |
| **Feature extraction** | Converting raw video into numerical descriptors |
| **Baseline** | Simple reference method against which a trained model is compared |
| **Ground truth** | Reference labels established by an explicit protocol |
| **Macro F1** | Unweighted mean of per-class F1 scores |
| **Data leakage** | Evaluation contamination from related training examples |
| **Uncertainty** | Explicit lack of sufficient confidence in a prediction |
| **Cube-state reconstruction** | Updating an internal cube model using a move sequence |
| **OPFS** | Origin Private File System, a browser storage facility |
| **Offline-first** | Core operations are designed to work without a server |

## Appendix A — Example acceptance scenarios

**A1: Timer.** Select 4×4, generate a scramble, start/stop, save, refresh, and verify that puzzle, scramble, time and penalty persist.

**A2: AI timeline.** Import a labeled 3×3 recording, run inference, view colored intervals and seek to a detected pause; display model version and uncertainty.

**A3: Experiment.** Train a classifier, run baseline and model on the same held-out recordings, and reproduce the confusion matrix and macro F1.

**A4: Privacy.** Deny camera permission, continue using timer, import a local video, and delete the media with a clear confirmation.

**A5: Future verified moves.** Input a legal move sequence, replay it in a cube simulator, and confirm the final state matches the deterministic transition function.

## Appendix B — Evidence provenance statement template

> This project uses third-party frameworks and libraries as documented dependencies. The student-authored contribution comprises the system architecture, domain logic, integration, dataset protocol, feature extraction and experimental analysis to the extent evidenced by the repository and project log. Any AI-assisted code generation is reviewed, tested and explained by the student. Reported model performance is derived from recorded experiments, not hypothetical values.

---

**End of planning documentation.** The project should be revised only when an approved individual assignment, measured experimental results or justified engineering findings require it. Changes should be recorded in a decision log so the graduation report remains consistent with the implemented system.

## 2026-10-16 Cloud-first architecture extension

The graduation MVP now includes Supabase PostgreSQL, Supabase Auth and owner-scoped RLS from category 02/02A. Local IndexedDB is retained only for timer durability/outbox and bounded cache; Supabase is authoritative. See master documents 11–15 and category 02A for architecture, schema, sync, security, deployment, cost and acceptance tests. All original AI goals, timer/puzzle features, experimental evidence and graduation deliverables remain unchanged.


# All 30 feature specifications

## prompts/01_foundation_ui/01_Foundation_and_UI.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 01. Foundation and UI

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the foundation and ui capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Responsive application shell; navigation for Timer, Solves, Statistics, Analyze, Challenges, Settings.
2. Accessible keyboard/touch/mobile interaction; error, loading, empty and offline states.
3. Design tokens, theme, internationalization-ready strings, responsive video and chart layouts.
4. No direct database, timer or model implementation inside view components.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Foundation, UI and navigation

## Assigned topic
Foundation, UI and navigation

## Suggested files (adapt to existing repository)
App.tsx, router.tsx, providers.tsx, AppLayout.tsx, Navigation.tsx, TimerPage.tsx, HistoryPage.tsx, StatisticsPage.tsx, AnalysisPage.tsx, SettingsPage.tsx, global styles

## Implementation requirements
Create a responsive accessible React/TypeScript shell with dark/light themes, desktop/mobile layouts, loading/empty/error states, and routes for timer, history, statistics, analysis and settings. Keep presentation separate from domain services. Never reset a running timer on navigation; warn before destructive navigation if needed.

## Acceptance tests and edge cases
Keyboard accessibility, responsive breakpoints, no hidden overflow, error boundaries, page navigation, no direct IndexedDB calls from visual components.


## Cloud-first integration addendum (2026-10-16; additive)

Add AuthProvider, protected route shell, sign-in/up/reset screens, cloud configuration health state, network/sync status UI, `.env.example`, and a clean data-service boundary. Avoid real credentials in source control.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/02_database/02_Supabase_PostgreSQL_Schema.md

# 02 — Supabase PostgreSQL Database Schema and Data Contracts

**Phase:** Graduation; implement after Foundation and before 02A. **Storage decision:** Supabase PostgreSQL is the only persistent application database. No IndexedDB, OPFS database, browser sync outbox, local database migrations or offline-save guarantee.

## Scope
Design and implement version-controlled SQL migrations for Supabase PostgreSQL; consistent domain types and data access contracts for all modules. This category defines schema; category 02A configures Auth, policies and frontend integration.

## Required tables and relationships
- `profiles`: `id uuid primary key references auth.users(id) on delete cascade`, display preferences, timestamps. Never store passwords.
- `user_settings`: one row per account, theme, timer preferences, puzzle preferences, versioned JSON settings where justified.
- `sessions`: UUID primary key, owner UUID, puzzle/event, name, created/updated timestamps, archived status.
- `solves`: UUID primary key, owner UUID, session UUID, puzzle/event, scramble text, raw duration in integer milliseconds, penalty enum (`none`, `plus2`, `dnf`), inspection metadata, optional notes, created/updated timestamps; constraints for valid durations and owner-consistent session references.
- `recordings`: metadata only (owner, optional solve, duration, mime, size, storage path when uploaded, consent and deletion status); do not place video bytes in PostgreSQL.
- `annotations`, `analysis_runs`, `model_versions`, `dataset_metadata`, `experiment_runs`: owner-scoped metadata, source links, version identifiers and reproducibility fields. Keep sensitive media and raw research assets separate.
- Future-ready migrations for verified move sequences, algorithms, challenge submissions and achievements only when their category begins; do not create unused complex tables prematurely.

## SQL conventions
1. Use Supabase CLI migrations under `supabase/migrations/`; committed to Git. No manual production-only changes.
2. UUIDs for stable IDs, `timestamptz` for UTC instants, integer milliseconds for time measurements; explicit puzzle/event identifiers.
3. Foreign keys, uniqueness, `CHECK` constraints, indexes on `(owner_id, created_at)` and `(owner_id, session_id, created_at)` as appropriate.
4. Use owner-consistent composite foreign keys or trusted server-side checks to prevent cross-account references.
5. Decide delete cascade/retention for each relation; avoid silent deletion of research evidence.
6. Treat SQL schema as source of truth; generate Supabase TypeScript database types, then map to stable domain models through typed repositories.
7. Avoid storing user secrets, API service-role keys, or raw private recordings in tables.

## Acceptance criteria
- Clean Supabase project applies every migration in order.
- Fresh user can create profile, session and solve; constraints reject invalid duration, penalty and cross-user foreign keys.
- Schema migration and rollback/recovery plan documented; generated types compile.
- Cloud schema is sufficient for timer, history, statistics, annotations, experiments and exports without local database implementation.

## Dependencies
01 Foundation; followed by 02A Supabase integration, then 03 puzzles and 04 timer.


---

## prompts/02a_supabase_cloud_foundation/02A_Supabase_Auth_RLS_and_Cloud_Operations.md

# 02A — Supabase Integration, Authentication and Security

**Phase:** Graduation, immediately after 02. **Decision:** Supabase-only persistent data. No IndexedDB, offline queue, conflict-resolution sync engine or local database schema.

## Goals
Set up Supabase projects, environment variables, authentication, typed cloud repositories, secure Row Level Security (RLS), storage rules, operational error handling, and reliable cross-device access.

## Implementation requirements
1. Create Supabase dev and production environments; commit `supabase/config.toml`, SQL migrations, `.env.example` and setup instructions, never real credentials.
2. Use Supabase JavaScript client in React with public URL and publishable/anon key; NEVER ship service-role/secret keys to browser.
3. Implement sign-up, sign-in, sign-out, auth session restore, password reset, optional email confirmation, accessible error and loading states.
4. Enable RLS on **every** user-owned table; test SELECT/INSERT/UPDATE/DELETE as owner, stranger and anonymous user. Use `auth.uid()`-based ownership and ownership-consistent relationships.
5. Restrict Storage buckets and policies for explicitly uploaded recordings. Recordings stay on device until the user opts to upload; storage retention and deletion are documented.
6. Implement `SolveRepository`, `SessionRepository`, `SettingsRepository` and later analysis repositories with typed Supabase implementations. UI components must not embed SQL or policy assumptions.
7. Save solves asynchronously after timer stops. Show `Saving`, `Saved`, or `Save failed`; never claim success until Supabase confirms it. On failed save, retain an unsaved record in current app memory while the tab remains open, allow manual retry and copy/export of the unsaved result; **closing/reloading the tab may lose unsaved data**.
8. Network required to reliably persist data. Show an offline warning and disable/mark persistence-dependent operations appropriately; timer may still run without network.
9. Add request retries for transient failures only with idempotent client-generated solve UUIDs, preventing duplicate solves; no background offline synchronization engine.
10. Query cloud records with pagination and filters, handle loading/empty/errors, and calculate user-facing stats from canonical raw durations and penalties.
11. Export/import versioned JSON through explicit user action; validate owner assignment and deduplicate IDs on import.
12. Provide setup steps for Supabase CLI, local testing, deployment environment configuration, and operational troubleshooting.

## Security and testing
- Verify RLS against direct REST requests; UI hiding is not security.
- No credentials in Git; rotate leaked keys and apply least privilege.
- Test different browsers/devices signing into same account and reading identical persisted solves.
- Test 401, 403, 429, timeouts, expired sessions, failed inserts, retries and storage policy denial.
- Distinguish authenticated user records from any public challenge leaderboard views; no private data leak.

## Acceptance criteria
User can register, sign in, save a solve to Supabase, reload on another device and retrieve it. A second account cannot access it. Failed cloud saves are visibly failed, never silently treated as saved. No persistent local application database is created.


---

## prompts/03_puzzles_scrambles/03_Puzzles_and_Scrambles.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 03. Puzzles and Scrambles

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the puzzles and scrambles capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Support 2×2×2, 3×3×3, 4×4×4, 5×5×5, 6×6×6, 7×7×7 in timer and scramble selection.
2. Use maintained, validated event-specific scramble generators; distinguish random-state from random-move where applicable.
3. Puzzle-specific notation, scramble length and display; copy and regenerate, scramble history, lock active scramble.
4. No silent reuse; validate parseability and event compatibility; generation off main timing path.
5. Daily challenge generation has separate rules and must not silently replace regular practice scrambles.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Scrambles and cube visualization

## Assigned topic
Scrambles and cube visualization

## Suggested files (adapt to existing repository)
features/scramble/scrambleService.ts, scrambleParser.ts, ScrambleDisplay.tsx, features/cube/cubeState.ts, CubeViewer.tsx

## Implementation requirements
Generate valid 2×2–7×7 puzzle-specific WCA-style scrambles via a vetted compatible library, asynchronously when necessary. Keep scramble fixed while timer runs and save its exact text and generator version. Allow copy/regenerate and reject stale async responses. Add optional cube viewer for supported puzzle types, using cubing.js/Three.js; viewer shows scramble-derived known state, never inferred physical state.

## Acceptance tests and edge cases
Validate notation and puzzle mapping; scramble ID uniqueness; inverse move restores state; unavailable viewer never blocks timing.


## Cloud-first integration addendum (2026-10-16; additive)

Scramble generation stays client-side and usable offline; persist the exact scramble text, puzzle code, algorithm/provider version and optional seed with the solve. Never require cloud request to generate a scramble.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/04_timer/04_Timer_and_Inspection.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 04. Timer and Inspection

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the timer and inspection capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Puzzle-independent monotonic millisecond clock (performance.now) and explicit IDLE/HOLDING/READY/INSPECTION/RUNNING/STOPPED state machine.
2. Keyboard Space and pointer/touch controls; configurable hold-to-arm threshold; ignore repeats, typing focus and duplicate input.
3. Optional 15-second inspection; practice-mode +2 after 15 seconds and DNF after 17 seconds; precise boundaries and visible/audio cues.
4. Manual +2, DNF and reset; format centiseconds while preserving full millisecond duration; effective time and DNF averages.
5. Support all 2×2–7×7 puzzles through event association; inspection defaults and WCA-specific distinctions must be documented, not asserted universal.
6. Protect against focus loss, hidden tab, sleep, accidental stops, stale callbacks and race conditions.
7. Attach immutable scramble and puzzle to completed solve; exactly-once save event; recording sync via timestamped lifecycle events.
8. Configurable inspection, display precision, sound, hold duration, controls and reduced-motion preferences.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Timer and inspection

## Assigned topic
Timer and inspection

## Suggested files (adapt to existing repository)
features/timer/timerMachine.ts, useTimer.ts, timerFormat.ts, TimerDisplay.tsx, timerMachine.test.ts

## Implementation requirements
Build an explicit IDLE → HOLDING → READY → RUNNING → STOPPED state machine. Space hold threshold configurable; release only starts from READY. Support touch/pointer, ignore repeated keyboard events, text-input focus and duplicate stop events. Measure with performance.now(), render centiseconds but retain milliseconds. Optional 15-second inspection with +2 after 15 seconds and DNF after 17 seconds; clarify exact boundary behavior in tests. Emit a completed result exactly once. Avoid saving until a valid stop.

## Acceptance tests and edge cases
Transition tests, input debouncing, blur/visibility handling, no interval drift, no accidental instant stop, cancellation of premature hold.


## Extending the timer after completion

The timer is not permanently frozen. For split times, new inspection preferences, device integration or other additions, create a versioned change request in this file, follow `master prompts/06_CHANGE_CONTROL_AND_FEATURE_EXTENSIONS.md`, check impacts on database/statistics/video sync and rerun timer regressions. Do not replace the whole module unnecessarily.

## Cloud-first integration addendum (2026-10-16; additive)

Timer state machine and monotonic duration remain entirely local; on stop durably enqueue solve in IndexedDB then sync asynchronously. Display pending/failed status and handle local quota failure without falsely claiming save.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/05_solve_sessions/05_Solve_History_and_Sessions.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 05. Solve History and Sessions

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the solve history and sessions capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Create, rename, switch and delete sessions; filter by puzzle, session, date and tags.
2. Store scramble, raw duration, penalties, inspection status, created-at, optional notes and recording references.
3. Edit penalties and notes; deletion confirmation/undo, bulk selection and exports.
4. Preserve historical solve provenance and analysis links; never mutate the underlying recorded raw time.
5. Transactional storage with migration and duplicate-import behavior.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Sessions, solve history and local persistence

## Assigned topic
Sessions, solve history and local persistence

## Suggested files (adapt to existing repository)
features/solves/solveService.ts, solveRepository.ts, SolveTable.tsx, HistoryPage.tsx, storage/database.ts, migrations.ts, repositories.ts, types/solve.ts, types/session.ts

## Implementation requirements
Define typed Solve, Scramble, Session entities with stable UUIDs, ISO UTC timestamps, millisecond durations and penalty enum NONE/PLUS_TWO/DNF. Save each completed solve exactly once. Add create/rename/select/delete sessions, edit penalty/notes, filter/sort history, confirm delete, inspect linked scramble. Use IndexedDB (Dexie acceptable), schema migrations and quota handling. Compute effective time from raw time + penalty; DNF has no ranking value.

## Acceptance tests and edge cases
Reload persistence, transaction safety, migration test, no duplicated solves, updates propagate to statistics, quota failure visible.


## Cloud-first integration addendum (2026-10-16; additive)

Sessions and solves are cloud-authoritative, owner-scoped and paginated. New solves have stable UUIDs and locally pending display. Create session remotely before dependent solve sync, handle soft-delete/tombstones and cross-device edits.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/06_statistics/06_Statistics_and_Progress.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 06. Statistics and Progress

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the statistics and progress capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Best, mean, median, standard deviation, success rate and solve count by puzzle/session.
2. Rolling averages ao5/ao12/ao50/ao100 with correct DNF and trimmed average rules; document conventions and insufficient-data states.
3. Time-series trends, personal records, comparison windows and penalty-aware statistics.
4. Recompute after edits/deletions/import; optimize large histories and distinguish official-style vs custom metrics.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Statistics and charts

## Assigned topic
Statistics and charts

## Suggested files (adapt to existing repository)
features/statistics/statisticsEngine.ts, StatisticsPanel.tsx, StatisticsPage.tsx, statisticsEngine.test.ts

## Implementation requirements
Create pure tested functions for count, best, worst, mean of valid solves, rolling ao5/ao12/ao50/ao100, best rolling averages, DNF rate, puzzle/session breakdown, trends and histograms. Follow documented WCA-style trimmed average conventions and correct +2/DNF treatment; do not confuse mean and average. UI provides charts, date/session/puzzle filters and insufficient-data states.

## Acceptance tests and edge cases
Golden test vectors, multiple DNF windows, penalty edits, boundary windows, zero solves, chart accessibility.


## Cloud-first integration addendum (2026-10-16; additive)

Compute stats from canonical solves including pending local items once, not twice. Handle pagination, remote refresh, deleted solves, penalties, offline cached subsets and incomplete history notices.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/07_camera/07_Camera_Recording_and_Synchronization.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 07. Camera Recording and Synchronization

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the camera recording and synchronization capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Explicit user consent and camera permission; choose device/resolution/framerate when supported.
2. MediaRecorder feature detection, start/stop, preview, save/cancel, errors and fallback for unsupported codecs.
3. Synchronize monotonic timer lifecycle with video timestamps; record offsets and drift/uncertainty.
4. Do not block timing; avoid unbounded memory usage; local retention/deletion and permission withdrawal.
5. Record visible hands and cube guidance, lighting/placement checklist, no implied move recognition.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Camera, recording and privacy

## Assigned topic
Camera, recording and privacy

## Suggested files (adapt to existing repository)
features/camera/cameraService.ts, useCamera.ts, recordingService.ts, CameraPreview.tsx, types/recording.ts

## Implementation requirements
Request camera permission only after explicit action. Provide camera selection, live preview, framing guidance, MIME capability checks and MediaRecorder capture linked to solve. Optional auto-record begins before timing and ends at stop; timer must not depend on recording. Store metadata and optionally video blobs with quota controls; permit playback and deletion. Stop media tracks on teardown. Default recordings local; never upload without explicit opt-in.

## Acceptance tests and edge cases
Denied permission, no device, unsupported MIME, interrupted recording, low storage, synchronization offset between recording and timer.


## Cloud-first integration addendum (2026-10-16; additive)

Camera consent and recording remain local by default. Add explicit Supabase Storage upload workflow only if opted in, with limits, access policies, upload progress and deletion/retention.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/08_video_import_annotation/08_Video_Import_and_Manual_Annotation.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 08. Video Import and Manual Annotation

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the video import and manual annotation capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Import existing local video files without camera permission; verify type, duration, size and decode support.
2. Seekable playback and timeline; manually label MOVEMENT/PAUSE/UNCERTAIN intervals.
3. Mark Cross/F2L/OLL/PLL boundaries as user annotations for CFOP, not AI predictions.
4. Versioned JSON/CSV label exports with video reference, clock alignment and provenance.
5. Keyboard annotation controls, overlap/gap validation, undo and accessible timeline.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Video import, review, and manual annotation

## Goal
Make it possible to analyze existing local solve videos without granting camera permission, and produce accurate ground-truth labels for model evaluation. This closes a gap between the original master specification and the initial 13 topic prompts.

## Suggested files (adapt to repository)
features/media/videoImportService.ts; features/media/videoMetadata.ts; components/VideoImportDialog.tsx; features/annotation/annotationService.ts; features/annotation/AnnotationEditor.tsx; features/annotation/annotationValidator.ts; types/annotation.ts; tests/videoImport.test.ts; tests/annotation.test.ts

## Requirements
1. User selects a local video through a file picker; no automatic upload. Validate MIME/extension defensively, file size, decodability, duration and resolution. Show errors for corrupt, zero-length, unsupported, too-large and DRM-protected files.
2. Display playback controls and a timeline. Support a standalone imported video (for labeling/evaluation) and optionally link an imported video to a saved solve. Store recording origin `CAMERA`/`IMPORT` and optional solve linkage; update canonical contracts and migrations accordingly.
3. Explicitly capture the time-alignment policy: imported videos may lack a known timer-start offset. Let user set an offset or analyze relative to video start; never fabricate synchronization.
4. Provide annotation editor: mark interval start/end and MOVEMENT, PAUSE, UNCERTAIN labels; seek, trim, split, merge, edit, undo and remove intervals. Make keyboard shortcuts optional and discoverable.
5. Validate intervals as finite, ordered, non-overlapping half-open ranges within video duration. Define gap policy (unlabeled or UNCERTAIN) and minimum pause duration. Show distinction between human ground truth and AI predictions.
6. Export/import versioned annotation JSON with recording identifier, timestamps, annotator/label protocol version, optional session/participant pseudonyms, and label definitions. Preserve consent and avoid public upload of raw recordings.
7. Dataset scripts from 08 must accept the annotation export format without manual conversion. Define and test a common schema, including missing metadata and inconsistent time units.
8. Keep videos local by default; revoke object URLs, release decoders, cancel pending processing, and handle storage quota errors.

## Acceptance
- User can import a valid sample video, play it, label segments, export annotations, re-import them and reproduce the same intervals.
- Camera denial does not block video import.
- Dataset extraction accepts exported annotations and rejects overlapping/invalid intervals.
- Tests cover invalid files, empty labels, ambiguous offset, schema versions, and precision of timestamps.

## Agent procedure
Consult `master prompts/01_PROJECT_REGULATIONS.md`, `02_ARCHITECTURE_DATA_CONTRACTS.md`, `03_DEVELOPMENT_ROADMAP.md`, and `04_INTEGRATION_CHECKLIST.md`. Inspect existing repo first, implement smallest vertical slice, run tests/build, report actual outcomes and limitations. Do not rewrite working features.



## Cloud-first integration addendum (2026-10-16; additive)

Annotation metadata may sync to owner-scoped tables; raw video remains local unless separately uploaded. Handle missing local media on a new device without losing metadata.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/09_vision_features/09_Computer_Vision_Feature_Extraction.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 09. Computer Vision Feature Extraction

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the computer vision feature extraction capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Sample video frames at documented FPS; resize/crop consistently; optional optical flow, frame difference and hand landmarks.
2. Track missing hands, blur, occlusion, confidence and low-light warnings; never infer exact turns from coarse motion alone.
3. Deterministic feature vectors, timestamps, feature schema and processing cancellation.
4. Browser performance budget and worker processing; match offline training extraction exactly.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Computer vision and motion feature extraction

## Assigned topic
Computer vision and motion feature extraction

## Suggested files (adapt to existing repository)
features/vision/frameProcessor.ts, motionExtractor.ts, handTracker.ts, visionPipeline.ts, workers/vision.worker.ts, types/features.ts

## Implementation requirements
Process saved video frames at configurable 10–15 FPS starting point; resize, grayscale/normalize, optional manual ROI, mean absolute frame difference, active-pixel ratio, smoothing, motion variance/max, hand displacement and confidence if MediaPipe available. Aggregate into 250–500 ms timestamped windows; include quality flags for poor lighting/blur/occlusion and cancellation/progress. Use video timestamps, not wall-clock processing time. Keep CPU-heavy work off UI thread. No claims of exact moves or CFOP phases.

## Acceptance tests and edge cases
Static scene, motion, dropped frames, different FPS, absent hands, empty/short videos, cancellation, deterministic feature order.


## Cloud-first integration addendum (2026-10-16; additive)

Feature extraction runs locally/on worker as originally designed. Persist only permitted metadata/derived outputs to owner-scoped cloud tables; never silently upload frames.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/10_dataset_training/10_Dataset_and_Model_Training.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 10. Dataset and Model Training

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the dataset and model training capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Consent-based recordings from multiple people/sessions and manually annotated MOVEMENT/PAUSE/UNCERTAIN labels.
2. Versioned labeling guide, dataset manifest, exclusion criteria and annotation disagreement process.
3. Split by participant/session to prevent leakage; preserve locked held-out test set.
4. Threshold baseline plus actual trained classifier (e.g. Random Forest), hyperparameter record, reproducible seed.
5. Feature normalization and ordering exported with model; report class imbalance, confusion matrix, macro F1 and limitations.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Dataset, labeling, baseline and ML training

## Assigned topic
Dataset, labeling, baseline and ML training

## Suggested files (adapt to existing repository)
scripts/dataset/extract_features.py, validate_dataset.py, split_dataset.py, scripts/ml/train.py, evaluate.py, export_model.py, docs/dataset_protocol.md, docs/evaluation.md

## Implementation requirements
Define MOVEMENT, PAUSE, UNCERTAIN labeling guidelines incl. regrips and occlusions. Collect diverse consented recordings; store participant/session/recording metadata; validate annotations and window alignment. Split by participant/session to prevent leakage. Implement threshold baseline and trained Random Forest/tabular classifier. Tune only on train/validation, freeze and evaluate on held-out test. Report per-class precision/recall/F1, macro F1, confusion matrix, uncertainty rate, pause boundary error, latency. Export feature schema, model version and runtime-compatible inference artifacts.

## Acceptance tests and edge cases
Fully reproducible scripts and fixed seeds, test leakage check, feature-schema consistency, compare baseline/model on identical held-out data, no invented accuracy.


## Cloud-first integration addendum (2026-10-16; additive)

Training data manifests include consent, provenance and access control. Cloud is not a substitute for reproducible dataset versions and held-out evaluation. Sensitive datasets are not public Supabase buckets.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/11_inference/11_Browser_AI_Inference.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 11. Browser AI Inference

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the browser ai inference capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Run trained model locally/offline where practical; clear model-unavailable fallback.
2. Timestamped MOVEMENT/PAUSE/UNCERTAIN intervals with confidence and versioned analysis runs.
3. Smoothing/hysteresis and minimum duration rules; no misleading certainty.
4. Align results with original video/timer; reanalysis preserves old provenance; performance metrics.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Model inference and video analysis timeline

## Assigned topic
Model inference and video analysis timeline

## Suggested files (adapt to existing repository)
features/ml/classifier.ts, modelLoader.ts, features/analysis/analysisService.ts, segmentBuilder.ts, AnalysisTimeline.tsx, AnalysisPage.tsx, types/analysis.ts

## Implementation requirements
Load versioned compatible model or baseline; enforce feature names/order/preprocessing, handle unavailable model and low-confidence outputs. Convert window predictions to contiguous MOVEMENT/PAUSE/UNCERTAIN segments using documented smoothing and minimum durations. Align with video playback, enable seek-to-segment and manual corrections. Calculate pause count, longest pause, total pause/movement duration and quality warnings. Save model version and analysis settings; permit reruns without silently overwriting results.

## Acceptance tests and edge cases
Timeline/video synchronization, model failure fallback, confidence display, no fabricated analysis, short pauses, overlapping windows, zero valid predictions.


## Cloud-first integration addendum (2026-10-16; additive)

Browser inference can operate on local media; save model version, feature version, provenance and analysis results through cloud repositories with offline pending fallback.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/12_training_insights/12_Stage_Timing_and_Training_Insights.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 12. Stage Timing and Training Insights

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the stage timing and training insights capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. User-marked CFOP phases; configurable generic phases for other methods.
2. Stage durations, pause counts and pause fraction; compare to prior sessions.
3. Jump from insight to corresponding video moment; distinguish measured, inferred and manually entered values.
4. Actionable but non-speculative tips; no claims of specific bad algorithms without verified move states.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Manual stages and useful training insights (graduation MVP)

## Goal
Turn motion/pause analysis into useful speedcubing feedback without claiming to know cube moves or CFOP stages automatically.

## Requirements
- Timeline UI to add, rename, adjust, delete, and persist manually annotated stages, initially Cross/F2L/OLL/PLL for CFOP and customizable for other methods.
- Every stage marker is explicitly labeled USER_ANNOTATED. Boundaries are relative to recording/solve time with a stored alignment offset; handle videos that start before the timer.
- For each stage, show duration, pause count, longest pause, pause fraction, uncertain duration and coverage; avoid counting uncertain as pause.
- Compare stages and solve summaries across a selected session, using consistent rules and showing sample sizes.
- Provide transparent rule-based coaching suggestions (e.g., "Longest detected pause was during your manually marked F2L stage; review 00:08.3") with direct video seek links. Label them as suggestions based on predictions and manual markers, not verified cause or algorithm errors.
- Allow manual corrections of predicted activity intervals; retain original predictions and their model version for reproducibility.
- Make stage annotation optional; without it, global pause timeline and insights still work.

## Suggested interfaces
StageAnnotation { id, solveId, recordingId, method, stageName, startMs, endMs, source: 'USER_ANNOTATED', createdAt, updatedAt }
TrainingInsight { id, solveId, kind, summary, evidenceSegmentIds, source: 'RULE_BASED', uncertaintyNote? }

## Tests and done
Test overlapping/out-of-range markers, empty stages, offsets, unknown intervals, editing persistence, multiple methods, and correct metrics. Verify user-visible distinction between predictions and annotations. Run typecheck, tests and build; report actual results.



## Cloud-first integration addendum (2026-10-16; additive)

Sync manual stage annotations and versioned analysis results with owner RLS; conflicts cannot silently overwrite manual annotations. Offline pending data must be labeled.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/13_experiment_reporting/13_AI_Experiment_and_Evaluation_Dashboard.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 13. AI Experiment and Evaluation Dashboard

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the ai experiment and evaluation dashboard capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Baseline vs trained model evaluated on same locked held-out set.
2. Class precision/recall/F1, macro F1, confusion matrix, support counts, pause boundary error and runtime latency.
3. Dataset sizes and split strategy, seed, feature/model versions, training date and reproducibility links.
4. Explicit unavailable/not-evaluated state; no fabricated percentages.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Experiment results and research presentation

## Goal
Provide an honest, reproducible interface/report for the graduation experiment, beyond a per-solve timeline.

## Suggested files
features/experiments/experimentManifest.ts; features/experiments/experimentResultsService.ts; pages/ExperimentResultsPage.tsx; components/ConfusionMatrix.tsx; components/MetricsComparison.tsx; docs/experiment-reproduction.md; tests/experimentResults.test.ts

## Requirements
1. Import/read versioned evaluation artifacts generated by 08 (JSON/CSV): dataset version, split IDs and policy, label definitions, feature schema, model/baseline version, thresholds, random seed, evaluation date and environment.
2. Show baseline versus trained model on the **same held-out test split**. Display precision/recall/F1 for each class, macro F1, support counts, confusion matrices, uncertainty rate, pause-boundary error and processing/inference time. Clearly indicate missing/unavailable metrics.
3. Display dataset summary: recording counts, participants/sessions, number of windows per class, class imbalance, train/validation/test partitions and known collection constraints. Do not display sensitive participant details.
4. Include an error-analysis view with a few consented examples or anonymized sample identifiers; clearly separate manually labeled ground truth from predictions.
5. Link to reproducible training/evaluation commands and output artifacts. Never hardcode fabricated results or make success claims without evaluation files.
6. Handle incompatible schema, missing metrics, malformed values, class order mismatch and empty evaluation state. Charts must have accessible text/table alternatives.
7. Add a documented acceptance test using tiny **explicitly synthetic** fixtures to verify rendering and metric calculations, without presenting fixture numbers as real model performance.

## Acceptance
- Import of a real evaluation artifact displays consistent metrics and model-vs-baseline comparison.
- No evaluation artifact => clear 'Not evaluated yet' state, not invented scores.
- Independent calculation checks confirm confusion-matrix axes, class mapping and macro-F1.
- The final demo can open experiment results after demonstrating a recorded/imported solve.

## Agent procedure
Read all 00_* context files, inspect repo, implement and test this topic only, report validation and blockers. Never fabricate dataset, scores or browser compatibility.



## Cloud-first integration addendum (2026-10-16; additive)

Experiment evidence and model evaluation stay reproducible; cloud may store metadata/artifact references but do not infer model quality from hosted infrastructure.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/14_settings_backup/14_Settings_Export_Import_and_Privacy.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 14. Settings, Export, Import and Privacy

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the settings, export, import and privacy capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Central validated settings with defaults, versioning and reset; timer/puzzle/media/privacy preferences.
2. Versioned local backup and restore for sessions, solves, settings, labels and optional media.
3. Conflict resolution and data integrity on import; consent and delete-all controls.
4. No accounts required; no silent cloud upload; accessible data-retention explanations.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Settings, JSON/CSV export and import

## Assigned topic
Settings, JSON/CSV export and import

## Suggested files (adapt to existing repository)
features/settings/settingsService.ts, settingsSchema.ts, SettingsPanel.tsx, features/export/exportService.ts, importService.ts, fileValidator.ts

## Implementation requirements
Implement validated persisted settings for timer/inspection, default puzzle, theme, camera, analysis sensitivity, privacy and retention. Add CSV solve export and versioned JSON backup covering related sessions, solves, scrambles and analyses. Validate imports, preview counts, detect duplicate IDs, use transactions and preserve referential integrity. Document schema and conflict strategy.

## Acceptance tests and edge cases
Round-trip export/import, malformed file, duplicates, quota failures, invalid settings reset, no partial corrupted imports.


## Cloud-first integration addendum (2026-10-16; additive)

Cloud-backed per-user settings, authenticated data export/import, duplicate-safe restore, pending-outbox warnings, privacy notice, account deletion process and local media export remain required.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/15_quality_security/15_Testing_Accessibility_and_Security.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 15. Testing, Accessibility and Security

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the testing, accessibility and security capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Unit, integration and end-to-end tests across timer, storage, scrambles, media, inference and export.
2. Browser compatibility and accessibility: keyboard navigation, focus, screen readers, contrast, reduced motion.
3. Performance budgets, offline behavior, storage exhaustion, corrupt media, permission denied and crash recovery.
4. Privacy threat model, dependency review, no embedded credentials, safe file parsing.
5. Manual acceptance checklist and regression gates for every module.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Integration testing, documentation and graduation demo

## Assigned topic
Integration testing, documentation and graduation demo

## Suggested files (adapt to existing repository)
tests/unit/, tests/integration/, tests/e2e/, README.md, docs/architecture.md, docs/ai-methodology.md, docs/privacy.md, docs/evaluation.md

## Implementation requirements
Use Vitest and Playwright for timer-to-save, scramble association, penalties/statistics, camera denial, recording/analysis, persistence, migration and import/export. Document installation, run/build/test commands, data labeling, split design, baseline/model evaluation, limitations and privacy. Build a repeatable demo: scramble → timer → saved solve → statistics → recording → pause/movement analysis. Report only measured performance.

## Acceptance tests and edge cases
CI build/typecheck/tests pass; fresh install runs; graduation demo works without cloud; limitations clearly stated.


## Cloud-first integration addendum (2026-10-16; additive)

Add adversarial RLS and cross-owner FK tests, secret scanning, Auth lifecycle, multi-device sync, retry/idempotency, offline queue, service outage, migration and Storage policy tests.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/16_graduation_release/16_Graduation_Documentation_and_Release.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 16. Graduation Documentation and Release

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the graduation documentation and release capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Repeatable clean install, lint, typecheck, tests and production build; deployable offline-first app.
2. Architecture and data-flow diagrams, ER diagram, user guide, experiment methodology, known limitations.
3. Live demonstration script with offline fallback video, test evidence, screenshots and reproducible sample data.
4. Clear differentiation of shipped MVP, partially completed work and future research; school criteria pending.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Deployment, release, and reproducible handoff

## Goal
Ensure the completed project can be installed, tested and demonstrated on a fresh computer without secret accounts or undocumented setup.

## Suggested files
.env.example; README.md; docs/deployment.md; docs/browser-support.md; docs/release-checklist.md; scripts/check-environment.*; .github/workflows/ci.yml (if GitHub used); public/model-manifest.json (if applicable)

## Requirements
1. Detect actual package manager, scripts, framework and build target. Document supported Node/Python versions, install/build/test/dev commands and model artifact generation steps.
2. Create a documented configuration template without secrets. The offline/local MVP must run without Supabase keys, internet or camera access once dependencies/assets are available.
3. Set up CI (if repository platform supports it) to run lint, typecheck, unit tests and production build; do not claim browser E2E runs unless they actually do.
4. Verify relative asset paths, routing fallback, model/worker loading, CSP and camera secure-context requirements on the chosen hosting target. No unverified claims of cross-browser support.
5. Document browsers/devices tested, camera and codec restrictions, storage limits, offline behavior and optional feature flags. Ensure user-visible failures are graceful.
6. Provide data migration/backup and privacy checks; avoid committing videos, datasets with identifying information, credentials or oversized model artifacts without explicit decisions.
7. Write a 5–10 minute reproducible graduation demo script and contingency demo using a consented prerecorded local video if live camera fails. Include experiment results only if actually measured.
8. Record release version, known limitations, test commands/outcomes, remaining blockers, and precise MVP completion status.

## Acceptance
- Clean clone/install/build/run works using documented instructions on a tested environment.
- A user can demonstrate timer -> scramble -> save -> history/statistics -> video import/record -> analysis -> evaluation/report without optional cloud.
- No missing runtime model/worker assets in production build; privacy checks pass.
- CI and local test results are documented truthfully.

## Agent procedure
Read all 00_* files and 13_Testing_Docs, inspect repo, change only deployment/release scope, test actual build and report results.



## Cloud-first integration addendum (2026-10-16; additive)

Document Supabase setup, environment variables, SQL migrations, RLS evidence, deployment, cost/limits, offline timer fallback, seeded demo account and backup plan. Keep original AI evaluation evidence.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/17_verified_moves/17_Verified_Moves_and_Cube_Engine.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 17. Verified Moves and Cube Engine

**Delivery phase:** Post-graduation foundation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the verified moves and cube engine capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Parse standard cube notation (including primes, double turns, rotations and supported wide/slice moves).
2. Deterministic legal 3×3 state transitions, inverse moves, state serialization and solved-state validation.
3. Manual verified move entry, scramble replay and step-by-step state viewer.
4. Move timestamps and source provenance (manual/smartcube/camera); correction history and unit tests.
5. Do not present manually entered moves as camera-recognized.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Verified move events and future cube-tracking foundation

## Goal
Build a small, optional, testable bridge from the graduation MVP to future camera-based turn tracking and solution optimization. Do not make it a graduation blocker.

## Requirements
- Define canonical MoveEvent with solveId, notation, relative timestamp if known, source (MANUAL, SMART_CUBE, CAMERA_PREDICTED), confidence nullable, verification status and algorithm/schema version.
- Support user-entered 3×3 move sequences in standard notation; validate parsing, illegal tokens, orientation conventions and sequence consistency.
- Given an explicitly known starting cube state (from a scramble applied to a solved cube), replay verified moves through a vetted cube-state library and show a state timeline. Never infer moves from motion-only video.
- If the supplied move sequence does not reach the expected final state, show a mismatch and do not call it verified.
- Make timestamps optional for manually supplied moves; without timing, do not fabricate TPS or move-level video synchronization.
- Provide adapter boundary for future camera/smartcube move events, plus correction/verification workflow; no camera turn detection required here.
- Algorithm alternatives are future work unless based on a verified state, supported method and curated/tested algorithm set. Shorter move count alone is not equivalent to faster execution.

## Tests and done
Scramble + inverse returns solved; notation parsing, rotations, wide turns where supported, invalid states, provenance labels, missing timestamps, correction and persistence tests. Core timer/analysis unaffected if this module is disabled.



## Cloud-first integration addendum (2026-10-16; additive)

Versioned verified move events and cube snapshots use owner-scoped cloud records and provenance; local live engine remains responsive without network.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/18_algorithm_library/18_Algorithm_Library_and_Trainer.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 18. Algorithm Library and Trainer

**Delivery phase:** Post-graduation foundation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the algorithm library and trainer capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Versioned library of CFOP algorithms with setup, case identifiers, move sequences and user familiarity.
2. Notation validator, state-precondition tests and algorithm equivalence checks.
3. Favorites, practiced algorithms, rotation preferences and ergonomic notes.
4. Algorithm comparison only when exact input state and objective are known.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Cloud-first integration addendum (2026-10-16; additive)

Curated public algorithm library is read-only to general users; personal training records are owner-scoped. Review public-write abuse and versioning.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/19_turn_dataset/19_Turn_and_Gesture_Research_Dataset.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 19. Turn and Gesture Research Dataset

**Delivery phase:** Ultimate research  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the turn and gesture research dataset capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Capture controlled slow-turn sequences with explicit turn labels, timing, camera angle and participant ID.
2. Include cube rotations, regrips, occlusions, hands, non-turn motion and ambiguous frames.
3. Ground-truth move sequence independently verified; subject/session-separated splits.
4. Consent, retention and privacy; representative device/lighting variations.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# Turn and gesture ground-truth dataset

**Phase:** R1 — ULTIMATE-GOAL RESEARCH, not graduation gate.
**Prerequisites:** Verified move events and 3x3 scramble state engine.

## Objective and implementation instructions
Implement a consent-first collection and labeling pipeline for cube turns, cube rotations, hand movements and ambiguous frames. Define video and event schemas with start/end timestamps, notation, reference frame, participant/session IDs, camera setup, FPS, visibility and quality. Support video import and annotation corrections; add optional synchronized smartcube/manual ground truth, never treat estimated motion as exact truth. Create annotation guidelines, split manifest by participant/session, label quality review, data audit and reproducible exports. Keep training/validation/test disjoint. Tests: timestamp round trip, label schema validation, nonoverlapping split, deletion and export integrity.

## Agent protocol
Read every file in `master prompts/`, inspect repository and upstream contracts, explain plan, implement only this module and necessary typed integration, add tests, run available checks and report actual outcomes. Do not fake accuracy or train on unlabeled data. Stop for review before next module.

## Done when
Documented API and event schemas, working reproducible demo on actual data or explicitly marked experimental, automated tests and failure handling, metrics where appropriate, no regression in offline timer or graduation functionality.


## Cloud-first integration addendum (2026-10-16; additive)

Dataset consent and media privacy remain first-class. Use separate controlled research storage rather than assuming every clip belongs in public or unrestricted Supabase Storage.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/20_cube_hand_observation/20_Cube_and_Hand_Observation.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 20. Cube and Hand Observation

**Delivery phase:** Ultimate research  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the cube and hand observation capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Detect cube bounds, visible facelets/colors, pose/orientation and hand landmarks where possible.
2. Calibrate camera, lighting and color confidence; model hidden-face uncertainty explicitly.
3. Temporal association and occlusion recovery; log confidence and failure cases.
4. Do not claim full cube state from a single partial view.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# Cube and hand observation

**Phase:** R2 — ULTIMATE-GOAL RESEARCH, not graduation gate.
**Prerequisites:** Camera import, dataset, quality metadata.

## Objective and implementation instructions
Implement pluggable per-frame observation: cube bounding box/corners, approximate pose/orientation, visible face/sticker colors where reliable, optional hand landmarks, occlusion, blur, exposure and detection confidence. Separate observations from cube-state conclusions. Calibrate camera/cube coordinate frames; keep 3D orientation consistent through whole-cube rotations. Add debug overlay and frame-by-frame inspection, user correction and safe 'unknown' output. Avoid claiming hidden stickers are seen. Tests: synthetic coordinate transforms, dropout, missing hands, low light, no-camera fallback; benchmark latency.

## Agent protocol
Read every file in `master prompts/`, inspect repository and upstream contracts, explain plan, implement only this module and necessary typed integration, add tests, run available checks and report actual outcomes. Do not fake accuracy or train on unlabeled data. Stop for review before next module.

## Done when
Documented API and event schemas, working reproducible demo on actual data or explicitly marked experimental, automated tests and failure handling, metrics where appropriate, no regression in offline timer or graduation functionality.


## Cloud-first integration addendum (2026-10-16; additive)

Live observation remains local and latency-sensitive; cloud stores optional approved summaries/artifacts, not raw frame streams by default.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/21_turn_recognition/21_Camera_Move_Recognition.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 21. Camera Move Recognition

**Delivery phase:** Ultimate research  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the camera move recognition capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Recognize candidate face turns, rotations and regrips from synchronized observations.
2. Start with low TPS and controlled camera angle; measure per-move precision/recall and event timing.
3. Separate candidate generation from sequence decoding and verification.
4. Return unknown/ambiguous rather than hallucinate a move; manual correction path.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# Camera turn recognition at controlled slow TPS

**Phase:** R3 — ULTIMATE-GOAL RESEARCH, not graduation gate.
**Prerequisites:** Ground-truth dataset, observations, move simulator.

## Objective and implementation instructions
Build turn candidate detector and temporal classifier using hand/cube observations and/or short video clips. Output event {time interval, candidate Singmaster move, orientation frame, confidence, evidence, model version} plus UNKNOWN/rotation events. Start with fixed-camera slow TPS and limited face set, expanding only when held-out metrics justify it. Account for 90/180-degree turns, occlusion and adjacent rapid turns. Provide manual confirmation/edit and compare to ground-truth event sequences with tolerance. Tests: notation mapping, inverse, time ordering, ambiguous/no-turn segments; report per-move precision/recall/F1 and latency by TPS.

## Agent protocol
Read every file in `master prompts/`, inspect repository and upstream contracts, explain plan, implement only this module and necessary typed integration, add tests, run available checks and report actual outcomes. Do not fake accuracy or train on unlabeled data. Stop for review before next module.

## Done when
Documented API and event schemas, working reproducible demo on actual data or explicitly marked experimental, automated tests and failure handling, metrics where appropriate, no regression in offline timer or graduation functionality.


## Cloud-first integration addendum (2026-10-16; additive)

Inference and recognition must not wait for cloud calls; persist uncertain/verified provenance and research artifacts only with consent.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/22_state_reconstruction/22_State_Reconstruction_and_Recovery.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 22. State Reconstruction and Recovery

**Delivery phase:** Ultimate research  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the state reconstruction and recovery capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Combine known initial scramble, candidate moves, visible stickers and legal cube constraints.
2. Track state hypotheses and confidence; identify drift after missed/extra turns.
3. Resynchronize from observations or user correction; distinguish verified vs estimated states.
4. Test legal-state invariants, hidden faces and adversarial occlusions.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# Continuous cube-state reconstruction and error recovery

**Phase:** R4 — ULTIMATE-GOAL RESEARCH, not graduation gate.
**Prerequisites:** Verified cube engine and turn candidate events.

## Objective and implementation instructions
Implement state hypotheses from known initial scramble and probabilistic turn events, applying only legal moves. Distinguish full-cube rotations from face turns, preserve world/cube reference frames, and maintain uncertainty when camera evidence is insufficient. Compare intermittent sticker observations against predicted visible state, flag contradictions, request user correction or rescan, and backtrack/recover from missed turns. Keep auditable event provenance and before/after state snapshots. Tests: scramble replay, rotations, missed-turn simulation, correction propagation, impossible-state rejection, deterministic replay. Evaluate state accuracy and recovery on held-out recordings; never silently output false certainty.

## Agent protocol
Read every file in `master prompts/`, inspect repository and upstream contracts, explain plan, implement only this module and necessary typed integration, add tests, run available checks and report actual outcomes. Do not fake accuracy or train on unlabeled data. Stop for review before next module.

## Done when
Documented API and event schemas, working reproducible demo on actual data or explicitly marked experimental, automated tests and failure handling, metrics where appropriate, no regression in offline timer or graduation functionality.


## Cloud-first integration addendum (2026-10-16; additive)

Cube-state replay stays deterministic and local; cloud persists versioned snapshots/annotations under owner policies.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/23_method_segmentation/23_Method_Recognition_and_Phase_Analysis.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 23. Method Recognition and Phase Analysis

**Delivery phase:** Ultimate research  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the method recognition and phase analysis capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Start CFOP Cross/F2L/OLL/PLL segmentation from verified move/state trace.
2. Define stage boundary predicates and handling for unusual solve paths.
3. Later support Roux/ZZ using explicit method-specific rules and uncertainty.
4. Evaluate against human-labeled phase boundaries; do not infer stages from motion alone.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# Method-aware solve segmentation

**Phase:** R5 — ULTIMATE-GOAL RESEARCH, not graduation gate.
**Prerequisites:** Verified states, move sequence, manual stage annotations.

## Objective and implementation instructions
For CFOP first, derive Cross/F2L/OLL/PLL stage boundaries from validated cube-state predicates and move timestamps; handle alternative solve paths, rotations, skipped stages, partial cross and uncertain boundaries. Separate method chosen by user from method inferred by system. Add manual override and side-by-side human annotation comparison. Design adapters for Roux and ZZ without asserting equivalent phase structure. Tests: known CFOP sequences, stage skips, ambiguous transitions, state predicate invariants. Report boundary error and stage classification on verified held-out solves.

## Agent protocol
Read every file in `master prompts/`, inspect repository and upstream contracts, explain plan, implement only this module and necessary typed integration, add tests, run available checks and report actual outcomes. Do not fake accuracy or train on unlabeled data. Stop for review before next module.

## Done when
Documented API and event schemas, working reproducible demo on actual data or explicitly marked experimental, automated tests and failure handling, metrics where appropriate, no regression in offline timer or graduation functionality.


## Cloud-first integration addendum (2026-10-16; additive)

Method stage labels, confidence and user corrections sync as versioned private analysis records; no silent overwrite of manual ground truth.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/24_solve_optimization/24_Method_Specific_Solve_Optimization.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 24. Method-Specific Solve Optimization

**Delivery phase:** Ultimate research  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the method-specific solve optimization capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Generate legal alternative continuations from verified intermediate states and chosen method.
2. Compare move count, rotations, regrips and estimated execution difficulty; not shortest-only.
3. Explain assumptions, algorithm prerequisites and whether recommendation is verified or heuristic.
4. Do not claim globally optimal or faster without appropriate evidence.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# Verified solve optimization and alternatives

**Phase:** R6 — ULTIMATE-GOAL RESEARCH, not graduation gate.
**Prerequisites:** Validated cube states, move engine, method segmentation.

## Objective and implementation instructions
For a selected verified intermediate state, retrieve or generate alternative legal move sequences consistent with the user's method and current goal (e.g., CFOP cross/F2L case). Simulate every candidate from the EXACT same start state; verify the desired target and that preserved pieces remain correct. Rank by configurable move count, rotation count, algorithm familiarity and ergonomic heuristics, clearly distinguishing heuristics from measured speed. Show original vs alternatives and explain assumptions. Never label a solution globally optimal without proof and defined metric. Tests: solver verification, goal preservation, invalid candidate rejection, inverse consistency, regression examples.

## Agent protocol
Read every file in `master prompts/`, inspect repository and upstream contracts, explain plan, implement only this module and necessary typed integration, add tests, run available checks and report actual outcomes. Do not fake accuracy or train on unlabeled data. Stop for review before next module.

## Done when
Documented API and event schemas, working reproducible demo on actual data or explicitly marked experimental, automated tests and failure handling, metrics where appropriate, no regression in offline timer or graduation functionality.


## Cloud-first integration addendum (2026-10-16; additive)

User-specific recommendations use authorized solve data; compute locally/server-side as justified, and do not expose private histories in public rankings.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/25_personal_coaching/25_Personalized_Coaching.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 25. Personalized Coaching

**Delivery phase:** Ultimate research  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the personalized coaching capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. User method, known algorithms, preferred hand and ergonomics, practice goals.
2. Link specific verified inefficiencies to actionable exercises and alternatives.
3. Track whether coaching improves measured performance; avoid overconfident claims.
4. Privacy-preserving local profile and opt-in progress comparisons.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# Personalized training coach

**Phase:** R7 — ULTIMATE-GOAL RESEARCH, not graduation gate.
**Prerequisites:** Verified optimization, stage metrics, user preferences.

## Objective and implementation instructions
Build user-controlled method (CFOP first), preferred algorithms, strengths/weaknesses and goals. Merge measured pause/stage metrics with validated move-based analysis while labeling evidence source and uncertainty. Recommend focused practice such as cross planning, F2L lookahead, reducing rotations or learning a verified alternative algorithm; do not imply time savings without trials. Allow user feedback and before/after comparison across sessions, with privacy-safe local storage. Tests: deterministic recommendations, provenance labels, no recommendation from uncertain cube states, accessibility and opt-out.

## Agent protocol
Read every file in `master prompts/`, inspect repository and upstream contracts, explain plan, implement only this module and necessary typed integration, add tests, run available checks and report actual outcomes. Do not fake accuracy or train on unlabeled data. Stop for review before next module.

## Done when
Documented API and event schemas, working reproducible demo on actual data or explicitly marked experimental, automated tests and failure handling, metrics where appropriate, no regression in offline timer or graduation functionality.


## Cloud-first integration addendum (2026-10-16; additive)

Personal coaching settings and history are owner-scoped; explain data use and deletion. Preserve offline cached views where feasible.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/26_realtime_tracking/26_Real_Time_Tracking_Pipeline.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 26. Real-Time Tracking Pipeline

**Delivery phase:** Ultimate research  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the real-time tracking pipeline capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Bounded-latency camera capture, observation, turn decoding, state update and UI overlay.
2. Worker/backpressure strategy, FPS and latency reporting; graceful degraded mode.
3. Uncertainty alerts and correction without corrupting the underlying solve record.
4. Demonstrate low-TPS first; high-TPS reliability remains research milestone.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# Real-time camera pipeline and coaching overlay

**Phase:** R8 — ULTIMATE-GOAL RESEARCH, not graduation gate.
**Prerequisites:** Turn recognition, state tracking and coaching stable offline.

## Objective and implementation instructions
Build asynchronous video → observations → turn candidates → state hypotheses → UI pipeline. Use workers where supported and bounded queues; prioritize timer responsiveness. Show live confidence/UNKNOWN state, latency and drift; offer manual correction and fallback to post-solve analysis. Test variable FPS, frame drops, device heat, low lighting, long recordings and cancellation. Set measurable device-specific latency/accuracy targets before calling it real time. Do not assume one camera can fully observe hidden faces; maintain quality warnings and optional smartcube corroboration.

## Agent protocol
Read every file in `master prompts/`, inspect repository and upstream contracts, explain plan, implement only this module and necessary typed integration, add tests, run available checks and report actual outcomes. Do not fake accuracy or train on unlabeled data. Stop for review before next module.

## Done when
Documented API and event schemas, working reproducible demo on actual data or explicitly marked experimental, automated tests and failure handling, metrics where appropriate, no regression in offline timer or graduation functionality.


## Cloud-first integration addendum (2026-10-16; additive)

Never put Supabase round-trips on the real-time camera/gesture/state pipeline; upload only approved derived results asynchronously.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/27_scanner_solver/27_Cube_Scanner_and_Solver.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 27. Cube Scanner and Solver

**Delivery phase:** Optional  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the cube scanner and solver capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Guided six-face scan, sticker color calibration and legal-state validation.
2. Show uncertain facelets and correction UI; reject impossible states.
3. Integrate a verified 3×3 solving algorithm and step-by-step moves; separate from solve coaching.
4. No promise of robust live scanning without evaluation.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Experimental sticker scanning and solver

## Assigned topic
Experimental sticker scanning and solver

## Suggested files (adapt to existing repository)
features/vision/colorClassifier.ts, faceScanner.ts, cubeStateValidator.ts, CubeScanPage.tsx, features/solver/solverService.ts, solutionValidator.ts, SolutionViewer.tsx

## Implementation requirements
Build optional 3×3-only guided six-face scanner: grid overlay, sticker-center sampling, calibrated CIELAB colors, manual corrections, explicit face orientation, color counts and physical solvability checks. From a validated state, call a vetted Kociemba-style solver asynchronously; verify returned moves solve the supplied state and animate known sequence. Never call Kociemba output CFOP; do not pretend video motion detects cube state.

## Acceptance tests and edge cases
Reject impossible cube states, incomplete scans, poor color confidence, unsupported puzzle, solver timeout; correctness on known scrambles.


## Cloud-first integration addendum (2026-10-16; additive)

Scanning and solving work client-side where feasible; camera frames stay local unless explicit upload is implemented.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/28_smartcube_cloud/28_Smart_Cube_and_Optional_Cloud.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 28. Smart Cube and Optional Cloud

**Delivery phase:** Optional  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the smart cube and optional cloud capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Optional Bluetooth smart-cube adapter for verified move events; browser compatibility and permissions.
2. Cloud accounts/sync only after offline data contracts stabilize; encryption and conflict handling.
3. Never make accounts or BLE mandatory for timer, local data or graduation MVP.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Prior pack details retained for traceability

# RubiVision AI — Optional cloud sync and Bluetooth smart cubes

## Assigned topic
Optional cloud sync and Bluetooth smart cubes

## Suggested files (adapt to existing repository)
features/auth/authService.ts, features/sync/syncService.ts, storage/cloudRepository.ts, features/smartcube/bluetoothService.ts, deviceAdapters/, moveDecoder.ts

## Implementation requirements
Keep optional features behind flags. Cloud: user authentication, per-user row-level authorization, offline-first sync, conflict handling, status, export/delete and no secret keys in browser. Smart cube: explicit Bluetooth pairing, manufacturer-specific verified protocol adapters, timestamped decoded moves, disconnect/reconnect and known-move replay. Distinguish device-reported moves from camera predictions. Core app must work without either.

## Acceptance tests and edge cases
Offline and conflict tests, permissions, unsupported devices, connection loss, no cloud requirement for local solves.


## Cloud-first integration addendum (2026-10-16; additive)

Core Supabase Auth/database/sync is already mandatory from categories 02/02A. This optional category now focuses on Bluetooth smart cubes and advanced cloud features (shared accounts, rich media sync, collaboration, optional server inference), not initial cloud adoption.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.


---

## prompts/29_daily_challenges/29_Daily_Scrambles_and_Gamification.md

> **SUPABASE-ONLY ARCHITECTURE (2026-10-16):** Keep all feature functionality below, but any IndexedDB/local-database/offline-outbox requirement in older text is superseded. Supabase PostgreSQL is the only persistent app database; see master 11, 17, and categories 02/02A. No durable offline save is promised.

# 29. Daily Scrambles and Gamification

**Delivery phase:** Optional  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the daily scrambles and gamification capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Deterministic daily scramble by date, puzzle and versioned generator; explicit timezone rollover policy.
2. Daily challenge result, personal best, streaks, history and local achievements.
3. Prevent accidental duplicate challenge submissions; distinguish practice solves from challenge attempts.
4. Offline-first daily challenges; public leaderboards require accounts, integrity checks and anti-cheat, later.

## Integration contracts
- Consume and produce typed, versioned data through feature services, not direct cross-feature database writes.
- Use consistent puzzle identifiers (`222`–`777`), solve/session IDs and timestamps.
- Persist user-visible results and failures as appropriate; keep manual, AI-derived and verified values distinguishable.

## Acceptance and failure cases
- The documented happy path is demonstrable with sample data and a repeatable test.
- Invalid input, missing permissions, unsupported devices, interrupted operations and storage failures have explicit outcomes.
- Regression tests protect integration with earlier modules; failures are reported rather than hidden.

# Specification governance and regulations

- **Purpose:** This is a feature requirements document, not an instruction to implement the feature immediately. Future coding prompts must reference this specification and the shared contracts.
- **Priority:** Graduation modules are required for the proposed graduation build; ultimate and optional modules are not graduation blockers unless the school explicitly requires them.
- **Evidence:** Do not claim functionality, model accuracy, WCA compliance, exact move tracking or speed gains without implementation and tests.
- **Offline-first:** Timer, puzzles, history, statistics and core local analysis must not depend on an account or internet.
- **Data:** Stable IDs, UTC timestamps, millisecond durations, schema versions and provenance for generated/inferred/manual data. Preserve originals when creating derived analyses.
- **Privacy:** Camera access is opt-in; local video is private by default; deletion/export are user-controlled. Never upload silently.
- **Quality:** Define error states, accessibility, unit/integration tests and clear acceptance criteria; do not silently omit edge cases.
- **Boundary:** A movement/pause classifier does not identify exact moves or cube states. Advanced features require verified move evidence and independent evaluation.

## Cloud-first integration addendum (2026-10-16; additive)

Cloud enables shared challenges, but public leaderboard writes require server-side rules, validation, rate limiting and anti-cheat disclosures. Do not claim verified competition times from self-reported solves.

**Precedence:** Consult master documents 11–15 and category 02A for security, synchronization, ownership and migration acceptance tests. All original non-conflicting feature requirements above remain in force.
