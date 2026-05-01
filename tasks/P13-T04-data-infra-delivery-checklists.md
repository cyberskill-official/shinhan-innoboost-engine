---
title: "Produce data and infrastructure delivery checklists"
author: "@cyberskill-eng-sec"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-10-09"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Produce checklists that bound the kickoff-time exchange between CyberSkill + Shinhan-side teams: **data delivery checklist** — masked dataset specifications, schema agreement, sensitivity tagging, freshness expectations, transfer mechanism (from P02-T07 PDPL conformance); **infrastructure delivery checklist** — GPU specifications (per P00-T05 + P10-T03 sizing), network access, integration points (warehouse adapters per P02-T01), VPN access, on-prem topology. Delivered at kickoff Day 1.

## Problem

Without checklists, kickoff is a long discussion of "what do we need from each side?" With them, it's a structured handoff.

## Proposed Solution

Two checklists in `references/kickoff/`:

1. **Data delivery checklist.** What CyberSkill needs from Shinhan: masked datasets per BU; schema docs; sensitivity tagging; freshness SLA; transfer mechanism (per PDPL).
2. **Infrastructure delivery checklist.** What CyberSkill provides + what Shinhan provides: GPU specifications; network access; VPN + on-prem topology; integration points.

Setup target: 7 days from task assignment.

### Subtasks

- [ ] **Author data delivery checklist.** Per BU.
- [ ] **Author infrastructure delivery checklist.** Both sides' obligations.
- [ ] **Cross-reference with P02-T07 PDPL + P10-T03 on-prem + P00-T05 GPU.**
- [ ] **Founder + Shinhan PM joint review at kickoff.**

### Acceptance criteria

- Both checklists ready for kickoff.

## Dependencies

- **Upstream**: P02-T07; P10-T03; P00-T05; P10-T04.
- **People**: eng-sec authoring; founder + Shinhan PM ratifying at kickoff.

## Audit Trail / Artefacts

| Artefact | Location |
|---|---|
| Data delivery checklist | `references/kickoff/DATA_DELIVERY.md` |
| Infrastructure delivery checklist | `references/kickoff/INFRA_DELIVERY.md` |

## Definition of Done

- Both checklists ready for kickoff.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting).
- **Human review**: eng-sec authors; founder ratifies; joint review with Shinhan PM at kickoff.
