---
title: "Produce Engagement A & B sponsor-approved one-pagers"
author: "@cyberskill-sales-lead"
department: sales
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-09-04"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Produce two anonymised, sponsor-approved one-page reference summaries: Engagement A (enterprise software, Vietnam + ASEAN, 18 months, chat-with-data + governance) and Engagement B (financial services / ops platform, Vietnam, 12+ months, document-intelligence + HITL + PDPL audit). Each one-pager: problem, solution, results with cited metrics, sponsor attribution scope per the P00-T01 rider, link to the reference-call schedule. The one-pagers are what Shinhan reviewers see when they ask "show me your past work" — concrete, anonymised, credible.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"reference calls available with sponsor consent post-shortlist" — CyberSkill SF9/SB5/SS1 form answers
"Engagement A — Enterprise software, Vietnam + ASEAN, 18 months ongoing... Reporting cycle time reduced ~70% on metrics in scope; zero hallucinated KPI numbers since UAT" — CyberSkill form answers
"Engagement B — Financial services / ops platform, Vietnam, 12+ months ongoing... Manual document-handling effort reduced ~60%; PDPL audit passed with zero findings on the AI-touched workflow" — CyberSkill form answers
</untrusted_content>

## Problem

Form Answers commit to specific reference engagements with specific metrics. Without polished one-pagers, those references are bullet points in a form. With them, references become structured artefacts that survive scrutiny.

Specific gaps if we shortcut:

- **Without one-pagers, references are line items in a form, not stand-alone artefacts.**
- **Without sponsor-approved scope, citation risks consent-violation.**
- **Without reference-call link, "available post-shortlist" is unsubstantiated.**

The `feedback_enterprise_voice` memory note locks the external voice — anonymised, no founder name, "CyberSkill Engagement Team" as signatory.

The `feedback_p1_scope_preference` memory note biases us richer. For one-pagers, "richer" means: visual design + structured sections + cited metrics + reference-call CTA + linked to consent rider.

## Proposed Solution

Two one-pagers in `references/`:

1. **Engagement A one-pager.** Anonymised, structured (problem / approach / outcome / metrics / quote if consented).
2. **Engagement B one-pager.** Same shape.
3. **Reference-call schedule.** Available time slots per sponsor (per P00-T01).
4. **Per-metric citation map.** Maps each cited metric to its consent-rider authorisation.

Setup target: 7 days from task assignment after P00-T01 sponsor consent.

### Subtasks

- [ ] **Verify consent scope.** Each cited metric matches the rider's authorised list.
- [ ] **Author Engagement A one-pager.** Structure: problem in 1 sentence; approach in 2 sentences; outcomes (3 bulleted); cited metrics (each with attribution scope); reference call CTA + sponsor name (if rider authorises).
- [ ] **Author Engagement B one-pager.** Same shape.
- [ ] **Apply visual design.** Brand-surface (P00-T03) compliant; corporate-but-warm; bilingual (EN + VI subtitles).
- [ ] **Build reference-call schedule.** Sponsor-confirmed slots per P00-T01.
- [ ] **Per-metric citation map.** `references/CITATION_MAP.md`: each cited metric → consent-rider authorisation.
- [ ] **Founder spot-check.** Founder reviews against P00-T01 rider; confirms zero violations.
- [ ] **Format as PDF.** For inclusion in pitch decks (P12-T01) and dossier (P11-T04).

### Acceptance criteria

- Two one-pagers authored, designed, and PDF-exported.
- Reference-call schedule populated with sponsor-confirmed slots.
- Per-metric citation map verifies every cite is consent-authorised.
- Founder spot-check approved.
- Bilingual versions available.

## Alternatives Considered

- **Multi-page case studies instead of one-pagers.** Rejected: one-pagers are the standard reference-material format.
- **Skip citation map.** Rejected: explicit consent traceability is the safety net.
- **Skip Vietnamese version.** Rejected: bilingual is standard for VN-context.

## Success Metrics

- **Primary**: Two one-pagers + reference-call schedule + citation map within 7 days after P00-T01 consent.
- **Guardrail**: Zero consent-scope violations.

## Scope

### In scope
- Two one-pagers + reference-call schedule + citation map + PDFs.

### Out of scope
- Public-facing case studies (deferred).
- Multi-page version (deferred).
- Other engagements (deferred).

## Dependencies

- **Upstream**: P00-T01 (sponsor consent); P00-T03 (brand surface).
- **Downstream**: P12-T01 (pitch decks include); P11-T04 (compliance dossier).
- **People**: sales lead authoring; design lead applying visual; founder ratifying.

## Open Questions

- Q1: PDF or HTML one-pagers? Recommendation: PDF for distribution; HTML embedded in admin console for internal viewing.
- Q2: Sponsor name attribution — full name, role only, or no attribution? Recommendation: per rider; default to role-only; sponsor name only with explicit permission.
- Q3: Vietnamese translation — direct or adapted? Recommendation: adapted; native-VN reviewer.

## Implementation Notes

- One-pager dimensions: A4; same layout for both engagements.
- Per-metric citation map referenced from the one-pager's footer.
- Reference-call schedule tracked with calendar holds (per P00-T01); updated as slots fill.

## Test Plan

- Test 1: Spot-check by founder.
- Test 2: Sample-reviewer reads one-pager; verifies clarity + credibility.
- Test 3: PDF renders correctly.
- Test 4: Vietnamese reviewer verifies translation.

## Rollback Plan

- Bad citation rolled back via PR; PDF re-rendered.
- Sponsor revokes consent → immediate removal from active distribution.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Engagement A one-pager (EN + VI) | `references/A-onepager.{en,vi}.pdf` | Sales lead | Until consent end |
| Engagement B one-pager (EN + VI) | `references/B-onepager.{en,vi}.pdf` | Sales lead | Until consent end |
| Reference-call schedule | `references/CALL_SCHEDULE.md` | Sales lead | Until program end |
| Per-metric citation map | `references/CITATION_MAP.md` | Legal lead | Until consent end |
| Founder approval log | `docs/audit/reference-onepagers/{date}.md` | Founder | 7 years |

## Operational Risks

- **Sponsor revokes consent.** Mitigation: immediate removal; published-prior is historical only.
- **Cite goes outside rider scope.** Mitigation: citation map review; founder spot-check.
- **Reference-call sponsor unavailable on requested slot.** Mitigation: multiple slots reserved per P00-T01.

## Definition of Done

- Both one-pagers complete; CTA wired; citation map verified.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections of this FR. The one-pagers themselves are authored by sales lead with citation-scope verification.
- **Human review**: sales lead authors content; design lead applies visual; legal lead verifies citations; founder ratifies.
