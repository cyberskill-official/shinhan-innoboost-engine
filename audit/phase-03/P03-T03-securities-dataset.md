# Deep Audit — P03-T03: Securities Synthetic Dataset

> **Auditor**: Antigravity Engine Audit  
> **Date**: 2026-05-02  
> **Status**: 🟡 PARTIALLY COMPLETE (~50%)  
> **Risk Level**: Medium  

---

## 1. Acceptance Criteria Audit

| # | Criterion | Status | Evidence | Gap |
|---|-----------|--------|----------|-----|
| AC-1 | 8 tables defined in schema | ✅ PASS | `data/securities/generator.ts` defines 8 tables: customers, accounts, holdings, trades, portfolios, watchlists, research_notes, market_data. | — |
| AC-2 | 20K securities customers | ✅ PASS | `generateSecCustomers(faker, 20_000)` — default count 20,000. Investor types: individual 85%, institutional 10%, foreign 5%. | — |
| AC-3 | 25K trading accounts with margin support | ✅ PASS | `generateAccounts()` creates 1–2 accounts per customer. Cash + margin (40–70% ratio). Status: active/suspended. | — |
| AC-4 | 150K current stock holdings | 🟡 PARTIAL | Schema declares `rowCount: 150_000` but **no `generateHoldings()` function exists**. Not returned from `generateSecuritiesDataset()`. | **Generator missing** — schema stub only. |
| AC-5 | 5M trade records (1-min aggregated) | 🟡 PARTIAL | Schema declares `rowCount: 5_000_000` but **no `generateTrades()` function exists**. Not returned. | **Generator missing** — schema stub only. |
| AC-6 | 5K named portfolios | 🟡 PARTIAL | Schema declares `rowCount: 5_000` but **no `generatePortfolios()` function exists**. | **Generator missing** — schema stub only. |
| AC-7 | 30K watchlist entries | 🟡 PARTIAL | Schema declares `rowCount: 30_000` but **no `generateWatchlists()` function exists**. | **Generator missing** — schema stub only. |
| AC-8 | 500 analyst research notes | ✅ PASS | `generateResearchNotes()` produces 500 rows. 5 ratings (buy/hold/sell/outperform/underperform). Internal sensitivity. | — |
| AC-9 | 62.5K daily OHLCV market data (50 symbols × 1250 days) | ✅ PASS | `generateMarketData()` iterates HOSE_SYMBOLS + HNX_SYMBOLS × 1250 trading days. Random walk price model. | — |
| AC-10 | HOSE + HNX symbols included | ✅ PASS | `HOSE_SYMBOLS` (40 symbols) + `HNX_SYMBOLS` (10 symbols) = 50 symbols. Real Vietnamese tickers. | — |
| AC-11 | Ticker-aware integration ($VNM syntax) | ✅ PASS | Securities theme config exports `tickerPattern: /\$([A-Z]{2,4})/g` with autocomplete enabled. | — |
| AC-12 | Intraday 1-minute granularity data | ❌ FAIL | FR specifies intraday (1-min) market data. Current implementation is **daily OHLCV only**. No intraday granularity. | Intraday not implemented. |
| AC-13 | Seed-reproducible | ✅ PASS | Uses `FakerVN(seed)` — deterministic LCG. | — |
| AC-14 | No real PII collision | ✅ PASS | Customers use `SYN-` CCCD, `@example.vn` emails. | — |
| AC-15 | DATA_CARD.md shipped | ❌ FAIL | **No `data/securities/DATA_CARD.md` exists.** | Must create. |

**AC Summary**: 8/15 PASS, 4/15 PARTIAL (generator stubs), 2/15 FAIL (no intraday, no DATA_CARD), 1/15 N/A.

---

## 2. Test Plan Audit

