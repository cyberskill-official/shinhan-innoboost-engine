---
title: "Build admin console (RBAC editor, registry browser, audit explorer)"
author: "@cyberskill-design-lead"
department: design
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: minimal
target_release: "2026-08-07"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Build the admin console — a separate Next.js application (or sub-route of P05-T01) for admin / compliance / founder users — exposing: tenant + BU management; RBAC matrix editor (P01-T07 backend); metric-registry browser with lineage diagrams (P02-T01); policy-rule browser + activity stats (P02-T03); confidence-tier distribution dashboard (P02-T05); citation-engine query (P02-T04); HITL queue management (P06); audit-log explorer with full-text + filters (P02-T09); eval-harness viewer (P04-T03); cost-tracking dashboard (P00-T05 + P09-T05); cluster + observability links. The admin console is the surface a Shinhan compliance officer would log into; it is the structural enforcement of every "auditable" claim in the pitch.

## Problem

The chat surface (P05-T01) shows users the *output*; the admin console shows admins the *system*. Without it, every governance claim — RBAC, policy, audit log, eval, HITL — is invisible to compliance reviewers. The admin console is the structural surface that makes Phase 1 + Phase 2 + Phase 4 + Phase 8 outputs *visible* to stakeholders who don't read source code.

Specific gaps if we shortcut:

- **Without admin UI for RBAC, role assignments are CLI-only.**
- **Without registry browser, metric authorship + lineage are opaque.**
- **Without policy-rule activity stats, "which rules fire how often" is invisible.**
- **Without audit-log explorer, "show me the trail" is a SQL prompt away.**
- **Without HITL queue management, reviewers have no work surface.**
- **Without cost dashboard, runaway costs are invisible.**
- **Without eval-harness viewer, "did the engine improve this week?" requires a CLI run.**

The `feedback_p1_scope_preference` memory note biases us richer. For the admin console, "richer" means: every backend surface from Phase 1+2+4+6+9 has a corresponding admin UI page; not "we'll add the audit explorer later"; not "RBAC is CLI-only for v1". Each surface is the visibility of a backend feature; without the surface, the backend feature is undemo-able.

## Proposed Solution

A Next.js admin application in `ui/admin/` (or `/admin/*` sub-route of `ui/`) consuming the brand-surface package (P00-T03; uses the neutral CyberSkill primary, not BU themes) and exposing the documented surfaces. Auth via Keycloak (P01-T06) with `admin` or `super-admin` role required. Setup target: 21 days from task assignment after P05-T01.

### Subtasks

- [ ] **Set up admin application structure.** Routes: `/admin/tenants`, `/admin/users`, `/admin/rbac`, `/admin/registry`, `/admin/policy`, `/admin/confidence`, `/admin/citations`, `/admin/hitl`, `/admin/audit`, `/admin/eval`, `/admin/cost`, `/admin/observability`.
- [ ] **Tenant + BU management.** Browse tenants; create / edit / delete (super-admin only); per-tenant config overrides (rate-limits, cost-ceiling, threshold overrides for confidence tiers).
- [ ] **RBAC matrix editor.** Visual matrix of roles × capabilities; clicking a cell toggles; changes go through PR (cannot be runtime). Group-membership editor for users.
- [ ] **Metric registry browser** (consumes P02-T01 API). Per-metric detail page: definition (YAML view), lineage diagram (Mermaid), version history, recent queries against this metric, owner, freshness.
- [ ] **Proposed-change preview.** When a metric YAML PR is open, the admin console fetches the proposed change and shows: impact analysis (which other metrics depend on changed columns); a side-by-side diff of definition; sample-question impact (does the gold-set still pass?).
- [ ] **Policy-rule browser** (consumes P02-T03). Rules listed; per-rule activity stats (firings per day, action distribution); proposed-rule preview (linked to runtime config).
- [ ] **Confidence-tier distribution dashboard** (consumes P02-T05). Per-BU distribution; trend over time; outliers (questions with unusually low/high confidence).
- [ ] **Citation query.** Search the citation engine by ID, by question, by metric. Show the full citation record with the source SQL + row.
- [ ] **HITL queue management** (consumes P06). Inbox of pending cases; per-case detail with approve/edit/reject actions (P06-T02 reviewer console); SLA tracking; calibration reports.
- [ ] **Audit-log explorer** (consumes P02-T09). Filter by tenant, requester, event class, time range; full-text search on payload (respecting redaction policy); export to CSV / JSONL; visualisations (events-per-hour over time).
- [ ] **Eval-harness viewer** (consumes P04-T03). Latest run results; per-BU + per-intent breakdowns; trend over time; comparison to baseline; HTML reports linkable.
- [ ] **Cost-tracking dashboard** (consumes P00-T05 + P09-T05). LLM cost per question; warehouse query cost; GPU rental cost; total spend per period.
- [ ] **Observability links.** Direct links to Grafana / Loki / cluster events for engineers needing deeper data.
- [ ] **Implement role-gated access.** Every admin route checks `super-admin` (sensitive) or `admin` (normal); pages render or hide controls per role.
- [ ] **Implement audit logging.** Every admin action is logged to P02-T09 audit log; admin operations are 2-eye for sensitive changes.
- [ ] **Test exhaustively.** E2E for every admin page; visual regression; RBAC test (admin can; viewer cannot).

