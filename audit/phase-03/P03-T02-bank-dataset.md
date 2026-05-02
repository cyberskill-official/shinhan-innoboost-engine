# Deep Audit — P03-T02: Bank HO Department Synthetic Dataset

> **Auditor**: Antigravity Engine Audit  
> **Date**: 2026-05-02  
> **Status**: 🟡 PARTIALLY COMPLETE (~45%)  
> **Risk Level**: Medium-High  

---

## 1. Acceptance Criteria Audit

| # | Criterion | Status | Evidence | Gap |
|---|-----------|--------|----------|-----|
| AC-1 | 7 tables defined in schema | ✅ PASS | `data/bank/generator.ts` defines 7 tables: branch_pnl, deposit_balances, forex_positions, lending_book, treasury_positions, ops_incidents, customer_complaints. | — |
| AC-2 | Sensitivity tiers (Public/Internal/Restricted) seeded | ✅ PASS | `SENSITIVITY_MIX` array with weighted distribution: public (50%), internal (35%), restricted (15%). Used in branch_pnl, forex_positions, treasury_positions. | — |
| AC-3 | Branch-level P&L data (60 branches × 60 months) | ✅ PASS | `generateBranchPnl()` produces 3,600 rows. Revenue, cost, profit, NIM, CIR computed. | — |
| AC-4 | Daily deposit balances (2yr × product × branch) | 🟡 PARTIAL | Schema declares `rowCount: 2_190_000` but **no `generateDepositBalances()` function exists**. Not returned from `generateBankDataset()`. | **Generator missing** — schema-only stub. |
| AC-5 | Daily FX positions (10 pairs × 730 days) | ✅ PASS | `generateForexPositions()` produces 7,300 rows. 10 FX pairs defined. Long/short/net/MTM P&L computed. | — |
| AC-6 | Monthly lending book snapshot | 🟡 PARTIAL | Schema declares `rowCount: 3_600` but **no `generateLendingBook()` function exists**. Not in export. | **Generator missing** — schema-only stub. |
| AC-7 | Daily treasury/bond positions | 🟡 PARTIAL | Schema declares `rowCount: 14_600` with 20 instruments but **no `generateTreasuryPositions()` function exists**. Not in export. | **Generator missing** — schema-only stub. |
| AC-8 | 2,400 operational incidents | ✅ PASS | `generateOpsIncidents()` produces 2,400 rows with severity-weighted distribution (critical 5%, high 15%, medium 40%, low 40%). | — |
| AC-9 | 8,000 customer complaints | ✅ PASS | `generateCustomerComplaints()` produces 8,000 rows with 6 categories, 5 channels, satisfaction tracking. | — |
| AC-10 | Seed-reproducible output | ✅ PASS | Uses `FakerVN(seed)` — deterministic LCG. | — |
| AC-11 | No real PII / data clearly synthetic | ✅ PASS | Branch names derived from province list. No personal identifiers in bank dataset. | — |
| AC-12 | DATA_CARD.md shipped | ❌ FAIL | **No `data/bank/DATA_CARD.md` exists.** Only SVFC has a data card. | Must create DATA_CARD.md |
| AC-13 | Multi-warehouse DDL support | ✅ PASS | Inherits from `loader.ts` — generates Postgres/BQ/Snowflake DDL. | — |

**AC Summary**: 7/13 PASS, 3/13 PARTIAL (generator stubs), 1/13 FAIL (no DATA_CARD), 2/13 N/A.

---

## 2. Test Plan Audit

