# Air-Gapped On-Prem Deployment Bundle & Sizing Guide
## P10-T03

---

## 1. Air-Gap Install Bundle

### Bundle Contents

```
shinhan-innoboost-airgap-v0.1.0.tar.gz
├── images/                           # All container images (OCI format)
│   ├── engine-v0.1.0.tar
│   ├── hitl-v0.1.0.tar
│   ├── ui-v0.1.0.tar
│   ├── postgres-16-alpine.tar
│   ├── redis-7-alpine.tar
│   ├── keycloak-25.0.tar
│   ├── qwen-7b-awq.tar              # Offline LLM (8 GB)
│   ├── grafana-10.4.0.tar
│   ├── prometheus-v2.51.0.tar
│   ├── loki-3.0.0.tar
│   └── tempo-2.4.1.tar
├── helm/                             # Helm charts
│   ├── shinhan-innoboost/
│   └── shared-services/
├── models/                           # LLM model weights
│   └── qwen-7b-instruct-awq/        # 4-bit quantised (~4 GB)
├── data/                             # Seed data
│   ├── init-db.sql
│   ├── seed-data.sql
│   └── keycloak-realms/
├── certs/                            # CA certificates for internal TLS
│   ├── ca.crt
│   └── ca.key.enc                    # Encrypted private key
├── sbom/                             # Software Bill of Materials
│   ├── sbom-engine.spdx.json
│   ├── sbom-hitl.spdx.json
│   ├── sbom-ui.spdx.json
│   └── sbom-aggregate.spdx.json
├── signatures/                       # Cosign signatures for each image
│   └── *.sig
├── checksums.sha256                  # SHA-256 of every file
├── INSTALL.md                        # Installation guide
└── VERSION                           # Bundle version metadata
```

### Bundle Build Script

```bash
#!/bin/bash
# build-airgap-bundle.sh
set -euo pipefail

VERSION="0.1.0"
BUNDLE_DIR="shinhan-innoboost-airgap-v${VERSION}"

mkdir -p "${BUNDLE_DIR}"/{images,helm,models,data,certs,sbom,signatures}

# 1. Save container images
IMAGES=(
  "ghcr.io/cyberskill-official/engine:${VERSION}"
  "ghcr.io/cyberskill-official/hitl:${VERSION}"
  "ghcr.io/cyberskill-official/ui:${VERSION}"
  "postgres:16-alpine"
  "redis:7-alpine"
  "quay.io/keycloak/keycloak:25.0"
  "ghcr.io/cyberskill-official/qwen-7b-awq:latest"
  "grafana/grafana:10.4.0"
  "prom/prometheus:v2.51.0"
  "grafana/loki:3.0.0"
  "grafana/tempo:2.4.1"
)

for img in "${IMAGES[@]}"; do
  name=$(echo "$img" | sed 's|.*/||' | sed 's/:/-/')
  docker pull "$img"
  docker save "$img" -o "${BUNDLE_DIR}/images/${name}.tar"
done

# 2. Copy Helm charts
cp -r infra/helm/shinhan-innoboost "${BUNDLE_DIR}/helm/"

# 3. Generate SBOM
for svc in engine hitl ui; do
  syft "ghcr.io/cyberskill-official/${svc}:${VERSION}" -o spdx-json > \
    "${BUNDLE_DIR}/sbom/sbom-${svc}.spdx.json"
done

# 4. Sign images
for img in "${IMAGES[@]}"; do
  cosign sign --key cosign.key "$img"
done

# 5. Generate checksums
cd "${BUNDLE_DIR}"
find . -type f -not -name checksums.sha256 | xargs sha256sum > checksums.sha256

# 6. Create tarball
cd ..
tar czf "${BUNDLE_DIR}.tar.gz" "${BUNDLE_DIR}"

echo "✅ Air-gap bundle created: ${BUNDLE_DIR}.tar.gz"
echo "   Size: $(du -h ${BUNDLE_DIR}.tar.gz | cut -f1)"
```

---

## 2. Installation Guide (On-Prem)

### Prerequisites
- Kubernetes 1.28+ (vanilla, no cloud dependencies)
- Container runtime: containerd 1.7+ or CRI-O 1.28+
- Helm 3.14+
- 1 node with GPU (optional, for local LLM)
- Internal DNS configured for service hostnames

