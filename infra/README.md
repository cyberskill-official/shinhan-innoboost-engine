# infra/

Infrastructure-as-code + deployment targets.

## Sub-modules

| Path | Purpose | Anchor FR |
|---|---|---|
| `terraform/` | Cloud IaC (modules + per-environment) | P01-T04 |
| `helm/shinhan-innoboost/` | Application Helm chart (umbrella + sub-charts) | P01-T04 |
| `laptop/` | Docker Compose laptop deployment | P10-T01 |
| `onprem/` | Air-gap on-prem bundle + sizing guide | P10-T03 |
| `gpu/` | On-demand GPU rental scripts (Lambda / Runpod) | P00-T05 |
| `observability/` | Grafana dashboards (JSON) + alerts + ILM | P09-T02..T04 |
| `keycloak/realms/` | Per-BU Keycloak realm imports | P01-T06 |
| `security/` | Pen-test simulation + admission-control policies | P01-T05 / P08-T06 |
| `dr/` | Restore-test automation | P01-T09 |

## Quickstart

```bash
# Cloud staging
cd terraform/environments/staging && terraform init && terraform plan

# Laptop demo
cd laptop && docker compose up

# On-prem install
cd onprem && ./install.sh
```

## See also

- ADR-SHB-001..003 (`docs/adr/shinhan-innoboost/`) — architecture decisions
- P01-T04 — IaC foundation FR
- P10-T01..T04 — deployment targets FRs
