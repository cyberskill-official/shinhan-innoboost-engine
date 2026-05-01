# First-Light Rehearsal Results — Shinhan Innoboost 2026

> Captures results from the first GPU rehearsal: 50 gold-set questions through the on-prem Qwen-72B-AWQ-Q4 path.

**Date**: TBD
**Instance**: TBD (H100 SXM 80GB)
**Model**: Qwen-2.5-72B-Instruct AWQ-Q4
**Serving**: vLLM with OpenAI-compatible endpoint
**Total spend target**: < $10

---

## Configuration

| Parameter | Value |
|---|---|
| GPU | NVIDIA H100 80GB SXM |
| CUDA | 12.4 |
| vLLM version | (latest stable at run time) |
| Model | Qwen-2.5-72B-Instruct-AWQ |
| Quantisation | AWQ Q4 |
| Max model length | 8192 |
| GPU memory utilisation | 0.90 |

## Latency Results

| Metric | Target | Actual | Pass? |
|---|---|---|---|
| p50 latency | ≤ 2.0s | — | — |
| p95 latency | ≤ 8.0s | — | — |
| p99 latency | ≤ 12.0s | — | — |
| Cold-start time | — | — | — |
| Warm-start time | — | — | — |

## Accuracy Results

| Metric | Target | Actual | Pass? |
|---|---|---|---|
| Gold-set accuracy (50 questions) | ≥ 90% | — | — |
| SQL validity rate | ≥ 95% | — | — |
| Citation correctness | ≥ 90% | — | — |
| Vietnamese NL understanding | Qualitative | — | — |

## GPU Memory Profile

| Metric | Value |
|---|---|
| Model loaded VRAM | — |
| Peak VRAM during inference | — |
| KV cache headroom | — |

## Operational Notes

- Cold-start observations: —
- CUDA/driver issues: —
- vLLM configuration tweaks: —
- Weight download time: —
- Overall assessment: —

## Cost

| Item | Cost |
|---|---|
| Instance rental | — |
| Egress / transfer | — |
| **Total** | — |

---

## Conclusion

*To be filled after first-light rehearsal.*

| Decision | Notes |
|---|---|
| Proceed with Qwen-72B-AWQ-Q4? | — |
| Adjust quantisation? | — |
| Adjust vLLM config? | — |
| Update ADR-SHB-002? | — |
