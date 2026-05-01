---
title: "Implement deterministic policy layer for governance gates"
author: "@cyberskill-engine-tech-lead"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: limited
target_release: "2026-06-19"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Implement the deterministic policy layer that gates every NL→SQL pipeline run before any LLM output reaches the user — a rule-based filter that runs *before* the LLM proposes SQL and *after* it produces a result. Gates: sensitivity-tier check; PII masking; query-cost ceiling; rate limiting per user / per tenant; tenant-isolation pre-validation; HITL routing trigger for low-confidence or sensitive cases; audit-log entry for every decision. The policy layer is the deterministic answer to Shinhan's reasonable concern that "GenAI is probabilistic but banking needs deterministic auditable decisions" (Innoboost Q&A Section VI.6). The LLM is allowed to be probabilistic; the policy layer is not.

## Customer Quotes

<untrusted_content source="innoboost_qa_excerpt">
"For underwriting/risk-scoring: GenAI is probabilistic but banking needs deterministic auditable decisions — does Shinhan have a framework for deterministic policy layers, or will we architect that?"
"This is not explicitly pre-defined by Shinhan. The exact evaluation scope, including the design of control layers, will be defined jointly by the startup and Shinhan at the POC kickoff." — Innoboost Briefing Webinar Q&A, Section VI.6
</untrusted_content>

## Problem

The Innoboost Q&A's Section VI.6 names the deterministic-vs-probabilistic objection explicitly. The Form Answers across all three submissions imply or commit to deterministic governance ("Power BI stays in place; we supplement it with a conversational layer above the same warehouse"; "HITL reviewer queue with approval flow and per-decision audit log"). The policy layer is the structural answer.

Specific gaps if we shortcut:

- **Without a deterministic gate before the LLM, the LLM is the gate.** That's exactly the failure mode Shinhan is worried about. The policy layer must be *before* the LLM; the LLM may be allowed to add uncertainty, but it cannot subtract certainty.
- **Without a deterministic gate after the LLM, hallucination reaches the user.** The validator (P02-T02) checks SQL syntax + structure; the policy layer checks the *result* — does the answer cite real data? Is the data within scope? Is the confidence high enough to surface, or does it route to HITL?
- **Without rate limiting, a malicious or misconfigured client can exhaust resources.**
- **Without per-tenant query-cost ceilings, runaway queries from one tenant affect another.**
- **Without HITL routing logic, low-confidence answers reach users without human review.**
- **Without audit-log entries for every gate decision, post-incident forensics are impossible.**
- **Without deterministic + auditable behaviour, ISO 42001 (AI management system) and EU AI Act Article 14 (human oversight) cannot be evidenced.**

The `cyberos_ai_compliance` memory note's 7 primitives include "deterministic policy layer" as one of the technical primitives that satisfies multi-jurisdictional AI rules. This task is the implementation of that primitive.

The `feedback_p1_scope_preference` memory note biases us richer. For the policy layer, "richer" means: pre-LLM gates + post-LLM gates + HITL routing + rate limiting + cost ceilings + audit + observability + admin override hooks — every gate auditable, every decision deterministic, every override logged. Each layer is straightforward; together they form the deterministic spine of the chat-with-data engine.

## Proposed Solution

A policy layer in `engine/policy/` that runs at three points in the NL→SQL pipeline:

