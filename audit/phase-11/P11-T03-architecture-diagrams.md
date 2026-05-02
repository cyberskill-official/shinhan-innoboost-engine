# Audit Report — P11-T03: Architecture & Data-Flow Diagrams

> **Phase**: 11 — Trust & Reference Materials  
> **Task**: T03 — Architecture Diagrams  
> **Source**: [`trust/architecture-diagrams.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/trust/architecture-diagrams.md) (214 lines)  
> **FR Reference**: [`tasks/P11-T03-architecture-data-flow-diagrams.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/tasks/P11-T03-architecture-data-flow-diagrams.md)  
> **Auditor**: Antigravity Deep Audit  
> **Date**: 2026-05-02

---

## 1. Acceptance Criteria Verification

| # | Criterion (from FR) | Status | Evidence |
|---|---|---|---|
| AC-1 | All ~15 diagrams authored, polished, exported | ⚠️ Partial | 6 diagrams authored (cross-BU arch + 3 per-BU + SVFC data flow + sensitivity tiers); fewer than ~15 |
| AC-2 | Cross-BU shared engine architecture | ✅ Pass | §1: Full-stack ASCII diagram — UI shells → API GW → NL→SQL → LLM/Policy/Cache/Audit/HITL → Observability |
| AC-3 | Per-BU architecture with data sources | ✅ Pass | §2-4: SVFC (T24, Loan Mgmt, Credit Bureau), Bank (T24, Treasury, AML, SBV Gateway), Securities (HOSE/HNX, Portfolio, Research, Brokerage) |
| AC-4 | Data-flow diagrams showing full pipeline | ✅ Pass | §2 SVFC Data Flow: NL Parse → Policy Check → SQL Gen → Execute → Citation → Confidence → Serve |
| AC-5 | Data sensitivity tier diagram | ✅ Pass | §5: 4-tier diagram (Public → Internal → Restricted → Regulated) with HITL rules per tier |
| AC-6 | Diagrams exported as SVG/PNG | ❌ Missing | All diagrams are ASCII art in markdown; no rendered image exports |
| AC-7 | Per-BU data flow diagrams for Bank + Securities | ❌ Missing | Only SVFC has a step-by-step data flow; Bank and Securities have adaptation notes only |
| AC-8 | PDFs in place | ❌ Missing | No PDF exports |

**AC Pass Rate: 4/8 (50%) — 1 partial, 3 missing**

---

## 2. Test Plan Verification

| # | Test (from FR) | Status | Evidence |
|---|---|---|---|
| T-1 | Each diagram renders correctly | ⚠️ Partial | ASCII renders in markdown; not tested as SVG/PNG |
| T-2 | Data flow shows full NL→SQL pipeline | ✅ Pass | SVFC flow: 7-step pipeline fully documented |
| T-3 | PDFs include in pitch decks | ❌ Not Found | No PDFs or rendered exports |

**Test Pass Rate: 1/3 (33%)**

---

## 3. Content Quality Analysis

### Strengths
- **Cross-BU architecture diagram is comprehensive**: Shows all layers — UI, API GW, NL→SQL engine (6 internal stages), supporting services, observability
- **Per-BU architecture captures domain specifics**: Each BU shows its sensitivity tier, HITL mandatory rules, and real data source systems
- **SVFC data flow is exemplary**: 7-step walkthrough from Vietnamese natural language query to chart display — demo-ready
- **Sensitivity tier diagram is immediately usable**: 4 tiers with specific examples and HITL rules — auditor-friendly
- **Data sources are realistic**: T24, HOSE/HNX feeds, AML/CTF screening — shows domain knowledge

### Issues

| # | Severity | Issue | Details |
|---|---|---|---|
| CQ-1 | 🔴 High | **ASCII-only diagrams** — pitch decks need SVG/PNG renders | Can't project ASCII art in a professional presentation |
| CQ-2 | 🟡 Medium | **Bank + Securities missing step-by-step data flows** | Only SVFC has the 7-step walkthrough |
| CQ-3 | 🟡 Medium | **Fewer than ~15 diagrams** — FR targets ~15 (3 arch + 1 sensitivity + 3 data flow + threat overlays) | Only 6 authored |
| CQ-4 | 🟡 Medium | **No threat-overlay variants** — FR mentions "possibly threat overlay variants" | Not created |
| CQ-5 | 🟠 Low | **No C4 model notation** — enterprise architects may expect structured notation | ASCII is informal |

---

## 4. Gap Analysis & Remediation

| # | Gap | Impact | Remediation | Priority |
|---|---|---|---|---|
| G-1 | ASCII diagrams, no SVG/PNG | Can't use in pitch decks or printed dossier | Convert to Mermaid/draw.io → export SVG/PNG | 🔴 P0 |
| G-2 | Bank + Securities missing data flows | Incomplete per-BU documentation | Author 7-step data flow for Bank + Securities | 🟡 P1 |
| G-3 | Only 6 of ~15 diagrams created | Below FR target | Add remaining diagrams (threat overlays, deployment topology) | 🟡 P1 |
| G-4 | No PDF exports | Can't include in compliance dossier | Generate PDF from rendered diagrams | 🟠 P2 |

---

## 5. Verdict

> **Overall Status: ⚠️ PARTIAL — Strong architectural content, needs rendering and Bank/Securities data flows**

The cross-BU architecture and SVFC data flow are presentation-quality content trapped in ASCII format. The sensitivity tier diagram alone is worth converting to SVG — it's one of the clearest visual explanations of the HITL routing logic. Key gaps are format (ASCII → SVG) and completeness (missing Bank/Securities data flows).

**Estimated remediation effort**: 3-4 days.
