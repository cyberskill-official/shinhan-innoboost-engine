---
title: "Author PDPL conformance mapping and consent-flow doc"
author: "@cyberskill-compliance-lead"
department: operations
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-08-28"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Author the PDPL (Vietnam Personal Data Protection Law, Decree 13/2023/ND-CP) conformance mapping that documents how every PDPL article that applies to our processing is satisfied by a CyberSkill control: lawful basis (Art. 11); purpose limitation (Art. 8); data minimisation (Art. 9); right-to-access (Art. 13); right-to-erasure (Art. 14); cross-border transfer requirements (Art. 16); breach notification (Art. 23); etc. Plus a parallel consent-flow doc showing each user data subject's consent journey end-to-end (signup → consent capture → purpose-binding → revocation → erasure). The mapping is the structural artefact a Shinhan compliance officer sees first; without it, every PDPL claim is rhetorical.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"PDPL audit passed with zero findings on the AI-touched workflow" — CyberSkill Engagement B reference (via SF9/SB5 form answers)
"PDPL-respecting consent" — CyberSkill AI Doctrine v1.0.0 excerpt (referenced in form answers)
</untrusted_content>

## Problem

PDPL is the foundational privacy regulation for any production-track Shinhan deployment in Vietnam. Form Answers commit to PDPL conformance with concrete claims; the conformance mapping is what makes those claims auditable.

Specific gaps if we shortcut:

- **Without per-article mapping, PDPL conformance is a blanket claim.** Reviewers want article-by-article evidence.
- **Without consent-flow doc, the consent ledger (P02-T07) is invisible — reviewers see the code but not the user journey.**
- **Without breach-notification readiness, Art. 23's tight timeline (72 hours to MPS) is unprepared.**
- **Without cross-border transfer documentation, any data flowing to non-VN regions (the current Anthropic API call) is uncovered.**

The `shinhanos_data_residency` memory note mandates VN-tenant data residency; the PDPL mapping must document where data lives.

The `shinhanos_ai_compliance` memory note's 7 primitives include PDPL conformance; this task makes that primitive visible.

The `feedback_p1_scope_preference` memory note biases us richer. For PDPL conformance, "richer" means: every applicable article mapped + control reference + evidence pointer + consent-flow doc + breach-notification runbook + cross-border transfer documentation + DPO-equivalent role designated + quarterly review cadence.

## Proposed Solution

A conformance dossier in `compliance/pdpl/`:

