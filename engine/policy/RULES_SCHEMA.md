# Policy rules schema

Per P02-T03. Each rule in `rules/{rule-id}.yaml` follows this schema.

## Required fields

| Field | Type | Description |
|---|---|---|
| `id` | kebab-case string | Stable rule identifier |
| `description` | string | One paragraph |
| `gate` | enum | `pre-llm` / `mid-llm` / `post-execution` |
| `precondition` | expression | When this rule applies |
| `action` | enum | `allow` / `deny` / `route-to-hitl` / `mask` / `cost-confirm` |
| `priority` | enum | `sla-critical` / `high` / `normal` |
| `audit_fields` | string[] | Fields included in the audit-log entry |
| `owner` | `@handle` | Rule owner |
| `version` | semver | Rule version |

## Seed rules

- `pre-auth` — deny if JWT invalid.
- `pre-rbac` — deny if RBAC denies.
- `pre-rate-limit` — deny / warn on rate-limit exceedance.
- `pre-tenant` — deny on cross-tenant attempt.
- `pre-sensitivity` — deny on sensitivity-tier violation.
- `mid-cost-ceiling` — deny / cost-confirm on expensive query.
- `mid-sensitivity-column` — deny on column above tier.
- `mid-hitl-trigger` — route to HITL on confidence < 65% / sensitivity ≥ Restricted with role < admin / metric flagged.
- `mid-tenant-pause` — deny if tenant paused.
- `post-result-mask` — mask PII per RBAC scope.
- `post-confidence-threshold` — refuse if confidence below user-required threshold.
- `post-faithfulness-check` — spot-check claims; fail on mismatch.
- `post-regulated-row` — refuse on regulated row.

See P02-T03 FR for the full specification.
