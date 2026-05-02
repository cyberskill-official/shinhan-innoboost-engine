# Deep Audit — P03-T01: SVFC Consumer Finance Synthetic Dataset

> **Auditor**: Antigravity Engine Audit  
> **Date**: 2026-05-02  
> **Status**: 🟡 PARTIALLY COMPLETE (~55%)  
> **Risk Level**: Medium  

---

## 1. Acceptance Criteria Audit

| # | Criterion | Status | Evidence | Gap |
|---|-----------|--------|----------|-----|
| AC-1 | 10 tables defined in schema | ❌ FAIL | `data/svfc/generator.ts` defines 8 tables (branches, products, customers, loans, payments, risk_scores, collections_actions, marketing_campaigns). FR specifies 10. | **2 tables missing** — FR references `staff` and `approvals` tables not implemented. |
| AC-2 | 50K customers generated | ✅ PASS | `generateCustomers(faker, 50_000)` — default count is 50,000. | — |
| AC-3 | 120K loans with NPL ~2.5% | ✅ PASS | `generateLoans` with count=120,000; NPL distribution seeded at ~2.5% (overdue), ~0.3% (written_off), ~0.2% (restructured). Lines 223–231. | — |
| AC-4 | 2M payment records | 🟡 PARTIAL | Schema declares `rowCount: 2_000_000` but **no `generatePayments()` function exists**. The `generateSvfcDataset()` export only returns branches, products, customers, loans. | **Payment generator missing** — schema-only stub. |
| AC-5 | 18.25M risk score snapshots | 🟡 PARTIAL | Schema declares `rowCount: 18_250_000` but **no `generateRiskScores()` function exists**. Not returned from `generateSvfcDataset()`. | **Risk-score generator missing** — schema-only stub. |
| AC-6 | 15K collections actions | 🟡 PARTIAL | Schema declares `rowCount: 15_000` but **no `generateCollectionsActions()` function exists**. Not returned from `generateSvfcDataset()`. | **Collections generator missing** — schema-only stub. |
| AC-7 | 50 marketing campaigns | 🟡 PARTIAL | Schema declares `rowCount: 50` but **no `generateMarketingCampaigns()` function exists**. Not returned from `generateSvfcDataset()`. | **Marketing generator missing** — schema-only stub. |
| AC-8 | Seed-reproducible (same seed → identical output) | ✅ PASS | `FakerVN(seed)` uses `SeededRandom` LCG. Deterministic by design. | — |
| AC-9 | No real PII collision (SYN- prefix) | ✅ PASS | `cccd()` returns `SYN-{province}{number}`. Emails use `@example.vn`. | — |
| AC-10 | DATA_CARD.md shipped | ✅ PASS | `data/svfc/DATA_CARD.md` present with provenance, sensitivity classification, edge cases, limitations. 50 lines. | — |
| AC-11 | Sensitivity tiers tagged | ✅ PASS | Columns tagged: `restricted` (name, phone, email, DOB), `regulated` (CCCD), `internal` (collections notes). | — |
| AC-12 | Edge cases seeded (NPL, dual-currency, KYC-flagged) | ✅ PASS | ~2% KYC-flagged (L192), ~1% USD loans (L233), NPL distribution seeded. | — |
| AC-13 | Multi-warehouse DDL (Postgres / BQ / Snowflake) | ✅ PASS | `loader.ts` generates DDL for all 3 targets via `generateDDL(table, target)`. | — |
| AC-14 | Loader generates INSERT batches | ✅ PASS | `generateInserts()` with configurable batch size. SQL injection safe via single-quote escaping. | — |

**AC Summary**: 7/14 PASS, 5/14 PARTIAL (schema stubs only), 1/14 FAIL (table count short), 1/14 N/A.

---

## 2. Test Plan Audit

