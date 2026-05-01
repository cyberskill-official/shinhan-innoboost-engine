---
title: "Run 3 timed rehearsals (internal, friendly external, time-pressured)"
author: "@cyberskill-pm"
department: product
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-10-02"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Run three rehearsal cycles before the interview week (20–29 May): (1) **Internal dry-run** — full team watching, brutal feedback; (2) **Friendly-external dry-run** — outside-the-team reviewer with banking experience; (3) **Time-pressured dry-run** — things deliberately broken to test fallbacks. Each rehearsal covers all three BU pitches (P12-T01) + run-of-show (P12-T02) + SS1 live-coding (P12-T03) + FAQ (P12-T04). Findings drive iteration; final calibration locks the pitch + decks before interviews. Without rehearsals, the interview is the rehearsal.

## Problem

Without staged rehearsals, every weakness in the pitch surfaces in front of Shinhan reviewers. With three rehearsal cycles, weaknesses surface in safe spaces and get fixed.

Specific gaps if we shortcut:

- **Without internal dry-run, team-internal alignment is incomplete.**
- **Without friendly external, blind spots remain.**
- **Without time-pressured, fallback discipline is untested.**

The `feedback_p1_scope_preference` memory note biases us richer. For rehearsals, "richer" means: three distinct cycles + structured feedback + iteration + final calibration + recorded sessions for post-mortem.

## Proposed Solution

Three rehearsal sessions in `rehearsals/`:

1. **Internal dry-run** — week of 11 May; full team; recorded; structured feedback per BU + per slide.
2. **Friendly-external dry-run** — week of 13 May; banking-sector external reviewer (CyberSkill network); recorded.
3. **Time-pressured dry-run** — week of 15 May; deliberate breaks (Wi-Fi off; laptop swap; reviewer derail); founder rehearses all fallbacks.

Final calibration session 18 May. Deck + run-of-show + kit locked at this point.

Setup target: 18 May (assignment + execution).

### Subtasks

- [ ] **Schedule three rehearsals.** Calendar invites; squad attendance.
- [ ] **Author rehearsal-feedback template.** Per-slide + per-transition; rated.
- [ ] **Recruit friendly-external reviewer.** Banking-sector experience; via CyberSkill network.
- [ ] **Run internal dry-run.** Record; capture feedback.
- [ ] **Iterate based on feedback.** Founder + PM + design lead; revise deck + run-of-show.
- [ ] **Run friendly-external dry-run.** Record; capture feedback.
- [ ] **Iterate again.**
- [ ] **Run time-pressured dry-run.** Deliberate breaks; founder rehearses every fallback.
- [ ] **Final calibration session.** Lock deck + run-of-show + kit.
- [ ] **Post-rehearsal record.** Lessons + final state captured.

### Acceptance criteria

- Three rehearsals executed.
- Feedback captured + iterated.
- External reviewer feedback incorporated.
- Time-pressured fallback rehearsals all executed.
- Final calibration locked.
- Recordings archived.

## Alternatives Considered

- **One big dress rehearsal.** Rejected: too late to iterate.
- **Skip external reviewer.** Rejected: blind spots.
- **Skip time-pressured.** Rejected: fallback discipline matters.

## Success Metrics

- **Primary**: Three rehearsals completed by 18 May; final calibration locked.
- **Guardrail**: Rehearsal-feedback issues mostly closed by interview week.

## Scope

### In scope
- Three rehearsal sessions + feedback + iteration + final calibration + recordings.

### Out of scope
- Decks (P12-T01).
- Run-of-show (P12-T02).
- Live-coding kit (P12-T03).
- FAQ (P12-T04).

## Dependencies

- **Upstream**: P12-T01..T04.
- **Downstream**: interview week itself.
- **People**: PM scheduling; founder presenting; squad attending; external reviewer.

## Open Questions

- Q1: External reviewer compensation? Recommendation: token (lunch + thank-you); not commercial engagement.
- Q2: Recording retention? Recommendation: until end of program for learning; deleted after.

## Implementation Notes

- Each rehearsal: 90 minutes (45 min for the deck × 3 BUs + 45 min feedback).
- Feedback template captures: clarity, timing, polish, content, fallback execution.
- Final calibration is a 60-min session locking everything.

## Test Plan

- Test 1: Each rehearsal completed.
- Test 2: Feedback captured for each.
- Test 3: Iteration evident between rehearsals.
- Test 4: Final calibration locks the artefacts.

## Rollback Plan

- Bad rehearsal lessons rolled back via revisiting the prior rehearsal output.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Rehearsal recordings | Project workspace | PM | Until program end |
| Per-rehearsal feedback | `rehearsals/feedback/{date}.md` | PM | Until program end |
| Final calibration record | `rehearsals/CALIBRATION.md` | Founder | Until program end |

## Operational Risks

- **Rehearsal slips schedule.** Mitigation: book early; treat as P0.
- **External reviewer unavailable.** Mitigation: 2 backup options.
- **Iteration produces conflicting feedback.** Mitigation: founder breaks tie.

## Definition of Done

- Three rehearsals + iterations + final calibration.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: PM schedules; founder presents; external reviewer attests.
