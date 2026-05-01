---
title: "Produce squad team bios with clearance status and language fluency"
author: "@cyberskill-pm"
department: human_resources
status: draft
priority: p1
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

Produce one-page bios for every squad member joining the Shinhan Innoboost PoC: relevant experience (engagements, technologies, skills); language fluency (Vietnamese / English / Korean); clearance status (NDA signed; background check completed); on-call availability. Bios are anonymised at first names + last initial per `feedback_enterprise_voice` (no founder personal name in external materials), formatted to brand-surface standards, included in the compliance dossier (P11-T04) and the pitch deck (P12-T01). Bios are the structural answer to "who's on this team?" — banking-sector procurement asks; we have answers.

## Problem

Without team bios, "trust us" is unsubstantiated. Procurement asks for the squad's background; without bios, we scramble. With them, we hand over a polished 1-pager.

Specific gaps if we shortcut:

- **Without bios, "experienced team" is rhetorical.**
- **Without language fluency, customer-team-fit is unverified.**
- **Without clearance status, procurement timeline slips.**

The `feedback_enterprise_voice` memory note locks the external voice; bios use first-name + last-initial (e.g., "Stephen C.") rather than full names, except for the founder where role is referenced.

The `cyberskill_company_facts` memory note locks the 10-person VN remote team context.

The `feedback_p1_scope_preference` memory note biases us richer. For bios, "richer" means: 1 page per squad member + experience + skills + languages + clearance + on-call + bilingual.

## Proposed Solution

A bios pack at `references/team-bios/`:

1. **Per-squad-member 1-pager.** Photo (optional); first-name + last-initial; role; relevant experience; key skills; languages; clearance status (NDA + background check); on-call availability.
2. **Squad summary.** Composition: counts by role; total experience; languages distribution.
3. **Bilingual versions.** EN + VI for each.
4. **PDF-export.**
5. **Inclusion in dossier (P11-T04) + deck (P12-T01).**

Setup target: 7 days from task assignment.

### Subtasks

- [ ] **Identify squad members.** Per P00-T06 workspace + project tracker; ~6–8 members.
- [ ] **Author per-member bio.** Each member fills a template; PM + design lead polish.
- [ ] **Verify clearance.** NDA addendum signed (P00-T04); background check status documented.
- [ ] **Apply visual design.** Brand-surface compliant.
- [ ] **Translate to Vietnamese.** Native-VN reviewer.
- [ ] **PDF-export per bio.**
- [ ] **Author squad summary.** Aggregate stats.
- [ ] **Cross-reference from P11-T04 + P12-T01.**

### Acceptance criteria

- All squad members have complete bios.
- Clearance status verified.
- Bilingual versions (EN + VI).
- Squad summary in place.
- Cross-references wired.

## Alternatives Considered

- **LinkedIn-style bios with full names.** Rejected: violates `feedback_enterprise_voice`.
- **Skip bios; rely on company-level claims.** Rejected: procurement teams ask.
- **Skip clearance status.** Rejected: it's the procurement-friendly signal.

## Success Metrics

- **Primary**: All squad bios within 7 days.
- **Guardrail**: Founder spot-checks; zero personally-identifying issues per voice rules.

## Scope

### In scope
- Per-member 1-pagers + squad summary + bilingual + PDF + cross-references.

### Out of scope
- Public LinkedIn / website bios (separate workstream).
- Org-chart visualisation (deferred).

## Dependencies

- **Upstream**: P00-T04 (NDA addendum); P00-T03 (brand surface).
- **Downstream**: P11-T04 (dossier), P12-T01 (decks).
- **People**: PM authoring; design lead applying visual; founder ratifying.

## Open Questions

- Q1: Photos — required or optional? Recommendation: optional; some prefer not.
- Q2: Background-check vendor? Recommendation: existing CyberSkill HR provider.
- Q3: Korean fluency — material to include? Recommendation: yes; Shinhan-HQ-touching scenarios.

## Implementation Notes

- Per-member template: 1 page; standard structure.
- Founder's bio uses role-only attribution per `feedback_enterprise_voice`.
- Squad summary aggregated from per-member fields.

## Test Plan

- Test 1: Bios complete for every squad member.
- Test 2: Founder spot-check.
- Test 3: Vietnamese translations reviewed.
- Test 4: PDFs render.

## Rollback Plan

- Bad bio rolled back via PR.
- Squad-member offboarding → bio archived; squad summary updated.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Per-member bios | `references/team-bios/{handle}.{en,vi}.pdf` | PM | Until program end |
| Squad summary | `references/team-bios/SQUAD_SUMMARY.md` | PM | Until program end |
| Clearance log | `legal/clearances/squad-{date}.md` | Legal lead | 7 years |

## Operational Risks

- **Squad change mid-cycle.** Mitigation: bio refreshed; summary updated.
- **Privacy concern for member.** Mitigation: bio template anonymises; member approves before publication.

## Definition of Done

- All bios complete; cross-references wired.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections; bios authored by squad members + PM polish.
- **Human review**: PM authors; squad members approve; founder ratifies.
