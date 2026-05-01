---
title: "Generate Securities synthetic dataset (SS1 contextual)"
author: "@cyberskill-eng-data"
department: engineering
status: draft
priority: p1
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-06-19"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Generate a synthetic Shinhan Securities Vietnam dataset for the SS1 (Vibe Coding) contextual demos and any chat-with-data demos against the Securities theme (P05-T04). Tables span customers, accounts, holdings, trades (~5M intraday, reduced to 1-minute granularity), portfolios, watchlists, research_notes, market_data (HOSE/HNX symbols, 5 years daily). Realistic VN stock universe (real ticker symbols like VNM, VCB, FPT — but fully synthetic prices and trades), correct trading hours (HOSE: 09:00–14:45 ICT with lunch break), realistic order types (market, limit, stop). Used by the SS1 vibe-coding scenarios (P07-T02) — for example, "build a portfolio summariser in 10 minutes" needs realistic holdings + market data to operate over.

## Problem

The SS1 brief is unique among the three submissions: it's a vibe-coding partnership, not a chat-with-data deployment. The SS1 demo (live-coding three scenarios per P07-T02) requires Securities-shaped data to operate over. Without realistic securities data, the live-build scenarios feel like toy examples; with it, they feel like real engineering.

Specific gaps if we shortcut:

- **Without real ticker symbols (HOSE / HNX listed companies), market-context questions ring false.**
- **Without correct trading hours and lunch break, time-series demos look wrong.**
- **Without intraday tick data (reduced to 1-minute), backtesting demos cannot run.**
- **Without holdings table, portfolio analytics demos cannot run.**
- **Without research_notes table, "summarise the latest research on VNM" demos can't be staged.**

The `feedback_p1_scope_preference` memory note biases us richer. For the Securities dataset, "richer" means: 5 years of daily market data on 100+ tickers; intraday at 1-minute granularity for the most-traded 30; 100K customer accounts; realistic portfolio compositions; research_notes with synthetic but plausible content.

## Proposed Solution

A reproducible dataset generation pipeline at `data/securities/`:

1. **Schema.** `customers`, `accounts`, `holdings`, `trades`, `portfolios`, `watchlists`, `research_notes`, `market_data`, `market_data_intraday`.
2. **Realism.** 100+ HOSE / HNX symbols (real); 5 years daily prices (synthetic but with realistic correlations and volatility); 1-minute intraday for top-30 symbols × 1 year; 100K customers; realistic holding distributions (concentrated in blue-chip names + a long tail).
3. **Generator + loaders + data card + quality assertions.** Same pattern as P03-T01 / P03-T02.

Setup target: 10 days from task assignment.

### Subtasks

- [ ] **Author the schema.** YAML at `data/securities/SCHEMA.md`. Tables and fields:
  - `customers (~100K)`: id, full_name, account_open_date, segment (retail / HNI / institutional), kyc_status.
  - `accounts (~100K)`: id, customer_id, account_type, opened_at, balance_vnd, margin_enabled.
  - `tickers (~100)`: symbol, exchange (HOSE / HNX), name, sector, listing_date, market_cap_vnd.
  - `market_data (~125K rows)`: ticker, date, open_vnd, high_vnd, low_vnd, close_vnd, volume_shares, turnover_vnd. 5 years × 250 trading days × 100 tickers = ~125K rows.
  - `market_data_intraday (~7M rows)`: ticker, timestamp, open, high, low, close, volume. 30 tickers × 1 year × 250 days × ~340 minutes/day = ~2.5M rows; expand to 7M for top-30 over 3 years.
  - `holdings (~500K rows)`: customer_id, ticker, quantity, avg_cost_vnd, last_updated.
  - `trades (~5M rows)`: id, customer_id, ticker, side (buy / sell), quantity, price_vnd, executed_at, order_type (market / limit / stop), status.
  - `portfolios`: id, customer_id, name, created_at.
  - `watchlists`: id, customer_id, name; `watchlist_items`: watchlist_id, ticker.
  - `research_notes`: id, ticker, published_at, analyst, recommendation (buy / hold / sell), target_price_vnd, summary (synthetic).
