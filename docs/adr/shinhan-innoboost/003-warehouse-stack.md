# ADR-SHB-003: Warehouse Stack

- **Status**: Proposed
- **Date**: 2026-05-02
- **Authors**: @platform-tech-lead, @stephen-cheng
- **Ratifier**: @stephen-cheng
- **Supersedes**: (none)

## Context

The demo-build-plan.md commits to "Postgres (laptop demo), BigQuery + Snowflake adapters (cloud demo), on-prem Postgres adapter (commercialisation track)." It does not specify which warehouse-adapter features are blessed across all three backends, which are best-effort, and which are not supported.

The SF9 Form Answers reference "BigQuery, Snowflake, and on-prem PostgreSQL warehouses." The SB5 brief involves a Bank with established BI tooling that almost certainly is not on Postgres. Multi-adapter support is a credibility signal in the interview, not optional polish.

Without a feature-parity matrix, engine engineers will write features that work in BigQuery but silently fail or produce different results on Postgres — exactly the kind of subtle bug Shinhan reviewers will detect at the worst possible moment.

The Innoboost Q&A confirms commercial-phase deployment "must be deployed per SBV regulations" — making on-prem Postgres the commercialisation-track primary, not a fallback.

## Decision

Use PostgreSQL 16 as the default warehouse for laptop demo and on-prem deployment, with BigQuery (Standard SQL) and Snowflake adapters as pluggable cloud targets — governed by a feature-parity matrix that classifies every metric-layer feature as Blessed, Best-effort, or Not-supported per backend.

## Consequences

Positive consequences:
- On-prem deployment uses the same Postgres that runs in the laptop demo — no behavioural surprises between demo and production.
- Feature-parity matrix removes per-engineer ambiguity — centralised reference prevents duplicated investigation.
- Multi-adapter architecture makes the "we work with your existing warehouse" claim demonstrable.
- Read-replica-only engine access eliminates write-side mutation risks.

Negative consequences:
- Maintaining three adapter implementations is more engineering surface than single-adapter.
- Feature-parity matrix requires active maintenance — features added without matrix updates drift silently.

Neutral consequences:
- Postgres extensions (pgvector, pg_partman, pg_stat_statements, pg_audit) are on-prem-friendly and do not create cloud-lock-in.
- Row-level security is handled at the engine policy layer (P02-T03), not at the warehouse RLS layer — maximises portability but means the engine must enforce what the warehouse could have enforced natively.

## Warehouse Configuration

### Default Warehouse: PostgreSQL 16

- **Extensions**: pgvector (vector search), pg_partman (time-series partitioning), pg_stat_statements (query performance), pg_audit (audit logging)
- **Deployment**: laptop (Docker Compose), on-prem (Helm), cloud (RDS/CloudSQL)
- **Version**: PostgreSQL 16.x (LTS)

### Cloud Adapter: BigQuery

- **SQL dialect**: Standard SQL
- **Access**: BigQuery API via service account; read-only
- **Use case**: SF9 / SB5 customer stacks where BigQuery is the existing warehouse

### Cloud Adapter: Snowflake

- **SQL dialect**: Snowflake SQL
- **Access**: Snowflake connector; read-only
- **Use case**: SF9 / SB5 customer stacks where Snowflake is the existing warehouse

### Engine Access Pattern

- **Read path**: read-replica only for engine queries. Engine never writes to the customer warehouse.
- **Audit log writes**: go to a separate Postgres instance (per P02-T09). Never to the customer warehouse.
- **Connection pooling**: PgBouncer for Postgres; native pooling for BigQuery/Snowflake.

### Row-Level Security Strategy

Row-level security is handled at the **engine policy layer** (P02-T03), not at the warehouse's native RLS layer. Rationale: portability. Postgres RLS, BigQuery row-level access, and Snowflake row-access policies have incompatible APIs. Enforcing at the engine layer means one implementation covers all three backends.

The engine policy layer adds the appropriate `WHERE` clauses based on the user's RBAC scope and the metric's sensitivity tier before any query reaches the warehouse.

## Feature-Parity Matrix

Every metric-layer feature × every backend, classified as:
- **Blessed** ✅ — works at full parity; tested in CI; regressions block merge
- **Best-effort** ⚠️ — cloud-only or Postgres-only; documented degradation; tested but not blocking
- **Not-supported** ❌ — feature-flagged off on this backend; graceful error message

