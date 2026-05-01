# eval/

Gold-set + adversarial corpus + metrics framework + harness CLI.

## Sub-modules

| Path | Purpose | Anchor FR |
|---|---|---|
| `gold-set/` | 90+ Q&A entries across 3 BUs | P04-T01 |
| `gold-set/{svfc,bank,securities}/` | Per-BU gold-set entries | P04-T01 |
| `adversarial/` | 310+ adversarial test items | P04-T02 |
| `adversarial/{injection,ambiguity,out_of_scope,sensitive_extraction}/` | Per-category items | P04-T02 |
| `metrics/` | Evaluation metrics framework | P04-T03 |
| `cli/` | `cyber-eval` CLI | P04-T04 |

## Quickstart

```bash
# Run gold-set against staging
pnpm --filter @cyberskill/shinhan-eval cyber-eval run --bu=svfc --suite=gold

# Run adversarial corpus
pnpm --filter @cyberskill/shinhan-eval cyber-eval run --bu=all --suite=adversarial
```

## See also

- [`gold-set/SCHEMA.md`](gold-set/SCHEMA.md)
- [`gold-set/AUTHORSHIP.md`](gold-set/AUTHORSHIP.md)
- [`adversarial/SCHEMA.md`](adversarial/SCHEMA.md)
- [`adversarial/PUBLIC_SUMMARY.md`](adversarial/PUBLIC_SUMMARY.md)
- [`metrics/METRICS.md`](metrics/METRICS.md)
