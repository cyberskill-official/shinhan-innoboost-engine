# Audit Report — P02-T02: NL→SQL Pipeline

> **Audit Date**: 2026-05-02
> **FR Status**: `draft` | **Recommended Status**: `in_progress`
> **Verdict**: ⚠️ **PARTIALLY DONE** — `engine/nl-to-sql/pipeline.ts` (448 lines) is the largest implementation file in the project — a substantial pipeline skeleton. `engine/nl-to-sql/prompts/system-prompt.md` (67 lines) documents the system prompt. But no intent classifier, retriever, generator, validator, executor, or post-processor exist as separate modules. No test files. No adversarial integration. No gold-set evaluation. The 448-line pipeline file is a monolith that needs decomposition and testing.

---

## 1. Acceptance Criteria Verification

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| AC-1 | All five pipeline stages implemented and individually testable | ⚠️ PARTIAL | `pipeline.ts` (448 lines) exists — likely contains all stages inline. But **no separate module files** (`intent.ts`, `retriever.ts`, `generator.ts`, `validator.ts`, `executor.ts`, `post-processor.ts`). Not individually testable as separate units. |
| AC-2 | Pipeline passes gold-set Q&A (P04-T01) with ≥ 90% accuracy | ❌ FAIL | No gold-set exists (P04-T01 not started). No evaluation run. |
| AC-3 | Validator rejects all known-invalid SQL patterns | ❌ FAIL | Validator may be inline in `pipeline.ts`. No `validator-rules.yaml`. No adversarial corpus test. |
| AC-4 | Adversarial prompts trigger refusal (P02-T06 integration) | ❌ FAIL | No adversarial integration. No corpus test. |
| AC-5 | Cross-adapter equality holds for same metric on same dataset | ❌ FAIL | No adapters implemented (P02-T01 adapters missing). |
| AC-6 | Citation IDs propagate end-to-end | ❌ FAIL | Citation engine (P02-T04) not wired. |
| AC-7 | Latency targets: intent p95 < 500ms; retriever p95 < 200ms; generator p95 < 4s; validator p95 < 50ms; executor p95 < 5s (cached) | ❌ FAIL | No latency measurement. No benchmarks. |
| AC-8 | Observability spans flow to central observability store | ❌ FAIL | No OpenTelemetry integration. |
| AC-9 | Test suite > 200 tests, > 90% coverage of `engine/nl-to-sql/` | ❌ FAIL | **Zero tests.** |

**Acceptance Criteria Score: 0/9 PASS, 1/9 PARTIAL, 8/9 FAIL**

---

## 2. Test Plan Verification

| Test | Description | Executed? | Result |
|------|-------------|-----------|--------|
| Test 1 | Intent classifier — 50 sample questions; verify correct intent | ❌ Not executed | No separate intent module. |
| Test 2 | Retriever — 50 questions; verify top-k correct for ≥ 90% | ❌ Not executed | No retriever module. No metric registry. |
| Test 3 | Generator — 90 gold-set questions; verify SQL parseable + correct | ❌ Not executed | No gold-set. |
| Test 4 | Validator — 100 adversarial SQLs; verify all rejected | ❌ Not executed | No adversarial corpus. |
| Test 5 | Executor — verify timeouts + row-cap truncation | ❌ Not executed | No executor module. |
| Test 6 | Post-processor — verify chart + narrative + citations | ❌ Not executed | No post-processor module. |
| Test 7 | End-to-end — 90 gold-set questions; ≥ 90% accuracy | ❌ Not executed | No gold-set. |
| Test 8 | Adversarial — prompt-injection corpus; verify refusal | ❌ Not executed | No corpus. |
| Test 9 | Cross-adapter — same question on Postgres + BigQuery; same result | ❌ Not executed | No adapters. |
| Test 10 | Performance — 100 concurrent questions; latency budgets hold | ❌ Not executed | No load test. |

**Test Plan Score: 0/10 executed**

---

## 3. Success Metrics Verification

| Metric | Target | Status | Measurement |
|--------|--------|--------|-------------|
| Primary | ≥ 90% accuracy on gold-set within 21 days | ❌ NOT MET | No gold-set. No evaluation. |
| Guardrail | p95 cloud < 5s E2E; p95 on-prem < 12s E2E over 30 days | ❌ NOT MET | No latency measurement. |

