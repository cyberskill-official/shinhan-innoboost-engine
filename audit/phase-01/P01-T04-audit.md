# Audit Report — P01-T04: IaC Foundation (Terraform + Helm)

> **Audit Date**: 2026-05-02
> **FR Status**: `draft` | **Recommended Status**: `in_progress`
> **Verdict**: ⚠️ **PARTIALLY DONE** — Skeleton IaC structure exists: Terraform `main.tf` (242 lines), Helm chart with Chart.yaml + values.yaml + deployment template, environment directory scaffolding. But Terraform modules are empty, environments have no `.tf` files, Helm has no sub-charts, no per-env values files, no bare-metal baseline, no OPA policies, and no end-to-end deploy test.

---

## 1. Acceptance Criteria Verification

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| AC-1 | Terraform modules authored and parameterised; pass `terraform validate`, `tflint`, `tfsec`, and OPA policy tests | ❌ FAIL | `infra/terraform/modules/` exists but is **empty** (0 files). `main.tf` (242 lines) exists at root level but modules are not extracted. No `tflint`/`tfsec`/OPA evidence. |
| AC-2 | `environments/staging/` wired; `terraform apply` produces working staging cluster | ❌ FAIL | `infra/terraform/environments/staging/` directory exists but is **empty** (0 files). `staging.tfvars` exists at terraform root (5 lines, basic vars). No wired `main.tf` in staging. |
| AC-3 | Remote state backend operational with locking; parallel `terraform plan` serialises | ❌ FAIL | No backend configuration found in any `.tf` file. No GCS bucket setup. |
| AC-4 | Helm chart `shinhan-innoboost` with sub-charts builds and lints cleanly | ⚠️ PARTIAL | `Chart.yaml` ✅, `values.yaml` ✅ (125 lines), `templates/deployment.yaml` ✅ (71 lines), `templates/_helpers.tpl` ✅. But **no sub-charts** (`charts/` directory empty or absent). `dependencies: []` in Chart.yaml confirms no sub-charts. |
| AC-5 | Values files for `dev`, `staging`, `onprem` present and documented | ❌ FAIL | Only `values.yaml` (default). **No `values-dev.yaml`, `values-staging.yaml`, `values-onprem.yaml`**. |
| AC-6 | `helm install` against staging cluster deploys; engine health endpoint reachable | ❌ FAIL | No staging cluster exists. No deployment evidence. |
| AC-7 | Bare-metal baseline documented with sizing guides | ❌ FAIL | `docs/runbooks/bare-metal-baseline.md` does not exist. |
| AC-8 | IaC CI integration part of `pr-check.yml`; sample PR exercises gates | ❌ FAIL | No `terraform fmt`, `tflint`, `tfsec`, `helm lint` steps verified in `pr-check.yml`. |
| AC-9 | End-to-end deploy test passes; total provisioning time captured | ❌ FAIL | No deploy test executed. |

**Acceptance Criteria Score: 0/9 PASS, 1/9 PARTIAL, 8/9 FAIL**

---

## 2. Test Plan Verification

| Test | Description | Executed? | Result |
|------|-------------|-----------|--------|
| Test 1 | `terraform validate` passes on every module | ❌ Not executable | No modules exist (0 files in `modules/`). |
| Test 2 | `tflint` passes with custom ruleset | ❌ Not executable | No tflint configuration. |
| Test 3 | `tfsec` passes with HIGH/CRITICAL = 0 | ❌ Not executable | No tfsec configuration. |
| Test 4 | OPA policy tests pass against staging env manifests | ❌ Not executable | No OPA policies (0 files in `policies/`). |
| Test 5 | `helm lint` passes on umbrella chart and sub-charts | ⚠️ Partially possible | Umbrella chart exists; no sub-charts to lint. |
| Test 6 | `helm template ... \| kubeval` passes | ❌ Not executed | No kubeval integration. |
| Test 7 | End-to-end provision: clean GCP → terraform apply → helm install → health 200 | ❌ Not executed | No cloud project provisioned. |
| Test 8 | Drift test: nightly `terraform plan --refresh-only` → zero diff | ❌ Not executable | No deployed infrastructure to check drift against. |
| Test 9 | Bare-metal baseline: deploy on Hetzner → engine + hitl + ui run | ❌ Not executed | No bare-metal runbook. |

**Test Plan Score: 0/9 executed**

---

## 3. Success Metrics Verification

| Metric | Target | Status | Measurement |
|--------|--------|--------|-------------|
| Primary | End-to-end provisioning (TF + Helm) < 30 min within 14 days | ❌ NOT MET | No provisioning executed. |
| Guardrail | Zero IaC drift between git-state and staging over 30 days | ❌ NOT MET | No infrastructure deployed. |

---

## 4. Definition of Done Verification

| # | Criterion | Status |
|---|-----------|--------|
| DoD-1 | Terraform modules + environment wirings complete and tested | ❌ Modules empty |
| DoD-2 | Helm umbrella + sub-charts complete and tested | ⚠️ Umbrella exists; no sub-charts |
| DoD-3 | Bare-metal baseline documented with sizing guides | ❌ |
| DoD-4 | Remote state operational with locking | ❌ |
| DoD-5 | IaC CI integration green | ❌ |
| DoD-6 | End-to-end deploy test recorded | ❌ |
| DoD-7 | Runbook published | ❌ No `docs/runbooks/iac.md` |
| DoD-8 | FR ticket marked Done | ❌ |

