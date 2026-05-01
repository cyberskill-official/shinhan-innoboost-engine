---
title: "Generate Bank HO Department synthetic dataset (SB5)"
author: "@cyberskill-eng-data"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-06-12"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Generate a synthetic Shinhan Bank Vietnam HO Department dataset modelled on the kinds of cuts HO Departments actually request from ICT-Reporting (the SB5 brief flagged this directly: "Power BI tool has limited access for ICT-Reporting Team only"). Tables span branch_pnl (monthly, 5 years × 60 branches), deposit_balances (daily 2 years × product × branch), forex_positions, lending_book, treasury_positions, ops_incidents, customer_complaints. Includes deliberate sensitivity-tier seeding (mix of Public / Internal / Restricted rows) so RBAC + sensitivity policy can be demonstrated end-to-end. Used by the engine for chat-with-data demos against the Bank theme (P05-T03) and crucially by the HITL queue (P06) to demonstrate the human-review pattern the SB5 brief explicitly required. Reproducible (seeded), realistic distributions, ~5 GB compressed.

## Problem

The SB5 form answer commits to a conversational layer above the same warehouse, supplementing Power BI without replacing it. The Bank brief explicitly named HITL as a requirement; demonstrating HITL convincingly requires data with the right sensitivity-tier shape. The dataset is the substrate of the SB5 demo; without realistic Bank-shaped data, the demo's most important questions ring false.

Specific gaps if we shortcut:

- **Without branch_pnl with realistic branch-by-branch P&L distribution, "show me top-performing branches" returns an obviously synthetic shape.**
- **Without deposit_balances with daily granularity over 2 years, time-series questions cannot be answered convincingly.**
- **Without sensitivity-tier mix, we cannot demonstrate RBAC + HITL routing — every answer would be the same tier.**
- **Without forex / treasury / lending / ops_incidents / complaints tables, questions outside the core P&L surface produce "I don't have that data" answers, which feels limited.**
- **Without realistic VND magnitudes at Bank scale (trillions, not billions), the data feels small.**

The `feedback_p1_scope_preference` memory note biases us richer. For the Bank dataset, "richer" means: 60 branches × 5 years monthly P&L; 2 years daily deposit balances; 4 product families; sensitivity-tier mix; realistic correlations (large branches in HCMC + Hanoi; small branches in provinces); ops-incident table for "what went wrong this month?" demos; complaints table for customer-experience analytics demos.

## Proposed Solution

A reproducible dataset generation pipeline at `data/bank/` mirroring the structure of P03-T01 (SVFC):

1. **Schema.** ~7 tables: `branches` (60), `branch_pnl` (60 × 60 months = 3600 rows), `deposit_balances` (60 × 365 × 2 × 8 products = ~350K rows), `forex_positions` (8 currency pairs × 250 trading days × 2 years = ~4K rows), `lending_book` (~200K loans aggregated by branch + product), `treasury_positions`, `ops_incidents` (~500 incidents across 2 years), `customer_complaints` (~5K complaints).
2. **Sensitivity-tier seeding.** Each table has rows tagged with sensitivity (Public / Internal / Restricted). Aggregate-only rows (yearly P&L by region) are Public; monthly branch P&L is Internal; individual ops incidents involving customer data are Restricted.
3. **Generator + loaders + data card + quality assertions.** Mirrors P03-T01 pattern.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Author the schema.** YAML at `data/bank/SCHEMA.md`. Tables:
  - `branches (60)`: id, name, province, district, opened_at, type (HQ / urban / provincial / specialised), employee_count.
  - `branch_pnl (3600 rows)`: branch_id, month_end, revenue_vnd, expense_vnd, net_income_vnd, sensitivity_tier.
  - `deposit_balances (~350K rows)`: branch_id, date, product (savings / current / time / FCY), balance_vnd, customer_count, sensitivity_tier.
  - `forex_positions (~4K rows)`: trade_date, currency_pair, position_vnd, mark_to_market_vnd, sensitivity_tier (mostly Restricted).
  - `lending_book (~200K rows)`: branch_id, product, customer_segment, principal_outstanding_vnd, npl_amount_vnd, snapshot_date, sensitivity_tier.
  - `treasury_positions`: instrument, value_vnd, maturity, snapshot_date, sensitivity_tier.
  - `ops_incidents (~500 rows)`: id, occurred_at, branch_id, severity, type, description (synthetic), resolution, sensitivity_tier.
  - `customer_complaints (~5K rows)`: id, raised_at, branch_id, channel, category, summary (synthetic), resolved_at, sensitivity_tier.
