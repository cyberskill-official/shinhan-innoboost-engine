---
title: "Compile AI Doctrine excerpts for three BU lenses"
author: "@cyberskill-pm"
department: product
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

Compile three one-page AI Doctrine excerpts from the locked CyberSkill AI Doctrine v1.0.0 (locked 2026-04-25, referenced in all three Form Answers), each tailored to one BU's likely concerns: (1) **Bank lens** — governance, HITL, audit log; (2) **Securities lens** — velocity, vibe-coding discipline; (3) **SVFC lens** — accuracy, citations, confidence tiers. Each excerpt is one page, design-polished, attached to the relevant pitch deck (P12-T01) and the compliance dossier (P11-T04). The Doctrine itself is 700+ pages; the excerpts are the surfaces reviewers see.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"Internal CyberSkill Global Design System & AI Doctrine v1.0.0 (locked 2026-04-25)" — referenced in SF9, SB5, SS1 form answers
"Excerpt attached. Full 700+ page doctrine available for review under NDA." — referenced in form answers
</untrusted_content>

## Problem

The Form Answers commit to AI Doctrine excerpts attached. Without polished excerpts, "we have a doctrine" is unsubstantiated. With them, reviewers see structural maturity in seconds.

Specific gaps if we shortcut:

- **Without excerpt, reviewers cannot verify the doctrine claim.**
- **Without per-BU lens, the same excerpt sent to all three BUs reads as boilerplate.**
- **Without design polish, the excerpt looks rushed.**

The `feedback_p1_scope_preference` memory note biases us richer. For excerpts, "richer" means: per-BU lens + visual design + 1-page each + bilingual + attached to deck + cross-referenced in dossier.

## Proposed Solution

Three one-page excerpts in `references/ai-doctrine/`:

1. **Bank lens excerpt.** Highlights doctrine sections on governance, HITL workflow, deterministic policy gates, audit logging, regulatory mapping.
2. **Securities lens excerpt.** Highlights doctrine sections on rapid prototyping, vibe-coding workflow templates, kill / graduation criteria, evidence-based discipline.
3. **SVFC lens excerpt.** Highlights doctrine sections on confidence-tier scoring, citation-faithfulness, semantic metric layer, eval harness, accuracy guarantees.

Each excerpt: design-polished (P00-T03 brand); 1 page; bilingual (EN + VI); attached to pitch deck (P12-T01) and dossier (P11-T04).

Setup target: 7 days from task assignment.

### Subtasks

- [ ] **Identify lens-relevant doctrine sections.** From the 700+ page doctrine, pick the sections that resonate with each BU's likely concerns.
- [ ] **Author Bank lens excerpt.** 1 page; structured headers; key principles; visual diagram if helpful.
- [ ] **Author Securities lens excerpt.** Same shape.
- [ ] **Author SVFC lens excerpt.** Same shape.
- [ ] **Apply visual design.** Brand-surface compliant; per-BU theme variant tinted (subtle, not loud).
- [ ] **Translate to Vietnamese.** Native-VN reviewer.
- [ ] **PDF-export.** For attachment to deck + dossier.
- [ ] **Cross-reference from P12-T01 + P11-T04.**
- [ ] **Founder spot-check.** Confirms doctrine fidelity.

### Acceptance criteria

- Three one-pagers (EN + VI) PDF-exported.
- Each lens distinct + relevant to its BU.
- Founder spot-check approved.
- Cross-references in deck + dossier.

## Alternatives Considered

- **Single excerpt for all three BUs.** Rejected: per-lens is more compelling.
- **Multi-page excerpts.** Rejected: one-page is the discipline.
- **Skip Vietnamese.** Rejected: bilingual is standard.

## Success Metrics

- **Primary**: Three excerpts within 7 days.
- **Guardrail**: Zero doctrine-fidelity issues (founder approval).

## Scope

### In scope
- Three excerpts (EN + VI) + design polish + cross-references.

### Out of scope
- Full doctrine release (under NDA only).
- Public summary (deferred).

## Dependencies

- **Upstream**: AI Doctrine v1.0.0; P00-T03 (brand surface).
- **Downstream**: P12-T01 (pitch decks); P11-T04 (dossier).
- **People**: PM authoring; design lead applying visual; founder ratifying; native-VN reviewer.

## Open Questions

- Q1: Which doctrine sections per lens? Recommendation: PM proposes; founder ratifies.
- Q2: Should excerpts include doctrine-internal section numbers? Recommendation: yes — signals structural depth.

## Implementation Notes

- Excerpts are extractions, not summaries — verbatim where possible.
- Per-lens visual tint subtle (use BU theme accent, not primary).
- Attribution: "Excerpt from CyberSkill AI Doctrine v1.0.0, locked 2026-04-25."

## Test Plan

- Test 1: Each excerpt reads as relevant to its BU.
- Test 2: Founder verifies doctrine fidelity.
- Test 3: Vietnamese translation reviewed.
- Test 4: PDFs render.

## Rollback Plan

- Bad excerpt corrected via PR; PDF re-rendered.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Bank lens excerpt | `references/ai-doctrine/BANK.{en,vi}.pdf` | PM + founder | Continuous |
| Securities lens excerpt | `references/ai-doctrine/SECURITIES.{en,vi}.pdf` | PM + founder | Continuous |
| SVFC lens excerpt | `references/ai-doctrine/SVFC.{en,vi}.pdf` | PM + founder | Continuous |
| Founder approval log | `docs/audit/doctrine-excerpts/{date}.md` | Founder | 7 years |

## Operational Risks

- **Doctrine fidelity issue (excerpt misrepresents).** Mitigation: founder spot-check.
- **Excerpt becomes outdated as doctrine evolves.** Mitigation: doctrine version tagged; excerpts tied to v1.0.0.

## Definition of Done

- Three excerpts complete; cross-references in place.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections; excerpts themselves are extractions of human-authored doctrine.
- **Human review**: PM authors excerpts; design lead applies visual; founder ratifies.
