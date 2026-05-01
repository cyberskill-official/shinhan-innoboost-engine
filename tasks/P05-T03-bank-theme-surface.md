---
title: "Skin and seed Bank theme (SB5 surface, HITL banner)"
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

Skin the shared chat surface (P05-T01) with the Bank navy theme; position the surface as a *complement* to Power BI rather than a replacement (the SB5 brief is sensitive on this); seed it with sample questions drawn from HO Department questions blocked by the ICT-Reporting bottleneck; ensure the HITL banner is visible and prominent on regulated-tier questions; integrate against the Bank synthetic dataset (P03-T02). The SB5 surface is the highest-stakes interview demo because the HITL pattern is the explicit Bank requirement; it must showcase HITL by design.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"Power BI tool has limited access for ICT-Reporting Team only. Not widely used among the bank." — Bank brief (paraphrased from CyberSkill SB5 form answer)
"Power BI stays in place; we supplement it with a conversational layer above the same warehouse" — CyberSkill SB5 form answer
"HITL reviewer queue with approval flow and per-decision audit log" — CyberSkill SB5 form answer
</untrusted_content>

## Problem

The SB5 brief explicitly requires HITL; the surface must demonstrate it visibly. The Form Answer also positions us as complement-not-replacement to Power BI; the surface's framing must reflect that — text, sample questions, and the landing page must reinforce "we serve HO Departments today blocked by Power BI's limited access" not "we replace Power BI".

Specific gaps if we shortcut:

- **Without Bank navy theme, surface reads as wrong-environment.**
- **Without "complement to Power BI" framing, we accidentally pitch as a replacement (politically risky).**
- **Without HO-Department-relevant sample questions, the brief's "limited access" pain point is unaddressed.**
- **Without prominent HITL banner, the wedge is invisible.**
- **Without integration to Bank dataset, answers are empty.**

## Proposed Solution

A Bank-themed surface deployed at `bank-staging.shinhan-innoboost.cyberskill.world`, configured with: Bank navy theme; "supplement to Power BI" framing in landing copy; sample questions geared to HO Departments; prominent HITL banner; integration against `data/bank/` (P03-T02). Setup target: 14 days after P05-T01.

### Subtasks

- [ ] **Apply Bank navy theme.** Set `data-theme="bank"`; verify all components.
- [ ] **Author "complement to Power BI" framing.** Landing page copy: "Ask in natural language. Get the same data as Power BI, but conversational. Power BI continues for dashboards; we serve HO Department questions Power BI can't reach."
- [ ] **Seed landing-screen sample questions.** Five questions geared to HO Departments:
  - "Compare branch P&L by quarter for the last 2 years."
  - "Which branches grew deposits fastest in HCMC?"
  - "Show forex exposure trend on USD/VND."
  - "What customer complaints categorise as 'ATM issue' this month?"
  - "Operational incidents in the past 30 days by severity."
- [ ] **Configure persona sandboxes.** Three personas:
  - **HO Department Analyst** — `analyst` role; accesses Internal-tier metrics; restricted from treasury / FX without elevation.
  - **Branch Manager** — `analyst` role scoped to their own branch.
  - **Risk Officer** — `admin` role; full access; HITL surface visible.
- [ ] **Configure HITL banner prominence.** When a question routes to HITL, the banner is the dominant visual element; status updates render live (P06 wiring).
- [ ] **Author HITL-specific copy.** Banker-appropriate: "Your question requires reviewer approval. Reviewer SLA: 30 minutes. The reviewer will receive your question and approve, edit, or refuse with reason."
- [ ] **Integrate against Bank dataset.** Engine connects to `data/bank/`; metric registry seeded with 20+ Bank-specific metrics.
- [ ] **Configure Bank-specific dashboard templates.** Pre-configured: "HO Department Daily" (top metrics for HO Dept); "Branch Comparison" (P&L by branch); "Risk Snapshot" (FX exposure + NPL).
- [ ] **Verify visual + Vietnamese rendering** with Bank-specific terms.
- [ ] **E2E test against Bank dataset.** Gold-set Bank subset; verify ≥ 95% accuracy. Verify HITL routing fires on Restricted-tier questions.

