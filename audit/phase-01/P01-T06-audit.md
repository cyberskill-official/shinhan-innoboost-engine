# Audit Report — P01-T06: Auth Service (Keycloak)

> **Audit Date**: 2026-05-02
> **FR Status**: `draft` | **Recommended Status**: `in_progress`
> **Verdict**: ⚠️ **PARTIALLY DONE** — `engine/auth/keycloak.config.ts` exists (148 lines) with programmatic Keycloak configuration. But zero deployment infrastructure: no Keycloak Helm values, no realm exports, no custom theme JARs, no break-glass runbook, no SAML federation doc, no staging deployment. The configuration code is a blueprint, not a running service.

---

## 1. Acceptance Criteria Verification

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| AC-1 | Keycloak deployed in staging via Helm | ❌ FAIL | No Keycloak Helm values in `infra/helm/`. No Keycloak subchart. No staging cluster to deploy to. |
| AC-2 | Three realms (`svfc`, `bank`, `securities`) created with documented configuration | ⚠️ PARTIAL | `engine/auth/keycloak.config.ts` (148 lines) contains programmatic realm configuration. But **zero realm export JSON files** in `infra/keycloak/realms/` (directory has 0 files). Realms are defined in code but not deployed or exported. |
| AC-3 | MFA mandatory in all realms; verified by attempting password-only login | ❌ FAIL | MFA configuration may be authored in `keycloak.config.ts` but **no running Keycloak** to test against. |
| AC-4 | OAuth public + confidential clients created per realm; verified by sample login flow | ❌ FAIL | Client configuration likely in `keycloak.config.ts` but no running instance to verify. |
| AC-5 | SAML adapter pre-staged; documentation for federation wire-up published | ❌ FAIL | `docs/runbooks/saml-federation.md` does not exist. |
| AC-6 | Custom themes per realm; verified visually against brand-surface package | ❌ FAIL | No theme JAR files. No theme integration. |
| AC-7 | Audit events forwarded to central observability store; verified by sample event landing | ❌ FAIL | No event listener extension. No observability integration. |
| AC-8 | Break-glass procedure documented and dry-run-tested | ❌ FAIL | `docs/runbooks/keycloak-break-glass.md` does not exist. |
| AC-9 | Realm exports running nightly | ❌ FAIL | No realm export workflow. `infra/keycloak/realms/` is empty. |
| AC-10 | Rate limiting and brute-force lockout verified by load test | ❌ FAIL | No Keycloak deployment to test. |

**Acceptance Criteria Score: 0/10 PASS, 1/10 PARTIAL, 9/10 FAIL**

---

## 2. Test Plan Verification

| Test | Description | Executed? | Result |
|------|-------------|-----------|--------|
| Test 1 | Login flow — open svfc-ui realm login; log in; complete TOTP; verify session | ❌ Not executed | No Keycloak running. |
| Test 2 | MFA bypass attempt — password-only via OAuth; verify rejection | ❌ Not executed | No Keycloak running. |
| Test 3 | SAML adapter — point at samltest.id; verify federation | ❌ Not executed | No adapter configured. |
| Test 4 | OAuth confidential client — call API with client-credentials token; verify access + TTL | ❌ Not executed | No clients deployed. |
| Test 5 | Audit event forwarded — login/logout; verify events in observability store in 60s | ❌ Not executed | No event listener. |
| Test 6 | Break-glass dry run — execute procedure on dev; verify recovery; capture timing | ❌ Not executed | No runbook, no dev Keycloak. |
| Test 7 | Brute-force lockout — 6 failed attempts; verify lockout; verify recovery on cooldown | ❌ Not executed | No Keycloak running. |
| Test 8 | Realm export/import — export svfc; import to fresh instance; verify identical | ❌ Not executed | No realm exports. |

**Test Plan Score: 0/8 executed**

---

## 3. Success Metrics Verification

| Metric | Target | Status | Measurement |
|--------|--------|--------|-------------|
| Primary | Full Keycloak with 3 realms within 14 days; end-to-end login → MFA → API call across all realms | ❌ NOT MET | Code blueprint only; no deployment. |
| Guardrail | Zero auth-bypass in staging/production-rehearsal during engagement | 🔒 N/A | No staging auth service exists. |

