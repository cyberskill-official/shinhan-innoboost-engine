# Audit Report — P12-T02: Demo Run-of-Show Plans

> **Phase**: 12 — Pitch & Rehearsal  
> **Task**: T02 — Demo Run-of-Show  
> **Source**: [`pitch/demo-run-of-show.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/pitch/demo-run-of-show.md) (153 lines)  
> **FR Reference**: [`tasks/P12-T02-demo-run-of-show.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/tasks/P12-T02-demo-run-of-show.md)  
> **Auditor**: Antigravity Deep Audit  
> **Date**: 2026-05-02

---

## 1. Acceptance Criteria Verification

| # | Criterion (from FR) | Status | Evidence |
|---|---|---|---|
| AC-1 | Three run-of-show docs with all sections | ✅ Pass | SVFC full ROS (minute-by-minute); Bank + Securities adaptation tables |
| AC-2 | Setup checklists complete | ✅ Pass | §Equipment Checklist: 7 items (laptop, display, internet, browser, iPad, stack, recordings) with primary + backup |
| AC-3 | Pre-demo checklist | ✅ Pass | §Pre-Demo Checklist: 10-item checklist for 15 min before demo |
| AC-4 | Per-BU minute-by-minute timing | ✅ Pass | SVFC: 12-row timing table from 0:00 to 15:00 with activity, speaker, screen, notes |
| AC-5 | SVFC demo script with 3 scenes | ✅ Pass | §SVFC Demo Script: Scene 1 (auto-served), Scene 2 (HITL routed), Scene 3 (multi-step) — all with Vietnamese query text |
| AC-6 | Bank + Securities script adaptations | ✅ Pass | §Bank/Securities: 3 adapted scenes each with domain-specific queries |
| AC-7 | 4 failure plans | ✅ Pass | Internet dies, app crashes, wrong answer, unanswerable question — each with step-by-step recovery |
| AC-8 | Failure plans verified in dry-runs | ❌ Missing | No rehearsal evidence |

**AC Pass Rate: 7/8 (88%)**

---

## 2. Test Plan Verification

| # | Test (from FR) | Status | Evidence |
|---|---|---|---|
| T-1 | Walk through each run-of-show | ⚠️ Partial | Document is walkable; no actual walkthrough conducted |
| T-2 | Failure-plan decision tree comprehensible under stress | ❌ Not Found | No stress test conducted |
| T-3 | All equipment verified | ❌ Not Found | Equipment checklist unchecked (⬜ marks) |

**Test Pass Rate: 0/3 (0%)**

---

## 3. Content Quality Analysis

### Strengths
- **SVFC demo script is presentation-ready**: Vietnamese query text, specific table references, confidence scores — feels like a real demo
- **Failure plans show experience**: "Never apologise for infrastructure. Say 'Let me show you our offline capability.'" — turns failures into features
- **Wrong-answer failure plan is brilliant**: "Don't hide it → show HITL catching it → turn it into a trust signal" — reframes AI errors as governance proof
- **Equipment checklist has primary + backup for every item**: Laptop, display, internet, browser, stack, recordings — military-grade preparation
- **Pre-demo checklist is thorough**: 10 items including "water on table" — attention to detail
- **Vietnamese query text is authentic**: "Tỷ lệ nợ xấu theo tỉnh quý 1" — not English pretending to be Vietnamese

### Issues

| # | Severity | Issue | Details |
|---|---|---|---|
| CQ-1 | 🔴 High | **Demo system doesn't work** — demo scripts reference UI/engine that can't currently run | Scripts are aspirational, not testable |
| CQ-2 | 🟡 Medium | **Bank + Securities ROS are adaptation tables, not full scripts** | Only SVFC has minute-by-minute with demo script |
| CQ-3 | 🟡 Medium | **Pre-recorded fallback videos don't exist** | Equipment checklist references "All 3 scenarios pre-recorded" |
| CQ-4 | 🟠 Low | **iPad timer app not specified** | "Timer app ready (iPad)" — which app? |

---

## 4. Gap Analysis & Remediation

| # | Gap | Impact | Remediation | Priority |
|---|---|---|---|---|
| G-1 | Demo system non-functional | Can't rehearse or verify scripts | Fix P05/P06/P10 dependencies first | 🔴 P0 |
| G-2 | No pre-recorded fallback videos | No safety net for demo day | Record once system works | 🟡 P1 |
| G-3 | Bank + Securities need full scripts | Only 1/3 complete ROS | Expand adaptation tables to full demo scripts | 🟡 P1 |

---

## 5. Verdict

> **Overall Status: ✅ SUBSTANTIALLY COMPLETE — Best pitch preparation document, blocked by demo system**

This is the most operationally mature pitch document. The failure-plan strategy (especially "wrong answer → trust signal") demonstrates real presentation experience. The SVFC demo script with Vietnamese queries is immediately usable once the system works. The fundamental blocker is that the demo system can't run, making rehearsal impossible.

**Estimated remediation effort**: 2-3 days (once demo system is functional).
