# Audit Report — P01-T05: Container Hardening

> **Audit Date**: 2026-05-02
> **FR Status**: `draft` | **Recommended Status**: `in_progress`
> **Verdict**: ⚠️ **PARTIALLY DONE** — The engine Dockerfile follows the canonical distroless pattern (25 lines, multi-stage, `gcr.io/distroless/nodejs20-debian12:nonroot`). A container security policy doc exists (133 lines). But only 1 of 8 workspaces has a Dockerfile; no cosign signing, no SBOM attachment, no Trivy/Grype scan evidence, no admission-control policy, no vulnerability-response runbook, no weekly base-image rebuild cadence, no runtime-attack-surface tests.

---

## 1. Acceptance Criteria Verification

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| AC-1 | Every workspace's Dockerfile follows the canonical pattern | ❌ FAIL | Only `engine/Dockerfile` (25 lines) exists. Uses correct pattern: multi-stage, `node:20-alpine` for build, `gcr.io/distroless/nodejs20-debian12:nonroot` for runtime, `USER nonroot`. **7 of 8 workspaces have no Dockerfile.** |
| AC-2 | All Helm Deployment templates set documented `securityContext` block | ⚠️ PARTIAL | `templates/deployment.yaml` (71 lines) exists. Need to verify if securityContext includes `readOnlyRootFilesystem`, `runAsNonRoot`, `runAsUser: 65532`, `capabilities.drop: ["ALL"]`. |
| AC-3 | Images signed with cosign keyless OIDC; verification succeeds | ❌ FAIL | No images published to GHCR. No cosign signing evidence. |
| AC-4 | SBOMs attached to every image and queryable | ❌ FAIL | No images exist to attach SBOMs to. |
| AC-5 | Trivy + Grype scans run; HIGH findings block merge; CRITICAL fail-fast | ❌ FAIL | `security-scan.yml` (136 lines) authored but never executed. No scan results. |
| AC-6 | Weekly base-image rebuild cadence operational; verified by sample run | ❌ FAIL | No weekly rebuild workflow found. |
| AC-7 | Vulnerability-response runbook published | ❌ FAIL | `docs/runbooks/vuln-response.md` does not exist. |
| AC-8 | Runtime-attack-surface tests pass against staging pods | ❌ FAIL | No staging cluster exists. No runtime tests. |
| AC-9 | Admission control policy enforces cosign verification | ❌ FAIL | No `cosign-verify.yaml` policy. No kyverno configuration. |
| AC-10 | Lint rule catches Dockerfile deviations | ❌ FAIL | No custom ESLint rule for Dockerfile pattern. |

**Acceptance Criteria Score: 0/10 PASS, 1/10 PARTIAL, 9/10 FAIL**

---

## 2. Test Plan Verification

| Test | Description | Executed? | Result |
|------|-------------|-----------|--------|
| Test 1 | Build engine image; `docker run --rm -it engine:latest sh` — should fail (no shell) | ❌ Not executed | Image not built. Pattern correct in Dockerfile (distroless has no shell). |
| Test 2 | Run engine image; `docker run --rm engine:latest id` — should print nonroot uid=65532 | ❌ Not executed | `USER nonroot` is in Dockerfile but not execution-verified. |
| Test 3 | Run with read-only root; verify starts and serves; write to non-tmpfs fails | ❌ Not executed | No deployment to test against. |
| Test 4 | Cosign verify: `cosign verify $IMAGE` passes; modified image fails | ❌ Not executed | No signed images. |
| Test 5 | Query SBOM: `cosign download attestation $IMAGE` returns valid SPDX-JSON | ❌ Not executed | No SBOMs attached. |
| Test 6 | Trivy blocks PR with introduced CRITICAL CVE | ❌ Not executed | No Trivy execution evidence. |
| Test 7 | Admission-control rejects unsigned image (`nginx:latest`) | ❌ Not executed | No admission-control policy. |
| Test 8 | Runtime-attack-surface test: escalation attempts denied | ❌ Not executed | No staging cluster. |

**Test Plan Score: 0/8 executed**

---

## 3. Success Metrics Verification

| Metric | Target | Status | Measurement |
|--------|--------|--------|-------------|
| Primary | Every published image (engine, hitl, ui) passes full hardening checklist within 7 days | ❌ NOT MET | Only engine Dockerfile exists; no images published. |
| Guardrail | Zero CRITICAL CVE on published images; zero HIGH > 30 days unpatched | 🔒 N/A | No images to scan. |