| # | Test | Status | Evidence | Gap |
|---|------|--------|----------|-----|
| TP-1 | Generate dataset with seed=42; verify row counts | ❌ NOT RUN | Zero test files. | No tests written. |
| TP-2 | Verify HOSE/HNX symbol completeness | ❌ NOT RUN | No test validates the 50-symbol set. | No tests written. |
| TP-3 | Verify market data OHLCV consistency (high ≥ close ≥ low) | ❌ NOT RUN | Current code has potential issues: `low` can go negative (line 211 has `Math.max(100, low)` safety but not 1000). | No tests written. |
| TP-4 | Verify investor type distribution (85/10/5) | ❌ NOT RUN | No statistical assertion. | No tests written. |
| TP-5 | Verify ticker pattern extracts symbols from input | ❌ NOT RUN | No regex unit test. | No tests written. |
| TP-6 | Load into Postgres; verify row counts | ❌ NOT RUN | No integration test. | No Postgres instance. |
| TP-7 | Verify intraday data at 1-minute granularity | ❌ NOT RUN | **Intraday not implemented.** | Blocked by AC-12 failure. |

**TP Summary**: 0/7 tests executed. **100% test debt.**

---

## 3. Success Metrics Audit

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| All 8 tables with generators | 8 generators | 4 generators (customers, accounts, market_data, research_notes) | ❌ FAIL |
| Intraday 1-min granularity | Yes | Daily OHLCV only | ❌ FAIL |
| DATA_CARD.md shipped | Yes | No | ❌ FAIL |
| 50 HOSE+HNX symbols | 50 | 50 (40 HOSE + 10 HNX) | ✅ PASS |

---

## 4. Definition of Done Audit

| Criterion | Met? | Notes |
|-----------|------|-------|
| All deliverables shipped | ❌ | 4 generators missing + no intraday + no DATA_CARD |
| Tests pass | ❌ | Zero tests |
| DATA_CARD.md shipped | ❌ | Not created |
| FR ticket marked Done | ❌ | Cannot mark done |

---

## 5. Code Quality Assessment

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Schema Design** | 9/10 | 8 tables cover securities domain well. Order types (LO, MP, ATO, ATC) are VN-specific. |
| **Generator Quality** | 6/10 | 4 generators present. Market data uses random walk — decent but simplified. 4 generators missing. |
| **Domain Accuracy** | 8/10 | Real HOSE/HNX tickers. T+2 settlement. KYC verification. Margin accounts. |
| **Type Safety** | 6/10 | Same `Record<string, unknown>` pattern. |
| **Test Coverage** | 0/10 | Zero tests. |
| **Market Data Quality** | 5/10 | Daily only (not intraday). Random walk lacks volatility clustering. Weekend approximation crude (7/5 multiplier). |

---

## 6. Risk Assessment

| Risk | Severity | Impact | Mitigation |
|------|----------|--------|------------|
| Missing 4 generators blocks gold-set securities queries | **HIGH** | Portfolio, holdings, trades, watchlist queries will fail | Implement generators |
| No intraday data — client demo may need minute-level granularity | **HIGH** | Securities surface "real-time" feel compromised | Add 1-min OHLCV generator (caution: row count explodes ~18M+) |
| Market data weekend approximation incorrect | **LOW** | Some dates fall on weekends | Use proper trading calendar filter |
| Zero tests | **HIGH** | Regressions undetected | Write tests |

---

## 7. Remediation Priorities

| Priority | Item | Effort | Dependency |
|----------|------|--------|------------|
| P0 | Implement `generateHoldings()` (150K rows) | 3h | generateAccounts() |
| P0 | Implement `generateTrades()` (5M rows — streaming required) | 6h | generateAccounts() |
| P0 | Implement `generatePortfolios()` (5K rows) | 1h | generateSecCustomers() |
| P0 | Implement `generateWatchlists()` (30K rows) | 1h | generateSecCustomers() |
| P0 | Create `data/securities/DATA_CARD.md` | 1h | None |
| P1 | Add intraday 1-min OHLCV generator (or document as out-of-scope for Phase 1) | 8h | Design decision needed |
| P1 | Write 7 unit tests (row counts, OHLCV consistency, investor distribution, seed reproducibility) | 4h | Generators complete |
| P2 | Fix weekend date approximation in market data | 2h | None |
| P2 | Wire all generators into `generateSecuritiesDataset()` return | 30min | Generators complete |
