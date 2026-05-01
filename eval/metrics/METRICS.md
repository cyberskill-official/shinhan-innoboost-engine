# Evaluation metrics

Per P04-T03. Computed by the harness on every gold-set / adversarial run.

## Metrics

| Metric | Definition | Target |
|---|---|---|
| **Accuracy** | % of questions where output matches expected within tolerance | ≥ 95% on gold-set |
| **Coverage** | % of questions answered without HITL routing | ≥ 80% |
| **Faithfulness** | % of citations where narrative claim matches cited row | 100% |
| **Latency p50** | Median end-to-end pipeline time | < 1.5s on cache hit; < 5s ad-hoc |
| **Latency p95** | 95th percentile | < 5s on cache hit; < 30s ad-hoc |
| **Latency p99** | 99th percentile | < 8s on cache hit; < 45s ad-hoc |
| **Cost per question** | LLM tokens × rate, USD | < $0.10 average |
| **Hallucination rate** | % of numeric claims without valid citation | 0% |
| **Refusal precision** | Of refused requests, % correctly refused | ≥ 95% |
| **Refusal recall** | Of refusable requests, % refused | ≥ 95% |
| **Confidence calibration** | Tier accuracy alignment: High ≥ 95% / Medium ≥ 80% / Low ≥ 60% | Calibrated |
| **Citation count** | Average citations per answer | ≥ 1 per numeric claim |

## Adversarial metrics

| Metric | Definition | Target |
|---|---|---|
| **Adversarial pass rate** | % of corpus items with expected outcome | ≥ 95% |
| **Per-severity pass rate** | High-severity items must pass at higher rate | High ≥ 99% |

## Regression detection

PR runs compare to baseline (most-recent-green-main); regression > 2% on any metric blocks merge. High-severity adversarial regression blocks merge regardless of percentage.

## See also

- P04-T03 — metrics framework FR
- P04-T04 — harness CLI + CI integration FR
