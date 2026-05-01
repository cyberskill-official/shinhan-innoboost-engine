# engine/

Chat-with-data core. NL→SQL pipeline + policy layer + citation engine + confidence scoring + audit log.

## Sub-modules

| Path | Purpose | Anchor FR |
|---|---|---|
| `auth/` | RBAC engine — capability + tenant + sensitivity model | P01-T07 |
| `metrics/` | Semantic metric layer + warehouse adapters | P02-T01 |
| `nl-to-sql/` | NL→SQL pipeline (intent + retriever + generator + validator + executor + post-processor) | P02-T02 |
| `policy/` | Deterministic policy layer with seed rules | P02-T03 |
| `citations/` | Citation engine + faithfulness validator | P02-T04 |
| `confidence/` | Confidence-tier scoring (Low / Medium / High) | P02-T05 |
| `security/prompt-injection/` | Layered injection defence | P02-T06 |
| `privacy/` | PDPL consent ledger + data-minimisation + sensitivity classifier | P02-T07 |
| `cache/` | Two-tier cache (L1 in-process + L2 Redis) | P02-T08 |
| `audit/` | Append-only hash-chained audit log | P02-T09 |
| `observability/` | Logger + tracing + metrics integration | P09-T01..T03 |
| `feedback/` | Reviewer-feedback → engine-improvement loop | P04-T05 |
| `crypto/` | Encryption + BYOK adapter | P01-T08 |
| `cost/` | Per-question cost attribution | P09-T05 |

## Quickstart

```bash
pnpm --filter @cyberskill/shinhan-engine dev
```

## Status

Stub. Implementation gated on:
1. ADR-SHB-001..003 ratification (P00-T02).
2. P01-T01 monorepo skeleton complete (this scaffold is its predecessor).
3. P03-T01..T04 datasets available.
