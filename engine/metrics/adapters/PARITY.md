# Adapter parity matrix

Per P02-T01 + ADR-SHB-003. Authoritative reference for what features work on which warehouse adapter.

| Feature | Postgres | BigQuery | Snowflake |
|---|---|---|---|
| Aggregations (SUM, AVG, COUNT, MAX, MIN) | Blessed | Blessed | Blessed |
| Window functions | Blessed | Blessed | Blessed |
| Date arithmetic | Blessed | Blessed | Blessed |
| Recursive CTEs | Blessed | Best-effort | Blessed |
| Array operations | Blessed | Blessed | Blessed |
| JSONB operations | Blessed | Best-effort (uses STRUCT) | Best-effort (uses VARIANT) |
| Cost estimation pre-execution | EXPLAIN | dryRun | EXPLAIN |
| Read-replica support | Blessed | N/A | Blessed |
| pgvector semantic search | Blessed | Not-supported | Not-supported (use VECTOR_DISTANCE) |
| Row-level security | Off (engine policy layer) | Off | Off |

## Legend

- **Blessed** — works at parity; metric can use without caveats.
- **Best-effort** — works with documented degradation; metric author must annotate.
- **Not-supported** — feature-flagged off; metric refusing gracefully.

## See also

- ADR-SHB-003 (`docs/adr/shinhan-innoboost/003-warehouse-stack.md`) — authoritative warehouse decision
- P02-T01 — semantic metric layer FR