| # | Test | Status | Evidence | Gap |
|---|------|--------|----------|-----|
| TP-1 | Generate dataset with seed=42; verify row counts | ❌ NOT RUN | Zero test files. | No tests written. |
| TP-2 | Verify sensitivity tier distribution matches spec | ❌ NOT RUN | No statistical assertion on 50/35/15 split. | No tests written. |
| TP-3 | Verify branch P&L NIM is in realistic range (2.0–5.5%) | ❌ NOT RUN | Code uses `faker.random.float(2.0, 5.5)` but no test validates. | No tests written. |
| TP-4 | Verify FX pairs cover all 10 specified pairs | ❌ NOT RUN | No test validates completeness. | No tests written. |
| TP-5 | Verify incident severity financial impact scales correctly | ❌ NOT RUN | Critical: 100M–5B VND; others: 0–100M. Not tested. | No tests written. |
| TP-6 | Load into Postgres; verify row counts | ❌ NOT RUN | No integration test. | No Postgres instance. |
| TP-7 | Verify HITL demonstration readiness with sensitivity-gated queries | ❌ NOT RUN | Cross-module dependency (P02-T06 HITL). | Not implemented. |

**TP Summary**: 0/7 tests executed. **100% test debt.**

---

## 3. Success Metrics Audit

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| All 7 tables with generators | 7 generators | 4 generators (branch_pnl, forex, incidents, complaints) | ❌ FAIL |
| Sensitivity tier enforcement demo-ready | Yes | Schema tags present; no RBAC integration | 🟡 PARTIAL |
| DATA_CARD.md shipped | Yes | No | ❌ FAIL |
| Seed reproducibility | Yes | Code-deterministic, not verified | 🟡 UNVERIFIED |

---

## 4. Definition of Done Audit

| Criterion | Met? | Notes |
|-----------|------|-------|
| All deliverables shipped | ❌ | 3 generators missing + no DATA_CARD |
| Tests pass | ❌ | Zero tests |
| DATA_CARD.md shipped | ❌ | Not created |
| FR ticket marked Done | ❌ | Cannot mark done |

---

## 5. Code Quality Assessment

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Schema Design** | 8/10 | 7 tables well-defined with sensitivity tags. |
| **Generator Quality** | 7/10 | 4 generators are realistic — NIM, CIR, incident severity. 3 generators absent. |
| **Data Realism** | 8/10 | Vietnamese bank context: 60 branches, real FX pairs (KRW/VND for Shinhan context), realistic incident categories. |
| **Type Safety** | 6/10 | `Record<string, unknown>` — no per-table interfaces. |
| **Test Coverage** | 0/10 | Zero tests. |
| **Documentation** | 3/10 | No DATA_CARD. Minimal inline comments. |

---

## 6. Risk Assessment

| Risk | Severity | Impact | Mitigation |
|------|----------|--------|------------|
| Missing 3 generators (deposits, lending, treasury) blocks gold-set queries for bank BU | **HIGH** | Gold-set bank questions referencing deposit_balances, lending_book, treasury will fail | Implement remaining generators |
| No DATA_CARD → audit/provenance trail incomplete for client presentation | **MEDIUM** | Client may question data lineage | Create DATA_CARD.md using loader.ts `generateDataCard()` |
| Zero tests | **HIGH** | Regressions undetected | Write unit + statistical assertion tests |
| Sensitivity tier distribution not validated | **MEDIUM** | May not match client expectation for demo | Write assertion test for 50/35/15 distribution |

---

## 7. Remediation Priorities

| Priority | Item | Effort | Dependency |
|----------|------|--------|------------|
| P0 | Implement `generateDepositBalances()` (2.19M rows — needs streaming) | 4h | None |
| P0 | Implement `generateLendingBook()` (3,600 rows) | 2h | None |
| P0 | Implement `generateTreasuryPositions()` (14,600 rows) | 2h | None |
| P0 | Create `data/bank/DATA_CARD.md` | 1h | None |
| P1 | Write 7 unit tests (row counts, sensitivity distribution, NIM range, FX pairs, seed reproducibility) | 4h | Generators complete |
| P1 | Wire `generateBankDataset()` to include all 7 generators in return | 30min | Generators complete |
| P2 | Add per-table TypeScript interfaces for type safety | 2h | None |
