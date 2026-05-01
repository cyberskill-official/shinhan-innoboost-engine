---
title: "Build cost dashboard with per-question and anomaly detection"
author: "@cyberskill-eng"
department: engineering
status: draft
priority: p1
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: minimal
target_release: "2026-09-11"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Build the cost-tracking dashboard that aggregates engine costs per concern: LLM API cost (token-based, per question, per BU); warehouse query cost (BigQuery slot-time, Snowflake credits, Postgres compute); GPU rental cost (Lambda Labs, Runpod from P00-T05); cloud infrastructure (cluster, storage, network); per-tenant attribution where applicable. Plus anomaly detection on cost: per-question outliers (a single question costing 10× median triggers alert); per-day spend deviation (today > 2× rolling 7-day average); per-BU trend (one BU spiking unexpectedly). Visible in admin console (P05-T05) and surfaced in P11-T04 compliance dossier as commercial-readiness evidence. Cost discipline is the structural enforcement of "this is economically deployable" — without per-question attribution, scaling pricing is guesswork.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"the VND 200M PoC envelope covers our engineering cost-share — engineering effort beyond cap is co-invested by CyberSkill as commercial signal" — CyberSkill SF9/SB5/SS1 form answers
"production-track scope (post-PoC) priced separately; indicative range USD 60–120K" — CyberSkill SF9/SB5/SS1 form answers
</untrusted_content>

## Problem

Form Answers commit to commercial-track pricing in a specific range. That range is defensible only if we know per-question + per-tenant cost. Without a cost dashboard, post-PoC pricing conversations start blind.

Specific gaps if we shortcut:

- **Without per-question LLM cost, "is this profitable?" is unanswerable.**
- **Without per-tenant attribution, multi-tenant pricing models cannot be validated.**
- **Without anomaly detection, cost surprises happen — a runaway query, a misconfigured cache, a new feature with unexpected token consumption.**
- **Without trend visibility, slow drift goes unnoticed.**

The `feedback_p1_scope_preference` memory note biases us richer. For cost, "richer" means: per-question + per-tenant + per-concern (LLM / warehouse / GPU / infra) + anomaly detection + trend + admin console surface + monthly review.

## Proposed Solution

A cost-tracking module in `engine/cost/` plus admin dashboard:

1. **Cost tagging.** Every LLM call, warehouse query, GPU rental session, infra resource is tagged with: tenant, BU, question-ID (where applicable), cost-USD.
2. **Aggregation.** Per-question cost (LLM tokens × rate + warehouse query cost); per-day, per-BU, per-tenant rollups.
3. **Anomaly detection.** Per-question outlier (10× median); per-day spend deviation (> 2× 7-day average); per-BU trend (sudden spike).
4. **Admin dashboard.** In P05-T05; charts + tables; export to CSV.
5. **Monthly review.** PM-owned; aligned with other compliance reviews.
6. **Alerts.** Hard cap at $50/day staging; $300/week total spend (P00-T05 GPU cap); exceeding triggers PagerDuty alert.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Implement cost tagging in pipeline.** P02-T02 NL→SQL pipeline emits a `cost` event per question: LLM tokens × rate (per ADR-SHB-002 model + provider rate); warehouse query cost from adapter (P02-T01); cache-hit savings noted.
- [ ] **Implement GPU rental cost ingestion.** Lambda + Runpod APIs queried daily; cost per spin-up logged.
- [ ] **Implement infrastructure cost ingestion.** GCP / AWS billing API queried daily; cost per service tagged.
- [ ] **Build per-question cost record.** Per question: tenant, BU, intent, cache hit (yes/no), LLM cost, warehouse cost, total cost.
- [ ] **Build aggregation.** Per-day, per-BU, per-tenant rollups; stored in Postgres (cost analytics table).
- [ ] **Implement anomaly detection.** Three rules: per-question outlier; per-day spend deviation; per-BU trend.
- [ ] **Build admin dashboard.** In P05-T05: chart panels for per-day spend, per-BU breakdown, top-10 expensive questions, trend over 30 days; CSV export.
- [ ] **Configure alerts.** PagerDuty integration; hard caps; anomaly notifications.
- [ ] **Schedule monthly review.** Cost review with founder; identify optimisation opportunities.
- [ ] **Surface in P11-T04 compliance dossier** as commercial-readiness evidence.
- [ ] **Test exhaustively.**

