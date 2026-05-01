---
title: "Build reviewer console UI (inbox, actions, diffs, side panel)"
author: "@cyberskill-design-lead"
department: design
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: user_facing
eu_ai_act_risk_class: limited
target_release: "2026-08-14"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Build the HITL reviewer console — the primary daily-driver surface for the Bank's reviewers (the SB5 wedge): an inbox of pending review cases sorted by priority and SLA-criticality; per-case detail showing question + generated answer + generated SQL + confidence reasoning + citations + sensitivity verdict + suggested-edit prompt; reviewer actions (approve as-is / edit-and-approve / reject with reason / escalate / refuse and notify user); inline diff when the reviewer edits the answer or SQL; side panel showing similar prior questions and how they were resolved (institutional memory); SLA timer prominently visible; reviewer's own performance metrics (volume, SLA adherence, override rate) on a personal dashboard. The console is the surface that turns the SB5 brief's HITL requirement from a checkbox into a competitive differentiator — every interaction is auditable, comparable to prior work, and bounded by SLA.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"HITL reviewer queue with approval flow and per-decision audit log — exact pattern requested in the SB5 brief" — CyberSkill SB5 form answer
"audit log adopted by Risk team as primary review surface" — CyberSkill Engagement B reference (via SB5 form answer)
"HITL turnaround < 30 minutes from question to approved answer" — CyberSkill SB5 form answer
</untrusted_content>

## Problem

The SB5 brief explicitly required HITL. The Form Answer commits to the exact pattern (queue + approval + audit). The reviewer console is what makes this real for an actual human reviewer — without polished UX, reviewers are slow, miss SLAs, make inconsistent decisions, and leave audit gaps. The console is the surface that ensures the HITL claim survives reviewer-week scrutiny.

Specific gaps if we shortcut:

- **Without an inbox, reviewers don't know what's waiting.**
- **Without per-case detail in one view, reviewers context-switch across multiple tools — slow + error-prone.**
- **Without inline diff on edit, reviewers can't see exactly what they changed before submitting.**
- **Without similar-prior-cases, reviewers reinvent past decisions.**
- **Without SLA timer, reviewers don't pace correctly.**
- **Without personal performance metrics, reviewers can't self-monitor.**
- **Without prominent reject-reason capture, P04-T05 reviewer-feedback loop is starved of input.**

The `feedback_p1_scope_preference` memory note biases us richer. For the reviewer console, "richer" means: inbox + detail + actions + inline diff + side panel + SLA timer + personal dashboard + bulk actions for super-admin + keyboard shortcuts. Each affordance is critical for the reviewer's daily-driver experience.

## Proposed Solution

A reviewer-only sub-application within the admin console (P05-T05) at `/admin/hitl/`, gated by `reviewer` role, exposing: inbox (default landing for reviewers); per-case detail page; reviewer-actions toolbar; inline diff view; similar-prior-cases side panel; SLA timer prominent; personal dashboard at `/admin/hitl/me`. Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Implement inbox view.** List of pending cases: priority badge, SLA timer, requester, BU, sensitivity badge, brief excerpt of the question, action buttons. Sortable by priority, age, sensitivity. Filterable by BU, SLA status (in-SLA / warning / breached).
- [ ] **Implement per-case detail page.** Top: question (with requester, time, BU, sensitivity); engine's proposed answer (with citations + confidence + breakdown); generated SQL (syntax-highlighted); suggested-edit prompt from the engine ("Reviewer guidance: this question routed because confidence < 65%; the metric used is X; consider...").
- [ ] **Implement reviewer-actions toolbar.** Five actions:
  - **Approve as-is**: case closed; user receives engine's original answer; audit-log entry.
  - **Edit-and-approve**: reviewer edits the narrative or SQL inline; on submit, diff captured; user receives reviewer-edited answer; both versions in audit log.
  - **Reject**: reviewer provides a reason from a structured list (insufficient_data / wrong_metric / sensitive_information / out_of_scope / other-with-text); user receives a refusal explanation; audit-log entry.
  - **Escalate**: case routed to a more senior reviewer or admin; reason required.
  - **Refuse and notify user**: case closed without answer; user receives a refusal explanation; audit-log entry.
