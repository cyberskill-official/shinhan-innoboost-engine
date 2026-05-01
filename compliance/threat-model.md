# Threat Model — STRIDE per Service + LLM-Specific
## P08-T05

---

## 1. System Overview (Attack Surface)

```
┌─────────────────────────────────────────────────────┐
│                   End User (Browser)                │
│                        │                            │
│                   ┌────▼────┐                       │
│                   │   UI    │ ← XSS, CSRF, Injection│
│                   └────┬────┘                       │
│                        │                            │
│                   ┌────▼────┐                       │
│                   │  API GW │ ← AuthN bypass, DoS   │
│                   └────┬────┘                       │
│            ┌───────────┼───────────┐                │
│       ┌────▼────┐ ┌────▼────┐ ┌───▼────┐          │
│       │ NL→SQL  │ │ Policy  │ │ HITL   │           │
│       │ Engine  │ │ Engine  │ │ Queue  │           │
│       └────┬────┘ └────┬────┘ └───┬────┘          │
│            │           │          │                 │
│       ┌────▼────┐ ┌────▼────┐ ┌───▼────┐          │
│       │   LLM   │ │ Consent │ │ Audit  │           │
│       │   API   │ │ Ledger  │ │  Log   │           │
│       └─────────┘ └─────────┘ └────────┘           │
│                        │                            │
│                   ┌────▼────┐                       │
│                   │ Database│ ← SQLi, Exfiltration  │
│                   └─────────┘                       │
└─────────────────────────────────────────────────────┘
```

---

## 2. STRIDE Analysis per Service

### 2.1 UI Layer

| Threat | Category | Risk | Mitigation | Status |
|---|---|---|---|---|
| Cross-site scripting (XSS) | Tampering | Medium | CSP headers, input sanitisation, React auto-escaping | ✅ |
| CSRF on state-changing actions | Tampering | Medium | SameSite cookies, CSRF tokens | ✅ |
| Clickjacking | Spoofing | Low | X-Frame-Options: DENY | ✅ |
| Session hijacking | Spoofing | Medium | Secure, HttpOnly, SameSite cookies; short TTL | ✅ |

### 2.2 API Gateway

| Threat | Category | Risk | Mitigation | Status |
|---|---|---|---|---|
| Authentication bypass | Spoofing | High | OIDC/SSO, JWT validation, MFA for admin | ✅ |
| Rate limiting bypass | DoS | Medium | Token bucket rate limiter (per user + IP) | ✅ |
| Parameter tampering | Tampering | Medium | Input validation, schema enforcement | ✅ |
| Enumeration attacks | Information Disclosure | Low | Generic error messages, rate limiting | ✅ |

### 2.3 NL→SQL Engine

| Threat | Category | Risk | Mitigation | Status |
|---|---|---|---|---|
| SQL injection via NL prompt | Tampering | **Critical** | Parameterised queries, no raw interpolation (P02-T01) | ✅ |
| Privilege escalation via SQL | Elevation | High | Read-only DB user, table-level RBAC | ✅ |
| Data exfiltration via crafted queries | Information Disclosure | High | Sensitivity tiers + consent checks (P02-T07) | ✅ |
| Malformed SQL crashing DB | DoS | Medium | Query timeout (30s), statement complexity limit | ✅ |

### 2.4 Policy Engine

| Threat | Category | Risk | Mitigation | Status |
|---|---|---|---|---|
| Policy bypass | Elevation | High | Policy evaluation before SQL execution, deny-by-default | ✅ |
| Role manipulation | Elevation | Medium | Server-side role from JWT, no client-side role | ✅ |
| Consent ledger tampering | Tampering | High | Hash-chained audit log, WORM storage | ✅ |

### 2.5 HITL Queue

| Threat | Category | Risk | Mitigation | Status |
|---|---|---|---|---|
| Reviewer impersonation | Spoofing | High | Reviewer-specific authentication, session binding | ✅ |
| Answer modification in transit | Tampering | Medium | TLS 1.3, diff tracking, hash verification | ✅ |
| SLA manipulation | Tampering | Low | Server-side timestamps, tamper-evident SLA log | ✅ |
| Queue flooding | DoS | Medium | Rate limiting on question submission | ✅ |

### 2.6 Audit Log

| Threat | Category | Risk | Mitigation | Status |
|---|---|---|---|---|
| Log tampering | Tampering | **Critical** | Hash-chain integrity (P02-T09), verifyChain() | ✅ |
| Log deletion | Repudiation | High | WORM-like append-only, backup to separate store | ✅ |
| Insufficient logging | Repudiation | Medium | All actions logged; coverage verified in tests | ✅ |

### 2.7 Database

| Threat | Category | Risk | Mitigation | Status |
|---|---|---|---|---|
| Direct SQL injection | Tampering | Critical | Parameterised queries only, no ORM raw mode | ✅ |
| Unauthorised data access | Info Disclosure | High | Read-only service account, row-level security | ✅ |
| Backup exfiltration | Info Disclosure | Medium | Encrypted backups, access-controlled | ✅ |

---

## 3. LLM-Specific Threats

| Threat | Description | Risk | Mitigation | Status |
|---|---|---|---|---|
| **Prompt injection** | Attacker crafts input to override system prompt | **Critical** | 3-layer prompt guard (P02-T06): input sanitiser → system-prompt anchor → output validator | ✅ |
| **System prompt leakage** | User tricks LLM into revealing system prompt | High | System prompt never in user-visible context; output filter blocks reflection | ✅ |
| **Training data extraction** | User queries to extract memorised training data | Medium | CyberSkill uses API-only (no fine-tuning on sensitive data); PII scrubbed | ✅ |
| **Model output exfiltration** | Generated answers leak to unauthorised users | High | Session-bound responses, RBAC on query history | ✅ |
| **Adversarial inputs** | Inputs designed to cause incorrect SQL or hallucination | High | Confidence scoring → HITL for low confidence; eval harness regression tests | ✅ |
| **Jailbreak / DAN** | Bypass content safety via role-play | Medium | Input filter + system-prompt reinforcement + adversarial test corpus (P04-T02) | ✅ |
| **Indirect injection** | Injected instructions in data returned by SQL | Medium | Output sanitiser strips instruction-like patterns from DB results | ✅ |
| **Token exhaustion** | Crafted long inputs to exhaust context window | Low | Input length limit (4K tokens), cost tracking | ✅ |

---

## 4. Risk Summary

| Risk Level | Count | Examples |
|---|---|---|
| Critical | 3 | SQLi via NL, prompt injection, audit log tampering |
| High | 8 | AuthN bypass, privilege escalation, data exfiltration |
| Medium | 10 | CSRF, rate limiting, parameter tampering |
| Low | 4 | Clickjacking, enumeration, token exhaustion |

**All critical and high risks have mitigations in place.**

---

## 5. Residual Risk Acceptance

| Risk | Residual Level | Accepted By | Rationale |
|---|---|---|---|
| Novel prompt injection variant | Low | Engineering Lead | Adversarial corpus continuously updated; HITL catches misses |
| Zero-day in dependency | Low | CTO | Automated scanning + rapid patching SLA (24h) |
| Social engineering of reviewer | Low | Compliance Officer | Reviewer training + dual-approval for regulated tier |
