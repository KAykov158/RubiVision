# RubiVision AI — Coding Agent Complete Pack

This is a **prompt and implementation-planning package**, not an implemented app. It contains the original source specifications, a reconciled Supabase-only architecture, 16 phase-specific agent prompts, one repair prompt, domain contracts, gates and an execution guide. Read `docs/EXECUTION_GUIDE.md`, then use `prompts/00_REPOSITORY_AUDIT.md` first.

**Source conflict:** original DOCX/MD files require IndexedDB and optional cloud; newer 02A requires Supabase-only persistence. This package deliberately follows 02A. Original files are preserved unchanged in `original_sources/` for traceability. A real repository audit is required before asserting any feature is implemented.

**Research integrity:** camera movement classification is not exact cube turn/state/CFOP recognition. Advanced research is isolated in prompt 14.
