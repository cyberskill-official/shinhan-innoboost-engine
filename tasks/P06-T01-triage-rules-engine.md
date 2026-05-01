---
title: "Implement HITL triage rules engine (confidence + sensitivity + novelty)"
author: "@cyberskill-engine-tech-lead"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: limited
target_release: "2026-08-07"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Implement the HITL queue's triage rules engine that decides which questions go to a human reviewer and which are answered directly: confidence tier < 65% → route; sensitivity tier ≥ Restricted AND user role < Admin → route; question is novel (semantic similarity below threshold to anything in gold-set or recently-approved) → route; metric flagged for review → route. Also: queue priority (SLA-critical, high-priority, normal); routing within reviewer pool (round-robin within each BU); reviewer assignment with auto-escalation on SLA breach. Triage decisions are deterministic, audited, and tunable per tenant. The triage rules engine is what makes the HITL workflow scale — without it, every request becomes a reviewer's individual judgment call.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"HITL turnaround < 30 minutes from question to approved answer for HITL-required queries" — CyberSkill SB5 form answer
"HITL reviewer queue with approval flow and per-decision audit log" — CyberSkill SB5 form answer
</untrusted_content>

## Problem

The SB5 brief explicitly required HITL. The Form Answer commits to a 30-minute SLA and per-decision audit. Without a triage rules engine, every question is handled identically — either everything goes to HITL (overwhelming reviewers) or nothing does (defeating the purpose). The engine is the structural seam that makes HITL operationally feasible.

Specific gaps if we shortcut:

- **Without confidence-based triage, reviewers handle high-confidence answers unnecessarily.**
- **Without sensitivity-based triage, regulated questions reach users without review.**
- **Without novelty triage, well-handled question patterns get re-reviewed.**
- **Without queue priority, SLA-critical cases sit behind low-priority ones.**
- **Without round-robin routing, one reviewer becomes the bottleneck.**
- **Without auto-escalation, SLA breaches go unnoticed.**

The `cyberos_ai_compliance` memory note's 7 primitives include "human-in-the-loop" as a foundational primitive. This task is its implementation.

The `feedback_p1_scope_preference` memory note biases us richer. For triage, "richer" means: multi-condition rules + priority + routing + auto-escalation + per-tenant tunability + audit + observability. Each layer is straightforward; together they form an enterprise-grade HITL workflow.

## Proposed Solution

A triage rules engine in `hitl/triage/`:

1. **Rule evaluation** at routing time. Inputs: confidence tier, sensitivity tier, user role, question novelty, metric flags, tenant config. Output: route decision + priority + assigned reviewer.
2. **Queue priority** (SLA-critical / high / normal); SLA-critical entries jump to the top.
3. **Reviewer routing** (round-robin within BU + role match).
4. **Auto-escalation** on SLA breach (warning at 20 min, breach at 30 min, escalation at 45 min).
5. **Per-tenant tuning** of thresholds.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Author triage rule schema.** YAML at `hitl/triage/rules.yaml`. Each rule: id, condition expression, action (route / direct-answer), priority assignment, reason. Documented at `hitl/triage/SCHEMA.md`.
- [ ] **Implement rule evaluation engine.** `hitl/triage/evaluator.ts`. Pure function: inputs → decision. Performance: p95 < 50μs.
- [ ] **Author seed rules.**
  - `confidence-low`: confidence_tier < 65% → route, priority normal.
  - `sensitivity-restricted`: sensitivity ≥ Restricted AND user.role < admin → route, priority high.
  - `novelty`: question_similarity_to_known < 0.85 → route, priority normal.
  - `metric-flagged`: metric.flag = "review" → route, priority high.
  - `regulated-data`: any sensitivity = Regulated → route, priority SLA-critical (15-min SLA).
  - `default`: no rule matched → direct-answer.
- [ ] **Implement queue priority.** Postgres table `hitl_queue` with priority column; queue ordered by (priority desc, created_at asc).
- [ ] **Implement reviewer routing.** Round-robin within reviewer pool for the tenant + BU; SLA-critical cases routed to next available reviewer immediately.
- [ ] **Implement reviewer pool config.** Per-tenant config: reviewer-handle list, BU coverage, on-call schedule.
- [ ] **Implement auto-escalation.** SLA timer per case; warning at 20 min (notification to reviewer); breach at 30 min (notification + reassignment to backup); escalation at 45 min (notification to admin).
- [ ] **Implement per-tenant tuning.** Per-tenant override of thresholds and SLAs in tenant config; runtime-loaded, no redeploy.
- [ ] **Implement audit logging.** Every routing decision logged to P02-T09: case ID, inputs, decision, priority, assignee, timestamp.
- [ ] **Implement observability.** Per-week metrics: cases routed; cases handled in SLA; SLA breaches; per-rule firing distribution; per-reviewer load.
- [ ] **Test exhaustively.** > 100 tests covering each rule × each path; tenant tuning; SLA timer; round-robin fairness.

### Acceptance criteria

- Rule evaluation engine implemented; deterministic; documented.
- Queue with priority + routing + assignment operational.
- Auto-escalation working; tested with simulated SLA timer.
- Per-tenant tuning operational.
- Audit logging on every decision.
- Observability metrics flowing.
- Test suite > 100 tests, > 95% coverage.

