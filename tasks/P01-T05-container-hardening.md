---
title: "Harden container builds (distroless, SBOM, signing, non-root)"
author: "@cyberskill-eng-sec"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: not_ai
target_release: "2026-05-15"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Harden the container build pipeline for every workspace's runtime image: distroless base (`gcr.io/distroless/nodejs20-debian12:nonroot`), multi-stage builds with the build toolchain stripped from the runtime image, non-root UID with read-only root filesystem, dropped Linux capabilities, no shell in the runtime, image signed with Sigstore cosign keyless OIDC, SBOM attached via Syft as an OCI artefact, image-vulnerability scan via Trivy and Grype on every build, and a documented base-image upgrade cadence with breaking-change checklist. The hardened container is the canonical runtime artefact for the engine, hitl, and ui workspaces; on-prem deployment (P10-T03) ships exactly this image set in the air-gap bundle. Without container hardening, every "secure by default" claim in the pitch is rhetorical.

## Problem

A demo container that ships with bash, curl, busybox, package managers, and dozens of unrelated system libraries is a much larger attack surface than a banking-sector reviewer will accept. The Innoboost Q&A's Section VI confirms commercialisation requires "deployed per SBV regulations"; Vietnamese banking IT regulation (Circular 09/2020/TT-NHNN) and the new Cybersecurity Law (effective 1 July 2026) both expect strong runtime-isolation controls, which directly imply minimal container surfaces.

Specific gaps if we shortcut:

- **Default Node images (`node:20-bullseye`) ship ~1 GB of unrelated packages.** Each package is a potential CVE, a potential supply-chain risk, a potential attack vector via path manipulation. Distroless ships only what runs; the surface is ~80 MB and contains no shell, no package manager, no debug utilities.
- **Without non-root users, a process compromise pivots to host-level access.** Distroless `:nonroot` ships with a fixed `nonroot` user (UID 65532) by default; combined with Pod Security Standard `restricted` (P01-T04) the runtime cannot escalate.
- **Without read-only root, an attacker who lands inside the container can write payloads to `/tmp` or `/etc`.** Read-only root + tmpfs `/tmp` means writes are ephemeral and bounded.
- **Without dropped capabilities, the container has Linux capabilities it doesn't need.** Drop `ALL`, add only the minimum (often nothing for a Node service).
- **Without image signing, the deployment can't verify what it's running.** Sigstore cosign signs at build, the deployment verifies at pull. A swapped image is detectable.
- **Without SBOM, vulnerability response is manual.** When a Critical CVE in a transitive dependency is announced, the SBOM tells us in seconds whether we are affected. Without SBOM, that question takes days.
- **Without base-image upgrade discipline, base CVEs accumulate.** The distroless base is rebuilt frequently; we must consume those rebuilds with predictable cadence.

The `feedback_p1_scope_preference` memory note biases us richer. For container hardening, "richer" means: distroless + non-root + read-only + capability-drop + signing + SBOM + scan + cadence — all of them, not a subset. Each is cheap; together they form a defensive-in-depth posture that financial reviewers recognise instantly.

There is also a downstream-multiplier dimension: every Phase 2+ runtime image inherits this hardening recipe. P02-T02 (NL→SQL) ships an engine image; P05 (UI) ships a Next.js image; P06-T02 (HITL console) ships another UI image; P07-T01 (vibe-coding starter kit) ships a development image. A single hardening recipe applied to all of them is the structural enforcement of "every container we ship is hardened."

## Proposed Solution

A common container-hardening recipe encoded in (a) a base Dockerfile fragment that every workspace's Dockerfile extends, (b) CI gates in `pr-check.yml` (P01-T02) that fail the build on any deviation, (c) a documented upgrade cadence with a breaking-change checklist, and (d) a runbook for vulnerability response. The recipe: distroless `gcr.io/distroless/nodejs20-debian12:nonroot` base; multi-stage build (build toolchain in stage 1, runtime in stage 2); UID 65532 (nonroot); read-only root filesystem; drop `ALL` capabilities; no shell; cosign keyless signing; Syft SBOM attached as OCI artefact; Trivy + Grype scan; weekly base-image rebuild check.

### Subtasks

