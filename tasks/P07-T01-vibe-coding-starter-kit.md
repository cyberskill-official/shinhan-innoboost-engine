---
title: "Assemble vibe-coding starter-kit repo (Claude Code + MCPs + primitives)"
author: "@cyberskill-eng"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: minimal
target_release: "2026-07-31"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Assemble the SS1 vibe-coding starter-kit repo — a pre-configured Claude Code workspace with project memory, slash commands, MCPs (warehouse, Figma, Linear), evals scaffold, plus a curated primitive library (chart components, table components, RBAC helpers, audit-log decorators, SQL helpers, financial-domain types — VND money, OHLC, position deltas) and three vertical "starter brains" (vanilla, broker tooling preset, research desk preset). The starter kit is the centre of the SS1 (Securities) vibe-coding partnership; it is what enables the live-build scenarios (P07-T02) and what we hand to Shinhan Securities engineers if shortlisted. Without a polished kit, vibe-coding is a vibe, not a system.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"vibe-coding partnership at Shinhan Securities Vietnam: CyberSkill embeds a ring-fenced engineering team to deliver 2 production-shape PoCs across investment services" — CyberSkill SS1 form answer
"Compress idea-to-test latency for the Securities innovation team from quarters to weeks — at least 5× the cadence of internal IT roadmaps" — CyberSkill SS1 form answer
"each PoC ships with a written kill criterion and graduation criterion" — CyberSkill SS1 form answer
</untrusted_content>

## Problem

The SS1 brief is unique: vibe coding is a *workflow*, not a *product*. The starter kit is the workflow operationalised — a repo any engineer can clone and start a new PoC in < 10 minutes. Without it, every PoC starts from scratch; the 5× velocity claim collapses.

Specific gaps if we shortcut:

- **Without Claude Code project memory pre-configured, every engineer hand-rolls.**
- **Without MCPs pre-wired (warehouse, Figma, Linear), engineers waste time on integration plumbing.**
- **Without primitive library, every PoC reimplements charts / tables / SQL helpers.**
- **Without financial-domain types (VND money, OHLC, position deltas), PoCs reinvent the same primitives that lead to off-by-one bugs in financial code.**
- **Without three vertical "starter brains", the kit is too generic; too generic = slow start.**
- **Without evals scaffold, PoCs ship without quality gates.**

The `feedback_p1_scope_preference` memory note biases us richer. For the kit, "richer" means: full Claude Code config + MCP suite + primitive library + three starter brains + evals scaffold + workflow templates + documentation. Each layer compounds the velocity advantage.

## Proposed Solution

A kit at `cyberskill-official/vibe-coding-starter-kit`:

1. **Pre-configured Claude Code workspace.** `CLAUDE.md` with project context; `.claude/commands/` with custom slash commands; `.claude/agents/` with specialised agents (financial-data-analyst, chart-generator, sql-tuner).
2. **MCP configurations.** Warehouse (Postgres / BigQuery), Figma, Linear, GitHub. Pre-wired with environment-variable-based credentials.
3. **Primitive library.** `lib/charts/`, `lib/tables/`, `lib/rbac/`, `lib/audit/`, `lib/sql/`, `lib/types/financial/`.
4. **Three starter brains.** `brains/vanilla/`, `brains/broker-tooling/`, `brains/research-desk/`. Each has a README, sample data, sample tasks.
5. **Evals scaffold.** Light eval-harness template; PoC starts with at least 5 gold-set entries.
6. **Documentation.** `KIT_GUIDE.md` for engineers; `WORKFLOW.md` describing the spec → demo → decision-gate cycle.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Set up the repo.** `cyberskill-official/vibe-coding-starter-kit`; private; same monorepo conventions as P01-T01 (pnpm + TypeScript strict + ESLint + Husky).
- [ ] **Author CLAUDE.md.** Project context: this is a starter kit; the workflow is spec → demo → decision-gate; Claude should preserve the conventions; don't over-engineer; ship in days not weeks.
- [ ] **Configure custom slash commands.** `.claude/commands/`:
  - `/spec` — start a new PoC spec from the template.
  - `/demo` — produce a demo from the current code.
  - `/eval` — run the evals scaffold.
  - `/kill` — formally kill the current PoC with a kill-criterion record.
  - `/graduate` — formally graduate the PoC with a graduation-criterion record.
