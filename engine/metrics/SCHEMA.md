# Metric YAML schema

Every metric in `definitions/{metric-name}.yaml` follows this schema. Authoritative reference for P02-T01.

## Required fields

| Field | Type | Description |
|---|---|---|
| `name` | kebab-case string | Metric identifier; stable across versions |
| `description` | string | One paragraph; what the metric measures |
| `owner` | `@handle` | Metric owner; on the hook for accuracy |
| `version` | semver | Metric definition version |
| `formula_postgres` | SQL string | Postgres-flavoured formula with named parameters |
| `formula_bigquery` | SQL string | BigQuery Standard SQL formula |
| `formula_snowflake` | SQL string | Snowflake SQL formula |
| `dimensions` | string[] | List of dimension columns |
| `grain` | string | e.g., `daily`, `monthly`, `branch`, `customer` |
| `freshness_expected` | duration string | e.g., `< 24 hours`, `< 1 hour` |
| `sensitivity` | enum | `public` / `internal` / `restricted` / `regulated` |
| `source_tables` | string[] | Tables consumed; for lineage |
| `source_columns` | object | `{ table_name: [col, col, ...] }` for lineage + minimisation |
| `tags` | string[] | e.g., `["consumer-finance", "p&l"]` |
| `examples` | string[] | Sample questions resolving to this metric |

## Example

```yaml
name: monthly-disbursement-by-branch
description: Total disbursement for a given month aggregated by branch.
owner: '@eng-data-lead'
version: 1.0.0
formula_postgres: |
  SELECT branch_id, SUM(principal_vnd) AS disbursement_vnd
  FROM loans
  WHERE tenant_id = :tenant_id
    AND originated_at >= :month_start
    AND originated_at < :month_end
  GROUP BY branch_id
formula_bigquery: ...
formula_snowflake: ...
dimensions: [branch_id]
grain: monthly
freshness_expected: '< 24 hours'
sensitivity: internal
source_tables: [loans, branches]
source_columns:
  loans: [branch_id, principal_vnd, originated_at, tenant_id]
  branches: [id]
tags: [consumer-finance, disbursement]
examples:
  - 'What was disbursement in March 2026 by branch?'
  - 'Doanh số giải ngân tháng 3/2026 theo chi nhánh?'
```

## See also

- [`AUTHORSHIP.md`](AUTHORSHIP.md) — how to author a new metric
- [`adapters/PARITY.md`](adapters/PARITY.md) — feature parity matrix
- P02-T01 — semantic metric layer FR
