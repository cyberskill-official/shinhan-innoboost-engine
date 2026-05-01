---
title: "Generate SVFC consumer-finance synthetic dataset"
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

Generate a synthetic consumer-finance dataset modelled on Shinhan Vietnam Finance Company's likely operational profile, sized realistically (~50K customers, ~120K loans, ~2M payments, 32 branches across Vietnam, 12 product categories, 365 days of risk-score snapshots, plus collections-actions and marketing-campaigns tables). The dataset is realistic enough that demo questions aren't toy-shaped (real VND amounts at correct magnitude, VN provincial branch distribution, ICB-Vietnam-style loan products, ~2.5% NPL distribution, seasonality), and synthetic enough that no real PII can leak (Faker-VN-generated identities; clearly synthetic ID-number patterns). Used by the engine for chat-with-data demos against the SVFC theme (P05-T02). Reproducible (seeded) so the same `make data SEED=42` produces an identical dataset every time.

## Problem

A demo against an empty database is unconvincing. A demo against real customer data is illegal. A demo against unrealistic toy data fails the credibility test the moment a Shinhan reviewer asks "show me NPL by branch over the last 6 months" and gets back an obviously-fake distribution. The Innoboost Q&A confirms (Section VI.2) "real customer data cannot be provided" but "Shinhan will provide simulated or masked data" — meaning we must demonstrate against synthetic data that is realistic enough to convince. Engagement A's reference (per P00-T01 sponsor consent) gives us pattern-level intuition for what realistic Vietnamese consumer-finance data shapes like.

Specific gaps if we shortcut:

- **Without realistic VND magnitudes, every numeric answer reads off-scale.** A loan principal of 1,000 VND or 1B VND would be implausible. Realistic distribution is small loans 5-50M VND, medium 50-300M VND, large 300M-2B VND.
- **Without VN provincial branch distribution, branch-level questions look fake.** SVFC has branches concentrated in HCMC + Hanoi + a long tail of provincial branches; the dataset replicates this.
- **Without realistic NPL distribution (~2.5% industry-typical), answers about NPL look synthetic.** NPLs cluster in specific products (CC-only customers) and in specific provinces.
- **Without seasonality, time-series answers are flat.** Lunar New Year (Tết) drives spending and lending spikes; the dataset reflects this.
- **Without edge cases (write-offs, restructured loans, dual-currency, KYC-flagged), the demo's responses are incomplete.** Real questions cover edge cases.

The `feedback_p1_scope_preference` memory note biases us richer. For datasets, "richer" means: more tables, more rows, more realistic distributions, more seeded edge cases, more documented data card. Each layer increases the demo's credibility under reviewer pressure.

## Proposed Solution

A reproducible dataset generation pipeline at `data/svfc/`:

1. **Schema.** ~10 tables: `customers`, `loans`, `payments`, `branches`, `products`, `risk_scores`, `collections_actions`, `marketing_campaigns`, `kyc_flags`, `transactions`. Each table has a documented schema with column types, sensitivity tier, expected freshness.
2. **Generator.** Python or Node script using Faker-VN extension (P03-T04); seedable; produces SQL or Parquet output.
3. **Data card.** Documents provenance (synthetic), generation method, statistical properties (distributions for key columns), known limitations, intended use.
4. **Loaders.** Postgres + BigQuery + Snowflake loaders (P03-T04 tooling); idempotent.
5. **Verification.** Data quality assertions: row counts, distribution shapes, edge-case presence; runs in CI on every regeneration.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Author the schema.** YAML at `data/svfc/SCHEMA.md` with tables and columns:
  - `customers (~50K)`: id, full_name, phone, email, address_province, address_district, dob, kyc_status, segment, joined_at, sensitivity_tier.
  - `branches (32)`: id, name, province, district, address, opened_at, branch_type.
  - `products (12)`: id, name, type (CC / personal_loan / auto_loan / etc.), interest_rate_range, term_range, target_segment.
  - `loans (~120K)`: id, customer_id, branch_id, product_id, principal_vnd, interest_rate, term_months, originated_at, status (current / NPL / written_off / restructured), maturity_at.
  - `payments (~2M)`: id, loan_id, due_at, paid_at, amount_vnd, status (on_time / late / missed).
  - `risk_scores (snapshot daily 365d)`: customer_id, score_date, score (300-850), factors_json.
  - `collections_actions`: customer_id, loan_id, action_type, taken_at, outcome.
  - `marketing_campaigns`: id, name, target_segment, sent_at, channel, response_count.
  - `kyc_flags`: customer_id, flag_type, raised_at, resolved_at.
  - `transactions`: id, customer_id, amount_vnd, type, posted_at, channel.
- [ ] **Define realism requirements.** VND amount distributions (small / medium / large by segment); branch province distribution (HCMC 22%, Hanoi 14%, others provincial); NPL distribution (~2.5% overall, ~7% in specific high-risk segments); product mix (CC 35%, personal loan 30%, auto 15%, others 20%); seasonality (Tết spike in disbursement Jan-Feb, payment delays Feb-Mar).
- [ ] **Define edge-case coverage.** Seeded into the data: ~50 written-off loans; ~80 restructured loans; ~15 dual-currency payments (VND + USD); ~30 KYC-flagged customers; ~5 customers with extreme (very high or very low) risk scores.
- [ ] **Implement the generator.** `data/svfc/generate.ts`. Seedable; uses Faker-VN (P03-T04) for VN-realistic identities; outputs SQL INSERT statements or Parquet files.
- [ ] **Implement loaders.** `data/svfc/load-postgres.sh`, `load-bigquery.sh`, `load-snowflake.sh`. Idempotent (drop-and-rebuild on full regen; incremental on partial).
- [ ] **Author the data card.** `data/svfc/DATA_CARD.md`. Sections: provenance (synthetic), generation method, statistical properties, edge cases seeded, known limitations, intended use, sensitivity classification per table.
- [ ] **Implement quality assertions.** `data/svfc/verify.ts`. Runs after generation: row counts match expected; key distributions within tolerance; edge cases present; no duplicate primary keys; foreign keys consistent.
- [ ] **CI integration.** Adding a generator change → CI regenerates and verifies; verification failure blocks merge.
- [ ] **Document for engine tech lead.** Reference docs for the metric layer (P02-T01) authors so they know what fields exist when writing metric definitions.

