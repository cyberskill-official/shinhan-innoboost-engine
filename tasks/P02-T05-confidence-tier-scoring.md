---
title: "Implement confidence-tier scoring (Low/Medium/High thresholds)"
author: "@cyberskill-engine-tech-lead"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: user_facing
eu_ai_act_risk_class: limited
target_release: "2026-06-26"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Implement the confidence-tier scoring system that assigns every chat answer a tier — Low (<60%), Medium (60–85%), or High (>85%) — visible to the user and consumed by the policy layer (P02-T03) and the HITL queue (P06-T01). The score is derived deterministically from a weighted combination of: schema-match confidence (how well retrieval matched the question to a registered metric); SQL-validator pass strength (clean pass vs. pass-with-warnings); eval-harness similarity to known-good answers (for known question patterns); freshness staleness penalty (older data, lower confidence); ambiguity score (was the question ambiguous; did the LLM ask a clarifying sub-question internally). Tier thresholds match the CyberSkill AI Doctrine v1.0.0 (locked 2026-04-25). Below 60% blocks output and triggers HITL routing or refusal. Confidence is the user-facing structural signal of "should I trust this answer?".

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"every answer carries a confidence tier and a citation" — CyberSkill SF9 form answer
"confidence tiers (Low <60% / Medium 60–85% / High >85%)" — CyberSkill AI Doctrine v1.0.0 excerpt (referenced in all three Form Answers)
</untrusted_content>

## Problem

The Form Answers commit explicitly to confidence tiers as a user-visible signal, with thresholds matching the AI Doctrine. The Innoboost Q&A's Section V.4 prioritises feasibility for a financial institution; a chat-with-data system with no confidence signal answers questions identically whether it is sure or guessing — exactly the failure mode banking reviewers will flag.

Specific gaps if we shortcut:

- **Without confidence tiers, every answer reads as equally trustworthy.** The user has no signal to differentiate "I am sure" from "I am guessing".
- **Without a deterministic scoring algorithm, tiers fluctuate between runs.** Same question + same data → different tier on rerun. Credibility-destroying.
- **Without HITL routing tied to confidence, low-confidence answers reach users without review.** P02-T03 policy layer's HITL trigger consumes confidence; confidence < 65% routes to HITL.
- **Without a freshness component, stale data answers as confidently as fresh.** Stale data is a known unknown; the system should signal it.
- **Without an ambiguity component, ambiguous questions get answered confidently.** The LLM should signal "I think you meant X but Y is also plausible" via lower confidence; user can refine.
- **Without thresholds matching the AI Doctrine, our internal claims (Low <60% / Medium 60–85% / High >85%) are inconsistent.** The Doctrine is the reference; the implementation matches.

The `cyberos_ai_compliance` memory note's 7 primitives include "confidence-tier scoring" as a foundational primitive. This task is its implementation, faithful to the Doctrine.

The `feedback_p1_scope_preference` memory note biases us richer. For confidence tiers, "richer" means: multi-component score (schema-match + validator-strength + eval-similarity + freshness + ambiguity); deterministic algorithm; user-facing pill + drawer-detail view; HITL integration; per-tenant override of thresholds; observability of how the score is composed (so engineers can debug "why was this rated Low?"). Each component is explainable; together they form a transparent confidence model.

## Proposed Solution

A confidence-scoring module in `engine/confidence/` that:

