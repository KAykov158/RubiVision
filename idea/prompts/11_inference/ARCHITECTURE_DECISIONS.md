# Architecture reconciliation and recommended improvements

## Source-derived requirements versus deliberate improvements
The uploaded 2026-10-16 browser inference note explicitly supersedes older IndexedDB/local-database/offline-outbox persistence with Supabase PostgreSQL as the only persistent application database. Older master, roadmap, category specs and DOCX repeatedly describe offline-first IndexedDB. The newer note also references master sections 11–15 and category 02A that were not among supplied files; obtain these before treating their details as authoritative. Its lower-priority cloud-first addendum mentions an offline pending fallback, contradicting its top-level no durable offline-save note. Resolve in favor of the explicit top-level note: no durable offline queue, no offline persistence promise.

## Durable vs ephemeral data
- Durable metadata: Supabase Postgres with RLS and transactions.
- Durable uploaded video: optional private Supabase Storage with explicit opt-in; do not imply PostgreSQL stores video binaries.
- Browser-local media: user-selected File/Blob, in-memory arrays and object URLs; discard on reload unless explicitly uploaded.
- Browser auth/session: official Supabase client may persist auth tokens as designed; this is not an app domain database.
- Network outage: timer continues, but completed solve is UNSAVED until acknowledged. Offer copy/export of unsaved data; never silently discard.
- Analysis: may run on transient local media; saving derived results requires authenticated network write.

## Scope and dependency resolution
The DOCX frames 3×3 as the mandatory MVP; other topic files propose 222–777. Implement and test 3×3 first, then add 222–777 as expansion if time permits. The older roadmap lists cloud as optional; latest architecture makes Supabase persistence foundational and thus moves auth/database before save/history.

## Recommended technical shape
React + TypeScript strict + Vite; domain pure functions; typed services and repositories; Supabase Auth/PostgreSQL/Storage; Vitest + Playwright; Web Workers for heavy feature extraction; Python scikit-learn offline training; compatible browser inference model with manifest parity. Verify actual repository and libraries before adopting.

## Product honesty
Classifying movement is not turn recognition. Frame motion does not determine exact cube state or CFOP. A Kociemba-style solver is not CFOP. A saved scramble is a known virtual cube state, not evidence of a physical cube state.
