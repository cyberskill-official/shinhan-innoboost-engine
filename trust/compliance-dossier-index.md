# Compliance Dossier Index
## P11-T04 — All Phase 8 Outputs, Indexed

---

## Overview

This index provides a single point of reference for all compliance, security, and regulatory artefacts produced as part of CyberSkill's Shinhan Innoboost engagement. All documents are ready for Shinhan's vendor onboarding review.

**Total artefacts**: 9 documents  
**Last updated**: 2026-05-01  
**Status**: Audit-ready draft (pending Shinhan reviewer feedback)

---

## Document Index

| # | Document | Path | Pages | Key Content | Status |
|---|---|---|---|---|---|
| 1 | **Dossier Overview** | `compliance/DOSSIER.md` | 1 | Executive summary, document manifest | ✅ Complete |
| 2 | **PDPL Mapping** | `compliance/pdpl-mapping.md` | 5 | 6 consent purposes, 7 data rights, DPIA | ✅ Complete |
| 3 | **Cybersecurity Law Mapping** | `compliance/cybersecurity-law-mapping.md` | 4 | Data localisation, 24h incident SLA, lawful interception | ✅ Complete |
| 4 | **SBV Regulatory Mapping** | `compliance/sbv-regulatory-mapping.md` | 5 | TT-09/2020, TT-50/2024, outsourcing risk | ✅ Complete |
| 5 | **ISO/SOC 2 Controls** | `compliance/iso-soc2-controls.md` | 8 | ISO 27001 (28), ISO 42001 (26), SOC 2 (36) | ✅ Complete |
| 6 | **Threat Model** | `compliance/threat-model.md` | 6 | STRIDE × 7 services, 8 LLM threats | ✅ Complete |
| 7 | **Pentest Scope** | `compliance/pentest-scope.md` | 4 | 9-component scope, vendor criteria, NDA | ✅ Complete |
| 8 | **Vendor Questionnaires** | `compliance/vendor-questionnaires.md` | 6 | SIG Lite, CAIQ, Shinhan FAQ (10 topics) | ✅ Complete |
| 9 | **IR/BCP Runbooks** | `compliance/ir-bcp-runbooks.md` | 5 | 4-severity IR, 5-phase response, RTO 4h | ✅ Complete |

---

## Quick-Reference: Regulatory Coverage

| Regulation | Document | CyberSkill Status |
|---|---|---|
| 🇻🇳 PDPL (Decree 13/2023) | #2 | Fully mapped |
| 🇻🇳 Cybersecurity Law (24/2018) | #3 | Fully mapped |
| 🏦 SBV TT-09/2020 (IT Ops) | #4 | Fully mapped |
| 🏦 SBV TT-50/2024 (IT Risk) | #4 | Fully mapped |
| 🔒 ISO 27001:2022 | #5 | 28 controls mapped |
| 🤖 ISO 42001:2023 | #5 | 26 clauses mapped |
| 📋 SOC 2 Type II | #5 | 87% ready (31/36 criteria) |
| 🛡️ OWASP LLM Top 10 | #6, #7 | Threat-modelled + pentest-scoped |

---

## Quick-Reference: Key Security Controls

| Control | Implementation | Evidence |
|---|---|---|
| Audit trail integrity | SHA-256 hash chain | `compliance/threat-model.md` §T2 |
| Data classification | 4-tier (Public/Internal/Restricted/Regulated) | `compliance/pdpl-mapping.md` §3 |
| Incident response | SEV-1 to SEV-4, 5-phase process | `compliance/ir-bcp-runbooks.md` |
| Human review | Mandatory for Tier 3-4 data | `compliance/pdpl-mapping.md` §2 |
| Prompt injection defence | Multi-layer guard + adversarial corpus | `compliance/threat-model.md` §3 |
| Encryption at rest/transit | AES-256 / TLS 1.3 | `compliance/iso-soc2-controls.md` |
| Access control | RBAC + ABAC, Keycloak OIDC | `compliance/iso-soc2-controls.md` |

---

## How to Use This Dossier

1. **For Shinhan vendor onboarding**: Start with #8 (Vendor Questionnaires) — pre-filled responses to common questions
2. **For regulatory review**: Start with #2-#4 (Vietnamese regulatory mappings)
3. **For security assessment**: Start with #6 (Threat Model) + #7 (Pentest Scope)
4. **For standards compliance**: Start with #5 (ISO/SOC 2 Controls)
5. **For incident preparedness**: Start with #9 (IR/BCP Runbooks)
