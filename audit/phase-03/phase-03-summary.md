# Phase 03 — Synthetic Datasets: Audit Summary

> **Auditor**: Antigravity Engine Audit  
> **Date**: 2026-05-02  
> **Phase Completion**: 🟡 ~50%  
> **Risk Level**: HIGH (blocks Phase 4 gold-set validation)  

---

## Aggregate Scorecard

| Task | Status | AC Pass Rate | Tests | LoC | Key Gap |
|------|--------|-------------|-------|-----|---------|
| [P03-T01](P03-T01-svfc-dataset.md) SVFC Dataset | 🟡 55% | 7/14 (50%) | 0 | 255 | 4 generators missing (payments, risk_scores, collections, campaigns) |
| [P03-T02](P03-T02-bank-dataset.md) Bank Dataset | 🟡 45% | 7/13 (54%) | 0 | 206 | 3 generators missing (deposits, lending, treasury) + no DATA_CARD |
| [P03-T03](P03-T03-securities-dataset.md) Securities Dataset | 🟡 50% | 8/15 (53%) | 0 | 252 | 4 generators missing (holdings, trades, portfolios, watchlists) + no intraday |
| [P03-T04](P03-T04-faker-vn-tooling.md) Faker-VN Tooling | 🟢 80% | 14/18 (78%) | 0 | 341 | Census weighting + 31 provinces missing |

**Totals**: 1,054 LoC | **0 tests** | 36/60 AC criteria met (60%)

---

## Cross-Task Gap Analysis

### 🔴 Critical: Missing Generators (11 total)

The pattern across all three datasets is identical: **schemas are fully defined but generator functions are only partially implemented**. Each generator.ts file exports a main `generate{BU}Dataset()` function that only invokes 3–4 of the required generators.

| Dataset | Generators Present | Generators Missing | Missing Row Volume |
|---------|-------------------|-------------------|-------------------|
| SVFC | 4/8 | payments (2M), risk_scores (18.25M), collections (15K), campaigns (50) | ~20.27M rows |
| Bank | 4/7 | deposits (2.19M), lending (3.6K), treasury (14.6K) | ~2.21M rows |
| Securities | 4/8 | holdings (150K), trades (5M), portfolios (5K), watchlists (30K) | ~5.19M rows |

**Total missing**: ~27.67M rows across 11 generators.

### 🔴 Critical: Zero Tests

**Not a single test file exists** across the entire `data/` directory. This is the most severe gap in Phase 3. Without tests:
- Seed reproducibility is unverified
- Row count assertions don't exist
- Statistical distribution validation doesn't exist
- PII collision scans don't exist

### 🟡 Important: Documentation Gaps

| Artefact | SVFC | Bank | Securities |
|----------|------|------|-----------|
| DATA_CARD.md | ✅ | ❌ | ❌ |
| Schema docs | Via loader | Via loader | Via loader |
| README | ✅ (shared) | ✅ (shared) | ✅ (shared) |

### 🟡 Important: Faker-VN Limitations

- Only 32/63 Vietnamese provinces
- Surname distribution is uniform (not census-weighted)
- Address generation limited to HCM only

---

## Dependency Impact

```
Phase 3 (Data) → Phase 4 (Eval)
  │
  ├── Gold-set questions reference ALL tables
  │   └── Missing generators = gold-set queries FAIL
  │
  ├── Adversarial corpus tests against actual data
  │   └── Missing data = false pass on sensitivity tests
  │
  └── Eval metrics framework needs pipeline results
      └── No data = no pipeline = no metrics
```

**Bottom line**: Phase 4 cannot achieve >60% accuracy until all 11 missing generators are implemented.

---

## Remediation Roadmap

### Sprint 1 (Week 1): Generator Completion
| Item | Effort | Owner |
|------|--------|-------|
| SVFC: payments, risk_scores (streaming), collections, campaigns | 8h | eng-data |
| Bank: deposits (streaming), lending, treasury | 8h | eng-data |
| Securities: holdings, trades (streaming), portfolios, watchlists | 11h | eng-data |
| Wire all generators into main export functions | 2h | eng-data |

### Sprint 2 (Week 2): Testing & Documentation
| Item | Effort | Owner |
|------|--------|-------|
| 25+ unit tests across all 4 tasks | 12h | eng-data |
| Create Bank DATA_CARD.md | 1h | eng-data |
| Create Securities DATA_CARD.md | 1h | eng-data |
| Faker-VN census weighting + 63 provinces | 4h | eng-data |
| Postgres load scripts verified | 4h | eng-infra |

### Sprint 3 (Week 3): Integration Verification
| Item | Effort | Owner |
|------|--------|-------|
| Load all 3 datasets into local Postgres | 4h | eng-infra |
| Run gold-set SVFC subset against loaded data | 4h | eng-eval |
| Run gold-set Bank subset against loaded data | 4h | eng-eval |
| Run gold-set Securities subset against loaded data | 4h | eng-eval |

---

## Phase Risk Summary

| Risk | Probability | Impact | Overall |
|------|-------------|--------|---------|
| Missing generators block Phase 4 | HIGH | HIGH | 🔴 CRITICAL |
| Zero tests allow regression | HIGH | HIGH | 🔴 CRITICAL |
| Large row volumes (18M+) cause OOM | MEDIUM | MEDIUM | 🟡 MODERATE |
| Missing DATA_CARDs fail audit | LOW | MEDIUM | 🟡 MODERATE |
| Faker-VN limitations affect demo credibility | LOW | LOW | 🟢 LOW |
