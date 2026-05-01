---
title: "Implement evaluation metrics framework"
author: "@cyberskill-engine-tech-lead"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: minimal
target_release: "2026-07-03"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Implement the evaluation metrics framework that scores the engine against the gold-set (P04-T01) and the adversarial corpus (P04-T02), reporting: accuracy (matches expected within tolerance); coverage (% of gold-set answered without HITL); faithfulness (does narrative match cited data); latency (p50/p95/p99); cost per question (tokens × rate); hallucination rate (numeric claim with no valid citation); refusal precision (refused items that should have been refused); refusal recall (refused-when-shouldn't is the inverse). Outputs structured JSON + HTML report. The framework is the spine of every quality measurement; without explicit metrics, "we are good" is rhetorical.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"accuracy ≥ 95% on the gold-set evaluation harness, auditable with citations" — CyberSkill SF9 form answer
"sample gold-set Q&A evaluation results (96.3% aggregate)" — CyberSkill SB5 attachment description
</untrusted_content>

## Problem

The Form Answers commit to specific numerical claims (95%, 96.3%); the framework is what produces those numbers credibly. Without it, the claims are decorative.

Specific gaps if we shortcut:

- **Without accuracy measurement, "we got the right answer" is unmeasured.**
- **Without coverage metric, we don't know how often the engine confidently answers vs. routes to HITL.**
- **Without faithfulness, hallucinated narratives slip past — exactly the failure the citation engine (P02-T04) addresses; the metric verifies it.**
- **Without latency metrics, "fast enough" is unmeasured.**
- **Without cost metric, the engine becomes economically unviable at scale unnoticed.**
- **Without hallucination rate, the citation engine's correctness is unverified.**
- **Without refusal precision and recall, we cannot tune the engine's conservativeness.**

The `feedback_p1_scope_preference` memory note biases us richer. For evaluation metrics, "richer" means: 8+ documented metrics; structured JSON + HTML reports; per-BU breakdowns; per-intent breakdowns; per-confidence-tier breakdowns; trend over time; flag regressions automatically.

## Proposed Solution

A metrics framework in `eval/metrics/`:

1. **Per-question evaluation.** Each gold-set question is run; result compared to expected; multiple metrics computed.
2. **Aggregation.** Per-BU, per-intent, per-tier, overall.
3. **Reporting.** JSON for programmatic; HTML for human review.
4. **Regression detection.** Compare to baseline (most recent green main); flag any metric regression > 2%.
5. **Trend dashboard.** Per-day metrics; spot trends.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Define metric set.** Documented at `eval/metrics/METRICS.md`:
  - **Accuracy**: % of questions where engine output matches expected within tolerance.
  - **Coverage**: % of questions answered without HITL routing.
  - **Faithfulness**: % of citations where the narrative claim matches the cited row.
  - **Latency p50/p95/p99**: end-to-end pipeline time.
  - **Cost per question**: tokens × LLM rate; aggregated to USD.
  - **Hallucination rate**: % of numeric claims without valid citation.
  - **Refusal precision**: of refused requests, % that should have been refused per gold-set tag.
  - **Refusal recall**: of refusable requests, % that were refused.
  - **Confidence calibration**: comparison of confidence tier vs. accuracy at that tier (well-calibrated: High tier ≥ 95% accuracy; Medium ≥ 80%; Low ≥ 60%).
  - **Citation count**: average citations per answer.
- [ ] **Implement evaluator.** `eval/metrics/evaluator.ts`. For each gold-set question: run pipeline; compare to expected; compute all metrics; emit per-question result.
- [ ] **Implement aggregator.** Combines per-question results; produces per-BU, per-intent, per-tier, overall aggregates.
- [ ] **Implement reporter.** JSON output for CI; HTML output for human review.
- [ ] **Implement baseline-comparison.** Compares current run to most-recent-green-main run; flags regressions > 2%.
- [ ] **Implement trend dashboard.** Time-series of metrics over the last 30 days; per-metric chart; surfaced in P09 observability.
- [ ] **Implement adversarial-corpus run.** Same framework runs the adversarial corpus and reports pass rate per category.
- [ ] **Test exhaustively.** Verify metrics against hand-computed values on a small synthetic gold-set.

### Acceptance criteria

- All documented metrics implemented and tested.
- JSON + HTML outputs produced.
- Baseline comparison works; regressions detected.
- Trend dashboard surfaces in observability.
- Adversarial-corpus run integrated.

## Alternatives Considered

- **Use a third-party eval framework (Promptfoo, LangSmith).** Rejected: requires data egress; financial-sector concerns. Internal framework keeps everything within the engine.
- **Skip baseline-comparison; manual review.** Rejected: human review is slow; automated detection is the standard.
- **Skip per-BU breakdowns.** Rejected: per-BU is necessary to detect "the engine is great on SVFC but bad on Bank" — without breakdown that's invisible.

## Success Metrics

- **Primary**: All metrics implemented and reporting correctly within 14 days.
- **Guardrail**: Baseline comparison correctly flags regressions in the test suite.

## Scope

### In scope
- 10 documented metrics.
- JSON + HTML reports.
- Per-BU / per-intent / per-tier breakdowns.
- Baseline-comparison + regression flagging.
- Trend dashboard.
- Adversarial-corpus integration.
- Test suite.

### Out of scope
- Harness CLI (P04-T04).
- CI integration (P04-T04).
- Reviewer-feedback loop (P04-T05).

## Dependencies

- **Upstream**: P02-T01..T09; P03-T01..T04; P04-T01; P04-T02.
- **Downstream**: P04-T04 (CLI), P09 (observability), P11-T04 (compliance dossier).
- **People**: engine tech lead authoring; eng-data reviewing.

## Open Questions

- Q1: For accuracy tolerance, exact match or fuzzy? Recommendation: per metric — exact for lookups, ±2% for aggregations, semantic-similarity > 0.85 for narratives.
- Q2: For confidence calibration, what's the threshold for "well-calibrated"? Recommendation: documented above.
- Q3: For HTML report, what's the format? Recommendation: clean tables with charts; no JS frameworks (static HTML).

## Implementation Notes

- Per-question results stored as JSON-lines; easy to query.
- Baseline-comparison uses Git tags to find the most-recent-green-main.
- HTML report uses a simple template; charts via inline SVG.
- For confidence calibration, bin into the 3 tiers; report accuracy per tier.

## Test Plan

- Test 1: Hand-computed values on a 10-question test gold-set; framework matches hand computation.
- Test 2: Baseline comparison correctly identifies a deliberate 5% regression.
- Test 3: HTML report renders correctly; charts visible.
- Test 4: Adversarial-corpus run produces per-category breakdown.

## Rollback Plan

- A bad metric definition is rolled back via PR revert.
- A bad baseline is corrected by re-tagging baseline.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Metrics doc | `eval/metrics/METRICS.md` | Engine tech lead | Continuous |
| Evaluator | `eval/metrics/evaluator.ts` | Engine tech lead | Continuous |
| JSON results | CI artefacts | Engine tech lead | 1 year |
| HTML reports | CI artefacts | Engine tech lead | 1 year |
| Trend dashboard | Central observability store | Engine tech lead | Continuous |

## Operational Risks

- **Baseline gaming (engineers tune to gold-set).** Mitigation: gold-set authored by domain experts (P04-T01); engineers don't see expected SQL.
- **Metric definition disagreement.** Mitigation: documented; reviewed by founder.
- **Cost metric inaccurate due to provider rate changes.** Mitigation: rate config in Doppler; updated on rate changes.

## Definition of Done

- All metrics implemented; reports generated; baseline comparison works.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Framework consumes gold-set + adversarial corpus + engine outputs. No customer data; all synthetic or curated.

### Human Oversight
Engineers author the framework; founder ratifies metric definitions; nightly runs with anomaly detection.

### Failure Modes
- Metric bug: caught by hand-computation tests.
- Baseline drift: tagged history preserves canonical points.
- Reporter formatting issue: noisy but not blocking.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: engine tech lead authors implementation; eng-data reviews metric definitions.
