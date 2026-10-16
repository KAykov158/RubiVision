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
