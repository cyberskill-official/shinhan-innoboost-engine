# Architecture & Data-Flow Diagrams per BU
## P11-T03

---

## 1. Cross-BU Shared Engine Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CyberSkill Platform                         │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                         │
│  │  SVFC    │  │  Bank    │  │Securities│  ← BU-specific UIs      │
│  │  UI      │  │  UI      │  │  UI      │    (themes, i18n)       │
│  │ (SF9)    │  │ (SB5)    │  │ (SS1)    │                         │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                         │
│       │              │              │                               │
│  ┌────▼──────────────▼──────────────▼────┐                         │
│  │            API Gateway                │  ← Auth (Keycloak OIDC) │
│  │     Rate limiting • TLS • CORS        │    Per-BU realm          │
│  └──────────────────┬────────────────────┘                         │
│                     │                                               │
│  ┌──────────────────▼────────────────────┐                         │
│  │         NL→SQL Engine                 │  ← Core intelligence    │
│  │                                        │                         │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐│                         │
│  │  │ NL Parse │→│SQL Gen   │→│Validate││                         │
│  │  └──────────┘ └──────────┘ └───┬────┘│                         │
│  │                                │      │                         │
│  │  ┌──────────┐ ┌──────────┐ ┌───▼────┐│                         │
│  │  │ Citation │←│Format    │←│Execute ││                         │
│  │  │ Engine   │ │Response  │ │ SQL    ││                         │
│  │  └──────────┘ └──────────┘ └────────┘│                         │
│  └──────────────────┬────────────────────┘                         │
│                     │                                               │
│  ┌─────────┬────────┼────────┬──────────┐                          │
│  │         │        │        │          │                          │
│  ▼         ▼        ▼        ▼          ▼                          │
│ ┌────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐                   │
│ │LLM │ │Policy│ │Cache │ │Audit │ │HITL      │                   │
│ │API │ │Engine│ │Redis │ │Trail │ │Reviewer  │                   │
│ │    │ │      │ │      │ │      │ │Queue     │                   │
│ └────┘ └──────┘ └──────┘ └──────┘ └──────────┘                   │
│                                                                     │
│  ┌──────────────────────────────────────┐                          │
│  │         Observability                │                          │
│  │  Prometheus • Grafana • Loki • Tempo │                          │
│  └──────────────────────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. SVFC (SF9) — Consumer Finance Architecture

```
┌─────────────────── SVFC Tenant ──────────────────┐
│                                                   │
│  Users: Loan officers, Branch managers             │
│  Data: KYC records, Loan portfolios, Credit scores│
│  Sensitivity: RESTRICTED (Tier 3-4)               │
│                                                   │
│  ┌─────────────┐                                  │
│  │  SVFC UI    │  Slate theme, Vietnamese          │
│  │  (SF9)      │  "Show Me How" drawer enabled     │
│  └──────┬──────┘                                  │
│         │                                         │
│  ┌──────▼──────┐    ┌─────────────┐              │
│  │  Engine     │───▶│ Policy      │              │
│  │             │    │ Consent ✓   │              │
│  │ Confidence  │    │ Sensitivity │              │
│  │ Scoring     │    │ Check ✓     │              │
│  └──────┬──────┘    └─────────────┘              │
│         │                                         │
│    ┌────▼────┐                                    │
│    │ HITL    │  Mandatory for:                     │
│    │ Queue   │  - Credit score queries             │
│    │         │  - Cross-customer aggregations      │
│    │         │  - Any query confidence < 65%       │
│    └─────────┘                                    │
│                                                   │
│  Data Sources:                                    │
│  ├── T24 Core Banking (read-only)                │
│  ├── Loan Management System                       │
│  └── Credit Bureau Interface                      │
└───────────────────────────────────────────────────┘
```

### SVFC Data Flow

```
Loan Officer → "Show me NPL ratio by province for Q1" 
    │
    ▼
[NL Parse] → Intent: aggregate, Entity: NPL, Dimension: province, Period: Q1
    │
    ▼
[Policy Check] → Sensitivity: INTERNAL (Tier 2) ✓, Consent: operational ✓
    │
    ▼
[SQL Gen] → SELECT province, SUM(npl_amount)/SUM(total_outstanding) AS npl_ratio 
             FROM loan_portfolio WHERE quarter = 'Q1-2026' GROUP BY province
    │
    ▼
[Execute] → Result: 63 rows, 2 columns
    │
    ▼
[Citation] → Source: loan_portfolio table, Period: Q1-2026, Freshness: 2h ago
    │
    ▼
[Confidence: 0.89 → AUTO-SERVE] → Display chart + table + citation
```

