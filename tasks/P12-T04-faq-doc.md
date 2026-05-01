---
title: "Author FAQ doc anticipating reviewer questions"
author: "@cyberskill-pm"
department: sales
status: draft
priority: p1
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-09-25"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Author the FAQ doc that anticipates Shinhan reviewer questions and pre-stages our answers: comparison-to-incumbent (per BU); LLM provider outage; hallucination response; on-prem deployment specifics; data-deletion guarantee; "show us a wrong answer your eval caught"; "what did you kill last year?" (vibe-coding credibility); "why three submissions instead of one focused?". Each answer is structured + cited (links to FRs / dossier sections / data points). The FAQ is the founder's internal cheat-sheet during interviews — and a leave-behind for Shinhan-side discussion after the meeting.

## Problem

Reviewers ask predictable questions. Without prepared answers, the founder improvises under stress; with them, every answer is concise + grounded.

Specific gaps if we shortcut:

- **Without anticipated questions, the interview is reactive.**
- **Without grounded answers, every response sounds like marketing.**
- **Without leave-behind version, post-interview discussion has no reference.**

The `feedback_p1_scope_preference` memory note biases us richer. For FAQ, "richer" means: 20+ questions + structured answers + citations + leave-behind PDF + bilingual.

## Proposed Solution

A FAQ doc at `references/FAQ.md`:

20+ predictable questions answered with structured replies and citations. Bilingual. Leave-behind PDF.

Setup target: 7 days from task assignment.

### Subtasks

- [ ] **Identify 20+ likely questions.** Sources: Innoboost Q&A doc; demo-build-plan.md FAQ section; founder + sales lead brainstorm; past customer questions.
- [ ] **Author structured answers.** Each: 2–4 sentences; citation links to FRs / dossier / data.
- [ ] **Categorise.** Per-BU + cross-cutting.
- [ ] **Bilingual (EN + VI).** Native-VN reviewer.
- [ ] **PDF-export leave-behind.**
- [ ] **Founder rehearsal.** Walk through every Q.

### Acceptance criteria

- 20+ questions answered with citations.
- Bilingual.
- PDF available.
- Founder rehearsed.

## Alternatives Considered

- **Improvise on the day.** Rejected: under stress, improvisation is rough.
- **Skip leave-behind.** Rejected: post-interview reference matters.

## Success Metrics

- **Primary**: 20+ questions answered within 7 days.
- **Guardrail**: Founder rehearsal: 90% of questions answered confidently in 30 sec or less.

## Scope

### In scope
- 20+ questions + bilingual + PDF + rehearsal.

### Out of scope
- Public FAQ for marketing site (separate workstream).

## Dependencies

- **Upstream**: All Phase 1–11 outputs (each answer references at least one).
- **Downstream**: P12-T05 (dry-runs use FAQ).
- **People**: PM authoring; sales lead reviewing; founder rehearsing.

## Open Questions

- Q1: Question categories — by BU or by topic? Recommendation: both axes; matrix-style.
- Q2: Citations to dossier or to source FR? Recommendation: dossier (most-current); source FR for engineering depth.

## Implementation Notes

- Each Q is 1 line; each A is 2–4 sentences max.
- Citations as inline links (Markdown).
- Bilingual side-by-side or per-language file.

## Test Plan

- Test 1: Founder rehearses all 20+ questions; time per response.
- Test 2: Native-VN reviewer verifies translations.
- Test 3: PDF renders correctly.

## Rollback Plan

- Bad answer corrected via PR.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| FAQ doc | `references/FAQ.{en,vi}.md` | PM | Until program end |
| Leave-behind PDF | `references/FAQ.{en,vi}.pdf` | PM | Until program end |
| Rehearsal log | `docs/audit/faq-rehearsals/{date}.md` | Founder | Until program end |

## Operational Risks

- **Reviewer asks unanticipated question.** Mitigation: structure helps even unanticipated questions; FAQ teaches the answer pattern.
- **Citation broken.** Mitigation: PR check.

## Definition of Done

- 20+ Q&A; rehearsed; PDF available.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR; assists Q&A drafting).
- **Scope**: Claude drafted all sections of this FR.
- **Human review**: PM authors; sales lead reviews; founder rehearses.
