# SBV Banking-IT Regulatory Conformance Mapping
## P08-T03 — State Bank of Vietnam Circulars

> Key circulars: TT-09/2020/TT-NHNN (IT operations), TT-50/2024/TT-NHNN (IT risk management)

---

## 1. Circular 09/2020/TT-NHNN — IT Operations in Banking

### Applicable Requirements

| Article | Requirement | CyberSkill Mapping | Status |
|---|---|---|---|
| Art. 5 | IT governance framework | ADR governance (P00-T01), architectural decision records | ✅ |
| Art. 8 | System development lifecycle | 10-phase build plan with gates | ✅ |
| Art. 10 | Change management | Git-based version control, PR review, CI/CD | ✅ |
| Art. 12 | Access control management | RBAC with 5 seed roles, sensitivity tiers (P02-T03) | ✅ |
| Art. 14 | Logging and monitoring | Hash-chained audit log (P02-T09), structured logging | ✅ |
| Art. 15 | Data backup and recovery | Daily backups, BCP runbook (P08-T08) | ✅ |
| Art. 16 | Incident management | IR runbook with SLAs (P08-T08) | ✅ |
| Art. 18 | IT outsourcing risk | Vendor questionnaires pre-filled (P08-T07) | ✅ |
| Art. 20 | Business continuity | BCP with tested procedures (P08-T08) | ✅ |
| Art. 22 | IT audit | Annual external audit schedule | 📋 Planned |

### Data Retention (Art. 14)
- **Audit logs**: 7 years (aligned with CyberSkill retention policy)
- **Transaction logs**: 10 years (Shinhan's responsibility — CyberSkill only stores query metadata)
- **Access logs**: 5 years minimum

---

## 2. Circular 50/2024/TT-NHNN — IT Risk Management

| Area | Requirement | CyberSkill Mapping | Status |
|---|---|---|---|
| IT risk assessment | Periodic risk assessment with documented methodology | Threat model (P08-T05) | ✅ |
| Third-party risk | Due diligence for IT service providers | SIG Lite + CAIQ pre-filled (P08-T07) | ✅ |
| Cloud usage | Risk assessment for cloud services | Deployment targets (P10) — on-prem option available | ✅ |
| AI/ML risk | Risk controls for AI-powered systems | ISO 42001 mapping (P08-T04), prompt guard (P02-T06) | ✅ |
| Data classification | Classify data by sensitivity | 4-tier sensitivity classification (P02-T07) | ✅ |
| Testing requirements | Regular security testing | Annual pentest (P08-T06), eval harness (P04) | ✅ |

---

## 3. Incident Reporting to SBV (Art. 16, TT-09)

| Incident Type | Report To | SLA | CyberSkill Process |
|---|---|---|---|
| IT system failure (Grade A) | SBV IT Department | 2 hours | Auto-alert → compliance → SBV liaison |
| IT system failure (Grade B) | SBV IT Department | 24 hours | Alert → compliance review → report |
| Security breach | SBV + MoPS | 24 hours | IR runbook §3 |
| Data breach | SBV + MoPS + MoIC | 24 hours | IR runbook §3 + user notification |

---

## 4. Outsourcing Risk Assessment (Art. 18)

Since CyberSkill is a **technology vendor** to Shinhan Bank, the following applies:

| Requirement | Documentation |
|---|---|
| Vendor due diligence | SIG Lite questionnaire (P08-T07) |
| Service level agreement | Template with availability, latency, support SLAs |
| Data handling agreement | PDPL-compliant DPA (P08-T01) |
| Exit strategy | Data portability plan, knowledge transfer process |
| Concentration risk | Multi-cloud / on-prem deployment options (P10) |
| Ongoing monitoring | Quarterly performance reviews, SLA dashboards |

---

## 5. AI-Specific Considerations

| Area | SBV Expectation | CyberSkill Implementation |
|---|---|---|
| Explainability | AI decisions must be explainable | Citation engine (P02-T04), "Show Me How" drawer |
| Human oversight | Human review for high-risk decisions | HITL queue (P06) — mandatory for regulated data |
| Bias monitoring | Monitor for discriminatory outcomes | Eval harness (P04) with per-BU accuracy tracking |
| Model risk | Document model limitations | Confidence scoring (P02-T05) with explicit low-confidence routing |
| Audit trail | All AI decisions auditable | Hash-chained audit log (P02-T09) |
