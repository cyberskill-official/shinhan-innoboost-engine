# Per-Tenant Data Residency for VN-Hosted Infrastructure
## P10-T04

---

## 1. Data Residency Requirements

| Requirement | Source | CyberSkill Position |
|---|---|---|
| All personal data stays in Vietnam | PDPL (Decree 13/2023) | ✅ VN-only infrastructure |
| Data localisation for critical services | Cybersecurity Law Art. 26 | ✅ VN-hosted options mapped |
| Banking data stays within VN | SBV TT-09/2020 | ✅ On-prem option available |
| Per-tenant isolation | Shinhan internal policy | ✅ Namespace + schema isolation |

---

## 2. VN Hosting Options

| Provider | IDC Location | Certifications | GPU Available | Network | Suitability |
|---|---|---|---|---|---|
| **Viettel IDC** | HCM, Hanoi | ISO 27001, Tier III | ✅ NVIDIA A100 | Peering with ISPs | ⭐ Best for banking (Viettel-Shinhan relationship) |
| **VNPT IDC** | HCM, Hanoi, Da Nang | ISO 27001, Tier III | ✅ NVIDIA T4/A10 | National backbone | Good for multi-region |
| **FPT IDC** | HCM, Hanoi | ISO 27001, PCI DSS | ✅ NVIDIA A100 | Cloud-connect ready | Good for hybrid cloud |
| **AWS ap-southeast-1** | Singapore (closest) | SOC 2, ISO 27001 | ✅ Full range | Global | ⚠️ Data leaves VN |
| **AWS Local Zone VN** | HCM (if available) | SOC 2, ISO 27001 | Limited | AWS backbone | ✅ Best cloud option if available |

### Recommendation
- **PoC phase**: AWS ap-southeast-1 with VPN to Shinhan VN (synthetic data only — no PII)
- **Production**: Viettel IDC (on-prem) or AWS Local Zone VN (if available by contract date)
- **Hybrid**: Control plane on AWS, data plane on-prem in Viettel IDC

---

## 3. Per-Tenant Isolation Architecture

```
┌────────────────────────────────────────────────┐
│           Kubernetes Cluster (VN-hosted)        │
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ ns: svfc │  │ ns: bank │  │ ns: sec  │    │
│  │          │  │          │  │          │    │
│  │ engine   │  │ engine   │  │ engine   │    │
│  │ hitl     │  │ hitl     │  │ hitl     │    │
│  │ ui       │  │ ui       │  │ ui       │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │              │              │          │
│  ┌────▼──────────────▼──────────────▼────┐    │
│  │         Shared Postgres Cluster        │    │
│  │                                        │    │
│  │  ┌──────────┐ ┌──────┐ ┌──────────┐  │    │
│  │  │schema:   │ │schema│ │schema:   │  │    │
│  │  │svfc      │ │:bank │ │sec       │  │    │
│  │  └──────────┘ └──────┘ └──────────┘  │    │
│  │                                        │    │
│  │  Row-Level Security per tenant_id     │    │
│  └────────────────────────────────────────┘    │
└────────────────────────────────────────────────┘
```

### Isolation Layers

| Layer | Mechanism | Purpose |
|---|---|---|
| **Network** | Kubernetes NetworkPolicy per namespace | BU traffic cannot cross namespaces |
| **Compute** | Separate deployments per BU namespace | No shared process memory |
| **Database** | Separate Postgres schemas per BU | Data isolation at DB level |
| **Row-Level** | `tenant_id` column + RLS policies | Fine-grained access within shared tables |
| **Encryption** | Per-tenant encryption keys (KMS) | Data encrypted with tenant-specific keys |
| **Audit** | Per-tenant audit log partitions | Compliance reporting per BU |

### Row-Level Security (Postgres)

```sql
-- Enable RLS on all data tables
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_set ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their tenant's data
CREATE POLICY tenant_isolation ON queries
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON audit_log
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON gold_set
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Set tenant context per connection
-- (Engine sets this from JWT claims)
SET app.tenant_id = 'tenant-uuid-here';
```

---

## 4. Data Flow with Residency Controls

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │────▶│  API GW  │────▶│  Engine  │────▶│   LLM    │
│ (VN)     │     │  (VN)    │     │  (VN)    │     │  API     │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                       │                │
                                       │           ┌────▼────┐
                                       │           │ Prompt   │
                                       │           │ (no PII) │
                                       │           └─────────┘
                                  ┌────▼────┐
                                  │   DB    │
                                  │  (VN)   │
                                  │ RLS     │
                                  └─────────┘
```

| Data | Location | Crosses Border? | Controls |
|---|---|---|---|
| Query text | VN (DB) | ❌ | Encrypted at rest |
| User metadata | VN (DB) | ❌ | RLS isolation |
| Audit log | VN (DB) | ❌ | Hash-chained, WORM |
| LLM prompts | VN → API provider | ⚠️ Prompt only | PII scrubbed, no raw data |
| LLM responses | API provider → VN | ⚠️ Response only | No PII in response |
| Cached answers | VN (Redis) | ❌ | TTL-controlled |

### LLM Data Handling
- **Prompts are scrubbed of PII** before sending to LLM API
- Only column names and aggregation patterns are sent
- Raw data values stay in VN (they're in the SQL result, not the prompt)
- For fully air-gapped: use local Qwen-7B (no data leaves the network)

---

## 5. Compliance Verification

| Check | Verification Method | Frequency |
|---|---|---|
| Data stays in VN | AWS Config Rule / manual audit | Monthly |
| RLS policies active | `pg_catalog` query + test | Weekly (automated) |
| Network policies enforced | `kubectl get networkpolicy` + scan | Weekly |
| Encryption keys per tenant | KMS audit log | Monthly |
| No PII in LLM prompts | Prompt guard logs + sampling | Continuous |
| Cross-border transfer log | Zero entries expected | Quarterly |
