# data/

Synthetic dataset generators per BU.

## Sub-modules

| Path | Purpose | Anchor FR |
|---|---|---|
| `_lib/` | Shared loader tooling (Postgres / BigQuery / Snowflake) | P03-T04 |
| `svfc/` | SVFC consumer-finance dataset | P03-T01 |
| `bank/` | Bank HO Department dataset | P03-T02 |
| `securities/` | Securities synthetic dataset | P03-T03 |

## Reproducibility

```bash
make data SEED=42
```

Same SEED produces identical datasets across runs. Pin the SEED in CI for stable gold-set results.

## See also

- Each BU folder's `SCHEMA.md` and `DATA_CARD.md`.
- `packages/faker-vn/` — VN-realistic identity generator.
