---
title: "Lock platform, model, and warehouse stack ADRs"
author: "@stephen-cheng"
department: engineering
status: in_progress
priority: p0
created_at: "2026-04-29"
ai_authorship: co_authored
feature_type: infrastructure
eu_ai_act_risk_class: minimal
target_release: "2026-05-08"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Author and ratify three numbered Architecture Decision Records (ADRs) that lock the foundational technical choices the entire downstream demo build will inherit: ADR-SHB-001 (host platform — standalone repo vs. ShinhanOS module embedding), ADR-SHB-002 (model stack — primary cloud LLM, on-prem fallback model, adversarial eval model, routing logic between them), and ADR-SHB-003 (warehouse stack — Postgres / BigQuery / Snowflake adapter strategy and feature-parity matrix). Every Phase 1–13 task references these ADRs by ID in its Dependencies section. Ratification happens in a 60-minute architecture council session attended by the founder, both tech leads (Engine, Platform), and a Frontend lead observer; decisions are recorded in the ADR's Sign-off block; minutes capture dissents. Without ratification within 7 days of this task being assigned, downstream squads will make unilateral choices that diverge irreconcilably and produce 1–2 weeks of late-cycle reconciliation work.

## Problem

The demo-build-plan.md leaves three foundational decisions explicitly open and explicitly under-specified. Each open decision is a forking point that, if left to engineering choice on the fly, will produce divergent code paths across squads and force expensive reconciliation later — exactly the failure mode the demo timeline cannot absorb.

**Host platform openness.** The plan says: "standalone repo (faster) vs. ShinhanOS module (more strategic, slower). Recommendation: standalone now, port to ShinhanOS post-PoC." A recommendation is not a ratification. Some engineers (especially those closer to ShinhanOS) will instinctively start by carving out ShinhanOS-internal scaffolding. Others will start in a clean greenfield repo. Both can produce working code; their merge into a shared system is what fails.

**Model stack underspecification.** The plan says: "primary (Claude Sonnet for SQL gen + Opus for adversarial eval), fallback (open-weight on-prem — Qwen 2.5 72B per Shinhan's stated openness to Qwen)." Three things require concrete locking: which Claude model exactly (Sonnet 4.6, 4.7?), which Qwen variant and quantisation (72B FP16, 72B AWQ Q4, 72B GPTQ?), and what the routing logic between primary and fallback is (failover criteria, manual override, per-tenant policy). The Innoboost Q&A confirms Shinhan's openness to Qwen ("Using open-source models like Qwen is perfectly acceptable") and explicitly disclaims preference for any specific model — this is good news, but it shifts the choice fully onto us, which means if we don't lock it, every engineer locks it differently in their corner of the build.

**Warehouse stack underspecification.** The plan commits to "Postgres (laptop demo), BigQuery + Snowflake adapters (cloud demo), on-prem Postgres adapter (commercialisation track)." It does not specify which warehouse-adapter features are blessed across all three (every metric-layer feature should work on every backend at parity), which features are best-effort (cloud-only, with graceful degradation on Postgres), and which are not supported (no equivalent on Postgres, must be feature-flagged off). Without a parity matrix, the engine team will write features that work in BigQuery but silently fail or produce different results on Postgres — and that failure mode is exactly the kind of subtle bug Shinhan reviewers (or worse, post-PoC commercial customers) will detect at the worst possible moment.

The `shinhanos_tech_stack` memory note already commits to Apollo Server 5 + Express + Postgres + pgvector + Module Federation MFE for the broader CyberSkill platform. The demo's stack is *not* the same as ShinhanOS's — the demo is a focused chat-with-data system with HITL, not a multi-tenant ops platform. The two will diverge. ADR-SHB-001 must explicitly capture *where* they diverge so downstream readers know which decisions inherit from ShinhanOS and which are demo-specific. Without that explicit captured divergence, engineers will assume defaults that are wrong for either context.

