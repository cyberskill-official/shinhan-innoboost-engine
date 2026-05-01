# Container Security Policy — Shinhan Innoboost Engine

> Rules for building, scanning, and running containers in this project.

**Owner**: eng-sec
**Last updated**: 2026-05-02
**Enforced by**: P01-T02 CI/CD pipeline

---

## Base Image Policy

| Tier | Image | Usage | Justification |
|---|---|---|---|
| **Runtime** | `gcr.io/distroless/nodejs20-debian12:nonroot` | All production containers | No shell, no package manager, minimal attack surface |
| **Debug** | `gcr.io/distroless/nodejs20-debian12:debug` | Local debugging only | Has busybox shell for inspection |
| **Build** | `node:20-alpine` | Multi-stage build phase | Needed for `pnpm install` and `tsc` |

### Rules

1. **No `node:*` images in runtime stage** — distroless only
2. **No `:latest` tags for base images** — pin to digest where possible
3. **No `apt-get install`** — if you need a runtime dependency, add it at build-time and COPY the binary
4. **All containers run as `nonroot` (UID 65534)** — enforced by `USER nonroot` directive and Helm pod security context

---

## Dockerfile Pattern

Every workspace follows this multi-stage pattern:

```dockerfile
# syntax=docker/dockerfile:1.7

# Stage 1: Dependencies (cached aggressively)
FROM node:20-alpine AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
RUN --mount=type=cache,target=/root/.pnpm-store \
    npm install -g pnpm@9 && \
    pnpm install --frozen-lockfile --prod

# Stage 2: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm install -g pnpm@9 && \
    pnpm install --frozen-lockfile && \
    pnpm turbo run build --filter=@cyberskill/shinhan-{workspace}

# Stage 3: Runtime (distroless)
FROM gcr.io/distroless/nodejs20-debian12:nonroot AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/{workspace}/dist ./dist
COPY --from=build /app/{workspace}/package.json ./package.json
USER nonroot
EXPOSE {port}
CMD ["dist/index.js"]
```

---

## SBOM Generation

Every container image MUST have a Software Bill of Materials attached.

- **Tool**: Syft (via `anchore/sbom-action` in CI)
- **Format**: SPDX JSON
- **Storage**: OCI artefact attached to the image in GHCR
- **Verification**: `cosign download sbom {image}`

---

## Image Signing

All images pushed to GHCR are signed with Sigstore cosign (keyless OIDC).

- **Signing identity**: GitHub Actions OIDC token
- **Transparency log**: Rekor
- **Verification**: See `docs/runbooks/cicd.md`

---

## Pod Security Standards

Enforced via Helm `values.yaml` and Kubernetes Pod Security Admission:

```yaml
podSecurityContext:
  runAsNonRoot: true
  runAsUser: 65534
  fsGroup: 65534
  seccompProfile:
    type: RuntimeDefault

containerSecurityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
      - ALL
```

---

## Scanning Policy

| Scan | Trigger | Severity gate | Action on failure |
|---|---|---|---|
| Trivy (PR) | Every PR | CRITICAL blocks merge | Fix or document exception |
| Trivy (nightly) | Daily at 2am UTC | HIGH + CRITICAL → issue | Triage within 48h |
| Snyk (nightly) | Daily at 2am UTC | CRITICAL → issue | Triage within 24h |
| SBOM drift | On release | Any new unlicensed dep | Block release |

---

## Registry Hygiene

- **Retention**: Keep last 10 `:main-*` tags; keep all `:v*` tags indefinitely
- **Cleanup**: Monthly manual review of stale images
- **Access**: Read access for all squad members; write access for CI only

---

## Emergency Image Override

In case of a critical vulnerability in a base image:

1. Update the Dockerfile with the patched base image
2. Follow the emergency merge process (see `docs/runbooks/cicd.md`)
3. The new image will be auto-deployed to staging via `main-deploy`
4. Verify the fix in staging before tagging a release