- [ ] **Author the canonical Dockerfile pattern.** Document at `docs/runbooks/container-pattern.md` with a reference Dockerfile that every workspace's Dockerfile mirrors. Pattern:
  ```dockerfile
  # syntax=docker/dockerfile:1.7
  FROM node:20-alpine AS deps
  WORKDIR /app
  COPY pnpm-lock.yaml package.json ./
  RUN --mount=type=cache,target=/root/.pnpm-store \
      pnpm install --frozen-lockfile --prod

  FROM node:20-alpine AS build
  WORKDIR /app
  COPY . .
  RUN pnpm install --frozen-lockfile && pnpm turbo run build --filter=@cyberskill/shinhan-engine

  FROM gcr.io/distroless/nodejs20-debian12:nonroot AS runtime
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY --from=build /app/engine/dist ./dist
  COPY --from=build /app/engine/package.json ./package.json
  USER nonroot
  EXPOSE 4000
  CMD ["dist/index.js"]
  ```
- [ ] **Validate non-root + read-only root.** Dockerfile uses `USER nonroot`; Helm Deployment template (P01-T04) sets `securityContext.readOnlyRootFilesystem: true`, `securityContext.runAsNonRoot: true`, `securityContext.runAsUser: 65532`, `securityContext.runAsGroup: 65532`, `securityContext.allowPrivilegeEscalation: false`, `securityContext.capabilities.drop: ["ALL"]`, `securityContext.seccompProfile.type: RuntimeDefault`.
- [ ] **Provision tmpfs for ephemeral writes.** Pods that need writable space (e.g., for vLLM cache scratch) get a `volumes:` mount of `emptyDir: { medium: Memory, sizeLimit: "1Gi" }` mounted at `/tmp`. Application code never writes outside `/tmp`.
- [ ] **Configure cosign keyless signing.** `main-deploy.yml` (P01-T02) signs every published image via cosign keyless OIDC. Verification at deploy time via `cosign verify --certificate-identity-regexp "^https://github.com/cyberskill-official/shinhan-innoboost-engine/" --certificate-oidc-issuer "https://token.actions.githubusercontent.com" $IMAGE`. Verification failure blocks the deploy.
- [ ] **Configure Syft SBOM attachment.** After image push, run `syft <image> -o spdx-json` and attach as OCI artefact via `cosign attest`. SBOM is then queryable: `cosign download attestation $IMAGE | jq '.payload | @base64d | fromjson'`.
- [ ] **Configure Trivy + Grype scans.** Both scanners run on every published image (Trivy is the primary in `pr-check`; Grype is a secondary nightly run for cross-validation, since different scanners have different CVE coverage). Findings ≥ HIGH block the merge; CRITICAL is fail-fast.
- [ ] **Configure base-image rebuild cadence.** Weekly job on Friday: pull latest distroless base; rebuild all images; run full scan; if base has new CVE patches, this picks them up automatically without manual intervention.
- [ ] **Configure breaking-change checklist for base-image upgrade.** When the distroless base does a major-version upgrade (e.g., Node 20 → Node 22 base), follow a documented checklist: pin to specific patch version; staged rollout (dev → staging → production-rehearsal); regression test against gold-set; revert plan documented before upgrade.
- [ ] **Author the vulnerability-response runbook.** `docs/runbooks/vuln-response.md`: when a Critical CVE in a dependency is announced, what's the procedure? Steps: query SBOM to find affected images; determine exposure (is the affected dep on the runtime path or only build-time?); if runtime-affecting, trigger emergency rebuild; if not, schedule normal patch.
- [ ] **Configure runtime-attack-surface tests.** A Kubernetes Job pattern that runs against a production-rehearsal pod and asserts: cannot exec into a shell (no shell exists); cannot become root; cannot mount the host filesystem; cannot escape the namespace. Run as part of post-deploy smoke (P01-T02 `main-deploy`).
- [ ] **Configure image-attestation policies in admission control.** Cluster-side: `policy/cosign-verify.yaml` (using `policy-controller` or `kyverno`) ensures only signed images from `ghcr.io/cyberskill-official/*` can run in the cluster. Unsigned images are rejected at admission.
- [ ] **Author documentation for engineers.** `docs/runbooks/container-pattern.md` includes a "common gotchas" section: distroless has no shell so `RUN apt-get install` fails; the user is `nonroot` so file permissions matter; read-only root means writes only to `/tmp` (mounted tmpfs); etc.
- [ ] **Add lint rule.** ESLint custom rule (or commit-time check) that flags any Dockerfile in the repo not following the pattern. Specifically: must have multi-stage; must use distroless `:nonroot` base for the runtime stage; must not include `RUN sudo`; etc.

### Acceptance criteria

- Every workspace's Dockerfile follows the canonical pattern.
- All Helm Deployment templates set the documented `securityContext` block.
- Images are signed with cosign keyless OIDC; verification succeeds.
- SBOMs are attached to every image and queryable.
- Trivy + Grype scans run; HIGH findings block merge; CRITICAL findings fail-fast.
- Weekly base-image rebuild cadence operational; verified by a sample weekly run.
- Vulnerability-response runbook published.
- Runtime-attack-surface tests pass against staging pods.
- Admission control policy enforces cosign verification.
- Lint rule catches Dockerfile deviations.

