---
title: "Build semantic metric layer with registry and lineage tracking"
author: "@cyberskill-engine-tech-lead"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: minimal
target_release: "2026-06-12"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Build the semantic metric layer that sits between natural-language questions and warehouse SQL: a versioned, lineage-tracked registry of metrics defined declaratively in YAML (name, dimensions, grain, formula, owner, freshness expectations, sensitivity tier), exposed via a gRPC + REST API, with cross-warehouse adapters (Postgres / BigQuery / Snowflake at parity for blessed features), full lineage traceability (every metric maps back to source tables/columns), and impact analysis (changing a metric definition surfaces every downstream consumer). The metric layer is the seam between the LLM-driven NL→SQL pipeline (P02-T02) and the warehouse; without it, every question becomes a one-off SQL generation with no governance, no reuse, no lineage. This is the foundation of the demo's "we do this safely" claim.

## Problem

The Form Answers commit explicitly to "semantic metric layer translating natural language to governed SQL" (SF9 form answer; consistent across SS1, SF9, SB5). The Innoboost Q&A's repeated emphasis on feasibility for a financial institution and on commercial readiness means a one-off-SQL-generation engine fails the test. Metric layers are the standard architectural answer; we ship one.

Specific gaps if we shortcut:

- **Without a registry, every NL→SQL request reinvents the metric.** A question about "monthly disbursement" might compute slightly differently each time; this is the quintessential "you got two different numbers from the same chat" credibility-destroyer.
- **Without lineage, we cannot answer "where does this number come from?"** Citations (P02-T04) depend on lineage; reviewers depend on it; auditors require it.
- **Without versioning, metric definitions drift silently.** Changing a metric must be a deliberate, reviewable, versioned act.
- **Without owner-of-record, governance is undefined.** A metric must have an owner who is on the hook for accuracy.
- **Without freshness expectations, stale data answers as if fresh.** Confidence-tier scoring (P02-T05) consumes freshness; without it, we cannot warn the user "this number is 36 hours stale".
- **Without sensitivity tiers per metric, RBAC (P01-T07) cannot scope per-metric access.** Sensitivity drives policy-layer decisions (P02-T03).
- **Without warehouse-portable adapters at parity for blessed features, the multi-warehouse claim breaks.** Bank's Power BI sits on top of one warehouse; SVFC's MIS uses another; SS1's Securities team runs another. The metric layer must serve all three identically.

The demo-build-plan.md describes the metric layer in detail (Phase 2.1):
- "dbt-style metrics catalogue: every metric defined as a YAML (name, dimensions, grain, formula, owner, freshness, sensitivity tier)"
- "Metric registry API (gRPC + REST). Versioned."
- "Lineage tracking: every metric maps to source tables/columns; impact analysis on schema change."
- "Sensitivity tiers: Public / Internal / Restricted / Regulated. Drives downstream RBAC + masking."

The `shinhanos_tech_stack` memory note locks Postgres + pgvector for ShinhanOS; the demo metric layer will use Postgres for its registry storage (separate from the customer warehouse). pgvector enables semantic search over metric definitions at registry-query time (P02-T02 retriever uses this).

The `feedback_p1_scope_preference` memory note biases us richer. For the metric layer, "richer" means: owner per metric + freshness per metric + sensitivity per metric + lineage to source tables + impact analysis + warehouse-portability across at least three adapters + admin UI for metric governance + documented metric-authorship workflow. Each layer is doable; together they form the core of the chat-with-data system.

## Proposed Solution

A metric-registry service in `engine/metrics/` exposing:

