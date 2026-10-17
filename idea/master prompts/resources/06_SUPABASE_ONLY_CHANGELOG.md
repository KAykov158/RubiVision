# Supabase-only change log
- Replaced original category 02 local database file with `02_Supabase_PostgreSQL_Schema.md`.
- Rewrote 02A for Auth, RLS, client integration and cloud-only saves.
- Replaced master cloud guidance 11–15 with Supabase-only rules; added master 17 implementation guide.
- Updated roadmap and entry-point precedence and all references to old category 02 path.
- Preserved the original feature category specifications and graduation/research content; old storage-specific language is explicitly superseded rather than used as implementation requirements.
- Rebuilt complete plan as full standalone document containing all 30 category specs.
- No IndexedDB database, persistent outbox or automatic offline sync is part of the approved architecture.
