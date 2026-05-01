# CI/CD Runbook — Shinhan Innoboost Engine

> How to operate, debug, and emergency-patch the CI/CD pipeline.

**Owner**: Platform engineering
**Last updated**: 2026-05-02
**Workflows**: `pr-check`, `main-deploy`, `release`, `security-scan`, `eval-harness`

---

## Architecture

```
Developer → PR → pr-check (lint, typecheck, test, build, containerise, trivy, semgrep, trufflehog, commitlint)
                     ↓ (merge to main)
              main-deploy (build+push GHCR, cosign sign, helm deploy staging, smoke, slack)
                     ↓ (tag v*.*.*)
              release (SLSA L3 provenance, SBOM, GitHub Release)

Nightly:     security-scan (trivy-full, snyk, semgrep, codeql, gpu-cost)
             eval-harness (full gold-set run)
```

---

## Debugging a Failing CI Run

### 1. Identify the failing job

- Go to **Actions** → click the failed run → find the red job
- Read the **last 20 lines** of the job log — the failure reason is almost always there

### 2. Common failures

| Symptom | Likely cause | Fix |
|---|---|---|
| `pnpm install` fails | Lock file mismatch | Run `pnpm install` locally, commit `pnpm-lock.yaml` |
| `typecheck` fails | New TypeScript error | Fix the type error locally |
| `trivy-scan` blocks merge | Critical CVE in dependency | Update the dependency; if no fix exists, document exception |
| `secret-scan` fails | Secret pattern detected | Remove the secret; rotate if it was ever committed |
| `commit-validation` fails | Non-conventional commit | Rebase and rewrite the commit message |
| `containerise` fails | Dockerfile syntax or missing files | Build locally: `docker build -f engine/Dockerfile .` |

### 3. Rerunning a job

- Click **Re-run failed jobs** in the Actions UI
- For flaky tests: re-run once; if it fails again, it's a real bug

---

## Emergency Merge Process

> Use ONLY for Critical CVEs with active exploitation.

1. **Two-eye approval**: Founder (@stephen-cheng) + engineering tech lead must both approve
2. **Bypass branch protection**: Admin can merge without status checks using admin override
3. **Document immediately**: Add entry to `docs/audit/emergency-merges.md` within 1 hour:
   ```
   ## YYYY-MM-DD — [CVE-ID or description]
   - **Reason**: [why emergency merge was needed]
   - **Approvers**: [who approved]
   - **PR**: [link]
   - **Post-merge CI result**: [pass/fail]
   - **Retroactive review**: [completed/pending]
   ```
4. **Retroactive review**: Within 24 hours, the skipped checks must be re-run and any failures addressed

---

## Rolling Back Staging

```bash
# List recent releases
helm history shinhan-innoboost -n staging

# Roll back to previous revision
helm rollback shinhan-innoboost [REVISION] -n staging

# Verify rollback
kubectl get pods -n staging -w
```

---

## Retriggering a Failed Deploy

```bash
# Option 1: Re-run from GitHub UI
# Go to Actions → main-deploy → Re-run all jobs

# Option 2: Push an empty commit to trigger
git commit --allow-empty -m "chore: retrigger deploy"
git push origin main
```

---

## Reading SBOM and Provenance

```bash
# View SBOM for an image
cosign download sbom ghcr.io/cyberskill-official/shinhan-innoboost/engine:v1.0.0

# Verify cosign signature
cosign verify \
  --certificate-identity-regexp="https://github.com/cyberskill-official/*" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com" \
  ghcr.io/cyberskill-official/shinhan-innoboost/engine:v1.0.0

# Verify SLSA provenance (for releases)
slsa-verifier verify-image \
  ghcr.io/cyberskill-official/shinhan-innoboost/engine:v1.0.0 \
  --source-uri github.com/cyberskill-official/shinhan-innoboost-engine
```

---

## Secrets Reference

| Secret | Scope | Purpose | Rotation |
|---|---|---|---|
| `GITHUB_TOKEN` | Auto | Image push, PR comments | Auto (per-run) |
| `SLACK_WEBHOOK` | Repo | Deployment notifications | Annual |
| `SNYK_TOKEN` | Repo | Dependency scanning | Annual |
| `GCP_WIF_PROVIDER` | Environment: staging | OIDC federation to GKE | N/A (identity) |
| `GCP_SA_EMAIL` | Environment: staging | GKE deploy SA | N/A (identity) |
| `GKE_CLUSTER` | Environment: staging | Cluster name | On cluster change |
| `GKE_ZONE` | Environment: staging | Cluster zone | On cluster change |
| `STAGING_URL` | Environment: staging | Smoke test target | On URL change |

---

## Performance Budget

| Workflow | Target | Action if exceeded |
|---|---|---|
| pr-check | < 8 min median | Profile cache hits; parallelise; split slow tests |
| main-deploy | < 12 min | Optimise Docker layer cache; reduce Helm timeout |
| release | < 15 min | Acceptable; provenance adds ~2 min |
| security-scan | < 30 min | Acceptable for nightly |
| eval-harness (incremental) | < 5 min | Only run changed metrics |
| eval-harness (full) | < 20 min | Acceptable for nightly |
