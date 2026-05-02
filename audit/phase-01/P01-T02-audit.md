# Audit Report — P01-T02: CI/CD Pipeline

> **Audit Date**: 2026-05-02
> **FR Status**: `in_progress` | **Recommended Status**: `in_progress`
> **Verdict**: ⚠️ **PARTIALLY DONE** — All 5 required workflow files exist with substantial content (610 lines total). CI/CD runbook authored. But zero workflows have been verified by actual execution, no Makefile, no compliance one-pager, no GitHub Environments configuration, no OIDC federation. Cosign signing, SBOM, SLSA provenance are authored in YAML but unverified.

---

## 1. Acceptance Criteria Verification

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| AC-1 | All five workflows operational and passing on the Phase-1 skeleton (P01-T01) | ⚠️ PARTIAL | All 5 YAML files exist: `pr-check.yml` (135 lines), `main-deploy.yml` (121 lines), `release.yml` (124 lines), `security-scan.yml` (136 lines), `eval-harness.yml` (94 lines). **Zero have been verified by actual GitHub Actions execution.** |
| AC-2 | Container images signed with cosign keyless OIDC; SBOMs attached; verified by `cosign verify` | ❌ FAIL | Cosign signing steps likely authored in `main-deploy.yml` and `release.yml` YAML but **no images in GHCR to verify against**. No `cosign verify` evidence. |
| AC-3 | Staging environment auto-deploys from `main`; smoke-test passes; engine health endpoint reachable | ❌ FAIL | `main-deploy.yml` exists but **no staging deployment has occurred**. No health endpoint evidence. No GitHub Environments configured (repo-verifiable via Settings). |
| AC-4 | Required status checks enforced on `main`; verified by attempting PR-check failure | 🔒 BLOCKED | GitHub branch protection setting; not repo-verifiable. |
| AC-5 | SLSA Level 3 provenance attestation produced on a sample release tag; verifiable by `slsa-verifier` | ❌ FAIL | `release.yml` exists with provenance steps but **no release tags pushed**, no attestation artefacts. |
| AC-6 | Runbook published; compliance one-pager in dossier folder | ⚠️ PARTIAL | `docs/runbooks/cicd.md` ✅ (142 lines). **No `compliance/cicd-one-pager.md`**. |
| AC-7 | Median PR-check runtime < 8 minutes (measured over first 10 PRs) | ❌ FAIL | No PR-check executions to measure. |
| AC-8 | Secret-scan does not flag any false-positive on the skeleton; no real secret detected | 🔒 BLOCKED | Requires actual `secret-scan` job execution. |

**Acceptance Criteria Score: 0/8 PASS, 2/8 PARTIAL, 4/8 FAIL, 2/8 BLOCKED**

---

## 2. Test Plan Verification

| Test | Description | Executed? | Result |
|------|-------------|-----------|--------|
| Test 1 | Open a sample PR with no changes → all five workflows pass; PR-check runtime measured | ❌ Not executed | No PR history observed. |
| Test 2 | PR introducing critical-severity vulnerability → `trivy-scan` should fail | ❌ Not executed | No Trivy execution evidence. |
| Test 3 | PR with hardcoded secret pattern → `secret-scan` should fail | ❌ Not executed | No TruffleHog execution evidence. |
| Test 4 | PR with non-conventional commit → `commit-validation` should fail | ❌ Not executed | No commit-validation execution evidence. |
| Test 5 | Merge PR to `main` → image pushed to GHCR; staging deployed; smoke-test; Slack notified | ❌ Not executed | No main-deploy run evidence. |
| Test 6 | Push `v0.1.0` tag → SLSA provenance; cosign verification; SLSA verifier passes | ❌ Not executed | No release tags pushed. |
| Test 7 | Nightly `security-scan` runs; reports cleanly | ❌ Not executed | No nightly run evidence. |
| Test 8 | Emergency-merge scenario — verify documented process followed and audited | ❌ Not executed | No emergency-merge scenarios tested. |

**Test Plan Score: 0/8 executed**

---

## 3. Success Metrics Verification

| Metric | Target | Status | Measurement |
|--------|--------|--------|-------------|
| Primary | All five workflows green on Phase-1 skeleton within 5 days | ❌ NOT MET | Workflows exist as YAML but zero have executed green. |
| Guardrail | PR-check median runtime < 8 min; stays under 12 min throughout engine build | ❌ NOT MET | No runtime data. |

---

## 4. Definition of Done Verification

