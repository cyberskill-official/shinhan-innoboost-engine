# Gold-set entry schema

Per P04-T01. Each entry in `{svfc,bank,securities}/q-{id}.yaml`.

## Required fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Stable identifier; format `Q-{BU}-{NNN}` |
| `question` | string | English question |
| `question_vi` | string \| null | Vietnamese variant (≥ 50% have one) |
| `bu` | enum | `svfc` / `bank` / `securities` |
| `intent_class` | enum | `lookup` / `aggregation` / `trend` / `comparison` / `freeform` |
| `sensitivity_tier` | enum | `public` / `internal` / `restricted` / `regulated` |
| `expected_metric` | string | `metric-name@version` |
| `expected_sql` | string | Canonical SQL (semantic equivalents accepted by harness) |
| `expected_answer_shape` | enum | `table` / `chart` / `number` / `refusal` |
| `expected_numeric_range` | object \| null | `{ value: N, tolerance_pct: 2 }` for numeric answers |
| `expected_citations` | object | `{ count_min: N, source_columns: [...] }` |
| `expected_confidence_tier` | enum | `low` / `medium` / `high` |
| `author` | `@handle` | Domain SME who authored |
| `reviewer` | `@handle` | Metric owner who reviewed SQL |

## Coverage rubric (per BU)

- Lookup: 40% (12 of 30+)
- Aggregation: 30% (9 of 30+)
- Trend / comparison: 20% (6 of 30+)
- Out-of-scope / refusal: 10% (3 of 30+)

## See also

- [`AUTHORSHIP.md`](AUTHORSHIP.md)
- P04-T01 — gold-set authoring FR
