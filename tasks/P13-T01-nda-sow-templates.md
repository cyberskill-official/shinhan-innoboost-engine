---
title: "Draft mutual NDA and PoC SOW templates"
author: "@cyberskill-legal"
department: operations
status: draft
priority: p0
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

Draft the post-shortlist legal templates: a mutual NDA aligned to Shinhan's three-tier IP terms (per Innoboost Q&A); a PoC Statement of Work (SOW) with scope, milestones (12-week), success criteria (per BU), kill criterion, IP terms aligned, deliverables, timelines, payment milestones (VND 200M grant + commercial-track indicative pricing), and exit clauses. Templates are pre-staged; on shortlist confirmation, customised per BU and sent within 48 hours.

## Customer Quotes

<untrusted_content source="innoboost_qa_excerpt">
"Ownership is divided into three tiers: Pre-existing startup IP remains with the startup; Pre-existing Shinhan IP remains with Shinhan; and any new IP co-created during the 12 weeks is jointly owned" — Innoboost Q&A Section IV.1
</untrusted_content>

## Problem

Post-shortlist legal cycles can take weeks; pre-staged templates compress to days.

Specific gaps if we shortcut:

- **Without pre-staged NDA, post-shortlist legal review delays kickoff.**
- **Without pre-staged SOW, scope conversations restart from scratch.**

## Proposed Solution

Templates in `legal/post-poc/`:

1. **Mutual NDA template.** Aligned to Shinhan's three-tier IP terms.
2. **PoC SOW template.** 12-week scope; per-BU customisable; success + kill criteria; IP terms; payment.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Author NDA template.** Aligned to Shinhan's three-tier IP terms; bilingual.
- [ ] **Author SOW template.** Scope; milestones; success criteria; kill criterion; IP; payment (VND 200M grant + commercial-track indicative pricing); exit clauses.
- [ ] **Per-BU customisation slots.** Variables for SF9 / SB5 / SS1 specifics.
- [ ] **Founder + legal review.**

### Acceptance criteria

- Both templates authored, reviewed, ready to customise.

## Dependencies

- **Upstream**: P00-T01 + P00-T04 (existing legal frameworks).
- **People**: legal lead authoring; founder ratifying.

## Audit Trail / Artefacts

| Artefact | Location | Retention |
|---|---|---|
| NDA template | `legal/post-poc/NDA_TEMPLATE.docx` | Indefinite |
| SOW template | `legal/post-poc/SOW_TEMPLATE.docx` | Indefinite |

## Definition of Done

- Templates ready for customisation.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted FR sections; templates authored by legal lead.
- **Human review**: legal lead authors; founder ratifies.