---

## 3. Bank HO (SB5) — Banking Operations Architecture

```
┌─────────────────── Bank HO Tenant ───────────────┐
│                                                   │
│  Users: Risk managers, Compliance officers, C-suite│
│  Data: Treasury, AML reports, Regulatory filings  │
│  Sensitivity: REGULATED (Tier 4)                  │
│                                                   │
│  ┌─────────────┐                                  │
│  │  Bank UI    │  Navy theme, Vietnamese/Korean    │
│  │  (SB5)      │  HITL badge prominent             │
│  └──────┬──────┘                                  │
│         │                                         │
│  ┌──────▼──────┐    ┌─────────────┐              │
│  │  Engine     │───▶│ Policy      │              │
│  │             │    │ Consent ✓   │              │
│  │ Heightened  │    │ Sensitivity │              │
│  │ Scrutiny    │    │ REGULATED ⚠ │              │
│  └──────┬──────┘    └─────────────┘              │
│         │                                         │
│    ┌────▼────┐                                    │
│    │ HITL    │  Mandatory for:                     │
│    │ Queue   │  - ALL regulatory data queries      │
│    │         │  - AML-flagged account queries       │
│    │         │  - Any query touching treasury       │
│    │         │  - Cross-BU data access               │
│    └─────────┘                                    │
│                                                   │
│  Data Sources:                                    │
│  ├── Core Banking System (T24)                    │
│  ├── Treasury Management System                    │
│  ├── AML/CTF Screening Platform                   │
│  └── SBV Regulatory Reporting Gateway              │
└───────────────────────────────────────────────────┘
```

---

## 4. Securities (SS1) — Trading & Research Architecture

```
┌─────────────────── Securities Tenant ────────────┐
│                                                   │
│  Users: Analysts, Brokers, Research desk           │
│  Data: Market data, Portfolio positions, Research  │
│  Sensitivity: INTERNAL (Tier 2) to RESTRICTED (3) │
│                                                   │
│  ┌─────────────┐                                  │
│  │ Securities  │  Charcoal theme, ticker-aware     │
│  │  UI (SS1)   │  Live data feeds, charts          │
│  └──────┬──────┘                                  │
│         │                                         │
│  ┌──────▼──────┐    ┌─────────────┐              │
│  │  Engine     │───▶│ Policy      │              │
│  │             │    │ Consent ✓   │              │
│  │ Financial   │    │ Market data │              │
│  │ Functions   │    │ OK ✓        │              │
│  └──────┬──────┘    └─────────────┘              │
│         │                                         │
│    ┌────▼────┐                                    │
│    │ HITL    │  Mandatory for:                     │
│    │ Queue   │  - Client portfolio queries          │
│    │         │  - Compliance report generation      │
│    │         │  - Cross-client aggregations          │
│    └─────────┘                                    │
│                                                   │
│  Data Sources:                                    │
│  ├── Trading Platform (HOSE/HNX/UPCOM feeds)     │
│  ├── Portfolio Management System                   │
│  ├── Research Database                             │
│  └── Brokerage Account System                      │
└───────────────────────────────────────────────────┘
```

---

## 5. Data Sensitivity Tiers (All BUs)

```
┌─────────────────────────────────────────────────────────┐
│  Tier 1: PUBLIC                                         │
│  Market prices, published research, exchange data       │
│  → Auto-serve, no HITL required                        │
├─────────────────────────────────────────────────────────┤
│  Tier 2: INTERNAL                                       │
│  Aggregate statistics, branch performance, portfolio    │
│  summary metrics                                        │
│  → Auto-serve if confidence > 75%, HITL otherwise      │
├─────────────────────────────────────────────────────────┤
│  Tier 3: RESTRICTED                                     │
│  Individual customer data, credit scores, KYC info      │
│  → HITL mandatory, 30-min SLA                          │
├─────────────────────────────────────────────────────────┤
│  Tier 4: REGULATED                                      │
│  AML flags, regulatory reports, audit data              │
│  → HITL mandatory, senior reviewer required, 20-min SLA│
└─────────────────────────────────────────────────────────┘
```
