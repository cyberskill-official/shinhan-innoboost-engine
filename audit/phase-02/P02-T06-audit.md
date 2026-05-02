# Audit Report — P02-T06: Prompt-Injection Defence

> **Audit Date**: 2026-05-02
> **FR Status**: `draft` | **Recommended Status**: `in_progress`
> **Verdict**: ⚠️ **PARTIALLY DONE** — `engine/security/prompt-guard.ts` (199 lines) provides a prompt-guard skeleton. `engine/security/prompt-injection/sanitiser-rules.yaml` (41 lines) documents the sanitiser ruleset. System-prompt isolation exists via `engine/nl-to-sql/prompts/system-prompt.md` (67 lines). But no output classifier, no adversarial corpus (200+ entries required), no eval-harness integration, no observability, no incident-response runbook, no defence-depth verification test, zero tests.

---

## 1. Acceptance Criteria Verification

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| AC-1 | Input sanitiser implemented; ruleset documented; runs on every NL→SQL request | ⚠️ PARTIAL | `prompt-guard.ts` (199 lines) likely contains sanitiser logic. `sanitiser-rules.yaml` (41 lines) documents patterns. Not verified to run on every request. |
| AC-2 | System-prompt isolation implemented; CI rule verifies wrapping | ⚠️ PARTIAL | `system-prompt.md` (67 lines) contains the template with `<untrusted_content>` pattern. No CI rule verifying wrapping. |
| AC-3 | Output classifier implemented; runs on every LLM output | ❌ FAIL | No `output-classifier.ts`. No classifier rules YAML. |
| AC-4 | Adversarial corpus authored with 200+ entries | ❌ FAIL | No `adversarial-corpus.yaml`. 0 entries (target: 200+). |
| AC-5 | Adversarial-test integration in eval-harness; ≥ 95% pass rate on PR | ❌ FAIL | No eval-harness integration. No P04-T02. |
| AC-6 | Observability metrics flowing | ❌ FAIL | No injection-attempt logging. |
| AC-7 | Incident-response runbook published | ❌ FAIL | `docs/runbooks/prompt-injection-incident.md` does not exist. |
| AC-8 | Defence-depth verification test in place | ❌ FAIL | No defence-depth test. |

**Acceptance Criteria Score: 0/8 PASS, 2/8 PARTIAL, 6/8 FAIL**

---

## 2–5. Test Plan: 0/7 executed | Success Metrics: NOT MET | DoD: 0/4

---

## 6. Existing Artefacts Inventory

| Expected Artefact | Path | Exists? | Content Quality |
|-------------------|------|---------|-----------------|
| Prompt guard | `engine/security/prompt-guard.ts` | ✅ Yes (199 lines) | Input sanitiser skeleton |
| Sanitiser rules | `engine/security/prompt-injection/sanitiser-rules.yaml` | ✅ Yes (41 lines) | Pattern ruleset |
| System prompt | `engine/nl-to-sql/prompts/system-prompt.md` | ✅ Yes (67 lines) | Template with `<untrusted_content>` |
| Output classifier | `engine/security/prompt-injection/output-classifier.ts` | ❌ No | — |
| Classifier rules | `engine/security/prompt-injection/classifier-rules.yaml` | ❌ No | — |
| Adversarial corpus | `engine/security/prompt-injection/adversarial-corpus.yaml` | ❌ No | — |
| Incident-response runbook | `docs/runbooks/prompt-injection-incident.md` | ❌ No | — |
| Test suite | N/A | ❌ No | — |

---

## 7. Summary & Recommendation

**~20% complete.** Three artefacts provide a foundation: sanitiser skeleton (199 lines), sanitiser rules (41 lines), and system-prompt template (67 lines). But the FR's defence-in-depth requires all four layers (sanitiser + isolation + output classifier + adversarial corpus) — only 2 of 4 layers have any code, and none are tested.

**Recommended status**: `in_progress`