- [ ] **Configure specialised agents.** `.claude/agents/`:
  - `financial-data-analyst` — for SQL queries against financial datasets.
  - `chart-generator` — for chart spec generation.
  - `sql-tuner` — for query optimisation.
- [ ] **Configure MCPs.** Pre-wired connections (env-var based):
  - Postgres MCP for the Securities synthetic dataset (P03-T03).
  - BigQuery MCP if a customer warehouse is BigQuery.
  - Figma MCP for design-spec consumption.
  - Linear MCP for ticket integration.
  - GitHub MCP for repo operations.
- [ ] **Build the primitive library.**
  - `lib/charts/`: line, bar, candlestick, scatter, heatmap — all theme-aware, all using a chart palette consistent with P00-T03.
  - `lib/tables/`: paginated, sortable, exportable, RBAC-respecting.
  - `lib/rbac/`: helpers to call P01-T07 RBAC engine in PoC code.
  - `lib/audit/`: decorators that emit P02-T09 audit-log events.
  - `lib/sql/`: query builder with built-in tenant-scoping and parameter safety.
  - `lib/types/financial/`: VND money type (bigint underlying), OHLC type, position-delta type, percent-change type. Type-safe operations on each.
- [ ] **Build three starter brains.**
  - `brains/vanilla/` — empty starting point with the kit pre-loaded.
  - `brains/broker-tooling/` — pre-loaded with broker-customer data, holdings, sample portfolio summariser scaffold.
  - `brains/research-desk/` — pre-loaded with research-notes data, sample research-summariser scaffold.
- [ ] **Build evals scaffold.** Template for a 5-entry gold-set; CLI to run.
- [ ] **Author KIT_GUIDE.md.** Engineer-facing: how to start a PoC; how to use slash commands; how to use the primitive library; how to use MCPs.
- [ ] **Author WORKFLOW.md.** The spec → demo → decision-gate cycle; templates; examples.
- [ ] **Smoke-test the kit.** From a clean clone, complete a sample PoC ("build a portfolio summariser") in < 30 minutes; document the actual time.
- [ ] **Verify Vietnamese fluency.** Sample PoC inputs in Vietnamese resolve correctly.

### Acceptance criteria

- Kit repo exists with all documented components.
- Slash commands functional in Claude Code.
- MCPs configurable and tested.
- Primitive library has all documented types + components.
- Three starter brains operational.
- Evals scaffold runs.
- Smoke-test under 30 min.
- Documentation published.

## Alternatives Considered

- **Skip pre-wired MCPs; let engineers configure on first run.** Rejected: friction; kit value is pre-configured.
- **Single starter brain (vanilla only).** Rejected: vertical brains are the velocity multiplier.
- **Skip the primitive library; let engineers build from scratch each time.** Rejected: defeats the kit purpose.
- **Use a different LLM coding tool (Cursor, Continue).** Rejected: ADR-SHB-002 + the SS1 form answer reference Claude Code; consistency.

## Success Metrics

- **Primary**: Kit shipped within 14 days; smoke-test completes a sample PoC in < 30 min.
- **Guardrail**: Three internal engineers complete the smoke-test independently; their times average < 45 min.

## Scope

### In scope
- Repo + Claude Code config + MCP suite + primitive library + three starter brains + evals scaffold + documentation + smoke-test.

### Out of scope
- The three live-build scenarios (P07-T02).
- Vibe-coding workflow templates beyond the kit's WORKFLOW.md (P07-T03).
- Evidence kit (P07-T04).
- Production-shape Helm charts for the kit.

