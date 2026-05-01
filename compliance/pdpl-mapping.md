# PDPL Conformance Mapping & Consent-Flow Documentation
## P08-T01 — Vietnam Personal Data Protection Law (PDPL)

> **Status**: Pre-interview compliance readiness document.
> Walk into the interview with this already done.

---

## 1. Applicable Framework

**Vietnam PDPL** (Decree 13/2023/ND-CP, effective 1 July 2023)
- Applies to all processing of personal data of Vietnamese data subjects
- CyberSkill processes employee data (user queries) and may process customer-adjacent data through BU datasets

---

## 2. Consent Purposes

| Purpose ID | Purpose | Legal Basis | Data Categories | Retention |
|---|---|---|---|---|
| CP-01 | NL→SQL query processing | Legitimate interest (employer-employee) | Query text, user ID, role | 90 days (rotating) |
| CP-02 | Answer generation and caching | Legitimate interest | Generated SQL, answer text | 30 days (cache TTL) |
| CP-03 | HITL reviewer assignment | Legitimate interest (operational) | User ID, query, answer | Until review complete + 90 days |
| CP-04 | Audit logging | Legal obligation (banking regs) | All query metadata | 7 years (banking) |
| CP-05 | Evaluation and quality improvement | Legitimate interest | Anonymised query patterns | 1 year |
| CP-06 | Security monitoring (prompt injection) | Legal obligation + legitimate interest | Query text, IP, user agent | 180 days |

---

## 3. Data Subject Rights Flow

| Right | PDPL Article | Implementation | SLA |
|---|---|---|---|
| Right to be informed | Art. 16 | Privacy notice at first login + annual refresh | At login |
| Right of access | Art. 17 | Self-service export via admin console | 72 hours |
| Right to correction | Art. 18 | Request via compliance officer | 72 hours |
| Right to deletion | Art. 19 | Anonymisation of query history; audit log entries retained (legal obligation) | 30 days |
| Right to restrict processing | Art. 20 | Disable user account; existing data frozen | 24 hours |
| Right to data portability | Art. 21 | JSON export of user's query history | 72 hours |
| Right to object | Art. 22 | Opt-out of CP-05 (eval/improvement); other purposes cannot be opted out | 24 hours |

### Deletion vs Retention Conflict
- **Audit log entries** (CP-04) are retained for 7 years per banking regulations even if user requests deletion
- **Resolution**: Mark records as "deletion-requested" but retain under legal obligation exemption (Art. 19(3))
- **Documentation**: Retain deletion request receipt as evidence of compliance

---

## 4. Retention Policies

| Data Category | Retention Period | Justification | Disposal Method |
|---|---|---|---|
| Query text | 90 days | Operational troubleshooting | Cryptographic erasure |
| Generated SQL | 30 days (cache) | Performance | Cache eviction |
| Answers | 30 days (cache) | Performance | Cache eviction |
| Audit log entries | 7 years | Banking regulation (TT-09/2020) | Secure deletion after period |
| HITL review records | 7 years | Audit trail | Secure deletion after period |
| Evaluation data | 1 year | Quality improvement | Anonymisation + deletion |
| Security logs | 180 days | Incident investigation | Secure deletion |

---

## 5. Cross-Border Transfer Posture

| Aspect | Position |
|---|---|
| Data storage location | **Vietnam only** (AWS ap-southeast-1 or on-prem) |
| LLM API calls | Prompts sent to API provider; **no PII in prompts** (scrubbed by prompt guard) |
| Cross-border transfer | **Not required** — all data stays in VN |
| Transfer impact assessment | Not applicable (no transfer) |
| Standard contractual clauses | Not required |

### LLM Provider Data Handling
- All prompts are **scrubbed of PII** before sending to LLM API
- Query text is parameterised: column names and aggregation intent only
- No raw data values sent to LLM (values are in the SQL result, not the prompt)
- Provider data processing agreement (DPA) in place

---

## 6. Consent Collection Mechanism

```
┌─────────────────────────────────────────────┐
│          First Login Consent Flow           │
│                                             │
│  1. Display privacy notice (Art. 16)        │
│  2. Present consent purposes (CP-01..06)    │
│  3. Mandatory: CP-01, CP-04, CP-06          │
│     (cannot opt out — legal basis)          │
│  4. Optional: CP-05 (eval improvement)      │
│  5. Record consent in consent ledger        │
│     (P02-T07 module)                        │
│  6. Generate consent receipt (PDF)          │
│  7. Annual re-consent reminder              │
└─────────────────────────────────────────────┘
```

---

## 7. Data Protection Impact Assessment (DPIA)

| Risk | Likelihood | Impact | Mitigation | Residual Risk |
|---|---|---|---|---|
| PII in LLM prompts | Low | High | Prompt guard + PII scrubber | Low |
| Unauthorised access to query history | Medium | Medium | RBAC + sensitivity tiers | Low |
| Audit log tampering | Low | High | Hash-chain integrity + WORM storage | Very Low |
| Consent not recorded | Low | Medium | Consent ledger with receipt | Very Low |
| Retention period exceeded | Medium | Medium | Automated retention enforcer | Low |

---

## 8. Compliance Contacts

| Role | Responsibility |
|---|---|
| Data Protection Officer (DPO) | Overall PDPL compliance; liaison with MoPS |
| Compliance Officer | Day-to-day consent management; DSAR processing |
| Engineering Lead | Technical implementation of privacy controls |
| Legal Counsel | Regulatory interpretation; transfer assessments |
