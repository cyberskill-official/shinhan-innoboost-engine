# Secrets Management — Shinhan Innoboost Engine

> Configuration and operational guide for secrets management across environments.

**Owner**: eng-sec
**Last updated**: 2026-05-02
**Status**: DRAFT — Doppler project creation pending

---

## Strategy

- **Development**: `.env.local` (git-ignored) + Doppler CLI sync
- **CI/CD**: GitHub Actions secrets (org, repo, environment scoped)
- **Staging / Production**: Doppler (primary) with Kubernetes `ExternalSecret` operator pulling from Doppler
- **On-prem**: HashiCorp Vault (for air-gapped deployments)

---

## Secret Classification

| Tier | Examples | Storage | Rotation | Access |
|---|---|---|---|---|
| **Critical** | Anthropic API key, DB credentials, signing keys | Doppler `PRODUCTION` config | 90 days | Engine SA only |
| **High** | Slack webhook, Snyk token, GHCR token | Doppler `CI` config / GitHub secrets | 180 days | CI pipeline only |
| **Medium** | Feature flags, non-sensitive API keys | Doppler `DEVELOPMENT` config | Annual | Dev team |
| **Low** | Public keys, non-secret config | `.env.example` (committed) | N/A | Public |

---

## Doppler Configuration

### Project Structure

```
shinhan-innoboost-engine/
├── development     # Local dev defaults
├── staging         # Staging environment
├── production      # Production (locked, 2-person access)
└── ci              # GitHub Actions pipeline
```

### Setup Commands

```bash
# Install Doppler CLI
brew install dopplerhq/cli/doppler

# Login
doppler login

# Set up project (one-time)
doppler setup --project shinhan-innoboost-engine --config development

# Run with injected secrets
doppler run -- pnpm dev

# Sync to .env.local (for tools that need a file)
doppler secrets download --no-file --format env > .env.local
```

### Kubernetes Integration

```yaml
# infra/helm/templates/external-secret.yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: shinhan-engine-secrets
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: doppler-store
    kind: ClusterSecretStore
  target:
    name: shinhan-engine-secrets
    creationPolicy: Owner
  data:
    - secretKey: ANTHROPIC_API_KEY
      remoteRef:
        key: ANTHROPIC_API_KEY
    - secretKey: DATABASE_URL
      remoteRef:
        key: DATABASE_URL
    - secretKey: REDIS_URL
      remoteRef:
        key: REDIS_URL
```

---

## GitHub Actions Secrets

| Secret | Scope | Set By | Notes |
|---|---|---|---|
| `GITHUB_TOKEN` | Automatic | GitHub | Per-run; no management needed |
| `SLACK_WEBHOOK` | Repo | Ops lead | `#shinhan-innoboost-alerts` webhook |
| `SNYK_TOKEN` | Repo | Eng-sec | Snyk organisation token |
| `GCP_WIF_PROVIDER` | Env: staging | Platform eng | GCP Workload Identity Federation provider |
| `GCP_SA_EMAIL` | Env: staging | Platform eng | GKE deploy service account |
| `GKE_CLUSTER` | Env: staging | Platform eng | Cluster name |
| `GKE_ZONE` | Env: staging | Platform eng | Cluster zone |
| `DOPPLER_TOKEN` | Env: staging/prod | Eng-sec | Doppler service token |

---

## Rotation Calendar

| Secret | Rotation period | Next rotation | Owner |
|---|---|---|---|
| Anthropic API key | 90 days | TBD (after provisioning) | Engine lead |
| Database password | 90 days | TBD | Platform eng |
| Doppler service tokens | 180 days | TBD | Eng-sec |
| Snyk token | Annual | TBD | Eng-sec |
| Slack webhook | Annual | TBD | Ops lead |

---

## Anti-Patterns (DO NOT)

1. **Never commit secrets** to the repository — even in tests, even in comments, even "temporarily"
2. **Never log secrets** — mask them in all log output
3. **Never pass secrets via CLI arguments** — use environment variables
4. **Never store secrets in Kubernetes ConfigMaps** — use Secrets with encryption at rest
5. **Never share secrets via Slack or email** — use Doppler sharing or 1Password

---

## Audit

All secret access is logged in Doppler's audit trail. For on-prem Vault deployments, audit is via Vault's audit backend.

Quarterly review: eng-sec reviews all secret access logs and rotation compliance.
