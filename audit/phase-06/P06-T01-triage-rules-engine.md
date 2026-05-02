# Audit Report — P06-T01: Triage Rules Engine

> **Phase**: 06 — HITL Reviewer Queue  
> **Task**: T01 — Triage Rules Engine  
> **Source**: [`hitl/triage/rules-engine.ts`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/hitl/triage/rules-engine.ts) (269 lines)  
> **YAML Config**: [`hitl/triage/rules/seed-rules.yaml`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/hitl/triage/rules/seed-rules.yaml) (87 lines)  
> **FR Reference**: [`tasks/P06-T01-triage-rules-engine.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/tasks/P06-T01-triage-rules-engine.md)  
> **Auditor**: Antigravity Deep Audit  
> **Date**: 2026-05-02

---

## 1. Acceptance Criteria Verification

| # | Criterion (from FR) | Status | Evidence |
|---|---|---|---|
| AC-1 | Confidence threshold (< 65%) routes to reviewer | ✅ Pass | Rule R001 at L71: `input.confidenceScore < 0.65` → `route_reviewer` |
| AC-2 | Sensitivity ≥ restricted → mandatory reviewer | ✅ Pass | Rule R002 at L82: checks `restricted` or `regulated` |
| AC-3 | Novelty score < 0.40 → route for review | ✅ Pass | Rule R003 at L93: `input.noveltyScore < 0.40` |
| AC-4 | Historically flagged patterns → route | ✅ Pass | Rule R004 at L104: `input.isHistoricallyFlagged` |
| AC-5 | No citations + non-high confidence → route | ✅ Pass | Rule R005 at L115: dual condition check |
| AC-6 | Regulated + low confidence (< 50%) → escalate | ✅ Pass | Rule R006 at L126: `action: 'escalate'`, SLA 15 min, priority `critical` |
| AC-7 | High confidence + public + not flagged + not novel → auto-approve | ✅ Pass | Rule R007 at L137: 4-part compound condition |
| AC-8 | Per-tenant threshold tuning | ⚠️ Partial | `TriageInput` has `tenantId` field but no per-tenant rule override mechanism |
| AC-9 | Priority queue ordering | ⚠️ Partial | Rules sorted by priority (L200), but no queue data structure for pending items |
| AC-10 | Auto-escalation on SLA breach | ❌ Missing | SLA config exists (L54-60) but no timer/scheduler to trigger escalation |

**AC Pass Rate: 7/10 (70%)**

---

## 2. Test Plan Verification

| # | Test (from FR) | Status | Evidence |
|---|---|---|---|
| T-1 | Unit tests for each seed rule | ❌ Not Found | No test files in `hitl/triage/__tests__/` or any `*.test.ts` |
| T-2 | Edge case: confidence exactly at 0.65 boundary | ❌ Not Found | No boundary tests exist |
| T-3 | Priority ordering correctness | ❌ Not Found | No tests verifying rule evaluation order |
| T-4 | Reviewer pool round-robin fairness | ❌ Not Found | `ReviewerPool.assign()` untested |
| T-5 | SLA timer accuracy | ❌ Not Found | No timer implementation to test |
| T-6 | Metric: < 100ms p99 triage latency | ❌ Not Found | No performance benchmarks |

**Test Coverage: 0/6 (0%)**

---

## 3. Success Metrics Evaluation

| Metric | Target | Actual | Status |
|---|---|---|---|
| 7 seed rules functional | 7 rules | 7 rules in code + YAML | ✅ Met |
| Per-rule unit tests | 100% coverage | 0% coverage | ❌ Not Met |
| SLA enforcement | 30-min SLA active | Config only, no enforcement | ❌ Not Met |
| Per-tenant tuning | Configurable thresholds | `tenantId` in input, no per-tenant rules | ❌ Not Met |
| Triage latency p99 | < 100ms | Not measured | ❌ Not Met |

---

## 4. Definition of Done Evaluation

| # | DoD Item | Status | Notes |
|---|---|---|---|
| D-1 | Triage engine evaluates all 7 rules in priority order | ✅ Done | L199-200: `sort((a, b) => a.priority - b.priority)` |
| D-2 | Reviewer assignment via round-robin | ✅ Done | L187: `(this.lastAssignedIndex + 1) % eligible.length` |
| D-3 | BU-scope + sensitivity-ceiling eligibility filter | ✅ Done | L175-182: checks `buScope`, `sensitivityCeiling`, `currentLoad` |
| D-4 | YAML config file for seed rules | ✅ Done | `seed-rules.yaml` with all 7 rules + SLA + routing config |
| D-5 | Runtime rule add/disable | ✅ Done | `addRule()` L256, `disableRule()` L262 |
| D-6 | Error handling in rule evaluation | ✅ Done | L230: `try/catch` per rule, continues on error |
| D-7 | Test suite passes | ❌ Failed | No test suite exists |
| D-8 | FR ticket marked Done | ❌ Failed | Status remains `draft` |

**DoD Pass Rate: 6/8 (75%)**

---

## 5. Code Quality Analysis

### Strengths
- **Immutable interfaces**: All `TriageInput`, `TriageDecision`, `TriageRule` use `readonly` properties
- **Type-safe actions**: `TriageAction` union type prevents invalid action strings
- **Graceful degradation**: Rule evaluation errors caught per-rule, not globally
- **Clear separation**: Types, config, pool, engine in logical sections

### Issues

| # | Severity | Issue | Location |
|---|---|---|---|
| CQ-1 | 🔴 High | YAML rules not parsed at runtime — TS hardcodes the same rules; YAML is documentation-only | `rules-engine.ts` L64 vs `seed-rules.yaml` |
| CQ-2 | 🟡 Medium | `ReviewerPool` doesn't check working hours (`availableFrom`/`availableTo`) despite interface declaring them | L171-189 |
| CQ-3 | 🟡 Medium | `disableRule()` uses unsafe type cast `(rule as { enabled: boolean })` to mutate readonly | L265 |
| CQ-4 | 🟡 Medium | Rule R007 priority=100 means "evaluate last" but any new rule with priority 50-99 silently overrides auto-approve logic | L137-141 |
| CQ-5 | 🟠 Low | `estimatedWaitMs` always `slaMinutes * 60 * 1000` — doesn't account for actual queue depth | L250 |
| CQ-6 | 🟠 Low | No `refuse` action in SEED_RULES — the `TriageAction` type includes it but it's never triggered | L7 |

---

## 6. Gap Analysis & Remediation

| # | Gap | Impact | Remediation | Priority |
|---|---|---|---|---|
| G-1 | Zero test coverage | Cannot verify rule correctness under regression | Write unit tests for all 7 rules + edge cases | 🔴 P0 |
| G-2 | No YAML → TS rule loader | Config duplication; YAML changes don't affect runtime | Implement YAML parser that constructs `TriageRule[]` | 🟡 P1 |
| G-3 | No auto-escalation scheduler | SLA breaches go undetected | Implement timer using `checkSlaStatus()` from `notify.ts` integration | 🔴 P0 |
| G-4 | No per-tenant rule overrides | Cannot customize thresholds for SVFC vs Bank vs Securities | Add `tenantRuleOverrides: Map<string, Partial<TriageRule>>` | 🟡 P1 |
| G-5 | Working hours not enforced | Reviewers assigned outside their hours | Add time-zone-aware availability check in `assign()` | 🟡 P1 |
| G-6 | No queue persistence | In-memory only; restart loses state | Persist to database or Redis | 🔴 P0 |

---

## 7. Verdict

> **Overall Status: ⚠️ PARTIAL — Functional scaffold with critical infrastructure gaps**

The triage rules engine has a well-structured, type-safe implementation with all 7 seed rules correctly coded. The `TriageEngine.evaluate()` method works end-to-end for single evaluations. However, the engine lacks the operational infrastructure required for production: no auto-escalation, no queue persistence, no per-tenant tuning, and critically **0% test coverage**. The YAML config is a duplicate of the TypeScript constants rather than a consumed config source.

**Estimated remediation effort**: 3-5 engineering days (tests + YAML loader + SLA timer integration).
