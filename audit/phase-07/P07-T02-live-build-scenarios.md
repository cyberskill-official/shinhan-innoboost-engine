# Audit Report — P07-T02: Live-Build Scenarios

> **Phase**: 07 — Demo Day Dry-Run  
> **Task**: T02 — Live-Build Scenarios  
> **Source**: [`demo/scenarios/scenarios.ts`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/demo/scenarios/scenarios.ts) (178 lines)  
> **FR Reference**: [`tasks/P07-T02-live-build-scenarios.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/tasks/P07-T02-live-build-scenarios.md)  
> **Auditor**: Antigravity Deep Audit  
> **Date**: 2026-05-02

---

## 1. Acceptance Criteria Verification

| # | Criterion (from FR) | Status | Evidence |
|---|---|---|---|
| AC-1 | 3 live-build scenarios defined | ✅ Pass | L40-160: Portfolio Summariser, Regulatory Checker, Backtest Dashboard |
| AC-2 | Per-scenario build time target (< 15 min) | ✅ Pass | `targetBuildMinutes: 12` for all 3 scenarios |
| AC-3 | Kill criteria per scenario | ✅ Pass | Each has `killCriteria` array: build-time overshoot, error threshold, accuracy floor |
| AC-4 | Graduation criteria per scenario | ✅ Pass | Each has `graduationCriteria` array: builds, passes tests, meets accuracy |
| AC-5 | Fallback recording for each scenario | ⚠️ Partial | `fallbackRecordingPath` defined but points to non-existent files |
| AC-6 | Rehearsal schedule (3 rehearsals before Demo Day) | ❌ Missing | No rehearsal config or schedule in code |
| AC-7 | User-story video template | ❌ Missing | No video template or script referenced |
| AC-8 | Per-scenario dataset scoped to BU | ✅ Pass | `dataScope` field: securities market data, banking regulations, fund performance |
| AC-9 | Build trace capture (steps + timing) | ⚠️ Partial | `buildTrace` type defined (L20-30) but no trace capture implementation |
| AC-10 | Scenario execution runner | ❌ Missing | No `runScenario()` function — scenarios are config only |

**AC Pass Rate: 5/10 (50%) — 2 partial, 3 missing**

---

## 2. Test Plan Verification

| # | Test (from FR) | Status | Evidence |
|---|---|---|---|
| T-1 | Scenario 1 (Portfolio Summariser) executes within 12 min | ❌ Not Found | No execution runner exists |
| T-2 | Kill criteria trigger correctly | ❌ Not Found | No kill-evaluation logic |
| T-3 | Graduation criteria evaluation | ❌ Not Found | No graduation-evaluation logic |
| T-4 | Fallback recordings play correctly | ❌ Not Found | No recordings exist at referenced paths |
| T-5 | Build trace captures all steps | ❌ Not Found | No trace capture implementation |
| T-6 | Each scenario uses correct dataset | ❌ Not Found | No data loading logic |

**Test Coverage: 0/6 (0%)**

---

## 3. Success Metrics Evaluation

| Metric | Target | Actual | Status |
|---|---|---|---|
| 3 scenarios defined with full spec | All fields populated | All 3 have complete config objects | ✅ Met |
| Kill/graduation criteria operational | Auto-evaluate during build | Config-only, no evaluation logic | ❌ Not Met |
| Fallback recordings available | 3 pre-recorded videos | File paths defined, files don't exist | ❌ Not Met |
| Build time within target | < 12 min per scenario | Cannot measure — no runner | ❌ Not Met |
| 50% kill rate across PoC cycles | Tracked per cycle | Not measured | ❌ Not Met |

---

## 4. Definition of Done Evaluation

| # | DoD Item | Status | Notes |
|---|---|---|---|
| D-1 | 3 scenario configurations complete | ✅ Done | All fields: target, scope, kill/graduation criteria |
| D-2 | Build trace type defined | ✅ Done | `BuildStep` + `BuildTrace` types |
| D-3 | Kill criteria per scenario | ✅ Done | 3-4 criteria each with thresholds |
| D-4 | Graduation criteria per scenario | ✅ Done | 3-4 criteria each |
| D-5 | Fallback recording files exist | ❌ Missing | Paths defined, files don't exist |
| D-6 | Scenario execution runner | ❌ Missing | No `runScenario()` or orchestrator |
| D-7 | Rehearsal schedule documented | ❌ Missing | Not in code or docs |
| D-8 | Test suite | ❌ Missing | No tests |

**DoD Pass Rate: 4/8 (50%)**

---

## 5. Code Quality Analysis

### Strengths
- **Well-structured scenario config**: Each scenario has 12+ fields covering scope, constraints, criteria, and traces
- **Kill criteria are specific**: Measurable thresholds (e.g., "build time > 15 min", "error rate > 20%", "accuracy < 80%")
- **Graduation criteria are objective**: Quantitative gates (e.g., "3 consecutive builds pass", "accuracy ≥ 85%")
- **BU-specific data scoping**: Each scenario targets a specific Shinhan BU dataset

### Issues

| # | Severity | Issue | Location |
|---|---|---|---|
| CQ-1 | 🔴 High | Scenarios are data objects only — no execution orchestration | Entire file |
| CQ-2 | 🔴 High | Fallback recording paths point to non-existent files | L60, L100, L140 |
| CQ-3 | 🟡 Medium | Kill/graduation criteria have no evaluation function | L45-55 |
| CQ-4 | 🟡 Medium | `BuildTrace` type defined but never populated by any code path | L20-30 |
| CQ-5 | 🟡 Medium | No integration with eval harness (P04) for accuracy measurement | Missing |
| CQ-6 | 🟠 Low | `targetBuildMinutes` is 12 for all 3 — should vary by complexity | L42, L82, L122 |

---

## 6. Gap Analysis & Remediation

| # | Gap | Impact | Remediation | Priority |
|---|---|---|---|---|
| G-1 | No scenario execution runner | Cannot run live builds | Implement `runScenario()` orchestrator with MCP integration | 🔴 P0 |
| G-2 | No fallback recordings | Demo Day failure risk with no backup | Record 3 fallback video walkthroughs | 🔴 P0 |
| G-3 | No kill/graduation evaluation | Cannot enforce quality gates | Implement `evaluateCriteria()` function | 🟡 P1 |
| G-4 | No build trace capture | Cannot analyze build performance | Implement step timing and trace logging | 🟡 P1 |
| G-5 | No rehearsal schedule | Team unprepared for live demo | Create rehearsal calendar with 3 dry-runs pre-Demo Day | 🟡 P1 |
| G-6 | Zero test coverage | Cannot validate scenario configs | Add validation tests for scenario structure and criteria | 🟠 P2 |

---

## 7. Verdict

> **Overall Status: ⚠️ PARTIAL — Scenario specifications complete, execution infrastructure absent**

The 3 live-build scenarios are well-specified with clear kill/graduation criteria, BU-scoped datasets, and measurable targets. This is excellent planning. However, the gap between specification and execution is significant: no scenario runner, no fallback recordings, no criteria evaluation logic, and no rehearsal schedule. The scenarios describe *what* should happen at Demo Day but provide no mechanism to *make* it happen.

**Estimated remediation effort**: 5-8 engineering days (runner + recordings + criteria evaluation + rehearsals).