1. **Receives inputs** from the NL→SQL pipeline (P02-T02): retrieval scores, validator result, executor result, source-data freshness, and an ambiguity signal from the intent classifier.
2. **Computes a deterministic score** using a documented weighted formula. Score is in [0.0, 1.0]; mapped to a tier via the Doctrine thresholds.
3. **Surfaces the score and the tier** as part of the response payload, plus a "score breakdown" that the trust drawer can show (per-component contribution).
4. **Triggers downstream behaviour**: < 60% blocks user-facing output and routes to HITL or refusal; 60–85% surfaces with a "Medium confidence" badge; > 85% surfaces with a "High confidence" badge.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Author the scoring formula.** Document at `engine/confidence/FORMULA.md`. Weights:
  - Schema-match confidence: 0.30 (top-1 retrieval similarity score 0.0–1.0).
  - SQL-validator pass strength: 0.20 (clean pass = 1.0; pass-with-warnings = 0.7; per warning category documented).
  - Eval-harness similarity: 0.20 (similarity to known-good answers in the gold-set; 0.0 if no known-good neighbour).
  - Freshness penalty: 0.15 (full credit if data is < 1 hour old; linear decay to 0 at 24+ hours staleness; freshness > 7 days → score = 0).
  - Ambiguity penalty: 0.15 (full credit if intent classifier confidence > 0.85; linear decay to 0 at 0.5 or below).
  - Total: weighted sum; clamped to [0.0, 1.0].
- [ ] **Author the threshold mapping.** Per AI Doctrine: < 0.60 → Low; 0.60 ≤ score < 0.85 → Medium; ≥ 0.85 → High.
- [ ] **Implement scoring engine.** `engine/confidence/scorer.ts`. Pure function: takes inputs, returns `{ score, tier, breakdown: { schema_match, validator, eval_similarity, freshness, ambiguity } }`.
- [ ] **Wire the scoring engine into the NL→SQL pipeline (P02-T02).** Called after the executor, before the result post-processor. The score is included in the pipeline output.
- [ ] **Wire the score into the policy layer (P02-T03).** The `mid-hitl-trigger` rule consumes the score; < 0.65 routes to HITL.
- [ ] **Implement the score-breakdown surface.** In the trust drawer (P02-T04 / P05-T01), the breakdown is rendered as: each of the 5 components, its weight, its value, its contribution. Helps users (and reviewers) understand *why* the tier was assigned.
- [ ] **Implement runtime configuration of thresholds.** Per-tenant override of thresholds (some tenants want stricter; e.g., regulated workflows might require ≥ 0.95 for High). Default values match the AI Doctrine.
- [ ] **Implement deterministic-score test suite.** Same inputs always produce the same score; verified across runs.
- [ ] **Implement freshness data wiring.** Freshness comes from the warehouse: query the source tables' last-update-timestamp (Postgres `updated_at` columns or BigQuery's `_TABLE_SUFFIX` / partition timestamps). Cache freshness per source-table for 5 minutes to avoid hammering the warehouse.
- [ ] **Implement ambiguity signal wiring.** The intent classifier (P02-T02) emits an ambiguity score; if not provided, default to 0.7.
- [ ] **Implement eval-harness similarity wiring.** When a question is asked, compare it semantically (cosine similarity over embeddings) to questions in the gold-set; the closest neighbour's eval-harness "passed/failed" status weights the eval-similarity component. New, unseen questions have no eval similarity → component contributes 0; this is correct (we're less sure about questions we've never seen).
- [ ] **Implement observability.** Per-question, log the score breakdown to the audit log (P02-T09). Aggregate metrics: tier distribution per BU, per role, per metric. Flag distributions that deviate from expected (e.g., suddenly all answers are Low confidence — investigate).
- [ ] **Implement admin UI surface.** In P05-T05 admin console: tier distribution dashboard; "questions with the lowest confidence" surface (for HITL backlog prioritisation); "this metric had 5 Low-confidence answers this week — investigate".
- [ ] **Test exhaustively.** > 100 tests covering: deterministic scoring (same inputs → same score); each component individually; threshold boundaries; per-tenant override; observability metrics flow.

### Acceptance criteria

- Scoring engine implemented; deterministic; documented formula matches the AI Doctrine.
- Pipeline integration: score included in every response.
- Policy-layer integration: HITL trigger fires correctly per threshold.
- Trust-drawer integration: score breakdown visible.
- Per-tenant threshold override operational.
- Observability metrics flowing.
- Test suite > 100 tests, > 95% coverage of `engine/confidence/`.
- Admin UI surface (backend) operational.