### Acceptance criteria

- Schema documented; data card published.
- Generator produces all 10 tables; row counts match expected; quality assertions pass.
- Loaders work for Postgres / BigQuery / Snowflake; idempotent.
- Edge cases seeded and present.
- Reproducible: `make data SEED=42` produces identical dataset across runs.
- CI integration verifies on every change.
- Realism: VND magnitudes, branch distribution, NPL rate, seasonality all match documented expectations.

## Alternatives Considered

- **Use a real Vietnam-finance public dataset.** Rejected: public datasets at this granularity don't exist; even if they did, mixing public data with our synthetic-realism story is muddled.
- **Use Faker without VN customisation.** Rejected: Faker default produces US-style names, addresses, phone numbers; obviously fake; reviewer credibility issue.
- **Skip seasonality; trust uniform distributions.** Rejected: Tết season is the most-asked-about period for VN-finance reporting; lacking seasonality means the demo's most important answers ring false.
- **Use real masked Shinhan data when provided post-kickoff.** Rejected: that's *post*-kickoff; we need the dataset for rehearsals before kickoff.
- **Generate only the customers table; derive everything else live in the engine.** Rejected: data layer is the engine's external dependency; pre-generating is correct.

## Success Metrics

- **Primary**: All 10 tables generated, loaded to Postgres, and verified within 14 days of task assignment.
- **Guardrail**: Quality assertions pass on every regeneration; zero data-quality regressions in CI.

## Scope

### In scope
- Schema + 10 tables.
- Generator + loaders.
- Data card.
- Quality assertions + CI integration.

### Out of scope
- Bank dataset (P03-T02).
- Securities dataset (P03-T03).
- Faker-VN tooling (P03-T04).
- Multi-tenant version (single-tenant for the demo).

## Dependencies

- **Upstream**: P03-T04 (Faker-VN); P01-T04 (Postgres + warehouse access).
- **Downstream**: P02-T01 (metric registry), P04-T01 (gold-set authoring), P05-T02 (SVFC theme).
- **People**: eng-data authoring; engine tech lead consulting on schema; founder ratifying realism assumptions.

## Open Questions

- Q1: Do we anchor distributions on actual SVFC public data (annual report) or on industry averages? Recommendation: industry averages; SVFC public data is too narrow.
- Q2: How do we handle PII? Recommendation: all synthetic via Faker-VN; sensitivity tags applied even though synthetic, so the engine treats them correctly.
- Q3: For seasonality, which years' calendar drives Tết? Recommendation: 2024-2026 actual Tết dates; documented.
- Q4: Refresh cadence (daily simulated activity)? Recommendation: not needed for demo; static snapshot suffices.

## Implementation Notes

- Generation order: customers → branches → products → loans → payments → risk_scores → collections → marketing → kyc → transactions. Foreign keys flow accordingly.
- For names, Faker-VN generates Vietnamese name patterns (Họ + Tên đệm + Tên).
- For phone numbers, format `+84 9XX XXX XXX` or `+84 3XX XXX XXX`.
- For addresses, use VN province / district hierarchy from public data (Wikipedia or Open Street Map).
- For VND amounts, store as `bigint` (VND has no decimals); display formatting handled by the chart layer.
- Seed all randomness with the `SEED` env var; mod by row index for per-row randomness.

## Test Plan

- Test 1: Reproducibility — generate twice with same seed; verify identical output.
- Test 2: Quality assertions — run on generated data; verify all pass.
- Test 3: Loader — load to Postgres; query basic counts; verify match.
- Test 4: Cross-warehouse equality — load to Postgres + BigQuery; same query → same result (modulo dialect).
- Test 5: Edge cases — query for written-off loans; verify ~50 returned; same for restructured, dual-currency, KYC-flagged.
- Test 6: Realism check — manual review by domain SME; confirm distributions look right.

## Rollback Plan

- A bad regeneration is rolled back by re-running with the previous SEED.
- A bad schema change is rolled back via PR revert; data regenerated.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Schema | `data/svfc/SCHEMA.md` | Eng-data | Continuous |
| Generator | `data/svfc/generate.ts` | Eng-data | Continuous |
| Loaders | `data/svfc/load-*.sh` | Eng-data | Continuous |
| Data card | `data/svfc/DATA_CARD.md` | Eng-data | Continuous |
| Quality-assertion script | `data/svfc/verify.ts` | Eng-data | Continuous |
| CI integration | `.github/workflows/data-ci.yml` | Eng-data | Continuous |

## Operational Risks

- **Distribution drift if SEED changes accidentally.** Mitigation: SEED pinned in CI.
- **Realism falls short under reviewer pressure.** Mitigation: domain-SME spot-check before rehearsal.
- **Loader fails for one warehouse adapter.** Mitigation: cross-warehouse test in CI.

## Definition of Done

- 10 tables generated, loaded, verified.
- Data card published.
- CI integration green.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR); Claude may assist generator-script authoring with human review.
- **Scope**: Claude drafted all sections of this FR.
- **Human review**: eng-data authors and reviews generator; engine tech lead reviews schema; domain SME spot-checks realism.
