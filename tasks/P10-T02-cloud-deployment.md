---
title: "Build cloud deployment (Helm + per-BU namespace) on GKE/EKS"
author: "@cyberskill-eng-sec"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: not_ai
target_release: "2026-09-11"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Build the cloud deployment of the demo on GKE (or EKS) using Helm + Terraform from P01-T04, with per-BU namespace isolation, per-BU TLS certificates, per-BU OIDC realms, and per-BU subdomains (`svfc-staging.shinhan-innoboost.cyberskill.world`, etc.). The cloud deployment is the canonical staging environment used for rehearsals, the surface Shinhan reviewers see during their own access (if granted), and the migration target for any commercial-track production-rehearsal. Without a polished cloud deployment, every rehearsal is at the mercy of laptop-deploy quirks.

## Problem

The cloud deployment is the production-shape demo target. Rehearsals (P12) run against it; pen-test (P08-T06) runs against it; potential Shinhan-reviewer access happens against it. Without it, the demo is laptop-only — and laptops are not production-shape.

Specific gaps if we shortcut:

- **Without per-BU namespaces, BU isolation is rhetorical.**
- **Without per-BU subdomains, demos look like one-system-with-skins (correct, but reads as less polished).**
- **Without per-BU TLS, Shinhan reviewers see browser warnings.**
- **Without per-BU OIDC realms, the auth model is collapsed.**

The `feedback_p1_scope_preference` memory note biases us richer. For cloud deployment, "richer" means: per-BU isolation + per-BU TLS + per-BU OIDC + per-BU subdomain + IaC end-to-end + canary deploy capability + observability hookup + cost monitoring.

## Proposed Solution

A cloud deployment provisioned via P01-T04 IaC:

1. **GKE cluster** (per ADR-SHB-003 OQ choice): private; workload identity; node auto-upgrade.
2. **Helm-deployed engine + HITL + UI + admin + Keycloak + observability + secrets backend.**
3. **Per-BU namespaces** (`svfc`, `bank`, `securities`); resource quotas per namespace.
4. **Per-BU TLS** via cert-manager + Let's Encrypt DNS-01.
5. **Per-BU subdomains** + ingress.
6. **Per-BU Keycloak realms** (P01-T06).
7. **Canary deploy capability** via Argo Rollouts (or similar).
8. **Full observability hookup** (P09).

Setup target: 14 days from task assignment after P01-T04.

### Subtasks

- [ ] **Provision GKE cluster** via Terraform (P01-T04).
- [ ] **Helm-deploy the umbrella chart** with `values-staging.yaml`.
- [ ] **Configure per-BU namespaces.** `svfc`, `bank`, `securities`; resource quotas per (CPU, memory, storage, GPU); admin namespace separate.
- [ ] **Configure per-BU subdomains.** DNS records via Terraform; cert-manager issues TLS certs per subdomain.
- [ ] **Configure per-BU Keycloak realms** (P01-T06 already provisioned at the auth layer; this task wires routing).
- [ ] **Configure ingress per BU.** Path-based or subdomain-based routing.
- [ ] **Configure canary deploys.** Argo Rollouts; canary 10% → 50% → 100% over 30 minutes; auto-rollback on metric breach.
- [ ] **Hook up observability.** Prometheus scrape; Grafana dashboards; OpenSearch log forwarding; OpenTelemetry traces.
- [ ] **Configure cost monitoring.** GCP Billing API integration with P09-T05 cost dashboard.
- [ ] **Smoke test post-deploy.** Engine health endpoint; sample question on each BU surface; verify all observability flows.
- [ ] **Document the deployment.** `docs/runbooks/cloud-deployment.md`; how to deploy a new release; how to roll back.
- [ ] **Author "demo-day deploy" runbook.** Day-before-demo deploy procedure + smoke test + freeze.

### Acceptance criteria

