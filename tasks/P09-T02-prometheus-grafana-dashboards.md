---
title: "Build Prometheus + Grafana dashboards (engine, eval, HITL, cost)"
author: "@cyberskill-eng"
department: engineering
status: draft
priority: p0
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

Build the Prometheus + Grafana metrics observability layer with dashboards per concern: engine health (latency, error rate, throughput); eval (per-metric accuracy, regression alerts); HITL (queue depth, SLA adherence, reviewer load); cost (per-question LLM cost, warehouse cost, GPU cost); security (auth events, denied authorisations, prompt-injection attempts). Each dashboard has documented panels, refresh cadence, and intended audience. Demo Day rehearsal pulls up the engine dashboard live to show "we run this like a service". Without dashboards, our operational claims are rhetorical.

## Problem

Logs (P09-T01) tell you what happened; metrics tell you what's happening. Without metrics, latency / error / cost trends are invisible until they break. Banking-sector reviewers expect metric dashboards as table stakes.

Specific gaps if we shortcut:

- **Without engine dashboard, "p95 < 5s" is unverified.**
- **Without eval dashboard, regression visibility lags.**
- **Without HITL dashboard, queue health is unmonitored.**
- **Without cost dashboard, LLM cost surprises happen.**
- **Without security dashboard, auth + injection patterns are invisible.**

The `feedback_p1_scope_preference` memory note biases us richer. For dashboards, "richer" means: 5 dashboards + per-panel documentation + refresh cadence + intended audience + Demo-Day-rehearsable + alert integration (P09-T04).

## Proposed Solution

A Prometheus + Grafana stack:

1. **Prometheus** scrape metrics from every workspace; OpenTelemetry-native exporters.
2. **Grafana** dashboards per concern.
3. **Five dashboards**: engine, eval, HITL, cost, security.
4. **Per-dashboard documentation**: panels, refresh cadence, intended audience, alert thresholds.
5. **Admin console integration** (P05-T05): dashboard links surfaced.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Deploy Prometheus + Grafana via Helm** (P01-T04). Cluster-internal; private ingress for engineers.
- [ ] **Configure Prometheus scrape.** Every workspace exposes `/metrics` (OpenTelemetry-native counters, gauges, histograms); Prometheus scrapes per service-discovery.
- [ ] **Build engine dashboard.** Panels: requests-per-second; latency p50/p95/p99 by stage (intent / retriever / generator / validator / executor / post-processor); error rate; cache hit rate; LLM API latency; warehouse query latency; concurrent users.
- [ ] **Build eval dashboard.** Panels: per-metric accuracy trend; per-BU pass rate; latency budget vs. actual; regression alerts; gold-set version.
- [ ] **Build HITL dashboard.** Panels: queue depth (current + 24h history); SLA adherence rate; per-reviewer load; SLA-warning + breach counts; cases approved / edited / rejected (per BU).
- [ ] **Build cost dashboard.** Panels: LLM cost per question (rolling 24h, weekly, monthly); LLM cost per BU; warehouse query cost; GPU rental cost (P00-T05); total spend; cost-cap alerts.
- [ ] **Build security dashboard.** Panels: auth success / failure; MFA prompts; denied authorisations (RBAC denials); prompt-injection attempts (caught at sanitiser / classifier / etc.); break-glass overrides; admin actions.
- [ ] **Document each dashboard.** `docs/observability/DASHBOARDS.md`: per-dashboard purpose, panels, audience, alert thresholds.
- [ ] **Configure dashboard refresh cadence.** 1-minute for engine / HITL / security; 5-minute for eval; 15-minute for cost.
- [ ] **Surface in admin console** (P05-T05): dashboard links from relevant admin pages.
- [ ] **Pre-rehearse Demo Day usage.** Engine dashboard during rehearsal; verify it's visually compelling under reviewer attention.

### Acceptance criteria

- Prometheus + Grafana operational.
- Five dashboards live with documented panels.
- Refresh cadence configured.
- Admin console links live.
- Demo-Day rehearsal of engine dashboard verified.

## Alternatives Considered

- **Datadog instead of Prometheus + Grafana.** Rejected: vendor cost; OpenTelemetry-native is more portable.
- **Skip security dashboard.** Rejected: visibility is the point.
- **One mega-dashboard.** Rejected: per-concern is more usable.

## Success Metrics

- **Primary**: All 5 dashboards within 14 days.
- **Guardrail**: Dashboard latency < 2s on first load.

## Scope

### In scope
- Prometheus + Grafana deployment.
- 5 dashboards.
- Documentation.
- Admin console links.

### Out of scope
- Logs (P09-T01).
- Tracing (P09-T03).
- Alerting (P09-T04).
- Cost detail (P09-T05).

## Dependencies

- **Upstream**: P01-T04 (Helm); P09-T01 (logs feed some metrics).
- **Downstream**: P09-T04 (alerting consumes metrics).
- **People**: engineer authoring; design lead reviewing visual layout.

## Open Questions

- Q1: Self-hosted Grafana or Grafana Cloud? Recommendation: self-hosted for residency.
- Q2: Per-BU dashboard variants or single dashboard with BU filter? Recommendation: filter (less duplication).

## Implementation Notes

- Each metric has a documented label-set; high-cardinality labels avoided.
- Dashboards saved as JSON in source control (`infra/observability/dashboards/`); deployed via Grafana provisioning.
- Demo-Day-rehearsable means the dashboard renders well projector-sized; large readable text.

## Test Plan

- Test 1: Prometheus scrapes every workspace; verified.
- Test 2: Each dashboard renders; panels populate.
- Test 3: Latency under 2s.
- Test 4: Demo rehearsal — visual review by founder.

## Rollback Plan

- Bad dashboard rolled back via JSON revert.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Prometheus config | Helm values | Engineer | Continuous |
| Grafana dashboards JSON | `infra/observability/dashboards/` | Engineer | Continuous |
| Dashboard documentation | `docs/observability/DASHBOARDS.md` | Engineer | Continuous |

## Operational Risks

- **Prometheus retention bloat.** Mitigation: 30-day raw + 1-year downsampled.
- **High-cardinality metric.** Mitigation: review at PR; reject if dimension explodes.

## Definition of Done

- Dashboards live; documentation; admin console links.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: engineer authors dashboards; design lead reviews visual layout.
