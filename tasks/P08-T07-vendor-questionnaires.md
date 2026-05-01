---
title: "Pre-fill SIG Lite + CAIQ + Shinhan-specific vendor questionnaires"
author: "@cyberskill-compliance-lead"
department: operations
status: draft
priority: p1
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

Pre-fill the standardised vendor security questionnaires (SIG Lite — Shared Assessments Group; CAIQ — Cloud Security Alliance Consensus Assessment Initiative Questionnaire; plus Shinhan-specific vendor questionnaire if available) with our actual answers, evidence pointers, and gap statements. When Shinhan procurement asks (and they will), we hand back the filled questionnaires within hours, not weeks. Pre-filling is leverage; it skips the procurement-cycle friction that often kills commercial conversations before they start.

## Problem

Banking-sector procurement cycles include extensive vendor questionnaires. The SIG Lite alone has ~140 questions; CAIQ has ~260. A vendor who fills these in a week is suspiciously fast (suggesting boilerplate); a vendor who takes two months loses the deal. Pre-filled questionnaires hit the right tempo: filled-in within 48 hours of request, with audit-pointer evidence.

Specific gaps if we shortcut:

- **Without pre-filled questionnaires, every Shinhan procurement step takes weeks.**
- **Without audit-pointer evidence, our answers are unsubstantiated assertions.**
- **Without gap statements, missing answers look like cover-up.**
- **Without Shinhan-specific version, we are missing customer-tailored questions.**

The `feedback_p1_scope_preference` memory note biases us richer. For questionnaires, "richer" means: SIG Lite + CAIQ + Shinhan-specific + per-question evidence pointer + gap statement + quarterly refresh.

## Proposed Solution

A questionnaire library at `compliance/questionnaires/`:

1. **SIG Lite filled** at `compliance/questionnaires/SIG_LITE.md`. All ~140 questions answered with evidence pointers + gaps.
2. **CAIQ filled** at `compliance/questionnaires/CAIQ.md`. Same shape.
3. **Shinhan-specific filled** at `compliance/questionnaires/SHINHAN_VENDOR.md`. Pre-filled if questionnaire is publicly known; placeholder otherwise (filled when Shinhan provides).
4. **Evidence library** at `compliance/questionnaires/EVIDENCE.md`. Maps answers to specific compliance dossier artefacts (P11-T04).
5. **Quarterly refresh** to keep answers current.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Procure SIG Lite template.** Available from Shared Assessments Group; CyberSkill has access via legal library or purchase.
- [ ] **Procure CAIQ template.** Available from Cloud Security Alliance.
- [ ] **Identify Shinhan-specific questionnaire.** Public sources or via SFL-V relationship; if not available pre-kickoff, pre-fill the common patterns.
- [ ] **Fill SIG Lite questions.** Each question: answer + evidence pointer to compliance dossier (P11-T04 artefacts) + gap statement if applicable.
- [ ] **Fill CAIQ questions.** Same shape.
- [ ] **Fill Shinhan-specific (if available).**
- [ ] **Build evidence library cross-reference.** Each answer maps to specific dossier artefacts (e.g., "Encryption at rest — see compliance dossier section 3.2 + P01-T08 artefacts").
- [ ] **Author quarterly refresh procedure.** PM-owned; aligned with other compliance review cadence.
- [ ] **Cross-reference with P11-T04 dossier.**
- [ ] **Identify gaps.** Questions where our answer is "we plan to" rather than "we do"; gap statements with target dates.

### Acceptance criteria

- All three questionnaires filled in.
- Evidence library cross-references in place.
- Gap statements with target dates documented.
- Quarterly refresh scheduled.

## Alternatives Considered

- **Skip pre-filling; fill on customer request.** Rejected: slows commercial conversations.
- **Generic answers without evidence pointers.** Rejected: reviewers ask "show me"; pointer is the answer.
- **Skip CAIQ; SIG Lite alone is enough.** Rejected: cloud-aware customers expect CAIQ.
- **Hire a consultant to fill.** Rejected: in-house is faster + more accurate (we know our system best).

## Success Metrics

- **Primary**: All three questionnaires filled within 14 days.
- **Guardrail**: Quarterly refresh on schedule; gap-statement targets met.

## Scope

### In scope
- SIG Lite + CAIQ + Shinhan-specific (or placeholder).
- Evidence library cross-reference.
- Quarterly refresh.

### Out of scope
- Other industry-specific questionnaires (PCI-DSS SAQ — out of scope).
- Custom customer questionnaires beyond Shinhan (handled per-customer).

## Dependencies

- **Upstream**: P11-T04 (compliance dossier — evidence library references).
- **People**: compliance lead authoring; legal lead reviewing; founder ratifying gap timeline.

## Open Questions

- Q1: SIG Lite license — confirm we have authorised access.
- Q2: Shinhan-specific questionnaire — public or only post-kickoff? Recommendation: ask SFL-V; placeholder if not available.
- Q3: Quarterly refresh — fully re-fill or delta-only? Recommendation: delta-only; full refresh annually.

## Implementation Notes

- Filled questionnaires in Markdown; render to PDF for distribution.
- Evidence pointers are concrete (file paths, audit-log queries, PR links); not generic.
- Gap statements include "we don't currently do X; we plan to by date Y; mitigation in the meantime is Z".

## Test Plan

- Test 1: Coverage — every SIG Lite + CAIQ question has an answer.
- Test 2: Evidence pointer resolution — sample 20 pointers; all resolve to real artefacts.
- Test 3: Gap-statement accuracy — all gaps have target dates.
- Test 4: Quarterly refresh — PM owner identified; calendar entry.

## Rollback Plan

- Questionnaire revisions are versioned; revert via PR.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| SIG Lite filled | `compliance/questionnaires/SIG_LITE.md` | Compliance lead | Continuous |
| CAIQ filled | `compliance/questionnaires/CAIQ.md` | Compliance lead | Continuous |
| Shinhan-specific filled | `compliance/questionnaires/SHINHAN_VENDOR.md` | Compliance lead | Continuous |
| Evidence library | `compliance/questionnaires/EVIDENCE.md` | Compliance lead | Continuous |
| Quarterly refresh records | `docs/audit/questionnaire-refresh/{date}.md` | PM | 7 years |

## Operational Risks

- **Questionnaire updates by issuing organisation.** Mitigation: subscribe to updates; quarterly refresh.
- **Gap statement target slip.** Mitigation: tracked; founder briefed.
- **Evidence pointer breaks.** Mitigation: PR-time check; pre-fill validation.

## Definition of Done

- All three questionnaires filled; evidence library in place; quarterly refresh scheduled.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR; assists fill-in drafting).
- **Scope**: Claude drafted all sections of this FR.
- **Human review**: compliance lead authors questionnaires with legal-lead review; founder ratifies gap timelines.