- [ ] **Define realism requirements.** HOSE trading hours: 09:00–11:30 + 13:00–14:45 ICT, M-F, exclude VN public holidays. Lunar New Year closure (5-7 days each Jan/Feb). Stock-price simulation: geometric Brownian motion with sector correlation + occasional shock events; volatility ~25-35% annualised. Volume: log-normal with intraday U-shape (high at open + close).
- [ ] **Choose the ticker universe.** Top-100 HOSE + HNX by market cap as of 2026-Q1; document the list with sector tags.
- [ ] **Implement the generator.** `data/securities/generate.ts`.
- [ ] **Implement loaders.** `data/securities/load-*.sh`.
- [ ] **Author the data card.** `data/securities/DATA_CARD.md`.
- [ ] **Implement quality assertions.** `data/securities/verify.ts`.
- [ ] **CI integration.** Same pattern.

### Acceptance criteria

- Schema documented.
- All ~9 tables generated with documented row counts.
- Trading hours and holidays correct.
- Loaders work for Postgres + BigQuery + Snowflake.
- Reproducible.
- Quality assertions pass.

## Alternatives Considered

- **Use real public market data.** Rejected: licensing complexity; real data adds no realism beyond what synthetic correlated GBM provides.
- **Skip intraday data; use daily only.** Rejected: backtest scenarios in P07-T02 need intraday.
- **Use SS only for vibe-coding (no contextual chat-with-data).** Rejected: P05-T04 Securities theme needs data even if SS1's primary engagement is vibe-coding.

## Success Metrics

- **Primary**: All ~9 tables generated, loaded, verified within 10 days.
- **Guardrail**: Quality assertions pass; zero CI regressions.

## Scope

### In scope
- Schema + ~9 tables.
- Realism (trading hours, holidays, GBM prices, U-shape volume).
- Generator + loaders + data card + quality assertions.

### Out of scope
- Real market data feed (post-kickoff if required).
- Order-book microstructure (deferred unless required).
- Options / derivatives (deferred).

## Dependencies

- **Upstream**: P03-T04 (Faker-VN); P01-T04.
- **Downstream**: P05-T04 (Securities theme), P07-T02 (live-build scenarios).
- **People**: eng-data; engine tech lead consulting; possibly an external securities-domain SME for spot-check.

## Open Questions

- Q1: Which 100 tickers? Recommendation: top-100 HOSE + HNX by market cap; documented snapshot date.
- Q2: For news / research_notes, do we generate via LLM or templates? Recommendation: templates with parameter slots — controllable; auditable.
- Q3: For intraday simulation, parameter sources? Recommendation: documented constants; a brief justification per parameter in the data card.

## Implementation Notes

- For correlated stock prices, generate via Cholesky decomposition of a sector-correlation matrix; simulate GBM with sector-shared shocks.
- For trading hours, the simulator skips non-trading minutes; intraday timestamps respect the lunch-break gap.
- For VN holidays, a documented list at `data/securities/vn-holidays.yaml`; updated annually.

## Test Plan

- Test 1: Reproducibility.
- Test 2: Trading hours — verify no intraday data outside trading hours.
- Test 3: Realism — manual review of a sample chart (price + volume); domain SME spot-check.
- Test 4: Cross-warehouse equality.

## Rollback Plan

- Same pattern as P03-T01.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Schema | `data/securities/SCHEMA.md` | Eng-data | Continuous |
| Generator | `data/securities/generate.ts` | Eng-data | Continuous |
| Data card | `data/securities/DATA_CARD.md` | Eng-data | Continuous |
| VN holidays list | `data/securities/vn-holidays.yaml` | Eng-data | Continuous |

## Operational Risks

- Same as P03-T01.

## Definition of Done

- All 9 tables generated, loaded, verified.
- Data card published.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: eng-data authors generator; domain SME spot-checks realism.
