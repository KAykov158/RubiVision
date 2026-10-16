# Architectural precedence and corrections

1. **Supabase-only database:** Newest 2026-10-16 camera directive supersedes older IndexedDB, local-database, offline-outbox and durable offline-save claims. Use Supabase PostgreSQL for persistent application data. Local temporary video bytes and in-memory unsaved solve data do not constitute persistent application databases.
2. **Offline behavior:** Timer and local processing can work offline; Supabase-backed saving and history cannot be guaranteed offline. Show NOT SAVED, retry when online, and offer explicit export of unsaved in-memory solve data where feasible.
3. **Privacy:** Camera and media processing opt-in; no video upload without an additional explicit action. Supabase Storage media private with ownership, access control, deletion and quotas.
4. **Graduation scope:** The older DOCX requires a 3×3 experimental MVP; modular prompts suggest 2×2–7×7. Implement 3×3 reliably before expansion.
5. **Scientific integrity:** MOVEMENT/PAUSE/UNCERTAIN does not prove exact turns, cube state, CFOP phase or TPS. Model results need leakage-safe held-out evidence.
6. **WCA:** Verify latest official rules and scramble standards before claiming compliance; until then use qualified descriptions.
7. **Unresolved source references:** The camera spec references master sections 11–15 and category 02A not supplied here. Request missing authoritative material; document all assumptions.
8. **Source files retained:** Conflicting historical text is preserved verbatim under source_specs for traceability, not as active overriding requirements.
9. **Auth decision:** Supabase-only persistence does not itself determine whether accounts are mandatory. Phase 02 must decide and document authentication/anonymous policies with secure RLS; never use an open public write policy.
10. **Recording storage:** Metadata in PostgreSQL; video bytes temporarily local, with opt-in private Supabase Storage upload. Do not silently treat Storage as a general-purpose database.
