---
title: "Build Docker Compose laptop deployment with offline LLM"
author: "@cyberskill-eng"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: minimal
target_release: "2026-09-04"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Build a `docker compose up` laptop deployment that brings the entire engine stack up on a 16 GB MacBook (or equivalent) in under 5 minutes — including an offline LLM fallback (Qwen-7B-Instruct quantised) so the demo works without internet. Pre-seeded synthetic data; pre-seeded users; pre-recorded demo script. The laptop deployment is the interview-day insurance: if Wi-Fi fails, if the cloud staging has issues, if Anthropic API is rate-limited, the founder pulls up a local terminal and `docker compose up` runs the demo. Without a laptop deployment, every demo is at the mercy of network conditions.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"For the POC phase, you can use cloud environments with masked data. However, for full commercialization, the solution must be deployed per SBV regulations." — Innoboost Q&A Section VI.3
</untrusted_content>

## Problem

Live demos depend on conditions out of our control. Wi-Fi fails, conference networks are flaky, Anthropic API has rate limits, cloud regions hiccup. A laptop deployment that runs the entire stack offline is the failsafe. It is also the cleanest "developer experience" surface — engineers can onboard locally without provisioning cloud accounts.

Specific gaps if we shortcut:

- **Without laptop deployment, network failure during demo = no demo.**
- **Without offline LLM, even local stack fails when Anthropic API is unreachable.**
- **Without pre-seeded data, demo questions return empty answers.**
- **Without spin-up under 5 minutes, the deployment is too slow to be a recovery option.**

The `feedback_p1_scope_preference` memory note biases us richer. For laptop, "richer" means: full stack + offline LLM + pre-seeded data + sub-5-min spin-up + recorded demo script + cross-platform (macOS / Linux).

## Proposed Solution

A laptop deployment in `infra/laptop/`:

1. **`docker-compose.yml`.** All workspaces; Postgres; Redis; Keycloak; Qwen-7B-Instruct quantised inference.
2. **Pre-seeded data.** SVFC / Bank / Securities synthetic datasets (P03-T01..T03) loaded automatically on first boot.
3. **Pre-seeded users.** Demo personas (per P05-T02..T04) configured in Keycloak.
4. **Offline LLM.** Qwen-7B-Instruct AWQ Q4 quantised, runs via vLLM-CPU or llama.cpp (CPU-only fallback when no GPU); switches to Anthropic API when online.
5. **Spin-up runbook.** `infra/laptop/RUNBOOK.md`: prerequisites; commands; troubleshooting.
6. **Pre-recorded demo script.** Markdown walking through what to demonstrate.
7. **Cross-platform**: macOS, Linux; Windows-WSL acknowledged but not primary target.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Author `docker-compose.yml`.** Services: engine, hitl, ui, admin-ui, postgres, redis, keycloak, qwen-inference (CPU-only). Resource limits suitable for 16 GB MacBook.
- [ ] **Configure offline LLM.** Qwen-7B-Instruct AWQ Q4 (smaller than the on-prem 72B for laptop fit); via llama.cpp HTTP server; OpenAI-compatible endpoint.
- [ ] **Implement LLM routing for laptop.** Router (per ADR-SHB-002) tries Anthropic first; on fail, falls back to local Qwen-7B; configurable to local-only.
- [ ] **Pre-seed data.** Postgres init script loads SVFC + Bank + Securities datasets (P03-T01..T03) on first container start.
- [ ] **Pre-seed Keycloak.** Realm import; demo personas pre-configured.
- [ ] **Spin-up runbook.** Document prerequisites (Docker Desktop 4.x; 16 GB RAM minimum); commands; common errors.
- [ ] **Author pre-recorded demo script.** Markdown: open the chat surface; demo question; show citation; demo HITL routing; demo refusal; demo persona swap.
- [ ] **Test on macOS + Linux.** Spin-up time measured; aim for < 5 min.
- [ ] **Document Windows-WSL caveats.** Higher resource overhead; slower spin-up; document but don't optimise.
- [ ] **Build a `make demo-laptop` shortcut.** From the monorepo root.

### Acceptance criteria

