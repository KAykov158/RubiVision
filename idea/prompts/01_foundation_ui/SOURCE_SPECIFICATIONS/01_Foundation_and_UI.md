> **SUPABASE-ONLY ARCHITECTURE OVERRIDE (2026-10-16).** This Foundation source pack preserves older requirements for traceability. Any requirement below that calls for IndexedDB, another browser/local database, localStorage application persistence, durable offline writes, or automatic synchronization is superseded by master documents 11 and 17. Supabase PostgreSQL is the sole persistent application database; Supabase Auth and owner-scoped RLS apply to future cloud access. A failed write may remain only in volatile tab memory and must be explicitly unsaved. Domain contracts and non-storage product requirements remain unless separately superseded.

# 01. Foundation and UI

**Delivery phase:** Graduation  
**Specification status:** Planned requirements; not a claim of implementation.

## Purpose and user value
This module provides the foundation and ui capability within RubiVision AI. It must integrate through documented contracts and remain independently testable.

## Functional requirements
1. Responsive application shell; navigation for Timer, Solves, Statistics, Analyze, Challenges, Settings.
2. Accessible keyboard/touch/mobile interaction; error, loading, empty, unavailable, and connectivity/unsaved states with honest persistence messaging.
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
- **Connectivity:** Timer measurement may continue without internet; history and other persistent writes require Supabase connectivity and must show unsaved status when not acknowledged. No local database or automatic offline synchronization is allowed.
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
Keyboard accessibility, responsive breakpoints, no hidden overflow, error boundaries, page navigation, no direct database calls from visual components, and persistence only through the typed Supabase service boundary.

