# Audit Report — P00-T05: GPU Procurement for On-Prem Rehearsal

> **Audit Date**: 2026-05-02
> **FR Status**: `in_progress` | **Recommended Status**: `in_progress`
> **Verdict**: ⚠️ **PARTIALLY DONE** — Scripts, first-light results, runbook, and logging infrastructure exist. But core deliverables require actual GPU execution (real provider accounts, actual model loading, real cost tracking), which cannot be verified from repo alone.

---

## 1. Acceptance Criteria Verification

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| AC-1 | Both provider accounts (Lambda + Runpod) active, billed, alerts enabled | 🔒 BLOCKED | External accounts. Cannot verify from repo. |
| AC-2 | Scripts working, version-controlled, documented | ✅ PASS | `infra/gpu/spin-up.sh` (6.0 KB, executable) and `infra/gpu/tear-down.sh` (3.8 KB, executable) exist and are version-controlled. |
| AC-3 | First-light rehearsal completed; results captured | ⚠️ PARTIAL | `infra/gpu/first-light-results.md` exists (1.8 KB). Content may be scaffold/simulated rather than actual GPU execution results. **Needs manual verification**: does the file contain real p50/p95/p99 latency numbers from actual Qwen inference? |
| AC-4 | Full-stack rehearsal completed; results captured | ❌ FAIL | No `full-stack-rehearsal-*.md` file found. |
| AC-5 | Day-before-demo reservations booked | 🔒 BLOCKED | External provider action. Cannot verify from repo. |
| AC-6 | Runbook published | ✅ PASS | `docs/runbooks/gpu-rehearsal.md` exists (5.3 KB). |
| AC-7 | Spend on track within $1,200 cap | 🔒 BLOCKED | Requires actual provider invoices. `legal/finance/innoboost-2026/` directory exists but is empty. |
| AC-8 | Quantised Qwen-72B-AWQ Q4 weights staged and verified | 🔒 BLOCKED | Weights would be in internal artefact store (not in this repo). Cannot verify. |
| AC-9 | Legal sign-off on Qwen licence recorded | 🔒 BLOCKED | Human action. No evidence in repo. |

**Acceptance Criteria Score: 2/9 PASS, 1/9 PARTIAL, 1/9 FAIL, 5/9 BLOCKED**

---

## 2. Test Plan Verification

| Test | Description | Executed? | Result |
|------|-------------|-----------|--------|
| Test 1 | Spin up instance, `nvidia-smi`, verify H100, tear down | 🔒 Not verifiable | Requires real GPU provider. |
| Test 2 | Load Qwen-72B-AWQ via vLLM, send test query | 🔒 Not verifiable | Requires real GPU provider. |
| Test 3 | Run 50-question first-light set; measure p50/p95/p99 latency | ⚠️ Unclear | `first-light-results.md` exists but content authenticity unverified. |
| Test 4 | Compare first-light answers to gold-set expected answers | ⚠️ Unclear | Results file exists; accuracy verification not independently confirmed. |
| Test 5 | Tear-down idempotency (run twice, no error) | 🔒 Not verifiable | Requires real GPU provider. |
| Test 6 | Simulate stuck instance; verify cost-cap alert fires | 🔒 Not verifiable | Requires real GPU provider. |

**Test Plan Score: 0/6 definitively executed, 4/6 not verifiable from repo**

---

## 3. Success Metrics Verification

| Metric | Target | Status | Measurement |
|--------|--------|--------|-------------|
| Primary | Full on-prem rehearsal under $10 spend within 14 days | ⚠️ UNCLEAR | First-light results exist but spend verification requires provider invoices (empty directory). |
| Guardrail | 30-day spend ≤ $1,200; weekly overage alert at $300/week | 🔒 N/A | No invoices or cost data in repo. |

---

## 4. Definition of Done Verification

| # | Criterion | Status |
|---|-----------|--------|
| DoD-1 | Both provider accounts active, billed, alerts enabled | 🔒 |
| DoD-2 | Scripts working, version-controlled, documented | ✅ |
| DoD-3 | First-light and full-stack rehearsals completed | ⚠️ First-light exists; full-stack missing |
| DoD-4 | Day-before-demo reservations booked | 🔒 |
| DoD-5 | Runbook published | ✅ |
| DoD-6 | Spend on track within $1,200 cap | 🔒 |
| DoD-7 | Quantised Qwen weights staged and verified | 🔒 |
| DoD-8 | Legal sign-off on Qwen licence recorded | 🔒 |

---

## 5. Existing Artefacts Inventory

| Expected Artefact | Path | Exists? | Content Quality |
|-------------------|------|---------|-----------------|
| Spin-up script | `infra/gpu/spin-up.sh` | ✅ Yes (6.0 KB) | Executable, version-controlled |
| Tear-down script | `infra/gpu/tear-down.sh` | ✅ Yes (3.8 KB) | Executable, version-controlled |
| Usage log | `infra/gpu/usage.md` | ✅ Yes (822 B) | Scaffold/template |
| First-light results | `infra/gpu/first-light-results.md` | ✅ Yes (1.8 KB) | Needs manual content verification |
| Full-stack rehearsal results | `infra/gpu/full-stack-rehearsal-*.md` | ❌ No | — |
| Runbook | `docs/runbooks/gpu-rehearsal.md` | ✅ Yes (5.3 KB) | Authored |
| Provider invoices | `legal/finance/innoboost-2026/` | ⚠️ Dir exists, empty | — |
| Alerts log | `infra/gpu/alerts.log` | ✅ Yes (283 B) | Scaffold |
| Quantised weights | Internal artefact store | 🔒 Unknown | — |

---

## 6. Summary & Recommendation

This task has good code-side coverage (scripts, runbook, first-light results template). But the task is inherently about **real GPU infrastructure** — spinning up actual H100 instances, loading actual model weights, measuring actual latency/accuracy, tracking actual costs. Most verification requires access to external provider accounts and cannot be done from the repo.

**Recommended status**: `in_progress` — scripts authored, but full-stack rehearsal and cost verification are outstanding.

**To move to `done`**: Execute actual GPU rehearsals, capture real results, upload provider invoices, complete full-stack rehearsal, and get legal sign-off on Qwen licence.