1. **Per-article mapping** at `compliance/pdpl/MAPPING.md`. Each applicable PDPL article: text excerpt, CyberSkill control(s), evidence reference (e.g., "P02-T07 consent ledger; audit log entry shows enforcement"), gaps with remediation plan.
2. **Consent-flow doc** at `compliance/pdpl/CONSENT_FLOW.md`. Visual + narrative: data subject signup → consent capture → purpose binding → revocation → erasure.
3. **Breach-notification runbook** at `docs/runbooks/pdpl-breach-notification.md`. 72-hour timeline; who notifies MPS; templates; escalation tree.
4. **Cross-border transfer documentation** at `compliance/pdpl/CROSS_BORDER.md`. Data flows to Anthropic API (US); Cloud SQL (selected region); CDN (if any); each documented with lawful basis + safeguards.
5. **DPO-equivalent role.** Per PDPL Art. 5(2), document the CyberSkill-side privacy lead (compliance lead).
6. **Quarterly review cadence.** Calendar entry every quarter for PDPL re-review.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Map every applicable PDPL article.** Read Decree 13/2023; identify articles applying to our processing; document each.
- [ ] **Author per-article control reference.** Each article references a specific CyberSkill task or control (e.g., "Art. 8 — purpose limitation — controlled by P02-T07 purpose enum + P02-T03 policy layer mid-rule").
- [ ] **Document evidence pointers.** Each control has an evidence pointer: audit-log query that demonstrates enforcement; sample queries with output.
- [ ] **Identify gaps.** Articles where current controls are insufficient; document remediation plan with target date.
- [ ] **Author consent-flow visual.** Diagram (Mermaid or SVG): data subject journey from signup to erasure; decision points labelled.
- [ ] **Author consent-flow narrative.** Step-by-step in prose: each phase explained; what data is captured; when consent is required; what happens on revocation.
- [ ] **Author breach-notification runbook.** Sections: detection (alerts); containment (immediate); investigation (forensics); notification (72-hour timeline; MPS notification template; affected-subject notification template); post-incident review.
- [ ] **Document cross-border data flows.** Anthropic API: US-region; lawful basis (legitimate interest + standard contractual clause equivalent); safeguards (encryption in transit + at rest + Anthropic's own controls). Cloud SQL: selected region documented. CDN: documented if used.
- [ ] **Designate DPO-equivalent role.** Compliance lead designated; contact details published.
- [ ] **Schedule quarterly review.** Calendar entry; PM owns scheduling; agenda template included.
- [ ] **Brief the squad.** 30-min PDPL primer for the engineering squad.
- [ ] **Cross-reference with P11-T04 compliance dossier.** Index entry.

### Acceptance criteria

- Per-article mapping complete with every applicable PDPL article.
- Consent-flow doc published.
- Breach-notification runbook published.
- Cross-border transfer doc published.
- DPO-equivalent role designated.
- Quarterly review calendar.
- Squad briefed.

## Alternatives Considered

- **Cite an external PDPL conformance audit.** Rejected: external audit costs time + money; for the demo phase, internal mapping is sufficient; external audit is post-PoC.
- **Skip the breach runbook.** Rejected: 72-hour timeline cannot be improvised.
- **Skip cross-border documentation.** Rejected: Anthropic API call is a cross-border flow; documenting is non-negotiable.
- **DPO not designated until commercial track.** Rejected: PDPL Art. 5(2) requires now.

## Success Metrics

- **Primary**: All five components (mapping + consent flow + breach runbook + cross-border doc + DPO designation) within 14 days.
- **Guardrail**: Quarterly review on schedule; first review on time.

## Scope

### In scope
- Per-article PDPL mapping.
- Consent-flow doc.
- Breach-notification runbook.
- Cross-border transfer documentation.
- DPO-equivalent role.
- Quarterly review cadence.
- Squad briefing.

### Out of scope
- Other regulations (P08-T02 Cybersecurity Law; P08-T03 SBV; P08-T04 ISO).
- External PDPL audit (post-PoC).
- Data subject rights management UI for end users (deferred to v1.1).

## Dependencies

- **Upstream**: P02-T07 (PDPL consent + minimisation engine); P01-T08 (encryption); P02-T09 (audit log); P00-T04 (NDA + DPA); legal-library Decree 13/2023 reference.
- **Downstream**: P11-T04 (compliance dossier index).
- **People**: compliance lead authoring; legal lead reviewing; founder ratifying DPO designation.
- **Memory references**: `shinhanos_data_residency`, `shinhanos_ai_compliance`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: PDPL Article 16 cross-border transfer — does Anthropic API call qualify as a "transfer of personal data abroad" requiring specific MPS approval? Recommendation: legal review; conservative interpretation = yes if any user-content with PII flows to Anthropic. We mitigate by sanitising PII before LLM calls (P02-T07).
- Q2: For breach notification, who is the MPS contact? Recommendation: legal lead identifies; runbook lists.
- Q3: For DPO-equivalent role, is compliance lead enough, or do we need a Vietnamese-domiciled DPO? Recommendation: legal review; compliance lead + Vietnamese-domicile attestation should suffice.
- Q4: Quarterly review cadence — first review aligned to which quarter? Recommendation: 90 days post-deploy.

## Implementation Notes

- Per-article mapping table format: Article | Excerpt | Control | Evidence | Gaps | Target.
- Consent-flow visual rendered with Mermaid or SVG; embedded in MAPPING.md.
- Breach runbook in `docs/runbooks/`; cross-linked from MAPPING.md.
- DPO-equivalent designation includes contact email + phone (per `cyberskill_company_facts`).

## Test Plan

- Test 1: Mapping completeness — every applicable article mapped.
- Test 2: Consent-flow visual renders correctly.
- Test 3: Breach runbook walked through; timing matches 72-hour budget.
- Test 4: Cross-border doc reflects actual data flows.
- Test 5: Squad briefing held; comprehension verified.

## Rollback Plan

- Bad mapping rolled back via PR; mapping is source-controlled.
- Bad runbook rolled back via PR.
- Quarterly review can identify drift.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Per-article mapping | `compliance/pdpl/MAPPING.md` | Compliance lead | Continuous |
| Consent flow doc | `compliance/pdpl/CONSENT_FLOW.md` | Compliance lead | Continuous |
| Breach runbook | `docs/runbooks/pdpl-breach-notification.md` | Compliance lead | Continuous |
| Cross-border transfer doc | `compliance/pdpl/CROSS_BORDER.md` | Compliance lead + legal lead | Continuous |
| DPO designation | `compliance/pdpl/DPO.md` | Founder | Continuous |
| Quarterly review records | `docs/audit/pdpl-reviews/{date}.md` | Compliance lead | 7 years |

## Operational Risks

- **PDPL article missed.** Mitigation: legal lead reviews; quarterly review.
- **Breach notification missed (72-hour breach).** Mitigation: runbook + alert routing.
- **Cross-border flow expansion (e.g., new LLM provider).** Mitigation: cross-border doc updated as part of routing-matrix changes.

## Definition of Done

- All five components published.
- DPO designated.
- Quarterly review scheduled.
- Squad briefed.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Conformance task does not consume training data; it documents controls.

### Human Oversight
Compliance lead authors and reviews; legal lead reviews; founder ratifies designation. Quarterly review keeps fresh.

### Failure Modes
- Article missed: caught in legal review or quarterly review.
- Cross-border flow undocumented: caught when the routing matrix changes.
- Breach detected but runbook fails to trigger 72-hour notification: P0 incident; founder + legal escalate immediately.

## Sales/CS Summary

CyberSkill's PDPL conformance mapping is the article-by-article evidence Shinhan compliance officers need: every applicable provision of Vietnam's Personal Data Protection Decree 13/2023 is mapped to a specific CyberSkill control with audit-log evidence. Plus a consent-flow doc, a 72-hour breach-notification runbook, cross-border transfer documentation, and a designated DPO-equivalent. When a Shinhan reviewer asks "are you PDPL-conformant?" the answer is the mapping document — concrete, auditable, version-controlled.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR; assists mapping authoring).
- **Scope**: Claude drafted all sections of this FR.
- **Human review**: compliance lead authors PDPL mapping with legal-lead review; founder ratifies DPO designation.
