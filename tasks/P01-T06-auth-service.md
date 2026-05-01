---
title: "Stand up auth service (Keycloak OIDC + MFA + SAML adapter)"
author: "@cyberskill-eng-sec"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: minimal
target_release: "2026-05-22"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Stand up the demo's authentication service using Keycloak as the OIDC issuer, with TOTP/WebAuthn MFA mandatory for all human users, a SAML adapter pre-configured to integrate with Shinhan-side identity providers (Active Directory Federation Services or Shinhan SSO if exposed), per-BU realms (`svfc`, `bank`, `securities`) with realm-level role and group definitions, OAuth client credentials configured for service-to-service authentication, and an admin-account break-glass procedure with audit logging. Keycloak is deployed via the Helm chart (P01-T04) into the staging cluster; values files configure per-environment realms, redirect URIs, theme branding (consistent with P00-T03's three BU theme variants), and federation settings. Auth is the gate to everything: every chat request, every HITL action, every admin operation flows through this service. Failure modes here cascade to every downstream task.

## Problem

The demo cannot ship without authentication. Banking-sector reviewers will inspect the auth model first and the rest second; if auth is weak, the rest doesn't matter. The Innoboost Q&A's Section VI flags that production deployment must be "deployed per SBV regulations" — Vietnamese banking IT regulations expect strong identity controls including MFA, federated identity for enterprise users, and audit logging of all authentication events.

Specific gaps if we shortcut:

- **Without MFA, password compromise = full account compromise.** TOTP or WebAuthn is the floor; passkey-style WebAuthn is preferred.
- **Without federated identity, integration with Shinhan-side IdP is a Phase 13 scramble.** SAML / OIDC federation should be configured at staging time so we can demo the federation story to Shinhan reviewers.
- **Without per-BU realms, tenant isolation is rhetorical.** Different BU surfaces (SF9, SB5, SS1) demand different identity scopes; mixing them in one realm produces the wrong access-control model.
- **Without OAuth client credentials, service-to-service authentication falls back to API keys.** API keys are anti-pattern in 2026; OAuth machine-to-machine with rotating client secrets is the modern equivalent.
- **Without admin break-glass procedure, recovery from an admin lockout requires manual database surgery.** Documented break-glass with audit logging is the difference between a 5-minute recovery and a 5-hour panic.
- **Without audit logging of auth events, ISO 27001 control A.5.16 (identity management) and SOC 2 CC6.1 (logical access) can't be evidenced.**

The `shinhanos_overview` memory note describes ShinhanOS as a multi-tenant ops platform; the demo's auth model should be ShinhanOS-compatible in shape (per ADR-SHB-001 portability constraint). Specifically: realms map to ShinhanOS tenants in the post-PoC port; OIDC client IDs and group claims are namespaced consistently.

The `feedback_p1_scope_preference` memory note biases us richer. For auth, "richer" means: Keycloak (richer than DIY) + MFA mandatory (richer than optional) + SAML pre-configured (richer than "we'll add it later") + per-BU realms (richer than one-realm-fits-all) + audit logging shipped to central observability (richer than realm-local logs). Each layer is well-trodden Keycloak territory; together they form an enterprise-grade identity story.

## Proposed Solution

