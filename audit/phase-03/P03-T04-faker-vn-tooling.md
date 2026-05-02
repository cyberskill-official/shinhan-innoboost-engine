# Deep Audit — P03-T04: Faker-VN Tooling & Loader

> **Auditor**: Antigravity Engine Audit  
> **Date**: 2026-05-02  
> **Status**: 🟢 SUBSTANTIALLY COMPLETE (~80%)  
> **Risk Level**: Low  

---

## 1. Acceptance Criteria Audit

| # | Criterion | Status | Evidence | Gap |
|---|-----------|--------|----------|-----|
| AC-1 | Seedable PRNG with deterministic output | ✅ PASS | `SeededRandom` class (LCG: `state * 1664525 + 1013904223`). Bit masking with `& 0xffffffff`. | — |
| AC-2 | Vietnamese name generator (family + middle + given) | ✅ PASS | `fullName()` returns `{family} {middle} {given}`. 16 family names (Nguyễn 40% real-world frequency implicit), 15 middle, 24 given. | — |
| AC-3 | Vietnamese surname distribution matching census | 🟡 PARTIAL | 16 surnames present. Uniform random pick — **not weighted by census frequency** (Nguyễn should be ~38%, Trần ~11%, Lê ~9.5%). | Distribution not census-weighted. |
| AC-4 | Synthetic CCCD generator with SYN- prefix | ✅ PASS | `cccd()` returns `SYN-{2-digit}{10-digit}`. Clearly synthetic. No collision with real 12-digit CCCD format. | — |
| AC-5 | Vietnamese phone number generator | ✅ PASS | `phone()` uses real VN prefixes (09, 03, 07, 08, 05) + 8 digits. | — |
| AC-6 | Vietnamese email generator | ✅ PASS | `email()` normalises diacritics (NFD + strip combining marks + đ→d). Uses `@example.vn`. Includes `.syn{random}` to ensure uniqueness. | — |
| AC-7 | Vietnamese province list (32+) | ✅ PASS | `VN_PROVINCES` exports 32 provinces with correct diacritics (Hà Nội, TP. Hồ Chí Minh, etc.). | — |
| AC-8 | Vietnamese address generator | ✅ PASS | `address()` generates `{number} {street}, {district}, TP. HCM`. 14 real HCM streets (Nguyễn Huệ, Lê Lợi, etc.). | Only HCM addresses — may need expansion. |
| AC-9 | VND amount generator at realistic magnitude | ✅ PASS | `vndAmount(min, max)` rounds to nearest 1,000 VND (realistic — no VND coins). | — |
| AC-10 | Vietnamese stock symbols (HOSE + HNX) | ✅ PASS | 40 HOSE symbols + 10 HNX symbols. All real tickers. | — |
| AC-11 | Stock price generator (VND-realistic) | ✅ PASS | `stockPrice()` rounds to nearest 100 VND (matching VN exchange tick size). | — |
| AC-12 | UUID generator | ✅ PASS | RFC4122-like v4 UUID format. Hex-based with version=4, variant=8/9/a/b. | — |
| AC-13 | Administrative hierarchy (63 provinces) | ❌ FAIL | Only 32 provinces. FR specifies all 63 Vietnamese provinces for administrative hierarchy. | **31 provinces missing.** |
| AC-14 | Weighted random selection | ✅ PASS | `SeededRandom.weighted()` — correct cumulative weight algorithm. | — |
| AC-15 | Multi-warehouse DDL generator (Postgres/BQ/Snowflake) | ✅ PASS | `loader.ts` `generateDDL(table, target)` handles type mapping per warehouse. | — |
| AC-16 | INSERT batch generator | ✅ PASS | `generateInserts()` with configurable batch size. SQL string escaping via single-quote doubling. | — |
| AC-17 | Schema documentation generator | ✅ PASS | `generateSchemaDoc()` produces Markdown table with column types, nullability, sensitivity. | — |
| AC-18 | Data card generator | ✅ PASS | `generateDataCard()` produces provenance, table list, limitations, usage instructions. | — |

**AC Summary**: 14/18 PASS, 1/18 PARTIAL, 1/18 FAIL, 2/18 N/A.

---

## 2. Test Plan Audit

