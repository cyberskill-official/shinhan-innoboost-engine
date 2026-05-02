# Deep Audit — P05-T03: Bank Theme Surface (SB5)

> **Auditor**: Antigravity Engine Audit  
> **Date**: 2026-05-02  
> **Status**: 🟡 PARTIALLY COMPLETE (~40%)  
> **Risk Level**: Medium-High  

---

## 1. Acceptance Criteria Audit

| # | Criterion | Status | Evidence | Gap |
|---|-----------|--------|----------|-----|
| AC-1 | Bank theme applied (complement-to-BI positioning) | 🟡 PARTIAL | `ui/themes/bank/config.ts` (57 lines): BU name, logo, surface SB5. `complementBanner` explains positioning vs Power BI. But **no CSS tokens**. | CSS tokens missing. |
| AC-2 | Sample questions targeting HO departments blocked by ICT-Reporting | ✅ PASS | 6 en + 6 vi sample questions: profit, NPL by segment, SME vs Retail, FX position, top branches, incident trend. | — |
| AC-3 | Three persona sandboxes (Department Head, Risk Officer, CEO) | 🟡 PARTIAL | 3 personas defined in config. But **no Keycloak config** and **no persona-swap UI**. | Keycloak integration missing. |
| AC-4 | HITL configuration prominently featured | ✅ PASS | `hitlConfig` (L51-55): SLA 30 min, showBannerOnRegulated=true, autoRouteRestrictedTier=true. | — |
| AC-5 | Dashboard panel templates (P&L, Risk, Treasury) | ✅ PASS | `templates.ts` exports 2 Bank dashboards: "Bank P&L Overview" (6 widgets incl. alert-feed), "Risk Dashboard" (5 widgets). Weekly digest for P&L. | — |
| AC-6 | Engine integrated against Bank dataset | ❌ FAIL | No engine API configuration. | No wiring. |
| AC-7 | Gold-set Bank subset ≥95% accuracy | ❌ FAIL | No pipeline. | Blocked. |
| AC-8 | Bilingual verified | 🟡 PARTIAL | Vietnamese questions in config + locale file. No rendering test. | Untested. |

**AC Summary**: 3/8 PASS, 3/8 PARTIAL, 2/8 FAIL.

---

## 2. Test Plan Audit

| # | Test | Status | Evidence | Gap |
|---|------|--------|----------|-----|
| TP-1 | Theme rendering with Bank tokens | ❌ NOT RUN | No CSS, no Storybook. | Blocked. |
| TP-2 | Persona swap with sensitivity-tier demo | ❌ NOT RUN | No Keycloak. | Blocked. |
| TP-3 | HITL banner appears on regulated-tier queries | ❌ NOT RUN | Config set but no engine integration. | Blocked. |
| TP-4 | Gold-set Bank subset ≥95% | ❌ NOT RUN | No pipeline. | Blocked. |
| TP-5 | Complement-to-BI banner renders | ❌ NOT RUN | No rendering. | Blocked. |

**TP Summary**: 0/5 tests. **100% test debt.**

---

## 3. Code Quality Assessment

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Configuration** | 9/10 | Excellent BI-complement positioning. HITL config is smart (auto-route restricted tier). |
| **Bilingual** | 9/10 | Full en/vi for all user-facing strings including complement banner. |
| **Dashboard Templates** | 8/10 | Alert-feed widget type is unique to Bank. Good weekly digest schedule. |
| **Theme Tokens** | 0/10 | No CSS. |
| **Integration** | 0/10 | No engine, no Keycloak. |
| **Test Coverage** | 0/10 | Zero. |

---

## 4. Remediation Priorities

| Priority | Item | Effort | Dependency |
|----------|------|--------|------------|
| P0 | Create Bank CSS theme tokens | 4h | P00-T03 |
| P0 | Wire theme → Next.js `data-theme="bank"` | 2h | P05-T01 |
| P1 | Create Keycloak realm for 3 Bank personas | 4h | P01-T06 |
| P1 | Wire engine API for Bank dataset | 4h | P02 engine |
| P1 | Implement complement-to-BI banner component | 2h | P05-T01 |
| P2 | HITL auto-route integration test | 3h | P02-T06 |
