# Audit Report — P10-T03: Air-Gapped On-Prem Deployment Bundle

> **Phase**: 10 — Deployment Targets  
> **Task**: T03 — Air-Gap On-Prem  
> **Source**: [`infra/onprem/airgap-bundle.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/infra/onprem/airgap-bundle.md) (201 lines)  
> **FR Reference**: [`tasks/P10-T03-on-prem-air-gap.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/tasks/P10-T03-on-prem-air-gap.md)  
> **Auditor**: Antigravity Deep Audit  
> **Date**: 2026-05-02

---

## 1. Acceptance Criteria Verification

| # | Criterion (from FR) | Status | Evidence |
|---|---|---|---|
| AC-1 | Air-gap bundle with all container images | ✅ Pass | §1: 11 OCI images listed including Qwen-7B (8 GB) |
| AC-2 | SBOM for each service | ✅ Pass | SBOM section: `syft` generates SPDX JSON per service |
| AC-3 | Cosign signatures for each image | ✅ Pass | Signatures section: `cosign sign` per image |
| AC-4 | SHA-256 checksums | ✅ Pass | `checksums.sha256` with `sha256sum` verification |
| AC-5 | Installation guide | ✅ Pass | §2: 5-step install (extract → verify → load → helm → verify) |
| AC-6 | 3-tier sizing guide | ✅ Pass | §3: Small (10.5 cores/18GB), Medium (20.5 cores/53GB), Large (38.5 cores/98GB) |
| AC-7 | Operations runbook | ✅ Pass | §4: 7 operations (install, upgrade, backup, restore, rotate, scale, decommission) |
| AC-8 | Bundle build script is executable | ⚠️ Partial | Script exists but not tested; images don't exist on GHCR |
| AC-9 | `values-onprem.yaml` Helm values | ❌ Missing | Referenced in install command but file not found |

**AC Pass Rate: 7/9 (78%) — 1 partial, 1 missing**

---

## 2. Content Quality Analysis

### Strengths
- **Complete supply chain security**: SBOM (syft) + signatures (cosign) + checksums (SHA-256) — enterprise air-gap standard
- **3-tier sizing guide is detailed**: CPU, memory, storage per component with GPU options — decision-ready for procurement
- **Operations runbook covers full lifecycle**: Install through decommission with crypto-erase — banking-sector appropriate
- **Qwen-7B AWQ bundled**: 4-bit quantised model in bundle — true offline capability
- **Internal TLS CA bundled**: `certs/ca.crt` + encrypted key — proper mTLS for air-gapped networks

### Issues

| # | Severity | Issue | Details |
|---|---|---|---|
| CQ-1 | 🟡 Medium | **Bundle build script untested** — images don't exist on GHCR | Script is correct but not functional |
| CQ-2 | 🟡 Medium | **No `values-onprem.yaml`** | Install command references it; file not found |
| CQ-3 | 🟠 Low | **Install uses `ctr images import`** — should also document `nerdctl` for containerd | Minor alternative gap |

---

## 3. Verdict

> **Overall Status: ✅ SUBSTANTIALLY COMPLETE — Best deployment doc in the project**

The air-gap bundle is the most complete deployment artifact: supply chain security (SBOM + cosign + SHA-256), 3-tier sizing guide, and full-lifecycle operations runbook. The only gaps are the untested build script (images don't exist yet) and missing `values-onprem.yaml`. This document would impress Shinhan's infrastructure team.

**Estimated remediation effort**: 2-3 days (mostly creating the Helm values file and testing the build script once images exist).
