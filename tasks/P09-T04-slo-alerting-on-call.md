---
title: "Configure SLO doc, alerting, and on-call runbook"
author: "@cyberskill-eng-sec"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: not_ai
target_release: "2026-09-11"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Define and enforce Service Level Objectives (SLOs) for the demo build with corresponding alert rules + on-call runbook. SLOs: availability 99.5% (engine + UI); latency p95 < 5s on cached, < 30s on ad-hoc (engine); eval accuracy ≥ 95% (rolling 7-day); HITL SLA adherence ≥ 95%; per-question LLM cost < $0.10. Alerts fire on SLO burn-rate (multi-window: 1-hour fast burn + 6-hour slow burn). On-call rotation responds per documented runbook. SLOs are the structural enforcement of "we run this like a service" — without explicit objectives, "fast" and "reliable" are rhetorical.

## Problem

Without SLOs, reliability is opinion. Banking-sector reviewers expect documented service-level objectives; SLO-driven on-call is the standard.

Specific gaps if we shortcut:

- **Without SLOs, "fast" is undefined.**
- **Without burn-rate alerts, breaches discovered late.**
- **Without on-call runbook, response is improvised.**
- **Without per-incident severity, all alerts feel equal.**

The `feedback_p1_scope_preference` memory note biases us richer. For SLOs, "richer" means: 5+ documented SLOs + multi-window burn-rate + on-call rotation + per-severity playbooks + monthly SLO review.

## Proposed Solution

A SLO + alerting + on-call layer:

1. **SLO doc** at `docs/observability/SLOs.md`.
2. **Burn-rate alerts** in Prometheus / Grafana; multi-window (fast + slow).
3. **On-call rotation** (P08-T08 BCM cross-reference); PagerDuty.
4. **Per-severity playbooks** (P1: customer-impact; P2: degraded; P3: minor).
5. **Monthly SLO review** to validate targets are right.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Author SLO doc.** Per service: SLO target, error budget, measurement window, calculation method.
- [ ] **Configure burn-rate alerts.** Per SLO: 1-hour fast burn (alert on > 14× consumption rate); 6-hour slow burn (alert on > 6× rate). Configured in Prometheus rules.
- [ ] **Configure PagerDuty.** Service definitions; escalation policies; weekly rotation; backup on-call.
- [ ] **Author per-severity playbooks.** Cross-reference P08-T08 IR playbooks; SLO-specific actions.
- [ ] **Schedule monthly SLO review.** PM owns; aligned with cost-tracking review.
- [ ] **Brief the squad.** SLO + on-call primer.
- [ ] **Cross-reference with P11-T04 dossier.**

### Acceptance criteria

- SLO doc published.
- Alerts configured; tested with simulated burn.
- On-call rotation operational.
- Per-severity playbooks live.
- Monthly review scheduled.

## Alternatives Considered

- **Skip burn-rate alerting; threshold-based alerts only.** Rejected: threshold alerts spam; burn-rate is the standard for SLO-driven.
- **Single SLO (availability only).** Rejected: latency, accuracy, cost matter.

## Success Metrics

- **Primary**: All deliverables within 14 days.
- **Guardrail**: SLO targets met ≥ 95% of measurement windows during the engagement.

## Scope

### In scope
- SLO doc + alerts + on-call + per-severity playbooks + monthly review.

### Out of scope
- Logs (P09-T01); metrics dashboards (P09-T02); tracing (P09-T03); cost dashboard (P09-T05).

## Dependencies

- **Upstream**: P09-T01..T03 (logs / metrics / tracing); P08-T08 (IR runbooks).
- **Downstream**: P11-T04 (compliance dossier).
- **People**: eng-sec authoring; ops lead reviewing on-call; founder ratifying SLO targets.

## Open Questions

- Q1: SLO target for availability — 99.5% or 99.9%? Recommendation: 99.5% for staging; 99.9% for production-rehearsal; tune for production track.
- Q2: PagerDuty cost vs. open-source? Recommendation: PagerDuty for the demo phase.

## Implementation Notes

- SLO doc lives alongside operational runbooks; cross-referenced.
- Burn-rate uses standard SRE-book formulas.
- On-call schedule visible in admin console.

## Test Plan

- Test 1: Burn-rate alerts fire on simulated SLO breach.
- Test 2: PagerDuty pages reach on-call.
- Test 3: Per-severity playbooks executable.
- Test 4: Monthly review runs first iteration.

## Rollback Plan

- Bad SLO target adjusted via PR; doc versioned.
- Bad alert silenced via runtime config.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| SLO doc | `docs/observability/SLOs.md` | Eng-sec | Continuous |
| Alert rules | `infra/observability/alerts.yaml` | Eng-sec | Continuous |
| PagerDuty config | PagerDuty | Ops | Continuous |
| Playbooks | `docs/runbooks/severity/` | Eng-sec | Continuous |
| Monthly review records | `docs/audit/slo-reviews/{date}.md` | PM | 7 years |

## Operational Risks

- **Alert fatigue.** Mitigation: burn-rate alerts; per-severity routing; monthly tune.
- **On-call burnout.** Mitigation: weekly rotation; backup; founder fallback.

## Definition of Done

- All deliverables in place.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: eng-sec authors; ops lead reviews; founder ratifies SLO targets.