## Alternatives Considered

- **Route every regulated-tier question to HITL (no other rules).** Rejected: too coarse; misses confidence-based and novelty cases.
- **No queue priority; FIFO.** Rejected: SLA-critical cases need to jump.
- **Manual reviewer assignment (no round-robin).** Rejected: doesn't scale.
- **Skip auto-escalation.** Rejected: SLA breach detection is the structural enforcement of "30 minutes".
- **Skip per-tenant tuning.** Rejected: different tenants have different risk appetites; one-size-fits-all is wrong.

## Success Metrics

- **Primary**: Triage engine operational within 14 days; 95% of routing decisions match expected rule outcomes in tests.
- **Guardrail**: 95% of HITL cases handled within SLA in the first 30 days. Measured by: SLA-tracking observability.

## Scope

### In scope
- Rule engine + seed rules.
- Queue priority + reviewer routing.
- Auto-escalation.
- Per-tenant tuning.
- Audit logging.
- Observability.

### Out of scope
- Reviewer console UI (P06-T02).
- Audit + calibration reporting (P06-T03).
- Reviewer-feedback loop (P06-T04).
- Notifications (P06-T05).

## Dependencies

- **Upstream**: P02-T05 (confidence), P02-T07 (sensitivity), P01-T07 (RBAC), P02-T09 (audit log), P02-T03 (policy layer triggers); P05-T05 (admin UI for rule browsing).
- **Downstream**: P06-T02 (reviewer console consumes the queue); P06-T03 (calibration reports use audit log).
- **People**: engine tech lead authoring; eng-sec reviewing rule logic; compliance lead reviewing seed rules; founder ratifying SLA targets.
- **Memory references**: `cyberos_ai_compliance`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: SLA target — 30 minutes per Form Answers commitment; SLA-critical at 15 min; should there be a shorter for super-critical? Recommendation: 15 min is the floor.
- Q2: Round-robin — across all BUs or BU-scoped? Recommendation: BU-scoped (a Bank reviewer doesn't review SVFC cases).
- Q3: Novelty threshold — semantic similarity 0.85? Recommendation: yes; tune with experience.
- Q4: Per-tenant tuning bounds — can tenants disable triage entirely? Recommendation: no; minimum thresholds enforced.

## Implementation Notes

- Rule engine evaluation runs in the policy layer's `mid-hitl-trigger` rule (P02-T03); this task implements the underlying evaluator.
- Queue ordering uses Postgres `ORDER BY priority DESC, created_at ASC`; index on (priority, created_at).
- Round-robin tracking via a per-BU pointer in Redis; rotates on each assignment.
- SLA timer is a scheduled job (every minute) checking case ages; sends notifications.
- Auto-escalation reassignment respects reviewer availability (off-call reviewers skipped).

## Test Plan

- Test 1: Rule isolation — each seed rule fires correctly under expected inputs.
- Test 2: Queue priority — SLA-critical case jumps; verify ordering.
- Test 3: Round-robin — 100 cases assigned; verify fair distribution.
- Test 4: Auto-escalation — simulate SLA breach; verify escalation fires.
- Test 5: Per-tenant tuning — change a threshold for a test tenant; verify rule fires differently.
- Test 6: Audit log — verify every routing decision lands.
- Test 7: Performance — rule eval p95 < 50μs.

## Rollback Plan

- A bad rule rolled back via runtime config disable.
- A bad SLA-timer config rolled back via Helm rollback.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Triage rules | `hitl/triage/rules.yaml` | Compliance lead | Continuous |
| Triage engine | `hitl/triage/evaluator.ts` | Engine tech lead | Continuous |
| Routing decisions | P02-T09 audit log | Eng-sec | 7 years |
| Per-tenant config | Tenant config-store | Engine tech lead | Continuous |
| SLA-tracking metrics | Central observability store | Engine tech lead | Continuous |

## Operational Risks

- **Reviewer pool is on PTO; auto-escalation cycles uselessly.** Mitigation: on-call schedule respected; escalation reaches admin who can act.
- **Per-tenant tuning produces unsafe thresholds.** Mitigation: thresholds bounded; admin override required for extreme values.
- **Audit-log write overload during a routing storm.** Mitigation: async write; bounded buffer.
- **Seed rule has incorrect logic (over- or under-routing).** Mitigation: shadow mode for new rules; eng-llm review.

## Definition of Done

- Engine + rules + queue + routing + auto-escalation + tuning + audit + observability all in place.
- Tests passing.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Triage engine consumes engine outputs (confidence, sensitivity), user identity, and rule definitions. No customer data processed beyond what's already in the engine flow.

### Human Oversight
Compliance lead authors and reviews seed rules. Reviewers are the human-in-the-loop the engine routes to. SLA-tracking ensures human-loop is timely.

### Failure Modes
- Wrong routing decision (something routed that shouldn't be): false positive; case sits in queue; reviewer dispatches with no harm.
- Missed routing (something not routed that should have been): more severe; mitigated by post-execution faithfulness check (P02-T03 post-rules).
- Reviewer unavailable: auto-escalation reassigns; eventually reaches admin.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: engine tech lead authors implementation; eng-sec reviews; compliance lead reviews seed rules; `@stephen-cheng` ratifies SLA targets.