## Alternatives Considered

- **Use a single number 0.0–1.0 without tier mapping.** Rejected: tiers are easier for users to interpret; a number is decoration without semantics.
- **Use the LLM's own self-reported confidence.** Rejected: LLM self-confidence is unreliable; deterministic external scoring is more credible.
- **Use just the retrieval similarity as confidence.** Rejected: too narrow; a high retrieval similarity but stale data should not be High confidence.
- **Use a learned confidence model (e.g., regression on eval-harness outcomes).** Rejected for v1: training data is sparse; explainability matters more than predictive power; deterministic formula is the right shape. Reconsider for v1.1 if signal is poor.
- **Skip the freshness component; trust the data.** Rejected: stale data is a real source of wrong answers; users need to see staleness.
- **Skip the ambiguity component; trust the LLM to ask clarifications.** Rejected: defence-in-depth — confidence captures ambiguity even when the LLM doesn't ask.
- **Make tier thresholds dynamic per-question (e.g., fancy ML).** Rejected: deterministic thresholds are auditable; fancy ML is opaque.

## Success Metrics

- **Primary**: Tier distribution on the gold-set: ≥ 80% High; ≤ 15% Medium; ≤ 5% Low — within 14 days of task assignment. Measured by: P04-T03 evaluation harness running over the gold-set.
- **Guardrail**: Zero non-deterministic-score events (same inputs → different score) in test runs. Measured by: deterministic-score test suite running on every PR; any flake is a P0 incident.

## Scope

### In scope
- Scoring engine + formula + threshold mapping.
- Pipeline + policy-layer + trust-drawer integration.
- Freshness, ambiguity, eval-similarity wirings.
- Per-tenant override mechanism.
- Observability + admin UI backend.
- Test suite.

### Out of scope
- Learned ML confidence model (deferred to v1.1+).
- Multi-language confidence-pill copy (handled in P05).
- HITL queue itself (P06).
- Audit-log infrastructure (P02-T09).
- Trust-drawer UI rendering (P05-T01).

## Dependencies

- **Upstream**: P02-T01, P02-T02, P02-T03, P02-T04, P02-T07, P02-T09; AI Doctrine v1.0.0.
- **People**: engine tech lead authoring; eng-llm reviewing scoring formula; design lead reviewing breakdown surface.
- **Memory references**: `cyberos_ai_compliance`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: Should the formula weights be fixed in code or configurable per environment? Recommendation: configurable per environment with documented default; sane defaults for staging; production-rehearsal can tune.
- Q2: For freshness, what's the correct fall-off curve? Linear is simple; logarithmic might better match "data goes stale quickly at first then slowly". Recommendation: linear for v1; revisit with eval-harness data.
- Q3: For "Low confidence" output, do we always block, or sometimes show with a strong warning? Recommendation: always block in v1 (route to HITL); v1.1 can support "show with warning" if a tenant prefers.
- Q4: For eval-similarity, how close does a gold-set neighbour need to be? Recommendation: cosine similarity > 0.85 to count.
- Q5: How do we handle questions that have no metric match at all? Recommendation: schema-match component = 0; total score is necessarily Low; route to HITL or refuse with "I don't know which metric to use".

## Implementation Notes

- The scoring engine is pure; no I/O during scoring (freshness is fetched separately and passed in). This makes scoring trivially testable.
- The freshness fetcher caches per-source-table for 5 minutes; cache miss triggers a warehouse query for the table's last-update-timestamp.
- For per-tenant override, store thresholds in tenant-config; load at request time; cache for 1 minute.
- For the admin UI surface, a tier-distribution dashboard with filter controls (per BU, per role, per metric, per time-range) helps debug "we're getting too many Low-confidence answers — what changed?".
- For determinism, every input source must be deterministic at the same point in time. Freshness uses the latest-update-timestamp at scoring time (which is deterministic for that scoring run).
- Document the scoring formula in `engine/confidence/FORMULA.md` with worked examples for each tier; this becomes Phase 11 reference material (compliance dossier).

