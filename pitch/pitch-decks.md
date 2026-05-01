# BU-Specific 15-Minute Pitch Decks
## P12-T01

---

# Deck A — SVFC Consumer Finance (SF9)

## Slide 1 — The Problem (In Their Own Words)

> "Our loan officers spend 3+ hours daily compiling reports. SQL knowledge is concentrated in 2 analysts. When they're on leave, the whole team is blocked."

**The reality**: SVFC has rich operational data but no self-service way for business users to access it. Every insight requires a DBA, and the backlog is growing.

## Slide 2 — The Solution

**CyberSkill**: A conversational data assistant that turns natural language into verified SQL — with human review, audit trails, and compliance baked in.

*One sentence*: "Ask a question in Vietnamese, get a verified answer with citations, in under 5 seconds."

## Slide 3 — Live Demo (5 min)

```
Scene 1: Loan officer asks "NPL ratio by province for Q1"
  → SQL generated → Results displayed with chart + citation
  → Confidence: 89% → Auto-served ✅

Scene 2: Branch manager asks "Show me all customers with credit score < 500"
  → Sensitivity: RESTRICTED → Routed to HITL ⚠️
  → Reviewer approves → Results displayed with audit trail

Scene 3: "Compare this quarter vs last quarter for Ho Chi Minh branch"
  → Multi-step query → Time-series chart → Citation: loan_portfolio table
```

## Slide 4 — Architecture (1 min)

```
User → API GW → NL→SQL Engine → Policy Check → Execute
                     ↓                  ↓
                  LLM API         Sensitivity Tier
                     ↓                  ↓
                  Cache            HITL Queue (if needed)
                     ↓
              Citation Engine → Audit Trail
```

## Slide 5 — Governance

| Concern | Answer |
|---|---|
| Human oversight | HITL mandatory for credit scores, cross-customer queries |
| Audit trail | Hash-chained, 7-year retention, immutable |
| Data sensitivity | 4-tier classification, consent ledger |
| Regulatory | PDPL, Cybersecurity Law, SBV TT-09/TT-50 mapped |
| Accuracy | 91% gold-set accuracy, 2% regression gate |

## Slide 6 — References

| Engagement | Domain | Key Result |
|---|---|---|
| Engagement A | Financial data assistant | 94% report time reduction |
| Engagement B | Compliance analytics | 99.7% query time reduction |

*Reference calls available with 48h notice.*

## Slide 7 — 12-Week PoC Plan

| Week | Milestone | Kill Criterion |
|---|---|---|
| 1-2 | Data onboarding + schema mapping | Schema incompatible → kill |
| 3-4 | First 30 queries live with HITL | Accuracy < 80% → kill |
| 5-8 | Full BU rollout (pilot team) | SLA breach rate > 10% → kill |
| 9-10 | Eval harness tuned for SVFC | Accuracy < 90% → kill |
| 11-12 | Production readiness review | Compliance gap → kill |
| **Graduation** | Accuracy ≥ 95%, SLA adherence ≥ 95%, 0 security incidents |

## Slide 8 — Commercial Path

| Phase | Duration | Indicative Scope |
|---|---|---|
| PoC | 12 weeks | 1 BU, synthetic + masked data |
| Pilot | 6 months | 1 BU, production data |
| Scale | 12+ months | Multi-BU, full deployment |

*Pricing: per-BU subscription model. Details in SOW.*

## Slide 9 — Team

| Role | Person | Commitment |
|---|---|---|
| Tech Lead / Founder | Stephen Cheng | 100% dedicated |
| Backend Engineer | [TBD] | 100% dedicated |
| Frontend Engineer | [TBD] | 80% dedicated |
| ML Engineer | [TBD] | 60% dedicated |
| DevOps/Security | [TBD] | 40% dedicated |
| PM (Korean-speaking) | [TBD] | 100% dedicated |

## Slide 10 — What We Need From Shinhan

| Item | Detail | Timeline |
|---|---|---|
| Data | Masked loan_portfolio schema + 1K rows | Week -2 |
| Sponsor | Named BU sponsor for weekly demos | Week 0 |
| Access | VPN + staging environment | Week 0 |
| Reviewers | 2 HITL reviewers from SVFC | Week 2 |
| Feedback | Weekly 30-min feedback session | Ongoing |

---

# Deck B — Bank HO (SB5)

*Same 10-slide structure. Key differences:*

| Slide | SVFC → Bank Adaptation |
|---|---|
| Slide 1 | "Compliance officers spend days manually cross-referencing SBV reports" |
| Slide 3 | Demo: treasury query → AML-flagged query (HITL mandatory) → regulatory report generation |
| Slide 5 | Emphasis: ALL regulated data → HITL, senior reviewer for AML, 20-min SLA |
| Slide 7 | Kill: Any compliance gap at week 5. Graduation: SBV audit readiness confirmed |
| Slide 10 | Need: SBV reporting gateway access, AML screening platform schema |

---

# Deck C — Securities (SS1)

*Same 10-slide structure. Key differences:*

| Slide | SVFC → Securities Adaptation |
|---|---|
| Slide 1 | "Research analysts wait 2-3 days for a DBA to run a portfolio query" |
| Slide 3 | Demo: portfolio summary → live market data query → **live-coding: build backtest dashboard in 10 min** |
| Slide 5 | Emphasis: Speed + cost. Cost dashboard shown. Vibe-coding capability highlighted |
| Slide 7 | Kill: Build velocity < 1 feature/week. Graduation: 3 tools graduated from vibe-coding |
| Slide 10 | Need: Trading platform API access, portfolio management schema, research database |
