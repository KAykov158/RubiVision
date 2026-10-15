# RubiVision AI — 04 Solves & Storage: individual agent prompts

Run these prompts sequentially. Each file is self-contained and designed to be supplied individually to an AI coding agent. These expand the original `04_Solves_Storage.md` without replacing shared project contracts.

01. [Domain entities, runtime validation and pure calculations](01_Domain_Types_and_Validation.md)
02. [Database schema, access layer and indexes](02_IndexedDB_Schema_and_Indexes.md)
03. [Schema versioning and migrations](03_Migrations_and_Backward_Compatibility.md)
04. [Session CRUD and persistence](04_Session_Repository.md)
05. [Session selection and management UI](05_Session_Selection_and_UI.md)
06. [Immutable scramble records and association](06_Scramble_Persistence_and_Integrity.md)
07. [Atomic save and exactly-once persistence](07_Solve_Repository_and_Atomic_Save.md)
08. [Solve edits, penalties and notes](08_Penalty_Notes_and_Effective_Time.md)
09. [Safe deletion of solves and sessions](09_Deletion_Policy_and_Referential_Integrity.md)
10. [History filtering, sorting and scale](10_History_Queries_and_Pagination.md)
11. [Accessible history UI and solve inspection](11_History_Table_and_Solve_Details.md)
12. [Quota, unavailable storage and user recovery](12_Storage_Failures_and_Recovery.md)
13. [Timer/history/statistics integration contracts](13_Statistics_and_Module_Integration.md)
14. [Comprehensive automated test suite](14_Unit_Integration_and_Migration_Tests.md)
15. [Storage module verification and documentation](15_Final_Audit_and_Handoff.md)

**Important decision:** Until camera/analysis deletion dependencies are implemented, deleting nonempty sessions should be blocked instead of performing a partial cascade. This is a safe implementation recommendation, not a claim that the existing repository already does it.
