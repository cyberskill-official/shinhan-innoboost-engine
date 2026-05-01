---
title: "Build two-tier cache (L1 in-process + L2 Redis) with versioning"
author: "@cyberskill-engine-tech-lead"
department: engineering
status: draft
priority: p1
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: not_ai
target_release: "2026-07-10"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Build a two-tier cache to meet the engine's latency targets — L1 in-process LRU (1K entries, 5-minute TTL) for hot questions; L2 Redis (10K entries, 1-hour TTL) for warm questions across pods. Cache keys include metric version, RBAC scope, sensitivity, freshness window, so a metric definition change or RBAC change correctly invalidates. Cache values are full pipeline outputs (intent + SQL + result + narrative + citations + confidence). Targets: median latency p50 < 1.5s on cache hit; cache hit rate > 60% on the gold-set; zero stale-data answers (TTL + version-aware invalidation). Cache is the structural enforcement of "answers in seconds" without compromising correctness.

## Problem

Form Answers commit to "p50 < 5s on cached metrics, < 30s on ad-hoc". A pipeline that calls the LLM on every question cannot meet those numbers — Claude API latency alone is often 2–5s. Cache is the difference between a 1.5s response (cache hit, no LLM call) and an 8s response (cold pipeline run with LLM).

Specific gaps if we shortcut:

- **Without cache, the engine is LLM-bound.** Every question = an LLM call = 2–5s minimum.
- **Without cache versioning, stale answers reach users when metrics change.** A cached answer for "monthly disbursement" computed against metric v1 must be invalidated when metric v2 ships.
- **Without RBAC-scope in cache key, a viewer's cache hit might leak an analyst's restricted answer.** Tenant + role + sensitivity must all be part of the key.
- **Without freshness-window in the cache key, stale data answers as confidently as fresh.** Cache entries shorter than the data's freshness expectation.
- **Without cache observability, hit rates are unknown.** "Did the cache help?" should be answerable with metrics.

The `feedback_p1_scope_preference` memory note biases us richer. For caching, "richer" means: two-tier (L1 in-process + L2 Redis) + version-aware keys + RBAC-scoped + freshness-aware + observability + admin invalidation surface. Each layer is straightforward; together they form a production-grade cache.

## Proposed Solution

A two-tier cache module in `engine/cache/`:

1. **L1 (in-process LRU).** Per-pod, 1K entries, 5-minute TTL. Hot questions don't even leave the pod.
2. **L2 (Redis).** Cluster-wide, 10K entries, 1-hour TTL. Warm questions hit Redis instead of running the full pipeline.
3. **Cache key schema.** `{tenant_id, role, sensitivity_max, question_hash, metric_version, freshness_window_id}`. Any change in any component → cache miss.
4. **Cache value.** Full pipeline output: `{ intent, metric_used, sql_executed, table, chart, narrative, citations, confidence, breakdown, generated_at }`.
5. **Invalidation paths.** Time-based (TTL); metric-version-bump; manual (admin invalidate via UI).
6. **Observability.** Hit rate per tier; eviction count; cache-saturation alarms.
7. **Admin surface.** Browse cache; invalidate specific keys; clear cache for a metric.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Define cache key normalisation.** Question text is normalised (whitespace collapse, lowercase for case-insensitive variants, semantic-equivalence for very-similar questions via embedding); hash of normalised question is the question component of the key. Documented at `engine/cache/KEY_SCHEMA.md`.
- [ ] **Implement L1 LRU.** `engine/cache/l1.ts`. Uses `lru-cache` package; per-pod; 1K entries default; 5-minute TTL; on read-hit, refresh TTL; on read-miss, query L2.
- [ ] **Implement L2 Redis client.** `engine/cache/l2.ts`. Connects to managed Redis (P01-T04 cluster); SET with TTL; GET on read; key namespace `cache:innoboost:{env}:{tenant}:{rest}`.
- [ ] **Implement cache-aware NL→SQL pipeline integration.** P02-T02 pipeline checks L1 first, then L2; on hit, returns immediately; on miss, runs full pipeline and writes to both tiers.
- [ ] **Implement metric-version invalidation.** When a metric is upgraded (via P02-T01 deploy), the cache module receives a notification (Postgres LISTEN/NOTIFY or Redis pub/sub) and invalidates all cache entries containing that metric.
- [ ] **Implement freshness-window invalidation.** When source-data freshness changes (e.g., daily refresh job runs), cache entries past the freshness window are evicted.
- [ ] **Implement cache observability.** Per-pipeline-call: log L1 hit / L2 hit / miss; aggregate metrics. Dashboard panel in P09-T02.
- [ ] **Implement admin invalidation API + UI.** Admin can invalidate by: specific cache key; all entries for a metric; all entries for a tenant; all entries (panic button).
- [ ] **Implement cache stampede protection.** First request for a missing key acquires a per-key lock (via Redis); subsequent requests for the same key wait on the lock; first request fills cache; subsequent reads from cache. Prevents N concurrent requests from running N expensive pipelines.
- [ ] **Implement cache-warming for known questions.** Sample top-K most-frequent questions from observability; pre-warm cache after deploys to avoid cold-start penalty.
- [ ] **Test exhaustively.** > 100 tests covering: key correctness, hit / miss paths, invalidation, stampede protection, observability.

### Acceptance criteria

- L1 + L2 both operational; pipeline integrates correctly.
- Cache key includes tenant + role + sensitivity + version + freshness; tested for correctness.
- Invalidation on metric-version bump and freshness-window change.
- Stampede protection works under concurrent load.
- Hit rate > 60% on the gold-set after warming.
- p50 latency < 1.5s on cache-hit path.
- Admin invalidation API + UI surface (backend) operational.
- Test suite > 100 tests, > 90% coverage of `engine/cache/`.

