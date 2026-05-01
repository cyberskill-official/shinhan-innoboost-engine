---
title: "Skin and seed SVFC theme (SF9 surface)"
author: "@cyberskill-design-lead"
department: design
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: user_facing
eu_ai_act_risk_class: limited
target_release: "2026-07-24"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Skin the shared chat surface (P05-T01) with the SVFC slate theme from the brand-surface package (P00-T03), seed it with sample questions geared to MIS-style consumer-finance reporting, configure persona sandboxes (login as MIS lead / collections manager / CFO with different RBAC scopes), and integrate against the SVFC synthetic dataset (P03-T01). The SF9 surface is what Shinhan Vietnam Finance Company reviewers will see first; it is the demo's most-likely shortlist conversion target per the strategy guidance.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"the conversational AI layer that lets management ask in natural language and get an audited answer in seconds — the exact 'vibe coding for reporting' pattern SF9 names" — CyberSkill SF9 form answer
"50–80% reduction in MIS reporting cycle time (industry benchmark) — decision velocity from days to minutes" — CyberSkill SF9 form answer
</untrusted_content>

## Problem

A surface skinned with the wrong brand-fit reads as wrong. The SVFC environment is consumer-finance — warmer than the Bank's institutional palette, more accessible than Securities' analytical austerity. The SF9 brief explicitly asks for self-service BI for "non-technical management"; the surface must feel approachable.

Specific gaps if we shortcut:

- **Without SVFC-themed visual surface, the demo reads as generic.**
- **Without SF9-relevant sample questions on the landing screen, reviewers don't know where to start.**
- **Without persona sandboxes, RBAC + sensitivity-tier behaviour is invisible to reviewers.**
- **Without integration against the SVFC dataset, answers are empty.**

## Proposed Solution

A SVFC-themed surface deployed at `svfc-staging.shinhan-innoboost.cyberskill.world` (and equivalent on-prem deployment for rehearsals), configured with: SVFC slate theme; SVFC-specific sample questions; three persona sandboxes; integration against `data/svfc/` warehouse (P03-T01). Setup target: 14 days from task assignment after P05-T01.

### Subtasks

- [ ] **Apply SVFC slate theme.** Set `data-theme="svfc"`; verify all components render with SVFC-slate primary, SVFC-orange accent, warm-grey surface.
- [ ] **Seed landing-screen sample questions.** Five questions visible on the empty state, each clickable to populate the chat input:
  - "What was total disbursement in March 2026 by branch?"
  - "Show me NPL trend over the last 6 months."
  - "Top 10 collections officers by recovery rate this month."
  - "Compare consumer-loan vs credit-card disbursement Q1 2026 vs Q4 2025."
  - "Which provinces had the fastest deposit growth in the past quarter?"
- [ ] **Configure persona sandboxes.** Three demo personas:
  - **MIS Lead** — `analyst` role; can read all metrics including Restricted with elevation; can pin dashboards.
  - **Collections Manager** — `analyst` role scoped to collections + customers; cannot see treasury or P&L.
  - **CFO** — `admin` role; can read everything including audit log surface.
  - Each persona has a "Login as" button on the landing screen for demo purposes; in production, normal auth flow.
- [ ] **Configure SVFC dataset integration.** Engine connects to `data/svfc/` Postgres warehouse; metric registry (P02-T01) seeded with 20+ SVFC-specific metrics.
- [ ] **Verify Vietnamese rendering on SVFC-specific terms.** Sample: "Doanh số giải ngân quý 4 năm 2025"; verify diacritics render correctly.
- [ ] **Configure SVFC-specific HITL banner copy.** When HITL routes for SVFC, the banner uses SVFC-tone language: friendly but professional.
- [ ] **Configure SVFC-specific empty / refusal copy.** Same — warmer than Bank, less terse than Securities.
- [ ] **Build SVFC dashboard panel templates.** Pre-configured dashboards: "Daily MIS Summary" (top metrics for MIS team); "Collections Hub" (collections-specific metrics); "Executive Snapshot" (CFO view).
- [ ] **Verify visual against the brand-surface Storybook** (P00-T03); no theme-specific component overrides.
- [ ] **E2E test against SVFC dataset.** Run the gold-set's SVFC subset (P04-T01); verify ≥ 95% accuracy.

