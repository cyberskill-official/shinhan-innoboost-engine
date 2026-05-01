---
title: "Build compliance dossier index with all Phase 8 outputs"
author: "@cyberskill-compliance-lead"
department: operations
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-09-18"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Build the compliance dossier index — the single navigable artefact that ties together every Phase 8 + Phase 11 compliance output: PDPL conformance (P08-T01); Cybersecurity Law (P08-T02); SBV regulatory mapping (P08-T03); ISO 27001 + 42001 + SOC 2 readiness (P08-T04); threat model (P08-T05); pen-test summary (P08-T06); pre-filled vendor questionnaires (P08-T07); IR + BCP runbooks (P08-T08); reference one-pagers (P11-T01); AI Doctrine excerpts (P11-T02); architecture + data-flow diagrams (P11-T03); past-incident transparency log (P11-T05); team bios (P11-T06). The dossier is what we hand to a Shinhan procurement team or SBV auditor — comprehensive, navigable, always-current.

## Problem

Compliance artefacts scattered across folders are unfindable under audit pressure. The dossier is the single navigable index — the "everything is here" artefact reviewers can sample from. Without it, every audit conversation starts with "let me find that..."

Specific gaps if we shortcut:

- **Without dossier index, reviewers can't navigate the corpus.**
- **Without freshness indicator, stale artefacts read as current.**
- **Without cross-references, the dossier looks like a heap, not a system.**
- **Without published-summary version (no internal sensitive details), every share is a redaction job.**

The `feedback_p1_scope_preference` memory note biases us richer. For dossier, "richer" means: index + freshness + cross-references + per-artefact metadata + per-section completeness summary + published external version + audit-trail of dossier changes.

## Proposed Solution

A dossier index in `compliance/DOSSIER.md` plus published external version:

1. **Master index.** Lists every compliance artefact with: title, location, owner, last-updated, freshness status, public/internal flag.
2. **Per-section completeness summary.** Per regulation / standard: % of artefacts complete; remaining gaps.
3. **Cross-references.** Each artefact references related artefacts; each FR with compliance impact references the dossier section.
4. **Published external version.** Public-safe redacted; for distribution to Shinhan procurement / SBV.
5. **Quarterly review.** Aligned with PDPL / Cybersecurity / SBV review cadences.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Author master index.** All compliance artefacts listed with metadata.
- [ ] **Author per-section completeness summary.** Per regulation / standard: per-control status; gap list.
- [ ] **Cross-references.** Each artefact links to related artefacts.
- [ ] **Author published external version.** Redacted version with sensitive details removed; suitable for external distribution.
- [ ] **Schedule quarterly review.** PM owns; aligned cadence.
- [ ] **Surface in admin console** (P05-T05): dossier dashboard.
- [ ] **Brief the squad.** Dossier access; how to update artefacts.
- [ ] **Audit trail of dossier changes.** Versioned; major changes logged.

### Acceptance criteria

- Master index complete with all artefacts.
- Per-section completeness computed.
- Cross-references in place.
- External published version available.
- Quarterly review scheduled.
- Admin console surface live.
- Squad briefed.

## Alternatives Considered

- **Multiple dossiers per regulation.** Rejected: single index makes navigation easier.
- **Skip published external version.** Rejected: redaction-on-demand is slow.
- **Manual index updates.** Rejected: auto-generated from artefact metadata.

## Success Metrics

- **Primary**: Dossier complete within 14 days.
- **Guardrail**: Quarterly review on schedule; freshness indicators accurate.

## Scope

### In scope
- Master index + completeness summary + cross-references + published version + quarterly review + admin console surface + briefing.

### Out of scope
- New compliance artefacts (handled by their own FRs).
- External certification (post-PoC).

## Dependencies

- **Upstream**: P08-T01..T08; P11-T01..T03, T05, T06.
- **Downstream**: P12-T01 (pitch decks reference); customer / regulator distributions.
- **People**: compliance lead authoring; founder ratifying public version; PM scheduling reviews.

## Open Questions

- Q1: Auto-generation of completeness summary — pull from per-artefact frontmatter? Recommendation: yes; PM authors a small script.
- Q2: For external version, who approves redaction? Recommendation: founder + legal lead.

## Implementation Notes

- Master index in Markdown; auto-renders to HTML in admin console.
- External version stored separately; redaction reviewed quarterly.
- Per-artefact metadata (frontmatter): owner, last-updated, freshness, public/internal.

## Test Plan

- Test 1: Index covers every Phase 8 + Phase 11 artefact.
- Test 2: Completeness summary computes correctly.
- Test 3: Cross-references resolve.
- Test 4: External version contains no sensitive details.
- Test 5: Admin console renders dossier dashboard.

## Rollback Plan

- Bad dossier change rolled back via PR; versioned.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Master dossier index | `compliance/DOSSIER.md` | Compliance lead | Continuous |
| Published external version | `compliance/DOSSIER_PUBLIC.md` | Compliance lead + founder | Continuous |
| Completeness summary | `compliance/COMPLETENESS.md` | Compliance lead | Continuous |
| Quarterly review records | `docs/audit/dossier-reviews/{date}.md` | PM | 7 years |
| Dossier change log | Git history of `compliance/` | Compliance lead | Indefinite |

## Operational Risks

- **Artefact drift uncatalogued.** Mitigation: per-artefact metadata; auto-detection of new artefacts in `compliance/`.
- **External version contains sensitive details.** Mitigation: founder + legal review; redaction checklist.

## Definition of Done

- Dossier complete; external version available; admin surface live; review scheduled.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: compliance lead authors index; legal lead reviews redactions; founder ratifies public version.