| # | Test | Status | Evidence | Gap |
|---|------|--------|----------|-----|
| TP-1 | Seed reproducibility: same seed → same output | ❌ NOT RUN | No test file. | No tests written. |
| TP-2 | Different seed → different output | ❌ NOT RUN | No test. | No tests written. |
| TP-3 | CCCD format: `SYN-{2}{10}` regex match | ❌ NOT RUN | No test. | No tests written. |
| TP-4 | Phone format: valid VN prefix + 8 digits | ❌ NOT RUN | No test. | No tests written. |
| TP-5 | Email format: valid + @example.vn | ❌ NOT RUN | No test. | No tests written. |
| TP-6 | Province list completeness (63 provinces) | ❌ NOT RUN | Would fail — only 32 present. | No tests written. |
| TP-7 | Weighted random distribution statistically correct | ❌ NOT RUN | No test validates weighted() convergence. | No tests written. |
| TP-8 | DDL output is valid SQL syntax | ❌ NOT RUN | No syntax validation test. | No tests written. |
| TP-9 | INSERT escapes single quotes correctly | ❌ NOT RUN | No SQL injection test. | No tests written. |
| TP-10 | Surname distribution matches census (Nguyễn ≥35%) | ❌ NOT RUN | Would fail — uniform distribution, not census-weighted. | No tests written. |

**TP Summary**: 0/10 tests executed. **100% test debt.**

---

## 3. Success Metrics Audit

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Faker-VN library functional | Yes | Yes — all core generators work | ✅ PASS |
| Loader tooling for 3 warehouse targets | 3 targets | 3 targets (PG, BQ, SF) | ✅ PASS |
| Census-weighted surname distribution | Yes | Uniform distribution | ❌ FAIL |
| 63 provinces | 63 | 32 | ❌ FAIL |

---

## 4. Definition of Done Audit

| Criterion | Met? | Notes |
|-----------|------|-------|
| All deliverables shipped | 🟡 | Core library works; census weighting and full provinces missing |
| Tests pass | ❌ | Zero tests |
| FR ticket marked Done | ❌ | 2 acceptance criteria unmet |

---

## 5. Code Quality Assessment

| Dimension | Score | Notes |
|-----------|-------|-------|
| **API Design** | 9/10 | Clean class-based API. SeededRandom exposed via `.random` getter. Clear method names. |
| **Correctness** | 8/10 | LCG PRNG is well-implemented. Diacritic normalisation is thorough (NFD + combining mark strip). |
| **Extensibility** | 8/10 | Easy to add new generators (just add methods to FakerVN). |
| **VN Domain Accuracy** | 7/10 | Real streets, real tickers, real prefixes. Missing census weighting + 31 provinces. |
| **Type Safety** | 8/10 | Well-typed with `readonly` arrays. Generics on `pick<T>` and `weighted<T>`. |
| **Test Coverage** | 0/10 | Zero tests. |
| **Loader Quality** | 8/10 | DDL + INSERT + SchemaDoc + DataCard — comprehensive. BQ/SF type mapping could be more complete (JSONB→JSON mapping). |

---

## 6. Risk Assessment

| Risk | Severity | Impact | Mitigation |
|------|----------|--------|------------|
| Missing 31 provinces limits geographic diversity | **LOW** | Acceptable for demo; 32 covers major areas | Add remaining provinces in Phase 2 |
| Non-census-weighted surnames may look unrealistic to VN domain experts | **MEDIUM** | Client may notice surname distribution anomalies | Add weighted name generation |
| LCG PRNG has known statistical weaknesses | **LOW** | Acceptable for synthetic data; not for crypto | Document limitation |
| Zero tests mean PRNG regressions undetected | **MEDIUM** | Any code change could break reproducibility | Write seed-verification tests |

---

## 7. Remediation Priorities

| Priority | Item | Effort | Dependency |
|----------|------|--------|------------|
| P1 | Write 10 unit tests (seed reproducibility, format validation, weighted distribution) | 4h | None |
| P1 | Add census-weighted surname generation (Nguyễn 38%, Trần 11%, Lê 9.5%, etc.) | 2h | None |
| P2 | Expand VN_PROVINCES from 32 to 63 | 2h | None |
| P2 | Add district lists beyond HCM (Hà Nội, Đà Nẵng, etc.) | 3h | None |
| P3 | Document PRNG limitations in README | 30min | None |