- [ ] **Implement inline diff.** When reviewer edits the answer text or SQL, the diff view shows side-by-side or unified diff before submit; reviewer confirms.
- [ ] **Implement similar-prior-cases side panel.** Semantic search over past resolved cases for similar questions; shows up to 5 with their resolutions (approved-as-is / edit-and-approve with edit / rejected with reason); helps reviewer learn from prior decisions.
- [ ] **Implement SLA timer.** Prominent visual timer in the corner; counts down from 30 minutes; warning at 10 min remaining; breach state when 0.
- [ ] **Implement personal dashboard.** `/admin/hitl/me`: cases handled today / week / month; SLA adherence rate; reject-rate; edit-rate; trend chart over time.
- [ ] **Implement bulk actions for super-admin.** Multi-select cases; bulk-approve (rare; for backlog cleanup with explicit super-admin justification); bulk-reassign.
- [ ] **Implement keyboard shortcuts.** `j/k` next/previous case; `a` approve; `e` edit; `r` reject; `?` show shortcuts.
- [ ] **Implement audit logging.** Every reviewer action audit-logged via P02-T09: case ID, action, before/after if edit, reason, reviewer, timestamp.
- [ ] **Implement reviewer-feedback capture.** P04-T05 feedback loop consumes reject reasons and edit diffs from this console.
- [ ] **Verify visual + Vietnamese rendering.** Reviewer interface fully bilingual.
- [ ] **E2E test.** Full reviewer flow: inbox → case detail → action → audit log; verified.

### Acceptance criteria

- Inbox + detail + actions + inline diff + side panel + SLA timer + personal dashboard + bulk + shortcuts all operational.
- Audit logging on every action.
- Reviewer-feedback capture wired to P04-T05.
- Vietnamese rendering verified.
- E2E test pass.
- Reviewer-load test: simulate 100 cases through 3 reviewers; verify SLA adherence > 95%.

## Alternatives Considered

- **Skip per-case side panel; reviewer searches manually.** Rejected: side panel is the institutional-memory feature; without it, reviewers reinvent decisions.
- **Combine reviewer console with admin console (no separation).** Rejected for v1: reviewers need a focused inbox-first surface; admin console is browse-first.
- **Skip SLA timer; reviewers self-pace.** Rejected: visible timer is the structural enforcement of the 30-min SLA.
- **Skip keyboard shortcuts.** Rejected: power-user reviewers handle 30+ cases/day; shortcuts are essential.
- **Skip bulk actions.** Rejected: super-admin needs them for backlog cleanup; gated by audit-logged justification.

## Success Metrics

- **Primary**: Reviewer console deployed within 14 days; SLA adherence ≥ 95% in load test.
- **Guardrail**: Median time-on-case ≤ 8 minutes (allows 4 cases per 30 min per reviewer).

## Scope

### In scope
- Inbox + detail + actions + diff + side panel + timer + personal dashboard + bulk + shortcuts.
- Audit logging.
- Reviewer-feedback capture wiring.
- Bilingual rendering.
- E2E + load tests.

### Out of scope
- Triage rules engine (P06-T01).
- Calibration reports (P06-T03).
- Reviewer-feedback loop (P04-T05; P06-T04).
- Notifications (P06-T05).
- Mobile reviewer interface (deferred; reviewers use desktop).

## Dependencies

- **Upstream**: P00-T03, P05-T05 (admin console base), P06-T01 (queue + routing), P02-T09 (audit), P02-T04 (citations), P02-T05 (confidence), P02-T07 (sensitivity).
- **Downstream**: P04-T05 (consumes reject reasons), P06-T03 (calibration), P06-T04 (feedback loop).
- **People**: design lead authoring; engineer co-authoring; founder approving reviewer-action UX.
- **Memory references**: `feedback_enterprise_voice` (reviewer-action language), `feedback_p1_scope_preference`.

## Open Questions

