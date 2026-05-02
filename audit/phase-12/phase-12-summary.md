# Phase 12 Audit Summary — Pitch & Rehearsal

> **Phase**: 12  
> **Scope**: Pitch Decks, Demo Run-of-Show, Live-Coding Kit, FAQ, Rehearsal Plan  
> **Date**: 2026-05-02  
> **Source Files**: 5 documents in `pitch/` (697 total lines)  
> **Individual Reports**: [T01](P12-T01-pitch-decks.md) · [T02](P12-T02-demo-run-of-show.md) · [T03](P12-T03-live-coding-kit.md) · [T04](P12-T04-faq-doc.md) · [T05](P12-T05-rehearsal-cadence.md)

---

## 1. Phase Overview

| Task | Component | Source Lines | AC Pass | Verdict |
|---|---|---|---|---|
| P12-T01 | 3 BU-Specific Pitch Decks | 134 | 7/9 (78%) | ⚠️ Partial |
| P12-T02 | 3 Demo Run-of-Show Plans | 153 | 7/8 (88%) | ✅ Substantial |
| P12-T03 | SS1 Live-Coding Kit | 143 | 5/8 (63%) | ⚠️ Partial |
| P12-T04 | FAQ Document | 141 | 8/8 (100%) | ✅ Complete |
| P12-T05 | Rehearsal Cadence | 126 | 5/7 (71%) | ⚠️ Partial |
| **Totals** | | **697** | **32/40 (80%)** | **73%** |

---

## 2. Per-Task Audit

### P12-T01 — 3 BU-Specific Pitch Decks ⚠️

| # | Finding | Status |
|---|---|---|
| AC-1 | SVFC deck — 10 slides with full script | ✅ Complete: problem → solution → demo → architecture → governance → references → PoC plan → commercial → team → asks |
| AC-2 | Bank HO deck — 10-slide adaptation | ⚠️ Partial | Only delta table (5 slide changes); no full script |
| AC-3 | Securities deck — 10-slide adaptation | ⚠️ Partial | Only delta table (5 slide changes); no full script |
| AC-4 | Kill/graduation criteria per BU | ✅ Pass | SVFC Slide 7: 5-week kill thresholds + graduation criteria |
| AC-5 | Team slide with commitments | ✅ Pass | Slide 9: 6 roles with FTE commitments |
| AC-6 | "What we need from Shinhan" slide | ✅ Pass | Slide 10: 5 specific asks with timelines |
| AC-7 | Decks are presentation-ready (visual format) | ❌ Missing | Content is in markdown, not PPTX/Google Slides |
| Issue | Bank + Securities decks are adaptation notes, not full decks | ⚠️ Need full scripts like SVFC |
| Issue | Team members are [TBD] | ⚠️ 5 of 6 team members unnamed |

### P12-T02 — 3 Demo Run-of-Show Plans ✅

| # | Finding | Status |
|---|---|---|
| AC-1 | Minute-by-minute timing for each BU | ✅ Full timing for 15-min presentation |
| AC-2 | 4 failure plans (demo freeze, API timeout, wrong answer, mic failure) | ✅ Each with trigger, recovery action, time cost |
| AC-3 | Assigned roles (presenter, operator, backup) | ✅ Clear role assignments |
| AC-4 | Per-BU scenario differentiation | ✅ SVFC (loan queries), Bank (AML/treasury), Securities (trading + live-coding) |
| Issue | No actual demo environment exists | ⚠️ Plans reference system that can't currently run |

### P12-T03 — SS1 Live-Coding Kit ⚠️

| # | Finding | Status |
|---|---|---|
| AC-1 | 3 clipboard prompt sets | ✅ Portfolio Summariser, Regulatory Checker, Backtest Dashboard |
| AC-2 | Timing guide per prompt sequence | ✅ Step-by-step with time allocations |
| AC-3 | Recording checklist for fallback videos | ✅ Pre-recording procedure documented |
| AC-4 | Prompts tested and verified | ❌ Missing | No evidence of actual testing; starter kit can't run (P07 gaps) |
| AC-5 | Fallback video recordings created | ❌ Missing | No actual recordings exist |
| Issue | Live-coding depends on P07 starter kit which is incomplete | ⚠️ Dependency chain broken |

### P12-T04 — FAQ Document ✅

| # | Finding | Status |
|---|---|---|
| AC-1 | 12 anticipated questions | ✅ Covering accuracy, hallucination, security, cost, compliance, team, timeline |
| AC-2 | Substantive answers (not generic) | ✅ CyberSkill-specific with evidence pointers |
| AC-3 | 4 curveball strategies | ✅ Bridge, reframe, evidence, commitment |
| AC-4 | Evidence pointers to compliance dossier | ✅ References P08 documents |
| Verdict | **Best FAQ doc** — immediately usable | ✅ Ready for rehearsal |

### P12-T05 — Rehearsal Cadence ⚠️

| # | Finding | Status |
|---|---|---|
| AC-1 | 3 rehearsals planned (internal, friendly external, time-pressured) | ✅ Clear objectives per rehearsal |
| AC-2 | 7 stress scenarios | ✅ Technical failure, hostile question, time overrun, etc. |
| AC-3 | Final calibration session | ✅ Post-rehearsal 3 adjustments |
| AC-4 | Rehearsal dates scheduled | ❌ Missing | All dates [TBD] |
| AC-5 | Rehearsals actually conducted | ❌ Missing | No rehearsals run |

---

## 3. Cross-Cutting Findings

### Strengths
1. **FAQ document is immediately usable**: 12 questions with substantive, evidence-backed answers
2. **Run-of-show plans are operationally precise**: Minute-by-minute timing with 4 failure contingencies
3. **SVFC pitch deck has full script**: 10-slide structure with demo scenarios, governance table, kill criteria
4. **Curveball strategies show experience**: Bridge-reframe-evidence-commitment pattern

### Issues
| # | Issue | Affected Tasks | Priority |
|---|---|---|---|
| X-1 | **No presentation-ready slides (PPTX/Slides)** | T01 | 🔴 P0 |
| X-2 | **Bank + Securities decks are delta-only, not full scripts** | T01 | 🟡 P1 |
| X-3 | **No fallback video recordings** | T03 | 🟡 P1 |
| X-4 | **No rehearsals conducted; dates TBD** | T05 | 🟡 P1 |
| X-5 | **Demo depends on non-functional system** | T02, T03 | 🔴 P0 |
| X-6 | **Team members are [TBD] in pitch deck** | T01 | 🟡 P1 |

---

## 4. Remediation Roadmap

| # | Action | Est. Effort | Priority |
|---|---|---|---|
| 1 | Convert SVFC deck to PPTX/Google Slides with visual design | 2-3 days | 🔴 P0 |
| 2 | Author full Bank + Securities deck scripts | 1-2 days | 🟡 P1 |
| 3 | Record 3 fallback videos once demo system works | 1-2 days | 🟡 P1 |
| 4 | Schedule and conduct 3 rehearsals | 3 days | 🟡 P1 |
| 5 | Fill team [TBD] slots | 0.5 day | 🟡 P1 |

**Total estimated remediation: 7-10 days (depends on demo system availability)**

---

## 5. Phase Verdict

> **Phase 12 Overall: ⚠️ PARTIAL — Strong content, needs visual production and rehearsal execution**
>
> Phase 12 has excellent narrative content: the FAQ is immediately usable, the run-of-show plans are operationally precise, and the SVFC pitch script is compelling. The critical gap is format conversion (markdown → visual slides) and the dependency on a functional demo system for rehearsals and fallback recordings. The Bank/Securities decks need to be expanded from adaptation notes to full scripts.
