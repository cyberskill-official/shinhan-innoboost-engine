# Confidence-tier scoring formula

Per P02-T05 + AI Doctrine v1.0.0.

## Formula

```
score = 0.30 × schema_match
      + 0.20 × validator_pass_strength
      + 0.20 × eval_similarity
      + 0.15 × freshness_factor
      + 0.15 × ambiguity_factor
```

All five components in [0.0, 1.0]. Total clamped to [0.0, 1.0].

## Tier mapping

| Score | Tier |
|---|---|
| `score < 0.60` | Low |
| `0.60 ≤ score < 0.85` | Medium |
| `score ≥ 0.85` | High |

Per AI Doctrine v1.0.0 (locked 2026-04-25). Per-tenant override allowed within bounds [0.5, 0.95].

## Component definitions

### schema_match (weight 0.30)
Top-1 retrieval similarity score from the metric registry retriever (P02-T02). Range 0.0–1.0.

### validator_pass_strength (weight 0.20)
- 1.0 = clean validator pass.
- 0.7 = pass with documented warnings (e.g., subquery without explicit tenant predicate but inferred safe).
- 0.0 = validator failure (won't reach scoring; refusal triggered).

### eval_similarity (weight 0.20)
Cosine similarity > 0.85 to a known-good gold-set entry returns that entry's pass rate. New questions: 0.0.

### freshness_factor (weight 0.15)
- 1.0 if data is < 1 hour old.
- Linear decay to 0.0 at 24 hours.
- 0.0 if data is > 7 days stale (regardless of other components, total score < 0.6 → Low tier).

### ambiguity_factor (weight 0.15)
- 1.0 if intent classifier confidence > 0.85.
- Linear decay to 0.0 at 0.5 or below.

## Worked examples

### Example 1: clean cache hit

- schema_match: 0.95
- validator: 1.0
- eval_similarity: 0.92
- freshness: 1.0 (< 1h old)
- ambiguity: 0.95
- score: 0.95×0.30 + 1.0×0.20 + 0.92×0.20 + 1.0×0.15 + 0.95×0.15 = **0.96** → **High**

### Example 2: marginal

- schema_match: 0.72
- validator: 0.7 (pass with warning)
- eval_similarity: 0.0 (novel question)
- freshness: 0.5 (~12h stale)
- ambiguity: 0.7
- score: 0.72×0.30 + 0.7×0.20 + 0.0×0.20 + 0.5×0.15 + 0.7×0.15 = **0.535** → **Low** (routes to HITL)

### Example 3: stale-data killer

- schema_match: 1.0
- validator: 1.0
- eval_similarity: 1.0
- freshness: 0.0 (> 7 days)
- ambiguity: 1.0
- score: regardless of other inputs, freshness term = 0; total ≤ 0.85 = **Medium** with stale warning.

(Special rule: if freshness_factor = 0, force tier ≤ Medium and surface a "stale data" badge.)

## Versioning

This formula is part of AI Doctrine v1.0.0. Changes require ratification + supersession ADR.

## See also

- P02-T05 — confidence-tier FR
- AI Doctrine v1.0.0 (`references/ai-doctrine/`)
