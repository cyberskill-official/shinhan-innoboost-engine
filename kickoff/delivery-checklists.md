# Data & Infrastructure Delivery Checklists
## P13-T04

---

## Part A — Data Delivery Checklist

### What CyberSkill Needs From Shinhan

| # | Item | Format | Sensitivity | Deadline | Owner | Status |
|---|---|---|---|---|---|---|
| 1 | Database schema (DDL) for target tables | `.sql` file | Internal | Week -2 | Shinhan IT | ⬜ |
| 2 | Sample data (1,000 rows per table, masked) | CSV or SQL dump | Masked | Week -2 | Shinhan IT | ⬜ |
| 3 | Data dictionary (column descriptions, types, business meaning) | Excel or PDF | Internal | Week -2 | Shinhan BU | ⬜ |
| 4 | Table relationships / foreign keys | ERD diagram or DDL | Internal | Week -1 | Shinhan IT | ⬜ |
| 5 | Read-only database credentials (staging) | Secure transfer | Restricted | Week 0 | Shinhan IT | ⬜ |
| 6 | List of 30 "most common questions" for eval | Text file | Internal | Week -1 | Shinhan BU | ⬜ |
| 7 | Expected answers for eval questions | Excel (question → SQL → expected result) | Internal | Week 1 | Shinhan BU | ⬜ |

### Data Requirements

| Requirement | Detail |
|---|---|
| **Masking** | All PII must be masked for PoC phase (names, IDs, phone numbers, addresses) |
| **Freshness** | Daily refresh preferred; weekly acceptable |
| **Volume** | 1K rows minimum for initial onboarding; full volume for pilot (week 5+) |
| **Encoding** | UTF-8 (Vietnamese characters supported) |
| **Schema stability** | Notify CyberSkill of schema changes 48h before deployment |

### Data Masking Approach

| Data Type | Masking Method | Example |
|---|---|---|
| Customer name | Random Vietnamese name | Nguyễn Văn A → Trần Thị B |
| Phone number | Random 10-digit | 0901234567 → 0987654321 |
| National ID (CCCD) | Hash + prefix | 001234567890 → MASKED_001 |
| Address | Province only | 123 Nguyễn Huệ, Q1, HCM → Ho Chi Minh |
| Account number | Random with same format | 0120123456789 → 0120987654321 |
| Financial values | Unchanged | 500,000,000 VND → 500,000,000 VND |

---

## Part B — Infrastructure Delivery Checklist

### What CyberSkill Needs From Shinhan

| # | Item | Specification | Deadline | Owner | Status |
|---|---|---|---|---|---|
| 1 | VPN access to Shinhan staging network | OpenVPN or IPSec | Week -1 | Shinhan IT | ⬜ |
| 2 | Staging Kubernetes namespace or VM | 4 vCPU, 16GB RAM, 100GB SSD | Week -1 | Shinhan IT | ⬜ |
| 3 | Database connectivity (staging) | PostgreSQL 14+ or compatible | Week 0 | Shinhan IT | ⬜ |
| 4 | DNS entry for staging URL | `[bu]-staging.shinhan.vn` | Week 0 | Shinhan IT | ⬜ |
| 5 | TLS certificate (staging) | Wildcard or per-BU | Week 0 | Shinhan IT | ⬜ |
| 6 | Outbound HTTPS access (LLM API) | Port 443 to api.openai.com, api.anthropic.com | Week 0 | Shinhan IT | ⬜ |
| 7 | OIDC/SAML integration point | Keycloak or ADFS | Week 1 | Shinhan IT | ⬜ |
| 8 | GPU server (optional, for local LLM) | NVIDIA T4/A10, 16GB+ VRAM | Week 2 | Shinhan IT | ⬜ |

### If Air-Gapped (No Internet)

| # | Additional Item | Detail |
|---|---|---|
| 9 | Container registry access | CyberSkill provides OCI images on USB/tarball |
| 10 | Local DNS | Internal resolution for service hostnames |
| 11 | NTP server | Time sync for audit log integrity |
| 12 | No LLM API needed | Local Qwen-7B included in air-gap bundle |

### Network Requirements

```
┌────────────────────┐          ┌──────────────────────┐
│  CyberSkill Team   │──VPN───▶│  Shinhan Staging     │
│  (HCM office)      │          │  Network             │
└────────────────────┘          │                      │
                                │  ┌────────────────┐  │
                                │  │ K8s / VM       │  │
                                │  │ (CyberSkill)   │  │
                                │  └───────┬────────┘  │
                                │          │           │
                                │  ┌───────▼────────┐  │
                                │  │ Staging DB     │  │
                                │  │ (read-only)    │  │
                                │  └────────────────┘  │
                                │          │           │
                                │  ┌───────▼────────┐  │
                                │  │ LLM API        │  │
                                │  │ (outbound 443) │  │
                                │  └────────────────┘  │
                                └──────────────────────┘
```

---

## Part C — Handover Verification

### Week -1 Verification Call

| Check | Method | Pass Criteria |
|---|---|---|
| VPN connectivity | CyberSkill engineer connects | Stable connection |
| DB connectivity | `psql` connection test | Read access confirmed |
| Schema review | Run DDL, verify tables | All expected tables present |
| Sample data | Query sample rows | Data masked, UTF-8 OK |
| DNS resolution | `curl https://[bu]-staging.shinhan.vn` | 200 OK |
| LLM API access | `curl https://api.openai.com/v1/models` | 200 OK |
