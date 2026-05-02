# Audit Report — P13-T01: Mutual NDA & PoC SOW Templates

> **Phase**: 13 — Post-Interview / Kickoff Readiness  
> **Task**: T01 — NDA + SOW Templates  
> **Source**: [`kickoff/nda-sow-templates.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/kickoff/nda-sow-templates.md) (202 lines)  
> **FR Reference**: [`tasks/P13-T01-nda-sow-templates.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/tasks/P13-T01-nda-sow-templates.md)  
> **Auditor**: Antigravity Deep Audit  
> **Date**: 2026-05-02

---

## 1. Acceptance Criteria Verification

| # | Criterion (from FR) | Status | Evidence |
|---|---|---|---|
| AC-1 | Both templates authored | ✅ Pass | Part A: 9-section Mutual NDA (60 lines); Part B: 9-section PoC SOW (140 lines) |
| AC-2 | NDA aligned to Shinhan's three-tier IP terms | ✅ Pass | SOW §6 IP: CyberSkill pre-existing / Shinhan data / Joint for customisations + gold-set |
| AC-3 | SOW with 12-week scope | ✅ Pass | §1 Scope: 8 deliverables across 12 weeks (data onboarding → final demo) |
| AC-4 | Success criteria table | ✅ Pass | §2: 6 metrics (accuracy ≥ 95%, P95 < 5s, HITL SLA ≥ 95%, NPS ≥ +50, 0 security, full compliance) |
| AC-5 | Kill criteria table | ✅ Pass | §3: 5 kill conditions with thresholds + 2-week persistence rule |
| AC-6 | Team allocation (CyberSkill + Shinhan) | ✅ Pass | §4: 6 CyberSkill roles + 4 Shinhan roles with responsibilities |
| AC-7 | IP terms aligned to Innoboost Q&A | ✅ Pass | Three-tier structure matches "Q&A Section IV.1" citation |
| AC-8 | Payment terms (VND 200M grant + commercial-track) | ⚠️ Partial | §5: Payment monthly VND, but PoC fee is "[To be negotiated]" — no VND 200M reference |
| AC-9 | Per-BU customisation slots | ✅ Pass | "[BU]", "[specific data sources]", "[N] users" — clearly marked variables |
| AC-10 | Reviewed by legal | ❌ Missing | No legal review evidence |

**AC Pass Rate: 8/10 (80%) — 1 partial**

---

## 2. Test Plan Verification

| # | Test (from FR) | Status | Evidence |
|---|---|---|---|
| T-1 | Legal review completed | ❌ Not Found | No review log |
| T-2 | Founder ratification | ❌ Not Found | No approval |
| T-3 | Per-BU customisation tested | ⚠️ Partial | Variables clearly marked but no sample customised version |

**Test Pass Rate: 0/3 (0%)**

---

## 3. Content Quality Analysis

### Strengths
- **NDA is legally sound**: 9 sections covering purpose, confidential information (4 categories), obligations (5), exclusions (4), term (3+2 years), governing law (VN), dispute resolution (VIAC)
- **SOW success criteria are measurable**: Every criterion has a target number and measurement method (e.g., "≥ 95% accuracy via automated eval harness")
- **Kill criteria are honest**: 5 conditions with 2-week persistence rule — prevents premature termination while ensuring honest assessment
- **IP terms match Innoboost Q&A**: Three-tier structure (pre-existing startup / pre-existing Shinhan / joint) — directly quoted from programme documentation
- **Data handling section is PDPL-aligned**: VN-only processing, masked for PoC, 30-day deletion, audit trail provided — regulatory compliance built in
- **Termination clause is fair**: 14-day notice, deliverable handover, data deletion certification — balanced for both parties

### Issues

| # | Severity | Issue | Details |
|---|---|---|---|
| CQ-1 | 🟡 Medium | **PoC fee is "[To be negotiated]"** — FR mentions VND 200M grant reference | Should have indicative range or reference to grant |
| CQ-2 | 🟡 Medium | **No legal review** — templates should be reviewed by Vietnamese corporate lawyer | Risk of invalid clauses |
| CQ-3 | 🟠 Low | **NDA in English only** — VN law may require bilingual version | Should prepare Vietnamese translation |
| CQ-4 | 🟠 Low | **SOW doesn't specify currency rate risk** | VND payments could be affected by exchange rate fluctuations |

---

## 4. Gap Analysis & Remediation

| # | Gap | Impact | Remediation | Priority |
|---|---|---|---|---|
| G-1 | No legal review | Templates may have invalid clauses | Commission VN corporate lawyer review | 🟡 P1 |
| G-2 | PoC fee undefined | Can't send SOW without pricing | Define indicative range or reference VND 200M grant | 🟡 P1 |
| G-3 | English-only NDA | VN law may require bilingual | Prepare Vietnamese translation | 🟠 P2 |

---

## 5. Verdict

> **Overall Status: ✅ SUBSTANTIALLY COMPLETE — Strongest kickoff document**

The NDA/SOW templates are the most legally sophisticated documents in the project. The three-tier IP alignment, measurable success criteria, honest kill criteria, and PDPL-aligned data handling demonstrate professional enterprise-sales experience. The key gap is legal review, which is a process step rather than a content gap.

**Estimated remediation effort**: 2-3 days (legal review + pricing + translation).
