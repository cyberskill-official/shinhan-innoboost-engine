---
title: "Build ISO 27001 + ISO 42001 + SOC 2 control-mapping registry"
author: "@cyberskill-compliance-lead"
department: operations
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-09-04"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Build the international-standards control-mapping registry: ISO 27001:2022 (information security management), ISO 42001:2023 (AI management system), SOC 2 Type II (Trust Services Criteria). Each standard's controls × CyberSkill task or runbook that satisfies it × evidence pointer × audit-readiness status. The registry is the single artefact a Shinhan procurement / compliance team uses to score our "international standards readiness". ISO 42001 is the differentiator — few VN startups have a credible AI-management-system story; ours is the structural enforcement.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"ISO 27001 control mapping (which controls are in place, which are roadmap)" — paraphrased from CyberSkill compliance scope (per demo-build-plan.md Phase 8)
"ISO 42001 (AI management system) control mapping — given Shinhan's appetite for AI, this is a wedge" — paraphrased from demo-build-plan.md
</untrusted_content>

## Problem

The Innoboost Q&A's evaluation criteria (Section V.4) prioritise commercial readiness; international-standards conformance is a strong commercial-readiness signal. Without a control-mapping registry, we appear unready; with it, we appear adult.

Specific gaps if we shortcut:

- **Without ISO 27001 mapping, our security posture is unprovable to a procurement team.**
- **Without ISO 42001 mapping, our AI-management posture is unique-but-unverified.**
- **Without SOC 2 control mapping, we are uncompetitive vs. SaaS-track competitors.**
- **Without audit-readiness status (in-place / partial / roadmap), the registry is honest but unactionable.**
- **Without per-control evidence pointer, claims are unverifiable.**

The `feedback_p1_scope_preference` memory note biases us richer. For ISO/SOC, "richer" means: all three standards mapped + per-control task ID + evidence pointer + readiness status (in-place / partial / roadmap with target) + quarterly review + admin UI surface.

## Proposed Solution

A control-mapping registry in `compliance/iso-soc/`:

1. **ISO 27001 mapping** at `compliance/iso-soc/ISO_27001.md`. All Annex A controls; per-control: task / runbook reference, evidence pointer, status.
2. **ISO 42001 mapping** at `compliance/iso-soc/ISO_42001.md`. All Annex A controls; same shape.
3. **SOC 2 mapping** at `compliance/iso-soc/SOC_2.md`. All Trust Services Criteria; same shape.
4. **Cross-mapping** at `compliance/iso-soc/CROSS_MAP.md`. Controls common across multiple standards (e.g., access control); single CyberSkill control satisfies multiple standards.
5. **Audit-readiness summary** at `compliance/iso-soc/READINESS.md`. Per-standard rollup: % in-place, % partial, % roadmap.
6. **Quarterly review** aligned with PDPL/Cybersecurity/SBV cadence.

Setup target: 21 days from task assignment.

### Subtasks

- [ ] **Inventory ISO 27001:2022 Annex A controls.** 93 controls across 4 themes (Organisational, People, Physical, Technological). Per-control mapping.
- [ ] **Inventory ISO 42001:2023 Annex A controls.** AI management system specifics: AI policy, AI risk management, AI design + development, AI use, AI third-party relationships. Per-control mapping.
- [ ] **Inventory SOC 2 Trust Services Criteria.** Common Criteria + optional Trust Services (Availability, Processing Integrity, Confidentiality, Privacy). Per-criterion mapping.
- [ ] **Map controls → CyberSkill tasks / runbooks.** Each control references a specific FR (e.g., "ISO 27001 A.5.16 → P01-T07 RBAC") + an evidence pointer (e.g., "audit log query pattern X").
- [ ] **Identify gaps.** Controls where current implementation is partial or roadmap; document remediation plan + target date.
- [ ] **Author audit-readiness summary.** Per-standard: count of in-place / partial / roadmap controls; % readiness; gap list with prioritised remediation.
- [ ] **Author cross-mapping.** Identify controls that overlap across standards (~30% of controls); document the single CyberSkill control that satisfies multiple.
- [ ] **Schedule quarterly review.** Aligned cadence; PM owns.
- [ ] **Brief the squad.** 30-min ISO/SOC primer.
- [ ] **Cross-reference with P11-T04 compliance dossier.**
- [ ] **Surface in admin UI** (P05-T05): readiness dashboard.

### Acceptance criteria

- All three standards mapped with full control coverage.
- Cross-mapping in place.
- Audit-readiness summary published.
- Quarterly review scheduled.
- Admin UI surface live.
- Squad briefed.

## Alternatives Considered

