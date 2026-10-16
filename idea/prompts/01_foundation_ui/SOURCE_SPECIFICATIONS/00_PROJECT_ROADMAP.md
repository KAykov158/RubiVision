> **SUPABASE-ONLY ARCHITECTURE OVERRIDE (2026-10-16).** This Foundation source pack preserves older requirements for traceability. Any requirement below that calls for IndexedDB, another browser/local database, localStorage application persistence, durable offline writes, or automatic synchronization is superseded by master documents 11 and 17. Supabase PostgreSQL is the sole persistent application database; Supabase Auth and owner-scoped RLS apply to future cloud access. A failed write may remain only in volatile tab memory and must be explicitly unsaved. Domain contracts and non-storage product requirements remain unless separately superseded.

# RubiVision AI — Roadmap and Dependency Gates

## Current category sequence (authoritative)

Follow master document 11 and `idea/master prompts/03_DEVELOPMENT_ROADMAP.md`: Category 01 Foundation → **02 Supabase PostgreSQL schema, migrations, constraints, and generated database types** → **02A Supabase Auth, owner-scoped RLS, and cloud repositories** → 03 puzzles/scrambles → **04 timer** → **05 solve/session functionality** → later categories.

The phase table below is retained as historical source material. Its old Phase 2 Timer / Phase 3 Solves ordering is superseded as an execution sequence by the current category order above. Do not use its phase numbers to select the next implementation prompt; non-conflicting domain and feature requirements remain in force.

## Sequence and dependencies
| Phase | Topic prompts | Dependency | Exit gate |
|---|---|---|---|
| 0 | All 00_* files | Existing repository inspected | Shared types, scripts, tech choices and scope agreed |
| 1 | 01 Foundation/UI | Phase 0 | Responsive shell, navigation, error boundaries |
| 2 | 02 Timer; 03 Scrambles/Cube (scramble part) | Phase 1 | Accurate timer and valid scrambles independent of storage |
| 3 | 04 Solves/Storage | Phases 1–2 | Save exactly once; reload, session CRUD, penalties |
| 4 | 05 Statistics | Phase 3 | Verified rolling averages and DNF handling |
| 5 | 06 Camera/Recording | Phase 3 | Permission flow, playback, recording linked to solve |
| 6 | 07 Vision/Features | Phase 5 | Timestamped motion features and quality warnings |
| 7 | 08 Dataset/Training | Phase 6 + labeled footage | Leakage-safe baseline vs trained model evaluation |
| 8 | 09 Inference/Analysis | Phases 6–7 | Model/browser compatibility and synchronized timeline |
| 9 | 11 Settings/Import/Export; 13 Testing/Docs | Phases 1–8 | Round-trip backup, full MVP regression and graduation demo |
| 10 (optional) | 03 Cube visualization; 10 Scanning/Solver; 12 Cloud/SmartCube | Stable MVP | Each extension independently tested |

## Rules
- Treat the table as a dependency order, not a demand to implement every optional feature.
- Keep 3D scramble visualization optional if it delays valid scramble generation.
- Do not begin ML performance claims until labeled data and held-out evaluation exist.
- Save checkpoints or commits after each phase; keep a running changelog of decisions and known issues.
- If a prerequisite is absent, create a minimal tested interface or stop and report the blocker; do not silently invent upstream behavior.

## MVP release gate
User can choose 2×2–7×7, generate scrambles, time and persist solves, edit penalties, view correct statistics, optionally record, analyze movement/pause/uncertain intervals with documented model limits, and export data. Core functionality works without camera or model. Include a reproducible baseline-vs-model report with actual metrics if training data exists; otherwise label AI evaluation as incomplete, not successful.
