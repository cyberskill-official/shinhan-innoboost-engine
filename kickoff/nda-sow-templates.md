# Mutual NDA & PoC SOW Templates
## P13-T01

---

# Part A — Mutual Non-Disclosure Agreement

## MUTUAL NON-DISCLOSURE AGREEMENT

**Between:**
1. **CyberSkill JSC** ("Disclosing Party" / "Receiving Party"), a company incorporated in Vietnam, with registered address at [Address], Ho Chi Minh City, Vietnam.
2. **Shinhan Vietnam Finance Company Limited / Shinhan Bank Vietnam / Shinhan Securities Vietnam** ("Disclosing Party" / "Receiving Party"), [as applicable].

**Effective Date**: [Date]

---

### 1. Purpose
The parties wish to explore a potential business relationship relating to the deployment of CyberSkill's AI-powered data assistant platform ("CyberSkill Platform") within Shinhan's Vietnamese operations (the "Purpose").

### 2. Confidential Information
"Confidential Information" means any information disclosed by either party, including but not limited to:
- Technical specifications, source code, algorithms, and architecture
- Business plans, financial data, customer data, and operational data
- Regulatory filings, compliance documentation, and security assessments
- Employee information, pricing, and commercial terms

### 3. Obligations
Each party agrees to:
- Use Confidential Information solely for the Purpose
- Restrict access to personnel with a need-to-know
- Apply at least the same degree of care as for its own confidential information (but not less than reasonable care)
- Not reverse-engineer any software or systems disclosed
- Promptly notify the other party of any unauthorised disclosure

### 4. Exclusions
Confidential Information does not include information that:
- Is or becomes publicly available through no fault of the receiving party
- Was independently developed without use of Confidential Information
- Was lawfully received from a third party without restriction
- Was already known to the receiving party prior to disclosure

### 5. Term
This Agreement remains in effect for **3 years** from the Effective Date. Obligations of confidentiality survive termination for **2 additional years**.

### 6. Return / Destruction
Upon termination or written request, each party shall return or destroy all Confidential Information within **30 days** and certify destruction in writing.

### 7. Regulatory Compliance
Both parties acknowledge that Confidential Information may be subject to Vietnamese data protection laws (PDPL Decree 13/2023) and banking regulations (SBV circulars). Each party shall comply with applicable laws in handling Confidential Information.

### 8. Governing Law
This Agreement is governed by the laws of **Vietnam**. Disputes shall be resolved through arbitration at the **Vietnam International Arbitration Centre (VIAC)**.

### 9. Signatures

| Party | Name | Title | Signature | Date |
|---|---|---|---|---|
| CyberSkill JSC | _________________ | _________________ | _________________ | _________________ |
| Shinhan [Entity] | _________________ | _________________ | _________________ | _________________ |

---

# Part B — PoC Statement of Work (SOW) Template

## STATEMENT OF WORK — Proof of Concept

**SOW Reference**: CyberSkill-Shinhan-PoC-[BU]-001  
**BU**: [SVFC / Bank HO / Securities]  
**Effective Date**: [Date]  
**Duration**: 12 weeks

---

### 1. Scope

CyberSkill will deploy and configure its AI-powered data assistant platform for the [BU] business unit, enabling natural-language querying of [specific data sources] with human-in-the-loop review, audit trails, and compliance controls.

#### In Scope
| # | Deliverable | Week |
|---|---|---|
| 1 | Data onboarding + schema mapping | 1-2 |
| 2 | Engine configuration for [BU] domain | 2-3 |
| 3 | HITL reviewer queue setup + training | 3-4 |
| 4 | First 30 queries live with HITL | 3-4 |
| 5 | Pilot rollout to [N] users | 5-8 |
| 6 | Eval harness tuned for [BU] | 9-10 |
| 7 | Production readiness review | 11-12 |
| 8 | Final demo + assessment report | 12 |

#### Out of Scope
- Multi-BU deployment (separate SOW per BU)
- Integration with third-party systems not specified
- Data migration or ETL pipeline development
- Hardware procurement (Shinhan responsibility)

---

### 2. Success Criteria

| Metric | Target | Measurement |
|---|---|---|
| Query accuracy (gold-set) | ≥ 95% | Automated eval harness |
| P95 latency | < 5 seconds | Prometheus metrics |
| HITL SLA adherence | ≥ 95% | System dashboard |
| User satisfaction (NPS) | ≥ +50 | Survey at week 10 |
| Security incidents | 0 | Incident log |
| Regulatory compliance | Full | Compliance checklist |

---

### 3. Kill Criteria

The PoC will be terminated early if any of the following persist for 2+ consecutive weeks:

| Condition | Threshold |
|---|---|
| Accuracy below minimum | < 80% at week 4, < 90% at week 8 |
| SLA breach rate | > 10% |
| Security incident | Any SEV-1 or SEV-2 |
| Data quality insufficient | Schema incompatible after week 2 |
| Stakeholder disengagement | No feedback for 2 consecutive weeks |

---

### 4. Team & Responsibilities

| Party | Responsibility |
|---|---|
| **CyberSkill** | Platform deployment, configuration, support, training, weekly demos |
| **Shinhan** | Data access (masked), infrastructure, HITL reviewers, weekly feedback, named sponsor |

### CyberSkill Team

| Role | FTE | Commitment |
|---|---|---|
| Tech Lead / Founder | 1.0 | 100% |
| Backend Engineer | 1.0 | 100% |
| Frontend Engineer | 0.8 | 80% |
| ML Engineer | 0.6 | 60% |
| DevOps/Security | 0.4 | 40% |
| PM (Korean-speaking) | 1.0 | 100% |

### Shinhan Team (Required)

| Role | Responsibility |
|---|---|
| BU Sponsor (VP+) | Weekly decision gates, escalation |
| 2 HITL Reviewers | Review queue processing |
| 1 IT Liaison | VPN, infrastructure, data access |
| 1 Compliance Officer | Regulatory sign-off |

---

### 5. Commercial Terms

| Item | Detail |
|---|---|
| PoC Fee | [To be negotiated] |
| Payment | Monthly in arrears |
| Currency | VND |
| Expenses | Travel and accommodation at cost |

---

### 6. Intellectual Property

| Category | Ownership |
|---|---|
| CyberSkill Platform (pre-existing) | CyberSkill |
| Shinhan data | Shinhan |
| Configurations & customisations (PoC) | Joint — CyberSkill retains right to generalise patterns; Shinhan retains domain-specific configurations |
| Gold-set questions | Joint |
| Models trained on Shinhan data | Joint — subject to data deletion upon termination |

---

### 7. Data Handling

- All data processing within Vietnam
- Masked/synthetic data for PoC phase
- Production data only after compliance review at week 5
- Data deletion within 30 days of PoC termination
- Audit trail provided to Shinhan upon request

---

### 8. Termination

Either party may terminate with **14 days written notice**. Upon termination:
1. CyberSkill delivers all PoC artefacts to Shinhan
2. Shinhan data deleted within 30 days (certified)
3. Assessment report provided regardless of outcome

---

### 9. Signatures

| Party | Name | Title | Signature | Date |
|---|---|---|---|---|
| CyberSkill JSC | _________________ | _________________ | _________________ | _________________ |
| Shinhan [Entity] | _________________ | _________________ | _________________ | _________________ |
