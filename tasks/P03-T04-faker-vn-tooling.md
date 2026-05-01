---
title: "Build Faker-VN extension and reproducible loader tooling"
author: "@cyberskill-eng-data"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-06-05"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Build a Faker-VN extension package (`@cyberskill/faker-vn`) that produces Vietnamese-realistic synthetic identities — names (Họ + Tên đệm + Tên with realistic surname/given-name distributions); addresses (province / district / ward hierarchy from VN public administrative data); phone numbers (+84 9XX XXX XXX format with carrier-realistic prefixes); national ID numbers (CCCD format with clearly synthetic patterns to prevent any chance of real-ID collision); email patterns; KYC document patterns. Build a reproducible loader-tooling layer that wraps Postgres / BigQuery / Snowflake loading with idempotency, seed control, and verification. The Faker-VN extension is consumed by the SVFC (P03-T01), Bank (P03-T02), Securities (P03-T03) datasets; without it, every dataset reinvents VN-specific generation logic. The loader tooling normalises across warehouse adapters; without it, every dataset reinvents the load logic.

## Problem

Standard Faker libraries are US/EU-centric. Vietnamese names follow a different pattern (surname is rarely "Nguyen" in 35-40% of the population — Faker's default doesn't capture this distribution). Addresses follow a different administrative hierarchy (province → district → ward, with names that don't appear in any English-only Faker). Phone numbers follow VN carrier prefix conventions. Without a VN-specific extension, every synthetic dataset (P03-T01, P03-T02, P03-T03) generates US-shaped identities — obviously fake to a Vietnamese reviewer.

Specific gaps if we shortcut:

- **Without realistic VN name distributions, "show me top customers by name" returns "John Smith / Mary Johnson" — credibility-destroying.**
- **Without VN province/district hierarchy, "show me NPL by province" returns "California / Texas" — same problem.**
- **Without carrier-realistic phone prefixes, "send a notification to customer X" demos look fake.**
- **Without clearly-synthetic ID patterns, accidental ID-collision risk is non-zero (real CCCDs exist; we must avoid them).**
- **Without standardised loader tooling, each dataset reinvents Postgres-vs-BigQuery-vs-Snowflake load logic — duplication, bugs, drift.**

The `cyberskill_company_facts` memory note locks the company as a Vietnam-based JSC; our reviewers and our customers are Vietnam-based; obviously-VN data is the floor, not the ceiling.

The `feedback_p1_scope_preference` memory note biases us richer. For Faker-VN, "richer" means: realistic surname distribution; realistic given-name distribution by gender + birth-decade; full administrative hierarchy down to ward level; carrier-realistic phone-number prefixes; CCCD with explicit synthetic markers; KYC document patterns; standardised loader tooling that handles idempotency, seed, verification.

## Proposed Solution

A package + tooling pair:

1. **`@cyberskill/faker-vn` package.** TypeScript; exports `name()`, `surname()`, `givenName(gender, birthYear)`, `address()`, `province()`, `district()`, `ward()`, `phoneNumber()`, `cccd()`, `email()`, `kycDocumentNumber()`. Seedable.
2. **Loader tooling.** Helpers in `data/_lib/` for: `loadPostgres(connection, table, rows)`, `loadBigQuery(...)`, `loadSnowflake(...)`. Idempotent, seedable, reverse-engineerable from logs.

Setup target: 7 days from task assignment (this is foundational infra; it gates the dataset tasks).

### Subtasks

- [ ] **Compile VN administrative data.** Province / district / ward names from public sources (VN General Statistics Office); store as JSON at `packages/faker-vn/data/administrative.json`.
- [ ] **Compile VN surname distribution.** Top-200 Vietnamese surnames with relative frequencies; store at `packages/faker-vn/data/surnames.json`. Sources: published linguistic data; manually verified.
- [ ] **Compile VN given-name distribution.** By gender + birth decade (2000s, 1990s, 1980s, 1970s, 1960s+); top-200 per category; from `packages/faker-vn/data/given-names.json`.
- [ ] **Compile VN phone-prefix data.** Carrier prefixes (Viettel, Mobifone, Vinaphone, Vietnamobile) with realistic relative frequencies; store at `packages/faker-vn/data/phone-prefixes.json`.
- [ ] **Define synthetic CCCD pattern.** Real CCCD format is 12 digits: 3-digit province + 1-digit gender/century + 2-digit birth-year + 6-digit serial. We use a clearly-synthetic province code (`999`) so no synthetic CCCD can match a real one. Document in the package README and in every dataset's data card.
- [ ] **Implement `name()`, `surname()`, `givenName(gender, birthYear)`.** Sample from distributions; seedable.
- [ ] **Implement `address()`, `province()`, `district()`, `ward()`.** Hierarchical sampling; province → district within province → ward within district.
- [ ] **Implement `phoneNumber()`.** Carrier prefix + 7-digit suffix.
- [ ] **Implement `cccd()`.** Synthetic-province-code (999) + gender/century digit + birth-year + 6-digit serial.
- [ ] **Implement `email()`.** Lowercased name + dot + random-2-digit + at + (gmail.com / yahoo.com / cyberskill.world / synthesised-vn-domain).
- [ ] **Implement `kycDocumentNumber()`.** Synthetic CCCD or passport pattern.
- [ ] **Publish package.** `@cyberskill/faker-vn@1.0.0` to internal npm.
- [ ] **Implement loader tooling.** `data/_lib/loaders.ts` with helpers per warehouse; common interface `loadTable(adapter, table, rows, options)`.
- [ ] **Implement loader idempotency.** Each loader checks: does the table exist with the expected schema? If not, create. Are the rows already loaded (compared by row hash)? If yes, skip; if differ, drop-and-rebuild. Atomic.
- [ ] **Implement loader verification.** Post-load: count rows; spot-check 5 random rows for content-correctness; verify foreign keys. Run in CI.
- [ ] **Document package + tooling.** `packages/faker-vn/README.md`; `data/_lib/README.md`.
- [ ] **Test exhaustively.** Tests for distribution shapes (names sampled match expected frequency), administrative hierarchy correctness, CCCD synthetic-marker presence, loader idempotency.

### Acceptance criteria

- `@cyberskill/faker-vn@1.0.0` published to internal npm.
- All documented functions implemented and tested.
- Distribution data (administrative, surnames, given-names, phone-prefixes) compiled and stored.
- Loader tooling implemented for Postgres + BigQuery + Snowflake; tested for idempotency.
- Documentation published.
- Test suite > 50 tests covering all functions and idempotency.

## Alternatives Considered

- **Use a third-party VN-faker library.** Rejected: such libraries exist but are unmaintained / incomplete / unverified for distribution accuracy. Building our own is small and gives us control.
- **Hand-author static fixtures (no faker).** Rejected: scale issues — millions of rows.
- **Use US Faker and post-process names.** Rejected: post-processing produces obviously-stitched names; native distribution sampling is more realistic.
- **Skip ward-level addresses; use only province + district.** Rejected: ward-level adds realism for street-address use cases.
- **Use the real CCCD format without the synthetic marker.** Rejected: collision risk with real IDs; legal concern; synthetic marker is the safety belt.

## Success Metrics

- **Primary**: Package published and consumed by P03-T01 / T02 / T03 within 7 days of task assignment.
- **Guardrail**: Zero CCCD-collision events (no synthetic CCCD matches a real CCCD); verified by checking the synthetic-marker prefix on every generated value.

## Scope

### In scope
- Faker-VN package with all documented functions.
- Distribution data compiled and stored.
- Loader tooling for three warehouses.
- Documentation.
- Test suite.

### Out of scope
- Faker for non-VN locales (deferred unless needed).
- Faker for non-personal data (e.g., synthetic financial-instrument generation — handled by P03-T03).
- Real-time data streaming (the demo uses batch-loaded snapshots).

## Dependencies

- **Upstream**: P01-T01 (monorepo); internal npm registry.
- **Downstream**: P03-T01, P03-T02, P03-T03.
- **People**: eng-data authoring.
- **External**: VN administrative data from public sources.

## Open Questions

- Q1: Updates to administrative data when VN restructures (e.g., new wards)? Recommendation: annual refresh; documented.
- Q2: Should we support Vietnamese accents in generated emails? Recommendation: no — emails are Latin-only by convention; document.
- Q3: For phone prefix distribution, should it match current Vietnam carrier shares? Recommendation: yes, approximately; sources documented.

## Implementation Notes

- Faker-VN is a pure utility library; no I/O.
- For seed propagation, the seed flows from the dataset generator to Faker-VN's internal random source.
- For loader idempotency, hash rows on insert; cached hashes detect re-runs.
- For data files, JSON is fine at this scale; revisit if administrative data grows large.

## Test Plan

- Test 1: Distribution test — sample 10K names; verify the surname distribution matches the documented frequencies within 5%.
- Test 2: Administrative hierarchy — sample 100 addresses; verify province → district → ward consistency.
- Test 3: CCCD synthetic marker — generate 1000 CCCDs; verify all start with the synthetic-province code.
- Test 4: Loader idempotency — load 100 rows; re-run loader; verify no duplicates; verify row count unchanged.
- Test 5: Cross-warehouse load — load same data to Postgres + BigQuery; verify row counts match.

## Rollback Plan

- Bad distribution data → revert via PR; package versioned.
- Bad loader bug → revert; consumers re-run.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| `@cyberskill/faker-vn` package | Internal npm | Eng-data | Continuous |
| Administrative data | `packages/faker-vn/data/administrative.json` | Eng-data | Continuous |
| Surname distribution | `packages/faker-vn/data/surnames.json` | Eng-data | Continuous |
| Given-names distribution | `packages/faker-vn/data/given-names.json` | Eng-data | Continuous |
| Loader tooling | `data/_lib/loaders.ts` | Eng-data | Continuous |
| Documentation | `packages/faker-vn/README.md`; `data/_lib/README.md` | Eng-data | Continuous |

## Operational Risks

- **Distribution data outdated (administrative restructuring).** Mitigation: annual refresh.
- **Loader idempotency hash collision.** Mitigation: SHA-256; collision negligible.
- **CCCD synthetic marker accidentally removed.** Mitigation: test verifies presence; CI fails if absent.

## Definition of Done

- Package published.
- Loader tooling shipped.
- All tests passing.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: eng-data authors implementation; engine tech lead reviews loader interface.