## Dependencies

- **Upstream**: P01-T01 (monorepo conventions); P00-T02 ADR-SHB-002 (Claude Code as the tool); P03-T03 (Securities dataset for starter brains); P00-T03 (theme tokens for chart palette).
- **Downstream**: P07-T02 (scenarios), P07-T03 (workflow), P07-T04 (evidence), P05-T04 (Securities surface link).
- **People**: engineer authoring; founder approving the SS1-narrative integration.

## Open Questions

- Q1: Slash commands — how many is enough? Recommendation: 5 above; add as patterns emerge.
- Q2: Specialised agents — should they be in Claude Code's agent list or a separate package? Recommendation: in `.claude/agents/`; Claude Code's agent feature; portable.
- Q3: MCP pre-wiring — full credentials or placeholders? Recommendation: placeholders + Doppler integration documented.
- Q4: Smoke-test time target — 30 min ambitious? Recommendation: yes for a first PoC; tune.

## Implementation Notes

- Kit is published as a GitHub Template Repository so engineers can fork-and-go.
- Primitive library uses the brand-surface tokens (P00-T03) so charts in PoCs match the demo's overall visual language.
- Starter brains are git submodules or template directories; engineer copies one to `pocs/{name}/` to start.
- For Vietnamese fluency, primitive library's table component supports VN locale formatting (number formats, date formats).

## Test Plan

- Test 1: Smoke-test — complete a sample PoC end-to-end.
- Test 2: Slash commands fire correctly.
- Test 3: MCP integration works (Postgres pulls Securities dataset).
- Test 4: Primitive types are type-safe (TypeScript strict catches misuse).
- Test 5: Three starter brains work as documented.

## Rollback Plan

- Bad kit version rolled back via Git tag revert.
- Bad slash command corrected via PR.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Kit repo | `cyberskill-official/vibe-coding-starter-kit` | Engineer | Indefinite |
| Smoke-test record | `docs/audit/vibe-coding-smoke-tests/{date}.md` | Engineer | Until program end |
| Engineer feedback log | `KIT_FEEDBACK.md` in repo | Engineer | Continuous |

## Operational Risks

- **Kit becomes outdated as the engine evolves.** Mitigation: kit consumes engine APIs via versioned releases; engine deprecation is the kit's signal to update.
- **MCP credentials leak.** Mitigation: kit uses placeholders + Doppler; never hardcoded.
- **Primitive library bug propagates to all PoCs.** Mitigation: kit is versioned; PoCs pin a version; updates are deliberate.

## Definition of Done

- Kit shipped; smoke-test under target; documentation complete.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Kit consumes the Securities synthetic dataset (P03-T03) for starter brains. No customer data. Claude Code is the runtime LLM tool; it operates on the engineer's session.

### Human Oversight
The kit is engineer-driven; humans drive every PoC. Slash commands are tools, not autonomous agents.

### Failure Modes
- Slash command produces wrong output: engineer reviews and corrects.
- Primitive library bug: caught by TypeScript strict + tests.
- MCP integration failure: engineer reconnects; kit documents the recovery.

## Sales/CS Summary

The CyberSkill vibe-coding starter kit is what makes the SS1 partnership concrete. A Shinhan Securities engineer clones the kit, picks a starter brain (vanilla, broker tooling, or research desk), and starts a new PoC in under 10 minutes. The kit ships with pre-wired data connections, a primitive library that handles VND money math correctly, charting components matching the corporate brand, and slash commands that turn the spec → demo → decision-gate workflow into one-line operations. The first PoC ships in days, not quarters.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR); the kit itself uses Claude Code (Anthropic's coding agent) as the runtime tool per ADR-SHB-002.
- **Scope**: Claude drafted all sections of this FR.
- **Human review**: engineer authors and reviews; founder approves SS1-narrative integration; eng-llm reviews the specialised agent definitions.
