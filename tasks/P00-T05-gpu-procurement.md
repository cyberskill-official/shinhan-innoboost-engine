---
title: "Procure on-demand GPU for on-prem rehearsal infra"
author: "@cyberskill-ops"
department: operations
status: draft
priority: p1
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: not_ai
target_release: "2026-05-22"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Procure and operate an on-demand GPU environment (one H100 80GB primary, A100 80GB acceptable fallback) for rehearsing the on-prem deployment path of the demo — specifically the Qwen 2.5 72B Instruct fallback model that ADR-SHB-002 (P00-T02) commits to. The GPU is rented hourly from Lambda Labs (primary) or Runpod (fallback), used during model-loading rehearsals, eval-harness dry-runs against the on-prem path, and 24-hour reservations the day before each major demo to validate the full stack against the actual hardware profile. Without this rehearsal capacity, the on-prem deployment story (P10-T03) is theoretical at the interview, which is the single weakest possible answer to the most predictable Shinhan-reviewer question: "show us this running on-prem." Total budget cap: USD 1,200 over 30 days.

## Problem

ADR-SHB-002 commits us to a Qwen-2.5-72B Instruct on-prem fallback path. The Innoboost Q&A confirms (Section VI.4) that "the commercial phase might require on-premise hosting based on the requirements from SBV." The Q&A also confirms (Section VI.3) that Shinhan will discuss specific hardware post-selection — meaning we won't know their exact infra envelope until kickoff. We must therefore rehearse against a representative GPU profile so that the claim "we can deploy on-prem" is a *demonstrated* claim, not a marketing one.

The cost of skipping or shortcutting this is concrete and measurable:

- **We can't measure inference latency for Qwen-72B end-to-end.** Cold-start, warm-start, p95 under simulated load — none of these can be guessed; they have to be measured. The Form Answers commit to "p50 < 1.5s, p95 < 5s, p99 < 8s on cached metrics; ad-hoc < 30s" (paraphrased from demo-build-plan.md Phase 2.7); on-prem Qwen has to demonstrably hit those numbers.
- **We can't validate quantisation choices.** ADR-SHB-002 picks AWQ Q4 quantisation for Qwen-72B to fit on a single H100 80GB. AWQ-quantised models lose some accuracy vs. FP16; we have to measure how much, on financial-domain SQL specifically, before we go public with the claim.
- **We can't catch operational surprises.** Driver-version pinning, CUDA-version compatibility, vLLM serving config, HuggingFace download throttling, container-runtime gotchas, GPU memory fragmentation under sustained load — every one of these is a real production-deployment hazard that bites at 4 a.m. the day of a demo.
- **We can't rehearse the on-prem deployment recipe end-to-end.** The Phase 10 deployment task (P10-T03) ships an air-gap install bundle; that bundle has to be tested by actually deploying it on a clean GPU host and running through the install + verify cycle. Without GPU time, that test is hand-waved.
- **The demo-build-plan.md explicitly calls for a "fully working end-to-end using simulated data" path on-prem.** That path needs GPU time.

The Innoboost Q&A also flags an interesting cost expectation: "AI Box ~$5K" was mentioned by one applicant as a low-end on-prem reference. We should rehearse against that envelope too — if our model needs an H100 to perform acceptably, the commercialisation pricing must reflect that, and we should be honest about it during the pitch.

The `feedback_p1_scope_preference` memory note — Stephen consistently leans richer than minimal — biases us toward the H100 (richer than A100) at slightly higher cost. The decision is small ($0.50/hr difference between H100 and A100), and the H100's faster inference saves rehearsal-time cost that outweighs the rental-cost difference.

There is also a risk-reduction point: rehearsing the on-prem path *before* the interview gives us a candid measurement of what works and what doesn't, which feeds the FAQ doc (P12-T04) with honest, specific answers. Reviewers can sense bluffing; specific numbers (latency at percentile, accuracy on gold-set, GPU memory ceiling) defuse that pattern.

## Proposed Solution