---

## 4. Definition of Done Verification

| # | Criterion | Status |
|---|-----------|--------|
| DoD-1 | Keycloak deployed in staging with three realms | ❌ Code only |
| DoD-2 | All configurations applied and tested | ❌ |
| DoD-3 | Custom themes verified | ❌ |
| DoD-4 | Audit events flowing to observability | ❌ |
| DoD-5 | Break-glass + SAML + onboarding runbooks published | ❌ All 3 missing |
| DoD-6 | Backup + DR working | ❌ |
| DoD-7 | FR ticket marked Done | ❌ |

---

## 5. Subtask Verification

| Subtask | Status | Notes |
|---------|--------|-------|
| Choose Keycloak deployment shape | ⚠️ PARTIAL | Programmatic config suggests Keycloak 25.x. No formal decision document. |
| Author Keycloak Helm values | ❌ FAIL | No Keycloak values in Helm chart. |
| Bootstrap Keycloak admin | ❌ FAIL | No admin bootstrap. |
| Create three realms | ⚠️ PARTIAL | Defined in `keycloak.config.ts` but not deployed. |
| Configure MFA enforcement | ⚠️ PARTIAL | Likely in config code. Not deployed/tested. |
| Configure OAuth public clients | ⚠️ PARTIAL | Likely in config code. Not deployed/tested. |
| Configure OAuth confidential clients | ⚠️ PARTIAL | Likely in config code. Not deployed/tested. |
| Configure SAML adapter | ❌ FAIL | No adapter config. No `saml-federation.md`. |
| Configure custom theme | ❌ FAIL | No theme JARs. |
| Configure per-realm branding | ❌ FAIL | No branding files. |
| Configure audit-event listener | ❌ FAIL | No SPI extension. |
| Author break-glass procedure | ❌ FAIL | `keycloak-break-glass.md` missing. |
| Configure backup and DR | ❌ FAIL | No backup configuration. |
| Configure rate limiting | ❌ FAIL | No rate limiting config. |
| Author user-onboarding flow | ❌ FAIL | `user-onboarding.md` missing. |
| Configure session management | ❌ FAIL | Not deployed. |
| Test end-to-end | ❌ FAIL | No running service. |

---

## 6. Existing Artefacts Inventory

| Expected Artefact | Path | Exists? | Content Quality |
|-------------------|------|---------|-----------------|
| Keycloak config module | `engine/auth/keycloak.config.ts` | ✅ Yes (148 lines) | Programmatic realm/client config |
| Helm values for Keycloak | `infra/helm/.../values-{env}.yaml` | ❌ No | — |
| Realm exports | `infra/keycloak/realms/{realm}.json` | ❌ No (dir empty) | — |
| Custom theme JAR | Internal artefact store | ❌ No | — |
| Audit-event listener JAR | Internal artefact store | ❌ No | — |
| Break-glass runbook | `docs/runbooks/keycloak-break-glass.md` | ❌ No | — |
| SAML federation runbook | `docs/runbooks/saml-federation.md` | ❌ No | — |
| User-onboarding runbook | `docs/runbooks/user-onboarding.md` | ❌ No | — |

---

## 7. Summary & Recommendation

**The auth service is ~10% complete.** A substantial Keycloak configuration file exists as TypeScript code (148 lines), which is a solid blueprint for realm, client, and MFA configuration. But auth is fundamentally a running service — code that defines realms is not the same as deployed realms. Zero runbooks, zero deployment, zero realm exports, zero themes.

**Recommended status**: `in_progress`

**To move to `done`**:
1. Add Keycloak Helm subchart with per-env values
2. Deploy Keycloak to staging cluster
3. Export realm JSON files to `infra/keycloak/realms/`
4. Author `keycloak-break-glass.md`, `saml-federation.md`, `user-onboarding.md`
5. Build custom theme JARs per BU realm
6. Configure audit-event listener SPI
7. Test end-to-end login flow with MFA