| # | Criterion | Status |
|---|-----------|--------|
| DoD-1 | Five workflows operational and green | ❌ Written but not executed |
| DoD-2 | Container signing, SBOM, SLSA provenance verified on sample release | ❌ No release exists |
| DoD-3 | Staging environment auto-deploys; smoke-test passes | ❌ No deployment |
| DoD-4 | Required status checks enforced | 🔒 BLOCKED |
| DoD-5 | Runbook and compliance one-pager published | ⚠️ Runbook ✅; one-pager ❌ |
| DoD-6 | Median PR-check runtime measured and on-target | ❌ No data |
| DoD-7 | FR ticket marked Done with links to artefacts | 🔒 BLOCKED |

---

## 5. Subtask Verification

| Subtask | Status | Notes |
|---------|--------|-------|
| Workflow 1: `pr-check.yml` | ⚠️ PARTIAL | File exists (135 lines). Content authored. Not executed. |
| Workflow 2: `main-deploy.yml` | ⚠️ PARTIAL | File exists (121 lines). Content authored. Not executed. |
| Workflow 3: `release.yml` | ⚠️ PARTIAL | File exists (124 lines). Content authored. Not executed. |
| Workflow 4: `security-scan.yml` | ⚠️ PARTIAL | File exists (136 lines). Content authored. Not executed. |
| Workflow 5: `eval-harness.yml` | ⚠️ PARTIAL | File exists (94 lines). Content authored. Not executed. |
| GitHub Environments configuration | ❌ FAIL | No environment configuration evidence. |
| Secrets management (CI secrets) | 🔒 BLOCKED | GitHub Secrets are not repo-verifiable. |
| OIDC federation to cloud providers | ❌ FAIL | No OIDC federation configuration found. |
| Renovate compatibility | ❌ FAIL | No Renovate configured (P01-T01 gap cascades). |
| Required status checks | 🔒 BLOCKED | GitHub settings. |
| CI runtime budget (tuning) | ❌ FAIL | No execution data to tune. |
| Author runbook | ✅ PASS | `docs/runbooks/cicd.md` (142 lines) |
| Compliance one-pager | ❌ FAIL | No `compliance/cicd-one-pager.md` |

---

## 6. Existing Artefacts Inventory

| Expected Artefact | Path | Exists? | Content Quality |
|-------------------|------|---------|-----------------|
| `pr-check.yml` | `.github/workflows/` | ✅ Yes (135 lines) | Authored, unverified |
| `main-deploy.yml` | `.github/workflows/` | ✅ Yes (121 lines) | Authored, unverified |
| `release.yml` | `.github/workflows/` | ✅ Yes (124 lines) | Authored, unverified |
| `security-scan.yml` | `.github/workflows/` | ✅ Yes (136 lines) | Authored, unverified |
| `eval-harness.yml` | `.github/workflows/` | ✅ Yes (94 lines) | Authored, unverified |
| CI/CD runbook | `docs/runbooks/cicd.md` | ✅ Yes (142 lines) | Good |
| Compliance one-pager | `compliance/cicd-one-pager.md` | ❌ No | — |
| Makefile | root | ❌ No | — |
| Container images in GHCR | `ghcr.io/cyberskill-official/*` | ❌ No | — |
| Image signatures | Sigstore Rekor | ❌ No | — |
| SBOMs | OCI artefacts | ❌ No | — |
| SLSA provenance | Release tags | ❌ No | — |
| Secrets manifest | `docs/runbooks/secrets-manifest.md` | ❌ No | — |
| Emergency-merge audit log | `docs/audit/emergency-merges.md` | ❌ No | — |

---

## 7. Summary & Recommendation

**The CI/CD pipeline is ~30% complete.** All 5 workflow YAML files are authored with substantial content, and the CI/CD runbook is published. But CI/CD is inherently a runtime concern — authored YAML that has never executed provides zero confidence. No images have been pushed, signed, or attested. No staging deployment exists. No PR-check has ever run.

**Recommended status**: `in_progress` — substantial execution work remains.

**To move to `done`**:
1. Push a test PR and verify `pr-check.yml` passes end-to-end
2. Merge to `main` and verify `main-deploy.yml` deploys to staging
3. Push a `v0.1.0` tag and verify SLSA provenance + cosign signing
4. Measure PR-check median runtime
5. Author `compliance/cicd-one-pager.md`
6. Add Makefile with common dev targets
7. Configure GitHub Environments (staging, production-rehearsal, production-shinhan-poc)
