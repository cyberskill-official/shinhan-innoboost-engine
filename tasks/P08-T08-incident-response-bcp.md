---
title: "Author incident-response and business-continuity runbooks"
author: "@cyberskill-eng-sec"
department: operations
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

Author the unified incident-response (IR) and business-continuity (BC) runbooks: detection (alert sources from P09 observability); containment (per-incident-class procedures); investigation (forensics; audit-log mining); recovery (rollback / restore from P01-T09 backups); communication (internal + customer + regulator); post-incident review (blameless postmortem template). Plus the BC plan: critical functions; recovery time / point objectives (P01-T09); failover procedures; staff continuity (on-call schedules; succession). Tested in dry-runs (table-top exercises) quarterly. The runbooks are the structural enforcement of "we know what to do when things break" — without them, response is improvised.

## Problem

Incidents will happen. Banking-sector reviewers know this; what they want is evidence that we know how to handle them. Without runbooks, response is improvised; with them, response is deterministic and audit-ready.

Specific gaps if we shortcut:

- **Without IR runbook, response is improvised under pressure.**
- **Without BC plan, business continuity claims are unsubstantiated.**
- **Without communication template, customer + regulator notification slips.**
- **Without dry-runs, the runbooks are theoretical.**

The `feedback_p1_scope_preference` memory note biases us richer. For IR + BC, "richer" means: per-incident-class playbooks + structured comms templates + post-incident review template + table-top exercises + on-call rotation + succession planning + integration with regulatory reporting (PDPL 72h, SBV 24h).

## Proposed Solution

A unified IR + BC runbook library at `docs/runbooks/incident/`:

1. **IR master runbook** at `docs/runbooks/incident/MASTER.md`: detection → containment → investigation → recovery → communication → post-incident review.
2. **Per-incident-class playbooks**: data breach; service outage; LLM failure; key compromise; insider threat; ransomware; DoS; supply-chain compromise.
3. **Communication templates**: internal Slack notification; customer notification; PDPL notification (72h); SBV notification (24h); SBV-Bank entity notification.
4. **Post-incident review template**: blameless postmortem; timeline; impact; root cause; remediation; lessons.
5. **BC plan** at `docs/runbooks/business-continuity/MASTER.md`: critical functions; RTO/RPO (cross-references P01-T09); failover; staff continuity.
6. **On-call rotation** documented; PagerDuty (or equivalent) configured.
7. **Quarterly table-top exercises**.

Setup target: 21 days from task assignment.

### Subtasks

- [ ] **Author IR master runbook.** Sections: severity classification (P1: customer-data breach; P2: service down; P3: degraded; P4: minor); detection sources; containment per severity; investigation steps; recovery procedure; communication tree; post-incident review.
- [ ] **Author per-incident-class playbooks.** 8 playbooks:
  - **Data breach**: PDPL 72h timeline; SBV 24h timeline; affected-subject notification.
  - **Service outage**: failover; status-page update; customer comms.
  - **LLM failure**: route to fallback (P02-T02 routing matrix); user-facing degraded state.
  - **Key compromise**: P01-T08 key-compromise runbook reference.
  - **Insider threat**: account suspension; audit-log forensics.
  - **Ransomware**: isolation; restore from PITR (P01-T09); regulator notification.
  - **DoS**: rate-limiting tightening; CDN scale-up.
  - **Supply-chain compromise**: SBOM (P01-T05) review; image rollback.
- [ ] **Author communication templates.** Internal + customer + PDPL + SBV + SBV-Bank-specific.
- [ ] **Author post-incident review template.** Blameless format; sections: timeline; impact; root cause; what worked; what didn't; remediation actions with owners; lessons.
- [ ] **Author BC master plan.** Critical functions; RTO/RPO; failover procedures; staff continuity (on-call schedule + backup); succession planning (founder unavailability scenarios).
- [ ] **Configure on-call rotation.** PagerDuty (or equivalent); per-tenant escalation; weekly rotation; backup on-call.
- [ ] **Schedule quarterly table-top exercises.** Different scenario each quarter; documented; lessons fed back into runbooks.
- [ ] **Brief the squad.** 60-min IR + BC primer; walk through master runbook.
- [ ] **Cross-reference with P11-T04 compliance dossier.**

### Acceptance criteria

- IR master + 8 per-incident-class playbooks + communication templates + post-incident-review template + BC master + on-call rotation + quarterly table-top schedule all in place.
- Squad briefed.
- First table-top exercise scheduled.

## Alternatives Considered

- **Single combined runbook (no per-class playbooks).** Rejected: per-class is far more useful under pressure.
- **Skip table-top exercises.** Rejected: untested runbooks fail on first incident.
- **Skip BC plan; assume cloud reliability.** Rejected: BC is non-negotiable for banking-sector commercial-track.
- **Skip succession planning.** Rejected: founder unavailability is a real risk.
- **Use templated commercial runbook library (e.g., Atlassian).** Rejected: tailored runbooks are higher quality.

