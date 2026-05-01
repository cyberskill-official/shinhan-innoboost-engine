---
title: "Author IaC for cloud (Terraform) and on-prem (Helm)"
author: "@cyberskill-eng-sec"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: not_ai
target_release: "2026-05-22"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Author the Infrastructure-as-Code foundation for the demo build: Terraform modules for cloud-side infrastructure (VPC, KMS, GKE/EKS cluster, Cloud SQL Postgres, Cloud Storage / S3 buckets for artefacts, Cloud KMS key rings, IAM roles, observability backends), and Helm charts for application deployment that work equally on cloud Kubernetes and on-prem bare-metal Kubernetes. Nothing is clicked in a console; every infrastructure object is in version control. Charts are designed for air-gap installation from day one (no implicit registry pulls, no implicit external dependencies). Three target shapes: laptop (`docker compose`, no IaC), cloud (Terraform + Helm), on-prem (Helm with air-gap bundle from P10-T03). The IaC foundation is the structural enforcement of every "we can deploy on-prem" claim in the pitch.

## Problem

Without IaC, infrastructure becomes a folkloric oral history. Engineers click in consoles; settings drift; reproducibility evaporates. Banking-sector reviewers will look at our infrastructure-management story and either be reassured or alarmed. There is no middle ground.

Specific gaps if we shortcut:

- **Manual cluster setup is non-reproducible.** When we need to spin up the production-rehearsal environment two days before Demo Day, we cannot afford to re-discover the cluster's exact configuration. IaC fixes this.
- **Without Terraform state in version control, drift between environments is undetectable.** Staging and production-rehearsal will diverge silently; the rehearsal becomes a poor proxy for the real environment.
- **Without parameterised Helm charts, the on-prem path requires a rewrite.** Cloud-only charts that hardcode `gcr.io/...` or assume specific cloud-native components (Cloud SQL, Cloud Storage) fail on bare metal. We must build for the hardest case (air-gap on-prem) from the start.
- **Without IAM-as-code, access drift accumulates.** Old roles persist after engineers offboard; over-permissive defaults stay in place.
- **Without KMS-as-code, encryption keys lack rotation discipline.** The compliance dossier (P11-T04) needs evidence of key management; manual key admin doesn't produce that evidence.
- **Without VPC-as-code, network segmentation drifts.** The zero-trust network we promise (P01-T10) cannot be evidenced if the VPC + firewall rules + subnet layout aren't in code.

The Innoboost Q&A's Section VI confirms commercial deployment "must be deployed per SBV regulations." Vietnamese banking regulation (Circular 09/2020/TT-NHNN, Circular 50/2024/TT-NHNN) typically requires evidence of strong infrastructure controls, network segmentation, and access management. IaC produces all this evidence as a side-effect of how we build.

The `shinhanos_data_residency` memory note mandates that VN-tenant data lives on VN-hosted infrastructure (not Railway / Neon US). The Helm charts must therefore not hardcode any cloud-region; the Terraform must support GCP / AWS / Azure VN-region deployments, plus VN-hosted IDC providers (Viettel IDC, VNPT IDC, FPT IDC) for fully on-prem.

The `feedback_p1_scope_preference` memory note biases us richer. For IaC, "richer" means: Terraform modules that can stamp out any environment (laptop-cloud, dev, staging, production-rehearsal, production-shinhan-poc) by varying inputs; Helm charts with values-files for each environment; IaC tests (terraform validate, helm lint, conftest policies) in CI; a documented bare-metal Kubernetes baseline (k3s or kubeadm) with sizing guides. Setup cost is real but recoverable; shortcut cost is later panic.

There is also a downstream-dependency dimension: P01-T05 (container hardening), P01-T06 (auth service Keycloak deployment), P01-T08 (encryption / KMS rotation), P01-T09 (backups), P01-T10 (network zero-trust), P09 (observability), and P10-T01..T04 (deployment targets) all depend on this IaC foundation. Getting it right unblocks everything; getting it wrong blocks everything.