| Feature | Postgres | BigQuery | Snowflake | Notes |
|---|---|---|---|---|
| Basic metric lookup | ✅ | ✅ | ✅ | Core path; must work everywhere |
| Aggregation (SUM, AVG, COUNT, etc.) | ✅ | ✅ | ✅ | Standard SQL; all backends |
| Time-series grouping (DATE_TRUNC) | ✅ | ✅ | ✅ | Minor syntax differences handled by adapter |
| Window functions (ROW_NUMBER, RANK) | ✅ | ✅ | ✅ | Standard SQL:2003 |
| CTEs (WITH clauses) | ✅ | ✅ | ✅ | Standard SQL |
| Lateral joins | ✅ | ⚠️ | ⚠️ | BigQuery uses UNNEST; Snowflake uses FLATTEN |
| Array/JSON operations | ✅ | ⚠️ | ⚠️ | Syntax varies significantly; adapter translates |
| Full-text search on metric descriptions | ✅ | ❌ | ❌ | Postgres `tsvector`; no equivalent on BQ/SF |
| Vector similarity search (pgvector) | ✅ | ❌ | ❌ | Postgres-only; cloud uses API-side embedding search |
| Time-series partitioning (pg_partman) | ✅ | ⚠️ | ⚠️ | BQ uses partitioned tables natively; SF uses clustering |
| Query cost estimation | ✅ | ✅ | ✅ | EXPLAIN on Postgres; dry-run on BQ; query profile on SF |
| Row-count cap enforcement | ✅ | ✅ | ✅ | LIMIT clause; all backends |
| Query timeout enforcement | ✅ | ✅ | ✅ | statement_timeout (PG); timeout_ms (BQ); STATEMENT_TIMEOUT_IN_SECONDS (SF) |
| Tenant isolation (WHERE predicate) | ✅ | ✅ | ✅ | Engine-side enforcement; backend-agnostic |
| Metric freshness check | ✅ | ✅ | ✅ | Metadata timestamp comparison; backend-agnostic |
| Schema introspection | ✅ | ✅ | ✅ | information_schema; all backends |
| Lineage tracking | ✅ | ✅ | ✅ | Engine-side; reads metric registry, not warehouse metadata |
| Audit logging of queries | ✅ | ✅ | ✅ | Engine-side; writes to separate audit Postgres |
| Materialized views for caching | ✅ | ⚠️ | ⚠️ | BQ uses materialized views differently; SF uses dynamic tables |
| PITR / backup integration | ✅ | ❌ | ❌ | Postgres PITR; BQ/SF have their own backup mechanisms |

### Matrix Maintenance Rules

1. Every PR that adds a new metric-layer feature must update this matrix.
2. A feature marked ✅ on any backend must have a CI test for that backend.
3. A feature marked ⚠️ must have documentation of the degradation and a user-visible fallback (e.g., "This feature is not available on your warehouse" message with confidence-tier downgrade).
4. A feature marked ❌ must be feature-flagged off — the UI does not show it; the API returns a clear error code.

## Alternatives considered

- **ClickHouse.** Rejected: no production experience on the team; learning-curve cost during demo timeline is unjustifiable.
- **DuckDB as primary.** Rejected: excellent for laptop demo but weak for on-prem multi-user concurrency; doesn't scale to the PoC's expected reviewer load.
- **MongoDB or other NoSQL.** Rejected: does not match the metric-layer SQL-generation model; would require a fundamentally different NL→query pipeline.
- **Single-vendor warehouse-only commitment (e.g., Postgres only).** Rejected: the SF9/SB5 briefs reference BigQuery and Snowflake environments; single-vendor closes off customer fit.
- **Skip the feature-parity matrix; resolve incompatibilities case-by-case.** Rejected: case-by-case means each engineer performs the same investigation in parallel; the matrix removes that duplication.

## Implementation

- Task IDs unblocked: P01-T04 (IaC — warehouse infrastructure), P01-T08 (encryption — warehouse-level encryption config), P02-T01 (semantic metric layer), P02-T08 (caching — cache key includes warehouse backend).
- Configuration changes: warehouse adapter selection in `engine/config/warehouse.ts`; adapter implementations in `engine/adapters/{postgres,bigquery,snowflake}/`.
- Documentation updates: this matrix is the canonical reference for engine engineers adding new metric capabilities.

## Open Questions (carried from P00-T02 FR)

- Q4: Do we ship BigQuery/Snowflake as working adapters or architectural placeholders? **Decision: ship working adapters with tests, but only seed Postgres data for the interview.** BigQuery and Snowflake adapters are integration-tested against emulators or sandbox accounts; the interview demo uses only Postgres.

## Sign-off

- [ ] Ratifier: @stephen-cheng on ____-__-__
- [ ] Engine tech lead: @______ on ____-__-__
- [ ] Platform tech lead: @______ on ____-__-__

## Supersession chain

- This ADR supersedes: (none)
- This ADR is superseded by: (none yet)