- Q1: Reject reasons — fixed list or free-text? Recommendation: fixed list + "other with text"; structured list helps the feedback loop (P04-T05) cluster patterns.
- Q2: Inline diff format — side-by-side or unified? Recommendation: side-by-side default; user can toggle.
- Q3: Personal dashboard — only own metrics or compare to peer median? Recommendation: only own; peer comparison risks gaming.
- Q4: Bulk approve cap? Recommendation: 50 cases max per bulk action; super-admin only; mandatory justification.
- Q5: Reviewer pool config — how do reviewers get assigned to BUs? Recommendation: per Keycloak group membership.

## Implementation Notes

- Reviewer console is part of the admin Next.js app; routed at `/admin/hitl/*`.
- Inbox uses Server-Sent Events for live updates (case added / SLA timer ticks); reviewer doesn't need to refresh.
- Side panel similarity search uses pgvector over historical case embeddings; threshold 0.85.
- For inline diff, use a battle-tested library (`diff` npm package or similar).
- For SLA timer, server-side as the source of truth; UI polls or listens via SSE.
- Bulk-approve is gated server-side; client-side UI only allows it for super-admin role.

## Test Plan

- Test 1: E2E full reviewer flow.
- Test 2: SLA timer accuracy under load.
- Test 3: Inline diff renders correctly for narrative + SQL edits.
- Test 4: Similar-prior-cases returns relevant cases for sample questions.
- Test 5: Bulk action gated by role; non-super-admin cannot trigger.
- Test 6: Audit log entry for every action; verified by sample.
- Test 7: Vietnamese rendering throughout.
- Test 8: Load test — 100 cases through 3 reviewers; SLA adherence ≥ 95%.

## Rollback Plan

- Bad reviewer console release rolled back via Helm rollback of admin UI.
- Bad action handler rolled back via PR revert.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Reviewer console source | `ui/admin/hitl/` | Design lead | Continuous |
| Reviewer action audit | P02-T09 audit log | Eng-sec | 7 years |
| Case-resolution history | Postgres `hitl_cases` table | Eng-sec | 7 years |
| Personal-dashboard metrics | Central observability store | Engine tech lead | Continuous |

## Operational Risks

- **Reviewer overload.** Mitigation: priority queue + auto-escalation (P06-T01); personal dashboard shows current load.
- **SLA breaches due to reviewer absence.** Mitigation: auto-escalation; on-call schedule.
- **Bulk-approve misuse.** Mitigation: server-side enforcement of justification + audit; weekly review.
- **Reviewer makes wrong decision under pressure.** Mitigation: side panel surfaces prior decisions; calibration reports (P06-T03) catch outliers.

## Definition of Done

- All affordances operational; audit logging; reviewer-feedback capture wired.
- Tests passing; load test passing.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
The console displays engine-generated content for human review. The similar-prior-cases panel queries past cases via vector similarity; same retrieval model as P02-T02 retriever.

### Human Oversight
The console *is* the human-oversight surface. Every action is the human's decision; the system surfaces context but doesn't make the decision.

### Failure Modes
- Engine output incorrect: reviewer catches; reject or edit-and-approve.
- Side panel returns irrelevant prior cases: reviewer ignores; calibration reports may surface.
- SLA timer wrong: server-side source of truth; UI re-polls.
- Reviewer accidental approve: confirmation step on edit-and-approve; reject and refuse-and-notify also confirm.

## Sales/CS Summary

The reviewer console is where the SB5 brief's "human-in-the-loop reviewer queue with approval flow" becomes real. A reviewer logs in, sees their inbox sorted by priority and SLA, opens a case to see the question + AI's proposed answer + the SQL the AI generated + similar prior decisions + a 30-minute timer. They approve, edit-and-approve, reject (with structured reason), escalate, or refuse — every action audit-logged, every edit diff-captured. Their personal dashboard shows their handling rate and SLA adherence. Bank reviewers should recognise this as familiar workflow software done right.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: design lead authors UX; engineer integrates backend; founder approves reviewer-action language; native-Vietnamese reviewer verifies translations.
