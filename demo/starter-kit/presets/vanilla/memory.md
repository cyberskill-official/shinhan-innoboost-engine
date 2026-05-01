# CyberSkill Vibe-Coding — Domain Context

## Project
Shinhan Innoboost 2026 — AI-powered data assistant for Shinhan Financial Group Vietnam.

## Architecture
- **NL→SQL Engine**: Natural language to parameterised SQL via LLM
- **Policy Engine**: RBAC + sensitivity tiers + consent checks
- **HITL Queue**: Reviewer approval for low-confidence / sensitive queries
- **Audit Log**: Hash-chained, WORM-like compliance log

## Datasets
- SVFC: Consumer finance (loans, branches, collections, KYC)
- Bank HO: Banking operations (P&L, risk, treasury, FX)
- Securities: Trading (orders, portfolios, market data, research)

## Key Patterns
1. Every query → confidence score → triage decision
2. Every answer → citations (column + value + lineage)
3. Sensitive data → policy gate → HITL if needed
4. All mutations → audit log with hash chain

## Vietnamese Context
- Currency: VND (no decimals, use bigint)
- Exchanges: HOSE, HNX, UPCOM
- Regulators: SBV (banking), SSC (securities), MoIC (data protection)
- Trading hours: 09:00-11:30, 13:00-14:45 (HOSE)
