---
title: "Author gold-set Q&A (90 questions across 3 BUs)"
author: "@cyberskill-eng-data"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: minimal
target_release: "2026-06-19"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Author the gold-set Q&A — 90+ questions (30+ per BU: SVFC, Bank, Securities) — that the eval harness uses as ground truth to score the NL→SQL pipeline. Each entry contains: question text; expected SQL; expected answer shape; expected numeric range (with tolerance); expected citations; expected confidence tier; sensitivity classification; intent class. Authored by domain-knowledgeable contributors (eng-data + a senior contributor from the Shinhan-domain experience), not by the engine engineers (to avoid the test-against-yourself anti-pattern). The gold-set is the spine of every quality claim the demo makes; the eval harness (P04-T03) consumes it on every PR; regressions block merge.

## Problem

Form Answers commit to ≥ 95% accuracy on a gold-set evaluation harness. Without a gold-set, "accuracy" is rhetorical. Without good *coverage* in the gold-set, the engine optimises for the questions that happen to be in the test, not for the questions Shinhan reviewers will ask. Without domain-authored questions, the gold-set reflects engineering bias.

Specific gaps if we shortcut:

- **Without ≥30 questions per BU, eval coverage is too narrow to detect regressions.**
- **Without expected-numeric-ranges + tolerances, the eval is a string match — fragile and useless for validating numerical correctness.**
- **Without expected-citation references, faithfulness validation cannot be evaluated.**
- **Without intent-class tagging, performance per intent (lookup vs. aggregation vs. trend vs. comparison vs. freeform) cannot be measured.**
- **Without sensitivity-tier tagging, RBAC + HITL routing cannot be verified through the harness.**
- **Without a 10% out-of-scope/refusal-expected component, the engine appears to "answer everything" — wrong.**
- **Without domain-authored questions, the gold-set reflects "what we think Shinhan will ask" not "what they actually ask".**

The Innoboost Q&A's Section V.4 prioritises feasibility for a financial institution; eval-harness-driven development is the structural enforcement of "we know what works". The Form Answers' "≥ 95% on gold-set" claim depends on a credible gold-set; without it, the claim is defensible only as marketing.

The `feedback_p1_scope_preference` memory note biases us richer. For the gold-set, "richer" means: 30+ per BU; mix of intent classes (40% lookup, 30% aggregation, 20% trend/compare, 10% out-of-scope); domain authorship; multi-format expected answers; explicit tolerance for numeric values; tagged sensitivity for HITL routing tests; English + Vietnamese coverage to test bilingual fluency.

## Proposed Solution

A versioned gold-set in `eval/gold-set/` with one YAML per question, organised by BU:

1. **Per-question YAML.** Documented schema. Required fields: `id`, `question` (English; Vietnamese variant if applicable), `bu`, `intent_class`, `sensitivity_tier`, `expected_metric`, `expected_sql`, `expected_answer_shape` (table / chart / number / refusal), `expected_numeric_range` (with tolerance for numerical answers), `expected_citations` (count + source columns referenced), `expected_confidence_tier`.
2. **Authorship.** Domain-knowledgeable contributors (eng-data + a senior contributor with Shinhan-vertical experience) author the questions. Engine engineers can suggest but don't write the gold-set.
3. **Reviewer cycle.** Each question reviewed by metric owner (P02-T01) for SQL correctness; by founder for content credibility.
4. **Coverage rubric.** Per BU: 40% lookup, 30% aggregation, 20% trend / comparison, 10% out-of-scope.
5. **Versioning.** Gold-set has a version; changes produce a new version; eval results comparable across versions.

Setup target: 21 days from task assignment.

### Subtasks

