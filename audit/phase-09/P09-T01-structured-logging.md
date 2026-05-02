# Audit Report — P09-T01: Structured Logging → OpenSearch / Loki

> **Phase**: 09 — Observability  
> **Task**: T01 — Structured Logging  
> **Source**: [`observability/logging/structured-logger.ts`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/observability/logging/structured-logger.ts) (244 lines)  
> **FR Reference**: [`tasks/P09-T01-structured-logging.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/tasks/P09-T01-structured-logging.md)  
> **Auditor**: Antigravity Deep Audit  
> **Date**: 2026-05-02

---

## 1. Acceptance Criteria Verification

| # | Criterion (from FR) | Status | Evidence |
|---|---|---|---|
| AC-1 | Logging library shipped and integrated across all workspaces | ⚠️ Partial | Library exists (244 lines, `StructuredLogger` class) but no evidence of integration into engine/hitl/ui/eval/data workspaces |
| AC-2 | OpenSearch + Loki operational | ⚠️ Partial | Loki in `docker-compose.yml` (line 142); OpenSearch not in any deployment config |
| AC-3 | Retention tiers configured; verified by ILM check | ❌ Missing | No ILM policy file; no `ilm-policy.json`; FR requires `infra/observability/ilm-policy.json` |
| AC-4 | Request-ID propagation verified across services | ⚠️ Partial | `correlationId` field in `StructuredLogEntry`; no async-context auto-injection (FR requires "auto-injects request-ID from async context") |
| AC-5 | PII redaction verified | ❌ Missing | No PII redaction logic in logger; FR requires "auto-redacts per the redaction map" |
| AC-6 | Audit-tier integration with P02-T09 working | ❌ Missing | No dedicated audit index; no WORM mirror code |
| AC-7 | Access control enforced | ❌ Missing | No RBAC on log access |
| AC-8 | Runbook published | ❌ Missing | FR requires `docs/runbooks/log-query.md`; file not found |

**AC Pass Rate: 0/8 (0%) — 3 partial, 5 missing**

---

## 2. Test Plan Verification

| # | Test (from FR) | Status | Evidence |
|---|---|---|---|
| T-1 | Sample log entry — verify structure + required fields | ⚠️ Partial | `StructuredLogEntry` interface has all fields; no actual test file |
| T-2 | Cross-service request — verify request-ID flows | ❌ Not Found | No integration test; no async-context propagation |
| T-3 | PII redaction — log PII; verify redaction | ❌ Not Found | No redaction logic exists |
| T-4 | Retention — verify ILM policy; old entry rolls to warm | ❌ Not Found | No ILM configured |
| T-5 | Access control — viewer cannot see engineer-tier logs | ❌ Not Found | No RBAC |
| T-6 | Audit-tier integration — P02-T09 entry in dedicated index | ❌ Not Found | No audit index |

**Test Pass Rate: 0/6 (0%)**

---

## 3. Success Metrics Evaluation

| Metric | Target | Actual | Status |
|---|---|---|---|
| Structured logging shipped within 14 days; cross-service request-ID propagation verified | Shipped + verified | Library exists but not integrated; propagation not verified | ⚠️ Partial |
| Zero PII-in-logs incidents | 0 incidents | No PII redaction exists → risk of PII leakage | ❌ Not Met |

---

## 4. Definition of Done Evaluation

| # | DoD Item | Status | Notes |
|---|---|---|---|
| D-1 | Logging shipped across workspaces | ⚠️ Partial | Library exists; no workspace integration |
| D-2 | Backends operational | ⚠️ Partial | Loki in docker-compose; OpenSearch missing |
| D-3 | Retention + access + redaction verified | ❌ Missing | None of the three |
| D-4 | FR ticket marked Done | ❌ Not Done | Status: `draft` |

**DoD Pass Rate: 0/4 (0%)**

---

## 5. Content Quality Analysis

### Strengths
- **Well-architected logger class**: `StructuredLogger` with batch buffer, flush timer, immediate flush for errors — production patterns
- **Loki-native payload**: `shipToLoki()` correctly formats Loki push API streams with nanosecond timestamps
- **OpenSearch bulk API**: `shipToOpenSearch()` correctly builds NDJSON bulk body with per-day index naming
- **Child logger pattern**: `ChildLogger` with trace/span/correlation overrides — proper structured logging hierarchy
- **Log level filtering**: Numeric level comparison with configurable threshold
- **Factory function**: `createLogger()` with environment-aware defaults

### Issues

| # | Severity | Issue | Details |
|---|---|---|---|
| CQ-1 | 🔴 High | **PII redaction missing** — FR requires `sensitivity-rules.yaml` mapping and auto-redact | No redaction code anywhere in logger |
| CQ-2 | 🔴 High | **Loki/OpenSearch shipping are `console.log` stubs** | Lines 180, 191: `console.log(...)` + `void payload` — no actual `fetch()` call |
| CQ-3 | 🔴 High | **No async-context injection** — FR requires "auto-injects request-ID from async context" | `correlationId` is a manual parameter, not auto-injected from `AsyncLocalStorage` |
| CQ-4 | 🟡 Medium | **OpenSearch not in deployment configs** — docker-compose has Loki only | FR requires both OpenSearch + Loki |
| CQ-5 | 🟡 Medium | **No ILM policy** — FR requires `infra/observability/ilm-policy.json` | File does not exist |
| CQ-6 | 🟡 Medium | **No log schema documentation** — FR requires `docs/observability/LOG_SCHEMA.md` | File does not exist |
| CQ-7 | 🟡 Medium | **No log-query runbook** — FR requires `docs/runbooks/log-query.md` | File does not exist |
| CQ-8 | 🟠 Low | **`file` target writes to stdout** — should use `fs.createWriteStream` with rotation | Line 150: `process.stdout.write()` |

---

## 6. Gap Analysis & Remediation

| # | Gap | Impact | Remediation | Priority |
|---|---|---|---|---|
| G-1 | PII redaction missing | PDPL violation risk in production logs | Implement `redactPII()` with `sensitivity-rules.yaml` map | 🔴 P0 |
| G-2 | Loki/OpenSearch shipping are stubs | Logs don't actually ship anywhere | Implement `fetch()` calls with retry/backoff | 🔴 P0 |
| G-3 | No async-context injection | Manual correlationId passing is error-prone | Use `AsyncLocalStorage` for auto-injection | 🔴 P0 |
| G-4 | No workspace integration | Only the library exists; no usage in engine/hitl/ui | Import and instrument all services | 🟡 P1 |
| G-5 | No ILM policy | No retention tiers; cost and compliance risk | Author `ilm-policy.json` for 30d/1y/7y tiers | 🟡 P1 |
| G-6 | Missing documentation (schema + runbook) | Operational knowledge not captured | Author `LOG_SCHEMA.md` and `log-query.md` | 🟡 P1 |
| G-7 | OpenSearch not in deployment configs | Can't verify OpenSearch backend | Add OpenSearch to docker-compose (optional profile) | 🟠 P2 |

---

## 7. Verdict

> **Overall Status: ⚠️ PARTIAL — Logger library is well-architected but not operational**

The `StructuredLogger` class demonstrates production-grade patterns (batch buffering, level filtering, child loggers, Loki/OpenSearch format awareness). However, the three critical requirements — PII redaction, actual network shipping, and async-context propagation — are all unimplemented. The library is a strong scaffold that needs ~5-7 days of engineering to become operational.

**Estimated remediation effort**: 5-7 days.
