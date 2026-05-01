# AI Doctrine — Three BU Lenses
## P11-T02

> Different BUs care about different things. Speak their language.

---

## 1. Bank HO Lens: Governance

### Doctrine: "AI serves the institution, not the other way around."

**What Bank HO cares about:**
- Regulatory compliance above all else
- Audit trail completeness and immutability
- Data sovereignty (everything stays in Vietnam)
- Human oversight on every decision that touches money or regulation
- SBV reporting readiness

**How CyberSkill answers this:**

| Concern | CyberSkill Response |
|---|---|
| "Will this pass SBV audit?" | Hash-chained audit log, 7-year retention, TT-09/TT-50 conformance mapped |
| "Who approved this answer?" | HITL reviewer queue with named reviewer, timestamp, diff |
| "Where does our data go?" | VN-only (ap-southeast-1 or on-prem Viettel IDC), no cross-border PII |
| "What if the AI is wrong?" | 3-tier confidence scoring → HITL for low confidence → mandatory review for regulated data |
| "Can we prove compliance?" | ISO 27001/42001 mapped, SOC 2 readiness at 87%, PDPL mapping complete |

**Key message for Bank HO:**
> "We built the compliance infrastructure before we built the AI. The audit trail, the review queue, the regulatory mappings — all in place before the first query runs."

---

## 2. Securities (SS1) Lens: Velocity

### Doctrine: "Ship fast, ship often, kill what doesn't work."

**What Securities cares about:**
- Speed of delivery (spec → demo in days)
- Ability to prototype and iterate
- Developer experience and tooling
- Live-coding capability for custom workflows
- Cost per question (they'll run more queries than anyone)

**How CyberSkill answers this:**

| Concern | CyberSkill Response |
|---|---|
| "How fast can you build X?" | 3 live-build scenarios, each completable in 10 minutes |
| "What if the prototype fails?" | Kill criteria in every spec, 50% kill rate (healthy exploration) |
| "Can we customise for our workflows?" | Vibe-coding starter kit with 3 presets (broker-tooling, research-desk, vanilla) |
| "How much does it cost to run?" | Cost dashboard with per-question tracking, cache savings, anomaly detection |
| "Can our developers extend this?" | Claude Code workspace with MCPs, primitives library, financial-domain types |

**Key message for Securities:**
> "We don't just deliver features. We deliver a system that lets you build features yourself — and we've proven it works by building three demos in 10 minutes each."

---

## 3. SVFC Lens: Accuracy

### Doctrine: "Every answer must be right, every answer must be explainable."

**What SVFC cares about:**
- Answer accuracy for consumer finance data
- Explainability (how did the AI reach this answer?)
- Customer data sensitivity (KYC, credit scores)
- False positive/negative rates on data queries
- Training and onboarding for non-technical staff

**How CyberSkill answers this:**

| Concern | CyberSkill Response |
|---|---|
| "How accurate is it?" | 91% accuracy on gold-set (30 consumer finance questions), eval harness runs on every deployment |
| "Can we trust the answer?" | Every answer has citations (column + value + lineage), "Show Me How" drawer shows SQL and reasoning |
| "What about sensitive data?" | 4-tier sensitivity classification, consent ledger, PDPL-compliant access controls |
| "What if accuracy drops?" | 2% regression gate blocks deployment, eval alerts trigger within 1 minute |
| "Can our loan officers use this?" | Conversational UI (no SQL needed), Vietnamese language, 15-minute time-to-first-insight |

**Key message for SVFC:**
> "We measure accuracy obsessively. 90 gold-set questions, evaluated on every deployment. If accuracy drops below 95%, the deployment is automatically blocked. Your loan officers get answers they can trust and explain to customers."

---

## Cross-BU Summary

| BU | Primary Value | Secondary Value | Key Proof Point |
|---|---|---|---|
| 🏦 Bank HO | Governance | Compliance | Hash-chained audit + 7 regulatory mappings |
| 📈 Securities | Velocity | Cost Efficiency | 3 live demos in 10 min + cost dashboard |
| 💳 SVFC | Accuracy | Explainability | 91% gold-set + citation engine |
