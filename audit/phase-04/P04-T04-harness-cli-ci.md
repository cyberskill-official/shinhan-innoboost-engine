# Deep Audit — P04-T04: Harness CLI & CI Integration

> **Auditor**: Antigravity Engine Audit  
> **Date**: 2026-05-02  
> **Status**: 🟡 PARTIALLY COMPLETE (~35%)  
> **Risk Level**: High  

---

## 1. Acceptance Criteria Audit

| # | Criterion | Status | Evidence | Gap |
|---|-----------|--------|----------|-----|
| AC-1 | CLI implements `cyber-eval run` command | 🟡 PARTIAL | `runEval()` function exists (L164-200) but **returns hardcoded zeros** ("scaffold with empty results"). No actual pipeline execution. | Scaffold only — no pipeline wiring. |
| AC-2 | CLI implements `cyber-eval compare` command | ❌ FAIL | `CompareOptions` interface defined (L32-36) but **no implementation**. No `compare()` function. | Not implemented. |
| AC-3 | CLI implements `cyber-eval changed-metrics` command | ❌ FAIL | Not implemented. No function for detecting changed metrics from PR diff. | Not implemented. |
| AC-4 | CLI implements `cyber-eval baseline-set` command | ❌ FAIL | Not implemented. No baseline management function. | Not implemented. |
| AC-5 | JSON report generation | ✅ PASS | `generateJsonReport()` (L40-42): `JSON.stringify(report, null, 2)`. | — |
| AC-6 | HTML report generation | ✅ PASS | `generateHtmlReport()` (L44-109): Full HTML with dark theme, score/detail/regression tables. | — |
| AC-7 | PR comment formatter (Markdown) | ✅ PASS | `generatePrComment()` (L115-159): Metrics delta table, regression warnings, failed items, merge-blocking banner. | — |
| AC-8 | CI entry point with exit code management | ✅ PASS | `ciMain()` (L208-234): Parses CLI args, runs eval, checks merge blockers, returns exit code 0/1. | — |
| AC-9 | PR-incremental mode (detect changed metrics) | ❌ FAIL | Not implemented. No file-diff detection. | Not implemented. |
| AC-10 | Main-full + nightly-full modes | ❌ FAIL | `--suite` flag parsed but `runEval()` returns empty scaffold regardless of mode. | Not functional. |
| AC-11 | CI workflow file `eval-harness.yml` | ❌ FAIL | **No `.github/workflows/eval-harness.yml` exists.** | Not created. |
| AC-12 | Merge-blocking on regression >2% | 🟡 PARTIAL | Logic exists in `ciMain()` (L223-229): checks `blocks_merge` flag. But **no actual regression can be detected** with scaffold data. | Code exists, untestable. |
| AC-13 | Nightly regression alarm | ❌ FAIL | Not implemented. No alerting mechanism. | Not implemented. |
| AC-14 | Parallel execution for runtime budget | ❌ FAIL | No parallelisation. Sequential only. | Not implemented. |
| AC-15 | Baseline management | ❌ FAIL | No baseline storage, tagging, or retrieval. | Not implemented. |
| AC-16 | Runbook authored | ❌ FAIL | No `docs/runbooks/eval-harness.md` exists. | Not created. |
| AC-17 | Runtime: incremental p95 < 4 minutes | ❌ FAIL | Cannot be verified — no functional pipeline. | Not measurable. |
| AC-18 | Runtime: full < 15 minutes | ❌ FAIL | Cannot be verified. | Not measurable. |

**AC Summary**: 4/18 PASS, 2/18 PARTIAL, 12/18 FAIL.

---

## 2. Test Plan Audit

