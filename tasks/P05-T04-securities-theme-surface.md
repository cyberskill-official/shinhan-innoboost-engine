---
title: "Skin and seed Securities theme (SS1 surface, ticker-aware)"
author: "@cyberskill-design-lead"
department: design
status: draft
priority: p1
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: user_facing
eu_ai_act_risk_class: limited
target_release: "2026-07-31"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Skin the shared chat surface (P05-T01) with the Securities charcoal theme; add ticker-aware affordances (typing `$VNM` triggers contextual portfolio drilldown); embed the vibe-coding sandbox for SS1 contextual demos (P07-T01..T02 link from this surface); seed sample questions geared to research / portfolio / market-data use cases; integrate against the Securities synthetic dataset (P03-T03). The SS1 surface is secondary to P07's live-build kit (the SS1 brief is vibe-coding-centric), but provides the contextual data demos that the live-build scenarios operate over.

## Problem

SS1 is the most innovative pitch (vibe coding); the chat surface is the contextual exhibit, not the centerpiece. The surface must support the SS1 narrative without overshadowing the live-coding demo (P07-T02).

Specific gaps if we shortcut:

- **Without Securities theme, surface reads as wrong.**
- **Without ticker-awareness, "ask about VNM" feels generic.**
- **Without vibe-coding sandbox link, the SS1 narrative is split across surfaces.**
- **Without integration to securities dataset, market-data questions are empty.**

## Proposed Solution

A Securities-themed surface deployed at `securities-staging.shinhan-innoboost.cyberskill.world` with: Securities charcoal theme; ticker-aware affordances; vibe-coding sandbox link; sample questions; integration against `data/securities/`. Setup target: 10 days after P05-T01.

### Subtasks

- [ ] **Apply Securities charcoal theme.**
- [ ] **Implement ticker-awareness.** Typing `$VNM` (or `$VCB`, etc.) inline in the chat input triggers a small context popup showing the latest price + recent volume; pressing Enter without text submits a "tell me about VNM" question.
- [ ] **Embed vibe-coding sandbox link.** A "Try Vibe Coding" button on the landing screen that opens the P07-T01 starter kit in a new pane; allows the demo to flow chat-surface → vibe-coding without leaving the experience.
- [ ] **Seed sample questions.**
  - "Show top 10 most-traded tickers this week."
  - "What's the volatility on VNM over the last 90 days?"
  - "Compare returns of FPT vs VCB year-to-date."
  - "How much exposure do my customers have to financial-sector tickers?"
  - "Find research notes mentioning 'breakout' from the last month."
- [ ] **Configure persona sandboxes.** Three personas:
  - **Equity Research Analyst** — `analyst` role; full access to research_notes + market_data.
  - **Broker Operations** — `viewer` role; can see own customers' holdings; not other customers'.
  - **Securities Lead** — `admin` role.
- [ ] **Integrate against Securities dataset** (P03-T03).
- [ ] **Configure Securities-specific dashboard templates.** "Daily Market Snapshot"; "Top Portfolio Movers"; "Research Pipeline".
- [ ] **Verify Vietnamese rendering** for VN ticker names + sectors.
- [ ] **E2E test.**

### Acceptance criteria

- Securities theme applied.
- Ticker-awareness operational.
- Vibe-coding sandbox link visible and functional.
- Five seed questions visible.
- Three persona sandboxes operational.
- Engine integrated; gold-set Securities subset passing.
- Dashboard panels seeded.

## Alternatives Considered

- **Skip ticker-awareness.** Rejected: it's the SS1-specific affordance that distinguishes Securities from other BUs.
- **Make the chat surface the SS1 centerpiece.** Rejected: P07 live-coding is the centerpiece; the chat surface is contextual.
- **Reuse SVFC dashboard templates.** Rejected: per-BU domain awareness.

## Success Metrics

- **Primary**: SS1 surface deployed within 10 days after P05-T01.
- **Guardrail**: Vibe-coding sandbox loads from chat surface in < 3 seconds.

## Scope

### In scope
- Securities theme.
- Ticker-awareness.
- Vibe-coding sandbox link.
- Sample questions.
- Persona sandboxes.
- Dataset integration.
- Dashboard templates.

### Out of scope
- Vibe-coding kit itself (P07-T01).
- Live-coding scenarios (P07-T02).
- Real-time market data feeds (post-kickoff).

## Dependencies

- **Upstream**: P05-T01, P00-T03, P02-T01, P03-T03, P07-T01 (sandbox link target).
- **Downstream**: P12-T01 (SS1 pitch deck), P12-T02 (run-of-show).
- **People**: design lead; engineer.

## Open Questions

- Q1: Ticker-awareness should it be exclusive to inline `$XYZ` or also apply to bare `VNM`? Recommendation: `$XYZ` only to avoid false-positives.
- Q2: Vibe-coding sandbox in same tab or new? Recommendation: new tab to preserve chat context.

## Implementation Notes

- Ticker autocomplete uses the registry of HOSE/HNX symbols (P03-T03).
- The popup on ticker entry is small; doesn't dominate.

## Test Plan

- Test 1: Theme verification.
- Test 2: Ticker entry → popup appears; submit → engine answers about that ticker.
- Test 3: Vibe-coding sandbox link opens the kit.
- Test 4: Gold-set Securities subset ≥ 95%.

## Rollback Plan

- Bad theme rolled back via revert.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Theme integration | `ui/themes/securities/` | Design lead | Continuous |
| Sample questions | `ui/locales/securities-questions.{en,vi}.json` | Design lead | Continuous |
| Persona config | `infra/keycloak/realms/securities.json` | Eng-sec | Continuous |
| Dashboard templates | `ui/dashboards/securities/` | Design lead | Continuous |

## Operational Risks

- **Ticker autocomplete slow.** Mitigation: pre-load ticker list in client.
- **Vibe-coding sandbox link 404.** Mitigation: integration test.

## Definition of Done

- Securities surface deployed; gold-set passing.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Engine + securities synthetic dataset. No real market data.

### Human Oversight
Persona sandbox demonstrates RBAC; vibe-coding sandbox link shows the SS1 narrative integration.

### Failure Modes
- Ticker autocomplete fails: typed text submits as plain question.
- Sandbox link broken: integration test catches.

## Sales/CS Summary

The Securities surface combines CyberSkill's chat-with-data experience with the vibe-coding kit that defines the SS1 partnership: type a ticker symbol with a `$` prefix and instantly drill into recent activity; click "Try Vibe Coding" to open a live coding sandbox that operates against the same data. Three personas — Equity Research Analyst, Broker Operations, Securities Lead — show how scopes work.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: design lead; engineer integrating; founder approves narrative integration.