## Proposed Solution

A two-track IaC foundation:

**Track 1: Terraform** for cloud infrastructure. Modules: `vpc/`, `kms/`, `iam/`, `gke/` (or `eks/`), `cloud-sql/`, `cloud-storage/`, `observability/`, `dns/`. State stored remotely with locking (GCS bucket with Object Versioning, or S3 with DynamoDB lock table). Per-environment workspace pattern. Provider versions pinned. Tests via `terraform validate` + `tflint` + `tfsec` + custom OPA policies in CI.

**Track 2: Helm charts** for application deployment, in `infra/helm/` of the monorepo. One umbrella chart `shinhan-innoboost` with sub-charts per workspace (`engine`, `hitl`, `ui`, etc.). Values files per environment (`values-dev.yaml`, `values-staging.yaml`, `values-onprem.yaml`). Charts fully parameterised — no hardcoded registries, no hardcoded credentials, no hardcoded cloud-native dependencies. Image references use a configurable `imageRegistry` value (defaults to GHCR; on-prem overrides to a local registry).

Plus the bare-metal baseline: a documented k3s + Calico + MetalLB + Longhorn baseline for on-prem, with sizing guides for small / medium / large tenant footprints. Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Choose cloud provider for staging.** Per ADR-SHB-003 (Open Question Q1 in P01-T02). Recommend GCP for Vietnam-friendly egress and clean GitHub OIDC integration. Document the choice in a sub-ADR if not already covered.
- [ ] **Initialise Terraform repository structure.** Inside the monorepo at `infra/terraform/`:
  - `modules/` — reusable modules (vpc, kms, iam, gke, cloud-sql, cloud-storage, observability, dns).
  - `environments/` — per-env wirings (`dev`, `staging`, `production-rehearsal`, `production-shinhan-poc-placeholder`); each has a `main.tf`, `variables.tf`, `terraform.tfvars` (gitignored) or `terraform.tfvars.example` (committed), `backend.tf` (remote state).
  - `policies/` — OPA / conftest policies for IaC linting (e.g., "all KMS keys must have rotation enabled"; "no IAM roles with `*` actions"; "all storage buckets must have versioning enabled").
