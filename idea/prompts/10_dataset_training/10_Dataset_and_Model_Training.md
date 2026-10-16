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
