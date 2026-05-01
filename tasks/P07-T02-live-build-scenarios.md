---
title: "Build & rehearse three live-build scenarios with fallback videos"
author: "@cyberskill-eng"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: user_facing
eu_ai_act_risk_class: limited
target_release: "2026-08-14"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Build and rehearse three SS1 live-build scenarios that can be executed end-to-end in 10 minutes during the Shinhan Securities interview: (1) Portfolio summariser — ingest a CSV of holdings, produce a conversational summary with risk callouts; (2) Regulatory checker — parse a draft trade against a small ruleset, flag exceptions with reasoning; (3) Backtest dashboard — run a strategy spec across the synthetic securities dataset, produce a chart + narrative. Each scenario has: a 90-second user-story video setup; a fully-rehearsed live-build path; a recorded fallback video in case the live build fails (Wi-Fi outage, model rate-limit); written kill + graduation criteria; reproducer code in the starter-kit repo. The scenarios are the centerpiece of the SS1 interview demo; failure of any one is recoverable via fallback; all three demonstrably executable in front of reviewers.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"two production-shape PoCs delivered inside the envelope" — CyberSkill SS1 form answer
"median cycle time under 2 weeks per pivot" — CyberSkill SS1 form answer
"each PoC ships with a written kill criterion and graduation criterion" — CyberSkill SS1 form answer
</untrusted_content>

## Problem

The SS1 interview demo is unique in that it should not be pre-built — vibe coding *is* the demo. Pre-built artefacts undersell the proposition; live-built artefacts sell it. But live-coding in a 15-minute interview slot, in front of senior reviewers, with stake-on-every-line, requires extensive rehearsal and fallback planning. The three scenarios are what we rehearse; one of them is what we present.

Specific gaps if we shortcut:

- **Without rehearsal, live-coding fails publicly.**
- **Without recorded fallback, a Wi-Fi outage during the interview kills the demo.**
- **Without scripted user stories (90-second video setup), reviewers are confused about what we're building.**
- **Without kill / graduation criteria written in advance, the workflow claim is rhetorical.**
- **Without reproducer code in the starter kit (P07-T01), the scenarios are a one-off rather than evidence of system.**

The `feedback_p1_scope_preference` memory note biases us richer. For scenarios, "richer" means: three scenarios + setup videos + fallback recordings + written criteria + starter-kit reproducers + dry-run rehearsals + risk-mitigation runbook. Each layer reduces the catastrophe-probability of live-coding in front of reviewers.

## Proposed Solution

Three scenarios, each consisting of: a problem framing; a 90-second user-story setup video; a 10-minute live-build path tested to completion ≥ 5 times; a recorded full-execution fallback video; written kill + graduation criteria; reproducer code in the starter kit. All three rehearsed before each Phase 12 dry-run. Setup target: 21 days from task assignment.

### Subtasks

- [ ] **Scenario 1: Portfolio summariser.**
  - Problem framing: "A broker has a customer's holdings as a CSV; they want a one-paragraph summary with risk callouts (over-concentration, sector exposure, recent volatility)."
  - 90-second user-story video.
  - Live-build path: clone vanilla starter brain → use slash command `/spec` to draft the spec → use Claude Code to implement: CSV parser, holdings analyser, narrative generator → demo.
  - Fallback recording.
  - Kill criterion: "if the build cycle exceeds 12 minutes, kill and switch to fallback video"; graduation criterion: "if the live demo runs end-to-end and reviewers can ask follow-up questions, the scenario succeeds".
  - Reproducer code in `vibe-coding-starter-kit/scenarios/portfolio-summariser/`.
- [ ] **Scenario 2: Regulatory checker.**
  - Problem framing: "A draft trade is submitted; we check it against a small ruleset (T+2 settlement window, position limit, sector concentration); flag exceptions with human-readable reasoning."
  - 90-second user-story video.
  - Live-build path: clone broker-tooling brain → spec the rules in YAML → implement the checker → demo against sample trades.
  - Fallback recording.
  - Kill / graduation criteria.
  - Reproducer code in `scenarios/regulatory-checker/`.