- [ ] **Author the `vpc/` module.** Inputs: project ID, region, CIDR, environment label. Outputs: VPC ID, subnet IDs, NAT gateway IPs. Includes private / public subnets, Cloud Router, Cloud NAT for egress, no default VPC use, network tags for downstream filtering. Egress restricted to allow-listed destinations (Anthropic API, GitHub, Slack, Doppler).
- [ ] **Author the `kms/` module.** Inputs: project ID, region, environment label, list of keys (each with rotation period). Outputs: key ring ID and key resource IDs. Includes rotation policies (90-day default; 30-day for production), HSM-backed for production, software-backed for dev. KMS keys are referenced by name only in application configs; never the value.
- [ ] **Author the `iam/` module.** Inputs: project ID, list of roles (each with members and least-privilege bindings). Outputs: role IDs. Implements: workload identity for GitHub Actions OIDC federation (no long-lived service-account JSON); workload identity for Pod-level cluster access (per-namespace); break-glass admin role with audit-required access.
- [ ] **Author the `gke/` module.** (Or `eks/` if AWS chosen.) Inputs: project ID, region, VPC ID, subnet IDs, node-pool sizing per environment, KMS key for cluster encryption. Outputs: cluster name, kubeconfig, OIDC issuer URL. Configurations: private cluster (master endpoint not public); workload identity enabled; node auto-upgrade enabled with controlled cadence; pod-security-standard `restricted` enforced; network policy enabled (Calico for GKE).
- [ ] **Author the `cloud-sql/` module.** Inputs: project ID, region, VPC ID, KMS key, instance tier, environment label. Outputs: instance connection name, private IP, generated password (stored only in Secrets Manager + Doppler, never returned). Configurations: private IP only, no public IP; Postgres 16 with extensions (pgvector, pg_partman, pg_stat_statements, pg_audit); automated backups (PITR); read-replica for staging and production. Connections use IAM-based auth where possible.
- [ ] **Author the `cloud-storage/` module.** Inputs: project ID, region, KMS key, list of buckets (each with retention policy). Outputs: bucket URIs. Configurations: uniform-bucket-level access; versioning enabled; retention policies (e.g., audit logs 7 years); KMS-encrypted; access via IAM only (no ACLs).
- [ ] **Author the `observability/` module.** Inputs: project ID. Outputs: log-bucket URIs, metric-prefix, trace-prefix. For demo phase: GCP-native (Cloud Logging, Cloud Monitoring, Cloud Trace) — easy to swap for self-hosted (Grafana / Loki / Tempo) in production track. Detailed observability config lives in P09 tasks; this module just provisions the receiving end.
- [ ] **Author the `dns/` module.** Inputs: project ID, domain, list of records. Outputs: record IDs. Used for staging URLs (e.g., `staging-engine.shinhan-innoboost.cyberskill.world`). DNS records cross-checked against the SBV cybersecurity DNS hijack list (none of our records should match).
- [ ] **Wire `environments/staging/main.tf`.** Compose the modules into a working staging environment. Run `terraform plan`; review; iterate; run `terraform apply` with founder approval on destructive changes.
- [ ] **Configure remote state.** Backend: GCS bucket with Object Versioning + state locking; bucket itself created via a bootstrap script (chicken-and-egg). Bucket has IAM restricting access to founder + ops + eng-sec.
- [ ] **Author Helm chart skeleton.** Inside the monorepo at `infra/helm/shinhan-innoboost/`:
  - `Chart.yaml` (name, version, app-version, dependencies).
  - `values.yaml` (defaults; documented; structured by sub-chart).
  - `templates/` (per-component Deployment, Service, ConfigMap, ServiceAccount, NetworkPolicy, PodDisruptionBudget templates).
  - `charts/` (sub-chart directories or dependencies on internal charts).
  - `crds/` (any CRDs needed; e.g., for the doppler-kubernetes-operator).
- [ ] **Build sub-charts.** One sub-chart per deployable workspace: `engine`, `hitl`, `ui`. The non-deployable workspaces (`eval`, `data`, `infra`, `compliance`) don't ship as runtime services — they ship as artefacts. Each sub-chart has its own templates and values.
- [ ] **Author values files.** `values-dev.yaml`, `values-staging.yaml`, `values-onprem.yaml`. Each overrides defaults for environment-specific config: image registry, resource requests/limits, replica counts, ingress hostnames, secret-source backend (Doppler vs. Vault).
- [ ] **Configure deployment via Helm.** Staging deploys via `helm upgrade --install` from `main-deploy.yml` (P01-T02). Cluster credentials come via OIDC federation (no long-lived kubeconfig).
- [ ] **Author the bare-metal baseline.** Document at `docs/runbooks/bare-metal-baseline.md`. Components: k3s (single-node or HA cluster); Calico for CNI + network policy; MetalLB for LoadBalancer (if not using a hardware LB); Longhorn for storage (if not using a SAN); cert-manager for certificates; ingress-nginx. Sizing guides for: small (1× server, 32 cores, 128 GB RAM, 1 TB NVMe); medium (3× HA, 64 cores each); large (5+ HA, 96 cores each).
- [ ] **Author the air-gap install bundle plan.** Detailed in P10-T03; this task scaffolds the bundle directory structure and identifies what needs to be included (all images, all charts, all model weights, all Helm dependencies).
- [ ] **CI integration.** Add to P01-T02's `pr-check`: `terraform fmt -check`, `terraform validate`, `tflint`, `tfsec`, `conftest test` (against `policies/`); `helm lint`, `helm template ... | kubeval` (Kubernetes-schema validation), `helm template ... | conftest test` (against pod-security policies).
- [ ] **Author runbook.** `docs/runbooks/iac.md`: how to add a new module; how to make a destructive change safely; how to roll back; how to handle state drift.
- [ ] **Run an end-to-end deploy test.** From a clean GCP project: `terraform init && terraform plan && terraform apply` (with approval); then `helm install` against the new cluster; verify the engine health endpoint returns 200. Time the entire process; aim for < 30 minutes for full provisioning.