A 30-day on-demand GPU rental plan with tiered usage: light usage during initial setup (< 2 hours/week), heavier usage during eval-harness work (Phase 4) and Phase 12 rehearsal, and 24-hour reservations the day before each major demo. Provider preference: Lambda Labs (cheaper steady-state, Vietnam-friendly billing, good H100 quota); Runpod as fallback for short bursts and as a redundant provider in case Lambda has quota issues. Cost cap: USD 1,200 across the 30-day window with weekly review.

### Subtasks

- [ ] **Confirm GPU choice.** Primary: H100 80GB SXM (best Qwen-72B-AWQ-Q4 fit). Fallback: A100 80GB if H100 quota constrained at the time of need. Reject anything below 80GB VRAM — Qwen-72B-AWQ-Q4 needs ~48GB, leaving ~32GB for context cache; lower VRAM produces OOM under multi-turn or long-context conditions.
- [ ] **Compare providers.** Quick scan: Lambda Labs ($2.49/hr H100 PCIe, $2.99/hr H100 SXM at posted rates); Runpod ($2.39–3.99/hr depending on region); Vast.ai ($2.00–3.00/hr spot, less reliable); CoreWeave (enterprise-tier, overkill for our scope). Pick Lambda for primary (more predictable, transparent billing), Runpod for short bursts or fallback.
- [ ] **Open accounts.** Create accounts at Lambda Labs and Runpod. Set up billing with founder credit-card-on-file for Innoboost-budgeted spend, with explicit hourly-spend alerts (set initial alert at $50/day and $300/week; escalate alerts to founder + ops).
- [ ] **Set up SSH access.** Generate squad-shared SSH key pair (or per-engineer key pair, whichever matches CyberSkill's standard); store keys in the secrets vault per P01-T03; rotate per ENG-OPS standard (90-day rotation).
- [ ] **Build the launch script.** `infra/gpu/spin-up.sh` brings up an H100 instance with our preferred image (Ubuntu 22.04 LTS + CUDA 12.4 + PyTorch 2.4 + vLLM latest stable + transformers latest stable + AutoAWQ for quantised model loading), pulls our pre-quantised Qwen-72B-AWQ-Q4 weight bundle from the internal artefact store, and starts the inference server (vLLM with OpenAI-compatible endpoint). Target: from `./spin-up.sh` to "ready" state in < 10 minutes (most of which is image pull and weight download; iterate to optimise).
- [ ] **Build the tear-down script.** `infra/gpu/tear-down.sh` captures any artefacts (eval-run outputs, latency snapshots, log archives), uploads them to the project artefact store, snapshots the instance for forensic recovery if needed, then terminates the instance. Idempotent; safe to run multiple times.
- [ ] **Build the usage log.** `infra/gpu/usage.md` is auto-appended on every spin-up / tear-down with: launch time, tear-down time, total runtime, total cost, who launched (handle), why (rehearsal type), tear-down notes. Reviewed weekly by ops lead.
- [ ] **Pre-stage Qwen-2.5-72B-Instruct AWQ-quantised weights.** Quantise from the upstream FP16 weights using AutoAWQ; store quantised weights in our internal artefact store (HuggingFace Hub mirror behind a private token, or S3 bucket — whichever has the better Vietnam-friendly egress). Document the licence (Qwen-Instruct under the Tongyi Qianwen License Agreement; verify commercial-use compatibility with legal before staging — see Open Question Q1 below).
- [ ] **First-light rehearsal.** Spin up GPU, load Qwen-72B-AWQ-Q4 in vLLM, run 50 gold-set questions through the on-prem path (a subset of the eventual P04-T01 gold-set), capture latency at p50/p95/p99 and accuracy vs. expected answers, tear down. Total spend target: < $10. Capture results in `infra/gpu/first-light-results.md`.
- [ ] **Second rehearsal: full-stack integration test.** Spin up GPU, deploy the entire engine stack (engine, hitl, ui, eval, observability) connected to the GPU-hosted Qwen via OpenAI-compatible endpoint, run a 30-minute simulated workload (50 questions across 3 BUs with realistic pacing), capture full-stack latency, error rate, eval scores, observability output. Total spend target: < $30.
- [ ] **Document the runbook.** `docs/runbooks/gpu-rehearsal.md` captures: when to launch (before each major rehearsal milestone, before each demo, on-demand for engine team load testing), who has access (on-call ops + engine tech lead), cost discipline rules (any single launch > $20 requires founder pre-approval; any single calendar week > $300 triggers spend review), how to capture artefacts, how to tear down cleanly, how to handle a stuck instance.
- [ ] **Pre-book day-before-demo capacity.** Each major rehearsal milestone (Phase 12 dry-runs, the day before each interview, the day before Demo Day if selected) gets a 24-hour H100 reservation booked at least 5 days ahead. Total booked capacity: ~96 GPU-hours across the 30-day window. Cost projection: ~$300.
- [ ] **Set up cost tracking dashboard.** Weekly cost-to-date in the project workspace. Auto-alert at 50% / 75% / 100% of cap.

### Acceptance criteria

- Lambda Labs and Runpod accounts created with billing configured and alerts enabled.
- Launch and tear-down scripts work, are idempotent, and are version-controlled.
- First-light rehearsal completed; latency and accuracy numbers recorded; total spend < $10.
- Second rehearsal (full-stack integration) completed; results captured.
- Usage log exists and is being maintained.
- Runbook published.
- Day-before-demo reservations booked for all known rehearsal milestones.
- Total 30-day spend ≤ $1,200 (verified by provider invoices reconciled against the usage log).

## Alternatives Considered

- **Buy a workstation H100 outright.** Rejected: capex of ~$30K+ for a one-month demo window is irrational; on-demand at < $1,200 covers the same need.
- **Use cloud LLM (Claude/OpenAI) only and skip on-prem rehearsal entirely.** Rejected: Shinhan reviewers will press us on the on-prem path explicitly (the Q&A confirms this is the commercialisation gate); we cannot bluff. We must demonstrate, not describe.
- **Use a smaller open-weight model (Qwen-7B or Llama-3-8B) to dodge GPU costs.** Rejected: at 7B-8B, NL→SQL accuracy on financial-domain schemas drops below the SF9 promise (≥ 95% on gold-set per Form Answers). The choice is locked at 72B in ADR-SHB-002. Smaller models can be tested as part of the eval harness (P04-T03) for completeness, but are not the primary on-prem path.
- **Rent an A10G (24GB VRAM) instead of an H100.** Rejected: A10G can't fit Qwen-72B even quantised; would force a smaller model and undermine the accuracy story.
- **Use Modal or Replicate for serverless inference.** Rejected for rehearsal: serverless adds an unpredictable cold-start dimension that we want to control during testing. Useful as a future commercial-track exploration but not for the demo rehearsal phase.
- **Rent a 2× H100 box for FP16 Qwen-72B (no quantisation).** Rejected: doubles the cost; FP16 vs. AWQ Q4 accuracy delta on financial SQL is small in our internal evals; the AWQ path is also closer to what a real Shinhan deployment will look like.
- **Use the founder's personal Mac with MLX for local Qwen inference.** Rejected: MLX-quantised Qwen on Apple Silicon is a useful sanity check but doesn't represent the production-shape stack; cannot demonstrate the on-prem story credibly.

## Success Metrics

- **Primary**: Full on-prem rehearsal (50-question gold-set sample) completed under $10 spend within 14 days of this task being assigned. Measured by: timestamped first-light results file in the artefact store; Lambda invoice for that period < $10.
- **Guardrail**: Total 30-day spend ≤ USD 1,200; spend tracked weekly with overage alert at $300/week. Measured by: weekly reconciliation of provider invoices against the usage log; any week > $300 triggers a spend review with founder.

## Scope

### In scope
- Lambda Labs + Runpod account setup, billing, alerts.
- Launch + tear-down scripts; usage log; runbook.
- Pre-staged Qwen-2.5-72B-Instruct AWQ Q4 weights in the internal artefact store.
- First-light rehearsal (small) and second rehearsal (full-stack integration).
- Day-before-demo capacity bookings for known rehearsal milestones.
- Cost tracking dashboard and weekly review.

### Out of scope
- Permanent on-prem GPU procurement (commercial-track, post-PoC).
- Production GPU sizing for Shinhan's actual on-prem environment (handled at kickoff during P13-T04 infrastructure delivery checklists).
- Multi-GPU or multi-node training/serving (single-H100 inference only for the demo phase).
- LLM fine-tuning workflows (this task is inference-only; fine-tuning would be a separate task with separate budget if ever needed).
- Embedding-model serving on the rented GPU (embedding model is small enough to run on CPU or a much cheaper GPU; out of scope for this rental).

## Dependencies

- **Upstream**: ADR-SHB-002 (P00-T02) ratified — model stack must be locked before rehearsal infra is meaningful.
- **People**: ops lead (procurement, account setup, scripts); engineering squad (eval-harness integration); founder (cost-cap approval, day-before-demo reservation prioritisation).
- **External**: Lambda Labs and Runpod accounts; HuggingFace account with private-mirror access for Qwen weights; AutoAWQ tool for quantisation.
- **Memory references**: `feedback_p1_scope_preference` (lean richer when in doubt — H100 over A100); `cyberos_data_residency` (GPU rental in non-VN regions is OK for rehearsal but is a commercial-track concern for production).

## Open Questions

- Q1: Does the Tongyi Qianwen License Agreement (which governs Qwen-2.5-72B-Instruct) permit commercial deployment by a financial customer in Vietnam? Verify with legal before pre-staging weights. If restrictive, fallback to an Apache-2.0 base (e.g., Qwen-1.5-72B if available, or Mistral-Large-2-Instruct under their commercial licence).
- Q2: Lambda Labs offers H100 PCIe ($2.49/hr) and H100 SXM ($2.99/hr). Which do we use? Recommendation: SXM — the slight cost premium is offset by faster NVLink-class memory bandwidth, useful for our latency target.
- Q3: Should the first-light rehearsal use the actual gold-set we'll author in P04-T01, or a smaller sanity-check set? Recommendation: smaller sanity-check set (50 questions hand-authored for this purpose; the formal gold-set in P04-T01 will be 90+ and authored by domain SME).
- Q4: For day-before-demo reservations, do we hold the instance running for 24 hours, or do we hold a *quota* and spin up just before? Recommendation: hold running, with persistent storage attached, so we don't lose mid-test state. Cost is ~$60 for a 24-hour H100 SXM hold; worth it for stability.
- Q5: For the AWQ quantisation step itself, can we run that on the same rented GPU, or do we need a separate higher-VRAM box for FP16 → AWQ conversion? AutoAWQ requires holding the FP16 model in memory during quantisation; for 72B FP16, that's 144GB — needs a 2× H100 box for the quantisation step. Plan: do the quantisation once, on a one-shot 2× H100 rental (~$6 for one hour), upload the quantised weights to the artefact store, and use that artefact for all subsequent rehearsals.

## Implementation Notes

- The launch script should accept arguments for: instance type (H100 SXM / H100 PCIe / A100), region, hourly cap (auto-terminate after N hours unless renewed), purpose tag (which feeds the usage log). This makes the script self-documenting in shell history.
- Use vLLM as the inference server. It offers OpenAI-compatible endpoints, paged attention (better throughput under multi-turn), and is the de-facto standard for serving open-weight models. Avoid building a custom inference server.
- Pre-build the Docker image with all dependencies; push to a private registry; the launch script just pulls. Reduces spin-up time from ~15 min (cold install) to ~3 min (image pull + model load).
- Persistent storage: attach a 200GB EBS-equivalent volume on each launch, mount the model weights to it, snapshot at tear-down. Speeds future spin-ups dramatically (model already on disk).
- The runbook should include a "kill switch" — a documented procedure to manually terminate every running GPU instance via the provider's web console, in case the script-based tear-down fails.
- For cost discipline, the usage log should auto-aggregate weekly spend and post a Friday digest to the project Slack channel.

## Test Plan

- Test 1 (provider sanity): Spin up an instance, run `nvidia-smi`, verify H100 80GB is what we got, tear down. Pass criterion: hardware matches request; no overcharge.
- Test 2 (model loading): Spin up, load Qwen-72B-AWQ-Q4 via vLLM, send a single test query through the OpenAI-compatible endpoint, verify response. Pass criterion: response within 5 seconds, content sensible.
- Test 3 (latency baseline): Run the 50-question first-light set, measure p50/p95/p99 latency. Pass criterion: p50 ≤ 2s, p95 ≤ 8s, p99 ≤ 12s (loose targets for first-light; final targets in Phase 4).
- Test 4 (accuracy baseline): Compare first-light answers to gold-set expected answers. Pass criterion: ≥ 90% of answers within tolerance (looser than the 95% Form Answer commitment, since this is a small sample).
- Test 5 (tear-down idempotency): Run tear-down twice in a row; verify no error, no cost duplication.
- Test 6 (cost-cap behaviour): Simulate a stuck instance for 6 hours; verify the cost-cap alert fires; verify the kill switch successfully terminates.

## Rollback Plan

- If Lambda Labs has H100 quota issues, switch to Runpod.
- If both providers are constrained, switch to Vast.ai for short rehearsals (lower reliability but available).
- If quantised Qwen-72B inference fails to meet our latency/accuracy targets, fall back to a smaller fallback model (Qwen-32B-AWQ Q4) for rehearsal purposes only; document the gap and update ADR-SHB-002 supersession chain.
- If the entire on-prem path is unviable for the demo timeline, the Form Answers' on-prem claim is honoured by demonstrating that the architecture *supports* on-prem (the routing matrix in ADR-SHB-002), even if the rehearsal itself uses cloud. This is the worst case and significantly weakens the pitch; mitigations above are preferred.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Spin-up script | `infra/gpu/spin-up.sh` | Ops lead | Continuous |
| Tear-down script | `infra/gpu/tear-down.sh` | Ops lead | Continuous |
| Usage log | `infra/gpu/usage.md` | Ops lead | Until program end |
| First-light results | `infra/gpu/first-light-results.md` | Engine tech lead | Until program end |
| Full-stack rehearsal results | `infra/gpu/full-stack-rehearsal-{date}.md` | Engine tech lead | Until program end |
| Runbook | `docs/runbooks/gpu-rehearsal.md` | Ops lead | Continuous |
| Provider invoices | `legal/finance/innoboost-2026/{lambda,runpod}-{month}.pdf` | Founder | 7 years |
| Quantised Qwen-72B weights | Internal artefact store | Engine tech lead | Until superseded |
| Cost-cap alerts log | `infra/gpu/alerts.log` | Ops lead | Until program end |

## Operational Risks

- **Stuck instance running overnight.** Mitigation: cost-cap auto-terminate; kill-switch runbook; weekly spend review.
- **Provider account suspension (e.g., billing issue, fraud-detection trigger).** Mitigation: dual-provider setup (Lambda primary, Runpod fallback); founder credit card with adequate limit; pre-emptive billing-team contact.
- **Qwen weight download throttled by HuggingFace.** Mitigation: pre-stage the weights once in our own private mirror; subsequent downloads are from internal artefact store with no rate-limit concern.
- **vLLM update breaks our serving config.** Mitigation: pin vLLM version in the launch script; only upgrade after a sanity-check rehearsal on the new version.
- **GPU availability tight on critical days (e.g., day before Demo Day).** Mitigation: book 5+ days ahead; if quota is denied, switch provider or escalate.
- **Network egress cost surprise (e.g., downloading a large eval-output bundle from a US-region GPU to Vietnam).** Mitigation: keep large artefacts on the GPU host or in a region-close S3 bucket; download only summaries to local devices.

## Definition of Done

- Both provider accounts active, billed correctly, alerts enabled.
- Scripts working, version-controlled, documented.
- First-light and full-stack rehearsals completed; results captured.
- Day-before-demo reservations booked.
- Runbook published.
- Spend on track within $1,200 cap.
- Quantised Qwen-72B-AWQ Q4 weights staged and verified.
- Legal sign-off on Qwen licence (Open Question Q1) recorded.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections of this FR.
- **Human review**: ops lead ratifies cost cap, provider choice, and runbook; engine tech lead ratifies model-stack engineering choices; legal confirms Qwen licence question; `@stephen-cheng` final sign-off on procurement.
