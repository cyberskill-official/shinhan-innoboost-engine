# ADR TL;DR — Shinhan Innoboost 2026

> One-page summary of the three foundational Architecture Decision Records. Read the full ADRs at `docs/adr/shinhan-innoboost/001..003-*.md`.

**Status**: Proposed (pending architecture council ratification)
**Date**: 2026-05-02

---

## ADR-SHB-001 — Host Platform

**Decision**: Build the demo in a **standalone repo** (`cyberskill-official/shinhan-innoboost-engine`), not inside ShinhanOS. Port to ShinhanOS post-PoC.

**Why**: ShinhanOS is mid-development; coupling the demo to its release schedule risks demo slippage. Portability constraints (no ShinhanOS imports, MIT/Apache-only deps, module-boundary mapping) ensure the post-PoC port is mechanical.

**What it unblocks**: P01-T01 (monorepo skeleton), all Phase 1+ tasks.

---

## ADR-SHB-002 — Model Stack

**Decision**: Use **Claude Sonnet 4.6** for NL→SQL generation, **Claude Opus 4.6** for adversarial eval/policy oversight, and **Qwen-2.5-72B-Instruct AWQ-Q4** as the on-prem fallback. Routing is policy-layer-driven; model swaps are config changes.

**Why**: Sonnet 4.6 has the strongest financial-SQL accuracy in our testing. Qwen-72B fits a single H100 80GB in AWQ-Q4 quantisation. Shinhan's Q&A validated Qwen as acceptable. The routing matrix ensures cloud ↔ on-prem switching is automatic on API failure or per-tenant policy.

**What it unblocks**: P00-T05 (GPU procurement), P02-T02 (NL→SQL pipeline), P02-T03 (policy layer), P04-T01 (gold-set), P04-T02 (adversarial set).

**Open**: Qwen licence commercial-deployment compatibility — pending legal confirmation.

---

## ADR-SHB-003 — Warehouse Stack

**Decision**: Default to **PostgreSQL 16** (with pgvector, pg_partman, pg_stat_statements, pg_audit) for laptop and on-prem. Ship **BigQuery** and **Snowflake** adapters with tests. Feature-parity matrix governs which features work on which backend.

**Why**: Postgres is on-prem-friendly and runs identically on laptop, demo, and production. Multi-adapter is a credibility signal — the SF9/SB5 briefs reference BigQuery and Snowflake environments. The parity matrix prevents silent cross-backend bugs.

**What it unblocks**: P01-T04 (IaC), P01-T08 (encryption), P02-T01 (metric layer), P02-T08 (caching).

**Parity legend**: ✅ Blessed (full parity, CI-tested) · ⚠️ Best-effort (documented degradation) · ❌ Not-supported (feature-flagged off).

---

## For the squad

- **If you're starting a new feature**: check the parity matrix in ADR-SHB-003 before writing warehouse-touching code.
- **If you're choosing a dependency**: check the portability constraints in ADR-SHB-001 (MIT/Apache-only, no ShinhanOS imports).
- **If you're configuring a model**: check the routing matrix in ADR-SHB-002 (policy-layer-driven, not model-layer-driven).
- **If you disagree with any decision**: author a superseding ADR (ADR-SHB-00Xa) and bring it to the architecture council. Never silently override.