### Acceptance criteria

- SVFC theme applied; visual verification matches Storybook.
- Five seed sample questions visible.
- Three persona sandboxes operational.
- Engine integrated against SVFC dataset; gold-set ≥ 95% accuracy.
- Vietnamese rendering verified.
- SVFC-specific copy in place.
- Dashboard panel templates seeded.

## Alternatives Considered

- **Single demo persona instead of three.** Rejected: persona swap demonstrates RBAC + sensitivity-tier behaviour; without it, those features are invisible.
- **Skip dashboard panel templates.** Rejected: pinned-question pattern is a daily-driver showcase; templates seed the demo experience.
- **Use the same sample questions across all three BUs.** Rejected: per-BU questions show domain awareness.

## Success Metrics

- **Primary**: SF9 surface deployed, gold-set passing, within 14 days after P05-T01.
- **Guardrail**: Zero theme-specific component overrides (verified by grep in P00-T03 governance).

## Scope

### In scope
- SVFC theme application.
- Seed sample questions.
- Three persona sandboxes.
- Dataset integration.
- Dashboard panel templates.
- Bilingual rendering verification.

### Out of scope
- Other BU themes (P05-T03, P05-T04).
- Real SVFC data (post-kickoff).
- New components beyond what P05-T01 ships.

## Dependencies

- **Upstream**: P05-T01 (chat surface), P00-T03 (brand surface), P02-T01 (registry with SVFC metrics), P03-T01 (SVFC dataset), P04-T01 (gold-set with SVFC subset).
- **Downstream**: P12-T01 (SF9 pitch deck demos this surface), P12-T02 (run-of-show).
- **People**: design lead theming; engineer integrating; founder approving sample questions for credibility.

## Open Questions

- Q1: For persona-swap demo, should the surface allow switching mid-session? Recommendation: yes; clear tab to switch demonstrates the contrast.
- Q2: Sample questions — should the founder approve? Recommendation: yes; founder spot-check.

## Implementation Notes

- Persona sandbox uses pre-configured Keycloak (P01-T06) accounts, not bypass.
- Dashboard panel templates ship as JSON; users can copy and edit.
- Sample questions stored in localised JSON; Vietnamese variants included.

## Test Plan

- Test 1: Theme verification — all components render with SVFC tokens.
- Test 2: Persona swap — login as each, verify visible metrics and accessible features.
- Test 3: Gold-set SVFC subset — ≥ 95% accuracy.
- Test 4: Dashboard panel templates render correctly.
- Test 5: Vietnamese rendering — sample VN questions render.

## Rollback Plan

- Bad theme application rolled back via revert; UI redeploys with previous theme.
- Bad sample questions are corrected via PR.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Theme integration | `ui/themes/svfc/` | Design lead | Continuous |
| Sample questions | `ui/locales/svfc-questions.{en,vi}.json` | Design lead | Continuous |
| Persona sandbox config | `infra/keycloak/realms/svfc.json` | Eng-sec | Continuous |
| Dashboard templates | `ui/dashboards/svfc/` | Design lead | Continuous |

## Operational Risks

- **Theme renders unexpectedly on iPad.** Mitigation: P00-T03 mobile-responsive; CI tests.
- **Sample question references a metric not in registry.** Mitigation: validation in CI.
- **Persona sandboxes leak data across personas.** Mitigation: RBAC enforced (P01-T07); test verifies.

## Definition of Done

- SF9 surface deployed; gold-set passing.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Surface displays answers from the engine; engine consumes SVFC synthetic dataset. No customer data.

### Human Oversight
Persona-mediated demo; founder approves sample questions; SF9 reviewers see the surface in context.

### Failure Modes
- Theme misapplied: visual regression test catches.
- Sample question fails: gold-set test catches.
- Persona scope wrong: RBAC test catches.

## Sales/CS Summary

The SVFC surface is purpose-built for Shinhan Vietnam Finance Company management: warm visual tone, MIS-style sample questions on the landing page, three personas (MIS Lead, Collections Manager, CFO) showing different access levels, and integrated against synthetic data realistic to consumer finance in Vietnam. A reviewer can click "Login as MIS Lead" and immediately see how a daily MIS user would experience the system.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: design lead theming; engineer integrating; founder approves sample questions.
