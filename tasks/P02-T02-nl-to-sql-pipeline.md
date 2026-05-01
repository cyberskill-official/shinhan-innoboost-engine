---
title: "Implement NL→SQL pipeline (intent + retriever + generator + validator)"
author: "@cyberskill-engine-tech-lead"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: user_facing
eu_ai_act_risk_class: limited
target_release: "2026-06-19"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Implement the natural-language-to-SQL pipeline that converts a user's question into a governed, validated, executed query against the warehouse: an intent classifier (lookup / aggregation / trend / comparison / freeform); a retriever that finds top-k relevant metrics from the registry (P02-T01) via pgvector semantic search; a constrained SQL generator that proposes SQL using Claude Sonnet 4.6 (or Qwen-72B on-prem); a validator that parses the proposed SQL and rejects anything touching unauthorised tables, dropping rows, mutating state, or missing the tenant predicate; an executor against the read-replica with timeout and row-cap; and a result post-processor that shapes the output into a table + chart + narrative. The pipeline is the core of the chat-with-data experience; correctness here is the structural enforcement of every "we get the right answer" claim.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"Power BI tool has limited access for ICT-Reporting Team only. Not widely used among the bank." — Shinhan Bank, SB5 brief (paraphrased from CyberSkill SB5 form answer)
</untrusted_content>

<untrusted_content source="form_answer_excerpt">
"Self-service BI accessible to non-technical management." — SVFC, SF9 brief (paraphrased)
</untrusted_content>

## Problem

The Form Answers commit explicitly to "ask in natural language and get an audited answer in seconds." The Innoboost Q&A's evaluation criteria (Section V.4) prioritise feasibility for a financial institution and innovation in AI adoption. A NL→SQL pipeline that hallucinates, that returns inconsistent answers across runs, that exposes data outside RBAC scope, or that breaks under adversarial prompts fails on all three counts.

Specific gaps if we shortcut:

