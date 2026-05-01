---
title: "Produce architecture and data-flow diagrams per BU"
author: "@cyberskill-eng"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-09-11"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Produce a comprehensive set of architecture and data-flow diagrams: per-BU architecture (SF9, SB5, SS1) showing how the engine integrates with that BU's data; cross-BU shared-engine view showing the "one engine, three skins" claim; data-flow diagram per BU with sensitivity tiers + residency annotations; threat model overlay (cross-references P08-T05); deployment-target diagrams (laptop / cloud / on-prem). Each diagram is design-polished, version-controlled (Mermaid in source), and rendered to PDF for distribution. Diagrams are the visual accompaniment to every Phase 11 + Phase 12 surface; without them, the architecture is described, not seen.

## Problem

Reviewers process visual information faster than text. Form Answers reference architecture; pitch decks need diagrams; compliance dossier needs data-flow diagrams. Without polished diagrams, every architectural claim requires reading prose.

Specific gaps if we shortcut:

- **Without per-BU architecture diagrams, "BU isolation" is rhetorical.**
- **Without cross-BU shared-engine diagram, the "one engine, three skins" claim is invisible.**
- **Without data-flow + sensitivity-tier overlays, PDPL conformance evidence is text-only.**
- **Without deployment-target diagrams, the laptop / cloud / on-prem story has no visual.**

The `feedback_p1_scope_preference` memory note biases us richer. For diagrams, "richer" means: per-BU + cross-BU + data-flow + sensitivity-tier overlay + threat-model overlay + deployment-target + version-controlled + bilingual annotations.

## Proposed Solution

A diagram library in `references/diagrams/`:

1. **Per-BU architecture diagrams** (3) — SF9, SB5, SS1; each shows the engine + that BU's data + integrations.
2. **Cross-BU shared-engine diagram** — single engine; three theme variants; shared metric registry.
3. **Per-BU data-flow diagrams with sensitivity overlays** (3) — every data hop tagged with sensitivity tier + residency.
4. **Threat-model overlay diagram** — same architecture with threats mapped (cross-references P08-T05).
5. **Deployment-target diagrams** (3) — laptop / cloud / on-prem.
6. **All Mermaid + rendered PDFs.**

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Author per-BU architecture diagrams.** Mermaid; show: chat surface → engine NL→SQL pipeline → metric registry → warehouse → audit log → HITL queue (where applicable).
- [ ] **Author cross-BU shared-engine diagram.** Single engine in centre; three theme variants on the periphery; shared metric registry; per-BU sensitivity policy.
- [ ] **Author per-BU data-flow diagrams with sensitivity overlays.** Each data hop annotated: data-classification, residency, encryption, access control.
- [ ] **Author threat-model overlay.** Architecture with threat-IDs from P08-T05 mapped to data-flow points.
- [ ] **Author deployment-target diagrams.** Laptop (single docker compose); cloud (GKE per-BU namespaces); on-prem (k3s + Vault + offline LLM).
- [ ] **Apply visual design.** Brand-surface compliant; per-BU theme variant subtle.
- [ ] **Bilingual annotations.** EN + VI labels.
- [ ] **PDF-export.** Each diagram exportable; dimensions appropriate for both deck slides and dossier inclusion.
- [ ] **Cross-reference.** Each diagram links to relevant FR (e.g., data-flow diagram links to P02-T07 PDPL); each FR with architectural impact links to its diagram.
- [ ] **Founder spot-check.**

### Acceptance criteria

- All ~15 diagrams (3 + 1 + 3 + 1 + 3, plus possibly threat overlay variants) authored, polished, exported.
- Mermaid sources in source control.
- PDFs in dossier.
- Cross-references in place.
- Founder spot-check approved.

## Alternatives Considered

- **Skip data-flow diagrams; text only.** Rejected: visual processing is faster.
- **Use a commercial diagramming tool (Lucidchart, draw.io).** Rejected: Mermaid is portable + version-controlled.
- **Single architecture diagram for all three BUs.** Rejected: per-BU is more compelling.

## Success Metrics

- **Primary**: All diagrams within 14 days.
- **Guardrail**: Diagrams accurately reflect implementation (verified by engineering review).

## Scope

### In scope
- All listed diagrams + Mermaid sources + PDFs + bilingual annotations + cross-references.

### Out of scope
- 3D visualisations (out of scope).
- Animated walkthroughs (out of scope; static diagrams are the standard).

## Dependencies

- **Upstream**: P02-T01..T09 (engine architecture); P05-T02..T04 (BU surfaces); P08-T05 (threat model); P10-T01..T04 (deployment targets); P00-T03 (brand surface).
- **Downstream**: P11-T04 (dossier); P12-T01 (pitch decks).
- **People**: engineer authoring; design lead applying visual; founder ratifying.

## Open Questions

- Q1: Mermaid handles complex diagrams gracefully; if we hit limits, alternative? Recommendation: SVG hand-drawn for the most complex.
- Q2: Per-BU sensitivity tier per data hop — too much detail or just right? Recommendation: just right; reviewers love the depth.

## Implementation Notes

- Mermaid sources in `references/diagrams/sources/*.mmd`.
- PDFs rendered via Mermaid CLI or mermaid-cli docker image.
- Brand surface tokens applied via Mermaid theme.
- Each diagram has a numbered ID for easy reference (D-001, D-002...).

## Test Plan

- Test 1: Each diagram renders correctly.
- Test 2: Engineering review verifies accuracy against implementation.
- Test 3: Founder spot-check.
- Test 4: Bilingual labels render correctly.

## Rollback Plan

- Bad diagram rolled back via PR.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Mermaid sources | `references/diagrams/sources/` | Engineer | Continuous |
| Rendered PDFs | `references/diagrams/pdfs/` | Engineer | Continuous |
| Diagram index | `references/diagrams/INDEX.md` | Engineer | Continuous |
| Cross-reference map | `references/diagrams/CROSS_REF.md` | Engineer | Continuous |

## Operational Risks

- **Diagram drifts from implementation.** Mitigation: PR-time check; engineering review.
- **Mermaid limit hit on complex diagrams.** Mitigation: SVG fallback.

## Definition of Done

- All diagrams complete; PDFs in place; cross-references wired.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR; assists Mermaid drafting).
- **Scope**: Claude drafted all sections; diagram content authored by engineer with Claude assistance.
- **Human review**: engineer authors; design lead applies visual; founder spot-checks.
