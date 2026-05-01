---
title: "Author past-incident transparency log"
author: "@cyberskill-eng-sec"
department: engineering
status: draft
priority: p1
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

Author a past-incident transparency log: anonymised summary of past CyberSkill incidents (eval-harness regressions, security findings remediated, customer-impacting issues — subject to P00-T01 sponsor consent for the engagements they came from); each entry includes detection, response, lessons learned, and remediation status. The log demonstrates that we run incidents like a system — a banking-sector reviewer recognises this as the candour signal that distinguishes mature operations from "we never have incidents". Trust comes from candour, not denial.

## Problem

Every operating system has incidents. Pretending otherwise is a credibility gap. Past-incident transparency log is the structural disclosure — we acknowledge, learn, remediate. Without it, we look either inexperienced (no incidents to share) or evasive (we have them but won't say).

Specific gaps if we shortcut:

- **Without transparency log, "mature operations" is unsubstantiated.**
- **Without lessons learned, the log is just a complaint list.**
- **Without remediation status, lessons aren't applied.**
- **Without anonymisation per consent, customer reference is at risk.**

The `feedback_p1_scope_preference` memory note biases us richer. For the log, "richer" means: 5–10 anonymised entries + structured per-entry + lessons-learned + remediation-status + cross-link to threat model + quarterly addition cadence.

## Proposed Solution

A transparency log at `compliance/security/INCIDENT_LOG.md`:

1. **5–10 anonymised entries** from past CyberSkill operational history (subject to P00-T01 sponsor consent where they touch a customer's engagement).
2. **Per-entry structure**: detection (how we noticed); impact (severity + scope); response (what we did); lessons (what we learned); remediation (what we changed). 1–2 paragraphs each.
3. **Cross-link** to threat model (P08-T05) — incidents map to threat IDs.
4. **Quarterly addition cadence** as new incidents resolve.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Identify past incidents.** From CyberSkill ops history; eval-harness regressions; security findings remediated; customer-impacting issues. Subject to P00-T01 consent boundaries.
- [ ] **Author 5–10 entries.** Anonymised; structured per-entry; lesson-focused.
- [ ] **Cross-link to threat model.** Each entry maps to one or more threat IDs from P08-T05.
- [ ] **Schedule quarterly addition cadence.** PM owns.
- [ ] **Founder spot-check.** Approves anonymisation + cross-references.
- [ ] **Surface in dossier (P11-T04).**

### Acceptance criteria

- 5–10 entries authored.
- Each entry structured + cross-linked.
- Founder spot-check approved.
- Quarterly cadence scheduled.
- Surfaced in dossier.

## Alternatives Considered

- **Skip the log; project zero-incident image.** Rejected: zero-incident image is unbelievable; mature ops show their work.
- **Public blog posts instead.** Rejected: too public; controlled internal log is better for the demo phase.
- **Skip anonymisation; rely on internal trust.** Rejected: violates P00-T01.

## Success Metrics

- **Primary**: 5–10 entries authored within 14 days.
- **Guardrail**: Zero anonymisation violations.

## Scope

### In scope
- 5–10 anonymised entries with structured fields.
- Cross-links to threat model.
- Quarterly cadence.
- Dossier integration.

### Out of scope
- Public blog posts (separate workstream).
- Real-time incident streaming (out of scope; this is retrospective).

## Dependencies

- **Upstream**: P00-T01 (sponsor consent for customer-touching incidents); P08-T05 (threat model for cross-linking).
- **Downstream**: P11-T04 (dossier).
- **People**: eng-sec authoring; sales lead reviewing customer-touching entries; founder ratifying.

## Open Questions

- Q1: Granularity per entry — 1 paragraph or 1 page? Recommendation: 1 paragraph each; lesson-focused.
- Q2: For unresolved incidents, include? Recommendation: only resolved (remediation status = closed); open items live in tracker.

## Implementation Notes

- Anonymisation per P00-T01 rider scope.
- Cross-link uses threat ID from P08-T05.
- Format consistent across entries.

## Test Plan

- Test 1: Anonymisation review by sales lead.
- Test 2: Cross-references resolve to threat IDs.
- Test 3: Founder spot-check.

## Rollback Plan

- Bad entry rolled back via PR.
- Sponsor revokes consent → immediate redaction.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Incident log | `compliance/security/INCIDENT_LOG.md` | Eng-sec | Continuous |
| Quarterly addition records | `docs/audit/incident-log-additions/{date}.md` | PM | 7 years |

## Operational Risks

- **Anonymisation insufficient.** Mitigation: sales lead review.
- **Customer perceives entry as breach of trust.** Mitigation: founder spot-check; sponsor consent.

## Definition of Done

- 5–10 entries; founder spot-check; cross-references; cadence.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections; entries authored by eng-sec with sales-lead review.
- **Human review**: eng-sec authors; sales lead reviews customer-touching entries; founder ratifies.
