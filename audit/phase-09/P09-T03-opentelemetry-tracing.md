# Audit Report — P09-T03: OpenTelemetry Distributed Tracing

> **Phase**: 09 — Observability  
> **Task**: T03 — OTel Tracing  
> **Source**: [`observability/tracing/otel-setup.ts`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/observability/tracing/otel-setup.ts) (291 lines)  
> **FR Reference**: [`tasks/P09-T03-opentelemetry-tracing.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/tasks/P09-T03-opentelemetry-tracing.md)  
> **Auditor**: Antigravity Deep Audit  
> **Date**: 2026-05-02

---

## 1. Acceptance Criteria Verification

| # | Criterion (from FR) | Status | Evidence |
|---|---|---|---|
| AC-1 | OpenTelemetry SDK integrated across all services | ⚠️ Partial | Custom `Tracer` class exists but is not the official `@opentelemetry/sdk-trace-node` SDK |
| AC-2 | W3C Trace Context propagation end-to-end | ✅ Pass | `toTraceparent()` and `fromTraceparent()` correctly implement W3C `traceparent` format |
| AC-3 | OTLP exporter configured (Tempo backend) | ⚠️ Partial | OTLP payload format correct; actual `fetch()` is a `console.log` stub (line 224) |
| AC-4 | 24 predefined span names covering full pipeline | ✅ Pass | `SPAN_NAMES` object: 24 spans across HTTP, NL→SQL, Policy, LLM, Cache, HITL, Audit, Citations |
| AC-5 | Sampling strategy configurable | ✅ Pass | `TracingConfig.sampling` with `always`, `probability`, `rateLimiting` strategies |
| AC-6 | Service instrumented end-to-end | ❌ Missing | No evidence of actual service instrumentation (no imports of tracer in engine/hitl/ui) |
| AC-7 | Tempo backend operational | ⚠️ Partial | Tempo in `docker-compose.yml` line 149; no `local-config.yaml` verified |

**AC Pass Rate: 3/7 (43%) — 3 partial, 1 missing**

---

## 2. Test Plan Verification

| # | Test (from FR) | Status | Evidence |
|---|---|---|---|
| T-1 | Trace a full request: UI → API GW → NL→SQL → Warehouse → LLM → Cache → Audit | ❌ Not Found | No integration test |
| T-2 | W3C traceparent header propagated across service boundaries | ⚠️ Partial | `toTraceparent()` is correct; no cross-service test |
| T-3 | Spans exported to Tempo; visible in Grafana Tempo UI | ❌ Not Found | OTLP export is a stub |
| T-4 | Sampling rate respects configuration | ❌ Not Found | Sampling config exists but not tested |

**Test Pass Rate: 0/4 (0%)**

---

## 3. Content Quality Analysis

### Strengths
- **W3C Trace Context fully correct**: `toTraceparent()` and `fromTraceparent()` parse/generate `00-{traceId}-{spanId}-{flags}` correctly
- **Crypto-grade ID generation**: `generateId()` uses `crypto.getRandomValues()` for 128-bit trace IDs and 64-bit span IDs
- **OTLP JSON payload format**: `exportOTLP()` generates correct OpenTelemetry Proto JSON with `resourceSpans → scopeSpans → spans` hierarchy
- **24 predefined span names**: Comprehensive coverage of the full pipeline — will make distributed traces self-documenting
- **Span events**: `addEvent()` allows annotation of spans with domain events
- **Logger integration**: Tracer uses `StructuredLogger` for its own debug output — good cross-cutting consistency

### Issues

| # | Severity | Issue | Details |
|---|---|---|---|
| CQ-1 | 🔴 High | **OTLP export is a `console.log` stub** | Line 224: `console.log(...)` + `void payload` — traces never reach Tempo |
| CQ-2 | 🔴 High | **Custom tracer, not official OTel SDK** | FR title says "OpenTelemetry" but this is a custom implementation; won't get auto-instrumentation benefits |
| CQ-3 | 🟡 Medium | **No service instrumentation** — tracer exists but isn't used | Zero imports in engine/hitl/ui codebases |
| CQ-4 | 🟡 Medium | **Sampling not implemented** — config field exists but `startSpan` always traces | No probabilistic or rate-limiting logic |
| CQ-5 | 🟡 Medium | **In-memory span buffer** — spans lost on restart | `this.spans: Span[]` is never persisted |
| CQ-6 | 🟠 Low | **Jaeger exporter declared but not implemented** | `TracingConfig.exporter.type` accepts `'jaeger'` but switch/case doesn't handle it |

---

## 6. Gap Analysis & Remediation

| # | Gap | Impact | Remediation | Priority |
|---|---|---|---|---|
| G-1 | OTLP export is a stub | Zero trace data reaches backend | Implement actual `fetch()` to Tempo endpoint | 🔴 P0 |
| G-2 | Custom tracer vs official OTel SDK | No auto-instrumentation for HTTP/DB/Redis | Evaluate migration to `@opentelemetry/sdk-trace-node` | 🟡 P1 |
| G-3 | No service instrumentation | Tracer unused in actual services | Add tracing middleware to engine/hitl/ui entry points | 🔴 P0 |
| G-4 | Sampling not implemented | 100% sampling in production = cost explosion | Implement probabilistic sampling logic | 🟡 P1 |
| G-5 | Jaeger exporter unimplemented | Config advertises unsupported option | Either implement or remove from types | 🟠 P2 |

---

## 7. Verdict

> **Overall Status: ⚠️ PARTIAL — Tracing primitives correct but not operational**

The tracer demonstrates strong understanding of W3C Trace Context, OTLP protocol format, and span lifecycle management. The 24 predefined span names will be immediately useful once the tracer is operational. The critical gap is that export is stubbed (`console.log`) and no service has been instrumented. Consider migrating to the official `@opentelemetry/sdk-trace-node` for auto-instrumentation.

**Estimated remediation effort**: 3-5 days.