- [ ] **Scenario 3: Backtest dashboard.**
  - Problem framing: "A strategy spec ('buy if 50-day MA crosses above 200-day MA'); run against the synthetic securities dataset (P03-T03); produce a chart + narrative + Sharpe-ratio summary."
  - 90-second user-story video.
  - Live-build path: clone research-desk brain → spec the strategy → implement backtest using the starter kit's chart primitives → demo.
  - Fallback recording.
  - Kill / graduation criteria.
  - Reproducer code in `scenarios/backtest-dashboard/`.
- [ ] **Author setup videos.** ~90 seconds each; high-quality production; bilingual (EN + VI subtitles); narrate the user story; introduce the live-build challenge.
- [ ] **Record fallback videos.** Full 10-minute live-build executed in a controlled environment; high-quality screen recording; voice-over (founder); bilingual subtitles.
- [ ] **Author kill + graduation criteria.** Written in `WORKFLOW.md` (P07-T03); referenced from each scenario's reproducer.
- [ ] **Practise live-build paths.** Each scenario rehearsed by founder ≥ 5 times; track time-to-complete; aim for 8–9 min target with 10-min cap.
- [ ] **Build risk-mitigation runbook.** `docs/runbooks/ss1-live-coding.md`: laptop config; backup laptop; mobile hotspot; cached Claude Code session if API rate-limited; switch-to-fallback decision tree.
- [ ] **Pre-stage scenario starting points in starter brains.** Each scenario has a "Day Zero" snapshot in the starter-kit so the live-build doesn't waste time on plumbing.
- [ ] **Test from a clean environment.** From a fresh laptop with only the starter kit installed; verify each scenario runs.

### Acceptance criteria

- Three scenarios with all artefacts (problem framing, setup video, live-build path, fallback recording, kill/graduation criteria, reproducer code).
- Founder rehearses each ≥ 5 times.
- Risk-mitigation runbook published.
- Clean-environment test passes.
- All artefacts in starter kit.

## Alternatives Considered

- **Pre-build the scenarios; demo as recorded only.** Rejected: undersells the SS1 vibe-coding proposition. The point is the live-build.
- **Skip fallback recordings.** Rejected: catastrophic single-point-of-failure; the recordings are insurance.
- **Live-build only one scenario.** Rejected: three gives reviewers choice; three rehearsed scenarios mean we have alternatives if one fails.
- **Skip the user-story setup video.** Rejected: reviewers need framing; without it, the live-build has no narrative.
- **Skip kill / graduation criteria.** Rejected: the SS1 form answer commits to them; they are part of the "discipline" pitch.

## Success Metrics

- **Primary**: Three rehearsed scenarios with all artefacts within 21 days; founder rehearsed each ≥ 5 times.
- **Guardrail**: Live-build completion time consistently 8–9 minutes; fallback videos available and tested.

## Scope

### In scope
- Three scenarios with full artefacts.
- Setup videos + fallback videos.
- Kill / graduation criteria.
- Risk-mitigation runbook.
- Pre-staged starting points in starter brains.

### Out of scope
- Vibe-coding workflow templates beyond the per-scenario criteria (P07-T03).
- Evidence kit beyond these scenarios (P07-T04).
- Live-coding kit logistics for interview day (P12-T03).

## Dependencies

- **Upstream**: P07-T01 (starter kit); P03-T03 (securities dataset); P00-T03 (theme tokens for visual consistency).
- **Downstream**: P12-T03 (SS1 live-coding kit references these scenarios), P12-T01 (SS1 pitch deck mentions them).
- **People**: engineer building scenarios; founder rehearsing and (likely) executing in interview.

## Open Questions

- Q1: For setup videos, who narrates? Recommendation: founder (consistency with the live-coding interview voice).
- Q2: For fallback recordings, do we use the same voice as setup? Recommendation: yes — same voice → same character.
- Q3: For practice rehearsals, in front of an audience or solo? Recommendation: solo first; then dry-run with squad as audience (per Phase 12).
- Q4: For pre-staged starting points, how much code is "Day Zero"? Recommendation: just project scaffolding (pnpm, deps, sample data loaded); no domain logic.

