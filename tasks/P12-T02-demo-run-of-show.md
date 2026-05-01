---
title: "Author 3 demo run-of-show plans (per BU, with failure plan)"
author: "@cyberskill-pm"
department: product
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-09-25"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Author run-of-show plans for each BU's 5-minute demo: setup (laptop + iPad + backup laptop + mobile hotspot + recorded fallback); persona sequencing (which user is logged in for each scene); dialogue cues (who speaks during which transition); failure plan (if X breaks, switch to Y; if internet dies, switch to local stack from P10-T01). Each run-of-show is rehearsed in P12-T05. Without it, the live demo is at the mercy of conditions; with it, the demo is choreographed.

## Problem

Live demos go off-script. Without rehearsed run-of-show, every transition is risk. With it, each minute is choreographed and every fallback is mapped.

Specific gaps if we shortcut:

- **Without setup checklist, day-of has avoidable hiccups.**
- **Without persona sequencing, demo flow is jumbled.**
- **Without dialogue cues, multiple presenters step on each other.**
- **Without failure plan, surprise = panic.**

The `feedback_p1_scope_preference` memory note biases us richer. For run-of-show, "richer" means: per-BU + setup + sequencing + cues + failure plan + rehearsed + post-demo handoff.

## Proposed Solution

Three run-of-show docs in `rehearsals/`:

1. **SF9 run-of-show.**
2. **SB5 run-of-show.**
3. **SS1 run-of-show.**

Each: setup checklist; minute-by-minute timeline; persona sequencing; dialogue cues; failure-plan decision tree; post-demo handoff to Q&A.

Setup target: 7 days from task assignment.

### Subtasks

- [ ] **Per-BU setup checklist.** Laptop + iPad + backup + mobile hotspot + recorded fallback + printed handouts.
- [ ] **Per-BU minute-by-minute timeline.** 0–1 min: opening; 1–6 min: live demo; 6–10 min: architecture + governance; 10–13 min: references + plan; 13–15 min: ask + Q&A buffer.
- [ ] **Per-BU persona sequencing.** Which login (P05-T02..T04) is active for each scene.
- [ ] **Per-BU dialogue cues.** Who speaks; transitions.
- [ ] **Per-BU failure plan.** If Wi-Fi dies → laptop deploy (P10-T01); if engine slow → switch to recorded video; if reviewer derails → graceful pivot.
- [ ] **Post-demo handoff.** Founder hands the conversation; sales lead picks up Q&A.
- [ ] **Print version.** Run-of-show printed; founder carries.

### Acceptance criteria

- Three run-of-show docs with all sections.
- Setup checklists complete.
- Failure-plan decision trees clear.
- Print version available.

## Alternatives Considered

- **Single run-of-show for all three BUs.** Rejected: per-BU is the discipline.
- **Skip failure plan; improvise on the day.** Rejected: rehearsed beats improvised.

## Success Metrics

- **Primary**: Three run-of-show docs within 7 days.
- **Guardrail**: Failure plan decision trees executable under stress (verified in P12-T05 dry-runs).

## Scope

### In scope
- Three run-of-show docs + setup checklists + failure plans + print versions.

### Out of scope
- Pitch decks (P12-T01).
- SS1 live-coding kit (P12-T03).
- FAQ (P12-T04).
- Dry-runs (P12-T05).

## Dependencies

- **Upstream**: P12-T01 (decks reference); P05-T02..T04 (surfaces); P10-T01 (laptop fallback); P07-T02 (SS1 scenarios).
- **Downstream**: P12-T05 (rehearsal cadence).
- **People**: PM authoring; founder reviewing.

## Open Questions

- Q1: Backup laptop config — full mirror or minimal? Recommendation: full mirror; if primary fails, swap is seamless.
- Q2: Mobile hotspot SIM — pre-purchased VN SIM? Recommendation: yes; tested.

## Implementation Notes

- Run-of-show printable on a single A4 sheet; founder carries.
- Failure plan decision tree as flowchart.
- Persona sequencing tested for credential pre-load.

## Test Plan

- Test 1: Walk through each run-of-show.
- Test 2: Failure-plan decision tree comprehensible under simulated stress.
- Test 3: Setup checklist complete (every item tested).

## Rollback Plan

- Bad sequence rolled back via PR.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| SF9 run-of-show | `rehearsals/sf9.md` | PM | Until program end |
| SB5 run-of-show | `rehearsals/sb5.md` | PM | Until program end |
| SS1 run-of-show | `rehearsals/ss1.md` | PM | Until program end |
| Print versions | `rehearsals/printable/` | PM | Until program end |

## Operational Risks

- **Setup item missed.** Mitigation: checklist; founder verifies day-of.
- **Failure plan untested.** Mitigation: P12-T05 dry-runs.

## Definition of Done

- Three run-of-show docs complete; print versions; ready for P12-T05 dry-runs.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: PM authors; founder ratifies.
