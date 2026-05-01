---
title: "Author SBV banking-IT regulatory conformance mapping"
author: "@cyberskill-compliance-lead"
department: operations
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

Author the State Bank of Vietnam (SBV) banking-IT regulatory conformance mapping covering the circulars and decisions material to a chat-with-data system deployed inside Shinhan's banking entities — Circular 09/2020/TT-NHNN (IT operations), Circular 50/2024/TT-NHNN (if applicable to our scope), Decision 1112/QD-NHNN (IT system management); plus any successor instruments published before kickoff. Document each obligation, the CyberSkill control that satisfies it, evidence pointers, gaps with remediation. Include incident-reporting timelines specific to SBV (typically faster than PDPL). The mapping is the explicit answer to the Innoboost Q&A's repeated reference to "deployed per SBV regulations" — without it, the SB5 commercial track is gated on guesswork.

## Customer Quotes

<untrusted_content source="innoboost_qa_excerpt">
"For full commercialization, the solution must be deployed per SBV regulations." — Innoboost Q&A Section VI.3
"the commercial phase might require on-premise hosting based on the requirements from SBV" — Innoboost Q&A Section VI.4
</untrusted_content>

## Problem

The Innoboost Q&A flags SBV regulations as a commercialisation gate twice. Without a mapping, the SB5 commercial conversation post-PoC starts from scratch; with a mapping, we walk in with the answer.

Specific gaps if we shortcut:

- **Without per-circular mapping, SBV conformance is rhetorical.**
- **Without incident-reporting timelines specific to SBV, the breach response runbook from P08-T01 (PDPL) is incomplete — SBV often demands faster reporting.**
- **Without on-prem deployment readiness explicitly tied to SBV obligations, the on-prem story is technical but not regulatory.**
- **Without quarterly review, regulatory drift is invisible.**

The `feedback_p1_scope_preference` memory note biases us richer. For SBV mapping, "richer" means: per-circular detail + incident-reporting timeline + on-prem-deployment regulatory tie-in + audit-trail mapping + vendor-management mapping + quarterly review.

## Proposed Solution

A conformance dossier in `compliance/sbv/`:

1. **Per-circular mapping** at `compliance/sbv/MAPPING.md` (one section per applicable circular).
2. **Incident-reporting runbook addendum** at `docs/runbooks/sbv-incident-reporting.md` (faster timelines than PDPL).
3. **On-prem deployment regulatory tie-in** at `compliance/sbv/ON_PREM.md` (cross-references P10-T03).
4. **Audit-trail mapping** documenting how P02-T09 audit log satisfies SBV's audit-record requirements.
5. **Vendor-management mapping** documenting how P00-T04 NDA pack + P00-T01 sponsor consent satisfies SBV's third-party vendor obligations.
6. **Quarterly review** aligned with PDPL + Cybersecurity Law cadence.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Identify applicable circulars + decisions.** Legal review: Circular 09/2020 (IT operations) — confirmed applicable; Circular 50/2024 (if applicable to our chat scope) — clarify; Decision 1112/QD-NHNN — clarify; any others surfaced by legal review.
- [ ] **Map each circular's articles.** Article-by-article: control + evidence + gaps + remediation.
- [ ] **Author SBV-specific incident-reporting runbook.** SBV typically requires reporting within 24 hours (vs PDPL's 72); document the faster path. Include incident classification (Severity 1: customer-data exposure / Severity 2: service unavailable / Severity 3: degraded performance).
- [ ] **Author on-prem deployment regulatory tie-in.** Cross-reference P10-T03 air-gapped deployment; document which SBV obligations on-prem deployment satisfies (e.g., data localisation requirements).
- [ ] **Author audit-trail mapping.** SBV's audit-log requirements; how P02-T09 satisfies (append-only, hash-chained, 7-year retention, WORM mirror).
- [ ] **Author vendor-management mapping.** SBV's third-party requirements; how our NDA pack + due-diligence satisfies.
- [ ] **Schedule quarterly review.** Same cadence as P08-T01 + P08-T02 reviews; aligned for efficiency.
- [ ] **Brief the squad.** 30-min SBV regulatory primer for the engineering squad.
- [ ] **Cross-reference with P11-T04 compliance dossier.**

### Acceptance criteria

- All six components in place.
- Quarterly review scheduled (aligned with PDPL + Cybersecurity Law).
- Squad briefed.

## Alternatives Considered

- **Skip SBV mapping; assume PDPL covers it.** Rejected: SBV's banking-specific obligations go beyond PDPL.
- **Wait for actual customer (Shinhan Bank) requirements before mapping.** Rejected: published circulars are public; mapping now is faster.
- **Hire external SBV-specialist counsel.** Considered for production-track; for demo phase, internal mapping with legal-lead review is sufficient.

## Success Metrics

- **Primary**: All six components within 14 days.
- **Guardrail**: Quarterly review on schedule.

## Scope

### In scope
- Per-circular mapping for SBV instruments material to our scope.
- Incident-reporting runbook addendum.
- On-prem deployment regulatory tie-in.
- Audit-trail + vendor-management mappings.
- Quarterly review.
- Squad briefing.

### Out of scope
- Other regulations (P08-T01 PDPL; P08-T02 Cybersecurity Law; P08-T04 ISO/SOC).
- External SBV audit (post-PoC).
- Bank-specific (non-SBV-circular) internal Shinhan policies (handled at kickoff).

## Dependencies

- **Upstream**: P02-T09 (audit log), P10-T03 (on-prem deployment), P00-T04 (NDA pack), P08-T01 (PDPL — coordinated breach reporting), P08-T02 (Cybersecurity Law — overlapping obligations).
- **Downstream**: P11-T04 (compliance dossier).
- **People**: compliance lead authoring; legal lead reviewing; founder ratifying.

## Open Questions

- Q1: Does Circular 50/2024 apply to our chat-with-data scope, or is it limited to specific banking IT systems? Recommendation: legal review.
- Q2: SBV breach-notification timeline — 24h or 6h depending on severity? Recommendation: legal confirms; runbook documents both.
- Q3: For audit-log retention, does SBV require longer than 7 years for some categories? Recommendation: legal review.
- Q4: For on-prem deployment, are there SBV-prescribed cloud-vendor restrictions? Recommendation: legal review.

## Implementation Notes

- Mapping follows the same tabular format as P08-T01 / P08-T02.
- Incident-reporting runbook is an addendum to the PDPL runbook; documents the faster SBV path; cross-references.
- On-prem doc is a regulatory framing of the engineering work; technical details live in P10-T03.

## Test Plan

- Test 1: Mapping completeness — every circular's applicable article mapped.
- Test 2: Incident-reporting runbook walked through; SBV timing met.
- Test 3: Audit-trail mapping verified against P02-T09.
- Test 4: Squad briefing comprehension.

## Rollback Plan

- Bad mapping rolled back via PR; quarterly review catches stale items.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Per-circular mapping | `compliance/sbv/MAPPING.md` | Compliance lead | Continuous |
| Incident-reporting runbook | `docs/runbooks/sbv-incident-reporting.md` | Compliance lead | Continuous |
| On-prem regulatory doc | `compliance/sbv/ON_PREM.md` | Compliance lead | Continuous |
| Audit-trail mapping | `compliance/sbv/AUDIT_TRAIL.md` | Compliance lead + eng-sec | Continuous |
| Vendor-management mapping | `compliance/sbv/VENDOR_MANAGEMENT.md` | Compliance lead | Continuous |
| Quarterly review records | `docs/audit/sbv-reviews/{date}.md` | Compliance lead | 7 years |

## Operational Risks

- **SBV publishes new circular mid-cycle.** Mitigation: quarterly review; mapping updated.
- **Misinterpretation of obligation.** Mitigation: legal review; conservative defaults.
- **Incident-reporting timing missed.** Mitigation: runbook + alert; founder + legal escalate immediately.

## Definition of Done

- All six components published.
- Squad briefed.
- Quarterly review scheduled.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Compliance task; no AI training. Documents controls.

### Human Oversight
Compliance lead + legal lead author; founder ratifies; quarterly review.

### Failure Modes
- Article missed: legal or quarterly review catches.
- Timeline missed: P0 incident; founder + legal escalate.

## Sales/CS Summary

CyberSkill's SBV banking-IT regulatory mapping addresses the State Bank of Vietnam's published circulars material to a chat-with-data deployment inside a banking entity — the explicit gate the Innoboost Q&A names twice as "must be deployed per SBV regulations". Per-circular obligation mapping; SBV-specific incident reporting (24-hour timeline); on-prem deployment as a regulatory enabler; audit-trail mapping that ties our 7-year hash-chained log to SBV's record-keeping requirements. The SB5 commercial conversation post-PoC starts with this mapping in hand.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: compliance lead authors with legal-lead review; founder ratifies.