1. **Declarative YAML definition format.** Each metric in `engine/metrics/definitions/{metric-name}.yaml` with documented schema.
2. **Postgres-backed registry.** Metric definitions parsed and stored in Postgres on deploy; pgvector embedding stored alongside for semantic retrieval (P02-T02).
3. **gRPC + REST API.** `GET /metrics/{name}`, `LIST /metrics?tag=X`, `POST /metrics/{name}/lineage` (returns lineage tree), `POST /metrics/{name}/impact` (returns affected metrics if this one changes).
4. **Warehouse adapters.** `PostgresAdapter`, `BigQueryAdapter`, `SnowflakeAdapter`, each implementing the same `IWarehouseAdapter` interface; metric SQL generation is per-adapter; tests verify same metric → same numerical result across adapters on the same dataset.
5. **Versioning.** Each metric has a version; changes produce a new version; old versions remain queryable; consumers pin to a version.
6. **Lineage and impact analysis.** Lineage tree from metric → tables → columns; impact graph from a column → which metrics consume it.
7. **Admin UI surface.** Admin console (P05-T05) browses the registry, shows lineage diagrams, supports impact analysis on proposed changes.
8. **Metric authorship workflow.** New metrics: PR with the YAML; review by metric owner + a peer; deployment activates after CI green.

Setup target: 21 days from task assignment.

### Subtasks

- [ ] **Author the metric YAML schema.** Document at `engine/metrics/SCHEMA.md`. Required fields: `name` (kebab-case); `description` (one paragraph); `owner` (handle); `version` (semver); `formula` (a SQL expression with parameters for each warehouse adapter, OR a generic expression that adapters compile from); `dimensions` (list); `grain` (e.g., `daily`, `monthly`, `branch`); `freshness_expected` (e.g., `< 24 hours`); `sensitivity` (`public` / `internal` / `restricted` / `regulated`); `source_tables` (list); `source_columns` (mapping); `tags` (e.g., `["consumer-finance", "p&l"]`); `examples` (list of sample questions that should resolve to this metric).
- [ ] **Define the metric storage schema.** Postgres tables: `metrics(id, name, version, definition_yaml, definition_hash, created_at, owner)`; `metric_dimensions(metric_id, dimension_name)`; `metric_lineage(metric_id, source_table, source_column)`; `metric_embeddings(metric_id, embedding vector(1536))` for pgvector retrieval.
- [ ] **Implement the YAML loader and validator.** Parser at `engine/metrics/loader.ts` reads YAML files from `definitions/`, validates against schema, normalises, computes hash, prepares for storage.
- [ ] **Implement deploy-time registry sync.** On deploy, the loader reads all YAML definitions, syncs to Postgres registry, generates embeddings (using OpenAI text-embedding-3-large or Qwen-Embedding per ADR-SHB-002), stores embeddings.
- [ ] **Implement the gRPC + REST API.** Server in `engine/metrics/api.ts`. gRPC `MetricService` with methods: `GetMetric`, `ListMetrics`, `GetLineage`, `GetImpact`, `SemanticSearch` (used by P02-T02 retriever). REST is a thin proxy via grpc-gateway.
- [ ] **Implement IWarehouseAdapter interface.** Define in `engine/metrics/adapters/types.ts`. Methods: `compileMetric(metric, params): SQL`; `executeQuery(sql): Result`; `validateQuery(sql): ValidationResult`; `getCostEstimate(sql): CostEstimate`; `getCapabilities(): CapabilitySet`.
- [ ] **Implement PostgresAdapter.** First adapter; canonical implementation in `engine/metrics/adapters/postgres.ts`. Compiles the metric formula to Postgres-flavoured SQL with prepared statements; uses `pg` client; supports `EXPLAIN` for cost estimation.
- [ ] **Implement BigQueryAdapter.** Similar structure; uses `@google-cloud/bigquery`; Standard SQL dialect; `dryRun: true` for cost estimation.
- [ ] **Implement SnowflakeAdapter.** Similar structure; uses `snowflake-sdk`; Snowflake SQL dialect.
- [ ] **Build the adapter parity matrix.** Document at `engine/metrics/adapters/PARITY.md`. Every metric-layer feature × every adapter, marked `Blessed` (works at parity), `Best-effort` (cloud-only with documented degradation), `Not-supported`. ADR-SHB-003 (P00-T02) authoritative; this is the implementation of that ADR.
- [ ] **Implement versioning.** Each metric YAML carries a version; the registry stores all versions; consumers pin to a version on creation. Default: latest. Migrating consumers to a new version is a deliberate act with audit-log.
- [ ] **Implement lineage tracking.** From the metric's `source_tables` and `source_columns` declarations; lineage tree built on registry sync. Lineage API returns the tree; admin UI renders as a graph.
- [ ] **Implement impact analysis.** When a YAML change is proposed (in PR review), CI computes which other metrics depend on the changed source columns; flags the impact. `metric:impact-analyse PR-ID` returns a list of affected metrics + their owners.
- [ ] **Build admin UI for metric governance.** In P05-T05 admin console: registry browser; per-metric detail page (definition, lineage diagram, version history, recent queries); proposed-change preview (impact analysis).
- [ ] **Author the metric-authorship workflow.** Document at `engine/metrics/AUTHORSHIP.md`. Steps: identify the question pattern; design the metric (formula, dimensions); author YAML; review by metric owner + peer; submit PR; CI runs; deploy.
- [ ] **Author seed metrics for the demo.** ~20 metrics across the three BUs to populate the registry. Metrics chosen to support the gold-set Q&A (P04-T01). Domain SME (per P04-T01) authors them; engine team translates to YAML.
- [ ] **Test exhaustively.** Per metric: same metric → same numerical result on Postgres and BigQuery (using a sample dataset with the same schema replicated); semantic search returns the right metric for the right question; lineage tree is correct; impact analysis is correct.