## Alternatives Considered

- **Single-tier (Redis only).** Rejected: Redis adds ~5ms overhead even on a hit; in-process is < 1ms; the L1/L2 split saves compounded latency.
- **In-process only (no Redis).** Rejected: pod restart loses cache; cluster-wide warm questions miss; doesn't scale.
- **Cache the SQL result only, not the full pipeline output.** Rejected: re-running narrative generation alone is ~1s; caching the full output is faster.
- **Use Memcached instead of Redis.** Rejected: Redis is the team's standard; Memcached doesn't support pub/sub for invalidation.
- **Skip cache; rely on warehouse query speed.** Rejected: warehouse query is one component of latency; LLM generation is the bigger component.
- **Skip versioning; assume cache is short-lived enough.** Rejected: stale answers are credibility-destroying; versioning is non-negotiable.
- **Cache for an entire conversation (multi-turn).** Rejected: v1 is single-turn; multi-turn cache is a separate task in v1.1.

## Success Metrics

- **Primary**: p50 latency < 1.5s on cache-hit path within 14 days. Measured by: load-test results.
- **Guardrail**: Zero stale-cache-hit incidents (a cached answer surfaced after underlying metric/freshness changed). Measured by: nightly cache-correctness audit.

## Scope

### In scope
- L1 in-process LRU cache.
- L2 Redis cache.
- Cache key schema and normalisation.
- Pipeline integration.
- Metric-version + freshness-window invalidation.
- Stampede protection.
- Cache warming.
- Observability + admin surface.
- Test suite.

### Out of scope
- Multi-turn conversation cache.
- Cache for non-engine surfaces (HITL, admin UI).
- Cache for warehouse-side query results (warehouse-side caching is the warehouse's responsibility).
- Cross-tenant cache sharing (forbidden by design).

## Dependencies

- **Upstream**: P01-T04 (Redis); P02-T01, P02-T02, P02-T05; P09 (observability).
- **People**: engine tech lead authoring; eng-data reviewing key normalisation; eng-sec reviewing invalidation correctness.
- **Memory references**: `shinhanos_tech_stack`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: Cache TTL — 5 min L1 / 1 hour L2 are defensible defaults; tune per-metric via the metric's `freshness_expected` field. Recommendation: yes, derive TTL from metric-freshness.
- Q2: Question normalisation — exact-string vs. embedding-based fuzzy match? Recommendation: exact-string for v1; fuzzy via embedding for v1.1.
- Q3: Cache size — 10K L2 entries holds maybe a day of unique questions per BU. Sufficient? Recommendation: yes for demo; scale up for production track.
- Q4: For stampede protection, lock TTL? Recommendation: 30s; if a request takes longer, the lock expires and a second request can proceed.
- Q5: Cache warming — schedule (nightly?) and which top-K questions? Recommendation: nightly; top-50 most-frequent in last 7 days.

## Implementation Notes

- L1 uses `lru-cache` v10.x; supports `max`, `ttl`, `updateAgeOnGet` flags.
- L2 connection pool sized 10–20 per pod; `ioredis` client.
- Cache key as JSON-stringified-then-hashed (SHA-256, base64url-encoded) — short, collision-resistant.
- For invalidation pub/sub, use Redis channel `cache-invalidate:{env}`; engine subscribes; on message, evicts.
- For observability, use OpenTelemetry counters: `cache.l1.hits`, `cache.l1.misses`, `cache.l2.hits`, `cache.l2.misses`, `cache.evictions`.
- For admin invalidation, the admin UI surfaces it; the backend exposes `POST /admin/cache/invalidate` with scoping.

## Test Plan

- Test 1: L1 hit / miss; verify TTL behaviour; verify LRU eviction.
- Test 2: L2 hit / miss; verify TTL; verify cluster-wide visibility.
- Test 3: Cache key correctness — same question different tenant → different key.
- Test 4: Metric-version invalidation — bump version; verify cache misses on next request.
- Test 5: Freshness invalidation — simulate freshness change; verify eviction.
- Test 6: Stampede — 100 concurrent requests for the same missing key; verify only one runs the full pipeline.
- Test 7: Hit-rate measurement on gold-set after warm; verify > 60%.
- Test 8: Latency — p50 cache hit < 1.5s.

## Rollback Plan

- A bad cache configuration is rolled back via runtime config.
- A bad cache key bug is rolled back via PR revert; cache cleared.
- If cache produces incorrect results, the panic-button admin invalidation flushes everything; pipeline serves uncached until fixed.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Cache implementation | `engine/cache/` | Engine tech lead | Continuous |
| Key schema | `engine/cache/KEY_SCHEMA.md` | Engine tech lead | Continuous |
| Hit-rate metrics | Central observability store | Engine tech lead | Continuous |
| Admin invalidation log | P02-T09 audit log | Eng-sec | 1 year |
| Test suite | `engine/cache/__tests__/` | Engine tech lead | Continuous |

## Operational Risks

- **Redis outage.** Mitigation: pipeline falls back to L1-only or full-pipeline on every request; latency degrades but correctness preserved.
- **Cache-key collision (different questions hash to same key).** Mitigation: SHA-256 makes collision negligible; tenant scoping further reduces.
- **Cache poisoning (a wrong answer cached).** Mitigation: invalidate-on-error pattern; any pipeline error invalidates the cache key.
- **Cache TTL too long (stale answers).** Mitigation: derive from metric freshness; admin invalidation as safety valve.

## Definition of Done

- L1 + L2 + integration + invalidation + stampede + warming + observability all in place.
- Hit rate + latency targets met.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: engine tech lead authors implementation; eng-data reviews key normalisation; eng-sec reviews invalidation correctness.
