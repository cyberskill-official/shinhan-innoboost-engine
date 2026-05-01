---
title: "Wire reviewer-feedback → engine improvement loop"
author: "@cyberskill-engine-tech-lead"
department: engineering
status: draft
priority: p1
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: limited
target_release: "2026-08-21"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Wire the HITL reviewer-console outputs (P06-T02) into the engine-improvement workflow: approved-with-edits → gold-set candidate review (P04-T05); rejected-with-reason → prompt-improvement queue (P02-T02 prompt tuning) and metric-registry review (P02-T01); patterns across rejections → metric-registry corrections. The loop is what turns reviewer time into engine improvement; without it, every rejection's lesson is lost. Setup target: 14 days from task assignment after P06-T02.

## Problem

Reviewer time is expensive; reviewer learning is even more expensive. Without a structural loop, reviewer corrections don't compound — each rejection is a one-shot. With the loop, each rejection becomes a candidate prompt-tuning input, gold-set entry, or metric-registry update.

Specific gaps if we shortcut:

- **Without edit-and-approve → gold-set candidacy, well-formed corrections are lost.**
- **Without reject-reason → prompt queue, recurring failures don't improve the prompt.**
- **Without pattern aggregation → metric-registry review, systematic issues don't get fixed.**
- **Without engineer-facing surface, the engine team doesn't see the work needed.**

## Proposed Solution

Two-level wiring:

1. **Edit-and-approve flow.** When a reviewer edits and approves, the diff (engine output → reviewer's correction) is captured; if the reviewer marks "this should be in the gold-set", the case becomes a gold-set candidate (P04-T05). Eng-data reviews; promotes if appropriate.
2. **Reject flow.** When a reviewer rejects with structured reason (insufficient_data / wrong_metric / sensitive_information / out_of_scope / other), the reason is aggregated; clusters with > 3 occurrences become tickets in the prompt-improvement queue (engine tech lead's review surface).
3. **Pattern aggregation.** Per-week analysis: top reject reasons by BU, by metric, by intent class. Surfaces in admin dashboard and quarterly calibration report (P06-T03).
4. **Engineer-facing prompt-improvement queue.** Linear / ClickUp tickets auto-created with reproducer cases; engine tech lead works through the queue; resolutions tracked.
5. **Metric-registry corrections.** Pattern: "reject reason = wrong_metric" repeatedly on metric X → eng-data adds tickets to revisit metric X's definition or scope.

Setup target: 14 days from task assignment after P06-T02.

### Subtasks

- [ ] **Implement edit-capture.** P06-T02 reviewer console writes the edit diff + "promote to gold-set" flag to a `feedback_events` table.
- [ ] **Implement reject-capture.** P06-T02 writes structured reject reason + free-text + question + engine output.
- [ ] **Implement clustering job.** Nightly cluster of rejections by question similarity + reason; clusters with > 3 occurrences surface to a Linear / ClickUp queue.
- [ ] **Implement engineer-facing prompt-improvement queue.** Auto-creates tickets in the project tracker (P00-T06 workspace); ticket includes representative cases, count, reasons, sample engine outputs.
- [ ] **Implement gold-set candidacy review surface.** In admin console (P05-T05): list of gold-set candidates from edit-and-approve; eng-data reviews and promotes (P04-T01 authorship workflow).
- [ ] **Implement metric-registry pattern surface.** Per-metric reject-reason distribution; outliers ("metric X has 30% wrong_metric reject rate") surface to eng-data.
- [ ] **Implement loop observability.** Per-week metrics: feedback events captured; clusters surfaced; prompts tuned; gold-set additions; metric updates.
- [ ] **Test end-to-end.** Sample reject + edit-and-approve; verify both flow into appropriate downstream surfaces.

### Acceptance criteria

- Edit-and-approve diff capture operational.
- Reject reason capture operational.
- Clustering job runs; clusters surface to project tracker.
- Engineer-facing queue active.
- Gold-set candidacy review surface operational.
- Metric-registry pattern surface operational.
- Loop observability flowing.
- E2E test pass.

## Alternatives Considered

- **Manual aggregation of feedback (no clustering).** Rejected: doesn't scale.
- **Auto-promote gold-set candidates.** Rejected: gold-set quality requires human review.
- **Skip metric-registry pattern surface.** Rejected: systematic metric issues are the most impactful to fix.

## Success Metrics

- **Primary**: First feedback-driven prompt tune deployed within 30 days of HITL going live.
- **Guardrail**: Top reject reasons trend downward over the engagement.

## Scope

### In scope
- Edit-and-approve diff capture.
- Reject reason capture.
- Clustering + queue.
- Gold-set candidacy + metric-registry pattern surfaces.
- Loop observability.

### Out of scope
- Triage rules (P06-T01).
- Reviewer console (P06-T02).
- Calibration reporting (P06-T03).
- Notifications (P06-T05).

## Dependencies

- **Upstream**: P06-T02 (reviewer console writes events); P02-T09 (audit log); P04-T05 (gold-set candidacy promotion); P02-T01 (metric registry).
- **People**: engine tech lead authoring; eng-data reviewing.

## Open Questions

- Q1: Cluster threshold — 3 occurrences? Recommendation: yes for v1; tune.
- Q2: Auto-create Linear tickets — only for clusters or also for individual high-severity rejects? Recommendation: clusters only; individuals via the cluster they roll into.
- Q3: Prompt-tuning ownership — engine tech lead or eng-llm? Recommendation: engine tech lead with eng-llm consultation.

## Implementation Notes

- Question-similarity uses pgvector embeddings (same as P02-T02 retriever).
- Reject reason is structured (enum) plus optional free text; cluster on enum + free-text similarity.
- Linear ticket creation via API; CODEOWNERS on the project routes auto-tickets to engine tech lead.
- For metric-registry pattern, a metric's rejection rate (wrong_metric reason / total cases involving this metric) over a 30-day window; alert on > 20%.

## Test Plan

- Test 1: Edit-and-approve flow — verify diff captured + gold-set candidate created.
- Test 2: Reject flow — verify reason captured + clustering forms.
- Test 3: Cluster surfaces to project tracker.
- Test 4: Metric-registry pattern fires on synthetic data.
- Test 5: Loop observability metrics flow.

## Rollback Plan

- Bad clustering rolled back via PR.
- Bad ticket auto-creation paused via runtime config.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Feedback events | Postgres `feedback_events` | Engine tech lead | 7 years |
| Cluster surface | Project tracker (Linear / ClickUp) | Engine tech lead | Continuous |
| Gold-set candidate review | Admin console | Eng-data | Continuous |
| Metric-registry pattern surface | Admin console | Eng-data | Continuous |
| Loop metrics | Central observability store | Engine tech lead | Continuous |

## Operational Risks

- **Reviewer fatigue with structured reject reasons.** Mitigation: minimal reason set; "other with text" available.
- **Cluster noise.** Mitigation: 3+ occurrence threshold.
- **Linear ticket flood.** Mitigation: per-cluster (not per-event); rate limit.
- **Metric-registry false alarm (high rejection rate but the metric is correct, the questions are wrong).** Mitigation: eng-data review before action.

## Definition of Done

- Loop operational; first cycle through completed.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Loop consumes reviewer-correction data — corrections may include user-original question + reviewer-edited answer. Treat per P02-T07 PDPL rules.

### Human Oversight
Eng-data reviews every gold-set candidate; engine tech lead reviews prompt-improvement tickets; eng-data reviews metric-registry pattern findings.

### Failure Modes
- Wrong cluster: noise; eng-data filters.
- Promoted candidate is wrong: revert at next gold-set version bump.
- Auto-ticket spam: rate limit + cluster-only.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: engine tech lead authors; eng-data reviews promotion flow.