### Acceptance criteria

- Terraform modules authored and parameterised; modules pass `terraform validate`, `tflint`, `tfsec`, and OPA policy tests.
- `environments/staging/` is wired; `terraform apply` produces a working staging cluster.
- Remote state backend is operational with locking; `terraform plan` from two engineers in parallel correctly serialises.
- Helm chart `shinhan-innoboost` with sub-charts builds and lints cleanly.
- Values files for `dev`, `staging`, `onprem` are present and documented.
- `helm install` against the staging cluster deploys all sub-charts; engine health endpoint reachable.
- Bare-metal baseline documented with sizing guides.
- IaC CI integration is part of `pr-check.yml`; sample PR exercises the gates.
- End-to-end deploy test passes; total provisioning time captured.

## Alternatives Considered

- **Pulumi instead of Terraform.** Rejected: Terraform is the team's existing standard; Pulumi's TypeScript-as-IaC is interesting but adds learning curve we don't have time for. Terraform's ecosystem (modules, providers, tooling) is more mature.
- **Crossplane (Kubernetes-native cloud provisioning) instead of Terraform.** Rejected: Crossplane's promise is real but its ops overhead during the demo phase isn't justified. Reconsider for production-track if multi-cloud needs grow.
- **Pure Helm without a separate IaC layer (use Helm hooks for cloud resources).** Rejected: cloud resources are not Kubernetes-shaped; trying to manage a VPC or KMS key via Helm produces fragile, hard-to-debug deployments.
- **CDK (CloudFormation TypeScript wrapper for AWS) or Cloud Deployment Manager (GCP-native).** Rejected: cloud-vendor-locked; we want portability across cloud providers.
- **Manage cloud resources via the gcloud CLI in scripts.** Rejected: that's IaC-by-convention; no state tracking; no plan/apply discipline. Bad pattern.
- **Skip Helm; use raw kubectl manifests.** Rejected: parameterisation across environments is exactly the problem Helm solves; raw kubectl gets unwieldy.
- **Use Kustomize instead of Helm.** Rejected: Kustomize is great for simple overlay scenarios; Helm's templating is more capable for the parameterisation we need (per-environment image registries, resource sizing, ingress hostnames).
- **Defer the bare-metal baseline; only do cloud for the demo.** Rejected: ADR-SHB-003 commits to on-prem-first thinking; the bare-metal baseline is non-optional. Doing it now means Phase 10 is mechanical not heroic.

## Success Metrics

- **Primary**: End-to-end provisioning (Terraform + Helm install) on a clean GCP project completes in < 30 minutes within 14 days of task assignment. Measured by: CI run timing for a full provision-and-deploy test.
- **Guardrail**: Zero IaC drift between git-state and actual-state of staging environment over the next 30 days. Measured by: nightly `terraform plan` + `helm diff` against staging; any unexpected diff triggers an investigation.

## Scope

### In scope
- Terraform modules for cloud infrastructure.
- Helm charts (umbrella + sub-charts) for application deployment.
- Per-environment values files.
- Bare-metal baseline documentation with sizing guides.
- Remote state backend with locking.
- IaC CI integration (validate, lint, sec-scan, policy test).
- Runbook.
- End-to-end deploy test.