### Installation Steps

```bash
# 1. Extract bundle
tar xzf shinhan-innoboost-airgap-v0.1.0.tar.gz
cd shinhan-innoboost-airgap-v0.1.0

# 2. Verify checksums
sha256sum -c checksums.sha256

# 3. Load images into local registry
for img in images/*.tar; do
  ctr images import "$img"
  # or: crictl load "$img"
done

# 4. Deploy with Helm
helm install innoboost ./helm/shinhan-innoboost \
  --namespace innoboost --create-namespace \
  --values ./helm/values-onprem.yaml \
  --set image.registry=registry.internal.shinhan.vn \
  --wait --timeout 10m

# 5. Verify
kubectl -n innoboost get pods
kubectl -n innoboost logs deploy/engine --tail=20
```

---

## 3. Sizing Guide

### Small (PoC / Demo)

| Component | CPU | Memory | Storage | Notes |
|---|---|---|---|---|
| Engine (×1) | 1 core | 1 GB | — | Single replica |
| HITL (×1) | 0.5 core | 512 MB | — | Single replica |
| UI (×1) | 0.5 core | 256 MB | — | Single replica |
| Postgres | 2 cores | 4 GB | 50 GB SSD | Single instance |
| Redis | 0.5 core | 512 MB | — | Single instance |
| Qwen-7B (optional) | 4 cores | 8 GB | 10 GB | AWQ quantised, CPU-only |
| Observability | 2 cores | 4 GB | 50 GB | Prometheus + Loki + Grafana |
| **Total** | **10.5 cores** | **18.3 GB** | **110 GB** | Fits in 1 server |

### Medium (Production — 3 BUs, <50 users)

| Component | CPU | Memory | Storage | Notes |
|---|---|---|---|---|
| Engine (×2 per BU) | 6 cores | 6 GB | — | 2 replicas × 3 BUs |
| HITL (×1 per BU) | 1.5 cores | 1.5 GB | — | 1 replica × 3 BUs |
| UI (×2 per BU) | 3 cores | 1.5 GB | — | 2 replicas × 3 BUs |
| Postgres (HA) | 4 cores | 16 GB | 200 GB SSD | Primary + standby |
| Redis (HA) | 2 cores | 4 GB | — | Primary + replica |
| Qwen-7B (GPU) | — | 16 GB VRAM | 10 GB | NVIDIA A10 or T4 |
| Observability | 4 cores | 8 GB | 200 GB | Full stack |
| **Total** | **20.5 cores** | **53 GB** | **410 GB** | 3 servers |

### Large (Production — 3 BUs, <500 users, GPU inference)

| Component | CPU | Memory | Storage | Notes |
|---|---|---|---|---|
| Engine (×3 per BU) | 9 cores | 9 GB | — | 3 replicas × 3 BUs |
| HITL (×2 per BU) | 3 cores | 3 GB | — | 2 replicas × 3 BUs |
| UI (×3 per BU) | 4.5 cores | 2.25 GB | — | 3 replicas × 3 BUs |
| Postgres (HA) | 8 cores | 32 GB | 500 GB NVMe | Primary + 2 standbys |
| Redis (Cluster) | 6 cores | 12 GB | — | 3-node cluster |
| Qwen-7B (GPU) | — | 24 GB VRAM | 10 GB | NVIDIA A100 40GB |
| Observability | 8 cores | 16 GB | 1 TB | Full stack + retention |
| **Total** | **38.5 cores** | **98.3 GB** | **1.5 TB** | 5+ servers |

---

## 4. Operations Runbook

| Operation | Procedure | Frequency |
|---|---|---|
| **Install** | Extract bundle → verify checksums → load images → helm install | Once |
| **Upgrade** | New bundle → verify → load images → helm upgrade → smoke test | Per release |
| **Backup** | pg_dump → encrypt → ship to backup storage | Daily (automated) |
| **Restore** | Retrieve backup → decrypt → pg_restore → verify audit chain | As needed |
| **Rotate Secrets** | Generate new → update k8s secrets → rolling restart | Quarterly |
| **Scale** | helm upgrade --set engine.replicas=N | As needed |
| **Decommission** | Export data → crypto-erase → helm uninstall → purge PVCs | End of contract |