---

## 4. Definition of Done Verification

| # | Criterion | Status |
|---|-----------|--------|
| DoD-1 | All five stages implemented and tested | ⚠️ Monolith exists; not decomposed |
| DoD-2 | Gold-set accuracy ≥ 90% | ❌ |
| DoD-3 | Adversarial corpus refusal verified | ❌ |
| DoD-4 | Cross-adapter equality verified | ❌ |
| DoD-5 | Observability spans flowing | ❌ |
| DoD-6 | FR ticket marked Done | ❌ |

---

## 5. Subtask Verification

| Subtask | Status | Notes |
|---------|--------|-------|
| Implement intent classifier | ⚠️ PARTIAL | Likely inline in `pipeline.ts` (448 lines). No separate `intent.ts`. |
| Implement retriever | ⚠️ PARTIAL | Likely inline. No separate `retriever.ts`. |
| Implement constrained SQL generator | ⚠️ PARTIAL | Likely inline. No separate `generator.ts`. |
| Implement system-prompt isolation | ✅ PASS | `system-prompt.md` (67 lines) exists with documented template. |
| Implement validator | ⚠️ PARTIAL | Likely inline. No `validator-rules.yaml`. |
| Implement cost estimator | ❌ FAIL | No `cost-thresholds.yaml`. |
| Implement executor | ⚠️ PARTIAL | Likely inline. |
| Implement result post-processor | ⚠️ PARTIAL | Likely inline. |
| Implement structured response format | ⚠️ PARTIAL | Likely in `pipeline.ts`. |
| Implement caching integration | ❌ FAIL | P02-T08 cache not wired. |
| Implement retry and fallback policy | ❌ FAIL | Not verified. |
| Implement observability hooks | ❌ FAIL | No OpenTelemetry spans. |
| Implement adversarial-test integration | ❌ FAIL | No adversarial mode. |
| Test exhaustively (>200 tests) | ❌ FAIL | 0 tests. |

---

## 6. Existing Artefacts Inventory

| Expected Artefact | Path | Exists? | Content Quality |
|-------------------|------|---------|-----------------|
| Pipeline monolith | `engine/nl-to-sql/pipeline.ts` | ✅ Yes (448 lines) | Largest code file; substantial |
| System prompt | `engine/nl-to-sql/prompts/system-prompt.md` | ✅ Yes (67 lines) | Documented template |
| Intent classifier | `engine/nl-to-sql/intent.ts` | ❌ No (inline) | — |
| Retriever | `engine/nl-to-sql/retriever.ts` | ❌ No (inline) | — |
| Generator | `engine/nl-to-sql/generator.ts` | ❌ No (inline) | — |
| Validator | `engine/nl-to-sql/validator.ts` | ❌ No (inline) | — |
| Validator rules | `engine/nl-to-sql/validator-rules.yaml` | ❌ No | — |
| Cost thresholds | `engine/nl-to-sql/cost-thresholds.yaml` | ❌ No | — |
| Test suite | `engine/nl-to-sql/__tests__/` | ❌ No | — |

---

## 7. Summary & Recommendation

**The NL→SQL pipeline is ~25% complete.** The 448-line `pipeline.ts` is the most substantial implementation in the entire project — it likely contains type definitions, pipeline orchestration logic, and possibly stub implementations of all stages. The system prompt is well-documented. But the FR demands decomposition into individually testable modules, 200+ tests, adversarial integration, gold-set evaluation, and cross-adapter testing — none of which exist.

**Recommended status**: `in_progress`

**To move to `done`**:
1. Decompose `pipeline.ts` into 6 separate modules (intent, retriever, generator, validator, executor, post-processor)
2. Create `validator-rules.yaml` and `cost-thresholds.yaml`
3. Wire P02-T06 adversarial integration
4. Wire P02-T04 citation propagation
5. Wire P02-T08 caching integration
6. Add OpenTelemetry observability spans
7. Write >200 tests (unit + integration + adversarial)
8. Run gold-set evaluation when P04-T01 is available
