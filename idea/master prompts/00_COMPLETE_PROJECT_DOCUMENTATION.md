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
| Persistent sessions and statistics (Supabase PostgreSQL; supersedes the earlier IndexedDB plan) | Required | Maintain | Maintain |
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

> **Historical architecture statement — superseded:** The following paragraph records the earlier IndexedDB design. Current implementation must use Supabase PostgreSQL as the sole persistent application database; do not add IndexedDB, localStorage application persistence, a durable offline queue, or automatic synchronization. See the current authority notice at the end of this document and master decisions 11/12/13/17.

> **Superseded historical requirement, retained for traceability:** A reliable training application cannot treat solve history as incidental UI state. It needs durable, versioned persistence, integrity rules, storage quota handling, backup and migration. The earlier graduation architecture proposed **IndexedDB** for structured records; large video blobs could be stored through a browser-supported media storage adapter (for example IndexedDB blobs or OPFS), with capability detection and graceful fallback. This paragraph is not current implementation guidance.

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

If video model quality is modest, the project can still present a legitimate AI experiment if data collection, training, evaluation and error analysis are real and well documented. If live camera fails, use imported consented footage. The earlier fallback to keep the app offline-first when cloud features are unfinished is superseded: under the current architecture, present cloud-backed features as unavailable until the Supabase service is implemented. Do **not** substitute fabricated performance or a generic external API for missing experimental work.

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

Current architecture decision: Supabase PostgreSQL is the sole persistent application database; Supabase Auth and owner-scoped RLS are required for cloud access. No IndexedDB, other browser/local database, localStorage application persistence, durable offline outbox, or automatic synchronization is permitted. Failed writes may remain only in volatile tab memory and must be shown as unsaved. The older storage, cache and offline-first passages in this preserved source document are historical requirements, superseded by master documents 11 and 17 and categories 02/02A; all non-conflicting product, research and evidence requirements remain.