## Test Plan

- Test 1: Deterministic — same inputs → same score; verified by 100 reruns.
- Test 2: Component isolation — vary one component while holding others constant; verify score changes proportionally to weight.
- Test 3: Threshold boundary — score = 0.599 → Low; 0.600 → Medium; 0.849 → Medium; 0.850 → High.
- Test 4: Pipeline integration — sample question; verify score appears in response payload; verify breakdown is correct.
- Test 5: Policy-layer integration — mock a Low-confidence question; verify HITL routing fires.
- Test 6: Per-tenant override — apply a stricter threshold to a test tenant; verify behaviour changes.
- Test 7: Observability — verify per-question breakdown lands in audit log.
- Test 8: Performance — scoring engine p95 < 1ms.

## Rollback Plan

- A bad formula change is rolled back via PR revert + redeploy.
- A bad threshold-override config is rolled back via runtime-config update (no redeploy).
- A regression in score determinism is treated as P0; rollback immediately and investigate.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Scoring engine | `engine/confidence/scorer.ts` | Engine tech lead | Continuous |
| Formula doc | `engine/confidence/FORMULA.md` | Engine tech lead | Continuous |
| Per-question breakdown logs | P02-T09 audit log | Eng-sec | 7 years |
| Tier-distribution metrics | Central observability store | Engine tech lead | Continuous |
| Test suite | `engine/confidence/__tests__/` | Engine tech lead | Continuous |

## Operational Risks

- **Tier distribution shifts unexpectedly (e.g., suddenly all Low).** Mitigation: nightly distribution analysis; alert on > 20% drift from baseline.
- **Override misuse — tenant lowers thresholds inappropriately.** Mitigation: per-tenant threshold change requires admin + audit-log entry; thresholds outside [0.5, 0.95] forbidden.
- **Freshness fetcher hits warehouse rate-limit.** Mitigation: 5-minute cache; circuit breaker on warehouse error → fall back to "freshness unknown" component value of 0.5.
- **Eval-similarity component dependent on gold-set quality.** Mitigation: gold-set is curated by domain SMEs (P04-T01); regular review.
- **Determinism breaks due to floating-point drift.** Mitigation: round scores to 4 decimal places; document in formula.

## Definition of Done

- Scoring engine + formula + thresholds in place.
- All integrations wired.
- Per-tenant override operational.
- Observability + admin UI backend operational.
- Tier distribution on gold-set within target range.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
The scoring engine consumes signals from the engine's pipeline (retrieval, validator, executor, freshness, ambiguity); no customer data is processed beyond what's already flowing through the engine. The eval-similarity component compares questions semantically against a curated gold-set authored by CyberSkill domain SMEs; not customer data.

### Human Oversight
The formula is human-authored, version-controlled, and reviewable. Tier distributions are monitored; abnormal shifts trigger investigation. Per-tenant threshold overrides require admin approval. Low-confidence answers are routed to HITL where humans review.

### Failure Modes
- Formula bug producing wrong scores: detected by determinism tests + tier-distribution monitoring.
- Freshness fetcher failure: degrades to a default freshness value; surfaces as a warning in the score breakdown.
- Score saturation (all answers cluster at one tier): tier distribution monitoring flags; investigation finds the underlying bug.
- Per-tenant override misuse: audit-log review + admin alert.

## Sales/CS Summary

CyberSkill's confidence-tier scoring tells every user, on every answer, how sure the system is — High, Medium, or Low — with a clear breakdown of what drove the rating. Low-confidence answers don't reach users; they go to a human reviewer first. The scoring is deterministic, auditable, and explainable: click the rating and see exactly how it was computed. Banking-sector users should see this as "the AI knows what it doesn't know"; reviewers should see this as the structural enforcement of safe AI deployment.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: engine tech lead authors implementation; eng-llm reviews formula; design lead reviews breakdown surface; `@stephen-cheng` ratifies threshold values against the AI Doctrine.