## Implementation Notes

- Each scenario reproducer in `vibe-coding-starter-kit/scenarios/{name}/` is git-committed; engineer rehearsal starts from a clean clone.
- Setup videos hosted in the project workspace + (eventually) on a Shinhan-friendly platform.
- Fallback recordings high-quality (1080p, clean audio, no ambient noise); reviewers should not perceive them as low-effort.
- Risk-mitigation runbook tested in dry-run (Phase 12).
- For the interview itself, the founder's laptop has all three scenarios pre-staged; founder picks one based on the reviewer's interest signal during the conversation.

## Test Plan

- Test 1: Each scenario completes from clean clone in 8–9 min.
- Test 2: Setup videos render correctly; bilingual subtitles work.
- Test 3: Fallback recordings playable; high quality.
- Test 4: Risk-mitigation runbook walked through; switch-to-fallback decision tree clear.
- Test 5: Founder rehearses each ≥ 5 times; rehearsal log maintained.

## Rollback Plan

- Bad scenario reproducer rolled back via PR.
- Bad fallback recording re-recorded.
- Last-resort if all three scenarios fail in the interview: founder pivots to chat surface demo (P05-T04).

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Scenario reproducers | `vibe-coding-starter-kit/scenarios/` | Engineer | Continuous |
| Setup videos | Project workspace | Founder | Until program end |
| Fallback recordings | Project workspace | Founder | Until program end |
| Risk-mitigation runbook | `docs/runbooks/ss1-live-coding.md` | Engineer | Continuous |
| Rehearsal log | `docs/audit/ss1-rehearsals/{date}.md` | Founder | Until program end |
| Kill / graduation criteria | Per-scenario README | Founder | Continuous |

## Operational Risks

- **Live-build fails in interview (Wi-Fi out, Claude API rate-limit, code typo cascading).** Mitigation: fallback recordings; pre-cached Claude Code session; mobile hotspot.
- **Founder rehearsal slips on schedule.** Mitigation: book rehearsal blocks now; treat as P0.
- **Reviewer asks for a scenario we haven't rehearsed.** Mitigation: gracefully redirect to one of the three; have one "improvised but bounded" scenario ready (e.g., "build a watchlist filter").
- **Setup video quality lower than expected.** Mitigation: founder reviews before commit; re-record if needed.

## Definition of Done

- Three scenarios with all artefacts in place.
- Founder rehearsed each ≥ 5 times.
- Risk-mitigation runbook published.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Scenarios use synthetic securities dataset (P03-T03); no customer data. Claude Code generates code interactively during the live build; outputs are reviewed by the founder during the demo.

### Human Oversight
Founder is the human at every step — driving the live-build, deciding when to pivot, deciding when to kill or graduate.

### Failure Modes
- Live-build code error: founder corrects in the moment; if unrecoverable, switch to fallback.
- Claude API outage: switch to fallback recording.
- Reviewer derails ("show me a different scenario"): founder pivots to whichever of the three best fits.
- All three scenarios fail simultaneously (highly unlikely): founder pivots to P05-T04 chat surface demo.

## Sales/CS Summary

CyberSkill's SS1 vibe-coding demo isn't pre-built; it's lived. The founder picks a scenario based on what the Shinhan Securities reviewer wants to see — portfolio summariser, regulatory checker, or backtest dashboard — and builds it live in 10 minutes using Claude Code, our starter kit's primitive library, and synthetic Securities data. If the live build fails, a polished recording shows the same scenario completed end-to-end. The point isn't the artefact; it's the velocity. From idea to working demo in days, not quarters — and we've rehearsed it five times so reviewers see the result, not the rehearsal.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR); during live-coding in the interview, Claude Code (Anthropic's coding agent) is the runtime tool per ADR-SHB-002.
- **Scope**: Claude drafted all sections of this FR.
- **Human review**: engineer authors scenarios; founder rehearses and executes; design lead reviews video quality.