1. **Pre-LLM (entry-gate):** Before the generator is called, the policy layer checks: (a) authentication (JWT valid, MFA present); (b) authorisation (RBAC says this user can ask questions of this tenant); (c) rate limiting (this user has not exceeded N questions per minute); (d) sensitivity tier filter (user's role permits questions at this tier); (e) tenant boundary (user's tenant matches the question's tenant scope). If any gate fails, the request is refused with a documented reason and audit-log entry. The LLM is never called.

2. **Mid-LLM (post-validator gate):** After the validator (P02-T02) approves the proposed SQL, the policy layer re-checks: (a) cost-estimate ceiling (this query won't exceed cost budget); (b) sensitivity tier of every column referenced (no column above user's allowed tier); (c) HITL trigger evaluation (does this question require HITL routing per current rules?); (d) any tenant-specific override (e.g., this tenant has paused querying for compliance review). If any gate fails, refuse or route. Audit-log either way.

3. **Post-execution (output-gate):** After the executor returns rows, the policy layer checks: (a) result-row sensitivity (rows containing regulated data need extra masking or refusal); (b) confidence-tier (P02-T05) is at or above the user's required threshold (some workflows require High confidence only); (c) faithfulness check (sample numeric claims; verify they match cited rows); (d) PII masking is applied where rules require. If any gate fails, the response is altered or refused. Audit-log every decision.

A rule-engine is used so that gates are declarative (in YAML), versioned, and admin-modifiable without redeploy. Audit logs are written to the audit log (P02-T09). Setup target: 21 days from task assignment.

### Subtasks

- [ ] **Author the gate-rule schema.** YAML schema at `engine/policy/RULES_SCHEMA.md` documenting: rule ID, rule type (pre / mid / post), precondition (when this rule applies), action (allow / deny / route-to-hitl / mask / cost-confirm), audit-log fields, owner, version.
- [ ] **Implement the rule engine.** `engine/policy/engine.ts`. Loads rules from `engine/policy/rules/*.yaml`; evaluates rules in order; first match wins for action; subsequent rules can attach metadata. Pure: no I/O during evaluation (except audit-log write at the end). Performance: p95 < 100μs.
- [ ] **Author seed rules.** Pre-LLM rules:
  - `pre-auth`: deny if JWT invalid or expired.
  - `pre-rbac`: deny if RBAC denies the question intent.
  - `pre-rate-limit`: deny if user > 10 questions in last 60 seconds; warn at 7+.
  - `pre-tenant`: deny if question's tenant scope mismatches user's tenant.
  - `pre-sensitivity`: deny if user's role cannot read sensitivity tier of the metric.
  - Mid-LLM rules:
  - `mid-cost-ceiling`: deny if estimated cost > 1M rows; route to "expensive — confirm?" if > 100K.
  - `mid-sensitivity-column`: deny if any referenced column above user tier.
  - `mid-hitl-trigger`: route to HITL if (sensitivity ≥ Restricted AND user role < Admin) OR (confidence-tier < 65%) OR (this metric flagged for review).
  - `mid-tenant-pause`: deny if tenant is in paused state.
  - Post-execution rules:
  - `post-result-mask`: mask PII columns based on user's RBAC scope.
  - `post-confidence-threshold`: refuse with explanation if confidence < user-required threshold.
  - `post-faithfulness-check`: spot-check 3 random numeric claims against cited rows; fail if any mismatch.
  - `post-regulated-row`: refuse if any returned row tagged regulated (rare; defensive).
- [ ] **Implement rule actions.** Each action is a TypeScript function returning a structured result; actions are pure; action effects (audit-log, refusal, route) happen in the calling code.
- [ ] **Implement HITL routing trigger integration.** When `mid-hitl-trigger` fires, the request is routed to HITL queue (P06-T01); the policy layer doesn't synthesise the routing — it sets the appropriate flags and the request lifecycle continues into HITL.
- [ ] **Implement audit-log integration.** Every policy decision (allow / deny / route / mask) appends an entry to the audit log (P02-T09) with: timestamp, requester, gate ID, action, reason, context (which rule fired). Append-only; retained 7 years.
- [ ] **Implement admin override hooks.** A `super-admin` can override a specific rule for a specific user-tenant-action combination temporarily, with mandatory justification. Override is itself audited and triggers an alert.
- [ ] **Implement rule versioning.** Each rule has a version; rule changes produce a new version; old versions remain queryable; consumers (test runs, debug surface) can pin to a version.
- [ ] **Implement admin UI surface.** In P05-T05 admin console: rule browser; per-rule activity stats (how often does each rule fire?); override request flow.
- [ ] **Implement runtime configuration.** Some rules are dynamic (e.g., the rate-limit threshold may change per environment, per tenant). Dynamic rules read from a config-store that's hot-reloadable; static rules are baked into deploys.
- [ ] **Implement structured refusal messages.** When the policy layer denies a request, the user-facing message is: "Your question was not answered because: {reason}. {actionable next step}." For example: "Your question requires reviewer approval (sensitivity above your tier). It has been routed to a reviewer; you'll receive a response within {SLA}." Or: "This query is estimated to scan 1.2M rows. Click confirm to proceed."
- [ ] **Implement observability hooks.** Each gate decision emits a span; gate metrics aggregated (allow rate, deny rate, route rate, mask rate); per-rule metrics (how often does each rule fire, with what action distribution).
- [ ] **Test exhaustively.** > 200 tests covering each rule × each path; cross-tenant attempts; rate-limit boundary cases; admin override; audit-log integrity.

### Acceptance criteria

- Rule engine implemented; seed rules in place.
- All three gate points (pre / mid / post) integrated into the NL→SQL pipeline.
- HITL routing trigger operational; routes correctly into the HITL queue.
- Audit-log entries for every decision; verified by sample run.
- Admin override flow operational with mandatory justification + alert.
- Rule versioning operational.
- Structured refusal messages tested for clarity.
- Observability metrics flowing.
- Test suite > 200 tests, > 95% coverage of `engine/policy/`.

## Alternatives Considered

- **Use OPA (Open Policy Agent) for the rule engine.** Rejected for the demo: OPA is excellent but adds a service deployment and a DSL (Rego) for the team to learn; in-process TypeScript rule evaluation is faster and easier to test. Reconsider for production track if rule complexity grows.
- **Hard-code policy rules in TypeScript.** Rejected: declarative YAML with a rule engine lets non-engineers (compliance officers, domain SMEs) read and propose changes. The schema is the contract.
- **Skip post-execution gates; trust the pre-LLM gates.** Rejected: post-execution catches issues that pre-LLM cannot foresee — a metric that turns out to return regulated data due to a row-level edge case, a confidence dropping post-execution.
- **Skip HITL routing here; handle it in the chat surface.** Rejected: HITL is a policy decision, not a UI decision. Centralising in the policy layer makes audit cleaner.
- **Skip rate limiting at the policy layer; rely on ingress-level rate limit.** Rejected: ingress-level is per-IP, not per-user. We need per-user-per-tenant rate limit for fairness across users in the same tenant.
- **Skip cost-estimate ceiling; let the warehouse cap it.** Rejected: warehouse cap is reactive (warehouse runs the query then caps); we want proactive (don't run it). Both is best — pre-LLM ceiling catches first; warehouse cap is the safety net.

## Success Metrics

- **Primary**: All seed rules implemented and verified within 21 days of task assignment. Measured by: test suite passing.
- **Guardrail**: Zero false-positive denials of legitimate questions in the first 30 days; false-positive rate < 1%. Measured by: HITL queue review of refused requests.

## Scope

### In scope
- Rule engine + seed rules.
- Three gate points integrated into NL→SQL pipeline.
- HITL routing trigger integration.
- Audit-log integration.
- Admin override flow with audit + alert.
- Rule versioning.
- Admin UI surface (backend).
- Runtime configuration for dynamic rules.
- Structured refusal messages.
- Observability hooks.
- Test suite.

### Out of scope
- HITL queue itself (P06-T01).
- Audit-log infrastructure (P02-T09).
- Admin UI frontend (P05-T05).
- Confidence-tier scoring algorithm (P02-T05; this task consumes the score).
- PII masking algorithm (P02-T07; this task triggers it).
- Faithfulness check algorithm (P04-T03; this task triggers it).
- Custom-rule authoring tool for non-engineers (deferred to v1.1 if needed).

## Dependencies

- **Upstream**: P01-T07 (RBAC); P02-T01 (metric layer); P02-T02 (NL→SQL pipeline integration points); P02-T05 (confidence tiers); P02-T07 (PDPL classifier); P02-T09 (audit log); P02-T06 (prompt-injection defence — provides the trigger for adversarial detection).
- **Downstream**: P06 (HITL queue), P05-T05 (admin UI).
- **People**: engine tech lead authoring; eng-sec reviewing rule engine and audit; compliance lead reviewing seed rules; founder ratifying admin-override flow.
- **Memory references**: `cyberos_ai_compliance`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: Rate-limit threshold — 10/min per user is a defensible default; should we have a higher tier for `analyst` role? Recommendation: yes, role-based; viewer 10/min, analyst 30/min, admin 60/min.
- Q2: Cost-estimate ceiling — 1M rows scanned as the hard ceiling, 100K as the confirm threshold. Adjust per warehouse adapter? Recommendation: yes, per adapter (Postgres handles 1M cheaper than BigQuery).
- Q3: For post-faithfulness check, the spot-check is 3 random claims. Is that enough? Recommendation: 3 is the floor; for high-stakes questions (regulated tier), check all numeric claims.
- Q4: For admin override, two-eye approval (super-admin + founder)? Recommendation: yes, for any override that bypasses sensitivity-tier checks; no for cost-ceiling overrides (lower-stakes).
- Q5: For runtime configuration, what's the propagation latency? Recommendation: < 30 seconds via Doppler webhook → engine reload.

## Implementation Notes

- The rule engine evaluates rules in declared order. First-match-wins for the *action*; later rules can attach metadata (e.g., "log-as-suspicious" on top of an allow).
- Rules are pure functions of their inputs; this means rules are unit-testable in isolation. Each seed rule has dedicated unit tests covering edge cases.
- For HITL trigger, the policy layer attaches an `hitl_required: true` flag to the request; the NL→SQL pipeline checks this before executing; if set, the request is suspended and routed to HITL (P06).
- For admin override, the override token is JWT-signed (short TTL, single-use); the override targets a specific user × tenant × action combination. The override does not generally weaken the system.
- For structured refusal messages, the user-facing copy is reviewed by design lead (per `feedback_enterprise_voice`); copy is also localised (English + Vietnamese).
- For observability, the gate metric `gate.{rule_id}.action_count` allows per-rule histograms over time. Useful for tuning thresholds.
- For false-positive monitoring, every refusal generates a `refusal_id` that the user can include in a follow-up "I disagree" message; admin reviews these in batches.

## Test Plan

- Test 1: Each rule in isolation — for each of ~12 seed rules, exercise the precondition true case and the precondition false case; verify the action.
- Test 2: Pipeline integration — run a sample question through the full pipeline; verify the policy layer fires at all three gate points; verify audit-log entries appear.
- Test 3: HITL routing — set a question's sensitivity to `restricted`; verify the policy layer routes to HITL; verify the HITL queue receives.
- Test 4: Cost-ceiling — submit a question whose estimated cost exceeds threshold; verify "confirm?" prompt; user confirms; verify audit-log shows confirmation; verify the query proceeds.
- Test 5: Rate-limit boundary — submit 10 questions in 60s; 11th gets denied; wait 60s; 12th succeeds.
- Test 6: Admin override — admin issues an override for a specific case; verify it works for that case only; verify subsequent overrides require new justification.
- Test 7: Audit-log integrity — perform 100 mixed allow/deny/route decisions; verify all 100 land in audit log with correct context.
- Test 8: Performance — p95 gate evaluation < 100μs under load.
- Test 9: Rule versioning — publish v1 of a rule; query; publish v2; verify v1 still queryable; new requests use v2.

## Rollback Plan

- A bad rule is rolled back via PR revert; immediate redeploy.
- A bad seed rule that causes mass-refusal is rolled back via runtime configuration (the rule's "active" flag is toggled off without redeploy).
- A bad rate-limit threshold is adjusted via runtime configuration.
- An admin override that turns out to be inappropriate is rolled back via the audit log + manual revocation; audit-log retains the original entry.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Rule schema | `engine/policy/RULES_SCHEMA.md` | Engine tech lead | Continuous |
| Seed rules | `engine/policy/rules/*.yaml` | Compliance lead | Continuous |
| Rule engine implementation | `engine/policy/engine.ts` | Engine tech lead | Continuous |
| Decision audit log | Stored in P02-T09 audit log | Eng-sec | 7 years |
| Admin override log | Subset of audit log | Founder | 7 years |
| Test suite | `engine/policy/__tests__/` | Engine tech lead | Continuous |
| Rule activity stats | Central observability store | Compliance lead | Continuous |
| Refusal-disagreement queue | Central observability store | Engine tech lead | 1 year |

## Operational Risks

- **Over-aggressive seed rules cause mass false-refusals.** Mitigation: shadow-mode for new rules (log-only, no enforcement) for the first week; tune; promote.
- **Audit-log write back-pressure.** Mitigation: async write; backpressure logged separately; never blocks the user-facing response.
- **Admin override misuse.** Mitigation: 2-eye approval for sensitive override classes; nightly review; alert on any override.
- **Rule engine throws exception in prod.** Mitigation: exception handler defaults to *deny* (fail-safe); failure is logged separately.
- **Rate-limit produces a poor demo experience.** Mitigation: thresholds tuned for demo (higher than production); demo accounts have a `demo` flag that bypasses certain limits.

## Definition of Done

- Rule engine + seed rules + integration + override + versioning + admin UI backend + observability + test suite all in place.
- Audit log integration verified.
- Performance budget met.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
The policy layer does not consume training data; it evaluates declarative rules over runtime inputs (RBAC scope, sensitivity tier, confidence tier, cost estimate). No customer data is processed by the rule engine; user identity, request metadata, and structural facts about the proposed query are the inputs.

### Human Oversight
Compliance lead authors and reviews seed rules. Admin overrides require justification and are audited. Refusal-disagreement queue lets users contest refusals; admin reviews in batches.

### Failure Modes
- Over-permissive default would be the worst case; we mitigate by *deny-by-default* in the rule engine: if no rule matches, the action is allow but only for entirely-public scenarios; in any sensitive context, an explicit allow rule must fire.
- Under-permissive (false-refusal) is mitigated by shadow-mode for new rules and the disagreement queue.
- Rule engine exception defaults to *deny* (fail-safe).
- Audit log write failure does not block the response but triggers an alert; the response decision is preserved in the application log even if the audit-log write failed.

## Sales/CS Summary

The policy layer is CyberSkill's deterministic governance gate — it sits between every user question and the AI engine, and again between the AI engine and the response. It enforces the rules that matter most to a banking customer: sensitivity-tier access control, query cost limits, rate limiting, and the routing of high-stakes questions to a human reviewer before the user sees an answer. It is fully auditable, version-controlled, and operates without exception. When a Shinhan reviewer asks "what stops your AI from doing something it shouldn't?", the policy layer is the answer — not the AI itself.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections of this FR.
- **Human review**: engine tech lead authors implementation; compliance lead authors and reviews seed rules; eng-sec reviews rule engine and audit; `@stephen-cheng` ratifies admin-override flow.
