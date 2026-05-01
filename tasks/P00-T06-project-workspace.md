---
title: "Stand up project workspace (Slack channel, tracker, drive)"
author: "@cyberskill-pm"
department: product
status: in_progress
priority: p1
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-05-05"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Stand up the dedicated Innoboost project workspace — a Slack channel `#shinhan-innoboost-2026`, a Linear (or ClickUp) project that mirrors the INDEX.md task structure with all 80 tasks imported, and an extended folder structure under `0.HQ/Shinhan Innoboost 2026/` for rehearsals, references, compliance, decks, artefacts, decisions, and legal — that becomes the single source of truth for the demo build. Stand it up early with conventions ratified up front; this prevents the inevitable end-of-project archaeology of "where did we decide that?" and gives the squad a low-friction way to surface decisions, demo statuses, and reference material at the latency Phase 12 (rehearsal) and the interview week will demand. Includes a workspace-conventions doc, a weekly status digest cadence, and access controls for the legal sub-folder.

## Problem

Without a dedicated workspace, work fragments across personal channels, ad-hoc DMs, scattered Notion pages, engineers' laptops, and the founder's email. By week 4 of any moderately-sized engagement this fragmentation costs hours per week in look-up tax and produces the "I thought we agreed X but somebody implemented Y" pattern. The demo-build-plan.md explicitly warns against this with the phrase "scope creep starts where this section is vague."

For Innoboost specifically, three latency demands compound the problem:

- **Interview-week latency.** During 20–29 May, if Shinhan reviewers ask a follow-up question, we may need to surface the answer within an hour. That requires a single, browseable, navigable workspace.
- **Phase 12 rehearsal latency.** Phase 12 includes three timed dry-runs (internal, friendly external, time-pressured); each requires a stable status board so reviewers know what's done, what's blocked, what's at risk.
- **Post-PoC commercialisation latency (if shortlisted).** Shinhan's commercialisation playbook (P13-T06) requires an audit trail showing the path from idea to delivery. Auditable means traceable in tools that retain history — not Slack messages that scroll into oblivion or shared docs that get edited without revision.

There are also compliance dimensions:

- **ISO 27001 control A.5.4 (management responsibilities)** requires evidence of project governance with defined roles, responsibilities, and accountability. A workspace with stable conventions, a tracker with assigned tasks, and a weekly status cadence is the cheapest possible feed of this evidence.
- **SOC 2 CC1.4 (commitments to internal personnel)** requires evidence that the squad knows what's expected of them. The workspace-conventions doc + weekly status cadence satisfies this.

The `shinhanos_overview` memory note suggests CyberSkill is using Linear (or ClickUp) and Slack already; we're not introducing new tools, just standing up project-specific instances with conventions tuned to the Innoboost context.

There is also a behavioural-design point. A blank workspace has no gravity — squad members default to their existing habits (DM their pair, post to a personal channel). A workspace pre-populated with the INDEX, with pinned messages explaining conventions, and with a Friday status cadence has gravity from day 1. The opportunity cost of not setting it up early is dramatic: each squad member who spends the first week working without the workspace conventions builds habits we then have to break.

The `feedback_enterprise_voice` memory note also matters here: external materials must use the enterprise voice. Some workspace artefacts are *public-by-accident* — a status digest accidentally CC'd to a Shinhan reviewer, a Slack screenshot pasted in a pitch deck. The workspace-conventions doc must include rules about external-facing voice in workspace content.

## Proposed Solution