The `feedback_p1_scope_preference` memory note records: "Stephen consistently rejects minimal-MVP recommendations; lean toward richer P1 unless sharp trade-off." This bias must be reflected in the ADR process. For each decision, the default option is the *richer* configuration unless the council identifies a sharp trade-off (cost-of-time, irreversibility, complexity-debt) that justifies minimisation. The council's job is not to chase minimum viable; it is to ratify the right scope given the founder's preference and the demo's stakes.

There is also a downstream-multiplier reason for ratifying these three together as a P0: every Phase 1 task (P01-T01..T10) depends on at least one of these three decisions. P01-T01 (monorepo skeleton) needs ADR-SHB-001. P01-T04 (IaC) needs ADR-SHB-001 + ADR-SHB-003. P01-T08 (encryption / KMS strategy) needs ADR-SHB-003. Phase 2 work depends on all three. Ratifying them out of order risks cascading rework.

The Innoboost Q&A also flags an external-pressure constraint: Shinhan's commercial-phase deployment "must be deployed per SBV regulations" — typically on-prem. Our ADRs must therefore optimise for on-prem deployability not as an afterthought but as a first-class target. Cloud-only choices (e.g., picking BigQuery as primary warehouse, picking only Claude API as the model path) close off commercialisation. The ADRs must explicitly weight on-prem viability.

## Proposed Solution

Three numbered ADRs, each following the canonical CyberSkill `adr@1` template (Context, Decision, Consequences, Alternatives, Sign-off, Supersession-chain), authored as drafts by the engineering tech leads, reviewed in a 60-minute architecture council session, ratified by the founder, and committed to `docs/adr/shinhan-innoboost/`. Each ADR carries an immutable numeric ID; supersession is by new ADR, not by edit. After ratification, every Phase 1+ FR adds an "ADR refs" line in its Dependencies section. A one-page TL;DR is published to the project workspace within 24 hours of ratification.

### Subtasks

