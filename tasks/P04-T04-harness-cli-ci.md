---
title: "Build harness CLI and CI integration with regression alarms"
author: "@cyberskill-engine-tech-lead"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-07-10"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Build the eval-harness command-line interface and CI integration that runs the gold-set (P04-T01), adversarial corpus (P04-T02), and metrics framework (P04-T03) on every PR (incremental — only changed metrics) and nightly on `main` (full); compares results to baseline; comments delta to PR; blocks merge if regression > 2%; alerts on overnight regression. CLI: `cyber-eval run --bu=svfc --suite=gold` produces JSON + HTML; CI workflow `eval-harness.yml` (P01-T02 scaffolded) is fully implemented here. The harness is the structural enforcement that the engine's quality measurements happen continuously, not on demand.

## Problem

Without CI integration, the framework (P04-T03) is invoked only when an engineer remembers; quality regresses silently. Without incremental-on-PR, full-eval cost is too high to run on every PR (full runs take 10+ minutes); incremental runs only the affected metrics, keeping PR-check time bounded. Without merge-blocking on regression, a PR that breaks accuracy can land.

Specific gaps if we shortcut:

- **Without CLI, eval is not reproducible across engineers.**
- **Without CI integration, nobody runs eval consistently.**
- **Without incremental-on-PR, eval runtime exceeds PR-check budget; engineers will skip running it.**
- **Without merge-blocking, regressions land.**
- **Without nightly alarms, weekend regressions go undetected until Monday.**

The `feedback_p1_scope_preference` memory note biases us richer. For the harness, "richer" means: comprehensive CLI; PR-incremental + main-full + nightly modes; baseline-comparison; PR comment; merge gate; alarm on nightly regression; per-engineer interactive mode.

## Proposed Solution

A CLI (`@cyberskill/cyber-eval`) plus CI workflows that exercise the metrics framework (P04-T03) under three modes: PR-incremental, main-full, nightly-full. Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Implement CLI.** `eval/cli/cyber-eval.ts`. Commands:
  - `cyber-eval run --bu={svfc|bank|securities|all} --suite={gold|adversarial|all} --mode={incremental|full} --baseline={tag}` — run; output JSON + HTML.
  - `cyber-eval compare --run-a={path} --run-b={path}` — compare two runs.
  - `cyber-eval changed-metrics --pr={n}` — identify changed metrics from a PR for incremental mode.
  - `cyber-eval baseline-set --tag={tag}` — promote a green run to baseline.
- [ ] **Implement PR-incremental mode.** Detects changed files in PR; identifies which metrics' definitions or implementations changed; runs only their gold-set entries; reports delta.
- [ ] **Implement main-full + nightly-full modes.** Run entire gold-set + adversarial corpus.
- [ ] **Implement CI workflow `eval-harness.yml`.** Triggers: PR (incremental), main (full), nightly cron (full). Outputs: comment to PR with metrics delta; upload report as artefact; alert on regression.
- [ ] **Implement merge-blocking.** PR-check status fails if any metric regresses > 2%. Exception: explicit `eval-allow-regression` label can be applied with documented justification (audit-logged).
- [ ] **Implement nightly regression alarm.** If nightly-full reports any regression > 1% vs. baseline, alert eng-llm + engine tech lead. Saturday-Sunday regressions catch up Monday morning.
- [ ] **Implement PR comment formatter.** Comment includes: per-metric delta with up/down arrows; per-BU summary; failure reasons (specific questions that newly fail); link to full HTML report.
- [ ] **Implement baseline management.** Most-recent-green-main commit is the baseline by default; `baseline-set` lets us pin a specific tag (useful for releases).
- [ ] **Implement parallel runs.** PR-check time budget (P01-T02) is < 8 minutes; eval incremental should complete < 4 minutes. Parallelise question execution.
- [ ] **Author runbook.** `docs/runbooks/eval-harness.md`: how to debug a failing eval; how to trigger a manual run; how to update baseline; how to apply the regression-allow label.

### Acceptance criteria

- CLI shipped with all commands.
- PR-incremental + main-full + nightly-full all work.
- Merge-blocking enforced; tested with deliberate regression.
- Nightly alarm fires on simulated regression.
- PR comment renders correctly.
- Runtime: incremental p95 < 4 minutes; full < 15 minutes.

## Alternatives Considered

- **Run full eval on every PR.** Rejected: too slow.
- **Skip merge-blocking; use as advisory only.** Rejected: regressions land silently.
- **Use nightly only; skip PR.** Rejected: regressions detected late.

## Success Metrics

- **Primary**: CLI + CI integration shipped within 14 days.
- **Guardrail**: PR-check runtime including eval < 12 minutes (incremental).

## Scope

### In scope
- CLI with all commands.
- CI workflow.
- PR comment formatter.
- Merge-blocking.
- Nightly alarm.
- Runbook.

### Out of scope
- Reviewer-feedback loop (P04-T05).
- Performance optimisation beyond parallelisation (deferred).

## Dependencies

- **Upstream**: P04-T01, P04-T02, P04-T03; P01-T02 (CI infrastructure).
- **Downstream**: P09 (observability metrics).
- **People**: engine tech lead.

## Open Questions

- Q1: Regression threshold — 2% on PR, 1% nightly? Recommendation: yes; tune with experience.
- Q2: For incremental mode, fallback to full on what conditions? Recommendation: any change to the engine module triggers full.
- Q3: For PR comment, how detailed? Recommendation: high-level by default; "expand for details" link.

## Implementation Notes

- Parallelise via worker pool; LLM API calls are I/O-bound so concurrency helps.
- Cost: each full run costs ~$2 in LLM API; nightly cost is bounded.
- For PR comments, the GitHub Actions context provides everything needed.
- For the regression-allow label, only repo admins can apply.

## Test Plan

- Test 1: CLI run on small gold-set; verify JSON + HTML.
- Test 2: PR-incremental detects changed metrics correctly.
- Test 3: Merge-blocking triggers on deliberate regression.
- Test 4: Nightly alarm fires on simulated regression.
- Test 5: Runtime: incremental on 10 metrics < 2 minutes.

## Rollback Plan

- A bad CI workflow is rolled back via revert.
- A bad merge-block is bypassed with the regression-allow label.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| CLI | `eval/cli/cyber-eval.ts` | Engine tech lead | Continuous |
| CI workflow | `.github/workflows/eval-harness.yml` | Engine tech lead | Continuous |
| Eval results | CI artefacts | Engine tech lead | 1 year |
| Baseline tags | Git tags | Engine tech lead | Indefinite |
| Regression-allow audit | `docs/audit/regression-allows/{date}.md` | Founder | 7 years |

## Operational Risks

- **CI cost (LLM API on every PR).** Mitigation: incremental mode keeps cost bounded; full only on main.
- **Flaky LLM responses cause flaky eval.** Mitigation: temperature=0; seeded sampling where possible.
- **Regression-allow misuse.** Mitigation: audit; review weekly.

## Definition of Done

- All deliverables shipped.
- Runtime targets met.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: engine tech lead authors implementation.
