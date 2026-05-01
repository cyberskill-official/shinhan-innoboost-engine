# Pre-Filled Vendor Questionnaires
## P08-T07 — SIG Lite + CAIQ + Shinhan-Specific

---

## 1. SIG Lite (Standardized Information Gathering)

### A. Company Profile

| Question | Response |
|---|---|
| Legal entity name | CyberSkill JSC |
| Jurisdiction | Vietnam |
| Number of employees | [TBD] |
| Years in business | [TBD] |
| Primary service | AI-powered data assistant for financial services |
| Data centres | AWS ap-southeast-1 (Ho Chi Minh City) + on-prem option |

### B. Information Security

| # | Question | Response |
|---|---|---|
| B.1 | Do you have an information security policy? | Yes — governance framework (ADR-based) |
| B.2 | Do you have a designated security officer? | Yes — CTO (interim), DPO designated |
| B.3 | Do you conduct risk assessments? | Yes — STRIDE threat model, DPIA, quarterly reviews |
| B.4 | Do you have incident response procedures? | Yes — IR runbook with 24h SLA |
| B.5 | Do you encrypt data at rest? | Yes — AES-256 |
| B.6 | Do you encrypt data in transit? | Yes — TLS 1.3 |
| B.7 | Do you conduct penetration testing? | Yes — annually (vendor engagement in progress) |
| B.8 | Do you have access control mechanisms? | Yes — RBAC with 5 roles + 4 sensitivity tiers |
| B.9 | Do you have business continuity plans? | Yes — BCP runbook with tested procedures |
| B.10 | Do you log and monitor security events? | Yes — hash-chained audit log, security alerts |

### C. Data Privacy

| # | Question | Response |
|---|---|---|
| C.1 | Do you comply with local data protection laws? | Yes — PDPL (Decree 13/2023) conformance mapping completed |
| C.2 | Where is data stored? | Vietnam only (no cross-border transfer) |
| C.3 | Do you have a data retention policy? | Yes — 7 years for audit, 90 days for queries |
| C.4 | Can you support data subject access requests? | Yes — self-service export, 72h SLA |
| C.5 | Do you have a DPA template? | Yes — available for review |

### D. Third-Party Management

| # | Question | Response |
|---|---|---|
| D.1 | Do you use sub-processors? | Yes — LLM API provider (prompts scrubbed of PII) |
| D.2 | Do you assess third-party risk? | Yes — DPA in place, no PII sent to LLM |
| D.3 | Can you provide SOC 2 report? | In progress — 87% readiness score |

---

## 2. CAIQ (Consensus Assessments Initiative Questionnaire)

### Selected High-Priority Controls

| Control ID | Domain | Question | Response |
|---|---|---|---|
| AIS-01 | Application Security | Are secure coding practices followed? | Yes — input validation, parameterised SQL, prompt guard |
| AIS-04 | Application Security | Is vulnerability management in place? | Yes — automated scanning (pnpm audit, Trivy), 24h critical SLA |
| BCR-01 | Business Continuity | Are BC plans documented and tested? | Yes — BCP runbook with annual testing |
| CCC-01 | Change Control | Are changes reviewed before deployment? | Yes — PR review, CI/CD gates |
| DCS-01 | Data Classification | Is data classified by sensitivity? | Yes — 4-tier: public, internal, restricted, regulated |
| DSI-01 | Data Security | Are encryption standards defined? | Yes — AES-256 at rest, TLS 1.3 in transit |
| EKM-01 | Encryption & Key Mgmt | Are encryption keys managed securely? | Yes — KMS-managed, rotated quarterly |
| GRM-01 | Governance | Is there an information security governance framework? | Yes — ADR-based governance with phase gates |
| HRS-01 | Human Resources | Are background checks conducted? | Yes — for squad members accessing banking data |
| IAM-01 | Identity & Access | Are access control policies defined? | Yes — RBAC with 5 roles, sensitivity tiers |
| IVS-01 | Infrastructure | Are infrastructure security controls in place? | Yes — VPC isolation, TLS, firewall rules |
| LOG-01 | Logging & Monitoring | Are security events logged and monitored? | Yes — hash-chained audit log, real-time alerts |
| SEF-01 | Security Incident | Are incident response procedures defined? | Yes — IR runbook with regulator notification SLAs |
| STA-01 | Supply Chain | Are supply chain risks assessed? | Yes — vendor questionnaires, DPA requirements |
| TVM-01 | Threat & Vulnerability | Is threat modeling performed? | Yes — STRIDE per service + LLM-specific threats |

---

## 3. Shinhan-Specific Questionnaire (Anticipated)

| # | Likely Question | Prepared Response |
|---|---|---|
| S.1 | How does the AI system ensure accuracy? | Confidence scoring (3-tier) + citation verification + HITL for low confidence |
| S.2 | How is data classified? | 4-tier sensitivity model aligned with Shinhan's internal classification |
| S.3 | Can the system operate on-premises? | Yes — laptop (docker compose), cloud, or on-prem deployment targets |
| S.4 | How are prompt injection attacks prevented? | 3-layer prompt guard: input sanitiser → system-prompt anchor → output validator |
| S.5 | What audit trail exists? | Hash-chained, tamper-evident audit log with 7-year retention |
| S.6 | How is human oversight implemented? | HITL reviewer queue with SLA tracking, mandatory for restricted/regulated data |
| S.7 | What compliance certifications do you hold? | ISO 27001 + ISO 42001 mapped (87% SOC 2 readiness) |
| S.8 | How is data kept in Vietnam? | All infrastructure in AWS ap-southeast-1, no cross-border transfer |
| S.9 | What is the incident response time? | 1h internal, 24h regulator notification |
| S.10 | How do you handle model updates? | Eval harness regression testing before deployment, 2% threshold gate |
