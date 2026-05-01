# ADR-SHB-002: Model Stack

- **Status**: Proposed
- **Date**: 2026-05-02
- **Authors**: @engine-tech-lead, @stephen-cheng
- **Ratifier**: @stephen-cheng
- **Supersedes**: (none)

## Context

The demo-build-plan.md specifies: "primary (Claude Sonnet for SQL gen + Opus for adversarial eval), fallback (open-weight on-prem — Qwen 2.5 72B per Shinhan's stated openness to Qwen)." Three things require concrete locking: which Claude model exactly, which Qwen variant and quantisation, and what the routing logic between primary and fallback is.

The Innoboost Q&A confirms Shinhan's openness to Qwen ("Using open-source models like Qwen is perfectly acceptable") and disclaims preference for any specific model. The Q&A also confirms commercial-phase deployments "must be deployed per SBV regulations" — typically on-prem — making the on-prem model path a first-class requirement, not a fallback afterthought.

Per `feedback_p1_scope_preference`: lean richer. The richer configuration (Opus for adversarial eval, Sonnet 4.6 for generation, 72B Qwen for on-prem) is preferred over minimal-viable choices.

## Decision

Use Claude Sonnet 4.6 as the primary NL→SQL generator, Claude Opus 4.6 as the adversarial-eval and policy-layer overseer, and Qwen-2.5-72B-Instruct AWQ-Q4 as the on-prem fallback — with a policy-layer-driven routing matrix that makes model swaps a config change.

## Consequences

Positive consequences:
- Best-in-class SQL generation accuracy from Claude Sonnet 4.6 on financial-domain schemas.
- Strongest adversarial-eval coverage from Claude Opus 4.6 (drives P04-T02 prompt-injection corpus).
- Viable on-prem path with Qwen-72B on a single H100 80GB — meets SBV deployment requirements.
- Routing matrix is policy-driven, not model-driven — swapping primary or fallback is a config change, not a code change.

Negative consequences:
- Cloud-primary path has a hard dependency on Anthropic API availability; mitigated by the fallback routing.
- AWQ-Q4 quantisation loses some accuracy vs. FP16; mitigated by eval-harness measurement in P04.
- Dual-model approach (Sonnet + Opus) increases cloud API costs; mitigated by cache layer (P02-T08).

Neutral consequences:
- Embedding model choice (text-embedding-3-large cloud / Qwen-Embedding on-prem) follows the same routing pattern.
- Future model upgrades (e.g., Sonnet 4.7) are handled via ADR supersession, not silent swap.

## Model Configuration

### Primary NL→SQL Generator
- **Model**: Claude Sonnet 4.6
- **Model ID**: `claude-sonnet-4-6`
- **Use case**: SQL generation from natural-language questions; result post-processing; narrative generation with citations.
- **Provider**: Anthropic API (cloud path)

### Adversarial Eval & Policy-Layer Overseer
- **Model**: Claude Opus 4.6
- **Model ID**: `claude-opus-4-6`
- **Use case**: Generates the prompt-injection corpus (P04-T02); serves as the policy-layer secondary classifier for sensitive-query detection; runs adversarial evaluation scoring.
- **Provider**: Anthropic API (cloud path)

### On-Prem Fallback
- **Model**: Qwen 2.5 72B Instruct
- **Quantisation**: AWQ Q4 (~48GB VRAM; fits single H100 80GB with ~32GB headroom for KV cache)
- **Licence**: Tongyi Qianwen License Agreement (verify commercial-deployment compatibility with legal — see Open Questions)
- **Serving**: vLLM with OpenAI-compatible endpoint
- **Hardware target**: single NVIDIA H100 80GB SXM

### Embedding Model
- **Cloud**: OpenAI `text-embedding-3-large` (1536 dims)
- **On-prem**: Qwen-Embedding (matches Qwen model family for consistency)
- **Storage**: pgvector (per `shinhanos_tech_stack`)

### Routing Matrix

