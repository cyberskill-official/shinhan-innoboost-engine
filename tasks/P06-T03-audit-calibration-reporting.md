---
title: "Implement HITL audit trail and quarterly calibration reporting"
author: "@cyberskill-engine-tech-lead"
department: engineering
status: draft
priority: p1
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: minimal
target_release: "2026-08-21"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Implement HITL-specific audit trail and calibration reporting: every reviewer decision logged via P02-T09 audit log with case ID, reviewer ID, action, before/after, reason, and timing; a quarterly calibration report that surfaces reviewer-disagreement clusters (different reviewers handling similar cases differently), drift over time (a reviewer's decision pattern shifts noticeably), SLA-adherence trends per reviewer, and reject-reason distributions per BU; an admin-facing dashboard summarising the report; recommendations for reviewer training or rule tuning. Calibration is the structural enforcement of "reviewers stay consistent" — without it, decision quality degrades silently.

## Problem

Without calibration reporting, the HITL workflow looks consistent on day 1 and gradually diverges as reviewers accumulate personal heuristics. Consistency matters for fairness (similar cases handled similarly), for audit credibility (reviewers can be trusted to be consistent), and for prompt tuning (reviewer disagreement is a signal that the engine prompt needs work).

Specific gaps if we shortcut:

- **Without per-reviewer audit trail, no way to identify pattern outliers.**
- **Without disagreement clustering, similar cases handled inconsistently surface only by accident.**
- **Without drift detection, a reviewer's decision pattern shifting is invisible.**
- **Without SLA-adherence trends, reviewer overload is unflagged until breach.**
- **Without reject-reason distribution, P04-T05 reviewer-feedback loop has noisy input.**

The `feedback_p1_scope_preference` memory note biases us richer. For calibration, "richer" means: per-reviewer audit + disagreement clustering + drift detection + SLA trends + reason distribution + admin dashboard + quarterly report + training recommendations.

## Proposed Solution

A reporting module in `hitl/calibration/` that aggregates HITL audit events and produces:

1. **Per-reviewer audit trail.** All reviewer actions per reviewer; queryable.
2. **Disagreement clustering.** Identifies clusters of similar cases (semantic similarity > 0.85) where different reviewers reached different decisions.
3. **Drift detection.** Identifies reviewers whose decision pattern (approve / edit / reject distribution) has shifted > 15% from their 90-day baseline.
4. **SLA-adherence trends.** Per-reviewer + per-BU SLA performance over time.
5. **Reject-reason distributions.** Top-K reasons per BU; trend.
6. **Quarterly report.** Auto-generated PDF summarising the above; sent to founder + compliance lead.
7. **Admin dashboard.** Real-time version of the report in admin console (P05-T05).
8. **Recommendations.** Heuristic-driven: "reviewer X has 25% reject rate (peer median 12%) — investigate"; "reject reason 'wrong_metric' increased 30% this quarter — review the metric registry".

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Implement audit-trail query API.** Wraps P02-T09 audit log with HITL-specific filters: by reviewer, by case, by action, by reject-reason.
- [ ] **Implement disagreement clustering.** Nightly job: cluster resolved cases by semantic question similarity; flag clusters with mixed action distribution (e.g., 3 approved + 2 rejected for similar questions).
- [ ] **Implement drift detection.** Per-reviewer 90-day rolling baseline of action distribution; alert if current 30-day window deviates > 15%.
- [ ] **Implement SLA-trend analysis.** Per-reviewer + per-BU adherence rate by week; trend chart.
- [ ] **Implement reject-reason distribution.** Per-BU top-K reasons by week; trend.
- [ ] **Implement quarterly report generator.** Auto-generates PDF on the 1st of each quarter; sections: per-reviewer summary, disagreement clusters, drift findings, SLA trends, reason distribution, recommendations. Sent to founder + compliance lead.
- [ ] **Implement admin dashboard.** Real-time version in admin console: SLA-trend chart, drift alerts, disagreement-cluster list, reason-distribution chart.
- [ ] **Implement recommendation heuristics.** Documented rules: drift > 15% triggers training recommendation; SLA adherence < 90% triggers workload review; reject-rate outlier (> 2 stddev from peer median) triggers consistency review; rising reason "wrong_metric" triggers metric-registry review.
- [ ] **Implement export.** Reports + dashboards exportable to CSV / PDF.
- [ ] **Test exhaustively.** > 50 tests covering clustering correctness, drift detection accuracy, recommendation triggers.

### Acceptance criteria

- Audit-trail query API operational.
- Clustering, drift detection, SLA trends, reason distribution all implemented.
- Quarterly report generator operational; first report generated for the most recent quarter.
- Admin dashboard live in admin console.
- Recommendation heuristics in place.
- Tests passing.

## Alternatives Considered

- **Skip clustering; surface every case manually.** Rejected: clustering is the seam that makes the report scalable.
- **Manual quarterly report (founder writes).** Rejected: auto-generated saves time and is consistent.
- **Skip drift detection.** Rejected: silent decay of reviewer consistency is the failure mode this addresses.

## Success Metrics

- **Primary**: First quarterly report generated within 14 days of task assignment.
- **Guardrail**: Reviewer drift events captured within 7 days of occurring.

## Scope

### In scope
- Audit-trail query, clustering, drift, SLA trends, reason distribution.
- Quarterly report + admin dashboard + recommendations.
- Export.
- Tests.

### Out of scope
- Reviewer training itself (HR concern; this task only triggers the recommendation).
- External-facing audit reports (handled in P11-T04 compliance dossier).

## Dependencies

- **Upstream**: P02-T09 (audit log), P06-T01 (queue + routing), P06-T02 (reviewer console writes events), P05-T05 (admin console hosts dashboard).
- **People**: engine tech lead authoring; compliance lead reviewing recommendations; founder ratifying quarterly-report distribution.

## Open Questions

- Q1: Drift threshold — 15% of action distribution deviation. Tunable? Recommendation: yes; per-tenant override.
- Q2: Cluster threshold — 0.85 semantic similarity. Tunable? Recommendation: yes.
- Q3: Quarterly report distribution — founder + compliance lead; should it go to all reviewers? Recommendation: aggregated stats yes; individual drift findings only to that reviewer + manager.

## Implementation Notes

- Clustering uses pgvector over case-embedding column (same vectors as P02-T02 retriever).
- Drift detection runs nightly; per-reviewer 30-day vs 90-day distribution comparison via Kolmogorov-Smirnov test (or simpler distribution-distance metric).
- Quarterly report is a Markdown → PDF pipeline; stored in legal vault.
- Admin dashboard refreshes every 15 minutes.

## Test Plan

- Test 1: Audit-trail query — by reviewer / case / action / reason filters work.
- Test 2: Clustering — synthetic cases with known disagreement; cluster correctly identified.
- Test 3: Drift detection — synthetic shift; detection fires.
- Test 4: SLA-trend — synthetic SLA breaches; trend reflects.
- Test 5: Recommendation triggers — synthetic outlier reviewer; recommendation fires.
- Test 6: Quarterly report generation — runs end-to-end; PDF produced.

## Rollback Plan

- Bad clustering / drift / recommendation rolled back via PR.
- Bad quarterly report regenerated manually.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Calibration module | `hitl/calibration/` | Engine tech lead | Continuous |
| Quarterly reports | `legal/audits/hitl-calibration/{year}-Q{n}.pdf` | Founder | 7 years |
| Admin dashboard | Admin console (P05-T05) | Engine tech lead | Continuous |
| Drift alert log | Central observability store | Engine tech lead | 7 years |

## Operational Risks

- **False-positive drift alerts.** Mitigation: triage; threshold tuning.
- **Quarterly report misses an important pattern.** Mitigation: admin dashboard + ad-hoc queries; report is a starting point not the only view.
- **Reviewer perceives drift detection as surveillance.** Mitigation: framed as quality + training; aggregated stats public, individual findings private.

## Definition of Done

- Module + reporting + dashboard + tests in place.
- First quarterly report generated.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Calibration consumes HITL-event data from the audit log (P02-T09); no customer data beyond what's already there.

### Human Oversight
Compliance lead reviews quarterly reports; founder ratifies recommendations.

### Failure Modes
- Wrong cluster: triage; no automated action.
- Wrong drift detection: triage; no automated reviewer change.
- Recommendation rejected: noted; no enforcement.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: engine tech lead authors implementation; compliance lead reviews recommendations; founder ratifies quarterly-report distribution.
