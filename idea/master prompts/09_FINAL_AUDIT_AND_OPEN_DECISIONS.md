> **SUPABASE-ONLY ARCHITECTURE OVERRIDE (2026-10-16).** This file retains earlier requirements for traceability. Any instructions here to use IndexedDB, another browser/local database, localStorage for application persistence, a durable offline write queue, or automatic synchronization are superseded by master documents 11 and 17. Supabase PostgreSQL is the sole persistent application database; Supabase Auth and owner-scoped RLS govern future cloud data. A failed write may remain only in volatile tab memory with an explicit unsaved state. Other requirements remain unless separately superseded.

# Final specification audit and open decisions

## Coverage checked
- [x] Separate foundation/UI and dedicated database module.
- [x] All 2×2–7×7 puzzles, timer, optional inspection, +2/DNF and settings.
- [x] Sessions, statistics, backup and privacy.
- [x] Camera, local video import, time alignment and manual labeling.
- [x] Feature extraction, genuine model training, baseline, held-out evaluation, browser inference, uncertainty.
- [x] Graduation report, demonstration, tests, release gates and traceability.
- [x] Verified moves, algorithm library, future camera turn tracking and state reconstruction.
- [x] Method segmentation, solve optimization, coaching, real-time integration.
- [x] Optional scanner, smartcube/cloud, daily scramble gamification.
- [x] Cross-module data contracts and post-completion change control.

## Strengthened in this edition
1. Full comprehensive documentation replaces the former short summary as the authoritative design reference.
2. Dedicated change-control guide explains adding timer functions **after** timer completion.
3. Graduation compliance/evidence matrix separates supplied guidance from school-specific approvals.
4. Release gate and regression matrix reduces risk of later module changes breaking earlier work.
5. Resources folder distinguishes official references from proposed technologies and user-supplied text.
6. Clarified that the numbered `prompts/` folders contain **requirements specifications, not ready-to-run coding prompts**.

## Still legitimately unknown
- Supervisor-approved individual diploma assignment, due date, page limits and grading rubric.
- Exact browser/device support and recording consent arrangements.
- Dataset quantity and measured model performance; must come from real work.
- Whether verified-move replay can fit before graduation.
- Detailed technical decisions dependent on prototypes, codec support and evaluation.

No document can eliminate all future changes. Record justified changes using `06_CHANGE_CONTROL_AND_FEATURE_EXTENSIONS.md` rather than reorganizing the entire package.