## Success Metrics

- **Primary**: All runbook components within 21 days.
- **Guardrail**: First quarterly table-top exercise on schedule; lessons fed into runbook updates.

## Scope

### In scope
- IR master + 8 per-class playbooks + communication templates + PIR template.
- BC master + on-call rotation.
- Quarterly table-top exercises.
- Squad briefing.

### Out of scope
- Disaster recovery infrastructure (P01-T09).
- Specific regulatory notifications beyond PDPL + SBV (handled per regulator if expanded scope).

## Dependencies

- **Upstream**: P01-T09 (backups + DR); P01-T08 (key compromise); P02-T09 (audit log for forensics); P09 (observability for detection); P08-T01..T03 (regulatory timelines).
- **Downstream**: P11-T04 (compliance dossier); P09-T04 (alerting consumes runbook for response).
- **People**: eng-sec authoring; ops lead reviewing on-call; compliance lead reviewing communication; founder ratifying succession plan.

## Open Questions

- Q1: On-call provider — PagerDuty or open-source (Grafana OnCall)? Recommendation: PagerDuty for the demo phase (rich integration); migrate if cost demands.
- Q2: Succession plan — who is the backup if founder is unavailable? Recommendation: founder identifies; document.
- Q3: Table-top exercise cadence — quarterly is the floor; should some scenarios be monthly? Recommendation: quarterly for full exercise; monthly for spot drills (e.g., key-rotation drill).

## Implementation Notes

- IR master + per-class playbooks live in `docs/runbooks/incident/`; cross-linked.
- Communication templates use mail-merge-style variables; quick to fill.
- Post-incident-review template is short; blameless rule explicit.
- BC plan revisited annually as critical functions evolve.
- On-call schedule visible in admin console (P05-T05).

## Test Plan

- Test 1: Coverage — all 8 per-class playbooks complete with all sections.
- Test 2: Communication templates complete with placeholders.
- Test 3: Table-top exercise (e.g., simulated PDPL data breach); time the response; identify gaps.
- Test 4: On-call rotation operational; PagerDuty pages reach the right person.
- Test 5: Squad briefing comprehension verified.

## Rollback Plan

- Bad runbook revision rolled back via PR.
- Bad table-top scenario adjusted.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| IR master | `docs/runbooks/incident/MASTER.md` | Eng-sec | Continuous |
| Per-class playbooks | `docs/runbooks/incident/{class}.md` | Eng-sec | Continuous |
| Communication templates | `docs/runbooks/incident/comms-templates/` | Compliance lead | Continuous |
| Post-incident-review template | `docs/runbooks/incident/PIR_TEMPLATE.md` | Eng-sec | Continuous |
| BC master | `docs/runbooks/business-continuity/MASTER.md` | Ops lead | Continuous |
| On-call rotation | PagerDuty configuration | Ops lead | Continuous |
| Table-top exercise records | `docs/audit/table-tops/{date}.md` | Eng-sec | 7 years |
| Squad briefing record | Project workspace | PM | Until program end |

## Operational Risks

- **Real incident before first table-top.** Mitigation: master runbook usable from day 1; lessons captured.
- **On-call burnout.** Mitigation: weekly rotation; backup on-call; succession planning.
- **Regulatory timeline slipped during incident.** Mitigation: communication templates ready; alerts fire on timeline triggers.

## Definition of Done

- All runbook components published.
- On-call rotation live.
- First table-top scheduled.
- Squad briefed.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Runbook authoring; no AI training. Communication templates use mail-merge variables that may include user-affected counts during real incidents (PII).

### Human Oversight
Eng-sec + ops lead + compliance lead author; founder ratifies succession plan; quarterly review.

### Failure Modes
- Incident occurs and runbook gap discovered: post-incident review captures; remediation.
- On-call paged but unresponsive: backup on-call paged; founder fallback.
- Communication template wrong language for affected audience: bilingual templates; legal review.

## Sales/CS Summary

CyberSkill's incident-response and business-continuity runbooks are the structural answer to "what happens when something breaks?" Eight per-incident-class playbooks (data breach, service outage, LLM failure, key compromise, insider threat, ransomware, DoS, supply-chain), pre-authored communication templates aligned to PDPL (72h) and SBV (24h) regulatory timelines, blameless post-incident review template, business-continuity plan with documented RTO/RPO, on-call rotation, and quarterly table-top exercises. Banking-sector reviewers see this as table stakes; we have it.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR; assists runbook drafting).
- **Scope**: Claude drafted all sections of this FR.
- **Human review**: eng-sec authors IR; ops lead authors BC; compliance lead reviews communication; founder ratifies succession.
