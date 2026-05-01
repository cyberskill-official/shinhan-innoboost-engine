---
title: "Author VN Cybersecurity Law (1 Jul 2026) conformance mapping"
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

Author the conformance mapping for Vietnam's new Cybersecurity Law (effective 1 July 2026, squarely inside our PoC window) and its implementing decrees. Document obligations: data localisation requirements; lawful interception interface (placeholder; clarify with legal); incident reporting timelines; security audit cadence; vendor-management requirements. Map each obligation to a CyberSkill control. Plus a "regulatory uncertainty" log capturing items still subject to forthcoming implementing decrees, with quarterly re-review until decrees stabilise.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"strengthened governance under PDPL and the new Cybersecurity Law (effective 1 July 2026)" — CyberSkill SB5 form answer
</untrusted_content>

## Problem

The new Cybersecurity Law's effective date sits inside our PoC window. Banking-sector reviewers know this and will ask. Without a mapping, "we are ready" is unsubstantiated.

Specific gaps if we shortcut:

- **Without per-obligation mapping, conformance is rhetorical.**
- **Without uncertainty log, regulatory drift is invisible — implementing decrees may evolve.**
- **Without lawful-interception placeholder, the obligation is unprepared.**
- **Without data-localisation documentation, our cloud-region choices are exposed.**

The `shinhanos_data_residency` memory note already mandates VN-tenant data residency; this task ties that to the regulatory obligation.

The `shinhanos_ai_compliance` memory note's 7 primitives include compliance-readiness; this task makes Cybersecurity Law part of that.

## Proposed Solution

A conformance dossier in `compliance/cybersecurity-law/`:

1. **Per-obligation mapping** at `compliance/cybersecurity-law/MAPPING.md`.
2. **Uncertainty log** at `compliance/cybersecurity-law/UNCERTAINTY.md`. Items pending implementing-decree clarification; quarterly review.
3. **Data-localisation documentation** at `compliance/cybersecurity-law/LOCALISATION.md`. Cross-references `shinhanos_data_residency` memory + P10-T04 task.
4. **Incident-reporting runbook** at `docs/runbooks/cybersecurity-law-incident-reporting.md`.
5. **Security-audit cadence** documented; aligns with P08-T04 ISO 27001 + 42001 + SOC 2 cadence.
6. **Vendor-management** documented; cross-references P00-T04 NDA pack + P00-T01 sponsor consent.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Map obligations.** Read the Cybersecurity Law text + currently-published implementing decrees; identify obligations applicable to our processing.
- [ ] **Author per-obligation control reference.** Each obligation → CyberSkill control + evidence pointer + gaps with remediation.
- [ ] **Author uncertainty log.** Items pending implementing decrees; flag each with the affected obligation + our current best interpretation + the trigger event for re-review.
- [ ] **Author data-localisation doc.** Document where VN-tenant data resides; the engineering enforcement (P10-T04); the gap (Anthropic API for VN tenants — currently mitigated by sanitising PII before LLM calls; long-term plan via on-prem Qwen path per ADR-SHB-002).
- [ ] **Author incident-reporting runbook.** Per the law's reporting timelines (under implementing decrees expected to specify); generic template ready to fill specifics when decrees clarify.
- [ ] **Document security-audit cadence.** Tie to P08-T04 ISO/SOC schedule.
- [ ] **Document vendor-management.** Cross-references to P00-T04 NDA pack; per-vendor-due-diligence checklist.
- [ ] **Schedule quarterly review.** Same as P08-T01 quarterly cadence; aligned.
- [ ] **Brief the squad.** 30-min Cybersecurity Law primer.
- [ ] **Cross-reference with P11-T04 compliance dossier.**

### Acceptance criteria

- All six components in place.
- Quarterly review scheduled.
- Squad briefed.

## Alternatives Considered

- **Wait for implementing decrees before authoring.** Rejected: 1 July 2026 is our PoC window; ready-to-evolve mapping is better than nothing.
- **Skip uncertainty log; pretend we know.** Rejected: explicit uncertainty is more credible than confident incorrectness.
- **Skip lawful-interception placeholder.** Rejected: the law expects something; placeholder + "pending decree clarification" is better than silence.

## Success Metrics