A four-part workspace consisting of: (1) Slack channel `#shinhan-innoboost-2026` with sub-thread conventions; (2) Linear (or ClickUp — choose whichever is the team's standard) project named "Shinhan Innoboost 2026" with all 80 INDEX tasks imported, dependency edges configured, and four pre-built views (by phase, by owner type, by priority, by dependency-readiness); (3) extended folder structure inside `0.HQ/Shinhan Innoboost 2026/` for rehearsals, references, compliance, decks, artefacts, decisions, legal; (4) a workspace-conventions doc that codifies usage rules, a weekly status digest cadence, and access controls for the legal sub-folder. Stand-up target: 2 days from task assignment.

### Subtasks

- [ ] **Create the Slack channel.** Name `#shinhan-innoboost-2026`. Visibility: private. Members: squad + founder + design lead + legal lead + ops lead (full membership of working team; broader CyberSkill team excluded for confidentiality). Channel topic: "Shinhan Global Innoboost 2026 — submissions live, interview window 20–29 May, Demo Day Sep 2026 (if selected). INDEX → tasks/INDEX.md."
- [ ] **Pin foundational links to the channel.** A single pinned message containing: link to `tasks/INDEX.md`, link to `demo-build-plan.md`, link to the Linear/ClickUp project, link to the Storybook URL (once P00-T03 ratifies), link to the Figma library file (once P00-T03 ratifies), link to the legal vault (access-controlled), link to the GitHub monorepo (once P01-T01 ratifies), link to the project-workspace conventions doc, link to this week's standing-orders message.
- [ ] **Create channel sub-thread conventions.** Document conventions for: per-FR-ID discussion threads (one thread per FR for cross-functional discussion); engineering daily-standup thread (one thread Monday-Friday); design review thread; pitch-rehearsal thread; security/compliance thread; founder-only escalation thread. Pin a separate conventions message explaining what goes where; new squad members are pointed at it on day 1.
- [ ] **Create the Linear (or ClickUp) project.** Project name: "Shinhan Innoboost 2026". Status set: Draft, Ready, Assigned, In Progress, In Review, Done, Blocked — exactly mirroring INDEX.
- [ ] **Import all 80 tasks from INDEX.md.** Each ticket gets the INDEX Task ID as its prefix (e.g., LIN-SHB-P02-T01). Each ticket includes the Title, Phase, Priority, feature_type, eu_ai_act_risk_class, Owner type, and a link to the per-task FR document. Where the FR is already authored, embed a copy of its Summary as the ticket description; otherwise mark the ticket as "FR pending" and link to the INDEX entry.
- [ ] **Configure dependency edges.** For each ticket whose INDEX-listed Deps include another Task ID, add a Linear "Blocked by" relationship. This makes the dependency-readiness view (below) mechanical to compute.
- [ ] **Configure four Linear views.** (a) By phase — group by phase number, sort by priority. (b) By owner type — group by owner type column (eng / design / pm / etc.); useful for capacity planning. (c) By priority — flat list, p0 to p3, top to bottom. (d) **By dependency-readiness** — filter for tickets in `Ready` status whose every dependency is in `Done`; this is the actionable work-front, the most useful view in practice.
- [ ] **Wire Linear ↔ Slack.** Linear sends ticket events (created, status-changed, assigned) to a Linear-bot Slack thread; assignment changes notify the assignee.
- [ ] **Extend the shared-drive folder structure.** Inside `0.HQ/Shinhan Innoboost 2026/`:
  ```
  Shinhan Innoboost 2026/
    Submissions/         (existing — locked, do not modify)
    tasks/               (existing — INDEX + per-task FRs + _TEMPLATE)
    rehearsals/          (recorded video, run-of-show notes; access: squad)
    references/          (sponsor materials, sponsor-call notes; access: squad)
    compliance/          (Phase 8 outputs: PDPL/CSL/SBV/ISO/SOC; access: squad)
    decks/              (per-BU pitch decks, drafts and finals; access: squad)
    artefacts/          (architecture diagrams, data-flow diagrams, screenshots, recorded demos; access: squad)
    decisions/          (ADRs, architecture council minutes; access: squad)
    legal/              (NDAs, sponsor-consent riders; access: founder + legal lead + ops only)
  ```
- [ ] **Set up access controls.** `legal/` folder restricted to founder + legal lead + ops lead. Everything else open to squad. Use the file-storage tool's native ACL (Google Drive permissions, Dropbox permissions, etc.). Access changes must go through legal lead.
- [ ] **Author the workspace-conventions doc.** Location `tasks/_workspace-conventions.md`. Topics: Slack thread conventions; ticket naming; decision-capture rules ("if it changes a Phase output → write an ADR; if it doesn't → post in channel"); file-naming conventions; when to ping vs. wait; status-update cadence; how to file a new FR (use `tasks/_TEMPLATE.md`); external-voice rules (per `feedback_enterprise_voice`).
- [ ] **Set up a weekly status digest.** Founder + PM publish a Friday digest. Audience: squad + founder. Content: what shipped this week (with FR/PR links); what's blocked; what's at risk; squad headcount on the project this week; one-line "what we learned" reflection. Posted to channel and pinned for the week. Cadence: every Friday from now through Demo Day if selected, or until interview-week conclusion.
- [ ] **Run a 30-min squad onboarding session.** Walk every squad member through Slack channel, Linear project, folder structure, conventions doc. Mandatory; recorded for new joiners. Founder attends.
- [ ] **Add a "new joiner" runbook.** `tasks/_new-joiner-onboarding.md` lists what a new squad member must do on day 1: sign the internal NDA addendum (P00-T04), read the conventions doc, read the demo-build-plan.md and the INDEX, watch the recorded onboarding session, get assigned a starter ticket.

### Acceptance criteria

- Slack channel created, populated with pins, with at least the squad + founder + design lead + legal lead + ops lead as members.
- Linear (or ClickUp) project created with all 80 INDEX tasks imported and dependency relationships configured.
- All four Linear views built and verified to render correctly.
- Folder structure extended; access controls set on legal/ folder.
- Workspace-conventions doc shared and acknowledged by every squad member (acknowledgement tracked).
- First weekly status digest published.
- Squad onboarding session completed (live + recorded version pinned).
- New-joiner runbook published.

## Alternatives Considered

- **Use existing CyberSkill catch-all channels and tracker.** Rejected: produces channel-noise, dilutes attention, and the Innoboost-specific work needs dedicated focus given the 12-week PoC stakes if shortlisted.
- **Skip the tracker; rely on the INDEX.md alone.** Rejected: INDEX is a static planning artefact; we need a dynamic tool for status, ownership, and dependency-readiness. INDEX is the canonical *plan*; the tracker is the canonical *execution surface*.
- **Use Notion instead of Linear.** Rejected: Notion is good for docs but weak on ticket dependencies; the demo-build has explicit prerequisite chains that Linear handles natively (Linear's "Blocked by" relationship and the ability to filter for "all blockers cleared"). Notion's task model would force us to reinvent that.
- **Use GitHub Issues as the tracker.** Rejected: GitHub Issues are great for engineering work but weak for cross-functional tasks (legal, design, sales). Linear handles cross-functional natively. We'll still link Linear tickets to GitHub PRs for engineering work — Linear's GitHub integration handles this.
- **Defer the workspace setup until the team actually starts working.** Rejected: see "Problem" — workspace gravity matters from day 1; standing up a workspace mid-project is significantly more disruptive than standing it up before the first meaningful work begins.
- **Make the Slack channel public to the broader CyberSkill org.** Rejected: confidentiality concerns (Shinhan-supplied content, sponsor-consent details, pricing strategy) require a private channel.
- **Use Microsoft Teams instead of Slack.** Rejected: not the team's existing standard, would force an unnecessary tool migration. Slack is the canonical CyberSkill communication tool.

## Success Metrics

- **Primary**: All 80 INDEX tasks imported into Linear within 2 days of this task being assigned, with dependency edges configured. Measured by: API check against Linear; expected count is 80; expected dependency-edge count matches the count of "Deps" entries in INDEX.md.
- **Guardrail**: Weekly status digest published on time every Friday from start through Demo Day. Measured by: digest-message timestamps in the Slack channel. Allowed: 1 missed week with explicit catch-up post within 48 hours; > 1 missed week triggers a process review.

## Scope

### In scope
- Slack channel + pins + sub-thread conventions.
- Linear (or ClickUp) project + INDEX import + four views + Slack wiring.
- Folder-structure extension + access controls.
- Workspace-conventions doc.
- Weekly status digest cadence.
- Squad onboarding session.
- New-joiner runbook.

### Out of scope
- Migration of any pre-existing Innoboost work — Submissions/ stays in place unchanged.
- External-facing comms (Shinhan-side channels, GenAI Fund channels — those are relationship-management activities, separate from this internal-workspace task).
- Changes to the company-wide Slack or Linear hygiene rules.
- Building custom dashboards or BI on top of the tracker (deferred unless explicit need arises).

## Dependencies

- **Templates**: the FR template (`tasks/_TEMPLATE.md`); the ADR template; internal CyberSkill workspace-conventions baseline (use as reference, customise for Innoboost specifics).
- **Tools**: existing CyberSkill Slack workspace; existing Linear or ClickUp licence; existing file-storage workspace (Google Drive / Dropbox / etc.).
- **People**: PM authoring; ops lead for access-control setup; founder for sign-off on cadence and conventions.
- **Memory references**: `shinhanos_overview`, `cyberskill_company_facts`, `feedback_enterprise_voice`.
- **Downstream**: gates the productive use of every Phase 1+ task (no upstream Task ID dependencies, but extremely high downstream impact).

## Open Questions

- Q1: Linear or ClickUp? Default to whichever the team is currently using. If both are available, prefer Linear (better dependency visualisation; cleaner GitHub integration).
- Q2: Should the weekly status digest go to anyone outside the squad (e.g., other CyberSkill leadership)? Recommendation: no — keep digest scoped to squad + founder; founder summarises laterally as needed.
- Q3: For the Slack channel, should we set up scheduled-message reminders (e.g., daily standup ping at 09:00 ICT)? Recommendation: yes — adds rhythm without nagging.
- Q4: For the file-storage folder structure, is a separate "templates/" sub-folder useful (containing reusable Notion-templates, Excel-templates, etc.)? Recommendation: defer; if templates accumulate, add later.
- Q5: New squad-member onboarding — who owns it? Recommendation: PM owns the *process* (the runbook, the recording); founder owns the *moment* (welcomes new joiners personally).

## Implementation Notes

- The Linear "by dependency-readiness" view is the most operationally useful view; spend time getting it right. Filter logic: status = Ready AND no Blocked-by relationships in non-Done status. Linear supports this via custom views.
- For the Slack pinned message, use a single pinned message with all the foundational links rather than multiple pins. Pins decay in usefulness when there are too many; one well-curated pin survives.
- The conventions doc should be ~2 pages max. Longer = unread. If conventions accumulate beyond that, split into a base + an FAQ.
- For the weekly digest, follow a fixed structure: "Shipped → Blocked → At-risk → Headcount → Reflection." Predictable structure means readers scan faster.
- For the new-joiner runbook, the day-1 checklist should be concrete: "open this URL, read this doc, sign this NDA, get this Slack DM with your starter ticket." Vague onboarding instructions produce vague onboarding outcomes.
- For access controls on legal/, double-check that the file-storage tool's audit log captures access events; this feeds the Phase 8 evidence chain.

## Test Plan

- Test 1: Create a fake new-joiner account, walk through the new-joiner runbook end-to-end, time it. Pass criterion: new joiner reaches "ready to take a starter ticket" status in < 2 hours.
- Test 2: Open Linear, switch to the "by dependency-readiness" view, verify the count of actionable tickets is the expected count (initial state: most Phase 0 tickets ready; everything else blocked on Phase 0).
- Test 3: Post a test message in each sub-thread; verify routing and notifications fire correctly.
- Test 4: Audit the legal/ folder access-control: log in as a non-authorised account and verify access is denied; log in as authorised and verify access is granted; check the audit log captures both events.
- Test 5: Manual review of the conventions doc by a non-PM squad member; check for ambiguity (anything that could be read two ways).
- Test 6: First weekly digest — check that the structure is followed and that the content is useful (not generic).

## Rollback Plan

- Workspace setup is low-risk; rollback equals deletion. If the workspace is set up wrong (e.g., wrong members in the channel, wrong folder structure), correct in-place and audit-log the change.
- If Linear proves to be the wrong tracker (unlikely), migrate to ClickUp by exporting via Linear API and re-importing. Tasks have stable Task IDs (P00-T01, etc.), so the mapping is mechanical.
- If conventions prove unworkable in practice, revise the conventions doc; do not silently break them. Versioned doc.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Slack channel | Slack workspace | PM | Until program end |
| Linear (ClickUp) project | Linear / ClickUp workspace | PM | Until program end |
| Folder structure | `0.HQ/Shinhan Innoboost 2026/` | PM | Indefinite |
| Conventions doc | `tasks/_workspace-conventions.md` | PM | Until superseded |
| Weekly status digests | Slack channel pins | PM | Until program end |
| New-joiner runbook | `tasks/_new-joiner-onboarding.md` | PM | Until program end |
| Onboarding session recording | Project workspace | PM | Until program end |
| Squad acknowledgement list | `tasks/_squad-acknowledged.md` | PM | Until program end |
| Access-control audit log | File-storage tool's native log | Ops | 7 years |

## Operational Risks

- **Linear/ClickUp licence cost overrun.** Mitigation: existing CyberSkill licence covers projects of this scope; verify with finance before adding seats.
- **Slack channel discovery (someone outside the squad finds the channel).** Mitigation: private channel; access by invitation only; channel-discovery off in Slack settings.
- **Squad member ignores the conventions.** Mitigation: gentle PR-comment-style reminders from the PM; if persistent, escalate to founder.
- **Weekly digest becomes ritualistic noise.** Mitigation: strict structure ("if there's nothing in a section this week, skip the section, don't pad"); biased toward terse.
- **Access-control failure (e.g., legal/ folder accidentally shared with squad).** Mitigation: PM audits access controls weekly during the engagement window; access-control changes require legal-lead approval.
- **Tracker drift (Linear status differs from reality).** Mitigation: the Friday digest is the forcing function; if a ticket says In Progress but no one has touched it, that surfaces in the digest.

## Definition of Done

- Slack channel live with pins and conventions.
- Linear (ClickUp) project live with 80 imported tasks and dependency edges.
- Four views built.
- Folder structure extended with access controls.
- Conventions doc and new-joiner runbook published and acknowledged.
- First weekly digest published.
- Squad onboarding session completed and recorded.
- This FR's ticket marked Done in the tracker.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections of this FR.
- **Human review**: PM ratifies; ops lead ratifies access controls; `@stephen-cheng` ratifies cadence and conventions.
