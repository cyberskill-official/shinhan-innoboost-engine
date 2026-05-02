# Deep Audit — P05-T02: SVFC Theme Surface (SF9)

> **Auditor**: Antigravity Engine Audit  
> **Date**: 2026-05-02  
> **Status**: 🟡 PARTIALLY COMPLETE (~40%)  
> **Risk Level**: Medium-High  

---

## 1. Acceptance Criteria Audit

| # | Criterion | Status | Evidence | Gap |
|---|-----------|--------|----------|-----|
| AC-1 | SVFC theme applied; visual verification matches Storybook | 🟡 PARTIAL | `ui/themes/svfc/config.ts` (46 lines): BU name, logo path, favicon, surface code SF9. But **no CSS theme tokens** (colors, typography) and **no Storybook exists**. | CSS tokens + Storybook missing. |
| AC-2 | Five seed sample questions visible | ✅ PASS | `config.ts` exports `sampleQuestions` with 6 English + 6 Vietnamese questions. MIS-focused (NPL, disbursement, collections, KYC). | 6 questions (exceeds 5 requirement). |
| AC-3 | Three persona sandboxes operational | 🟡 PARTIAL | 3 personas defined: MIS Lead (analyst), Collections Manager (operations/collections), CFO (executive/full-restricted). But **no Keycloak config** and **no persona-swap UI**. | Keycloak integration missing. |
| AC-4 | Engine integrated against SVFC dataset; gold-set ≥95% accuracy | ❌ FAIL | No engine integration. `config.ts` has no API endpoint configuration. Gold-set not runnable. | No engine wiring. |
| AC-5 | Vietnamese rendering verified | 🟡 PARTIAL | Vietnamese questions present in config. `vi.json` locale complete. But **no rendering test** verifying diacritics. | Untested. |
| AC-6 | SVFC-specific copy in place | ✅ PASS | Config includes warm-tone sample questions relevant to consumer finance (MIS, collections, KYC, NPL). | — |
| AC-7 | Dashboard panel templates seeded | ✅ PASS | `ui/dashboards/templates.ts` exports 2 SVFC dashboards: "Portfolio Overview" (6 widgets), "Collections Performance" (5 widgets). Pin-question, metric-card, chart, table types. Daily digest schedule. | — |

**AC Summary**: 3/7 PASS, 3/7 PARTIAL, 1/7 FAIL.

---

## 2. Test Plan Audit

| # | Test | Status | Evidence | Gap |
|---|------|--------|----------|-----|
| TP-1 | Theme verification — all components render with SVFC tokens | ❌ NOT RUN | No CSS tokens. No Storybook. | Blocked. |
| TP-2 | Persona swap — login as each, verify visible metrics and accessible features | ❌ NOT RUN | No Keycloak. No persona-swap UI. | Blocked. |
| TP-3 | Gold-set SVFC subset — ≥95% accuracy | ❌ NOT RUN | No engine pipeline. | Blocked by P02+P03. |
| TP-4 | Dashboard panel templates render correctly | ❌ NOT RUN | No rendering. | Blocked by P05-T01 CSS. |
| TP-5 | Vietnamese rendering — sample VN questions render | ❌ NOT RUN | No UI rendering. | Blocked. |

**TP Summary**: 0/5 tests executed. **100% test debt.**

---

## 3–4. Success Metrics & Definition of Done

| Criterion | Met? | Notes |
|-----------|------|-------|
| SF9 surface deployed | ❌ | No deployment; no Next.js app |
| Gold-set passing | ❌ | No engine pipeline |
| Zero theme-specific component overrides | ✅ | Config-only approach; no component forks |
| Dashboard templates seeded | ✅ | 2 templates with 11 widgets total |
| Persona sandboxes operational | ❌ | Config only; no Keycloak/auth |

---

## 5. Code Quality Assessment

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Configuration** | 8/10 | Clean config with BU, personas, sample questions, dashboards. |
| **Bilingual** | 9/10 | Full en/vi support for all user-facing strings. |
| **Dashboard Templates** | 8/10 | Well-structured widget configs with grid spans, refresh intervals, pinned questions. |
| **Theme Tokens** | 0/10 | No CSS tokens (colors, typography, spacing). |
| **Integration** | 0/10 | No engine API, no Keycloak, no deployment config. |
| **Test Coverage** | 0/10 | Zero tests. |

---

## 6. Remediation Priorities

| Priority | Item | Effort | Dependency |
|----------|------|--------|------------|
| P0 | Create SVFC CSS theme tokens (colors, typography, spacing) | 4h | P00-T03 brand surface |
| P0 | Wire theme config → Next.js `data-theme="svfc"` | 2h | P05-T01 Next.js app |
| P1 | Create Keycloak realm config for 3 SVFC personas | 4h | P01-T06 Keycloak |
| P1 | Build persona-swap UI ("Login as" buttons on landing) | 3h | Auth integration |
| P1 | Wire engine API endpoint for SVFC dataset | 4h | P02 engine |
| P2 | Dashboard template rendering (grid layout + widget rendering) | 8h | P05-T01 UI |
| P2 | E2E gold-set test against SVFC surface | 4h | Full pipeline |
