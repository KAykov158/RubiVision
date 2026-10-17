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