### Acceptance criteria

- Metric YAML schema documented with examples.
- Postgres storage schema operational.
- ~20 seed metrics authored, validated, stored, embeddings generated.
- gRPC + REST API operational with full CRUD-style interface.
- PostgresAdapter, BigQueryAdapter, SnowflakeAdapter all compile and execute the seed metrics; numerical results match on a sample dataset.
- Adapter parity matrix documented.
- Versioning operational; old versions queryable.
- Lineage and impact analysis operational; admin UI surfaces them.
- Metric-authorship workflow documented.
- Test suite > 100 tests covering metric definitions, adapters, semantic search.

## Alternatives Considered

- **Use dbt directly as the metric layer.** Rejected: dbt is excellent for transformation pipelines but not as a runtime metric service; we need runtime API queries with sub-second latency for citations and lineage, which dbt isn't designed for. We borrow the *pattern* of declarative YAML metrics; we don't deploy dbt.
- **Use a commercial metric layer (Cube, Lightdash, MetricFlow).** Rejected: ties us to a vendor; the demo's portability story is weakened. Reconsider for production track if the sophistication of one of these tools becomes worth the lock-in.
- **Generate SQL on-the-fly from natural language with no metric registry.** Rejected: this is the original problem — every question becomes one-off SQL; consistency is impossible. The metric layer is non-optional.
- **Store metrics as code (TypeScript modules) instead of YAML.** Rejected: YAML is more inspectable; non-engineers (domain SMEs) can read and edit; the storage in source control is cleaner.
- **Skip warehouse adapters; only support Postgres.** Rejected: ADR-SHB-003 commits to multi-adapter; Bank reviewers will likely test against their own warehouse stack.
- **Skip versioning; mutate metric definitions in-place.** Rejected: in-place mutation breaks reproducibility; if a Shinhan reviewer queried a metric at time T1 and then again at T2 with a changed definition, the answer changes silently. Versioning is the seam.
- **Use a graph database for lineage.** Rejected: lineage scale is small (hundreds of metrics × tens of source columns); Postgres relational tables are sufficient. Reconsider if scale grows.

## Success Metrics

- **Primary**: 20 seed metrics implemented and verified with numerical equality on Postgres and BigQuery within 21 days of task assignment. Measured by: cross-adapter equality test results.
- **Guardrail**: Zero metric-definition-drift incidents during the engagement. Measured by: registry-vs-YAML diff in CI; any drift triggers investigation.

## Scope

### In scope
- Metric YAML schema + loader + validator.
- Postgres storage + embeddings.
- gRPC + REST API.
- Postgres / BigQuery / Snowflake adapters at parity for blessed features.
- Versioning + lineage + impact analysis.
- Admin UI surfaces (backend; frontend in P05-T05).
- ~20 seed metrics for the demo.
- Test suite covering metric correctness, adapter parity, semantic search, lineage.
- Documentation: schema, adapter parity, authorship workflow.

