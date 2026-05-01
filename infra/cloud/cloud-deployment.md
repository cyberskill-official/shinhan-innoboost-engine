# Cloud Deployment — Per-BU Namespace on GKE/EKS
## P10-T02

---

## 1. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                         │
│                    (GKE / EKS)                               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  ns: svfc    │  │  ns: bank    │  │  ns: sec     │      │
│  │              │  │              │  │              │      │
│  │  engine      │  │  engine      │  │  engine      │      │
│  │  hitl        │  │  hitl        │  │  hitl        │      │
│  │  ui (SF9)    │  │  ui (SB5)    │  │  ui (SS1)    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼──────┐      │
│  │                ns: shared-services                │      │
│  │                                                   │      │
│  │  postgres (Cloud SQL / RDS)                       │      │
│  │  redis (Memorystore / ElastiCache)                │      │
│  │  keycloak (shared IdP)                            │      │
│  │  loki + tempo + prometheus + grafana              │      │
│  └───────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Namespace Strategy

| Namespace | Contents | RBAC | Network Policy |
|---|---|---|---|
| `svfc` | Engine, HITL, UI (SF9 theme) | SVFC team only | Ingress from LB, egress to shared-services |
| `bank` | Engine, HITL, UI (SB5 theme) | Bank team only | Ingress from LB, egress to shared-services |
| `sec` | Engine, HITL, UI (SS1 theme) | Securities team only | Ingress from LB, egress to shared-services |
| `shared-services` | DB, Cache, IdP, Observability | Platform team | Ingress from BU namespaces only |
| `cert-manager` | TLS certificate automation | Cluster admin | Egress to ACME |

---

## 3. Terraform for Cloud Infrastructure

```hcl
# Per-BU deployment configuration

variable "business_units" {
  type = map(object({
    name          = string
    namespace     = string
    engine_replicas = number
    hitl_replicas   = number
    ui_replicas     = number
    domain         = string
    theme          = string
  }))
  default = {
    svfc = {
      name           = "SVFC Consumer Finance"
      namespace      = "svfc"
      engine_replicas = 2
      hitl_replicas   = 1
      ui_replicas     = 2
      domain         = "svfc.innoboost.cyberskill.io"
      theme          = "svfc-slate"
    }
    bank = {
      name           = "Shinhan Bank HO"
      namespace      = "bank"
      engine_replicas = 2
      hitl_replicas   = 1
      ui_replicas     = 2
      domain         = "bank.innoboost.cyberskill.io"
      theme          = "bank-navy"
    }
    sec = {
      name           = "Shinhan Securities"
      namespace      = "sec"
      engine_replicas = 3
      hitl_replicas   = 2
      ui_replicas     = 3
      domain         = "sec.innoboost.cyberskill.io"
      theme          = "securities-charcoal"
    }
  }
}

# GKE cluster
resource "google_container_cluster" "innoboost" {
  name     = "shinhan-innoboost"
  location = "asia-southeast1-a"  # Ho Chi Minh City

  node_pool {
    name       = "default-pool"
    node_count = 3
    node_config {
      machine_type = "e2-standard-4"
      disk_size_gb = 100
    }
  }
}

# Cloud SQL (Postgres)
resource "google_sql_database_instance" "main" {
  name             = "innoboost-db"
  database_version = "POSTGRES_16"
  region           = "asia-southeast1"

  settings {
    tier = "db-custom-2-8192"
    backup_configuration {
      enabled = true
      point_in_time_recovery_enabled = true
    }
    ip_configuration {
      private_network = google_compute_network.vpc.id
    }
  }
}

# Memorystore (Redis)
resource "google_redis_instance" "cache" {
  name           = "innoboost-cache"
  tier           = "STANDARD_HA"
  memory_size_gb = 2
  region         = "asia-southeast1"
}
```

---

## 4. Helm Deployment Commands

```bash
# Deploy per-BU with namespace isolation
for bu in svfc bank sec; do
  helm upgrade --install "innoboost-${bu}" ./infra/helm/shinhan-innoboost \
    --namespace "${bu}" --create-namespace \
    --values "./infra/helm/values-${bu}.yaml" \
    --set image.tag="${GIT_SHA}" \
    --set ingress.hosts[0].host="${bu}.innoboost.cyberskill.io" \
    --wait --timeout 5m
done

# Deploy shared services
helm upgrade --install innoboost-shared ./infra/helm/shared-services \
  --namespace shared-services --create-namespace \
  --values ./infra/helm/values-shared.yaml \
  --wait --timeout 10m
```

---

## 5. Per-BU TLS & OIDC

| BU | Domain | TLS Cert | OIDC Realm | OIDC Client |
|---|---|---|---|---|
| SVFC | svfc.innoboost.cyberskill.io | Let's Encrypt (auto) | `shinhan-svfc` | `innoboost-svfc` |
| Bank | bank.innoboost.cyberskill.io | Let's Encrypt (auto) | `shinhan-bank` | `innoboost-bank` |
| Securities | sec.innoboost.cyberskill.io | Let's Encrypt (auto) | `shinhan-sec` | `innoboost-sec` |
