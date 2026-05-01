---
title: "Build air-gapped on-prem deployment bundle and sizing guide"
author: "@cyberskill-eng-sec"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: not_ai
target_release: "2026-09-18"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Build the on-prem air-gapped deployment bundle: a single tarball containing all Helm charts, container images, model weights (Qwen-72B AWQ Q4), Terraform-equivalent for bare-metal Kubernetes (k3s), Postgres + Redis + Keycloak + observability, Vault for secrets (replacing Doppler), all with reproducible build manifest (SBOM + signatures). Plus a sizing guide for small / medium / large tenant footprints (CPU + GPU + storage + network); install + operate runbook; air-gap-aware update procedure (no internet egress required). The on-prem deployment is the structural answer to the Innoboost Q&A's "deployed per SBV regulations" — without it, commercialisation in Vietnamese banking is foreclosed.

## Customer Quotes

<untrusted_content source="innoboost_qa_excerpt">
"the commercial phase might require on-premise hosting based on the requirements from SBV" — Innoboost Q&A Section VI.4
"you can use cloud environments with masked data. However, for full commercialization, the solution must be deployed per SBV regulations." — Innoboost Q&A Section VI.3
</untrusted_content>

## Problem

The Innoboost Q&A flags on-prem as the commercialisation gate. Without an air-gap-ready bundle, every commercial conversation post-PoC stalls on "we need a few months to build that". With it, we walk in with the answer.

Specific gaps if we shortcut:

- **Without air-gap bundle, on-prem deployment requires internet egress — which a banking customer may not allow.**
- **Without all model weights pre-bundled, the offline LLM path doesn't work.**
- **Without bare-metal k8s baseline, every customer's installation is bespoke.**
- **Without sizing guide, customers under-provision and the system fails.**
- **Without air-gap update procedure, customers are stuck on the version we shipped.**

The `cyberos_data_residency` memory note mandates VN-tenant residency; on-prem inside the customer's data centre is the structural enforcement.

The `feedback_p1_scope_preference` memory note biases us richer. For on-prem, "richer" means: full bundle + reproducible builds + bare-metal k8s baseline (k3s) + Vault for secrets + sizing guide for 3 tiers + install runbook + operate runbook + update procedure + verification harness.

## Proposed Solution

An on-prem deployment bundle in `infra/onprem/`:

1. **Air-gap tarball.** All Helm charts; all container images (loaded into local registry on install); Qwen-72B AWQ Q4 weights; k3s binaries; Postgres / Redis / Keycloak / Vault / OpenSearch + observability images; install scripts.
2. **Reproducible build manifest.** SBOM + signatures per artefact; verifiable post-install.
3. **Bare-metal k8s baseline.** k3s primary; kubeadm alternative for larger clusters; Calico CNI; MetalLB for LB; Longhorn for storage; cert-manager; ingress-nginx.
4. **Vault** replaces Doppler for on-prem secrets management; same envelope for consumer code.
5. **Sizing guide.** Small (1× server, 32 cores, 128 GB RAM, 1 TB NVMe, 1× H100); Medium (3× HA, 64 cores each, 2× H100); Large (5+ HA, 96 cores, 4× H100).
6. **Install runbook.** Step-by-step from bare-metal box to running engine.
7. **Operate runbook.** Backup, upgrade, scale, decommission.
8. **Air-gap update procedure.** Customer pulls update tarball from CyberSkill via secure transfer; verifies signatures; offline upgrade.
9. **Post-install verification harness.** Sample-questions test; smoke-test that all services running.

Setup target: 21 days from task assignment.

### Subtasks

- [ ] **Build air-gap tarball pipeline.** CI job that packages: Helm charts (P01-T04); all Docker images (saved as `docker save`); model weights; k3s binary; install scripts; SBOMs.
- [ ] **Implement local registry on install.** Bundle includes `docker load` of all images into a local registry deployed on the customer's cluster.
- [ ] **Configure k3s baseline.** Install scripts for k3s with all CRDs needed; Calico CNI; MetalLB; Longhorn; cert-manager; ingress-nginx.
- [ ] **Configure Vault for on-prem secrets.** Helm-deployed Vault; pre-staged secrets via the migration procedure (P01-T03); same envelope for consumer code.
- [ ] **Author sizing guide.** `infra/onprem/SIZING.md` for 3 tiers; per-tier: CPU + GPU + RAM + storage + network; expected workload ceilings.
- [ ] **Author install runbook.** `infra/onprem/INSTALL.md`: prerequisites; step-by-step; common errors; verification.
- [ ] **Author operate runbook.** `infra/onprem/OPERATE.md`: backup; upgrade; scale; decommission.
- [ ] **Author air-gap update procedure.** Tarball delivered via secure transfer; signature verification; offline `helm upgrade`.
- [ ] **Build verification harness.** `infra/onprem/verify.sh`: post-install test running 10 sample questions through the engine; verify expected answers.
- [ ] **Test end-to-end on a real bare-metal box.** Hetzner dedicated server (32 cores, 128 GB RAM); install from tarball; run sample workload; document timing.
- [ ] **Document for customer engineers.** Customer-facing README with non-technical overview.

### Acceptance criteria

- Air-gap tarball builds reproducibly.
- Bare-metal install completes from tarball in < 90 minutes.
- Sizing guide for 3 tiers documented.
- Verification harness passes.
- Install + operate runbooks published.
- Update procedure documented.
- Customer-facing README available.

## Alternatives Considered

