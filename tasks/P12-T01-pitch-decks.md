---
title: "Author 3 BU-specific 15-min pitch decks (SF9, SB5, SS1)"
author: "@cyberskill-pm"
department: product
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: user_facing
eu_ai_act_risk_class: not_ai
target_release: "2026-09-25"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Author three BU-specific 15-minute pitch decks following the canonical 10-slide structure: (1) the problem in their own words; (2) the solution in one sentence; (3) live demo (5 min); (4) architecture (1 min); (5) governance (HITL, audit, eval, compliance); (6) references (Engagement A + B); (7) 12-week PoC plan with kill + graduation criteria; (8) commercial path post-PoC + indicative pricing; (9) team + commitment; (10) ask. Each deck branded per its BU theme; bilingual (EN + VI); founder rehearsed. The decks are the centerpiece of the interview — without polished decks, every talking point lands rougher.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"Founder + Delivery Lead committed full-program" — CyberSkill SF9/SB5/SS1 form answers
"production-track scope (post-PoC) priced separately; indicative range USD 60–120K" — CyberSkill form answers
</untrusted_content>

## Problem

The interview window is 20–29 May; each 15-min slot has stake-on-every-minute. Without polished decks, time is wasted on slide rendering rather than substance. With them, every minute lands.

Specific gaps if we shortcut:

- **Without per-BU decks, content is generic.**
- **Without 10-slide discipline, decks bloat to 25+ slides and reviewers tune out.**
- **Without bilingual rendering, VN-language reviewers mis-process.**
- **Without rehearsed timing, slots overrun.**

The `feedback_enterprise_voice` memory note locks the external voice — corporate, no founder personal, "CyberSkill Engagement Team" as signatory.

The `feedback_p1_scope_preference` memory note biases us richer. For decks, "richer" means: per-BU + 10-slide discipline + bilingual + design polish + speaker notes + handout version + rehearsed.

## Proposed Solution

Three pitch decks in `decks/`:

1. **SF9 deck** (`decks/sf9.{en,vi}.pdf`).
2. **SB5 deck** (`decks/sb5.{en,vi}.pdf`).
3. **SS1 deck** (`decks/ss1.{en,vi}.pdf`).

Each follows the 10-slide structure; design-polished per BU theme; speaker notes; handout version (PDF for distribution).

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Per-deck slide 1.** Problem in their words; cite the BU brief verbatim.
- [ ] **Slide 2.** Solution in one sentence. Same across all three with BU framing.
- [ ] **Slide 3.** Live demo (5 min); demo references P05-T02..T04 surfaces; for SS1 references P07-T02 scenarios.
- [ ] **Slide 4.** Architecture (1 min); references P11-T03 diagrams.
- [ ] **Slide 5.** Governance (HITL, audit, eval, compliance); references P02-T03 + P02-T09 + P04-T03 + P11-T04.
- [ ] **Slide 6.** References (Engagement A + B); references P11-T01 one-pagers.
- [ ] **Slide 7.** 12-week PoC plan with kill + graduation criteria; references P07-T03 templates.
- [ ] **Slide 8.** Commercial path post-PoC + indicative pricing (USD 60–120K per Form Answers).
- [ ] **Slide 9.** Team + commitment; references P11-T06 bios.
- [ ] **Slide 10.** Ask: what we need from Shinhan (data, sponsor, infra).
- [ ] **Apply visual design.** Per-BU theme; brand surface (P00-T03).
- [ ] **Author speaker notes.** Per slide; verbatim talking points; estimated time.
- [ ] **Bilingual versions.** EN + VI.
- [ ] **Handout version.** PDF for distribution.
- [ ] **Rehearse with founder.** 3 timed rehearsals per deck before P12-T05 dry-runs.

### Acceptance criteria

- Three decks (EN + VI) with all 10 slides + speaker notes.
- Design-polished per BU.
- Founder rehearsed each ≥ 3 times.
- Handout PDFs available.

## Alternatives Considered

- **Single generic deck.** Rejected: per-BU is the wedge.
- **Skip handout version.** Rejected: leave-behind matters.
- **Skip Vietnamese.** Rejected: bilingual is standard.

## Success Metrics

- **Primary**: Three decks complete; rehearsed.
- **Guardrail**: Each deck delivers in 13–14 min with 1–2 min for Q&A buffer.

## Scope

### In scope
- Three decks + speaker notes + bilingual + handouts + rehearsals.

### Out of scope
- Run-of-show (P12-T02).
- SS1 live-coding kit (P12-T03).
- FAQ doc (P12-T04).
- Dry-runs themselves (P12-T05).

## Dependencies

- **Upstream**: P05-T02..T04 (BU surfaces); P07-T02 (SS1 scenarios); P11-T01..T06 (trust materials).
- **Downstream**: P12-T02 (run-of-show), P12-T05 (rehearsal cadence).
- **People**: PM authoring; design lead polishing; founder rehearsing.

## Open Questions

- Q1: Slide count exactly 10 or 8–12 acceptable? Recommendation: discipline at 10; cut over-runs.
- Q2: Pricing slide — exact figures or range? Recommendation: range; per Form Answers.

## Implementation Notes

- Slides authored in Keynote (founder preference) or PowerPoint; PDF-exported.
- Design lead applies brand-surface tokens.
- Speaker notes embedded in slide notes; printed handout has notes.

## Test Plan

- Test 1: Per-deck timing rehearsed.
- Test 2: Vietnamese rendering verified.
- Test 3: Founder rehearsal feedback incorporated.

## Rollback Plan

- Bad slide rolled back via PR.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| SF9 deck | `decks/sf9.{en,vi}.pdf` | PM + founder | Until program end |
| SB5 deck | `decks/sb5.{en,vi}.pdf` | PM + founder | Until program end |
| SS1 deck | `decks/ss1.{en,vi}.pdf` | PM + founder | Until program end |
| Speaker notes | Embedded + handout | PM | Until program end |
| Rehearsal log | `docs/audit/deck-rehearsals/{date}.md` | Founder | Until program end |

## Operational Risks

- **Slide rendering issue on Shinhan projector.** Mitigation: PDF-only; tested on multiple display profiles.
- **Bilingual rendering mismatch.** Mitigation: native-VN reviewer.
- **Pricing slide misread.** Mitigation: founder rehearsal; clear ranges.

## Definition of Done

- Three decks complete + rehearsed.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR; assists deck content).
- **Scope**: Claude drafted all sections of this FR.
- **Human review**: PM authors; design lead polishes; founder rehearses.