- GKE cluster provisioned via Terraform.
- Engine + UI + HITL + admin + auth + observability all running.
- Per-BU namespaces + subdomains + TLS + realms operational.
- Canary deploy verified.
- Observability hooked up.
- Smoke test passes.
- Runbooks published.

## Alternatives Considered

- **AWS EKS instead of GCP GKE.** Rejected per P00-T02 OQ Q1 (GCP for VN-friendly egress + GitHub OIDC).
- **Azure AKS.** Rejected: same reasoning; less common in our team experience.
- **Single namespace; logical BU separation only.** Rejected: hard isolation matters.
- **Skip canary deploys.** Rejected: rehearsal week needs safe-deploy capability.

## Success Metrics

- **Primary**: All three BU surfaces deployed and accessible within 14 days.
- **Guardrail**: Smoke test passes on every deploy; rollback time < 5 min.

## Scope

### In scope
- GKE provisioning + Helm deploy + per-BU namespaces + TLS + subdomains + realms + canary + observability + smoke test + runbook.

### Out of scope
- Laptop deployment (P10-T01).
- On-prem (P10-T03).
- Residency (P10-T04).
- Production-shinhan-poc cluster (placeholder; provisioned at kickoff).

## Dependencies

- **Upstream**: P01-T04 (IaC); P01-T06 (Keycloak); P00-T02 (ADR-SHB-003); P09 (observability stack).
- **Downstream**: P12 rehearsals; P08-T06 pen-test target.
- **People**: eng-sec authoring; platform engineer co-authoring; ops lead reviewing operational concerns.

## Open Questions

- Q1: Argo Rollouts vs native Helm canary? Recommendation: Argo Rollouts for richer features.
- Q2: Resource quotas — generous or tight? Recommendation: tight; expand if smoke test reveals headroom needed.
- Q3: For demo-day deploy, freeze hours or full freeze? Recommendation: full freeze on demo day; deploys allowed up to 24h before.

## Implementation Notes

- Per-BU subdomain pattern: `{bu}-staging.shinhan-innoboost.cyberskill.world`.
- Cert-manager auto-renewal; alert on certs < 30 days.
- Canary deploy uses traffic-shifting; metrics from P09 inform rollback.
- Cost monitoring tagged per namespace for per-BU attribution.

## Test Plan

- Test 1: Smoke test against each BU surface.
- Test 2: Canary deploy with simulated metric breach; verify rollback.
- Test 3: Cert renewal automated; verified.
- Test 4: Per-BU namespace isolation — pod in svfc namespace cannot reach bank namespace pods.
- Test 5: Cost monitoring tagged correctly per namespace.

## Rollback Plan

- Bad deploy rolled back via Helm rollback; canary auto-rollback for metric breaches.
- Bad cluster config rolled back via Terraform plan + apply of previous state.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Terraform | `infra/terraform/environments/staging/` | Eng-sec | Continuous |
| Helm values | `infra/helm/.../values-staging.yaml` | Eng-sec | Continuous |
| Cluster config snapshots | Cloud Storage | Eng-sec | 1 year |
| Deploy runbook | `docs/runbooks/cloud-deployment.md` | Eng-sec | Continuous |
| Demo-day deploy runbook | `docs/runbooks/demo-day-deploy.md` | Eng-sec | Continuous |
| Smoke-test results | CI artefacts | Eng-sec | Per CI retention |

## Operational Risks

- **Cluster outage during rehearsal.** Mitigation: laptop deploy fallback (P10-T01); recorded videos.
- **Cert renewal failure.** Mitigation: 30-day alert; manual cert as backup.
- **Resource quota exceeded during load test.** Mitigation: quotas can be raised quickly; alert.
- **Canary deploy hangs in middle state.** Mitigation: timeout + auto-rollback.

## Definition of Done

- Cluster + deployment + per-BU surfaces + canary + observability + smoke test + runbooks all in place.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: eng-sec authors implementation; platform engineer co-reviews; ops lead reviews operational concerns.
