# Audit Report — P10-T01: Docker Compose Laptop Deployment

> **Phase**: 10 — Deployment Targets  
> **Task**: T01 — Laptop Deployment  
> **Source**: [`infra/laptop/docker-compose.yml`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/infra/laptop/docker-compose.yml) (203 lines)  
> **FR Reference**: [`tasks/P10-T01-laptop-deployment.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/tasks/P10-T01-laptop-deployment.md)  
> **Auditor**: Antigravity Deep Audit  
> **Date**: 2026-05-02

---

## 1. Acceptance Criteria Verification

| # | Criterion (from FR) | Status | Evidence |
|---|---|---|---|
| AC-1 | Full stack on `docker compose up` | ⚠️ Partial | Compose defines all services (engine, hitl, ui, postgres, redis, keycloak) but Dockerfiles don't exist |
| AC-2 | Offline LLM via `--profile offline` | ✅ Pass | `qwen-inference` service with profile `offline`, Qwen-7B AWQ, 8GB memory limit |
| AC-3 | Observability via `--profile observability` | ✅ Pass | Loki + Tempo + Prometheus + Grafana with profile `observability` |
| AC-4 | Health checks on all data services | ✅ Pass | Postgres (`pg_isready`), Redis (`redis-cli ping`), Qwen (`curl /health`) — all with retry |
| AC-5 | Pre-seeded data via init scripts | ⚠️ Partial | `init-db.sql` and `seed-data.sql` volume-mounted but files don't exist |
| AC-6 | Environment-aware LLM switching | ✅ Pass | `LLM_ENDPOINT`, `LLM_PROVIDER`, `LLM_MODEL` all configurable via env vars with defaults |
| AC-7 | Documentation (usage instructions) | ✅ Pass | Lines 184-203: 4 usage patterns documented with `docker compose` commands |

**AC Pass Rate: 5/7 (71%) — 2 partial**

---

## 2. Test Plan Verification

| # | Test (from FR) | Status | Evidence |
|---|---|---|---|
| T-1 | `docker compose up` succeeds; UI at localhost:3000 | ❌ Not Found | Dockerfiles don't exist; can't build |
| T-2 | Offline profile starts Qwen-7B; queries work | ❌ Not Found | Image `ghcr.io/cyberskill-official/qwen-7b-awq:latest` doesn't exist |
| T-3 | Observability profile shows dashboards | ❌ Not Found | No dashboards (P09-T02 gap) |

**Test Pass Rate: 0/3 (0%)**

---

## 3. Content Quality Analysis

### Strengths
- **Production-grade compose structure**: YAML anchors (`x-common`), health checks with retries, proper `depends_on` with `condition: service_healthy`
- **Profile-based feature toggling**: `offline` and `observability` profiles — clean separation of optional components
- **Qwen-7B configuration**: AWQ quantisation, 4096 max tokens, 85% GPU memory, 60s start period — operationally realistic
- **Full observability stack**: Loki + Tempo + Prometheus + Grafana on correct ports with provisioning volumes
- **Keycloak with realm import**: `data/import` volume for pre-configured OIDC realms
- **Clear usage documentation**: 4 scenarios with exact commands

### Issues

| # | Severity | Issue | Details |
|---|---|---|---|
| CQ-1 | 🔴 High | **Dockerfiles don't exist** — `engine/Dockerfile`, `hitl/Dockerfile`, `ui/Dockerfile` not found | Can't build any application service |
| CQ-2 | 🔴 High | **Init scripts don't exist** — `init-db.sql`, `seed-data.sql` not found | Database won't have schema or seed data |
| CQ-3 | 🟡 Medium | **Keycloak realm files don't exist** — `keycloak-realms/` directory not verified | Auth won't be pre-configured |
| CQ-4 | 🟡 Medium | **Prometheus/Loki/Tempo config files don't exist** — compose references `local-config.yaml` | Observability services may fail to start |
| CQ-5 | 🟠 Low | **Compose version '3.9' is deprecated** — modern Docker Compose doesn't need `version` | Non-breaking but outdated |

---

## 4. Verdict

> **Overall Status: ⚠️ PARTIAL — Excellent compose architecture but supporting files missing**

The docker-compose.yml is a well-structured, production-pattern reference with health checks, profiles, and proper service dependencies. However, it can't actually run because Dockerfiles, init scripts, and configuration files don't exist yet. This is a skeleton that needs 5-7 days of engineering to become functional.

**Estimated remediation effort**: 5-7 days.
