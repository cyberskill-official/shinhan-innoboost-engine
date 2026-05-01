---
title: "Procure penetration test, scope, NDA, vendor selection"
author: "@cyberskill-eng-sec"
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

Procure a third-party penetration test of the demo build before Demo Day (September 2026): scope (engine NL→SQL, HITL queue, admin console, auth, audit log, infrastructure); vendor selection (3 candidates evaluated); NDA executed; engagement timeline; remediation plan for findings; published summary for compliance dossier (P11-T04). Pen-test is the external validation that complements internal threat modelling (P08-T05) — banking-sector reviewers expect it and ask for it specifically.

## Problem

Internal threat modelling is necessary but not sufficient. External red-team validates assumptions, finds blind spots, and provides credible third-party attestation. Without it, "we are secure" rests entirely on internal opinion.

Specific gaps if we shortcut:

- **Without pen-test, internal blind spots remain.**
- **Without third-party report, "we are secure" lacks external attestation.**
- **Without remediation plan, findings just sit.**
- **Without published summary, the report's credibility-value is hidden inside an internal vault.**

The `feedback_p1_scope_preference` memory note biases us richer. For pen-test, "richer" means: scope including LLM + infrastructure + application + cloud config + on-prem readiness; multiple-vendor evaluation; remediation tracker; published summary.

## Proposed Solution

A pen-test procurement + execution workflow:

1. **Scope definition**: documented at `compliance/security/PEN_TEST_SCOPE.md`.
2. **Vendor evaluation**: 3 candidates (e.g., Bishop Fox, Trail of Bits, regional Vietnamese vendor); evaluation criteria (LLM expertise, banking experience, cost, timeline).
3. **NDA execution**: per P00-T04 NDA pack template.
4. **Engagement**: 2–4 week test window; weekly check-ins.
5. **Findings remediation**: each finding tracked in Linear / ClickUp; remediation deadline per severity.
6. **Published summary**: redacted findings + remediation status; included in P11-T04 compliance dossier.

Setup target: 28 days from task assignment (procurement + execution).

### Subtasks

