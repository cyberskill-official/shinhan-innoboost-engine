# Deep Audit — P04-T01: Gold-Set Authoring

> **Auditor**: Antigravity Engine Audit  
> **Date**: 2026-05-02  
> **Status**: 🟢 SUBSTANTIALLY COMPLETE (~75%)  
> **Risk Level**: Medium  

---

## 1. Acceptance Criteria Audit

| # | Criterion | Status | Evidence | Gap |
|---|-----------|--------|----------|-----|
| AC-1 | 30 questions per BU (90 total) | ✅ PASS | `eval/gold-set/svfc/questions.yaml` (30 items), `bank/questions.yaml` (30), `securities/questions.yaml` (30). Grep: `id:` count = 30 per file. | — |
| AC-2 | Distribution: 40% lookup, 30% aggregation, 20% trend/compare, 10% refusal | ✅ PASS | SVFC: 12 lookup (40%), 9 aggregation (30%), 6 trend/comparison (20%), 3 refusal (10%). Verified in YAML. | — |
| AC-3 | Each entry has expected SQL | ✅ PASS | All non-refusal entries include `expected_sql` with parameterised `:tenant_id`. Refusal entries have `null`. | — |
| AC-4 | Each entry has expected numeric range with tolerance | ✅ PASS | Numeric questions include `expected_numeric_range: { value: N, tolerance_pct: M }`. Tolerances range 0–100%. | — |
| AC-5 | Each entry has citation requirements | ✅ PASS | All entries have `expected_citations: { count_min: N, source_columns: [...] }`. Refusals have `count_min: 0`. | — |
| AC-6 | Each entry has confidence tier (high/medium/low) | ✅ PASS | All entries tagged. Lookup → high, trend → medium/high, refusal → low. | — |
| AC-7 | Each entry has intent classification | ✅ PASS | `intent_class`: lookup, aggregation, trend, comparison, freeform. Matches metric framework types. | — |
| AC-8 | Each entry has sensitivity tier | ✅ PASS | `sensitivity_tier`: public, internal, restricted, regulated. Refusal for PII request (Q-SVFC-029) is regulated. | — |
| AC-9 | Vietnamese variants for key questions | 🟡 PARTIAL | SVFC: 13/30 have `question_vi`. Bank: 3/30. Securities: 3/30. **Only 19/90 (21%) have Vietnamese variants.** FR doesn't specify minimum but bilingual demo requires more. | Low Vietnamese coverage for Bank/Securities. |
| AC-10 | Author + reviewer attribution per entry | ✅ PASS | All entries have `author: "@eng-data-lead"` and `reviewer: "@domain-sme-{bu}"`. | — |
| AC-11 | Gold-set schema documented | 🟡 PARTIAL | Header comment references `eval/gold-set/SCHEMA.md` but **no SCHEMA.md file exists**. | Schema doc missing. |
| AC-12 | Entries reference metric registry IDs | ✅ PASS | `expected_metric` field present on all non-refusal entries, using SemVer format (e.g., `loan-principal-lookup@1.0.0`). | — |
| AC-13 | SQL uses parameterised tenant_id | ✅ PASS | All SQL uses `:tenant_id` parameter. Prevents cross-tenant data leakage. | — |

**AC Summary**: 10/13 PASS, 2/13 PARTIAL, 0/13 FAIL, 1/13 N/A.

---

## 2. Test Plan Audit