### Acceptance criteria

- Cost tagging in pipeline.
- Aggregation correct against test scenarios.
- Anomaly detection catches synthetic outliers.
- Admin dashboard renders correctly.
- Alerts fire at thresholds.
- Monthly review scheduled.

## Alternatives Considered

- **Aggregate cost only (no per-question attribution).** Rejected: defeats the unit-economics conversation.
- **Use cloud-vendor cost-explorer alone.** Rejected: doesn't track LLM API costs which are the largest line item.
- **Skip anomaly detection.** Rejected: cost surprises are the failure mode.

## Success Metrics

- **Primary**: Cost dashboard live within 14 days; per-question cost attribution working.
- **Guardrail**: Zero unbudgeted cost surprises during the engagement.

## Scope

### In scope
- Per-question + per-tenant + per-concern cost tagging.
- Aggregation + anomaly detection.
- Admin dashboard + CSV export.
- Alerts.
- Monthly review.
- Dossier integration.

### Out of scope
- Per-tenant billing (post-PoC commercial-track).
- Currency conversion to VND for customer-facing reports (deferred unless requested).

## Dependencies

- **Upstream**: P00-T05 (GPU cost source); P01-T03 (Doppler for billing API credentials); P02-T02 (engine emits cost events); P09-T01..T04 (observability foundation).
- **Downstream**: P11-T04 (dossier).
- **People**: engineer authoring; founder reviewing alert thresholds.

## Open Questions

- Q1: LLM rate sources — Anthropic published rates; cache fluctuations? Recommendation: rate config in Doppler; updated on rate changes.
- Q2: For per-tenant attribution in production, is the demo's current pattern (single-tenant in staging) sufficient? Recommendation: yes for demo; multi-tenant attribution validated post-kickoff.
- Q3: Anomaly thresholds tunable? Recommendation: yes per environment.

## Implementation Notes

- Cost events emitted async; aggregation materialised view refreshed every 5 minutes.
- Anomaly detection runs every 15 minutes.
- Admin dashboard reads from materialised view (fast).
- LLM rate updates via Doppler; pulled at engine startup; refreshed on Doppler webhook.

## Test Plan

- Test 1: Cost emission on every pipeline run.
- Test 2: Aggregation totals match individual events.
- Test 3: Anomaly detection — synthetic outlier triggers alert.
- Test 4: Dashboard renders with 30-day data.
- Test 5: CSV export valid format.
- Test 6: Hard-cap alert fires at threshold.

## Rollback Plan

- Bad cost calculation rolled back via PR; aggregation re-computed.
- Bad anomaly threshold adjusted at runtime.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Cost module | `engine/cost/` | Engineer | Continuous |
| Per-question cost records | Postgres `cost_events` | Engineer | 1 year |
| Aggregations | Postgres materialised views | Engineer | Continuous |
| Anomaly alerts log | Central observability store | Engineer | 1 year |
| Monthly review records | `docs/audit/cost-reviews/{date}.md` | PM | Until program end |
| Dashboard | Admin console (P05-T05) | Engineer | Continuous |

## Operational Risks

- **LLM rate change unobserved.** Mitigation: rate config + Doppler webhook; founder reviews rate changes monthly.
- **Cost-event back-pressure.** Mitigation: async; bounded buffer; alert on drop.
- **Anomaly false positives spam.** Mitigation: tuning; quiet-hours.
- **Aggregation drift from individual events.** Mitigation: nightly reconciliation.

## Definition of Done

- Module + dashboard + alerts + monthly review all in place.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Cost module consumes provider billing data + per-question metadata; no AI training; no customer-data flow.

### Human Oversight
Founder reviews monthly; alerts trigger immediate review.

### Failure Modes
- Cost calculation wrong: caught by reconciliation.
- Alert fails to fire: hard caps as backup.
- Provider rate change: Doppler webhook + manual review.

## Sales/CS Summary

CyberSkill's cost-tracking dashboard makes our commercial-track pricing concrete. Every question shows its true cost: LLM tokens, warehouse query time, infrastructure share. Aggregations roll up per BU and per tenant; anomaly detection catches surprises before they become bills. When a Shinhan procurement team asks "what's your unit economics?", we point at the dashboard, not at projections.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: engineer authors implementation; founder reviews alert thresholds.