### Out of scope
- Air-gap install bundle (handled in P10-T03; scaffolded here only).
- Production-shinhan-poc environment provisioning (placeholder only; provisioned at kickoff).
- Multi-region failover (out of scope for demo phase).
- Per-tenant residency engineering (handled in P10-T04).
- Detailed observability dashboards and alerting rules (handled in P09 tasks).
- Auth service Keycloak configuration (handled in P01-T06; this task provisions the cluster, not the auth app).

## Dependencies

- **Upstream**: P01-T01 (monorepo skeleton); P00-T02 ADR-SHB-001 + ADR-SHB-003 (host platform + warehouse).
- **People**: eng-sec authoring; platform engineer co-authoring; founder for cloud-cost approval (staging environment burn rate).
- **External**: GCP / AWS account (founder credit-card-on-file with billing alerts); domain `cyberskill.world` DNS access; HashiCorp registry for Terraform providers.
- **Memory references**: `shinhanos_data_residency`, `shinhanos_tech_stack`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: GCP or AWS for staging? Recommendation: GCP per Vietnamese egress and OIDC federation; lock at this task.
- Q2: HSM-backed KMS keys cost ~$1/key/month in GCP. For demo phase, use software-backed keys; production track switches to HSM. Document.
- Q3: For the bare-metal baseline, is k3s acceptable (single-binary, lighter) or do we need full kubeadm Kubernetes (more standard, heavier)? Recommendation: k3s for the small-to-medium tier; kubeadm for the large tier where multi-control-plane HA matters.
- Q4: For Longhorn vs. ceph-rook storage, which? Recommendation: Longhorn for simpler ops (Rancher-native); ceph for production-track if performance demands.
- Q5: For ingress, ingress-nginx or Istio? Recommendation: ingress-nginx for the demo (lower complexity); Istio if we need mTLS service-mesh in production track.
- Q6: For the staging-cluster's egress allow-list, what specific endpoints need to be allowed? List: Anthropic API (`api.anthropic.com`), HuggingFace (`huggingface.co`), GHCR (`ghcr.io`), Doppler (`api.doppler.com`), Slack webhook target, Lambda Labs API. Lock the list; everything else egress-blocked by VPC-level firewall.

## Implementation Notes

- Terraform state is the source of truth for cloud infrastructure; resist any "I'll just click this in the console" temptation. If a console change happens, immediately import to Terraform or reverse the change.
- For Helm chart `apiVersion: v2` (Helm 3 native); avoid the v1 / Helm 2 patterns.
- For sub-charts, keep them as in-repo `charts/` dependencies, not external Helm repos. Versioning is repo-tag-based; reproducible.
- Pod-security-standard `restricted` is enforced cluster-wide via PodSecurityAdmission. Each Deployment template explicitly drops capabilities and runs non-root. Distroless container images (P01-T05) make this trivial.
- For the bare-metal sizing guides, base the sizes on Qwen-72B-AWQ Q4 inference workload (P00-T05). Small tier: assumes 1 H100 80GB GPU + 32 CPU cores. Medium: 1 H100 + 64 CPU cores. Large: 2 H100 + 96 CPU cores.
- For IAM-as-code, use the principle of least privilege: per-service-account roles with the minimal set of permissions; never `roles/owner` or `roles/editor` outside the founder's break-glass account.
- For Cloud SQL, prefer the IAM-based auth (no password) for service-to-service connections; fall back to password auth for emergencies. Password rotation is automated via Cloud SQL's native rotation feature, picked up by Doppler (P01-T03).
- For the staging cluster, run a single zonal cluster with autoscaling enabled. Multi-zonal HA is overkill for staging; the budget is better spent on observability and eval-harness time.
- For OPA / conftest policies, start with the policy library at `https://github.com/open-policy-agent/library` and customise. Examples: "no public buckets", "no IAM roles with `*` actions", "all KMS keys have rotation".

## Test Plan