- [ ] **Author scope document.** What's in scope (engine, HITL, admin, auth, audit, infra, on-prem deployment recipe); what's out of scope (third-party services we don't control); any specific test patterns requested (LLM jailbreaks; prompt injection; OWASP Top 10).
- [ ] **Identify vendor candidates.** Three: ideally one LLM-specialist (e.g., Trail of Bits), one banking-experience generalist, one Vietnamese-domiciled (for cultural / language fit).
- [ ] **Evaluate vendors.** Criteria: prior LLM-pen-test experience; banking-sector experience; cost; timeline; methodology (whitebox / blackbox / hybrid); language (English + Vietnamese capability).
- [ ] **Select and engage vendor.** Founder approval; NDA signed (P00-T04 template); engagement contract.
- [ ] **Provide test environment.** Staging environment provisioned for pen-test; isolated from production-rehearsal; reset after engagement.
- [ ] **Provide test data.** Synthetic datasets (P03-T01..T03); no real customer data.
- [ ] **Provide test accounts.** Multiple roles + permissions for vendor's test scenarios.
- [ ] **Run engagement.** Weekly check-ins; vendor presents interim findings; we ask clarifying questions.
- [ ] **Receive final report.** Vendor delivers structured report (executive summary + findings + remediation recommendations).
- [ ] **Triage findings.** Per severity (Critical / High / Medium / Low); assign owners; remediation deadlines (Critical: 7 days; High: 30 days; Medium: 90 days; Low: backlog).
- [ ] **Track remediation.** Linear / ClickUp tickets; status reviewed weekly; founder briefed on Critical / High closure.
- [ ] **Author published summary.** Redacted findings (no exploit details); remediation status; vendor attestation. Suitable for P11-T04 dossier.
- [ ] **Re-test after remediation.** Vendor re-validates fixed Critical / High findings.

### Acceptance criteria

- Vendor selected and engaged.
- NDA executed.
- Pen-test executed; final report received.
- Findings triaged with owners and deadlines.
- Critical / High findings closed before Demo Day.
- Published summary available in dossier.

## Alternatives Considered

- **Skip pen-test; internal threat model only.** Rejected: third-party attestation is the credibility differentiator.
- **Use a friend / informal red-team.** Rejected: structured pen-test report is what banking reviewers expect.
- **Pen-test only the engine, skip infra.** Rejected: integrated infra-application testing finds class-of-bug that isolated tests miss.
- **Defer to post-PoC.** Rejected: reviewers expect pen-test in the demo phase.
- **Use a discount / free pen-test (university clinic).** Rejected: quality variance too high; banking reviewers will ask which vendor.

## Success Metrics

- **Primary**: Pen-test executed and final report received within 28 days of task assignment.
- **Guardrail**: Zero unremediated Critical or High findings by Demo Day.

## Scope

### In scope
- Scope definition + vendor evaluation + NDA + engagement + remediation + published summary.

### Out of scope
- Bug-bounty program (deferred).
- Continuous red-teaming (deferred).
- Internal red-team (handled by eng-sec internally as part of routine work).

## Dependencies

- **Upstream**: P00-T04 (NDA template); P08-T05 (threat model informs scope); P10-T03 (on-prem deployment to test); P10-T02 (cloud staging to test).
- **Downstream**: P11-T04 (compliance dossier); P12-T04 (FAQ doc references pen-test).
- **People**: eng-sec authoring scope; founder approving vendor + budget; legal lead reviewing engagement contract; ops lead managing engagement logistics.

## Open Questions

- Q1: Budget — pen-test cost typically $25K–$75K depending on scope. Approve up-front? Recommendation: founder approves $50K cap.
- Q2: Vietnamese-domiciled vendor — preferable for cultural fit, but LLM-specialist may not be VN-based. Recommendation: pick best LLM-experience; VN domicile is a tiebreaker.
- Q3: Re-test cost — typically included in original engagement. Confirm in vendor contract.
- Q4: Findings disclosure — full to Shinhan or redacted? Recommendation: redacted for the published dossier; full report under NDA if Shinhan requests.

## Implementation Notes

- Vendor candidate research: ask CyberSkill network for referrals; review published sample reports for quality.
- Test environment: provision a fresh staging cluster specifically for pen-test; isolate from production-rehearsal.
- Test data: synthetic only; vendor never sees real customer data.
- Findings tracker: Linear / ClickUp project tag `pen-test-2026`.
- Re-test: schedule with vendor for ~30 days after initial report.

## Test Plan

- Test 1: Vendor evaluation — three vendors compared on documented criteria; selection rationale captured.
- Test 2: NDA executed and stored.
- Test 3: Engagement weekly check-ins held.
- Test 4: Final report received and reviewed.
- Test 5: Findings triaged with owners and deadlines.
- Test 6: Critical / High findings closed before Demo Day.
- Test 7: Published summary suitable for dossier.

## Rollback Plan

- Vendor underperforms: founder can terminate engagement; re-procure with another vendor.
- Findings remediation slips: founder + compliance lead re-prioritise; document in audit log.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Scope document | `compliance/security/PEN_TEST_SCOPE.md` | Eng-sec | Continuous |
| Vendor evaluation | `compliance/security/PEN_TEST_VENDOR_EVAL.md` | Founder | 7 years |
| NDA executed | Legal vault | Legal lead | 7 years |
| Engagement contract | Legal vault | Legal lead | 7 years |
| Final report (full) | Legal vault (restricted) | Founder | 7 years |
| Findings tracker | Linear / ClickUp `pen-test-2026` | Eng-sec | Continuous |
| Published summary | `compliance/security/PEN_TEST_SUMMARY.md` | Compliance lead | Continuous |
| Re-test report | Legal vault | Founder | 7 years |

## Operational Risks

- **Vendor delays.** Mitigation: clear timeline in contract; weekly check-ins.
- **Critical findings discovered late.** Mitigation: 7-day remediation budget; emergency-merge process (P01-T02).
- **Remediation cost overrun.** Mitigation: founder approves remediation budget per finding.
- **Vendor leaks findings publicly.** Mitigation: NDA penalty clauses; founder relationship.

## Definition of Done

- Pen-test complete; report in vault; findings triaged + remediated; published summary available.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Pen-test consumes our application + infra; vendor uses synthetic datasets. No real customer data exposed. Vendor's tools may include AI-driven test generation; subject to their own AI controls.

### Human Oversight
Founder approves vendor; eng-sec scopes engagement; compliance lead reviews report. Findings triage is human-mediated.

### Failure Modes
- Vendor underperforms: re-procure.
- Findings ignored: tracker + weekly review prevent.
- Public disclosure of vulnerabilities: NDA + responsible disclosure.

## Sales/CS Summary

CyberSkill commissions a third-party penetration test by an LLM-experienced vendor before Demo Day. Findings are triaged by severity, remediated within documented SLAs (Critical 7 days, High 30 days), and a redacted summary is included in our compliance dossier. The pen-test is the external validation that complements our internal threat-modelling — banking reviewers see external attestation, not just internal opinion.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: eng-sec authors scope; founder approves vendor + budget; legal lead reviews engagement contract; compliance lead reviews findings.
