# VN Cybersecurity Law Conformance Mapping
## P08-T02 — Law on Cybersecurity (No. 24/2018/QH14) + Decree 53/2022

> Effective: 1 Jan 2019 (Law), updated provisions effective 1 Jul 2026

---

## 1. Data Localisation (Art. 26)

| Requirement | CyberSkill Position | Evidence |
|---|---|---|
| Store data of Vietnamese users in Vietnam | ✅ All data in AWS ap-southeast-1 (Ho Chi Minh City) or on-prem | Deployment config, AWS region lock |
| Maintain a branch/representative office in VN | ✅ CyberSkill registered in Vietnam | Business registration certificate |
| Data collected from VN users stays in VN | ✅ No cross-border transfer of PII | PDPL mapping §5 |

---

## 2. Incident Reporting (Art. 23, Decree 53 Art. 12)

| Obligation | SLA | CyberSkill Implementation |
|---|---|---|
| Report to MoPS (A05) | 24 hours from detection | IR runbook §3 — automated alert to compliance team |
| Report to MoIC (VNCERT) | 24 hours from detection | IR runbook §3 — parallel notification |
| Preserve evidence | Minimum 6 months | Audit log (7-year retention), security logs (180 days) |
| Cooperate with investigation | On request | Legal counsel + DPO designated as liaisons |
| Notify affected users | Without undue delay | Notification service (P06-T05) — email + in-app |

### Incident Classification

| Severity | Description | Reporting SLA | Internal SLA |
|---|---|---|---|
| Critical | Data breach, system compromise | 24 hours to regulators | 1 hour internal |
| High | Prompt injection success, data exfiltration attempt | 24 hours to regulators | 4 hours internal |
| Medium | Anomalous query patterns, SLA breach | Internal only | 24 hours internal |
| Low | Failed injection attempt, minor config drift | Internal log only | 72 hours internal |

---

## 3. Lawful Interception Interface (Art. 26(2))

| Aspect | Position |
|---|---|
| Interface readiness | Architecture supports audit-log export by regulator request |
| Data accessible | Query logs, audit trail, user metadata (no raw banking data — that's Shinhan's) |
| Process | Court order → Legal counsel validates → DPO authorises → Engineering exports |
| Encryption | Data at rest encrypted (AES-256); decryption keys held by CyberSkill DPO |
| Scope limitation | Export limited to scope of court order; no bulk export |

---

## 4. Security Audit Cadence (Decree 53 Art. 20)

| Audit Type | Frequency | Scope | Owner |
|---|---|---|---|
| Internal security review | Quarterly | All systems, access controls, logs | Engineering + Security |
| External penetration test | Annually | Full-stack (P08-T06) | Third-party vendor |
| Compliance self-assessment | Semi-annually | All regulatory mappings | Compliance Officer |
| HITL calibration review | Quarterly | Reviewer consistency, drift | P06-T03 |
| Access review | Quarterly | User accounts, RBAC roles, API keys | Admin + Security |

---

## 5. System Information Security (Art. 19-21)

| Control | Implementation | Status |
|---|---|---|
| Access control | RBAC with sensitivity tiers (P02-T03) | ✅ Implemented |
| Authentication | SSO / OIDC integration point | 🔧 Ready for Shinhan IdP |
| Encryption in transit | TLS 1.3 mandatory | ✅ Configured |
| Encryption at rest | AES-256 for databases, audit logs | ✅ Configured |
| Logging and monitoring | Structured logs, security alerts (P06-T05) | ✅ Implemented |
| Malware prevention | Container scanning, dependency audit | ✅ CI pipeline |
| Backup and recovery | Daily backups, tested BCP | ✅ P08-T08 |
| Vulnerability management | Automated scanning (pnpm audit, Trivy) | ✅ CI pipeline |

---

## 6. Key Personnel Requirements

| Requirement | CyberSkill Position |
|---|---|
| Designated cybersecurity officer | CTO / Engineering Lead (interim) |
| Staff security training | Annual training + onboarding module |
| Background checks for sensitive roles | ✅ For squad members accessing banking data |
| Security clearance (if applicable) | Not required for this tier |