A Keycloak deployment in the staging cluster (and the on-prem deployment recipe, in P10-T03) configured with three realms (`svfc`, `bank`, `securities`), each with TOTP/WebAuthn MFA mandatory, OAuth public clients for the chat-with-data UI surfaces, OAuth confidential clients for service-to-service auth, SAML-IdP adapters pre-configured for Active Directory / Shinhan-SSO integration, custom themes branded per `@cyberskill/shinhan-themes@1.0.0` (P00-T03), a documented break-glass admin procedure, and audit logging to the central observability store (P09-T01). Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Choose Keycloak deployment shape.** Recommendation: Keycloak 25.x (latest stable as of plan), deployed via the official Helm chart with Postgres backend (per P01-T04 IaC), HA mode (3 replicas) in production-rehearsal, single-replica in dev/staging.
- [ ] **Author Keycloak Helm values.** `infra/helm/.../values-staging.yaml` for staging, with: Postgres connection from Cloud SQL (P01-T04); admin password from Doppler (P01-T03); ingress hostname `auth.staging.shinhan-innoboost.cyberskill.world`; TLS via cert-manager; resource requests/limits sized for ~100 concurrent users.
- [ ] **Bootstrap Keycloak admin.** First-time setup: import admin credentials from Doppler; rotate admin password every 90 days; admin account has TOTP MFA from day 1.
- [ ] **Create three realms.** `svfc`, `bank`, `securities`. Each realm has: realm-level roles (`viewer`, `analyst`, `reviewer`, `admin`); realm-level groups mapped to typical Shinhan org structure (e.g., `bank-ho-dept-finance`, `svfc-mis-team`); password policy (min length 12, require complexity, no reuse of last 5, expire after 90 days); brute-force lockout after 5 failed attempts in 5 minutes; session lifetime (8 hours idle, 24 hours max).
- [ ] **Configure MFA enforcement.** Realm-level required action: TOTP. Optional: WebAuthn / passkey (preferred when supported). MFA cannot be disabled per-user; admin actions require MFA on every login.
- [ ] **Configure OAuth public clients.** One per BU UI: `svfc-ui`, `bank-ui`, `securities-ui`. Each client: redirect URI matching the staging URL pattern; PKCE required; refresh token rotation enabled; access-token lifetime 15 minutes; refresh-token lifetime 12 hours.
- [ ] **Configure OAuth confidential clients.** Service-to-service: `engine-to-warehouse`, `engine-to-llm-router`, `hitl-to-engine`, `eval-to-engine`. Each client: client credentials grant; client secret in Doppler; access-token lifetime 5 minutes (short for service-to-service); custom claims expose tenant ID + service identity.
- [ ] **Configure SAML adapter (pre-staged).** Realm has a SAML IdP placeholder configured for Shinhan-side AD-FS integration. The adapter is "ready to wire" — when SFL-V provides their IdP metadata XML, the adapter consumes it and federation works without re-deploy. Document the wire-up procedure in `docs/runbooks/saml-federation.md`.
- [ ] **Configure custom theme.** Use the brand-surface package from P00-T03 to skin the Keycloak login page per realm: `svfc` realm gets SVFC-slate theme; `bank` realm gets Bank-navy theme; `securities` realm gets Securities-charcoal theme. Each theme deploys as a Keycloak Theme JAR mounted into the Keycloak pod.
- [ ] **Configure per-realm branding.** Logo, colour, button styling, login-page text per realm. Vietnamese-language UI strings (P00-T03 verified Vietnamese fluency); English fallback.
- [ ] **Configure audit-event listener.** Keycloak's built-in event store captures auth events (login success, login failure, logout, token issuance, role assignment, password change). Add a custom event listener that forwards events to the central observability store (P09-T01) via a webhook or Kafka if available.
- [ ] **Author break-glass admin procedure.** `docs/runbooks/keycloak-break-glass.md`: steps for: locked-out-admin recovery (database-side admin password reset with audit-log entry); MFA-secret-loss recovery (admin reset of user MFA, with mandatory documentation of why); compromised-admin recovery (revoke active sessions, rotate password, audit-log review).
- [ ] **Configure backup and DR.** Postgres backend backed up per P01-T09. Realm exports run nightly to Cloud Storage (P01-T04) — JSON exports allow disaster-recovery realm import.
- [ ] **Configure rate limiting.** Brute-force lockout (above) plus rate limiting at the ingress level (P01-T10) to prevent denial-of-service via login spam.
- [ ] **Author user-onboarding flow.** When a new Shinhan reviewer needs access during the interview window, what's the fastest path? Recommendation: pre-create accounts for known reviewers; share TOTP-bootstrap codes via secure channel; reviewer enrols on first login.
- [ ] **Configure session management.** Keycloak's session view lets admins see active sessions; revoke if compromised. Session-revocation propagates within 30 seconds across all clients (configure refresh-token revocation aggressiveness).
- [ ] **Test end-to-end.** Stand up a sample Next.js app that uses next-auth or @auth/* with the Keycloak issuer. Verify login → MFA prompt → session establishment → API call with bearer token → token refresh → logout flow.

### Acceptance criteria

- Keycloak deployed in staging via Helm.
- Three realms (`svfc`, `bank`, `securities`) created with documented configuration.
- MFA mandatory in all realms; verified by attempting password-only login (should require TOTP).
- OAuth public + confidential clients created per realm; verified by sample login flow.
- SAML adapter pre-staged; documentation for federation wire-up published.
- Custom themes per realm; verified visually against the brand-surface package.
- Audit events forwarded to central observability store; verified by a sample login event landing.
- Break-glass procedure documented and dry-run-tested.
- Realm exports running nightly.
- Rate limiting and brute-force lockout verified by load test.

## Alternatives Considered

- **Auth0 / Okta managed identity-as-a-service.** Rejected: cloud-vendor-locked; doesn't fit the on-prem deployment story; ongoing cost; SaaS data-residency concerns for VN tenants.
- **Authentik (open-source alternative).** Rejected as primary: less mature than Keycloak; smaller community; integration story for SAML and SCIM is less battle-tested.
- **Build our own auth using Passport.js or NextAuth + a database.** Rejected: rolling-your-own auth is the standard anti-pattern; vulnerabilities in custom auth plague the industry. Use a battle-tested IdP.
- **Use a single realm and put BU separation in claims/groups.** Rejected: tenant boundaries are easier to reason about with per-realm separation. The complexity cost is small; the clarity gain is large.
- **Skip MFA for the demo phase; add for production.** Rejected: MFA is non-negotiable for banking-sector credibility; adding later is more expensive than starting with it.
- **Skip SAML pre-stage; configure when Shinhan provides metadata.** Rejected: pre-staging means the federation story is demonstrable in the interview; the cost is one configuration page that we leave empty until real metadata arrives.
- **Use Keycloak's built-in admin-account-recovery without a documented break-glass.** Rejected: emergency recovery without documentation produces ad-hoc decisions; the runbook is what makes recovery deterministic.

## Success Metrics

- **Primary**: Full Keycloak deployment with three configured realms within 14 days of task assignment. Measured by: end-to-end test of login → MFA → API call across all three realms.
- **Guardrail**: Zero auth-bypass incidents in staging or production-rehearsal during the engagement. Measured by: nightly audit-event analysis; any anomaly triggers investigation.

## Scope

### In scope
- Keycloak deployment in staging (and on-prem recipe).
- Three per-BU realms with documented configuration.
- MFA enforcement.
- OAuth public + confidential clients.
- SAML adapter pre-staged.
- Custom themes per realm.
- Audit-event forwarding.
- Break-glass procedure.
- Backup + DR for the auth backend.
- Rate limiting + brute-force lockout.
- User-onboarding flow.

### Out of scope
- Production-shinhan-poc realm provisioning (placeholder; provisioned at kickoff).
- Integration with Shinhan-side IdP (federation wire-up happens when SFL-V provides metadata).
- Single-sign-on across multiple realms (deferred unless required).
- SCIM provisioning (deferred unless required by a specific Shinhan IdP).
- Self-service password reset via email (deferred — for the demo phase, password reset is admin-mediated).
- Custom flows for high-assurance authentication (e.g., step-up auth before sensitive operations) — deferred to P02-T03 policy layer if needed.

## Dependencies

- **Upstream**: P01-T01 (monorepo); P01-T02 (CI/CD); P01-T03 (secrets); P01-T04 (IaC for Postgres backend + cluster + ingress); P00-T03 (brand surface for themes).
- **People**: eng-sec authoring; platform engineer for Helm config; design lead for theme packaging.
- **External**: Keycloak 25.x; Postgres for backend (provisioned by P01-T04); cert-manager for TLS.
- **Memory references**: `shinhanos_overview`, `shinhanos_data_residency`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: Should Keycloak admin live in a separate "master" realm? Recommendation: yes — Keycloak's default; our admin operates in `master` realm; user-facing realms are `svfc`, `bank`, `securities`.
- Q2: For WebAuthn / passkey support, is the staging URL trustworthy enough for the browser to allow registration? Recommendation: yes — TLS via cert-manager with public domain; should work in modern browsers.
- Q3: For SAML federation, do we need to support the older SAML 1.1 standard or only SAML 2.0? Recommendation: SAML 2.0 only; check with SFL-V if their IdP requires 1.1 (unlikely).
- Q4: For the custom theme JARs, do we build per-Keycloak-version (theme JARs are sometimes version-specific)? Verify; if so, document.
- Q5: For the OAuth confidential clients' client secrets, rotation cadence? Recommendation: monthly per P01-T03 secrets policy.

## Implementation Notes

- Keycloak 25.x uses Quarkus runtime (vs. older WildFly). Performance is much better; configuration model is simpler.
- For Kubernetes deployment, use the official `keycloak-operator` if you want CRD-driven realm management. Trade-off: the operator is more declarative (realm definitions in Git) but adds a moving part. Recommendation: use Helm chart for deployment; manage realms via the admin UI for staging, via realm-import JSON for production.
- For realm exports, the JSON files live in source control under `infra/keycloak/realms/`. Sensitive secrets (e.g., client secrets) are stripped from the export and managed separately via Doppler.
- For the break-glass procedure, the database-side admin password reset is documented but locked behind 2-eye approval (founder + ops). Don't make it easy.
- For audit-event forwarding, use the SPI extension pattern — write a small Java extension that ships with the Keycloak image. CyberSkill internal artefact store hosts the JAR; Helm values reference it.
- For brute-force lockout, configure the Keycloak realm's "Brute Force Detection" feature with: max login failures 5; wait increment 60 seconds; max wait 15 minutes; max delta time 12 hours; failure-reset-time 12 hours. Tune later if it causes false-positive lockouts during demo rehearsal.

## Test Plan

- Test 1: Login flow — open svfc-ui realm login page, log in with test credentials, complete TOTP, verify session.
- Test 2: MFA bypass attempt — try to log in via password only via the OAuth flow; verify rejection.
- Test 3: SAML adapter sanity — point the adapter at a test SAML IdP (e.g., samltest.id); verify federation works.
- Test 4: OAuth confidential client — call a sample API with client-credentials-issued token; verify access; verify token expires at the configured TTL.
- Test 5: Audit event forwarded — log in, log out; verify both events land in the central observability store within 60 seconds.
- Test 6: Break-glass dry run — execute the documented procedure on the dev environment; verify recovery; capture timing.
- Test 7: Brute-force lockout — automated test sending 6 failed login attempts; verify lockout fires; verify recovery on cooldown.
- Test 8: Realm export / import — export svfc realm to JSON; import to a fresh Keycloak instance; verify configuration is identical.

## Rollback Plan

- A bad realm configuration is rolled back by re-importing the previous nightly realm export. Realm exports retained for 30 days.
- A bad Keycloak version upgrade is rolled back via Helm `helm rollback`.
- A compromised admin account is recovered via break-glass; rotate password; revoke sessions; audit-log entry.
- A custom-theme bug breaks the login page; revert the theme JAR via Helm rollback; users see the default Keycloak theme until the fix.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Helm values for Keycloak | `infra/helm/.../values-{env}.yaml` | Eng-sec | Continuous |
| Realm exports | `infra/keycloak/realms/{realm}.json` | Eng-sec | Continuous |
| Custom theme JAR | Internal artefact store | Eng-sec | Continuous |
| Custom audit-event listener JAR | Internal artefact store | Eng-sec | Continuous |
| Break-glass runbook | `docs/runbooks/keycloak-break-glass.md` | Eng-sec | Continuous |
| SAML federation runbook | `docs/runbooks/saml-federation.md` | Eng-sec | Continuous |
| User-onboarding runbook | `docs/runbooks/user-onboarding.md` | Eng-sec | Continuous |
| Audit events | Central observability store | Eng-sec | 7 years |
| Break-glass execution log | `docs/audit/break-glass/{date}.md` | Founder | 7 years |

## Operational Risks

- **Keycloak Postgres connection failure.** Mitigation: connection pool with retry; auth degraded gracefully (existing sessions continue) until reconnect; alerting fires at 30 seconds of failure.
- **MFA secret loss for a user.** Mitigation: admin reset with audit-log entry; rare event but documented.
- **Compromised admin account.** Mitigation: break-glass; rapid rotation; session revocation; audit-log review.
- **SAML federation misconfiguration.** Mitigation: federation tested against samltest.id before pointing at real Shinhan IdP; rollback by removing the IdP entry.
- **Brute-force lockout false-positive during demo (e.g., a reviewer mistypes their password 5 times).** Mitigation: the recovery time is 60-second-to-15-minute exponential; admin can pre-clear the lockout.
- **Theme JAR incompatibility with Keycloak version upgrade.** Mitigation: theme rebuild is part of the upgrade checklist; staged upgrade.

## Definition of Done

- Keycloak deployed in staging with three realms.
- All configurations applied and tested.
- Custom themes verified.
- Audit events flowing to observability.
- Break-glass + SAML + onboarding runbooks published.
- Backup + DR working.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Keycloak does not train any AI on user data; this task does not introduce AI behaviour. The minimal-risk classification reflects that auth events flow into the observability store where they may eventually be queried by the engine's policy layer (P02-T03) for adaptive risk scoring; that future use would require a re-evaluation of risk class.

### Human Oversight
All auth flows have human users at the user end. Admin operations require MFA. Break-glass procedures require 2-eye approval. Audit events are reviewed nightly by ops.

### Failure Modes
If Keycloak is unavailable, all gated APIs return 503; existing session-token-bearing requests continue to work for the token's TTL (max 15 minutes for access tokens). If a user's MFA secret is lost, admin reset with audit; if compromised, break-glass.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: eng-sec authors and reviews; platform engineer reviews Helm config; design lead reviews theme integration; `@stephen-cheng` ratifies break-glass procedure.
