---
title: "Implement OpenTelemetry distributed tracing end-to-end"
author: "@cyberskill-eng"
department: engineering
status: draft
priority: p1
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: not_ai
target_release: "2026-09-04"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Implement OpenTelemetry distributed tracing end-to-end: instrument every service (chat surface, engine pipeline stages, HITL queue, admin console, auth, audit log, warehouse adapters, observability) with trace + span emission; central trace store (Tempo or Jaeger); propagate trace context via standard headers; correlate traces with logs (P09-T01) and metrics (P09-T02) via shared request-ID; visualise in Grafana. Tracing is the single most powerful tool for diagnosing complex multi-service incidents — when something is slow or wrong, the trace shows where, in seconds.

## Problem

Without tracing, multi-service incidents are debugging archaeology. Each service is its own log stream; correlating them by request-ID alone is slow. Tracing visualises the request journey end-to-end.

Specific gaps if we shortcut:

- **Without tracing, latency-attribution is guesswork.**
- **Without distributed-trace propagation, cross-service incidents are opaque.**
- **Without log + trace correlation, dashboards can't drill from metric to root-cause.**

The `feedback_p1_scope_preference` memory note biases us richer. For tracing, "richer" means: full instrumentation + trace store + log correlation + visualisation + sampling strategy.

## Proposed Solution

OpenTelemetry tracing across all services:

1. **Instrumentation** in every workspace via OpenTelemetry SDK; auto-instrumentation for HTTP, database, LLM API.
2. **Trace store**: Grafana Tempo (Loki-friendly) for staging; Jaeger as alternative.
3. **Trace context propagation** via `traceparent` header; cross-service.
4. **Log + trace correlation** via shared request-ID + trace-ID embedded in log entries.
5. **Sampling**: 100% in dev/staging; head-sampled at 10% in production-rehearsal; tail-sampled keep-on-error.
6. **Grafana visualisation**: trace explorer with link from metric / log to trace.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Choose trace store.** Tempo (preferred for Loki-friendly stack); fallback Jaeger.
- [ ] **Add OpenTelemetry SDK to every workspace.** Initialise tracer at startup; auto-instrument HTTP, DB, Anthropic API, vLLM client.
- [ ] **Manually instrument key spans.** Per pipeline stage in P02-T02; HITL operations; admin actions.
- [ ] **Configure trace context propagation.** `traceparent` header at ingress; propagated through service calls.
- [ ] **Configure sampling strategy.** Head-sample 100% staging; 10% production-rehearsal; tail-sample on error always.
- [ ] **Configure trace store.** Helm-deployed Tempo; retention 15 days.
- [ ] **Embed trace-ID in logs (P09-T01).** Log emitter reads current trace-ID from OpenTelemetry context.
- [ ] **Configure Grafana trace explorer.** Datasource + UI; drill-down from metric/log.
- [ ] **Author tracing runbook.** `docs/runbooks/tracing.md`: how to investigate by trace-ID; common queries.
- [ ] **Test end-to-end.** Sample request from chat → engine → warehouse; trace shows full path.

### Acceptance criteria

- All workspaces instrumented.
- Trace store operational.
- Sampling configured.
- Log + trace correlation verified.
- Grafana trace explorer operational.
- Runbook published.

## Alternatives Considered

- **Datadog APM.** Rejected: vendor cost; OpenTelemetry is open.
- **Skip tracing; rely on logs.** Rejected: tracing is the multiplier.
- **100% sampling everywhere.** Rejected: cost; 10% production with tail-on-error is correct.

## Success Metrics

- **Primary**: End-to-end trace verified within 14 days.
- **Guardrail**: Trace-store cost < $100/month at staging scale.

## Scope

### In scope
- Instrumentation + trace store + propagation + sampling + log correlation + Grafana viewer + runbook.

### Out of scope
- Profiling (out of scope; consider for production track).
- Real-User-Monitoring (out of scope; web app uses synthetic E2E tests instead).

## Dependencies

- **Upstream**: P09-T01 (logs); P09-T02 (Grafana).
- **Downstream**: P09-T04 (alerting can drill from alert → trace).
- **People**: engineer authoring.

## Open Questions

- Q1: Tempo or Jaeger? Recommendation: Tempo (better Loki integration).
- Q2: Sampling — 10% production reasonable? Recommendation: yes; tune.

## Implementation Notes

- OpenTelemetry SDK auto-instruments common libraries; manual instrumentation for engine pipeline stages.
- LLM API calls instrumented as spans with model, token count, cost as attributes.
- Trace-ID embedded in logs as `trace_id` field.
- Sampling decision at root span; child spans inherit.

## Test Plan

- Test 1: Sample request creates a trace; trace-ID embedded in logs.
- Test 2: Cross-service trace propagation works.
- Test 3: Sampling — verify production-rehearsal samples ~10%; tail-sample on error.
- Test 4: Grafana drill-down from metric → trace works.

## Rollback Plan

- Instrumentation overhead too high → reduce manual span count or sampling rate.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Trace store config | Helm values | Engineer | Continuous |
| Instrumentation code | Per-workspace | Engineer | Continuous |
| Tracing runbook | `docs/runbooks/tracing.md` | Engineer | Continuous |

## Operational Risks

- **Trace store outage.** Mitigation: traces are non-critical; system runs without; alert.
- **High-cardinality span attributes.** Mitigation: review at PR.

## Definition of Done

- Tracing operational; runbook published.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: engineer authors implementation.
