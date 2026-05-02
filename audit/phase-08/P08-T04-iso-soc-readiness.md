# Audit Report — P08-T04: ISO 27001 + ISO 42001 + SOC 2 Control Registry

> **Phase**: 08 — Compliance & Security  
> **Task**: T04 — ISO/SOC Readiness  
> **Source**: [`compliance/iso-soc2-controls.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/compliance/iso-soc2-controls.md) (122 lines)  
> **FR Reference**: [`tasks/P08-T04-iso-soc-readiness.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/tasks/P08-T04-iso-soc-readiness.md)  
> **Auditor**: Antigravity Deep Audit  
> **Date**: 2026-05-02

---

## 1. Acceptance Criteria Verification

| # | Criterion (from FR) | Status | Evidence |
|---|---|---|---|
| AC-1 | ISO 27001:2022 full Annex A mapping | ⚠️ Partial | §1: 20 of 93 Annex A controls mapped; FR requires full coverage |
| AC-2 | ISO 42001:2023 full Annex A mapping | ✅ Pass | §2: All clauses (4-10) + 6 AI-specific Annex controls mapped |
| AC-3 | SOC 2 Type II Trust Services mapping | ✅ Pass | §3: 19 criteria across 5 TSC categories (Security, Availability, PI, Confidentiality, Privacy) |
| AC-4 | Per-control: task reference + evidence + status | ✅ Pass | Every control has CyberSkill implementation + status (✅/🔧/📋) |
| AC-5 | Cross-mapping (controls common across standards) | ❌ Missing | FR requires `compliance/iso-soc/CROSS_MAP.md`; not created |
| AC-6 | Audit-readiness summary (% in-place/partial/roadmap) | ⚠️ Partial | SOC 2 has "87% readiness score (31/36)"; ISO 27001/42001 lack rollup |
| AC-7 | Admin UI dashboard surface | ❌ Missing | FR requires readiness heatmap in P05-T05 admin console |
| AC-8 | Quarterly review scheduled | ❌ Missing | No schedule |
| AC-9 | Squad briefed | ❌ Missing | No briefing evidence |
| AC-10 | ≥ 60% controls in-place | ✅ Pass | ISO 27001: 18/20 mapped ✅; ISO 42001: all ✅; SOC 2: 87% |

**AC Pass Rate: 4/10 (40%) — 2 partial, 4 missing**

---

## 2. Test Plan Verification

| # | Test (from FR) | Status | Evidence |
|---|---|---|---|
| T-1 | Mapping completeness — all controls covered | ⚠️ Partial | ISO 27001 has only 20/93 controls |
| T-2 | Evidence pointers resolve to real artefacts | ⚠️ Partial | Pointers like "(P02-T03)" exist; no file paths verified |
| T-3 | Readiness summary computes correctly | ⚠️ Partial | SOC 2 has 87%; ISO standards lack rollup |
| T-4 | Cross-mapping accurate | ❌ Not Found | No cross-mapping document |
| T-5 | Admin UI dashboard renders | ❌ Not Found | No dashboard implementation |

**Test Pass Rate: 0/5 (0%)**

---

## 3. Success Metrics Evaluation

| Metric | Target | Actual | Status |
|---|---|---|---|
| All 3 standards mapped with full coverage | 100% | ISO 27001: ~22%; ISO 42001: ~100%; SOC 2: ~100% | ⚠️ Partial |
| ≥ 60% controls in-place | 60% | ISO 42001: 100%; SOC 2: 87% | ✅ Met (2 of 3) |
| Cross-mapping published | Published | Not created | ❌ Not Met |
| Admin dashboard live | Live | Not implemented | ❌ Not Met |

---

## 4. Definition of Done Evaluation

| # | DoD Item | Status | Notes |
|---|---|---|---|
| D-1 | ISO 27001 full Annex A mapped | ❌ Missing | Only 20/93 controls |
| D-2 | ISO 42001 mapped | ✅ Done | All clauses + AI annex |
| D-3 | SOC 2 TSC mapped | ✅ Done | 19 criteria with readiness |
| D-4 | Cross-mapping | ❌ Missing | Not created |
| D-5 | Readiness summary | ⚠️ Partial | SOC 2 only |
| D-6 | Admin dashboard | ❌ Missing | Not implemented |
| D-7 | Squad briefed | ❌ Missing | Not completed |

**DoD Pass Rate: 2/7 (29%)**

---

## 5. Content Quality Analysis

### Strengths
- **ISO 42001 is the standout**: Complete clause-by-clause mapping (4.1-10.2) + all 6 AI-specific Annex controls — this is the differentiator for Shinhan's AI appetite
- **SOC 2 readiness score**: "87% (31/36 criteria ready, 5 partial)" — concrete and credible
- **Status indicators**: 3-level (✅ In place / 🔧 Ready / 📋 Roadmap) — operationally actionable
- **Strategic commentary**: "ISO 42001 is the wedge — few VN startups have a credible AI-management-system story" — commercially aware

### Issues

| # | Severity | Issue | Details |
|---|---|---|---|
| CQ-1 | 🔴 High | ISO 27001 only has 20/93 Annex A controls — appears cherry-picked | §1 |
| CQ-2 | 🟡 Medium | No cross-mapping document — duplicate controls across standards not identified | FR explicit requirement |
| CQ-3 | 🟡 Medium | SOC 2 "CC5.2 Service account management — 🔧 Partial" — gap not documented | §3 |
| CQ-4 | 🟡 Medium | SOC 2 "CC6.3 User removal — 🔧 Partial" — deprovisioning workflow incomplete | §3 |
| CQ-5 | 🟠 Low | "A.6.3 Security awareness training — 📋 Roadmap" — only roadmap item; needs timeline | §1 |

---

## 6. Gap Analysis & Remediation

| # | Gap | Impact | Remediation | Priority |
|---|---|---|---|---|
| G-1 | ISO 27001 incomplete (20/93 controls) | Procurement teams will notice gaps | Map remaining ~73 Annex A controls | 🔴 P0 |
| G-2 | No cross-mapping | Duplicate work in implementation | Create `CROSS_MAP.md` identifying ~30% overlap | 🟡 P1 |
| G-3 | No per-standard readiness rollup for ISO | Cannot quote readiness % to Shinhan | Compute in-place/partial/roadmap for ISO 27001 + 42001 | 🟡 P1 |
| G-4 | No admin dashboard surface | Readiness not visible to stakeholders | Implement heatmap widget in P05-T05 | 🟠 P2 |
| G-5 | SOC 2 partial items (CC5.2, CC6.3) undocumented | Gaps without remediation plan | Document gap + remediation + target date | 🟡 P1 |
| G-6 | Quarterly review not scheduled | Standards updates missed | Schedule aligned with other compliance reviews | 🟡 P1 |

---

## 7. Verdict

> **Overall Status: ⚠️ PARTIAL — ISO 42001 + SOC 2 strong, ISO 27001 incomplete**

The ISO 42001 mapping is a genuine competitive differentiator — complete and well-framed. SOC 2 coverage is solid at 87% readiness. However, ISO 27001 is significantly incomplete (20/93 controls), which undermines the overall registry's credibility with procurement teams. The cross-mapping document required by the FR is missing, and the admin dashboard surface is not implemented.

**Estimated remediation effort**: 5-7 days (ISO 27001 completion is the bulk of the work).
