# Audit Report — P09-T05: Cost Dashboard with Per-Question Tracking & Anomaly Detection

> **Phase**: 09 — Observability  
> **Task**: T05 — Cost Dashboard  
> **Source**: [`observability/cost/cost-tracker.ts`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/observability/cost/cost-tracker.ts) (247 lines)  
> **FR Reference**: [`tasks/P09-T05-cost-dashboard-anomaly.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/tasks/P09-T05-cost-dashboard-anomaly.md)  
> **Auditor**: Antigravity Deep Audit  
> **Date**: 2026-05-02

---

## 1. Acceptance Criteria Verification

| # | Criterion (from FR) | Status | Evidence |
|---|---|---|---|
| AC-1 | Per-question cost tracking | ✅ Pass | `CostEvent` interface + `recordCost()` tracks per-request with components |
| AC-2 | 3 LLM pricing models | ✅ Pass | `PRICING_MODELS`: gpt-4o, claude-3.5-sonnet, qwen-7b-local — all with VND conversions |
| AC-3 | Cost summary by BU, tenant, component | ✅ Pass | `getSummary()` produces `byBu`, `byTenant`, `byComponent` breakdowns |
| AC-4 | Z-score anomaly detection | ✅ Pass | `calculateAnomalyScore()`: 7-day hourly moving average with proper Z-score formula |
| AC-5 | Cost outlier identification | ✅ Pass | `getOutliers()`: top N% by cost |
| AC-6 | Cache savings estimate | ✅ Pass | `getCacheSavings()`: counts cached hits and estimates savings |
| AC-7 | Prometheus metrics export | ✅ Pass | `toPrometheusMetrics()`: correct exposition format with `HELP`/`TYPE` annotations |
| AC-8 | Grafana cost dashboard | ❌ Missing | No dashboard JSON file for cost |
| AC-9 | Cost cap alerts | ❌ Missing | No alert rules for cost thresholds (only anomaly alert in SLO doc) |

**AC Pass Rate: 7/9 (78%) — 0 partial, 2 missing**

---

## 2. Test Plan Verification

| # | Test (from FR) | Status | Evidence |
|---|---|---|---|
| T-1 | Record cost event; verify per-question tracking | ⚠️ Partial | `recordCost()` logic is correct; no unit test |
| T-2 | Verify LLM cost calculation with known token counts | ⚠️ Partial | `calculateLLMCost()` math is correct; no unit test |
| T-3 | Verify Z-score anomaly detection with synthetic data | ⚠️ Partial | Algorithm is correct; no unit test |
| T-4 | Verify Prometheus metrics format | ⚠️ Partial | Output format is correct; no unit test |

**Test Pass Rate: 0/4 (0%) — all partial (logic correct, no test files)**

---

## 3. Content Quality Analysis

### Strengths
- **VND-native pricing**: All costs denominated in VND — no floating-point currency errors
- **3 pricing models with cached prompt discounts**: gpt-4o (50%), claude-3.5-sonnet (90%), qwen-7b (0%) — operationally accurate
- **Z-score anomaly detection is statistically correct**: 7-day rolling window, proper mean/variance/stddev calculation, minimum 24 data points threshold
- **Prometheus exposition format**: Correct `HELP`, `TYPE`, counter/gauge semantics — will integrate with P09-T02 dashboards
- **Component-level cost breakdown**: `llm_api`, `cache`, `database`, `compute`, `storage` — granular enough for cost attribution
- **Period summary with granularity**: Hourly/daily/weekly/monthly — flexible reporting

### Issues

| # | Severity | Issue | Details |
|---|---|---|---|
| CQ-1 | 🔴 High | **All data is in-memory** — `events: CostEvent[]` lost on restart | No persistence to database; historical cost data unrecoverable |
| CQ-2 | 🟡 Medium | **No Grafana dashboard** — tracker exports metrics but no visualisation | P09-T02 cost dashboard should consume these metrics |
| CQ-3 | 🟡 Medium | **No cost cap alerts** — only anomaly detection | FR mentions "cost-cap alerts"; no threshold-based alerts |
| CQ-4 | 🟡 Medium | **No integration with engine** — tracker is standalone | No code calling `recordCost()` in the actual NL→SQL pipeline |
| CQ-5 | 🟠 Low | **Cache savings estimate is approximate** | `missedCost: savedVnd * 2` — assumes 50% discount; should use model-specific discount |

---

## 4. Gap Analysis & Remediation

| # | Gap | Impact | Remediation | Priority |
|---|---|---|---|---|
| G-1 | In-memory storage | Cost history lost on restart | Persist to Postgres + expose as time-series | 🔴 P0 |
| G-2 | No Grafana cost dashboard | Cannot visualise cost trends | Author cost dashboard JSON (part of P09-T02) | 🟡 P1 |
| G-3 | No cost cap alerts | Budget overruns undetected | Add threshold-based PromQL alerts | 🟡 P1 |
| G-4 | No engine integration | Tracker unused in production | Instrument engine pipeline to call `recordCost()` | 🟡 P1 |

---

## 5. Verdict

> **Overall Status: ⚠️ PARTIAL — Strongest observability module, needs persistence and integration**

The cost tracker is the most complete observability component: Z-score anomaly detection, VND-native pricing, Prometheus export, and per-question granularity. The critical gap is in-memory storage (like every module in this project) and lack of integration with the actual engine pipeline.

**Estimated remediation effort**: 3-4 days.