## Alternatives Considered

- **Use the standard `node:20-slim` base.** Rejected: still ships with a shell and a package manager; surface is much larger than distroless; more CVE exposure.
- **Use Alpine (`node:20-alpine`).** Rejected as runtime: musl-based libc has subtle Node.js compatibility quirks; less standard for production; community-maintained patches lag glibc-based images. Acceptable for the build stage.
- **Build a custom distroless equivalent from scratch (using Wolfi or Chainguard's tooling).** Rejected for demo phase: more setup time; the Google distroless images are well-vetted and free. Reconsider for production track if the supply-chain story needs further hardening.
- **Use Wolfi-based images (`cgr.dev/chainguard/node`).** Rejected as primary for demo phase but considered as a future-state alternative; Wolfi has better SBOM and supply-chain provenance, but Chainguard's free tier has limitations and the paid tier adds cost.
- **Skip cosign signing; rely on registry-side image-pull authentication.** Rejected: GHCR auth proves you can pull; signing proves the image is what we built. Different concern.
- **Skip SBOM; produce on demand when needed.** Rejected: SBOM is cheapest at build time; producing later requires reconstructing the image dependencies, which loses information.
- **Run as root inside the container, on the assumption that container isolation is enough.** Rejected: defence-in-depth — if a container escape happens, root inside the container becomes root on the host. Non-root is the cheapest possible mitigation.

## Success Metrics

- **Primary**: Every published image (engine, hitl, ui) passes the full hardening checklist within 7 days of task assignment. Measured by: a CI job `verify-hardening` that asserts every checklist item is in place; passes for all images.
- **Guardrail**: Zero CRITICAL CVE findings on published images for the duration of the engagement; zero HIGH CVE findings older than 30 days unpatched. Measured by: nightly `security-scan.yml` (P01-T02) results.

## Scope

### In scope
- Canonical Dockerfile pattern + reference template.
- Helm `securityContext` defaults.
- Cosign signing + verification.
- Syft SBOM + Trivy + Grype scanning.
- Weekly base-image rebuild cadence.
- Vulnerability-response runbook.
- Runtime-attack-surface tests.
- Admission-control policy.
- Lint rule for Dockerfile deviation.
- Engineer-facing documentation with common-gotchas section.

### Out of scope
- Image hardening for non-runtime artefacts (eval-output bundles, data generators — they don't ship as runtime).
- Network policy (handled in P01-T10).
- Application-level security (handled in Phase 2 and Phase 8).
- Runtime-monitoring agents (handled in P09 if needed).
- Custom kernel hardening on the bare-metal baseline (deferred unless required).

## Dependencies

- **Upstream**: P01-T01 (monorepo skeleton); P01-T02 (CI/CD pipeline for signing + scanning hooks); P01-T04 (IaC for `securityContext` enforcement at admission).
- **People**: eng-sec authoring; platform engineer for admission-control policy; engine tech lead for engineer-facing docs.
- **External**: Distroless registry (`gcr.io/distroless/*`); Sigstore (`fulcio.sigstore.dev`, `rekor.sigstore.dev`); Syft, Trivy, Grype tooling.
- **Memory references**: `cyberos_data_residency`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: For runtime images that need TLS root certificates (e.g., to call Anthropic API), distroless ships with `/etc/ssl/certs/ca-certificates.crt` — confirm this is current and sufficient.
- Q2: For Node.js, distroless's CMD entry assumes `dist/index.js`. Some workspaces may use ESM with different entry shape; confirm during integration.
- Q3: For Sigstore Rekor outage, do we cache the signature locally for offline-verify? Recommendation: yes — `cosign verify --offline` mode with a local Rekor mirror in production deployments where Sigstore is reachable; for air-gap, ship the signature with the image bundle.
- Q4: Admission-control with `policy-controller` (Sigstore) or `kyverno` (broader policy)? Recommendation: kyverno for the broader policy library; cosign verification is one rule among many.
- Q5: For the bare-metal baseline (P01-T04), does kyverno install cleanly? Verify.

## Implementation Notes

- Distroless images don't have a shell; debug by overlaying a debug image (`distroless/nodejs20-debian12:debug-nonroot`) only in non-production environments. Production never gets the debug variant.
- For Sigstore keyless signing, the OIDC identity is `https://github.com/cyberskill-official/shinhan-innoboost-engine/.github/workflows/main-deploy.yml@refs/heads/main`. Verification anchors on this regex; PRs are not signed (only main-deploy and release).
- Multi-stage build's first stage installs all dependencies including dev-dependencies; second stage installs only `--prod` and copies build output. Trim aggressively.
- For the `engine/` workspace specifically, the runtime needs to reach Postgres and Anthropic API; verify the distroless image has correct DNS resolution and TLS chain. (It does, but worth verifying.)
- For Trivy, configure to fail on "fixed" severity HIGH/CRITICAL CVEs; allow "unfixed" CVEs (where no upstream patch exists) with documented justification.
- For Grype, the secondary scanner runs nightly and uses a different CVE database (Anchore vs. Trivy's). Cross-checking different scanners is a defence-in-depth pattern.
- The weekly base-image rebuild is a chore that auto-completes; configure it as a GitHub Actions cron job that opens a PR with the new image SHA. Auto-merge if all scans pass; manual review otherwise.

## Test Plan

- Test 1: Build engine image; inspect via `docker run --rm -it engine:latest sh` — should fail (no shell). Pass criterion: command fails with "executable not found".
- Test 2: Build engine image; run as `docker run --rm engine:latest id` — should print `nonroot uid=65532`. Pass criterion: confirmed nonroot.
- Test 3: Run engine image with read-only root mounted; verify it starts and serves traffic; confirm any write attempt to non-tmpfs paths fails.
- Test 4: Verify cosign signing: `cosign verify $IMAGE` should pass; modify a byte in the image, re-tag, re-verify — should fail.
- Test 5: Query SBOM: `cosign download attestation $IMAGE` should return a valid SBOM SPDX-JSON.
- Test 6: Trivy scan blocks PR with introduced CRITICAL CVE: introduce a known-vulnerable dep version; expect PR-check to fail.
- Test 7: Admission-control policy rejects unsigned image: try to deploy `nginx:latest` (unsigned by us); expect rejection.
- Test 8: Runtime-attack-surface test passes: a Job that attempts to escalate (try to mount `/var/run/docker.sock`, try `setuid`, etc.) should be denied.

## Rollback Plan

- A breaking change in distroless base is rolled back by pinning to the previous SHA-tagged variant. Distroless tags are SHA-pinned by default.
- A signing-policy issue is rolled back by deactivating the admission-control policy temporarily; investigate and re-enable.
- A scanner false-positive blocking real PRs is rolled back by exception in the scanner config (with documented justification); never blanket-disable a rule.
- A vulnerability-response false alarm doesn't trigger emergency rebuild; the runbook has a "is this on runtime path?" gate before emergency action.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Container pattern doc | `docs/runbooks/container-pattern.md` | Eng-sec | Continuous |
| Vulnerability-response runbook | `docs/runbooks/vuln-response.md` | Eng-sec | Continuous |
| Lint rule | `.github/eslint-rules/dockerfile-pattern.js` | Eng-sec | Continuous |
| Admission-control policy | `infra/helm/policies/cosign-verify.yaml` | Eng-sec | Continuous |
| Sample image manifest | GHCR | Eng-sec | Indefinite |
| Image signatures | Sigstore Rekor | Eng-sec | Indefinite |
| SBOMs | OCI artefacts attached to images | Eng-sec | 7 years |
| Weekly base-image rebuild PRs | GitHub PR history | Eng-sec | Per GitHub retention |
| Vulnerability-response logs | `docs/audit/vuln-response/{date}.md` | Eng-sec | 7 years |

## Operational Risks

- **Distroless image breaking change.** Mitigation: pin to specific SHA; weekly rebuild PRs are auto-tested; staged rollout.
- **Sigstore Rekor outage.** Mitigation: offline-verify mode; local Rekor cache.
- **Scanner false positive flood.** Mitigation: exception with justification; never blanket-disable.
- **Admission-control policy locks out a needed system pod (e.g., a third-party Helm chart's image).** Mitigation: explicit allow-list for known third-party images; policy applies to our images strictly.
- **Read-only root breaks a library that assumes `/var` is writable.** Mitigation: tmpfs mount at `/var` if needed; documented per workspace.

## Definition of Done

- All workspace Dockerfiles follow the pattern.
- `securityContext` enforced in all Helm Deployments.
- Cosign signing + Syft SBOM + Trivy + Grype + admission-control all operational.
- Weekly base-image rebuild PR landed at least once.
- Runbooks published.
- Runtime-attack-surface tests pass.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: eng-sec ratifies; platform engineer reviews admission-control policy; `@stephen-cheng` ratifies vulnerability-response process.