- `docker compose up` brings the full stack up.
- Offline LLM (Qwen-7B) works without internet.
- Pre-seeded data + users available immediately.
- Spin-up time < 5 min on 16 GB MacBook.
- Cross-platform (macOS + Linux) verified.
- Runbook + demo script published.

## Alternatives Considered

- **Cloud-only demo; rely on conference Wi-Fi.** Rejected: reliability risk.
- **Skip offline LLM; require internet.** Rejected: defeats the purpose.
- **Use a larger local model (Qwen-72B).** Rejected: doesn't fit on a laptop.
- **Use minikube / kind instead of Docker Compose.** Rejected: Docker Compose is simpler for laptops.

## Success Metrics

- **Primary**: `docker compose up` succeeds on a clean 16 GB MacBook in < 5 min.
- **Guardrail**: Demo queries return answers consistent with cloud staging.

## Scope

### In scope
- docker-compose.yml + offline LLM + pre-seeded data/users + runbook + demo script.

### Out of scope
- Cloud deployment (P10-T02).
- On-prem deployment (P10-T03).
- Per-tenant residency (P10-T04).

## Dependencies

- **Upstream**: P01-T01 (monorepo); P03-T01..T03 (datasets); P01-T06 (Keycloak realm imports); ADR-SHB-002 (model stack).
- **Downstream**: P12-T03 (SS1 live-coding kit references laptop deployment as fallback).
- **People**: engineer authoring; founder spot-checking demo script.

## Open Questions

- Q1: Qwen-7B vs Phi-3-mini for laptop? Recommendation: Qwen-7B for VN-language consistency; Phi-3 as alternative if performance issues.
- Q2: GPU support on Apple Silicon? Recommendation: Metal acceleration via llama.cpp; document for M-series Macs.
- Q3: For Windows users, WSL or native? Recommendation: WSL preferred; document.

## Implementation Notes

- Offline LLM accuracy will be lower than cloud Sonnet 4.6; document this; demo script chooses questions where local model performs well.
- Pre-seeded data is small subset (sufficient for demo, not full scale).
- Demo script tested with founder; rehearsed before each major rehearsal.

## Test Plan

- Test 1: Clean 16 GB MacBook; `docker compose up`; time spin-up.
- Test 2: Sample question answered offline (Wi-Fi off).
- Test 3: All three personas swap and demonstrate correct scope.
- Test 4: Linux spin-up verified.

## Rollback Plan

- Bad image rolled back via Compose file.
- Bad pre-seeded data corrected via init script.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| docker-compose.yml | `infra/laptop/docker-compose.yml` | Engineer | Continuous |
| Init script | `infra/laptop/init.sh` | Engineer | Continuous |
| Runbook | `infra/laptop/RUNBOOK.md` | Engineer | Continuous |
| Demo script | `infra/laptop/DEMO_SCRIPT.md` | Founder | Until program end |
| Local LLM weights | Internal artefact store | Engineer | Until superseded |

## Operational Risks

- **Laptop runs out of RAM.** Mitigation: minimum 16 GB requirement documented; resource limits in compose.
- **Offline LLM accuracy below threshold.** Mitigation: demo script prefers questions where local model performs well; documented trade-off.
- **First-run data loading slow.** Mitigation: pre-built image with data baked in (separate from on-prem image which is air-gapped).

## Definition of Done

- Stack up under target time; offline LLM works; demo script rehearsed.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Synthetic datasets (P03); offline Qwen model (locally quantised). No customer data.

### Human Oversight
Founder rehearses demo script; engineer maintains kit.

### Failure Modes
- Local stack fails to start: runbook troubleshooting.
- Offline LLM produces wrong answer: demo script prefers known-good questions; transparency.

## Sales/CS Summary

CyberSkill's laptop deployment is the demo failsafe: `docker compose up` brings the full stack up on a 16 GB MacBook in under 5 minutes, runs entirely offline including a local LLM, and ships pre-seeded with synthetic data + demo personas. If Wi-Fi fails at the interview, if the cloud has issues, if the API is rate-limited — the founder opens a terminal and the demo continues. It's also the cleanest engineer-onboarding experience: clone, run, demo.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: engineer authors deployment; founder spot-checks demo script.