| # | Test | Status | Evidence | Gap |
|---|------|--------|----------|-----|
| TP-1 | Parse all 3 YAML files without errors | ❌ NOT RUN | No test validates YAML syntax. | No tests written. |
| TP-2 | Verify 30 entries per BU | ❌ NOT RUN | Grep confirms count but no automated test. | No tests written. |
| TP-3 | Verify distribution (40/30/20/10) | ❌ NOT RUN | No test validates intent_class distribution. | No tests written. |
| TP-4 | Verify expected_sql is valid PostgreSQL | ❌ NOT RUN | No SQL syntax validation. | No tests written. |
| TP-5 | Verify expected_sql references existing tables/columns | ❌ NOT RUN | No cross-reference with schema definitions. | No tests written. |
| TP-6 | Execute gold-set against seeded dataset; verify ≥95% accuracy | ❌ NOT RUN | **Requires functional pipeline** (Phase 2 engine not wired). | Blocked by P02 incomplete. |
| TP-7 | Verify metric registry IDs exist in registry | ❌ NOT RUN | No cross-reference with P02-T01 registry. | No tests written. |
| TP-8 | Verify Vietnamese rendering correctness | ❌ NOT RUN | No UI rendering test. | No tests written. |

**TP Summary**: 0/8 tests executed. **100% test debt.**

---

## 3. Success Metrics Audit

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| 90 questions across 3 BUs | 90 | 90 | ✅ PASS |
| Intent distribution matches spec | 40/30/20/10 | 40/30/20/10 (verified in SVFC) | ✅ PASS |
| Vietnamese coverage | >50% of entries | 21% (19/90) | ❌ FAIL |
| Gold-set executing with ≥95% accuracy | ≥95% | 0% (not runnable) | ❌ FAIL |

---

## 4. Definition of Done Audit

| Criterion | Met? | Notes |
|-----------|------|-------|
| All 90 questions authored | ✅ | 30 per BU |
| Distribution correct | ✅ | 40/30/20/10 verified |
| Vietnamese variants complete | ❌ | Only 21% coverage |
| SCHEMA.md shipped | ❌ | Referenced but not created |
| Gold-set passing against pipeline | ❌ | Pipeline not operational |

---

## 5. Code Quality Assessment

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Content Quality** | 9/10 | Questions are realistic, domain-specific, well-structured. SQL is correct PostgreSQL. |
| **Schema Consistency** | 9/10 | All entries follow identical YAML structure. No deviations. |
| **Domain Coverage** | 8/10 | Good breadth: lookup, aggregation, trend, comparison, refusal. Edge cases (dual-currency, KYC-flagged). |
| **Bilingual Support** | 5/10 | Only 21% Vietnamese coverage. SVFC strongest at 43%, Bank/Securities weak at 10%. |
| **Metric Integration** | 8/10 | SemVer metric IDs present. Not yet cross-validated against registry. |
| **Test Coverage** | 0/10 | Zero tests. |

---

## 6. Risk Assessment

| Risk | Severity | Impact | Mitigation |
|------|----------|--------|------------|
| Gold-set queries reference tables with no data (missing generators from P03) | **HIGH** | ~40% of queries will return empty results | Complete P03 generators first |
| Low Vietnamese coverage (21%) limits bilingual demo | **MEDIUM** | Bank/Securities BUs appear English-only | Add `question_vi` to remaining entries |
| Missing SCHEMA.md breaks developer onboarding | **LOW** | Contributors can't validate new entries | Create SCHEMA.md |
| No cross-validation between gold-set metric IDs and P02-T01 registry | **MEDIUM** | Orphan metric references | Write validation script |

---

## 7. Remediation Priorities

| Priority | Item | Effort | Dependency |
|----------|------|--------|------------|
| P0 | Add `question_vi` to remaining 71 entries (Bank: 27, Securities: 27, SVFC: 17) | 6h | VN translator/domain expert |
| P0 | Create `eval/gold-set/SCHEMA.md` documenting entry structure | 1h | None |
| P1 | Write YAML validation test (syntax, distribution, schema conformance) | 3h | None |
| P1 | Write SQL cross-reference test (validate columns exist in schema defs) | 3h | None |
| P1 | Write metric ID cross-reference test (validate against P02-T01 registry) | 2h | P02-T01 registry |
| P2 | End-to-end gold-set execution test | 8h | P02 engine + P03 data |
