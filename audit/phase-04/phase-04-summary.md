# Phase 04 — Eval Harness & QA: Audit Summary

> **Auditor**: Antigravity Engine Audit  
> **Date**: 2026-05-02  
> **Phase Completion**: 🟡 ~50%  
> **Risk Level**: HIGH (CI pipeline not operational; adversarial corpus 84% incomplete)  

---

## Aggregate Scorecard

| Task | Status | AC Pass Rate | Tests | LoC | Key Gap |
|------|--------|-------------|-------|-----|---------|
| [P04-T01](P04-T01-gold-set-authoring.md) Gold-Set Authoring | 🟢 75% | 10/13 (77%) | 0 | 1,235 (YAML) | Vietnamese coverage 21%; SCHEMA.md missing |
| [P04-T02](P04-T02-adversarial-test-set.md) Adversarial Test Set | 🔴 40% | 3/17 (18%) | 0 | 281 (YAML) | Only 32/200+ entries (16% of target) |
| [P04-T03](P04-T03-evaluation-metrics-framework.md) Eval Metrics Framework | 🟢 70% | 13/15 (87%) | 0 | 355 | Faithfulness computation missing |
| [P04-T04](P04-T04-harness-cli-ci.md) Harness CLI & CI | 🔴 35% | 4/18 (22%) | 0 | 235 | runEval() is scaffold; no CI YAML; 3/4 commands missing |
| [P04-T05](P04-T05-reviewer-feedback-loop.md) Feedback Loop | 🟢 70% | 9/12 (75%) | 0 | 215 | In-memory only; no HITL integration |

**Totals**: 2,321 LoC (incl. YAML) | **0 tests** | 39/75 AC criteria met (52%)

---

## Cross-Task Gap Analysis

### 🔴 Critical: No Functional Evaluation Pipeline

The most severe finding: **the eval harness cannot actually run**. The pipeline is:

```
Gold-set YAML → Load questions → Execute through NL→SQL engine → Score with metrics framework → Report
     ✅              🟡                    ❌                          ✅                    ✅
```

`runEval()` in `cyber-eval.ts` (L167-173) explicitly comments: _"For now, return the scaffold with empty results for CI integration."_ This means:
- All scores are hardcoded to 0
- No actual LLM/pipeline invocation occurs
- Regression detection has nothing to compare

### 🔴 Critical: Adversarial Corpus 84% Incomplete

| Subcategory | Target | Actual | Gap |
|-------------|--------|--------|-----|
| Role-swap | 40 | 5 | -35 |
| DAN | 30 | 3 | -27 |
| System-prompt-leak | 20 | 3 | -17 |
| Encoded payloads | 30 | 3 | -27 |
| Context-overflow | 20 | 1 | -19 |
| SQL injection | 20 | 2 | -18 |
| Ambiguity | 50 | 5 | -45 |
| Out-of-scope | 30 | 5 | -25 |
| Sensitive extraction | 30 | 5 | -25 |
| **Total** | **270** | **32** | **-238** |

### 🟡 Important: Zero Tests Across All 5 Tasks

Phase 4 has **zero test files**. The metrics framework alone has 12 pure functions that should have unit tests. The feedback loop class is another 7 test scenarios. This represents ~50+ unmissable test cases.

### 🟡 Important: Bilingual Gap

Gold-set Vietnamese coverage: only 21% (19/90 entries). Bank and Securities BUs have only 3 Vietnamese questions each.

---

## Dependency Impact

```
Phase 4 (Eval) ← Phase 2 (Engine) ← Phase 3 (Data)
  │
  ├── Gold-set needs engine pipeline to execute
  │   └── P02 engine is scaffold → eval is scaffold
  │
  ├── Adversarial corpus needs prompt guard (P02-T08)
  │   └── Prompt guard exists but untested against corpus
  │
  └── Feedback loop needs HITL module (P02-T06)
      └── No event integration
```

**Bottom line**: Phase 4 cannot produce real metrics until Phase 2 engine is functional with Phase 3 data loaded.

---

## Remediation Roadmap

### Sprint 1 (Week 1): Foundation
| Item | Effort | Owner | Dependency |
|------|--------|-------|------------|
| Write 50+ unit tests for metrics framework + feedback loop | 10h | eng-eval | None |
| Implement faithfulness computation | 2h | eng-eval | None |
| Create SCHEMA.md for gold-set | 1h | eng-eval | None |
| Replace `runEval()` scaffold with YAML loader + pipeline invocation | 12h | eng-eval | P02 engine |

### Sprint 2 (Week 2): Adversarial Expansion
| Item | Effort | Owner | Dependency |
|------|--------|-------|------------|
| Expand adversarial corpus to 200+ entries | 16h | security-squad | None |
| Add Vietnamese injection variants | 4h | VN security researcher | None |
| Wire adversarial execution against P02-T08 prompt guard | 4h | eng-eval | P02-T08 |

### Sprint 3 (Week 3): CI Integration
| Item | Effort | Owner | Dependency |
|------|--------|-------|------------|
| Create eval-harness.yml (PR/main/nightly triggers) | 4h | eng-devops | None |
| Implement compare/changed-metrics/baseline-set commands | 8h | eng-eval | None |
| Add Vietnamese gold-set variants (71 missing) | 6h | VN translator | None |
| Wire HITL → feedback loop integration | 3h | eng-eval | P02-T06 |
| Create eval-harness runbook | 2h | eng-eval | None |

---

## Phase Risk Summary

| Risk | Probability | Impact | Overall |
|------|-------------|--------|---------|
| Eval pipeline is scaffold (cannot run) | CERTAIN | HIGH | 🔴 CRITICAL |
| Adversarial corpus 84% incomplete | CERTAIN | HIGH | 🔴 CRITICAL |
| Zero tests on scoring functions | CERTAIN | HIGH | 🔴 CRITICAL |
| No CI workflow file | CERTAIN | MEDIUM | 🟡 MODERATE |
| Feedback loop in-memory only | CERTAIN | MEDIUM | 🟡 MODERATE |
| Low Vietnamese gold-set coverage | CERTAIN | LOW | 🟡 MODERATE |