### Acceptance criteria

- All documented admin pages operational.
- Role gating enforced.
- Audit logging on every admin action.
- E2E + visual regression tests pass.
- Compliance lead acceptance: admin console satisfies their imagined needs for a compliance audit.

## Alternatives Considered

- **Use existing Grafana dashboards instead of admin UI.** Rejected: Grafana is for metrics; admin UI is for management actions. Different concern.
- **Defer admin UI to post-PoC.** Rejected: visibility of governance is core to the pitch; deferring undercuts the credibility story.
- **Build only audit + RBAC; defer the rest.** Rejected: each surface unblocks a different reviewer concern; full set is the floor.
- **Make admin console a separate service (separate auth, separate deploy).** Rejected: same Keycloak realm; separate route within the same Next.js app is simpler.

## Success Metrics

- **Primary**: All 12 admin pages operational within 21 days.
- **Guardrail**: Compliance lead acceptance: signs off that the console meets imagined audit needs.

## Scope

### In scope
- 12 admin pages.
- Role gating + audit logging.
- Tests.

### Out of scope
- Marketing-site admin (separate workstream).
- Reviewer console for HITL (P06-T02; this task surfaces the queue).
- Real-time observability dashboards (P09; this task links).

## Dependencies

- **Upstream**: P05-T01, P00-T03, P01-T06 (auth), P01-T07 (RBAC), P02-T01..T09 (engine APIs), P04-T03 (eval), P06-T02 (HITL).
- **Downstream**: P11-T04 (compliance dossier references admin pages), P12 (rehearsal demonstrates from admin).
- **People**: design lead; engineer; compliance lead reviewing.

## Open Questions

- Q1: 2-eye approval scope — which admin operations require it? Recommendation: tenant create/delete; RBAC matrix changes; admin override; key rotation.
- Q2: Audit-log explorer search performance? Recommendation: index for common filters; full-text search uses Postgres tsvector.
- Q3: Cost dashboard — per-tenant attribution? Recommendation: yes for production; for demo, aggregate.

## Implementation Notes

- Admin UI uses CyberSkill brand primary (not BU themes); reads as a unified-system admin tool.
- 2-eye approval implemented via PR for source-controlled changes (RBAC matrix); via in-app approval for runtime changes.
- All admin actions audit-logged.
- For the audit-log explorer, query latency target p95 < 500ms.

## Test Plan

- Test 1: E2E for every admin page; verify it renders and the listed actions work.
- Test 2: RBAC — admin role accesses; viewer cannot.
- Test 3: 2-eye approval — verify a tenant-deletion requires two admins.
- Test 4: Audit logging — every admin action lands in audit log.
- Test 5: Compliance lead acceptance — manual review.

## Rollback Plan

- Bad admin UI rolled back via Helm rollback.
- Bad admin action (e.g., wrong RBAC matrix change) rolled back via PR revert + redeploy.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Admin UI source | `ui/admin/` | Design lead | Continuous |
| Admin action audit | P02-T09 audit log | Eng-sec | 7 years |
| Compliance acceptance log | `docs/audit/compliance-sign-offs/{date}.md` | Compliance lead | 7 years |

## Operational Risks

- **Admin UI exposes more than intended.** Mitigation: role gating tested; security review.
- **2-eye approval bypass.** Mitigation: enforced server-side; cannot be bypassed by client.
- **Audit-log explorer slow under load.** Mitigation: indexed queries; pagination.

## Definition of Done

- All admin pages operational.
- Tests passing.
- Compliance acceptance recorded.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Admin console displays system data (RBAC, audit log, metrics, etc.); no AI behaviour added.

### Human Oversight
Admin actions audit-logged; sensitive operations require 2-eye approval; compliance lead reviews console.

### Failure Modes
- Page render failure: error state + reference ID.
- Backend API down: graceful degradation per page.
- Audit-log write failure on admin action: alert + retry.

## Sales/CS Summary

The admin console is the surface CyberSkill exposes to your compliance and audit teams: every metric definition, every RBAC role assignment, every policy decision, every HITL action, every audit-log entry, every eval-harness run, every cost — visible, queryable, exportable. A compliance officer can sign in, audit any decision, export evidence for a regulator, and never have to ask an engineer to run a query.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: design lead authors UI; engineer integrates backend; compliance lead reviews console for audit-readiness; `@stephen-cheng` ratifies sensitive-action 2-eye scope.
