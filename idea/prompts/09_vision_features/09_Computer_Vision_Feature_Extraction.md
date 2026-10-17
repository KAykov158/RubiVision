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