| # | Test | Status | Evidence | Gap |
|---|------|--------|----------|-----|
| TP-1 | Generate dataset with seed=42; verify row counts | ❌ NOT RUN | **Zero test files** exist under `data/`. No `*.test.ts` or `*.spec.ts`. | No tests written. |
| TP-2 | Regenerate with seed=42; verify byte-identical output | ❌ NOT RUN | No reproducibility test. | No tests written. |
| TP-3 | Generate with seed=99; verify different output | ❌ NOT RUN | No seed-variation test. | No tests written. |
| TP-4 | Verify NPL ratio in [2.0%, 3.5%] | ❌ NOT RUN | No statistical assertion. Code seeds ~2.5% but no test validates range. | No tests written. |
| TP-5 | Verify no real-PII collision (SYN- prefix scan) | ❌ NOT RUN | No PII scan test. | No tests written. |
| TP-6 | Generate DDL for each warehouse target; verify SQL syntax | ❌ NOT RUN | No DDL syntax test. | No tests written. |
| TP-7 | Load into Postgres; verify row counts match schema | ❌ NOT RUN | No integration test against Postgres. | No tests, no Postgres instance. |
| TP-8 | Sensitivity tier enforcement: restricted columns blocked for analyst role | ❌ NOT RUN | No RBAC integration test. | Cross-module dependency (P01-T07). |

**TP Summary**: 0/8 tests executed. **100% test debt.**

---

## 3. Success Metrics Audit

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Dataset generated within 7 days | 7 days | Schema + 4/8 generators written | 🟡 Generators incomplete |
| 10 tables, all with data | 10 tables | 8 tables, 4 generators | ❌ FAIL |
| Seed reproducibility verified | Yes | Code-level deterministic, not test-verified | 🟡 UNVERIFIED |
| DATA_CARD.md shipped | Yes | Yes — 50 lines | ✅ PASS |
| Zero real PII | Zero | SYN- prefix used | ✅ PASS |

---

## 4. Definition of Done Audit

| Criterion | Met? | Notes |
|-----------|------|-------|
| All deliverables shipped | ❌ | 4 of 8 generators missing |
| Tests pass | ❌ | Zero tests exist |
| DATA_CARD.md shipped | ✅ | Present |
| FR ticket marked Done | ❌ | Cannot mark done with missing generators |

---

## 5. Code Quality Assessment

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Schema Design** | 9/10 | Well-structured `TableDef` with sensitivity tiers, multi-warehouse types. |
| **Generator Quality** | 7/10 | 4 generators (branches, products, customers, loans) are solid — realistic distributions, edge cases. 4 generators missing. |
| **Type Safety** | 8/10 | `Record<string, unknown>` is loosely typed; could use generated interfaces per table. |
| **Documentation** | 8/10 | DATA_CARD excellent. Inline comments adequate. |
| **Test Coverage** | 0/10 | Zero tests. |
| **Loader Tooling** | 8/10 | DDL + INSERT generators work for 3 warehouse targets. |

---

## 6. Risk Assessment

| Risk | Severity | Impact | Mitigation |
|------|----------|--------|------------|
| Missing 4 generators blocks gold-set queries (P04-T01) that reference payments, risk_scores, collections, campaigns | **HIGH** | Gold-set questions Q-SVFC-018, Q-SVFC-020, Q-SVFC-027 will fail | Implement remaining generators |
| Zero tests means regressions land silently | **HIGH** | Data drift undetected | Write seed-reproducibility + statistical assertion tests |
| Large row counts (18M risk_scores) may cause memory issues in generator | **MEDIUM** | Node.js heap pressure | Use streaming/batched generator pattern |
| No Postgres load script verified | **MEDIUM** | Production deployment blocked | Create `data/svfc/load.sql` and test against local PG |

---

## 7. Remediation Priorities

| Priority | Item | Effort | Dependency |
|----------|------|--------|------------|
| P0 | Implement `generatePayments()` | 2h | None |
| P0 | Implement `generateRiskScores()` — streaming pattern for 18M rows | 4h | None |
| P0 | Implement `generateCollectionsActions()` | 1h | None |
| P0 | Implement `generateMarketingCampaigns()` | 1h | None |
| P1 | Write 8 unit tests (seed reproducibility, row counts, NPL distribution, PII scan) | 4h | Generators complete |
| P1 | Create `data/svfc/load.sql` with verified Postgres DDL + COPY commands | 2h | None |
| P2 | Add 2 missing tables (`staff`, `approvals`) per FR spec | 3h | FR clarification |
| P2 | Refine type safety: generate per-table interfaces from schema | 2h | None |