- [ ] **Pre-meeting: draft ADR-SHB-001 (host platform).** Engine tech lead drafts. Recommended decision: standalone repo `cyberskill-official/shinhan-innoboost-engine` for the demo and PoC build, with explicit module-portability constraints — no ShinhanOS-specific imports; only MIT/Apache-licensed primitives (no GPL); package boundaries that map cleanly to ShinhanOS modules (engine → ShinhanOS AI module; HITL → ShinhanOS HITL module; eval → ShinhanOS observability module). Alternative captured: build directly inside ShinhanOS — rejected because ShinhanOS is in mid-development and binding the demo to its release schedule risks demo slippage. Re-evaluation trigger captured: if Shinhan signs commercial in Q3 2026, port to ShinhanOS in Q4 2026 with a dedicated migration task.
- [ ] **Pre-meeting: draft ADR-SHB-002 (model stack).** Engine tech lead drafts with founder input. Decisions to lock:
  - Primary NL→SQL generator: Claude Sonnet 4.6 (model ID `claude-sonnet-4-6` per `product_information` system context).
  - Adversarial eval and policy-layer overseer: Claude Opus 4.6 (model ID `claude-opus-4-6`).
  - On-prem fallback: Qwen 2.5 72B Instruct, AWQ-quantised Q4 for inference on a single H100 80GB; FP16 only available with multi-H100 setups (not the demo's hardware target).
  - Routing matrix: cloud primary; fallback to on-prem Qwen on Claude 5xx, Claude rate-limit, or per-tenant policy ("air-gap mode"); manual override per tenant. Routing logic is policy-layer-driven, not model-layer-driven, so swapping primary or fallback is a config change.
  - Embedding model: per `shinhanos_tech_stack` (already locked to pgvector for Postgres); choice of embedding model itself is OpenAI text-embedding-3-large for cloud / Qwen-Embedding for on-prem, mediated by the same routing layer.
  - Adversarial-test model: Claude Opus 4.6 generates the prompt-injection corpus in P04-T02; this is captured in ADR for traceability.
  - Rejected alternatives, each with a one-line reason: GPT-4 family (not as strong on financial-domain SQL; pricier per token); Llama-3-70B (weaker structured-output reliability vs. Qwen-2.5-72B in our internal evals); Gemini 2.5 (cloud-lock-in and less Vietnamese-language fluency); DeepSeek (geopolitical risk for a Korean financial customer); fine-tuning a base model (out of scope for demo timeline).
- [ ] **Pre-meeting: draft ADR-SHB-003 (warehouse stack).** Platform tech lead drafts. Decisions to lock:
  - Default warehouse for laptop demo and on-prem deployment: Postgres 16 with extensions pgvector, pg_partman, pg_stat_statements, pg_audit.
  - Cloud adapter list: BigQuery (Standard SQL dialect), Snowflake (Snowflake SQL). Both expected for SF9 / SB5 customer stacks.
  - Read path: read-replica only for engine queries; engine never writes to the warehouse. (Audit log writes go to a separate Postgres instance per P02-T09.)
  - Row-level security: handled at the engine policy layer (P02-T03), not at the warehouse RLS layer, for portability across backends.
  - Feature-parity matrix as appendix: every metric-layer feature × every backend, marked Blessed (works at parity) / Best-effort (cloud-only with documented degradation) / Not-supported (feature-flagged off). The matrix is the canonical reference for engine engineers when authoring new metric capabilities.
  - Rejected alternatives: ClickHouse (no production experience on the team); DuckDB as a primary (great for laptop, weak for on-prem multi-user concurrency); MongoDB or other NoSQL (does not match the metric-layer SQL-generation model); single-vendor warehouse-only commitment (closes off SF9 / SB5 customer fit).
- [ ] **Schedule the architecture council session.** 60 minutes. Attendees: founder (chair), engine tech lead, platform tech lead, frontend tech lead (observer). Pre-read material: the three draft ADRs, the demo-build-plan.md, the Innoboost Q&A doc, and the `shinhanos_tech_stack` memory note. Send invites at least 48 hours ahead.
- [ ] **Run the council session.** Walk through each ADR; capture dissents, alternative phrasings, and any forced revisions. The session output is three ratified ADRs *or* explicit blockers — never silent disagreement.
- [ ] **Ratify in the Sign-off block.** Founder signs off on each ADR. If any ADR is not ratified at the council, schedule a follow-up within 72 hours with the specific blocker on the agenda.
- [ ] **Publish the ADRs.** Commit to `docs/adr/shinhan-innoboost/{001..003}-{slug}.md`. Tag the commit `adr-shb-001-003-ratified` for searchability.
- [ ] **Update the shinhanos_tech_stack memory note.** Add a divergence cross-reference: "Demo stack diverges at: {host repo, model routing, warehouse parity matrix}; see docs/adr/shinhan-innoboost/{001..003}." This makes the divergence explicit so future ShinhanOS work doesn't accidentally inherit demo-specific choices.
- [ ] **Publish the TL;DR.** One-page document in the project workspace summarising the three decisions and what they unblock. Audience: every squad member. Not a substitute for the ADRs themselves; an entry point.
- [ ] **Add ADR cross-references.** Update every existing Phase 1+ FR (in the tasks/ folder) to reference the relevant ADR ID in its Dependencies section. Going forward, all new FRs include the ADR refs from inception.
- [ ] **Capture council minutes.** Author meeting notes including attendees, key discussion points, dissents (if any), and follow-up actions. Commit to `docs/adr/shinhan-innoboost/_council-minutes-{date}.md`.

### Acceptance criteria

- Three ADRs committed at `docs/adr/shinhan-innoboost/{001,002,003}-{slug}.md`, each in the canonical `adr@1` template format.
- Each ADR has the founder's signature in the Sign-off block.
- Architecture council meeting minutes are committed and accessible to the squad.
- TL;DR one-pager is published to the project workspace.
- `shinhanos_tech_stack` memory note is updated with the divergence cross-reference.
- Every existing Phase 1+ FR references the appropriate ADR ID in its Dependencies section.
- All three ADRs are linked from the project tracker's main project description.

## Alternatives Considered

- **Skip ADRs; let engineers decide on the fly.** Rejected because drift is guaranteed at this scale of squad and timeline; reconciliation costs more than upfront ratification.
- **Adopt the ShinhanOS stack wholesale (build the demo as a ShinhanOS module).** Rejected because ShinhanOS is mid-development; binding the demo to its release schedule risks demo slippage. Captured as the alternative in ADR-SHB-001 with an explicit re-evaluation trigger.
- **One unified ADR covering all three decisions.** Rejected because the three decisions have different blast radii and supersession lifetimes — model stack will be revisited as new models ship; warehouse stack is more stable; host platform is a one-time strategic decision. Bundling them into one ADR forces them to share a supersession history they don't naturally share.
- **Use a single warehouse adapter (Postgres only) for the demo to simplify the build.** Rejected because the SF9 brief mentions "BigQuery, Snowflake, and on-prem PostgreSQL warehouses" explicitly in the Form Answers, and the SB5 brief involves a Bank with established BI tooling that almost certainly is not on Postgres. Multi-adapter support is a credibility signal in the interview, not optional polish.
- **Defer the model-stack lock until after the live-coding rehearsals reveal Claude's actual SQL-generation reliability.** Rejected because the entire engine architecture (policy layer, prompt-injection defence, eval harness, routing logic) depends on knowing the model up front; deferring locks pushes engineering into speculation.
- **Pick a different open-weight model than Qwen for on-prem (Llama-3-70B, Mistral-Large-2, DeepSeek).** Rejected: Llama-3-70B underperforms Qwen-2.5-72B on financial-domain structured output in CyberSkill internal evals; Mistral-Large-2 is closed-weights and not viable for air-gap; DeepSeek poses a geopolitical risk in front of a Korean financial group; the Innoboost Q&A specifically validated Qwen as acceptable.
- **Skip the feature-parity matrix and resolve incompatibilities case-by-case.** Rejected because case-by-case means each engine engineer is performing the same investigation in parallel; a centrally-maintained matrix removes that duplication.

## Success Metrics

- **Primary**: All three ADRs ratified within 7 days of this task being assigned. Measured by: presence of three signed ADR files committed to `docs/adr/shinhan-innoboost/`.
- **Guardrail**: Zero "but I didn't know we'd decided that" PR comments on the first 30 PRs in the demo monorepo after ratification. Measured by: PR-comment scrape for the substring "didn't know" or "wasn't aware" or "I thought we" in PR review threads. More than 2 such comments triggers an ADR comms gap remediation (additional one-pager + squad walkthrough).

## Scope

### In scope
- Three ADRs with full template fields populated (Context, Decision, Consequences, Alternatives, Sign-off).
- Architecture council session with minutes and dissent capture.
- TL;DR one-pager.
- Cross-reference into existing Phase 1+ FRs.
- Update to `shinhanos_tech_stack` memory note.

### Out of scope
- Implementation work (handled in Phase 1+ tasks).
- Detailed warehouse-feature implementation (handled in P02-T01 metric layer and the warehouse-adapter tasks).
- ADR template authoring or modification (use existing `adr@1` template; do not change the template).
- ADRs for non-foundational decisions (e.g., choice of frontend framework, choice of state management library — those go in their own ADRs authored by the relevant tech lead, not in this batch).

## Dependencies

- **Templates**: `adr@1` template from CyberSkill docs library.
- **Memory references**: `shinhanos_tech_stack` (for divergence reasoning), `shinhanos_architecture` (for inheritance reasoning), `shinhanos_data_residency` (for warehouse residency reasoning), `feedback_p1_scope_preference` (for the richer-default bias), `feedback_enterprise_voice` (for ADR-publishing voice).
- **People**: founder (chair, ratifier), engine tech lead (drafts ADR-SHB-001 and ADR-SHB-002), platform tech lead (drafts ADR-SHB-003), frontend tech lead (observes).
- **External**: model availability and licence verification (Anthropic API access for Claude Sonnet 4.6 / Opus 4.6 confirmed; Qwen-2.5-72B-Instruct on HuggingFace under Apache 2.0 confirmed).
- **No upstream Task ID dependencies.** This is a leaf task that gates much of Phase 1.

## AI Risk Assessment

### Data Sources
The model-stack ADR makes claims about model behaviour that must be grounded in (a) Anthropic's public model cards for Claude Sonnet 4.6 and Opus 4.6, (b) Alibaba Cloud's public model cards for Qwen 2.5 72B Instruct, (c) CyberSkill internal evaluation runs against the demo gold-set (when available; pre-evaluation, document as "expected behaviour from prior CyberSkill projects"), (d) third-party benchmarks from public leaderboards, only with source attribution. No third-party benchmark numbers are cited without attribution. No Shinhan-supplied data is used for any decision-making in this ADR (Shinhan supplies data only post-kickoff).

### Human Oversight
The ADR is ratified by the founder in the Sign-off block; both tech leads counter-sign. Every downstream FR that references the ADR includes the ADR ID, making it possible to audit downstream choices back to the ratification record. If a chosen model is later swapped (e.g., Claude Sonnet 4.7 ships and we adopt it), a superseding ADR (ADR-SHB-002a) is authored — never a silent swap. The supersession chain is part of the ADR template; the audit chain remains intact across model upgrades.

### Failure Modes
If a chosen model is deprecated, returns degraded results, or hits a rate-limit ceiling during the PoC, the routing matrix in ADR-SHB-002 specifies the fallback path: cloud → on-prem Qwen, with manual per-tenant override. If the warehouse adapter for a chosen backend has a bug, the engine falls back to a degraded query mode (cached metric value with a "stale" warning in the UI), per the engine's confidence-tier behaviour (P02-T05). If the demo-repo embedding decision (standalone vs. ShinhanOS) is later reversed, the portability constraints in ADR-SHB-001 ensure the port is mechanical not heroic. If the council itself fails to ratify (founder is blocked, tech lead disagrees), the task escalates immediately and downstream Phase 1 work pauses for ≤ 72 hours pending resolution.

## Open Questions

- Q1: Do we need a fourth ADR for the eval-harness model choice (the model that scores generated SQL against expected SQL)? Recommendation: include in ADR-SHB-002 to keep the model-stack story unified, not split.
- Q2: For air-gap deployments, can we ship Claude API at all (clearly no), and is the on-prem Qwen path the *only* path? Recommendation: yes — air-gap = Qwen only; documented in routing matrix.
- Q3: Do we need to validate that Qwen-2.5-72B-Instruct's Apache 2.0 licence permits commercial deployment by a financial customer in Vietnam? Confirmation needed from legal.
- Q4: For BigQuery / Snowflake, do we ship adapters as part of the demo or only as architectural placeholders? Recommendation: ship working Postgres adapter for the demo; ship BigQuery and Snowflake as pluggable adapters with tests, but only seed Postgres data for the interview.
- Q5: Does the demo monorepo follow CyberSkill's `shinhanos_id_conventions` for module IDs? Recommendation: yes for portability; documented in ADR-SHB-001.

## Implementation Notes

- ADR template `adr@1` includes a Supersession-chain field. Use it. Future ADRs that supersede these three should link back, preserving the decision-history graph.
- Each ADR's Decision block should be one paragraph max. The Consequences block is where nuance lives. This keeps the headline decision easy to quote in PR review and architecture discussions.
- For ADR-SHB-002, include a benchmark snapshot table — a few rows showing primary vs. fallback latency and accuracy on a small sanity-check set — so reviewers can see we made a measured decision, not a vibes-based one.
- For ADR-SHB-003, the parity matrix appendix should be a Markdown table, not a separate file. Inline keeps it discoverable.
- Council minutes should record dissent verbatim, not paraphrase. If the platform lead disagrees with the warehouse choice, capture *why* — that disagreement may be the seed of a future superseding ADR.

## Test Plan

- Test 1: Rebuild the dependency graph in the project tracker after ADR ratification. Verify every Phase 1+ FR ticket links to at least one of the three ADRs. Pass criterion: zero un-linked Phase 1 tickets.
- Test 2: Sample 5 random squad members and ask each "for our demo's on-prem path, which model do we use?" Verify all 5 give the same answer (Qwen 2.5 72B Instruct, AWQ Q4). Pass criterion: 5/5 consistent answers.
- Test 3: One week after ratification, sample 5 PRs and inspect for ADR-aware decisions (e.g., a PR that introduces a new metric-layer feature should reference the parity matrix in its description). Pass criterion: at least 4/5 PRs reference relevant ADRs.

## Rollback Plan

- ADRs are immutable once committed. Rollback is by superseding ADR — author ADR-SHB-001a, ADR-SHB-002a, or ADR-SHB-003a, link to the predecessor in the Supersession-chain block, ratify, and publish.
- If a superseding ADR materially changes downstream work (e.g., model swap mid-PoC), trigger a small migration task with explicit affected scope.
- Rollback events are logged in the council-minutes file and surfaced in the next weekly status digest.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| ADR-SHB-001 — Host platform | `docs/adr/shinhan-innoboost/001-host-platform.md` | Founder | Indefinite |
| ADR-SHB-002 — Model stack | `docs/adr/shinhan-innoboost/002-model-stack.md` | Founder | Indefinite |
| ADR-SHB-003 — Warehouse stack | `docs/adr/shinhan-innoboost/003-warehouse-stack.md` | Founder | Indefinite |
| Council minutes | `docs/adr/shinhan-innoboost/_council-minutes-{YYYYMMDD}.md` | Founder | Indefinite |
| TL;DR one-pager | `docs/adr/shinhan-innoboost/_tldr.md` | Founder | Until superseded |
| Updated `shinhanos_tech_stack` memory note | Memory file | Founder | Continuous |

## Operational Risks

- **Council fails to convene.** Mitigation: schedule with 48-hour notice; if any of the three required attendees are blocked, escalate to founder for makeup slot within 72 hours.
- **Council convenes but cannot reach decision on one ADR.** Mitigation: time-box discussion at 20 minutes per ADR; if blocked, founder breaks tie. Dissent is recorded but does not block ratification.
- **External model-availability surprise (e.g., Claude Sonnet 4.6 deprecated mid-cycle).** Mitigation: routing matrix includes the abstraction; superseding ADR pattern. We commit to ratifying in this cycle on currently-available models; future shifts go through the supersession process.
- **Qwen-2.5-72B licence interpretation differs from our reading.** Mitigation: legal confirmation as Open Question Q3; if the licence is more restrictive than we think, fall back to Qwen-1.5 (Apache 2.0 confirmed) or Mistral-Nemo with reduced capability.
- **Ratification happens but downstream squads ignore the ADRs.** Mitigation: PR template auto-prompts "Linked ADR?" for any architectural change; CI fails any new infrastructure file that doesn't reference an ADR.

## Definition of Done

- Three ADR files committed and ratified.
- Council minutes committed.
- TL;DR published.
- Memory note updated.
- All existing Phase 1+ FRs cross-reference appropriate ADRs.
- This FR's ticket marked Done in tracker with links to all artefacts.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR; ADR drafts to be human-authored by tech leads with possible Claude assistance, disclosed in each ADR's authorship block).
- **Scope**: Claude drafted this FR's Summary, Problem, Subtasks, Alternatives, Open Questions, Implementation Notes, Test Plan, Rollback Plan, Audit Trail, Operational Risks, and Definition of Done. The ADRs themselves are co-authored in the architecture council session, not generated.
- **Human review**: founder ratifies the ADRs; engine tech lead and platform tech lead author the ADR drafts; legal confirms the Qwen licence question (Open Question Q3).
