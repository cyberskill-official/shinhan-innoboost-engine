# Audit Report — P12-T01: BU-Specific 15-Minute Pitch Decks

> **Phase**: 12 — Pitch & Rehearsal  
> **Task**: T01 — Pitch Decks  
> **Source**: [`pitch/pitch-decks.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/pitch/pitch-decks.md) (134 lines)  
> **FR Reference**: [`tasks/P12-T01-pitch-decks.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/tasks/P12-T01-pitch-decks.md)  
> **Auditor**: Antigravity Deep Audit  
> **Date**: 2026-05-02

---

## 1. Acceptance Criteria Verification

| # | Criterion (from FR) | Status | Evidence |
|---|---|---|---|
| AC-1 | Three decks (EN + VI) with all 10 slides + speaker notes | ⚠️ Partial | SVFC has full 10-slide script; Bank + Securities are 5-row delta tables only; no VI; no speaker notes |
| AC-2 | Design-polished per BU | ❌ Missing | All content is in markdown; no PPTX/Google Slides with visual design |
| AC-3 | Each deck delivers in 13–14 min | ⚠️ Partial | Timing references in run-of-show (P12-T02), not in deck itself |
| AC-4 | Rehearsed | ❌ Missing | No rehearsal evidence (depends on P12-T05) |
| AC-5 | Kill/graduation criteria per BU | ✅ Pass | SVFC Slide 7: 5-gate kill criteria + graduation threshold |
| AC-6 | "What We Need From Shinhan" with specific asks + timelines | ✅ Pass | Slide 10: 5 asks (data, sponsor, access, reviewers, feedback) with Week -2/0/2 timelines |
| AC-7 | Per-BU demo scenarios | ✅ Pass | SVFC: 3 demo scenes; Bank: 3 adapted scenes; Securities: 3 adapted scenes with live-coding |
| AC-8 | Commercial path slide | ✅ Pass | Slide 8: PoC (12w) → Pilot (6m) → Scale (12m+) with per-BU subscription model |
| AC-9 | Team slide with FTE commitments | ✅ Pass | Slide 9: 6 roles, FTE allocations (100% to 40%), [TBD] names acknowledged |

**AC Pass Rate: 5/9 (56%) — 2 partial, 2 missing**

---

## 2. Test Plan Verification

| # | Test (from FR) | Status | Evidence |
|---|---|---|---|
| T-1 | Per-deck timing rehearsed | ❌ Not Found | No rehearsal conducted |
| T-2 | Vietnamese rendering verified | ❌ Not Found | No Vietnamese version |
| T-3 | Demo scenarios tested on live system | ❌ Not Found | Demo system not functional (P05/P06 dependency) |
| T-4 | Projector-readability tested | ❌ Not Found | No visual slides exist |

**Test Pass Rate: 0/4 (0%)**

---

## 3. Content Quality Analysis

### Strengths
- **SVFC deck is comprehensive and compelling**: 10 slides with full narrative from "problem in their own words" through specific asks
- **Kill criteria are honest and powerful**: "Schema incompatible → kill at week 2" — shows integrity, not sales spin
- **Demo scenarios are BU-differentiated**: SVFC (loan NPL), Bank (AML flagging), Securities (live-coding backtest) — not just rebranded
- **"What We Need From Shinhan" slide is specific and actionable**: 5 concrete asks with timelines — respects their time
- **Commercial path is realistic**: 3-phase PoC → Pilot → Scale with per-BU subscription

### Issues

| # | Severity | Issue | Details |
|---|---|---|---|
| CQ-1 | 🔴 High | **No visual slide deck (PPTX/Google Slides)** — can't present markdown in a boardroom | Entire purpose of this task is a presentable deck |
| CQ-2 | 🔴 High | **Bank + Securities decks are delta tables, not full scripts** | Can't present 5 rows of differences |
| CQ-3 | 🟡 Medium | **No Vietnamese version** — FR requires bilingual (EN + VI) | Missing for VN audience |
| CQ-4 | 🟡 Medium | **No speaker notes** — FR requires speaker notes per slide | Content exists but not formatted as notes |
| CQ-5 | 🟡 Medium | **Team slide has 5 [TBD] members** — "who's building this?" has no answer | Credibility gap |
| CQ-6 | 🟠 Low | **No slide transitions or visual hierarchy defined** | Design brief not specified |

---

## 4. Gap Analysis & Remediation

| # | Gap | Impact | Remediation | Priority |
|---|---|---|---|---|
| G-1 | No PPTX/Slides visual deck | Can't present to Shinhan | Design and produce PPTX with brand identity | 🔴 P0 |
| G-2 | Bank + Securities are delta-only | Only 1 of 3 decks is complete | Expand to full 10-slide scripts | 🔴 P0 |
| G-3 | No Vietnamese version | Can't present to VN-only stakeholders | Translate all 3 decks | 🟡 P1 |
| G-4 | 5 [TBD] team members | Team credibility gap | Fill with actual names (P11-T06 dependency) | 🟡 P1 |

---

## 5. Verdict

> **Overall Status: ⚠️ PARTIAL — Excellent SVFC script, but only 1 of 3 decks is complete and none are visual**

The SVFC pitch script is one of the strongest single documents in the project — the kill-criteria honesty and specific asks demonstrate genuine pitch experience. However, the core deliverable (3 visual, presentable slide decks) doesn't exist. Bank and Securities are adaptation notes, not full scripts. This task needs significant production work to become pitch-ready.

**Estimated remediation effort**: 5-7 days (expand 2 decks + design all 3 in PPTX + translate).
