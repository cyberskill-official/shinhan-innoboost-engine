# Audit Report — P10-T02: Cloud Deployment (Helm + GKE/EKS)

> **Phase**: 10 — Deployment Targets  
> **Task**: T02 — Cloud Deployment  
> **Source**: [`infra/cloud/cloud-deployment.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/infra/cloud/cloud-deployment.md) (165 lines)  
> **FR Reference**: [`tasks/P10-T02-cloud-deployment.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/tasks/P10-T02-cloud-deployment.md)  
> **Auditor**: Antigravity Deep Audit  
> **Date**: 2026-05-02

---

## 1. Acceptance Criteria Verification

| # | Criterion (from FR) | Status | Evidence |
|---|---|---|---|
| AC-1 | Per-BU namespace strategy (svfc, bank, sec, shared-services) | ✅ Pass | §2: 5 namespaces with RBAC + network policy per BU |
| AC-2 | Terraform for GKE + Cloud SQL + Memorystore | ✅ Pass | §3: HCL configs for GKE cluster (asia-southeast1), Cloud SQL Postgres 16, Redis HA |
| AC-3 | Helm deployment commands | ✅ Pass | §4: Per-BU `helm upgrade --install` loop + shared services |
| AC-4 | Per-BU TLS + OIDC | ✅ Pass | §5: 3 domains with Let's Encrypt + per-BU Keycloak realms |
| AC-5 | Architecture diagram | ✅ Pass | §1: ASCII diagram showing BU namespaces → shared services topology |
| AC-6 | Actual Helm charts created | ❌ Missing | `infra/helm/shinhan-innoboost/` directory referenced but not verified as containing valid charts |
| AC-7 | Per-BU values files | ❌ Missing | `values-svfc.yaml`, `values-bank.yaml`, `values-sec.yaml` referenced but not found |
| AC-8 | Terraform applied / plan verified | ❌ Missing | HCL is documentation-only; no `terraform plan` output |

**AC Pass Rate: 5/8 (63%) — 0 partial, 3 missing**

---

## 2. Test Plan Verification

| # | Test (from FR) | Status | Evidence |
|---|---|---|---|
| T-1 | `terraform plan` succeeds | ❌ Not Found | HCL in markdown only |
| T-2 | Helm deploy to each BU namespace | ❌ Not Found | No cluster to deploy to |
| T-3 | Per-BU network isolation verified | ❌ Not Found | NetworkPolicy not in actual YAML |

**Test Pass Rate: 0/3 (0%)**

---

## 3. Content Quality Analysis

### Strengths
- **Correct GKE location**: `asia-southeast1-a` (Ho Chi Minh City region) — critical for VN data residency
- **Cloud SQL with PITR**: `point_in_time_recovery_enabled = true` — required for regulatory compliance
- **Private networking**: `private_network = google_compute_network.vpc.id` — no public DB exposure
- **Per-BU namespace strategy is clean**: Separate RBAC, network policies, and OIDC realms per BU
- **Helm upgrade pattern**: Proper `--wait --timeout` with `--set image.tag="${GIT_SHA}"` for immutable deploys

### Issues

| # | Severity | Issue | Details |
|---|---|---|---|
| CQ-1 | 🔴 High | **Terraform is documentation-only** — HCL in fenced code blocks, not `.tf` files | Can't `terraform plan/apply` |
| CQ-2 | 🔴 High | **No Helm charts exist** — `infra/helm/` may be empty or placeholder | Can't `helm install` |
| CQ-3 | 🟡 Medium | **No per-BU values files** — `values-svfc.yaml`, etc. not found | Helm can't differentiate BU configs |
| CQ-4 | 🟡 Medium | **EKS support mentioned in title but only GKE implemented** | Should add EKS Terraform as alternative |

---

## 4. Verdict

> **Overall Status: ⚠️ PARTIAL — Solid cloud architecture documentation, no executable IaC**

The cloud deployment architecture is well-designed with correct GKE region, per-BU namespace isolation, Cloud SQL HA, and private networking. However, all infrastructure code exists only in markdown code blocks — no actual `.tf` files or Helm charts. This needs extraction and validation.

**Estimated remediation effort**: 5-8 days.