- **Skip on-prem; cloud-only.** Rejected: forecloses commercialisation.
- **Use full kubeadm Kubernetes instead of k3s.** Rejected for small tier; supported as option for large.
- **Skip air-gap; assume customer has internet egress for installation.** Rejected: banking customers often have strict egress controls.
- **Skip sizing guide; let customer figure it out.** Rejected: customers under-provision and the system fails.

## Success Metrics

- **Primary**: Bare-metal install from tarball within 90 minutes; verification harness passes.
- **Guardrail**: Tarball size < 50 GB (transferable via reasonable means).

## Scope

### In scope
- Air-gap tarball + bare-metal baseline + Vault + sizing guide + runbooks + verification harness.

### Out of scope
- Laptop (P10-T01).
- Cloud (P10-T02).
- Residency (P10-T04).

## Dependencies

- **Upstream**: P01-T04 (Helm + IaC); P01-T05 (container hardening, including signing); P01-T08 (encryption); ADR-SHB-002 (model stack); P03 (datasets if customer wants pre-loaded).
- **Downstream**: P11-T04 (compliance dossier); P13-T04 (kickoff infrastructure delivery).
- **People**: eng-sec authoring; platform engineer co-authoring; ops lead reviewing operational sections.

## Open Questions

- Q1: Tarball size — Qwen-72B AWQ Q4 alone is ~36 GB; total bundle close to 50 GB. Acceptable? Recommendation: yes; acknowledge in customer-facing README.
- Q2: For very-large tenants, do we offer multi-node distributed inference (vLLM-tensor-parallel)? Recommendation: not v1; document as future-state.
- Q3: For Vault HA in on-prem, default config? Recommendation: HA only for medium + large tiers; single-node Vault for small.
- Q4: For customer's network constraints (e.g., no DNS to customer's CA), how do we handle TLS? Recommendation: bundle includes self-CA generation; customer can substitute their own CA.

## Implementation Notes

- Tarball is content-addressed; SHA-256 hash published for verification.
- Install script idempotent; safe to re-run.
- Verification harness uses a small subset of P04-T01 gold-set (10 questions); pass rate > 80% required for verification.
- Operate runbook covers both routine ops and incident response (cross-references P08-T08).
- Air-gap update procedure: customer pulls update tarball; verifies signature; runs `./upgrade.sh`; verification harness re-runs.

## Test Plan

- Test 1: Bare-metal install from tarball in < 90 min; documented timing.
- Test 2: Verification harness passes.
- Test 3: Update procedure: install, then upgrade to a v0.1.1 tarball; verify successful.
- Test 4: Sizing guide: deploy at small tier; verify smoke workload performs as documented.
- Test 5: Tarball signatures verifiable.

## Rollback Plan

- Bad deployment → uninstall via documented procedure; re-install previous tarball version.
- Bad update → rollback via Helm rollback; same upgrade procedure with prior tarball.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Air-gap tarball | Internal artefact store + customer-delivered | Eng-sec | Indefinite |
| Sizing guide | `infra/onprem/SIZING.md` | Eng-sec | Continuous |
| Install runbook | `infra/onprem/INSTALL.md` | Eng-sec | Continuous |
| Operate runbook | `infra/onprem/OPERATE.md` | Eng-sec | Continuous |
| Update procedure | `infra/onprem/UPDATE.md` | Eng-sec | Continuous |
| Verification harness | `infra/onprem/verify.sh` | Eng-sec | Continuous |
| Customer README | `infra/onprem/README.md` | Eng-sec + sales lead | Continuous |
| Bare-metal install records | `docs/audit/onprem-installs/{date}.md` | Eng-sec | Until program end |

## Operational Risks

- **Tarball corrupt during transfer.** Mitigation: SHA-256 verification; redundant copies.
- **Customer hardware below sizing minimum.** Mitigation: sizing guide explicit; install fails with clear error.
- **Air-gap update tarball arrives without proper signatures.** Mitigation: signature verification mandatory; install refuses unsigned.
- **Vault in on-prem brought down accidentally.** Mitigation: Vault HA on medium+; single-node has documented recovery.
- **Customer's existing k8s cluster conflicts with our k3s install.** Mitigation: bundle supports installing into an existing cluster (skip k3s install step).

## Definition of Done

- Tarball builds; install + verify in < 90 min; runbooks published; customer README ready.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
On-prem deployment carries the bundled Qwen-72B AWQ Q4 weights. No customer data in the bundle. Customer-side data flows entirely within customer perimeter.

### Human Oversight
Eng-sec maintains bundle; ops + customer engineers operate; install runbook is the human-mediated procedure.

### Failure Modes
- Install fails: runbook troubleshooting; remote support if needed.
- Verification fails: known-good gold-set subset; failure indicates real problem.
- Update fails: Helm rollback.
- Customer hardware insufficient: explicit sizing-guide errors.

## Sales/CS Summary

CyberSkill's on-prem air-gap deployment is the structural answer to the SBV-regulation commercialisation gate. A single tarball ships everything: Helm charts, container images, the on-prem Qwen-72B model, k3s, Vault for secrets, observability stack. Customers install on bare metal in under 90 minutes from a fully air-gapped environment — no internet egress required. Sizing guide for small / medium / large tenant footprints; install + operate runbooks; air-gap update procedure for future upgrades. Banking customers with strict residency requirements deploy with confidence.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: eng-sec authors deployment; platform engineer co-reviews; ops lead reviews operate runbook; sales lead reviews customer-facing README.