### Out of scope
- Time-series-specific optimisations (out of scope for demo phase).
- Metric materialisation (pre-computing for performance) — handled by the cache layer (P02-T08), not here.
- Federated queries across warehouses — out of scope.
- Schema-change propagation (when a source column is renamed, the metric must be updated by the owner; not auto-renamed).
- Public-facing metric API for non-engine consumers (deferred unless required).
- Metric-quality scoring (e.g., "this metric is 95% accurate against ground truth") — handled by Phase 4 eval, not here.

## Dependencies

- **Upstream**: P01-T01 (monorepo); P01-T03 (secrets — for warehouse credentials); P01-T04 (IaC — Postgres + warehouse access); P01-T07 (RBAC — for sensitivity-tier authorisation); P00-T02 ADR-SHB-003 (warehouse stack).
- **Downstream**: gates P02-T02 (NL→SQL pipeline), P02-T04 (citation engine), P02-T05 (confidence tiers), P02-T08 (cache), P05-T05 (admin UI).
- **People**: engine tech lead authoring; eng-data co-authoring adapters; domain SMEs authoring seed metrics.
- **Memory references**: `shinhanos_tech_stack`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: Embedding model — OpenAI text-embedding-3-large (cloud, fast) or Qwen-Embedding (on-prem capable)? Recommendation: dual-mode per ADR-SHB-002 routing matrix; cloud-default uses OpenAI, on-prem uses Qwen.
- Q2: For the formula in YAML, do we use a generic expression language or per-adapter SQL? Recommendation: per-adapter SQL fields for the demo phase (`formula_postgres`, `formula_bigquery`, `formula_snowflake`); a generic expression compiler is a future-state.
- Q3: How do we handle schema changes in the source warehouse (e.g., a column renamed by Shinhan's data team)? Recommendation: the metric owner's responsibility; CI detects (via a daily warehouse-schema diff) and alerts; not auto-rename.
- Q4: For the seed metrics, who authors? Recommendation: domain SMEs from CyberSkill's eng-data team author the SQL; engine team translates to YAML. Engagement A's pattern reuse (per P00-T01 sponsor consent) informs the structure.
- Q5: For the impact analysis, is it run on PR or on deploy? Recommendation: PR — engineers see impact before merge; deploy is too late.

## Implementation Notes

- The pgvector embedding column is `vector(1536)` for OpenAI text-embedding-3-large or `vector(1024)` for Qwen-Embedding; size at registry creation; converters needed if model changes.
- For per-adapter SQL fields, use named parameters (e.g., `:tenant_id`, `:start_date`); the adapter binds parameters; SQL injection is impossible by construction.
- For lineage, store a normalised list of `(source_table, source_column)` pairs; query lineage as `WHERE metric_id = X` returning the rows.
- For impact analysis, query the inverse: `WHERE source_table = X AND source_column = Y` returning the metrics that consume that column.
- For versioning, the metric ID is `{name}:{version}`; the registry indexes by both; consumers pin by name+version explicitly.
- For semantic search, the retrieval query uses pgvector's `<->` operator (cosine distance) plus a filter on `tenant_id` and `sensitivity ≤ caller's allowed tier`.
- For the parity matrix, automate cross-adapter testing: same metric × same dataset → same numerical result. Failure of equality is a CI failure.
- For seed-metric authoring, take the gold-set Q&A from P04-T01 (when ready) as the canonical "what questions must our metric layer answer?" list. Reverse-engineer the metrics from the questions.

## Test Plan

- Test 1: YAML schema — author a malformed YAML; verify the loader rejects with a clear error.
- Test 2: Registry sync — sync 20 seed metrics; verify all 20 land in Postgres with correct fields and hashes.
- Test 3: Embedding generation — verify embeddings exist for all 20 metrics; verify embedding cosine-similarity for semantically-similar questions returns the right metric.
- Test 4: API — `GetMetric`, `ListMetrics`, `GetLineage`, `GetImpact`, `SemanticSearch` all return correct data.
- Test 5: Adapter equality — sample dataset replicated to Postgres and BigQuery; for each of 20 metrics × each adapter; verify numerical equality.
- Test 6: Versioning — publish v1 of a metric; query; publish v2; verify v1 still queryable; v2 returns updated definition.
- Test 7: Lineage — for a sample metric, verify lineage tree is correct against the YAML.
- Test 8: Impact analysis — propose a change to a source column; verify all dependent metrics are flagged with their owners.
- Test 9: Sensitivity-tier integration — RBAC says viewer can read internal but not restricted; verify a viewer's query for a restricted-tier metric is denied.
- Test 10: Performance — `GetMetric` p95 < 50ms; semantic search p95 < 200ms.

## Rollback Plan

- A bad metric YAML is rolled back via PR revert + redeploy; old version is still queryable.
- A bad adapter implementation is rolled back via revert; alternate adapter routes around it.
- A bad embedding model swap is rolled back by re-generating embeddings with the previous model; pgvector queries continue working with whichever embedding column has values.
- A bad lineage / impact-analysis bug is rolled back via revert; admin UI degrades gracefully (shows N/A for lineage if the service is down).

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Metric YAML schema | `engine/metrics/SCHEMA.md` | Engine tech lead | Continuous |
| Metric definitions | `engine/metrics/definitions/*.yaml` | Engine tech lead | Continuous |
| Adapter parity matrix | `engine/metrics/adapters/PARITY.md` | Engine tech lead | Continuous |
| Authorship workflow | `engine/metrics/AUTHORSHIP.md` | Engine tech lead | Continuous |
| API documentation (OpenAPI / proto) | `engine/metrics/api.proto`, `docs/api/metrics.md` | Engine tech lead | Continuous |
| Test results | CI history | Engine tech lead | Per CI retention |
| Cross-adapter equality test results | CI history | Engine tech lead | Per CI retention |
| Lineage and impact UI screenshots | Project workspace | Engine tech lead | Continuous |

## Operational Risks

- **Metric drift between YAML and registry.** Mitigation: deploy-time validator rejects drift; nightly sync verification.
- **Cross-adapter result divergence.** Mitigation: adapter-equality test in CI; numerical-precision floats handled with tolerance.
- **Embedding model change invalidates retrieval.** Mitigation: dual-column or full re-embedding on model swap; documented in runbook.
- **Source schema change breaks a metric.** Mitigation: nightly schema-diff alerts metric owners; impact analysis catches at PR time.
- **Sensitivity-tier misclassification.** Mitigation: review by metric owner + peer; periodic audit by compliance lead.

## Definition of Done

- All 20 seed metrics shipped, queryable on three adapters at parity.
- API operational; tested.
- Lineage + impact analysis operational; tested.
- Admin UI backend operational (frontend lives in P05-T05).
- Documentation published.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
The metric layer itself does not consume training data; it consumes warehouse data at query time. Embeddings are generated by an external model (OpenAI text-embedding-3-large or Qwen-Embedding) over metric *descriptions* (not customer data). No customer data leaves the customer warehouse for embedding generation.

### Human Oversight
Every metric is authored by a domain SME and reviewed by metric owner + peer in PR. Sensitivity tiers are explicitly assigned and audited. Changes are versioned. Admin UI lets compliance officers audit the registry.

### Failure Modes
If a metric's formula is incorrect (returns a wrong number), the eval harness (P04-T03) catches it; the metric is patched and re-deployed. If the registry service is down, the engine falls back to a degraded state — pre-cached answers continue working; new questions return "service degraded" with a confidence-tier of N/A. If embeddings are stale (model upgrade), the retrieval may return slightly different metrics; this is a performance issue, not a correctness issue.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections. Implementation is human-authored by the engine team; metric-formula authoring is human-authored by domain SMEs.
- **Human review**: engine tech lead authors and reviews implementation; eng-data reviews adapters; domain SMEs author seed metrics; `@stephen-cheng` ratifies the metric-authorship workflow.
