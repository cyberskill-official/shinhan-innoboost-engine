# Metric authorship workflow

Per P02-T01.

## Steps

1. **Identify the question pattern.** A metric exists because a recurring question demands it. If no question recurs, no metric.
2. **Design the metric.** Formula + dimensions + grain + sensitivity. Domain SME reviews.
3. **Author the YAML.** Per `SCHEMA.md`. Include all three warehouse formulas.
4. **Verify against datasets.** Run formula on synthetic data (P03-T01..T03); confirm reasonable results.
5. **Submit PR.** Reviewer = metric owner + peer engineer + (if sensitivity ≥ Restricted) compliance lead.
6. **CI runs.** Schema lint; cross-warehouse equality test on sample dataset; gold-set regression check.
7. **Merge.** Deploy syncs registry; embeddings regenerate; available within 5 min.

## Common mistakes

- Skipping the Vietnamese example.
- Sensitivity classified as `public` when at least `internal` is correct.
- Forgetting the `tenant_id` predicate in the formula (validator catches; document anyway).
- Per-warehouse formulas that don't return identical numerical results on sample data.