- **Without intent classification, every question is treated identically.** Lookup queries are served from cache; aggregations need a fresh execution; freeform questions might require clarification — these need different handling.
- **Without a retriever, SQL generation is "guess from a thousand metrics".** Top-k retrieval narrows the LLM's search space dramatically; better grounding, lower latency, lower cost.
- **Without a constrained SQL generator, the LLM can hallucinate table names or join keys.** Constraints (only metrics from the registry; only tables in the metric's lineage) bound the hallucination space.
- **Without a validator, the LLM's mistakes reach the warehouse.** SQL injection, table escape, mutation operations, missing tenant filter — every one of these fails the validator.
- **Without timeouts and row-caps, a runaway query consumes the warehouse.** Both safety and cost.
- **Without result shaping, the user gets raw rows; the user wants narrative + chart + table.**

The Innoboost Q&A's Section VI.6 calls this out specifically: "GenAI is probabilistic but banking needs deterministic auditable decisions." The validator + constrained generator + policy layer (P02-T03) is exactly the answer to that objection: probabilistic LLM, deterministic validation, deterministic execution.

The `cyberos_ai_compliance` memory note's 7 primitives include constrained SQL generation as one of the technical primitives that satisfies multi-jurisdictional rules.

The `feedback_p1_scope_preference` memory note biases us richer. For NL→SQL, "richer" means: intent classification + retrieval + constrained generation + validation + cost estimation + execution + post-processing — each layer with explicit contract; not an end-to-end black box. Each layer is auditable; together they are the chat-with-data engine.

## Proposed Solution

A pipeline in `engine/nl-to-sql/` with five distinct stages, each separately testable:

1. **Intent classifier.** Small, fast LLM call (Claude Haiku or Qwen-7B) that classifies the question: `lookup`, `aggregation`, `trend`, `comparison`, `freeform`. Returns a confidence score; if low, downstream stages handle as `freeform` (more conservative).
2. **Retriever.** pgvector semantic search over the metric registry (P02-T01); returns top-k=5 candidates with similarity scores.
3. **Constrained SQL generator.** Claude Sonnet 4.6 (cloud) or Qwen-72B (on-prem) with a strict system prompt that constrains: (a) "use only the metrics listed below"; (b) "the SQL must be SELECT-only against tables {lineage}"; (c) "include WHERE tenant_id = $tenant_id always"; (d) "respond in the format described". Output is structured JSON: `{ sql, metric_ref, narrative_hint, parameters }`.
4. **Validator.** Parses the SQL via DuckDB-parser (preferred) or sqlparse; rejects anything that: touches a table not in the metric's lineage; uses any keyword in the deny-list (DROP, DELETE, UPDATE, TRUNCATE, ALTER, CREATE); is missing the tenant predicate; has a runtime cost estimate above threshold; references a column outside the metric's column scope.
5. **Executor.** Submits to the warehouse adapter (P02-T01 adapters) with timeout (30s default; configurable per metric) and row-cap (10K default). Returns rows + execution timing + execution cost.
6. **Result post-processor.** Shapes rows into: a table; a chart (auto-selected based on data shape); a narrative (Claude generates a natural-language summary citing each numeric claim back to the SQL). Citation IDs are propagated to the citation engine (P02-T04).

Setup target: 21 days from task assignment.

### Subtasks

- [ ] **Implement intent classifier.** `engine/nl-to-sql/intent.ts`. Uses Claude Haiku (or Qwen-7B for on-prem) with a one-shot prompt; returns intent label + confidence. Cache hits for similar questions (cache key = question hash + tenant + recent context).
- [ ] **Implement retriever.** `engine/nl-to-sql/retriever.ts`. Generates an embedding of the question; pgvector cosine search; returns top-k=5 metrics with scores. Filters by sensitivity tier (RBAC-aware; viewer cannot retrieve restricted metrics).
- [ ] **Implement constrained SQL generator.** `engine/nl-to-sql/generator.ts`. Constructs a prompt with: question, top-k retrieved metrics (definitions + sample SQL), tenant ID, allowed schemas, format spec. Calls Claude Sonnet 4.6 (or Qwen-72B); parses structured JSON response. Failure to parse triggers retry once; second failure marks as a generator error.
- [ ] **Implement system-prompt isolation.** User content is wrapped in untrusted-content tags (per CyberSkill AI Doctrine v1.0.0); the system-prompt establishes role; the model cannot inherit or impersonate the system-prompt boundary. Prompt-injection defence (P02-T06) is invoked here.
- [ ] **Implement validator.** `engine/nl-to-sql/validator.ts`. Uses DuckDB-parser to AST-parse the proposed SQL; walks the tree; rejects on: forbidden keyword (DROP/DELETE/UPDATE/TRUNCATE/ALTER/CREATE/MERGE/COPY/INSERT, with case-insensitive matching including unicode lookalikes); table not in lineage; missing tenant predicate (must be a top-level WHERE or HAVING); cost estimate above threshold; column reference outside metric scope. Returns structured ValidationResult: `{ passed, violations: [], normalised_sql }`.
- [ ] **Implement cost estimator.** Pre-execution cost estimate via the adapter's `getCostEstimate(sql)` method (P02-T01). For BigQuery, this is `dryRun: true`; for Postgres, this is `EXPLAIN`; for Snowflake, this is the `EXPLAIN` plan analysis.
- [ ] **Implement executor.** `engine/nl-to-sql/executor.ts`. Submits validated SQL to the appropriate warehouse adapter. Timeouts: 30s default; configurable per metric; cancellation propagation. Row caps: 10K default; truncation marker if exceeded.
- [ ] **Implement result post-processor.** `engine/nl-to-sql/post-processor.ts`. Three sub-steps:
  - Table shaping: rows into a 2D table with column metadata (type, format, sensitivity).
  - Chart auto-selection: based on data shape, select a chart type (single number → big-number; time series → line chart; categorical aggregation → bar chart; etc.). Returns a chart spec (Vega-Lite) for the UI to render.
  - Narrative generation: Claude generates a 1–3 sentence natural-language summary; each numeric claim is annotated with a citation token that links to the SQL row that produced it.
- [ ] **Implement structured response format.** Pipeline output: `{ intent, metric_used, sql_executed, table, chart, narrative, citations, confidence_tier, execution_metadata }`. This is consumed by the chat surface (P05-T01) and the citation engine (P02-T04).
- [ ] **Implement caching.** Two-tier cache (P02-T08); pipeline checks cache before generation; cache key includes intent + tenant + RBAC scope + metric version + freshness window.
- [ ] **Implement retry and fallback policy.** Generator retries once on parse failure or content-filter rejection. Validator failure is hard-fail (no retry; the LLM produced something invalid; surface to user as refusal with explanation). Executor failure with timeout is retried once with longer timeout; permanent failure is fail-fast with explanation.
- [ ] **Implement observability hooks.** Every pipeline stage emits a span (OpenTelemetry); spans aggregate into a single trace per question; metrics tracked per stage (latency, success rate, cache hit rate, cost).
- [ ] **Implement adversarial-test integration.** Pipeline accepts an "adversarial mode" flag for the eval harness (P04-T02) that injects known prompt-injection payloads and verifies refusal.
- [ ] **Test exhaustively.** > 200 tests covering: each stage in isolation; integration; adversarial inputs; sensitivity-tier integration; cross-adapter consistency.

### Acceptance criteria

- All five pipeline stages implemented and individually testable.
- Pipeline passes the gold-set Q&A (P04-T01) with ≥ 90% accuracy on the first run.
- Validator rejects all known-invalid SQL patterns; tested against an adversarial corpus.
- Adversarial prompts trigger refusal (P02-T06 integration) without bypassing the validator.
- Cross-adapter equality holds for the same metric on the same dataset.
- Citation IDs propagate end-to-end (citation engine P02-T04 can resolve them to SQL rows).
- Latency targets: intent classifier p95 < 500ms; retriever p95 < 200ms; generator p95 < 4s (cloud), 8s (on-prem); validator p95 < 50ms; executor p95 < 5s for cached metrics, < 30s for ad-hoc.
- Observability spans flow to the central observability store.
- Test suite > 200 tests, > 90% coverage of `engine/nl-to-sql/`.

## Alternatives Considered

- **Use a single end-to-end LLM call (no pipeline stages).** Rejected: opaque; harder to test; higher cost per question; no separable failure modes.
- **Use a fine-tuned model specifically for NL→SQL (e.g., SQLCoder).** Rejected for the demo phase: fine-tuning timeline is too long; off-the-shelf Claude Sonnet 4.6 with strong prompting is sufficient. Reconsider for production track if accuracy demands it.
- **Use semantic-grammar-based SQL generation (no LLM).** Rejected: doesn't handle the ambiguity natural-language questions inherently carry. LLM with constrained search space is the right shape.
- **Skip the validator; trust the constrained generator.** Rejected: defence-in-depth — the validator is the deterministic gate that the constrained-but-still-stochastic generator backs onto.
- **Use a per-question dynamic prompt template.** Rejected for v1: static template with parameter slots is more testable and predictable. Dynamic templates in v2 if needed.
- **Skip cost estimation; just execute and let the warehouse handle limits.** Rejected: the warehouse will run an expensive query before we know it's expensive; cost estimation lets us fail-fast.
- **Skip narrative generation; return only table + chart.** Rejected: the Form Answers commit to "audited answer in seconds" — the answer is the narrative; without it, the experience is back to Power BI.
- **Use ChatGPT instead of Claude for generation.** Rejected: ADR-SHB-002 locks Claude Sonnet 4.6 + Opus 4.6 as the cloud default; deviation requires superseding ADR.

## Success Metrics

- **Primary**: Pipeline achieves ≥ 90% accuracy on gold-set within 21 days of task assignment. Measured by: P04-T03 evaluation harness.
- **Guardrail**: Pipeline returns within latency budget (p95 cloud < 5s end-to-end; p95 on-prem < 12s end-to-end) over the next 30 days. Measured by: observability metrics.

## Scope

### In scope
- Intent classifier, retriever, constrained generator, validator, executor, result post-processor.
- System-prompt isolation and prompt-injection defence integration.
- Cost estimation pre-execution.
- Two-tier caching integration.
- Retry and fallback policy.
- Observability spans + metrics.
- Adversarial-test mode for eval harness integration.
- Test suite.

### Out of scope
- Citation engine implementation (P02-T04; consumes pipeline output).
- Confidence-tier scoring (P02-T05; consumes pipeline output).
- Prompt-injection defence library (P02-T06; integrated here, implemented separately).
- HITL routing (P06; consumes pipeline output for low-confidence questions).
- Frontend chat surface (P05-T01; consumes pipeline output).
- Multi-turn dialogue state (deferred to v1.1).
- User-context-aware retrieval (deferred — for v1.0 retrieval is per-question, not per-conversation).

## Dependencies

- **Upstream**: P02-T01 (metric layer + adapters); P01-T07 (RBAC); P02-T07 (PDPL classifier — for sensitivity scoping).
- **Co-authored**: P02-T03 (policy layer; integrates here at the gate before generator); P02-T06 (prompt-injection defence; integrates here).
- **Downstream**: P02-T04 (citation), P02-T05 (confidence), P02-T08 (cache), P05-T01 (chat UI), P06 (HITL).
- **People**: engine tech lead authoring; eng-llm co-authoring generator + validator + adversarial integration; eng-sec reviewing validator + prompt-isolation.
- **External**: Anthropic API; OpenAI API for embeddings; warehouse adapters from P02-T01.
- **Memory references**: `cyberos_ai_compliance`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: For intent classifier, do we use Claude Haiku (cloud, fast, ~50ms) or a tiny on-prem model (Qwen-1.8B fits on CPU)? Recommendation: dual-mode per ADR-SHB-002; Haiku cloud, Qwen-1.8B on-prem.
- Q2: For top-k retrieval, k=5 default; do we tune per-intent (e.g., k=3 for lookup, k=10 for freeform)? Recommendation: yes — measure with eval harness, tune.
- Q3: For the validator, do we use DuckDB-parser (good multi-dialect support) or per-adapter parsers? Recommendation: DuckDB-parser as primary; per-adapter parsers as fallback for dialect-specific quirks.
- Q4: For narrative generation, do we use a separate Claude call (slower; better quality) or piggyback on the generator (faster; mixed quality)? Recommendation: separate call; quality matters for citations.
- Q5: For multi-turn conversation, when do we add it? Recommendation: v1.1; v1.0 is single-turn for clarity.

## Implementation Notes

- The system-prompt is fixed and short; the user-content is wrapped in `<untrusted_content>` tags per AI Doctrine. This is the prompt-injection defence integration point.
- The constrained generator's structured-output mode uses Claude's tool-use feature with a JSON schema. Forces the model to return a typed object, not free-form text.
- The validator's deny-list of SQL keywords includes Unicode lookalikes (e.g., a Cyrillic "С" that looks like Latin "C") to defend against homoglyph attacks. DuckDB-parser handles this at AST level.
- Tenant predicate enforcement: the validator walks the AST and checks that every table reference is wrapped in a `WHERE tenant_id = ?` filter at the appropriate level. Subqueries that reference tables also need the filter.
- For the cost estimator threshold, default 1M rows scanned; configurable per metric and per tenant. Above threshold, the pipeline returns a "this query is expensive — please confirm" prompt to the user.
- Citation IDs are generated as UUID-v7 (time-ordered) so the audit log preserves causal ordering.
- For latency budgeting: intent (500ms cap) + retriever (200ms cap) + generator (4s cap) + validator (50ms cap) + executor (5s cap on cache hit; 30s on miss) + post-processor (500ms cap). Total cap ≈ 5s on cache hit; 11s on miss; 30s on cache miss with slow query.

## Test Plan

- Test 1: Intent classifier — 50 sample questions; verify the assigned intent matches expected; verify low-confidence cases route to freeform.
- Test 2: Retriever — 50 questions; verify top-k contains the correct metric for ≥ 90% of cases.
- Test 3: Generator — 90 gold-set questions; verify SQL produced is parseable and semantically correct.
- Test 4: Validator — adversarial corpus of 100 invalid SQLs; verify all are rejected; sample valid SQLs verify they pass.
- Test 5: Executor — verify timeouts fire as expected; verify row-cap truncation is correctly indicated.
- Test 6: Post-processor — verify chart selection is appropriate for data shape; verify narrative cites correctly.
- Test 7: End-to-end — gold-set 90 questions through the full pipeline; verify ≥ 90% accuracy; capture latencies.
- Test 8: Adversarial — prompt-injection corpus (P04-T02); verify pipeline refuses or sanitises; no leaked system prompt.
- Test 9: Cross-adapter — same question against Postgres and BigQuery; verify same numerical result and same chart.
- Test 10: Performance — load test with 100 concurrent questions; verify latency budgets hold.

## Rollback Plan

- A bad pipeline change is rolled back via PR revert; the cache layer (P02-T08) preserves recent answers; new questions return to the previous behaviour.
- A bad LLM model swap (e.g., new Claude version regresses on financial SQL) is rolled back via ADR supersession + redeploy with previous model pinned.
- A bad validator rule is rolled back; meanwhile, manual review can pre-clear known-good SQL patterns.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Pipeline implementation | `engine/nl-to-sql/` | Engine tech lead | Continuous |
| System-prompt template | `engine/nl-to-sql/prompts/system-prompt.md` | Engine tech lead | Continuous |
| Validator deny-list | `engine/nl-to-sql/validator-rules.yaml` | Eng-sec | Continuous |
| Cost-estimator thresholds | `engine/nl-to-sql/cost-thresholds.yaml` | Engine tech lead | Continuous |
| Test suite | `engine/nl-to-sql/__tests__/` | Engine tech lead | Continuous |
| Adversarial corpus | `eval/adversarial/prompt-injection-corpus.yaml` (P04-T02) | Eng-sec | Continuous |
| Observability spans | Central observability store | Engine tech lead | 1 year |

## Operational Risks

- **LLM provider outage.** Mitigation: routing matrix per ADR-SHB-002; failover to on-prem Qwen.
- **Constrained generator produces structurally-valid but semantically-wrong SQL.** Mitigation: eval harness catches; HITL routes low-confidence cases (P06).
- **Validator false-positive rejecting legitimate SQL.** Mitigation: false-positive triage; metric owner adds the legitimate pattern to the metric's lineage.
- **Cost estimator misses expensive query.** Mitigation: executor enforces row-cap and timeout regardless; cost is bounded.
- **Citation IDs lost between pipeline and engine.** Mitigation: end-to-end test verifies citation propagation.

## Definition of Done

- All five stages implemented and tested.
- Gold-set accuracy ≥ 90%; latencies within budget.
- Adversarial corpus refusal verified.
- Cross-adapter equality verified.
- Observability spans flowing.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
The NL→SQL pipeline grounds itself in three sources: the metric registry (P02-T01) — author-controlled metric definitions; the warehouse data — Shinhan-supplied or synthetic during PoC; the LLM's pre-trained knowledge. No customer-data is used to train the LLM; LLM behaviour is conditioned at runtime via in-context grounding and constrained generation. Embeddings of metric descriptions are not customer data.

### Human Oversight
Every metric used by the pipeline is human-authored and reviewed (P02-T01 authorship workflow). The validator gates LLM output deterministically; humans can audit any pipeline run via the audit log and observability traces. Low-confidence questions (per P02-T05 confidence tiers) route to HITL (P06) where a human reviews before answering. Sensitivity-tier integration ensures regulated data is never exposed without human-mediated elevation (P01-T07 sensitivity elevation).

### Failure Modes
- Hallucinated SQL (LLM proposes a query against a non-existent table): validator rejects; user sees a refusal with "I couldn't translate this question into a verified query — please rephrase or contact your administrator".
- Generator returns incorrectly-formatted JSON: retry once; if still incorrect, fail-fast with refusal.
- LLM provider outage: routing matrix routes to on-prem Qwen; if both unavailable, pipeline returns "service degraded" with a 503-equivalent.
- Validator finds prohibited keyword (DROP, etc.): hard-rejection with audit-log entry tagged as a potential adversarial prompt.
- Tenant predicate missing: hard-rejection; this is the most-critical safety check.
- Cost above threshold: pipeline returns "this query is expensive — please confirm" prompt; user can confirm to proceed (audit-logged).
- Result post-processor narrative cites incorrectly: faithfulness check in eval harness (P04-T03) catches; metric and prompt are revised.

## Sales/CS Summary

CyberSkill's NL-to-SQL engine lets a Shinhan business user ask a question in natural language ("What's our deposit growth in Q1 by branch?") and get an audited, cited answer in seconds — instead of waiting for the ICT-Reporting team to run a Power BI report. Every answer is grounded in an explicitly-defined metric in our registry; every numeric claim is cited back to the SQL row that produced it; nothing the AI does can bypass the deterministic safety checks. The system fails safely when uncertain — it asks a reviewer to approve, refuses to answer, or asks the user to rephrase. The operating envelope is: 90% of common questions answered without human intervention; 10% routed to a human reviewer (the SB5 brief explicitly required this human-in-the-loop pattern).

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR); the implementation itself uses Claude Sonnet 4.6 as the runtime SQL generator (per ADR-SHB-002).
- **Scope**: Claude drafted all sections of this FR. The runtime LLM behaviour is governed by the system prompts authored by the engine team; the prompts are version-controlled and reviewed by eng-sec.
- **Human review**: engine tech lead authors and reviews implementation; eng-llm reviews prompt and validator; eng-sec reviews prompt-injection integration and validator deny-list; `@stephen-cheng` ratifies the user-facing failure modes.
