---
title: "Implement RBAC engine with roles, scopes, tenant boundary"
author: "@cyberskill-eng"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: minimal
target_release: "2026-05-29"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Implement the application-level RBAC engine that enforces role-based and scope-based access control across every engine surface (chat, HITL, admin, eval, observability). The RBAC engine consumes JWTs issued by Keycloak (P01-T06), maps role and group claims to capabilities, enforces tenant-boundary isolation (every query is scoped to the requesting user's tenant; cross-tenant access is impossible by construction), exposes a declarative authorisation API for application code (`assertCan(user, "metric:read", { tenant, sensitivity })`), and audits every authorisation decision for forensic review. The RBAC engine is consumed by every Phase 2 task; correctness here is the structural enforcement of every "tenant isolated" claim in the pitch.

## Problem

Banking-sector software lives or dies by access control. The Innoboost Q&A flags "real customer data cannot be provided" but "Shinhan will provide simulated or masked data" — even masked data carries access-control obligations (SBV regulations expect strong identity-and-access controls including least-privilege, separation of duties, and auditable authorisation). The pitch claims "tenant-isolated by construction"; without a rigorously implemented RBAC engine, that claim is rhetorical.

Specific gaps if we shortcut:

- **Without an authorisation API in application code, authorisation is inconsistent.** Each engine endpoint reinvents the check; some skip it; some get the order wrong. `assertCan(user, action, context)` collapses these to a single audited call.
- **Without tenant boundaries enforced in every query, a single bug exposes data across tenants.** The single most likely vulnerability in any multi-tenant SaaS.
- **Without scope-level enforcement (e.g., "metric:read" vs "metric:edit"), action granularity is missing.** The chat user can read a metric; the metric owner can edit it; the admin can deprecate it. Roles alone aren't enough; scope-level capability checks are necessary.
- **Without an audit trail of every authorisation decision, ISO 27001 A.5.16 (identity management) and SOC 2 CC6.3 (logical access — authorisation) cannot be evidenced.**
- **Without sensitivity-tier integration, the policy layer (P02-T03) has nowhere to plug in.** The RBAC engine is the seam that connects identity (P01-T06), data sensitivity (P02-T07 PDPL classifier), and the policy layer (P02-T03).

The `shinhanos_architecture` memory note documents 3-layer tenant isolation as a ShinhanOS architecture principle. The demo's RBAC engine is the application-layer of that 3-layer model (Keycloak realm = identity layer; Postgres row-level filtering = data layer; RBAC engine = application layer). This task delivers the application layer.

The `shinhanos_ai_compliance` memory note describes 7 technical primitives that satisfy multi-jurisdictional AI rules simultaneously. RBAC + sensitivity-tier integration is one of those primitives — specifically, the access-control primitive that ensures regulated data isn't reachable by an unauthorised role.

The `feedback_p1_scope_preference` memory note biases us richer. For RBAC, "richer" means: declarative API (richer than imperative `if (user.role === ...)` checks scattered through the code); scope-level capabilities (richer than role-only); tenant boundary enforced at every layer (defence in depth); decision audit (more than just access logs); test coverage on every authorisation pattern. Each layer is straightforward; together they form an enterprise-grade access-control model.

## Proposed Solution

A small, focused RBAC engine implemented in `engine/auth/` (sub-module of the `engine/` workspace), exposing:

1. **Capability model.** A capability is `<resource>:<action>` (e.g., `metric:read`, `chat:send`, `hitl:approve`, `admin:purge_audit`). Each role has a documented capability set in `engine/auth/roles.yaml`. Group memberships in Keycloak grant additional capabilities via documented mappings.
2. **Tenant model.** Every entity in the system has a `tenantId`. Every query is scoped by the requester's `tenantId`; cross-tenant queries are impossible by construction (caller cannot fabricate a tenantId; the engine reads it from the JWT only).
3. **Sensitivity model.** Resources have a sensitivity tier (Public / Internal / Restricted / Regulated, per P02-T07). RBAC checks combine role-capability with sensitivity-tier rules.
4. **Authorisation API.** `assertCan(user, action, context)` throws if denied; `can(user, action, context)` returns boolean. Both audit the decision.
5. **Decision audit.** Every authorisation decision (allow / deny / error) is logged to the audit log (P02-T09) with: requester, action, context, decision, rule chain that produced the decision.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Define the capability model.** Author `engine/auth/roles.yaml` with: `viewer`, `analyst`, `reviewer`, `admin`, `super-admin`. Each role has a list of capabilities. Document the rationale for each capability in inline comments. Examples:
  - `viewer`: `chat:send`, `metric:read` (sensitivity ≤ Internal), `eval:read_summary`.
  - `analyst`: `viewer` + `metric:read` (sensitivity ≤ Restricted with explicit elevation), `report:export`.
  - `reviewer`: `viewer` + `hitl:review`, `hitl:approve`, `hitl:reject` (within their assigned BU).
  - `admin`: `reviewer` + `admin:user_management`, `admin:audit_query`, `admin:metric_governance`.
  - `super-admin`: `admin` + `admin:configure_realm`, `admin:rotate_keys`.
- [ ] **Define the tenant model.** Every entity (User, Conversation, Question, Answer, Metric, ReviewerCase, AuditEvent) has a non-null `tenantId`. Cross-tenant references are not allowed. Tenant ID is sourced from JWT claim `tid` set by Keycloak per realm.
- [ ] **Define the sensitivity model.** Sensitivity tiers: `public`, `internal`, `restricted`, `regulated`. Each resource has a sensitivity property; sensitivity is orthogonal to RBAC role but compose. Examples: a metric defined as "Total Customer Count" might be `restricted` (cannot be read by `viewer`); a metric defined as "Public Statistics" is `public` (any authenticated user can read).
- [ ] **Implement the authorisation API.** Module `engine/auth/`:
  ```typescript
  type Action = 'metric:read' | 'metric:edit' | 'chat:send' | 'hitl:approve' | ... // strict union
  type Context = {
    tenantId: string;
    sensitivity?: 'public' | 'internal' | 'restricted' | 'regulated';
    resourceOwnerId?: string;
    extras?: Record<string, unknown>; // rare, scoped extension
  }
  
  export async function assertCan(
    user: AuthenticatedUser,
    action: Action,
    context: Context,
  ): Promise<void>;
  
  export async function can(
    user: AuthenticatedUser,
    action: Action,
    context: Context,
  ): Promise<boolean>;
  ```
- [ ] **Implement rule evaluation engine.** A small rule engine evaluates: tenant boundary (does `user.tenantId === context.tenantId`?); role capability (does the user's role include this action?); sensitivity rule (is the resource's sensitivity ≤ what the user's role allows?); sensitivity-elevation (does the user have a temporary elevation token issued by a reviewer?). The rule engine returns a structured decision: `{ decision: 'allow' | 'deny', ruleChain: string[], reason?: string }`.
- [ ] **Wire authorisation into every engine endpoint.** Every engine API endpoint (gRPC + REST) calls `assertCan` before performing any work. Endpoints that fail to call `assertCan` are detected by a custom ESLint rule and a CI gate.
- [ ] **Wire authorisation into every database query.** ORM-level (or repository-pattern level) interceptor adds `WHERE tenant_id = $userTenantId` to every query touching multi-tenant tables. Cannot be bypassed by application code; the interceptor is enforced at the data-access layer.
- [ ] **Wire authorisation into the policy layer entry point.** The policy layer (P02-T03) calls `assertCan` as its first gate before any other logic.
- [ ] **Implement decision audit logging.** Every `assertCan` and `can` call appends an entry to the audit log (P02-T09) with the structured decision plus context. Log schema includes: timestamp, requester user ID, requester tenant ID, action, context (sensitivity, resource owner if any), decision, rule chain, reason if denied.
- [ ] **Implement temporary sensitivity elevation.** For workflows where an analyst needs to read a `restricted` metric for a one-off review, a `super-admin` can issue a time-bounded elevation token (max 1 hour) that grants `restricted` access. The elevation issuance is itself audited with a justification.
- [ ] **Implement separation-of-duties.** A reviewer cannot approve their own HITL submissions; the same user cannot both author and approve a metric definition. Explicit rules in the rule engine.
- [ ] **Implement break-glass override.** A `super-admin` with explicit justification can override RBAC for emergency operations. The override is logged with the justification and triggers an alert to the security team. Cannot be done silently.
- [ ] **Build the role-management surface.** Admin UI (in P05-T05 admin console) lets admins assign roles; group memberships sourced from Keycloak; capability changes require a deployment (not a runtime change) for safety.
- [ ] **Build the audit-log query surface.** Admin UI lets admins query "who accessed metric X in the last week?", "who has been denied access today?", "what authorisations did user Y perform?". Forensic-friendly.
- [ ] **Test exhaustively.** Every role × every capability × every sensitivity tier; cross-tenant attempts; sensitivity-elevation flows; separation-of-duties; break-glass; audit-log integrity. Test count target: > 200.

### Acceptance criteria

- `engine/auth/` module implements `assertCan` and `can` APIs with the documented shape.
- `roles.yaml` defines all five canonical roles with documented capabilities.
- Tenant boundary enforced at: API endpoint (assertCan), data-access layer (query interceptor), and policy layer.
- Decision audit logging operational; entries land in P02-T09 audit log.
- Sensitivity elevation, separation-of-duties, and break-glass mechanisms operational.
- Admin UI surface for role management and audit-log query operational (in P05-T05).
- Test suite > 200 tests, > 95% coverage of `engine/auth/`.
- ESLint rule + CI gate prevents endpoints without `assertCan` calls.

## Alternatives Considered

- **Use Keycloak's built-in authorisation services (UMA 2.0).** Rejected as primary: Keycloak's authorisation engine is powerful but adds runtime dependency on Keycloak's authorisation API for every check. Performance cost is meaningful; offline-capability is impossible. Local rule evaluation in our engine is faster and more predictable. We use Keycloak for *authentication*, not authorisation evaluation.
- **OPA (Open Policy Agent) for authorisation.** Rejected for the demo: OPA is excellent but adds an extra service deployment, an extra DSL (Rego) for engineers to learn, and an extra latency hop. For the demo's scope, in-process rule evaluation is sufficient. Reconsider for production track if rule complexity grows.
- **Casbin in-process authorisation library.** Rejected: similar trade-off to OPA but in-process. Casbin's DSL (PERM model) is less type-safe than our TypeScript-native approach; the type-safety gain matters for correctness.
- **Pure RBAC (no sensitivity tier).** Rejected: financial data has sensitivity beyond simple role grouping; the sensitivity tier is the seam that lets the policy layer make context-aware decisions.
- **Pure ABAC (attribute-based, e.g., XACML).** Rejected as primary: ABAC is more flexible but more complex; for the demo's scope, RBAC + sensitivity is the right shape.
- **Skip the data-access layer interceptor; trust application code to scope queries.** Rejected: this is exactly the pattern that produces the most common multi-tenant data-leak bugs. Defence in depth.
- **Implement decision audit later as a separate task.** Rejected: audit-from-day-one is non-negotiable; retrofitting auditing is more expensive than starting with it.

## Success Metrics

- **Primary**: Test suite passes with > 95% coverage on `engine/auth/`; mutation-testing score > 80%. Measured by: vitest + Stryker mutation testing in CI.
- **Guardrail**: Zero authorisation bypass incidents in staging or production-rehearsal during the engagement; zero cross-tenant data leak. Measured by: nightly audit-log analysis for anomalous decisions; pen-test review (P08-T06).

## Scope

### In scope
- `engine/auth/` module with `assertCan` / `can` API.
- Capability model in `roles.yaml`.
- Tenant model + tenant-boundary enforcement.
- Sensitivity model + tier rules.
- Decision audit logging.
- Sensitivity-elevation flow.
- Separation-of-duties enforcement.
- Break-glass override.
- ESLint rule + CI gate for endpoint enforcement.
- Admin role-management surface (UI in P05-T05; backend in this task).
- Admin audit-log-query surface (UI in P05-T05; backend in this task).
- Test suite.

### Out of scope
- Authentication itself (handled by P01-T06 Keycloak).
- PDPL classification logic (handled by P02-T07).
- Audit-log storage and query infrastructure (handled by P02-T09).
- Frontend chrome for admin UI (handled by P05-T05).
- Cross-tenant data sharing (out of scope by design; would require explicit feature flag and is not supported in v1.0).
- Custom-attribute attribute-based access control (deferred to production track if needed).

## Dependencies

- **Upstream**: P01-T06 (Keycloak); P01-T01 (monorepo); P01-T03 (secrets); ADR-SHB-001.
- **Downstream**: gates every Phase 2 endpoint and every Phase 5 surface.
- **People**: engine tech lead authors; eng-sec reviews; design lead consults on admin-UI surfaces.
- **Memory references**: `shinhanos_architecture` (3-layer tenant isolation), `shinhanos_ai_compliance` (access-control primitive), `feedback_p1_scope_preference`.

## Open Questions

- Q1: For the data-access layer interceptor, do we use a Postgres row-level-security policy or an ORM-level filter? Recommendation: ORM-level filter for portability across warehouse adapters (P02-T01 supports Postgres / BigQuery / Snowflake; only Postgres has RLS).
- Q2: Sensitivity elevation token — JWT or opaque token? Recommendation: JWT signed by Keycloak with short TTL and audience scope; consistent with the rest of the auth model.
- Q3: For break-glass, does the override require 2-eye approval or single super-admin? Recommendation: single super-admin with mandatory justification + immediate notification to founder; 2-eye is procedural, not enforced by the engine.
- Q4: How do we test "this endpoint has no `assertCan` call"? Recommendation: AST-level lint rule that detects `app.route(...)` calls without an `assertCan` invocation in the handler.
- Q5: Audit log size — how do we keep audit query fast as the log grows? Recommendation: partition by month; index on `(tenant_id, action, timestamp)`; retain hot 30 days, cold 7 years; cold-storage queries are slower but rare.

## Implementation Notes

- The `Action` type is a strict TypeScript union of literal strings; adding a new action requires a code change. This prevents "string-based action invention" bugs.
- The rule engine is pure (no I/O during evaluation); it consumes the user's already-parsed JWT claims and the context. This means rule evaluation is cheap and can run on every API call without performance concern.
- The data-access layer interceptor sits at the repository pattern level. Every repository method takes the user as a parameter; the interceptor adds the `WHERE tenant_id = $tenantId` clause before query execution. Repositories that take a `system` user (rare; only for housekeeping jobs) are explicitly marked and audited.
- The decision audit log entry includes the rule chain (e.g., `["tenant-match-pass", "role-capability-allow", "sensitivity-tier-allow"]`) so a human reviewer can understand *why* a decision was made, not just what.
- For the elevation token, the issuance is itself a privileged action requiring `super-admin` role + justification. Justifications are reviewed nightly by ops.
- Break-glass override skips RBAC but still records the action in the audit log with `via: break-glass` flag plus the justification text.
- Performance: target `assertCan` median time < 200μs (in-process rule evaluation; no I/O). Audit-log write is asynchronous (fire-and-forget with a buffer; flush in the background).

## Test Plan

- Test 1: Tenant isolation — user from tenant A queries metric belonging to tenant B; verify denial.
- Test 2: Role capability — viewer attempts `metric:edit`; verify denial. Viewer attempts `metric:read` on `internal` metric; verify allow.
- Test 3: Sensitivity tier — viewer attempts `metric:read` on `restricted` metric; verify denial. Analyst with elevation token attempts same; verify allow.
- Test 4: Separation of duties — same user attempts `hitl:approve` on a case they authored; verify denial.
- Test 5: Break-glass — super-admin attempts override with no justification; verify denial. Same with justification; verify allow with audit-log entry.
- Test 6: Audit log integrity — perform 100 authorisation decisions; verify all 100 land in audit log with correct decision and rule chain.
- Test 7: Endpoint coverage — sample 20 random API endpoints; verify each calls `assertCan` first; the ESLint rule catches a deliberately-introduced violation.
- Test 8: Performance — `assertCan` p95 latency < 500μs under load; audit-log write does not block API response.
- Test 9: Mutation testing — Stryker mutation testing on `engine/auth/`; mutation score > 80%.

## Rollback Plan

- A bad role-capability mapping is rolled back via PR revert; deployment redeploy.
- A bad rule-engine bug that incorrectly denies access is identified by audit-log analysis (spike in deny rate); rolled back via revert.
- A bad rule-engine bug that incorrectly allows access is the worst case; mitigated by belt-and-braces (data-access interceptor catches what application-level missed); audit-log analysis identifies; emergency patch.
- Data-access interceptor regression that drops the tenant filter is the highest-severity bug class; mitigated by extensive test coverage (every repository test includes a cross-tenant attempt that must fail); detection via the test suite, not via production damage.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Auth module | `engine/auth/` | Engine tech lead | Continuous |
| Roles definition | `engine/auth/roles.yaml` | Engine tech lead | Continuous |
| Decision audit log | Stored in P02-T09 audit log | Eng-sec | 7 years |
| Elevation issuance log | Subset of audit log | Eng-sec | 7 years |
| Break-glass log | Subset of audit log | Founder | 7 years |
| Endpoint-coverage ESLint rule | `.github/eslint-rules/assert-can.js` | Engine tech lead | Continuous |
| Test suite | `engine/auth/__tests__/` | Engine tech lead | Continuous |
| Mutation-testing reports | CI artefacts | Engine tech lead | Per CI retention |

## Operational Risks

- **Over-permissive default.** Mitigation: deny by default; every action requires explicit allow rule. Tests for this are mandatory.
- **Under-performant authorisation check causing API latency.** Mitigation: profile; target < 500μs p95.
- **Audit-log write back-pressure causing API failure.** Mitigation: async write with bounded buffer; if buffer full, alert + drop with audit-error log entry; never block API.
- **Role-yaml change without code review.** Mitigation: `roles.yaml` is in source control; CODEOWNERS requires eng-sec + engine-tech-lead review.
- **Cross-tenant data leak via missing interceptor.** Mitigation: interceptor is enforced at repository pattern; tests cover every repository method with cross-tenant attempts.
- **Elevation-token misuse.** Mitigation: short TTL (max 1 hour); audited issuance; nightly review.

## Definition of Done

- `engine/auth/` module shipped.
- Capability + tenant + sensitivity models documented.
- Authorisation API + decision audit + elevation + separation-of-duties + break-glass operational.
- ESLint rule + CI gate enforced.
- Test suite > 200 tests, coverage > 95%, mutation score > 80%.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
The RBAC engine itself does not consume training data; it consumes JWT claims (from Keycloak) and resource metadata (from the engine's data store). No personal data is processed by the rule engine; user identity is operational (used for routing decisions, not training).

### Human Oversight
Role assignments are managed by admins through the admin UI (P05-T05). Capability changes require source-code review (CODEOWNERS) and deployment, not runtime configuration. Break-glass requires explicit super-admin justification and is reviewed by founder.

### Failure Modes
If the rule engine throws (bug), the wrapping handler returns a 500 error and logs the exception; it does *not* default-allow. If the audit-log write fails, the authorisation decision is still enforced; the failure is logged separately to a "self-monitoring" channel that fires an alert. If a sensitivity-tier classification changes mid-session (rare), existing tokens see the old value until re-issuance; this is documented as expected behaviour.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: engine tech lead authors and reviews the implementation; eng-sec reviews the rule engine and audit logging; `@stephen-cheng` ratifies break-glass procedure.
