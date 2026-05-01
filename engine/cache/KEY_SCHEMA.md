# Cache key schema

Per P02-T08. Two-tier cache (L1 in-process LRU + L2 Redis).

## Key components (all required)

| Component | Description |
|---|---|
| `tenant_id` | Tenant scope; cross-tenant cache hits are forbidden by construction |
| `role` | RBAC role of the requester |
| `sensitivity_max` | Highest sensitivity tier this requester can access |
| `question_hash` | SHA-256 of normalised question text |
| `metric_version` | Version of the metric used; bumping invalidates |
| `freshness_window_id` | Freshness-window bucket (e.g., per-day for daily metrics) |

## Normalisation

Question text is normalised before hashing:
- Whitespace collapsed.
- Lowercased for case-insensitive variants.
- Trailing punctuation stripped.
- (v1.1) Semantic-equivalence via embedding lookup.

## Key construction

```typescript
const cacheKey = createHash('sha256')
  .update(JSON.stringify({
    tenant_id,
    role,
    sensitivity_max,
    question_hash,
    metric_version,
    freshness_window_id,
  }))
  .digest('base64url');
```

Output: short, collision-resistant, opaque.

## Invalidation paths

- TTL expiry (5 min L1, 1 hour L2).
- `metric_version_bump` event in audit log triggers pub/sub invalidation of all keys with that metric.
- `freshness_window_id` change (e.g., daily metric rolls to new day) invalidates.
- Admin manual invalidation via P05-T05 admin console.

## See also

- P02-T08 — caching + latency FR
