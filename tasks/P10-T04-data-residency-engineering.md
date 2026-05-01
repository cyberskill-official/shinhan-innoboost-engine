---
title: "Engineer per-tenant data residency for VN-hosted infra"
author: "@cyberskill-eng-sec"
department: engineering
status: draft
priority: p1
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: minimal
target_release: "2026-09-25"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Engineer per-tenant data residency: VN tenants live on VN-hosted infrastructure (Viettel IDC, VNPT IDC, FPT IDC, or on-prem in customer's own DC); non-VN tenants can live in regional cloud regions; tenant residency is a runtime property baked into infra provisioning + DNS + secrets + audit-log mirror locations. The residency engineering is the structural enforcement of `shinhanos_data_residency` memory note + PDPL Art. 16 cross-border requirements + likely SBV expectations. Without it, the multi-tenant story is "we hope nobody asks where the data lives".

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"strengthened governance under PDPL and the new Cybersecurity Law (effective 1 July 2026)" — CyberSkill SB5 form answer
</untrusted_content>

## Problem

Per the Innoboost Q&A and the new Cybersecurity Law, VN-tenant data residency is a hard requirement. Without engineering enforcement, residency is an honour-system claim.

Specific gaps if we shortcut:

- **Without per-tenant residency, VN-tenant data may end up in non-VN regions.**
- **Without VN-hosted infra options, the option is foreclosed.**
- **Without DNS routing per tenant, requests may flow through wrong region.**
- **Without audit-log mirror residency, log data crosses borders.**

The `shinhanos_data_residency` memory note mandates per-tenant residency for VN tenants.

The `feedback_p1_scope_preference` memory note biases us richer. For residency, "richer" means: per-tenant runtime residency property + VN-hosted infra options (Viettel/VNPT/FPT IDC) + DNS routing + secrets backend per residency + audit-log mirror per residency + admin UI surface.

## Proposed Solution

A residency-engineering layer:

1. **Per-tenant residency property.** Each tenant has `residency_region` (e.g., `vn-viettel-hcm`, `vn-vnpt-han`, `gcp-asia-southeast1`); set at tenant creation; immutable post-creation (migration is explicit task).
2. **VN-hosted infra options.** Documented integration with Viettel IDC, VNPT IDC, FPT IDC; deployment via on-prem bundle (P10-T03) into VN IDC.
3. **DNS routing.** Tenant-specific subdomains route to tenant's residency region.
4. **Per-residency secrets backend.** VN tenants use Vault on-prem; non-VN tenants can use Doppler.
5. **Per-residency audit-log mirror.** Cloud Storage Object Lock locations per residency.
6. **Admin UI surface.** Per-tenant residency view; migration request flow (admin-initiated; explicit).
7. **Migration runbook.** When a tenant changes residency (rare; explicit), step-by-step.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Add `residency_region` to tenant schema.** Postgres tenant table; required field at tenant creation.
- [ ] **Document VN-hosted infra options.** `compliance/cybersecurity-law/RESIDENCY_OPTIONS.md`: Viettel / VNPT / FPT IDC; specifications; cost estimate; integration approach (each is essentially a "deploy our on-prem bundle in their DC").
- [ ] **Configure DNS routing.** Tenant subdomain CNAME to residency-region ingress.
- [ ] **Configure per-residency secrets backend.** VN tenants → Vault on-prem (P10-T03); non-VN → Doppler.
- [ ] **Configure per-residency audit-log mirror.** Cloud Storage bucket region per residency.
- [ ] **Build admin UI for residency view.** In P05-T05 admin console: per-tenant residency; migration request flow.
- [ ] **Author migration runbook.** `docs/runbooks/residency-migration.md`: when, how, by whom; data flow during migration; outage window.
- [ ] **Document for customer engineers.** Customer-facing residency policy; what data lives where; how to verify.
- [ ] **Cross-reference with P08-T01 PDPL + P08-T02 Cybersecurity Law mappings.**
- [ ] **Test with a sample VN-tenant configuration.** Verify all data flows to VN region.

### Acceptance criteria

- Per-tenant residency property in tenant schema.
- VN-hosted infra options documented.
- DNS routing per residency operational.
- Per-residency secrets + audit-log mirror configured.
- Admin UI surface live.
- Migration runbook published.
- Customer-facing residency doc available.
- Sample VN-tenant test passes.

## Alternatives Considered

- **Single-region for all tenants.** Rejected: violates `shinhanos_data_residency` memory note.
- **Skip migration runbook; treat residency as immutable.** Rejected: rare but real cases (acquisition, regulatory change) require migration.
- **Cloud-region only (no VN IDC integration).** Rejected: VN-banking customers may require fully-in-country infra.

## Success Metrics

- **Primary**: Per-tenant residency operational within 14 days; sample VN-tenant verified.
- **Guardrail**: Zero residency-violation events (data in wrong region) during the engagement.

## Scope

### In scope
- Schema + DNS + secrets + audit + admin UI + runbook + customer-facing doc.

### Out of scope
- Actual customer deployment in Viettel/VNPT/FPT IDC (post-kickoff; this task documents the option).
- Per-tenant cluster (deferred unless needed).
- Cross-region data sharing for cross-tenant analytics (out of scope).

## Dependencies

- **Upstream**: P01-T04 (IaC residency support); P10-T02 + P10-T03 (deployment targets); P02-T07 (PDPL); P02-T09 (audit log); P05-T05 (admin UI).
- **Downstream**: P11-T04 (compliance dossier); P13-T04 (kickoff infrastructure).
- **People**: eng-sec authoring; legal lead reviewing residency claims; ops lead reviewing operational concerns.

## Open Questions

- Q1: Migration runbook — outage window? Recommendation: scheduled maintenance window; backup-and-restore based; documented.
- Q2: Cross-region disaster recovery for VN tenants — within VN regions only? Recommendation: yes; secondary VN IDC.
- Q3: For non-VN tenants, default region? Recommendation: GCP asia-southeast1.

## Implementation Notes

- Residency-region values are documented enum; expansion requires legal review (data-protection regime per region).
- DNS routing uses Cloud DNS with per-tenant CNAME; tenant subdomain → residency-region ingress.
- Audit-log mirror Cloud Storage Object Lock; per-residency bucket; access by region.
- Vault deployed in each on-prem IDC; admin-managed.

## Test Plan

- Test 1: Sample VN-tenant created; verify all infrastructure (cluster, DB, audit log) in VN.
- Test 2: Sample non-VN-tenant; verify in default cloud region.
- Test 3: Migration test (sample) — move from one VN region to another VN region; verify success + zero data loss.
- Test 4: Residency violation simulation — try to flow VN data to non-VN; verify rejection.
- Test 5: Admin UI shows correct residency.

## Rollback Plan

- Bad residency assignment is rolled back via tenant-config update + data migration.
- Bad migration is rolled back via PITR (P01-T09).

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Tenant schema | Postgres | Eng-sec | Continuous |
| Residency-options doc | `compliance/cybersecurity-law/RESIDENCY_OPTIONS.md` | Compliance lead | Continuous |
| Migration runbook | `docs/runbooks/residency-migration.md` | Eng-sec | Continuous |
| Customer-facing residency policy | `compliance/customer-policies/RESIDENCY.md` | Sales lead + compliance lead | Continuous |
| Admin UI surface | Admin console (P05-T05) | Eng-sec | Continuous |

## Operational Risks

- **Misconfigured tenant residency.** Mitigation: required at tenant creation; immutable; admin UI verification.
- **VN IDC outage.** Mitigation: secondary VN IDC for HA; documented failover procedure.
- **Migration causes data loss.** Mitigation: backup before migration; PITR for recovery.
- **Audit-log mirror in wrong region.** Mitigation: per-residency bucket configured at tenant creation; verified.

## Definition of Done

- All deliverables in place; sample VN-tenant tested.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Tenant configuration; no AI training.

### Human Oversight
Eng-sec authors residency engineering; legal lead reviews; founder approves new residency-region additions.

### Failure Modes
- Wrong residency assignment: caught at admin UI verification.
- Cross-border flow detected: P02-T07 minimisation rejects + audit-log entry.
- Migration failure: PITR + retry.

## Sales/CS Summary

CyberSkill engineers per-tenant data residency: every tenant has a residency region set at creation and structurally enforced at runtime. VN tenants live on VN-hosted infrastructure — Viettel IDC, VNPT IDC, FPT IDC, or fully on-prem in the customer's data centre. DNS, secrets, and audit-log mirror locations all respect residency. PDPL cross-border obligations and the Cybersecurity Law's localisation requirements are satisfied by structure, not policy. Residency migrations are explicit, audit-logged operations.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: eng-sec authors implementation; legal lead reviews residency claims; sales lead reviews customer-facing doc.
