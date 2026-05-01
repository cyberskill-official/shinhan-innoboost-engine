# Zero-Trust Network Configuration — Shinhan Innoboost Engine

> Network security architecture implementing zero-trust principles for all service communication.

**Owner**: eng-sec
**Last updated**: 2026-05-02
**Status**: DRAFT — mesh deployment pending GKE provisioning

---

## Principles

1. **No implicit trust**: Every service-to-service call is authenticated and encrypted
2. **Least privilege**: Network policies deny all traffic by default; explicit allow-lists only
3. **mTLS everywhere**: All pod-to-pod traffic is mutually authenticated via service mesh
4. **Egress control**: Only whitelisted external endpoints are reachable
5. **Defence in depth**: Network policies + service mesh + application-level auth

---

## Service Mesh (Istio)

### Why Istio

- Automatic mTLS between all pods (zero application code changes)
- Traffic policies (rate limiting, circuit breaking)
- Observability (distributed tracing, metrics)
- Matches banking-sector compliance expectations

### Installation

```bash
# Install Istio via Helm (managed by Terraform in infra/terraform/)
helm repo add istio https://istio-release.storage.googleapis.com/charts
helm install istio-base istio/base -n istio-system --create-namespace
helm install istiod istio/istiod -n istio-system --wait

# Enable sidecar injection for our namespace
kubectl label namespace staging istio-injection=enabled
```

### mTLS Policy (STRICT)

```yaml
# infra/helm/shinhan-innoboost/templates/peer-authentication.yaml
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: default
  namespace: staging
spec:
  mtls:
    mode: STRICT
```

---

## Network Policies

### Default deny all

```yaml
# infra/helm/shinhan-innoboost/templates/network-policy-default.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: staging
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

### Allow engine ↔ database

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: engine-to-db
  namespace: staging
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: engine
  policyTypes:
    - Egress
  egress:
    - to:
        - ipBlock:
            cidr: 10.0.0.0/20  # VPC CIDR — Cloud SQL private IP
      ports:
        - protocol: TCP
          port: 5432
```

### Allow engine ↔ redis

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: engine-to-redis
  namespace: staging
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: engine
  policyTypes:
    - Egress
  egress:
    - to:
        - ipBlock:
            cidr: 10.0.0.0/20
      ports:
        - protocol: TCP
          port: 6379
```

### Allow UI → engine, HITL → engine

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: frontend-to-engine
  namespace: staging
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: engine
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: ui
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: hitl
      ports:
        - protocol: TCP
          port: 4000
```

### Allow ingress controller → UI

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ingress-to-ui
  namespace: staging
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: ui
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3000
```

---

## Egress Whitelist

Only these external endpoints are allowed:

| Destination | Port | Used by | Purpose |
|---|---|---|---|
| `api.anthropic.com` | 443 | engine | Claude API calls |
| `accounts.google.com` | 443 | engine | OAuth/OIDC |
| `kms.googleapis.com` | 443 | engine | Key management |
| `logging.googleapis.com` | 443 | all | Cloud Logging |
| `monitoring.googleapis.com` | 443 | all | Cloud Monitoring |
| `ghcr.io` | 443 | CI/CD | Image pull |

All other egress is denied by default.

---

## Gateway Configuration

```yaml
# infra/helm/shinhan-innoboost/templates/gateway.yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: shinhan-innoboost-gateway
spec:
  selector:
    istio: ingressgateway
  servers:
    - port:
        number: 443
        name: https
        protocol: HTTPS
      tls:
        mode: SIMPLE
        credentialName: innoboost-tls
      hosts:
        - innoboost-staging.cyberskill.io
    - port:
        number: 80
        name: http
        protocol: HTTP
      tls:
        httpsRedirect: true
      hosts:
        - innoboost-staging.cyberskill.io
```

---

## Traffic Flow Diagram

```
Internet
  ↓ (TLS 1.3)
Istio Ingress Gateway
  ↓ (mTLS)
┌─────────────────────────────────────────┐
│  Staging Namespace                       │
│                                          │
│  UI ──(mTLS)──→ Engine ──(mTLS)──→ HITL │
│                   ↓                      │
│            (private IP, TLS)             │
│         Cloud SQL ←→ Redis               │
│                   ↓                      │
│            (TLS, egress whitelist)        │
│         Anthropic API (Claude)           │
└─────────────────────────────────────────┘
```