- [ ] **Define realism requirements.** 60 branches: 8 in HCMC, 6 in Hanoi, 46 provincial. Branch P&L distribution: HCMC HQ-tier branches do 20× the volume of small provincial branches. Deposit balance growth: 8-12% YoY. NPL rate: 1.8% (Bank is healthier than SVFC). FX exposure: stable around USD/VND, modest volatility around EUR/CNY/JPY. Tết seasonality on deposits.
- [ ] **Define sensitivity-tier shape.** ~10% of rows Public (aggregated); ~70% Internal (branch-level); ~18% Restricted (individual customer or transaction-level); ~2% Regulated (treasury / forex positions visible only to risk committee).
- [ ] **Implement the generator.** `data/bank/generate.ts`. Same patterns as P03-T01 SVFC.
- [ ] **Implement loaders.** `data/bank/load-*.sh`.
- [ ] **Author the data card.** `data/bank/DATA_CARD.md`.
- [ ] **Implement quality assertions.** `data/bank/verify.ts`.
- [ ] **CI integration.** Same as P03-T01.
- [ ] **Document for engine + HITL teams.** Specifically: which tables are designed to trigger HITL routing under what queries.

### Acceptance criteria

- Schema documented; data card published.
- Generator produces all 7 tables; row counts match expected.
- Sensitivity-tier mix matches documented expectations.
- Loaders work for Postgres / BigQuery / Snowflake.
- Reproducible.
- Quality assertions pass; CI green.
- Realism: branch distribution, P&L magnitude, deposit growth, NPL rate match documented expectations.

## Alternatives Considered

- **Reuse SVFC dataset as a stand-in.** Rejected: Bank data has different structure (less retail consumer focus; more treasury/forex; bigger branches); reuse fails the credibility test.
- **Skip ops_incidents and customer_complaints tables.** Rejected: those are exactly the kinds of cuts HO Department asks for; skipping them undercuts the "we serve HO needs" pitch.
- **Use only public Shinhan annual-report data.** Rejected: too aggregated; can't answer branch-level or daily questions.

## Success Metrics

- **Primary**: All 7 tables generated, loaded, and verified within 14 days.
- **Guardrail**: Quality assertions pass; zero CI regressions.

## Scope

### In scope
- Schema + 7 tables.
- Sensitivity-tier seeding.
- Generator + loaders.
- Data card.
- Quality assertions + CI integration.

### Out of scope
- SVFC dataset (P03-T01).
- Securities dataset (P03-T03).
- Real Shinhan Bank data (post-kickoff).

## Dependencies

- **Upstream**: P03-T04 (Faker-VN); P01-T04.
- **Downstream**: P02-T01, P04-T01, P05-T03, P06.
- **People**: eng-data authoring; engine tech lead consulting; founder ratifying realism.

## Open Questions

- Q1: Treasury data — how realistic? Recommendation: order-of-magnitude correct (Bank treasury is in trillions VND); details synthetic.
- Q2: For ops_incidents description text, do we use generic ("Outage in core banking") or generated by an LLM? Recommendation: handcrafted templates per severity + type — controllable; auditable.
- Q3: How realistic should customer_complaints be? Recommendation: realistic categories (transaction dispute, ATM issue, branch-staff complaint, online-banking error); synthetic summaries.

## Implementation Notes

- For branch P&L, generate per-branch base rates with branch-type correlation; apply YoY growth and Tết seasonality on top.
- For sensitivity tagging, the rule is at row level (some rows of a table are Public, others Internal); the engine respects this at query time.
- For ops_incidents, severity distribution: 70% low, 25% medium, 5% high. High-severity entries are tagged Restricted.

## Test Plan

- Test 1: Reproducibility.
- Test 2: Quality assertions.
- Test 3: Sensitivity-tier mix matches expected ratios (within 1%).
- Test 4: Cross-warehouse equality.
- Test 5: HITL routing — query a Restricted-tier metric as a viewer; verify HITL routing.

## Rollback Plan

- Same as P03-T01.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Schema | `data/bank/SCHEMA.md` | Eng-data | Continuous |
| Generator | `data/bank/generate.ts` | Eng-data | Continuous |
| Loaders | `data/bank/load-*.sh` | Eng-data | Continuous |
| Data card | `data/bank/DATA_CARD.md` | Eng-data | Continuous |
| Quality-assertion script | `data/bank/verify.ts` | Eng-data | Continuous |

## Operational Risks

- Same as P03-T01.

## Definition of Done

- 7 tables generated, loaded, verified.
- Data card published.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: eng-data authors generator; engine tech lead reviews schema; domain SME spot-checks realism.