- [ ] **Author the YAML schema.** `eval/gold-set/SCHEMA.md`. Required and optional fields with documented examples. Tooling: a Python or TypeScript validator that lints every YAML on PR.
- [ ] **Identify domain authors.** Eng-data lead + a senior contributor with Shinhan-vertical experience (could be a hired-for-this-purpose specialist or someone from CyberSkill's existing engagements). Document who authored each question for accountability.
- [ ] **Author 30+ SVFC questions.** Coverage:
  - Lookup (12): "What is the total disbursement in March 2026?" "Show me NPL count for Branch District 1." Etc.
  - Aggregation (9): "What is the average loan principal by product type?" Etc.
  - Trend / comparison (6): "How did NPL by branch change Q1 vs Q4?" "Compare disbursement growth between high-rent and low-rent provinces."
  - Out-of-scope / refusal (3): "What's the weather in Hanoi today?" "Tell me Stephen's favourite colour."
- [ ] **Author 30+ Bank questions.** Same coverage rubric.
- [ ] **Author 30+ Securities questions.** Same coverage rubric.
- [ ] **Add Vietnamese variants.** For ≥ 50% of questions, add a Vietnamese variant to test bilingual fluency. Same expected outcomes.
- [ ] **Validate every question against the metric registry (P02-T01).** Every `expected_metric` references a real registered metric; every `expected_sql` runs against the synthetic dataset (P03-T01..T03) and produces the documented `expected_numeric_range`.
- [ ] **Author the validation tooling.** `eval/gold-set/validate.ts`. Runs in CI: lint YAML against schema; verify metric references; verify SQL produces results in expected range against the synthetic data.
- [ ] **Implement gold-set versioning.** Version v1.0.0 at first release; subsequent updates increment per semver; eval-harness reports include the version.
- [ ] **Author the gold-set authorship guide.** `eval/gold-set/AUTHORSHIP.md`. Audience: future contributors. Sections: how to author a question, what makes a good question, common mistakes, how to add a Vietnamese variant.
- [ ] **Spot-check by founder.** Founder reviews 10 random questions per BU for content credibility (does this look like a question a real Shinhan reviewer would ask?).
- [ ] **Tag for sensitivity-tier and HITL routing tests.** A subset of questions are explicitly tagged sensitivity ≥ Restricted; verify the engine routes these to HITL.

### Acceptance criteria

- 90+ questions authored across 3 BUs with the documented coverage rubric.
- Each question has all required fields per schema.
- Validation tooling passes on every YAML.
- Authorship guide published.
- Founder spot-check completed.
- Vietnamese variant on ≥ 50% of questions.
- Sensitivity-tier tagging present; HITL-routing test pass.

## Alternatives Considered

- **Auto-generate gold-set from sample queries seen in production.** Rejected: production hasn't started; demo phase has no real queries.
- **Use an LLM to generate the gold-set.** Rejected: LLM-generated questions skew toward what the LLM is good at — anti-pattern. Domain authorship is the standard.
- **Skip Vietnamese variants.** Rejected: bilingual fluency is a credibility signal; the Form Answers commit to Vietnamese support.
- **Use only 10 questions per BU as a starting point.** Rejected: too narrow to detect regressions; 30+ is the floor.
- **Skip out-of-scope refusal questions.** Rejected: testing refusal behaviour is as important as testing answer behaviour.

## Success Metrics

- **Primary**: 90+ questions authored, validated, and stored within 21 days.
- **Guardrail**: ≥ 95% pass rate on the gold-set in the eval harness within 28 days (per Form Answer commitment).

## Scope

### In scope
- 90+ gold-set questions with documented schema fields.
- Vietnamese variants on ≥ 50%.
- Validation tooling.
- Authorship guide.
- Founder spot-check.
- Sensitivity tagging for HITL tests.

### Out of scope
- Adversarial corpus (P04-T02).
- Eval harness CLI (P04-T04).
- Eval-harness CI integration (P04-T04).
- Reviewer-feedback loop (P04-T05).
- Performance metrics framework (P04-T03).

## Dependencies

- **Upstream**: P02-T01 (metric registry); P03-T01..T03 (synthetic data).
- **Downstream**: P04-T03 (eval harness consumes gold-set), P02-T05 (confidence-tier eval), P02-T06 (adversarial integration).
- **People**: eng-data authoring; metric owners reviewing; founder spot-checking.

## Open Questions

- Q1: For Vietnamese variants, how do we ensure the variant produces the same expected SQL? Recommendation: same metric reference; the LLM should resolve both languages to the same metric.
- Q2: For tolerance on numeric expected ranges, what's a reasonable range? Recommendation: ±2% for aggregations; exact for lookups.
- Q3: How do we keep the gold-set fresh as the synthetic data is regenerated? Recommendation: pin the gold-set to a specific dataset version (SEED); regenerating data with the same SEED produces identical numbers.
- Q4: Authorship — who specifically? Recommendation: eng-data lead + 1 part-time senior contributor with banking-vertical experience (to be identified).

## Implementation Notes

- Per-question YAML is small (10–30 lines); easy to PR-review.
- For expected SQL, store the canonical SQL but allow the engine to produce semantically equivalent SQL (the eval-harness P04-T03 normalises before compare).
- For expected citations, store the count + source columns; the eval-harness checks each numeric claim has a matching citation against those columns.
- For sensitivity tagging, a subset (~10–15) is tagged Restricted to test HITL routing; the test verifies the engine routes correctly.
- For the founder spot-check, the goal is "does this look real?" — not "is this technically correct" (that's the metric-owner review).

## Test Plan

- Test 1: Schema validation passes on every YAML.
- Test 2: Each `expected_metric` resolves in the registry.
- Test 3: Each `expected_sql` runs and returns a value in the documented range against the synthetic dataset.
- Test 4: Vietnamese variant exists for ≥ 50% of questions; both variants resolve to the same metric.
- Test 5: Sensitivity-tier subset triggers HITL routing in the engine.
- Test 6: Founder spot-check completed and logged.

## Rollback Plan

- A bad question is rolled back via PR revert; gold-set version unchanged unless the question was already in a tagged release.
- A bad expected-range value is corrected; expected-range update produces a new gold-set version.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Per-question YAML | `eval/gold-set/{bu}/q-{id}.yaml` | Eng-data | Continuous |
| Schema | `eval/gold-set/SCHEMA.md` | Eng-data | Continuous |
| Authorship guide | `eval/gold-set/AUTHORSHIP.md` | Eng-data | Continuous |
| Validation tooling | `eval/gold-set/validate.ts` | Eng-data | Continuous |
| Founder spot-check log | `eval/gold-set/FOUNDER_REVIEW.md` | Founder | Until program end |
| Gold-set version tags | Git tags `gold-set-v1.0.0` etc. | Eng-data | Indefinite |

## Operational Risks

- **Gold-set authored by engine engineers (test-against-yourself).** Mitigation: domain authorship enforced; engine engineers review only the SQL.
- **Gold-set drifts from production reality.** Mitigation: review cadence; quarterly addition of new questions.
- **Synthetic data regenerated → expected ranges break.** Mitigation: pin SEED; document.
- **Vietnamese variant translates incorrectly.** Mitigation: native-Vietnamese-speaking reviewer.

## Definition of Done

- 90+ questions authored, validated, stored.
- Vietnamese variant on ≥ 50%.
- Authorship guide published.
- Spot-check completed.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
The gold-set is human-authored; no AI training. Each question is grounded in a documented metric (P02-T01) plus the synthetic dataset (P03-T01..T03). No customer data.

### Human Oversight
Domain authors write; metric owners review SQL; founder spot-checks. Versioning preserves history.

### Failure Modes
- Wrong expected range: caught when eval-harness fails on legitimate engine output; correct the range.
- Question references a non-existent metric: caught by validation tooling.
- Question is too narrow / leading: caught by domain-author review.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections of this FR. The gold-set questions themselves are human-authored by domain contributors.
- **Human review**: eng-data lead authors questions; metric owners review SQL; founder spot-checks credibility; native-Vietnamese-speaking reviewer reviews translations.