- Test 1: `terraform validate` passes on every module.
- Test 2: `tflint` passes with custom CyberSkill ruleset (rules like "all resources tagged with `environment`, `owner`, `cost-center`").
- Test 3: `tfsec` passes with HIGH and CRITICAL findings = 0; lower-severity findings triaged.
- Test 4: OPA policy tests pass against staging environment manifests.
- Test 5: `helm lint` passes on the umbrella chart and all sub-charts.
- Test 6: `helm template ... | kubeval` passes (Kubernetes schema valid).
- Test 7: End-to-end provision: clean GCP project → `terraform apply` → cluster up → `helm install` → engine health endpoint returns 200. Time the whole sequence.
- Test 8: Drift test: nightly `terraform plan --refresh-only` against staging; expect zero diff.
- Test 9: Bare-metal baseline: deploy on a single Hetzner dedicated server with 32 cores + 128 GB RAM via the documented runbook; verify engine + hitl + ui all run; engine health endpoint returns 200.

## Rollback Plan

- A bad Terraform apply is rolled back by `terraform apply` of a prior state version (state is versioned in GCS Object Versioning).
- A bad Helm release is rolled back by `helm rollback shinhan-innoboost <revision>`. Revisions retained for 10 most recent.
- An IaC change that destroys data (rare but possible — e.g., dropping a Cloud SQL instance) is gated by `terraform plan` review + founder approval before apply. Two-engineer rule for production-rehearsal applies.
- A bare-metal install issue is rolled back by tearing down the k3s cluster (`k3s-uninstall.sh`) and re-installing.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Terraform modules | `infra/terraform/modules/` | Eng-sec | Continuous |
| Per-environment Terraform | `infra/terraform/environments/` | Eng-sec | Continuous |
| Helm umbrella chart | `infra/helm/shinhan-innoboost/` | Platform eng | Continuous |
| Helm sub-charts | `infra/helm/shinhan-innoboost/charts/` | Platform eng | Continuous |
| Per-env values files | `infra/helm/.../values-{env}.yaml` | Platform eng | Continuous |
| Remote state | GCS bucket (versioned) | Eng-sec | Indefinite |
| Bare-metal baseline runbook | `docs/runbooks/bare-metal-baseline.md` | Eng-sec | Continuous |
| IaC runbook | `docs/runbooks/iac.md` | Eng-sec | Continuous |
| End-to-end deploy test record | CI history | Eng-sec | Per CI retention |
| Drift-test logs | Central observability store | Eng-sec | 7 years |
| OPA policy library | `infra/terraform/policies/` | Eng-sec | Continuous |

## Operational Risks

- **Terraform state lock conflict.** Mitigation: GCS state-lock semantics serialise; engineers wait or coordinate.
- **State corruption.** Mitigation: GCS Object Versioning; restore from prior version.
- **Cloud cost surprise (e.g., autoscaling spike).** Mitigation: per-project billing cap and alerts; staging environment has aggressive auto-shutdown (e.g., scale to zero outside business hours).
- **Helm chart upgrade breaks running pods.** Mitigation: canary rollout via Helm hooks; PodDisruptionBudget prevents simultaneous pod loss.
- **Bare-metal baseline doesn't match Shinhan's actual production environment.** Mitigation: baseline is a starting point; P13-T04 (infrastructure delivery checklist) fields actual customisation requests.
- **IaC drift goes undetected.** Mitigation: nightly drift detection; failure triggers an investigation.

## Definition of Done

- Terraform modules + environment wirings complete and tested.
- Helm umbrella + sub-charts complete and tested.
- Bare-metal baseline documented with sizing guides.
- Remote state operational with locking.
- IaC CI integration green.
- End-to-end deploy test recorded.
- Runbook published.
- This FR's ticket marked Done with links to artefacts.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections of this FR.
- **Human review**: eng-sec authors and reviews modules + charts; platform engineer reviews bare-metal baseline; `@stephen-cheng` ratifies cost approvals and rollback procedures.