### Acceptance criteria

- Bank theme applied.
- "Supplement to Power BI" framing visible.
- Five seed questions visible.
- Three persona sandboxes operational.
- HITL banner prominent and tested.
- Engine integrated against Bank dataset; gold-set passing.
- Dashboard panels seeded.

## Alternatives Considered

- **Position as Power BI replacement.** Rejected: Bank brief signals sensitivity; we lose political room.
- **Skip the prominent HITL banner.** Rejected: it's the SB5 wedge.
- **Reuse SVFC sample questions.** Rejected: per-BU domain awareness matters.

## Success Metrics

- **Primary**: SB5 surface deployed within 14 days after P05-T01.
- **Guardrail**: HITL routing fires correctly on every Restricted-tier question in the gold-set Bank subset.

## Scope

### In scope
- Bank theme.
- Power-BI-complement framing.
- Sample questions.
- Persona sandboxes.
- HITL banner prominence + copy.
- Dataset integration.
- Dashboard templates.

### Out of scope
- Other BU themes.
- Real Bank data (post-kickoff).
- Power BI integration (out of scope; the framing stays at "complement", not "integrate").

## Dependencies

- **Upstream**: P05-T01, P00-T03, P02-T01, P03-T02, P04-T01 (Bank gold-set subset), P06-T02 (HITL queue).
- **Downstream**: P12-T01 (SB5 pitch deck), P12-T02 (run-of-show).
- **People**: design lead; engineer; founder approving framing.

## Open Questions

- Q1: Power BI logo / mention in our copy? Recommendation: text reference yes; no logo (avoid trademark issues).
- Q2: Sample questions visibility for personas — same five for all? Recommendation: filter by role; some questions only visible to roles with access.

## Implementation Notes

- HITL banner uses the brand's "warning" semantic colour (per P00-T03); positioned above the chat input when active.
- "Supplement to Power BI" copy reviewed by founder; this is politically sensitive.

## Test Plan

- Test 1: Theme verification.
- Test 2: HITL banner triggers on Restricted-tier question; verify reviewer notification (P06).
- Test 3: Gold-set Bank subset ≥ 95%.
- Test 4: Persona swap — verify scope boundaries.

## Rollback Plan

- Bad theme rolled back; bad framing corrected.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Theme integration | `ui/themes/bank/` | Design lead | Continuous |
| Sample questions | `ui/locales/bank-questions.{en,vi}.json` | Design lead | Continuous |
| HITL-specific copy | `ui/locales/bank-hitl.{en,vi}.json` | Design lead + founder | Continuous |
| Persona config | `infra/keycloak/realms/bank.json` | Eng-sec | Continuous |
| Dashboard templates | `ui/dashboards/bank/` | Design lead | Continuous |

## Operational Risks

- **HITL banner overshadows the answer.** Mitigation: visual review by design lead.
- **Power BI framing reads wrong way.** Mitigation: founder ratification.
- **Persona sandbox leaks across.** Mitigation: RBAC tests.

## Definition of Done

- SB5 surface deployed; gold-set passing; HITL prominent.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Engine + Bank synthetic dataset. No customer data.

### Human Oversight
HITL banner is the explicit human-oversight surface; reviewers act on routed questions. Persona swap demonstrates RBAC.

### Failure Modes
- HITL banner not surfacing: P06 integration test catches.
- Wrong scope per persona: RBAC test catches.

## Sales/CS Summary

The SB5 surface positions CyberSkill explicitly as a complement to Power BI: HO Departments who are blocked from Power BI today get instant conversational access to the same warehouse, while regulated questions automatically route to a human reviewer with full audit trail. Three demo personas — HO Department Analyst, Branch Manager, Risk Officer — show how access scopes correctly.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: design lead theming; engineer integrating; founder approves framing and HITL copy.