| # | Test | Status | Evidence | Gap |
|---|------|--------|----------|-----|
| TP-1 | CLI run on small gold-set; verify JSON + HTML output | ❌ NOT RUN | Would produce all-zeros report (scaffold). | Blocked by scaffold implementation. |
| TP-2 | PR-incremental detects changed metrics correctly | ❌ NOT RUN | Not implemented. | Blocked. |
| TP-3 | Merge-blocking triggers on deliberate regression | ❌ NOT RUN | No functional regression data. | Blocked. |
| TP-4 | Nightly alarm fires on simulated regression | ❌ NOT RUN | Not implemented. | Blocked. |
| TP-5 | Runtime: incremental on 10 metrics < 2 minutes | ❌ NOT RUN | Not measurable. | Blocked. |

**TP Summary**: 0/5 tests executed. **100% test debt.**

---

## 3. Success Metrics Audit

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| CLI with all commands | 4 commands | 1 scaffold (run), 0 functional | ❌ FAIL |
| CI workflow operational | Yes | No YAML file | ❌ FAIL |
| PR-check runtime < 12 min | <12 min | N/A | ❌ FAIL |
| Report formats (JSON + HTML + PR comment) | 3 formats | 3 formats implemented | ✅ PASS |
| Merge-blocking enforced | Yes | Logic present, not exercisable | 🟡 PARTIAL |

---

## 4. Definition of Done Audit

| Criterion | Met? | Notes |
|-----------|------|-------|
| All deliverables shipped | ❌ | 3/4 commands missing, no CI YAML, no runbook |
| Runtime targets met | ❌ | Not measurable |
| Tests pass | ❌ | Zero tests |
| Runbook authored | ❌ | Not created |

---

## 5. Code Quality Assessment

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Architecture** | 7/10 | Good separation: RunOptions, CompareOptions. CI entry point clean. |
| **Report Generation** | 8/10 | HTML report is well-styled (dark theme, green/red pass/fail). PR comment is Markdown-clean. |
| **CLI Parsing** | 5/10 | Manual `args.find()` parsing — fragile. Should use yargs/commander. |
| **Completeness** | 3/10 | Only scaffolding. `runEval()` returns hardcoded zeros. 3/4 commands missing. |
| **CI Integration** | 0/10 | No workflow file. No GitHub Actions integration. |
| **Test Coverage** | 0/10 | Zero tests. |

---

## 6. Risk Assessment

| Risk | Severity | Impact | Mitigation |
|------|----------|--------|------------|
| No CI pipeline = eval never runs automatically | **CRITICAL** | Regressions in accuracy/hallucination land in production | Implement eval-harness.yml |
| `runEval()` returns scaffold zeros = false confidence | **HIGH** | Team may think eval is "passing" when it's not running | Replace scaffold with real pipeline execution |
| No baseline management = no regression comparison | **HIGH** | Cannot detect metric drift over time | Implement baseline storage |
| No parallelisation = full eval may exceed time budget | **MEDIUM** | Main/nightly eval blocks CI queue | Add worker pool for I/O-bound LLM calls |

---

## 7. Remediation Priorities

| Priority | Item | Effort | Dependency |
|----------|------|--------|------------|
| P0 | Replace `runEval()` scaffold with actual pipeline execution (load YAML, invoke engine, score) | 12h | P02 engine + P03 data |
| P0 | Create `.github/workflows/eval-harness.yml` with PR/main/nightly triggers | 4h | None |
| P0 | Implement `compare` command (load two JSON reports, run detectRegressions) | 3h | None |
| P1 | Implement `changed-metrics` command (git diff → metric impact analysis) | 4h | None |
| P1 | Implement `baseline-set` command (tag management) | 2h | None |
| P1 | Write 5 tests: report generation, CI exit codes, regression comparison | 4h | None |
| P1 | Create `docs/runbooks/eval-harness.md` | 2h | None |
| P2 | Add parallel execution with configurable concurrency | 4h | None |
| P2 | Implement nightly alarm (Slack/PagerDuty webhook) | 3h | None |
| P2 | Replace manual arg parsing with yargs/commander | 2h | None |
