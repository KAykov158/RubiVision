# Acceptance test matrix

| ID | Level | Scenario | Expected |
|---|---|---|---|
| SH-001 | Unit | NONE penalty | effective = raw |
| SH-002 | Unit | PLUS_TWO | effective = raw + 2000 |
| SH-003 | Unit | DNF | effective = null |
| SH-004 | DB | Negative/NaN time | rejected |
| SH-005 | DB | Raw time update | rejected |
| SH-006 | DB | Mismatched puzzle relationships | rejected |
| SH-007 | DB | Cross-owner session reference | rejected |
| SH-008 | RLS | User A reads B's solve | denied |
| SH-009 | RLS | User A edits B's solve | denied |
| SH-010 | RLS | Anonymous access | matches explicit auth policy |
| SH-011 | Integration | Duplicate completion events | exactly one solve |
| SH-012 | Integration | Timeout then retry same UUID | exactly one solve |
| SH-013 | Integration | Session creation failure | dependent save blocked |
| SH-014 | E2E | Confirm save then reload | solve remains visible |
| SH-015 | E2E | Offline save | unsaved visible, no false confirmation |
| SH-016 | E2E | Create/rename/switch/delete sessions | consistent selection |
| SH-017 | E2E | Filter puzzle/session/date/tags | correct server results |
| SH-018 | E2E | Identical timestamps across pages | stable no duplicate/skip |
| SH-019 | E2E | Edit penalty | raw unchanged, stats updated |
| SH-020 | E2E | Delete then undo | restore within documented window |
| SH-021 | Integration | Two-device conflicting edit | explicit conflict handling |
| SH-022 | Integration | JSON export/import round-trip | relationships preserved |
| SH-023 | Integration | Duplicate import | documented idempotent policy |
| SH-024 | Integration | Malformed import | zero partial writes |
| SH-025 | Integration | Bulk mixed-owner IDs | unauthorized records untouched |
| SH-026 | Integration | Recording/analysis links | correct authorized references |
| SH-027 | Migration | Existing data upgrade | no data loss |
| SH-028 | Migration | Fresh install | schema + policies installed |
| SH-029 | UI | Keyboard/screen reader | usable focus and labels |
| SH-030 | Performance | 10k solves | paginated; no full client fetch |
| SH-031 | CI | lint/typecheck/unit/integration/e2e/build | actual results recorded |

Do not mark PASS without an executed test, environment and evidence. Use BLOCKED if infrastructure or credentials are unavailable.