- **Skip ISO 42001; rely on ISO 27001 + SOC 2.** Rejected: ISO 42001 is the AI-specific differentiator; given Shinhan's AI appetite, it's high-leverage.
- **External audit before internal mapping.** Rejected: external audits cost months + dollars; internal mapping is the prerequisite.
- **Skip cross-mapping.** Rejected: cross-mapping prevents duplicate work in implementation; useful structurally.
- **Defer to post-PoC.** Rejected: international-standards conformance is exactly the "commercial readiness" signal the form answers commit to.

## Success Metrics

- **Primary**: All three mappings within 21 days; ≥ 60% controls in-place (rest partial / roadmap with documented timeline).
- **Guardrail**: Quarterly review on schedule; readiness % increases over time.

## Scope

### In scope
- Three control mappings + cross-mapping + readiness summary + admin dashboard + quarterly review + squad briefing.

### Out of scope
- External certification audit (post-PoC; certification is a future-state).
- Other standards (PCI-DSS, HIPAA — out of scope for VN financial context).

## Dependencies

- **Upstream**: P01-T01..T10 (foundation security controls); P02-T01..T09 (engine controls); P02-T07 (PDPL); P08-T01..T03 (regional regulations); P11-T04 (dossier index).
- **Downstream**: P11-T04 (dossier consumes registry).
- **People**: compliance lead authoring; legal lead reviewing; founder ratifying gap-remediation timeline.

## Open Questions

- Q1: ISO 42001 — full Annex A coverage or selected high-impact subset for v1? Recommendation: full coverage; avoid cherry-picking.
- Q2: For SOC 2, which optional TSCs do we adopt? Recommendation: Common Criteria + Privacy + Confidentiality + Availability; defer Processing Integrity.
- Q3: For external certification, when? Recommendation: post-PoC; estimated 6 months for SOC 2 Type I, 18 months for Type II.

## Implementation Notes

- Mapping format: tabular Markdown; columns: Control ID, Control Name, CyberSkill Reference, Evidence, Status, Target.
- Cross-mapping: separate document with "this control satisfies ISO 27001 A.X + ISO 42001 B.Y + SOC 2 CC.Z".
- Admin UI dashboard (P05-T05) consumes the registry; renders as a heatmap (green/amber/red per control).

## Test Plan

- Test 1: Mapping completeness — all controls covered.
- Test 2: Evidence pointers resolve to real artefacts.
- Test 3: Readiness summary computes correctly.
- Test 4: Cross-mapping accurate (sampled controls verified to satisfy all listed standards).
- Test 5: Admin UI dashboard renders.

## Rollback Plan

- Bad mapping rolled back via PR; quarterly review identifies drift.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| ISO 27001 mapping | `compliance/iso-soc/ISO_27001.md` | Compliance lead | Continuous |
| ISO 42001 mapping | `compliance/iso-soc/ISO_42001.md` | Compliance lead | Continuous |
| SOC 2 mapping | `compliance/iso-soc/SOC_2.md` | Compliance lead | Continuous |
| Cross-mapping | `compliance/iso-soc/CROSS_MAP.md` | Compliance lead | Continuous |
| Readiness summary | `compliance/iso-soc/READINESS.md` | Compliance lead | Continuous |
| Quarterly review records | `docs/audit/iso-soc-reviews/{date}.md` | Compliance lead | 7 years |

## Operational Risks

- **Standard updates (ISO publishes new revision).** Mitigation: quarterly review; subscribe to ISO standards publication notifications.
- **Misinterpretation of control intent.** Mitigation: legal-lead review; cross-reference industry guidance.
- **Gap not addressed by target date.** Mitigation: founder ratification of gap timeline; quarterly status check.

## Definition of Done

- All deliverables published; admin dashboard live; squad briefed.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Compliance task; no AI training. Documents controls. ISO 42001 specifically governs AI management; this task documents how the engine's AI use complies.

### Human Oversight
Compliance lead + legal lead author; founder ratifies; quarterly review.

### Failure Modes
- Control missed: legal review or quarterly review catches.
- Evidence pointer broken: PR fixes.
- Gap timeline slip: founder ratifies revised timeline; documented.

## Sales/CS Summary

CyberSkill's international-standards control-mapping registry covers ISO 27001:2022 (information security), ISO 42001:2023 (AI management — the differentiator), and SOC 2 Type II Trust Services Criteria. Every control is mapped to a specific CyberSkill task or runbook with evidence pointer and audit-readiness status. The registry is the single artefact a Shinhan procurement team uses to score us against multinational benchmarks; ISO 42001 in particular shows we run AI as a managed system, not a science experiment.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: compliance lead authors with legal-lead review; founder ratifies.