- **Primary**: All six components within 14 days.
- **Guardrail**: Quarterly review on schedule; uncertainty items decrease as implementing decrees clarify.

## Scope

### In scope
- Per-obligation mapping.
- Uncertainty log.
- Data-localisation, incident-reporting runbook, audit cadence, vendor-management docs.
- Quarterly review.
- Squad briefing.

### Out of scope
- Other regulations (P08-T01 PDPL; P08-T03 SBV; P08-T04 ISO).
- External Cybersecurity Law audit (post-PoC).
- Lawful-interception interface implementation (deferred until decrees specify).

## Dependencies

- **Upstream**: P10-T04 (residency engineering); P02-T07 (PDPL consent — same data-protection stack); P00-T04 (NDA pack); legal-library Cybersecurity Law text.
- **Downstream**: P11-T04 (compliance dossier index).
- **People**: compliance lead authoring; legal lead reviewing; founder ratifying.
- **Memory references**: `shinhanos_data_residency`, `shinhanos_ai_compliance`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: Which Cybersecurity Law articles are most material to a chat-with-data engine? Recommendation: data localisation; access controls; incident reporting; audit logging; vendor management. Legal review confirms.
- Q2: Lawful-interception — does our scope require an implementation? Recommendation: legal review; conservative interpretation = no for our processing (no real-time messaging that would be subject to interception); document position.
- Q3: For Anthropic API cross-border flow, does the new law specifically prohibit, or require notification? Recommendation: legal review; current best interpretation = legitimate-interest with safeguards.

## Implementation Notes

- Mapping in tabular form (same shape as P08-T01).
- Uncertainty log: columns for "obligation", "current interpretation", "trigger for re-review", "owner".
- Data-localisation doc cites the `shinhanos_data_residency` memory note explicitly; cross-link.
- Quarterly review aligned with PDPL review (P08-T01) for efficiency.

## Test Plan

- Test 1: Mapping completeness — every obligation identified by legal review is mapped.
- Test 2: Uncertainty log accurate — every item has a trigger.
- Test 3: Data-localisation doc reflects current architecture.
- Test 4: Squad briefing comprehension verified.

## Rollback Plan

- Bad mapping rolled back via PR.
- New implementing decree triggers update to mapping; uncertainty log items resolved or re-classified.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Per-obligation mapping | `compliance/cybersecurity-law/MAPPING.md` | Compliance lead | Continuous |
| Uncertainty log | `compliance/cybersecurity-law/UNCERTAINTY.md` | Compliance lead | Continuous |
| Data-localisation doc | `compliance/cybersecurity-law/LOCALISATION.md` | Compliance lead | Continuous |
| Incident-reporting runbook | `docs/runbooks/cybersecurity-law-incident-reporting.md` | Compliance lead | Continuous |
| Audit-cadence doc | `compliance/cybersecurity-law/AUDIT_CADENCE.md` | Compliance lead | Continuous |
| Vendor-management doc | `compliance/cybersecurity-law/VENDOR_MANAGEMENT.md` | Compliance lead | Continuous |
| Quarterly review records | `docs/audit/cybersecurity-law-reviews/{date}.md` | Compliance lead | 7 years |

## Operational Risks

- **New implementing decree changes obligations mid-cycle.** Mitigation: quarterly review; mapping updated; uncertainty items resolved.
- **Lawful-interception requirement clarified to require implementation.** Mitigation: documented position; legal review on first clarification.
- **Data-localisation interpretation differs from regulator's view.** Mitigation: legal review; conservative defaults.

## Definition of Done

- All six components published.
- Quarterly review scheduled.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Compliance task; no AI training. Documents controls.

### Human Oversight
Compliance lead + legal lead author; founder ratifies; quarterly review.

### Failure Modes
- Obligation missed: legal review or quarterly review catches.
- Decree changes interpretation: uncertainty log triggers re-review.

## Sales/CS Summary

CyberSkill's Cybersecurity Law conformance mapping addresses the new law that takes effect 1 July 2026 — exactly inside the Innoboost PoC window. Every applicable obligation is mapped to a CyberSkill control; uncertainty items pending implementing decrees are explicitly flagged for re-review; data-localisation, incident reporting, and vendor management are documented. When the implementing decrees publish, our mapping evolves quickly because the structure is in place.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: compliance lead authors with legal-lead review; founder ratifies.
