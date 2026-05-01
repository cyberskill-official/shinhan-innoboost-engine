---
title: "Implement HITL notifications (email + in-app + Shinhan webhook) and SLA tracking"
author: "@cyberskill-eng"
department: engineering
status: draft
priority: p1
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: integration
eu_ai_act_risk_class: not_ai
target_release: "2026-08-21"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Implement the notifications and SLA-tracking infrastructure for HITL: email + in-app notifications to reviewers when a case is assigned; SLA-warning notifications at 20-min and 30-min marks; reviewer-action notifications to the original user when the case is resolved (with a deep-link to the resolution); Shinhan-side webhook for SLA-critical events so customer can integrate into their own ops tooling. SLA tracking is the structural enforcement of the 30-min Form Answer commitment; without timely notifications, reviewers don't act and users don't see resolutions.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"HITL turnaround < 30 minutes from question to approved answer for HITL-required queries" — CyberSkill SB5 form answer
</untrusted_content>

## Problem

A queued case that nobody looks at fails the SLA. A user who never gets notified that their HITL case resolved doesn't trust the system. A customer (Shinhan) who can't integrate HITL events into their own ops tooling has reduced confidence in the workflow.

Specific gaps if we shortcut:

- **Without notifications, reviewers may not see assignments quickly.**
- **Without SLA-warnings, breaches happen silently.**
- **Without user-side notifications on resolution, users don't trust the system.**
- **Without Shinhan webhook, customer ops can't integrate.**

## Proposed Solution

A notifications module in `hitl/notifications/`:

1. **Reviewer notifications.** Case-assigned (in-app + email); SLA-warning at 20 min remaining (in-app + email); SLA-breach at 30 min (in-app + email + auto-escalation per P06-T01).
2. **User notifications.** Case-resolved (in-app + email; deep-link to resolution).
3. **Shinhan-side webhook.** Configurable per-tenant webhook URL; fires on case-routed, SLA-warning, SLA-breach, case-resolved events; HMAC-signed payload; retry on failure.
4. **In-app notification surface** in the UI (chat surface for users, reviewer console for reviewers).
5. **Email infrastructure** via SMTP (SendGrid or equivalent) with bilingual templates.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Define notification event schema.** Documented at `hitl/notifications/SCHEMA.md`. Each event: type, recipient, payload, channels (email / in-app / webhook).
- [ ] **Implement notification dispatcher.** `hitl/notifications/dispatcher.ts`. Subscribes to HITL events; routes per recipient + channel; retry on failure.
- [ ] **Implement reviewer in-app notifications.** Bell icon in admin console (P05-T05); count badge; click opens drawer with recent notifications; mark-as-read flow.
- [ ] **Implement reviewer email.** Bilingual templates: case-assigned ("You have a new case to review. Open the queue."), SLA-warning, SLA-breach.
- [ ] **Implement user in-app notifications.** Bell icon in chat surface (P05-T01); count badge; click opens drawer; deep-link to resolved case.
- [ ] **Implement user email.** Bilingual template: case-resolved ("Your question has been reviewed. Open the answer.").
- [ ] **Implement Shinhan-side webhook.** Per-tenant configurable URL; HMAC signature using a per-tenant secret (managed via P01-T03 Doppler); retry with exponential backoff (max 5 retries over 1 hour); failure alerting.
- [ ] **Implement webhook signature verification doc.** `docs/integrations/webhook-signature.md` for Shinhan-side engineers; sample code in Python + Node.js.
- [ ] **Implement SLA tracking.** Server-side timer per case; computes time-remaining; emits warning + breach events. Visible in reviewer console (P06-T02) and admin dashboard (P05-T05).
- [ ] **Implement notification preferences.** Per-user: enable/disable email; in-app always on. Stored in user profile.
- [ ] **Implement quiet hours.** Per-user: do-not-notify outside business hours unless SLA-critical. Configurable.
- [ ] **Implement audit logging.** Every notification dispatched logged to P02-T09 audit log; webhook responses logged.
- [ ] **Test exhaustively.** > 50 tests covering each notification path; webhook signature verification; quiet-hours; retry logic.

### Acceptance criteria

- All notification paths operational.
- Bilingual templates verified.
- Shinhan webhook configurable and tested with sample HMAC verification.
- In-app notification surface live.
- SLA tracking visible in reviewer console.
- Audit logging on every notification.
- Tests passing.

## Alternatives Considered