---

## 5. Subtask Verification

| Subtask | Status | Notes |
|---------|--------|-------|
| Choose cloud provider for staging | ⚠️ PARTIAL | `staging.tfvars` references `asia-southeast1` (GCP). Decision made but not formalised in ADR. |
| Initialise Terraform repository structure | ⚠️ PARTIAL | `modules/`, `environments/`, `policies/` dirs exist but all are **empty**. `main.tf` (242 lines) and `staging.tfvars` (5 lines) exist at terraform root. |
| Author `vpc/` module | ❌ FAIL | `modules/` is empty. |
| Author `kms/` module | ❌ FAIL | Empty. |
| Author `iam/` module | ❌ FAIL | Empty. |
| Author `gke/` module | ❌ FAIL | Empty. |
| Author `cloud-sql/` module | ❌ FAIL | Empty. |
| Author `cloud-storage/` module | ❌ FAIL | Empty. |
| Author `observability/` module | ❌ FAIL | Empty. |
| Author `dns/` module | ❌ FAIL | Empty. |
| Wire `environments/staging/main.tf` | ❌ FAIL | `environments/staging/` is empty. |
| Configure remote state | ❌ FAIL | No backend config. |
| Author Helm chart skeleton | ✅ PASS | Chart.yaml + values.yaml + deployment template exist. |
| Build sub-charts | ❌ FAIL | No sub-chart directories. |
| Author values files (dev, staging, onprem) | ❌ FAIL | Only default `values.yaml`. |
| Configure deployment via Helm | ❌ FAIL | No Helm deployment executed. |
| Author bare-metal baseline | ❌ FAIL | Runbook missing. |
| Author air-gap install bundle plan | ❌ FAIL | No bundle structure. |
| CI integration (terraform fmt, helm lint, etc.) | ❌ FAIL | Not in CI. |
| Author runbook | ❌ FAIL | `docs/runbooks/iac.md` missing. |
| Run end-to-end deploy test | ❌ FAIL | No test executed. |

---

## 6. Existing Artefacts Inventory

| Expected Artefact | Path | Exists? | Content Quality |
|-------------------|------|---------|-----------------|
| Terraform root `main.tf` | `infra/terraform/main.tf` | ✅ Yes (242 lines) | Authored; modules inline, not extracted |
| `staging.tfvars` | `infra/terraform/staging.tfvars` | ✅ Yes (5 lines) | Basic vars only |
| `modules/` directory | `infra/terraform/modules/` | ✅ Dir exists | **Empty (0 files)** |
| `environments/` directory | `infra/terraform/environments/` | ✅ Dir exists | 4 subdirs, all **empty** |
| `policies/` directory | `infra/terraform/policies/` | ✅ Dir exists | **Empty (0 files)** |
| Helm `Chart.yaml` | `infra/helm/shinhan-innoboost/` | ✅ Yes | Proper v2 format |
| Helm `values.yaml` | `infra/helm/shinhan-innoboost/` | ✅ Yes (125 lines) | Default values |
| Helm `deployment.yaml` | `infra/helm/.../templates/` | ✅ Yes (71 lines) | Deployment template |
| Helm `_helpers.tpl` | `infra/helm/.../templates/` | ✅ Yes | Helper templates |
| `values-dev.yaml` | `infra/helm/shinhan-innoboost/` | ❌ No | — |
| `values-staging.yaml` | `infra/helm/shinhan-innoboost/` | ❌ No | — |
| `values-onprem.yaml` | `infra/helm/shinhan-innoboost/` | ❌ No | — |
| Sub-charts | `infra/helm/.../charts/` | ❌ No | — |
| Bare-metal baseline | `docs/runbooks/bare-metal-baseline.md` | ❌ No | — |
| IaC runbook | `docs/runbooks/iac.md` | ❌ No | — |
| OPA policy library | `infra/terraform/policies/` | ❌ No (dir empty) | — |

---

## 7. Summary & Recommendation

**The IaC foundation is ~20% complete.** The directory structure for Terraform and Helm is scaffolded, and the Helm umbrella chart has a basic deployment template. But Terraform modules are entirely empty — the `main.tf` exists as a monolith but hasn't been refactored into reusable modules. No environment has been wired, no infrastructure has been deployed, and no validation tooling (tflint, tfsec, OPA) is configured.

**Recommended status**: `in_progress` — heavy work remains.

**To move to `done`**:
1. Extract `main.tf` into 8 reusable modules in `modules/`
2. Wire `environments/staging/main.tf` composing modules
3. Configure remote state backend (GCS)
4. Build Helm sub-charts for engine, hitl, ui
5. Author `values-dev.yaml`, `values-staging.yaml`, `values-onprem.yaml`
6. Author `docs/runbooks/bare-metal-baseline.md` and `docs/runbooks/iac.md`
7. Add IaC validation to CI (terraform fmt, helm lint, tfsec, conftest)
8. Execute end-to-end deploy test