| Condition | Primary Model | Fallback Model | Trigger |
|---|---|---|---|
| Normal cloud operation | Claude Sonnet 4.6 | — | Default |
| Claude API 5xx error | — | Qwen-2.5-72B-AWQ-Q4 | Automatic |
| Claude API rate-limit hit | — | Qwen-2.5-72B-AWQ-Q4 | Automatic |
| Per-tenant policy: air-gap mode | — | Qwen-2.5-72B-AWQ-Q4 | Policy-driven |
| Manual override by admin | Configurable | Configurable | Admin console toggle |
| Adversarial eval scoring | Claude Opus 4.6 | — | Always Opus (no fallback) |

Routing logic lives in the **policy layer** (P02-T03), not the model layer. This separation ensures model swaps do not require engine-code changes.

### Benchmark Snapshot (Pre-Eval Baseline)

| Metric | Claude Sonnet 4.6 (expected) | Qwen-72B-AWQ-Q4 (expected) | Source |
|---|---|---|---|
| Financial-SQL accuracy | ≥95% on gold-set | ≥88% on gold-set | CyberSkill internal evals (Engagement A patterns) |
| p50 latency | ~1.0s (API) | ~1.8s (H100 SXM) | Prior project telemetry |
| p95 latency | ~3.5s (API) | ~6.0s (H100 SXM) | Prior project telemetry |
| Vietnamese NL understanding | Excellent | Good (some diacritic edge cases) | Internal testing |
| Structured-output reliability | Excellent (tool-use mode) | Good (JSON mode) | Internal testing |

*Note: These are expected values from prior CyberSkill projects, not formal benchmarks. Formal benchmarks will be captured in P04 (Eval Harness).*

## Alternatives considered

- **GPT-4 family (GPT-4o, GPT-4-turbo).** Rejected: not as strong on financial-domain SQL generation in our internal evals; higher per-token cost; less control over structured output.
- **Llama-3-70B.** Rejected: underperforms Qwen-2.5-72B on financial-domain structured output in CyberSkill internal evals; weaker tool-use support.
- **Gemini 2.5.** Rejected: cloud-lock-in concern (Google-only serving); less Vietnamese-language fluency in our testing.
- **DeepSeek-V3/R1.** Rejected: geopolitical risk presenting a Chinese-headquartered model to a Korean financial group. Even though technically strong, the optics are unfavourable.
- **Mistral-Large-2.** Rejected: closed-weights commercial licence; not viable for air-gap deployments where full weight access is required.
- **Fine-tuning a base model on financial data.** Rejected: out of scope for the demo timeline; fine-tuning requires Shinhan-specific data we won't have until kickoff.
- **Single model (cloud-only, no on-prem fallback).** Rejected: closes off the on-prem commercialisation path that the Innoboost Q&A identifies as mandatory for SBV compliance.
- **FP16 Qwen-72B on multi-H100.** Rejected: doubles GPU rental cost; FP16 vs. AWQ-Q4 accuracy delta on financial SQL is small in our internal evals; AWQ path is closer to real-world Shinhan deployment.

## Implementation

- Task IDs unblocked: P01-T01 (monorepo skeleton — model client configuration), P02-T02 (NL→SQL pipeline), P02-T03 (policy layer with routing), P02-T05 (confidence scoring), P02-T06 (prompt-injection defence), P04-T01 (gold-set authoring), P04-T02 (adversarial test set), P00-T05 (GPU procurement — model choice locked).
- Configuration changes: model client configuration in `engine/config/models.ts`; routing rules in `engine/config/routing.ts`; vLLM serving config in `infra/gpu/vllm-config.yaml`.
- Documentation updates: update `shinhanos_tech_stack` memory note with model-stack divergence.

## Open Questions (carried from P00-T02 FR)

- Q1: Include eval-harness model choice in this ADR or separate? **Decision: included** (adversarial eval uses Opus 4.6, captured above).
- Q2: Air-gap = Qwen only? **Decision: yes** — air-gap mode routes exclusively to Qwen-72B; no Claude API access in air-gap.
- Q3: Does the Tongyi Qianwen License Agreement permit commercial deployment by a financial customer in Vietnam? **Pending legal confirmation.**

## Sign-off

- [x] Ratifier: @stephen-cheng on 2026-05-02
- [ ] Engine tech lead: @______ on ____-__-__
- [ ] Platform tech lead: @______ on ____-__-__

## Supersession chain

- This ADR supersedes: (none)
- This ADR is superseded by: (none yet)
