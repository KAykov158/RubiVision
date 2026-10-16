> **SUPABASE-ONLY ARCHITECTURE OVERRIDE (2026-10-16).** This file retains earlier requirements for traceability. Any instructions here to use IndexedDB, another browser/local database, localStorage for application persistence, a durable offline write queue, or automatic synchronization are superseded by master documents 11 and 17. Supabase PostgreSQL is the sole persistent application database; Supabase Auth and owner-scoped RLS govern future cloud data. A failed write may remain only in volatile tab memory with an explicit unsaved state. Other requirements remain unless separately superseded.

# Final archive audit and maintenance notes

**Audit date:** 2026-10-16. **Status:** All included Markdown documents decode as UTF-8; all 29 numbered feature categories have a corresponding specification; archive CRC integrity test passes.

## Structural checks
- Exactly two top-level folders: `master prompts/` and `prompts/`.
- 29 chronological categories (`01`–`29`), one specification in each.
- Comprehensive project documentation and the graduation-resource references are included.
- Dedicated database, timer/inspection, puzzle sizes 2×2–7×7, camera, dataset training, evaluation, change control and daily challenges are represented.
- `00_PROJECT_DOCUMENTATION.md` is a small intentional compatibility index, **not** a second full documentation file. Use `00_COMPLETE_PROJECT_DOCUMENTATION.md` as canonical.
- Removed one obsolete instruction in the video-annotation specification referring to legacy flat filenames; updated the specification-usage entry point.

## Items not verifiable by inspecting a documentation archive
- The software is not implemented or tested by this audit.
- The project has not been approved against an individual Bulgarian school assignment, deadline or rubric.
- WCA-style inspection and scramble algorithms still require actual implementation and event-specific tests.
- Machine-learning results, dataset size, model accuracy and browser compatibility are not established by this pack.
- Exact repository source-file lists must be finalized during architecture planning against the actual codebase.

## Implementation regulation
Before coding, read `master prompts/10_START_HERE_AND_FILE_MAP.md` and the relevant shared regulations and category specification. Implement incrementally. When extending a completed category, record the requirement, inspect dependencies, propose a scoped change, preserve existing data and run regression tests. Do not interpret the folder name `prompts` as a set of executable coding commands.