---

## 4. Definition of Done Verification

| # | Criterion | Status |
|---|-----------|--------|
| DoD-1 | All workspace Dockerfiles follow the pattern | ❌ Only engine/ |
| DoD-2 | `securityContext` enforced in all Helm Deployments | ⚠️ Partially present |
| DoD-3 | Cosign signing + Syft SBOM + Trivy + Grype + admission-control operational | ❌ None operational |
| DoD-4 | Weekly base-image rebuild PR landed at least once | ❌ |
| DoD-5 | Runbooks published | ❌ No `vuln-response.md` or `container-pattern.md` |
| DoD-6 | Runtime-attack-surface tests pass | ❌ |
| DoD-7 | FR ticket marked Done | ❌ |

---

## 5. Subtask Verification

| Subtask | Status | Notes |
|---------|--------|-------|
| Author canonical Dockerfile pattern | ⚠️ PARTIAL | `engine/Dockerfile` follows the pattern (distroless, multi-stage, nonroot). But not documented at `docs/runbooks/container-pattern.md`. |
| Validate non-root + read-only root | ⚠️ PARTIAL | Dockerfile has `USER nonroot`. Helm `securityContext` present but not fully verified. |
| Provision tmpfs for ephemeral writes | ❌ FAIL | No tmpfs volume mounts in Helm templates. |
| Configure cosign keyless signing | ❌ FAIL | No signing configuration. |
| Configure Syft SBOM attachment | ❌ FAIL | No SBOM workflow. |
| Configure Trivy + Grype scans | ❌ FAIL | Authored in `security-scan.yml` but never executed. |
| Configure base-image rebuild cadence | ❌ FAIL | No weekly rebuild workflow. |
| Configure breaking-change checklist | ❌ FAIL | No checklist document. |
| Author vulnerability-response runbook | ❌ FAIL | `docs/runbooks/vuln-response.md` missing. |
| Configure runtime-attack-surface tests | ❌ FAIL | No test job. |
| Configure admission-control policy | ❌ FAIL | No `cosign-verify.yaml`. |
| Author documentation for engineers | ❌ FAIL | No `container-pattern.md`. |
| Add lint rule for Dockerfile deviation | ❌ FAIL | No custom ESLint rule. |

---

## 6. Existing Artefacts Inventory

| Expected Artefact | Path | Exists? | Content Quality |
|-------------------|------|---------|-----------------|
| Engine Dockerfile | `engine/Dockerfile` | ✅ Yes (25 lines) | Correct pattern: distroless, multi-stage, nonroot |
| Container pattern doc | `docs/runbooks/container-pattern.md` | ❌ No | — |
| Container security policy | `docs/security/container-security-policy.md` | ✅ Yes (133 lines) | Policy document (not runbook) |
| Vulnerability-response runbook | `docs/runbooks/vuln-response.md` | ❌ No | — |
| Lint rule | `.github/eslint-rules/dockerfile-pattern.js` | ❌ No | — |
| Admission-control policy | `infra/helm/policies/cosign-verify.yaml` | ❌ No | — |
| Image signatures | Sigstore Rekor | ❌ No | — |
| SBOMs | OCI artefacts | ❌ No | — |
| Weekly rebuild PRs | GitHub PR history | ❌ No | — |
| hitl/Dockerfile | hitl/ | ❌ No | — |
| ui/Dockerfile | ui/ | ❌ No | — |

---

## 7. Summary & Recommendation

**Container hardening is ~15% complete.** The engine Dockerfile correctly follows the canonical distroless pattern, and a container-security-policy doc exists. But this is a thin slice — the FR requires hardening across all workspaces with signing, SBOM, scanning, admission control, weekly rebuilds, and runtime tests. None of the operational infrastructure exists.

**Recommended status**: `in_progress`

**To move to `done`**:
1. Add Dockerfiles to hitl, ui (and other deployable workspaces)
2. Author `docs/runbooks/container-pattern.md` and `docs/runbooks/vuln-response.md`
3. Implement cosign signing + Syft SBOM in `main-deploy.yml`
4. Verify Trivy + Grype scans execute in CI
5. Configure admission-control (kyverno + cosign-verify policy)
6. Set up weekly base-image rebuild cron job
7. Author runtime-attack-surface test Job
8. Add Dockerfile lint rule