- **In-app only (no email).** Rejected: reviewers may not always be in the console; email is the catch-all.
- **Email only (no in-app).** Rejected: in-app is faster; reviewers in the console don't want to context-switch to email.
- **Skip Shinhan webhook.** Rejected: customer-side integration matters for the commercialisation story.
- **Use vendor notifications (e.g., Sendbird).** Rejected: keeping notifications in-house keeps PII boundary clean.
- **Skip quiet hours.** Rejected: reviewers off-hours don't appreciate notification floods.

## Success Metrics

- **Primary**: All notification paths operational within 14 days.
- **Guardrail**: Reviewer notification dispatch < 30 seconds from case assignment.

## Scope

### In scope
- Reviewer + user + webhook notifications.
- SLA tracking.
- Bilingual email templates.
- In-app notification surfaces.
- Notification preferences + quiet hours.
- Audit logging.
- Tests.

### Out of scope
- SMS notifications (deferred unless required).
- Slack / Teams integration (deferred; webhook can be wired by customer).
- Push notifications to mobile app (no mobile app in v1).

## Dependencies

- **Upstream**: P06-T01 (queue + SLA timer), P06-T02 (reviewer console hosts in-app notifications), P05-T01 (chat surface hosts user in-app notifications), P02-T09 (audit log), P01-T03 (Doppler for webhook secrets).
- **People**: engineer authoring; design lead reviewing email templates; founder approving Shinhan webhook spec.

## Open Questions

- Q1: Email provider — SendGrid, AWS SES, Postmark, self-hosted? Recommendation: SendGrid (low setup; widely supported); migrate to AWS SES for production track if cost demands.
- Q2: Webhook retry budget — 5 over 1 hour? Recommendation: yes; document.
- Q3: For Shinhan webhook, do we provide a sandbox endpoint? Recommendation: yes; let customer test integration.
- Q4: For quiet hours, default? Recommendation: 22:00–07:00 ICT for non-SLA-critical events.

## Implementation Notes

- Webhook signature: HMAC-SHA256 of payload with per-tenant secret; header `X-CyberSkill-Signature: sha256={hex}`.
- Email templates use Handlebars or similar; store in `hitl/notifications/templates/{event}.{en,vi}.hbs`.
- SLA timer is server-side; UI polls every 30 seconds; events emit via internal pub/sub.
- Audit-log entry per notification: type, recipient, channel, timestamp, status (delivered / failed / retrying).

## Test Plan

- Test 1: Case assigned → reviewer email + in-app fires.
- Test 2: SLA warning at 20 min → notifications fire.
- Test 3: SLA breach at 30 min → notifications + auto-escalation (P06-T01).
- Test 4: Case resolved → user notifications fire.
- Test 5: Webhook fires; sample receiver verifies HMAC signature.
- Test 6: Webhook retry on 500 response; verify exponential backoff.
- Test 7: Quiet hours respected for non-critical events.
- Test 8: Bilingual templates render correctly.

## Rollback Plan

- Bad notification template rolled back via PR.
- Webhook misconfiguration corrected via tenant config.
- Email provider outage falls back to in-app only.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Notification module | `hitl/notifications/` | Engineer | Continuous |
| Email templates | `hitl/notifications/templates/` | Design lead | Continuous |
| Webhook signature doc | `docs/integrations/webhook-signature.md` | Engineer | Continuous |
| Notification audit log | P02-T09 audit log | Eng-sec | 7 years |
| Webhook response log | Central observability store | Engineer | 1 year |

## Operational Risks

- **Email deliverability issues.** Mitigation: SPF/DKIM/DMARC configured; deliverability monitoring.
- **Webhook URL becomes invalid.** Mitigation: retry + alert; tenant admin notified to update.
- **Notification flood (a runaway state with many SLA breaches).** Mitigation: rate limit; aggregate similar notifications.
- **Quiet hours bypassed accidentally for non-critical events.** Mitigation: server-side check; explicit override flag.

## Definition of Done

- All notification paths working.
- Webhook documentation published.
- Tests passing.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Notifications consume HITL event data; payloads may contain user-question text + reviewer-action context. PII per P02-T07 PDPL rules.

### Human Oversight
Notification preferences let users control their experience. Audit log captures dispatches.

### Failure Modes
- Email provider down: in-app continues; reviewer sees on next login.
- Webhook down: retry; eventually surface as alert.
- Notification mis-routed: audit-log review catches.

## Sales/CS Summary

CyberSkill's HITL notifications keep reviewers and users informed in real time: every case routed for review pings the reviewer; warnings fire as SLA approaches; users learn the moment their question is resolved. Customers (Shinhan) can integrate HITL events into their own ops tooling via signed webhooks — no extra glue required.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: engineer authors implementation; design lead reviews email templates; native-Vietnamese reviewer verifies translations.
