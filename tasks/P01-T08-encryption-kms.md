---
title: "Configure encryption (TLS 1.3, AES-256, BYOK, KMS rotation)"
author: "@cyberskill-eng-sec"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: not_ai
target_release: "2026-05-29"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Configure encryption at every layer of the demo build: TLS 1.3 for all in-transit traffic (cluster ingress, service-to-service mTLS, client-to-API); AES-256-GCM for all data at rest (database, object storage, audit log, cache); customer-managed encryption keys (BYOK) supported for tenants that require key residency in their own KMS; key rotation cadence (90 days dev, 30 days staging, 7 days production); cryptographic-material inventory with a documented blast-radius; and a key-compromise response runbook. Encryption is not a feature, it is a foundation; this task locks the foundation so every Phase 2+ data flow inherits it correctly.

## Problem

Banking-sector reviewers will inspect the encryption story before they look at anything else. The Innoboost Q&A confirms commercialisation requires "deployed per SBV regulations" — Vietnamese banking IT regulation expects strong cryptographic controls including TLS for all network communication, encryption-at-rest with key management, and documented key rotation and recovery procedures.

Specific gaps if we shortcut:

- **Without TLS 1.3 (or at minimum TLS 1.2 with strong ciphers), in-transit data is exposed to network-layer attacks.** TLS 1.3 is now the floor; older versions are deprecated.
- **Without service-to-service mTLS, an internal-network attacker can impersonate a service.** Defence-in-depth: even inside our cluster, services authenticate to each other.
- **Without AES-256-GCM at rest, encryption is paper-thin.** AES-256 is the financial-sector standard; weaker ciphers fail compliance review.
- **Without BYOK, customer tenants who require key residency in their own KMS cannot deploy.** Some Shinhan-side tenants will require this; not supporting it closes a commercialisation door.
- **Without key rotation, key compromise becomes catastrophic.** Rotated keys mean the compromise window is bounded; bounded compromise is recoverable.
- **Without cryptographic inventory, key-compromise response is improvised.** Inventory tells us which data is encrypted with which key; when a key is compromised, we know exactly what to re-encrypt.
- **Without a key-compromise runbook, the response is panic.** Documented runbook means deterministic, fast recovery.

The `cyberos_data_residency` memory note mandates VN-tenant data on VN-hosted infrastructure. Encryption keys for those tenants must also reside in VN-hosted KMS (or the tenant's own KMS); this task scaffolds for that.

The `cyberos_ai_compliance` memory note's 7 primitives include encryption + key management as a foundational primitive that satisfies multi-jurisdictional rules simultaneously (EU AI Act, VN Cybersecurity Law, GDPR, etc.).

The `feedback_p1_scope_preference` memory note biases us richer. For encryption, "richer" means: TLS 1.3 + mTLS + AES-256-GCM + BYOK + per-environment rotation + inventory + runbook + nightly drift-check. Each layer is straightforward; together they form a defence-in-depth posture banking reviewers recognise instantly.

## Proposed Solution

A multi-layer encryption configuration:

1. **In-transit:** TLS 1.3 enforced at ingress (cert-manager + Let's Encrypt for staging; per-tenant CA for production); mTLS service-to-service via Istio or linkerd; client-to-API requires TLS; HTTP redirects to HTTPS at ingress.
2. **At rest:** Cloud SQL encrypted with KMS-managed key (per P01-T04); Cloud Storage buckets KMS-encrypted; audit log encrypted with a separate key (key separation); Redis cache TLS-only and AES-encrypted; Postgres `pg_audit` and `pg_stat_statements` encrypted at rest.
3. **BYOK:** Documented per-tenant pattern where a tenant supplies their own KMS key reference; engine encrypts tenant data with the tenant's KMS key; rotation honours the tenant's policy.
4. **Rotation:** 90 days dev / 30 days staging / 7 days production; automated via Cloud KMS rotation (envelope encryption) or Vault rotation.
5. **Inventory + runbook:** `docs/runbooks/crypto-inventory.md` lists every key, every data classification using each key, blast-radius if compromised; `docs/runbooks/key-compromise-response.md` documents the response procedure.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Configure cluster TLS 1.3.** Ingress (ingress-nginx or Istio gateway) enforces TLS 1.3 minimum; reject TLS 1.0, 1.1, 1.2 with weak ciphers. Acceptable cipher suites: AEAD-only, listed in the runbook.
- [ ] **Provision per-environment certificates.** cert-manager + Let's Encrypt for staging (DNS-01 challenge for wildcard `*.staging.shinhan-innoboost.cyberskill.world`). Per-tenant CA for production-rehearsal and production. Cert renewal automated; alert on certs < 30 days from expiry.
- [ ] **Configure mTLS service-to-service.** Service mesh (recommend linkerd for simpler ops than Istio) with automatic mTLS enabled for all in-cluster pod-to-pod traffic. Each service has a SPIFFE-style identity (`spiffe://cluster.local/ns/{ns}/sa/{sa}`); RBAC engine (P01-T07) consumes the identity in the X-Forwarded-Client-Cert header for service-to-service auth.
- [ ] **Configure database encryption-at-rest.** Cloud SQL Postgres uses KMS key from `kms` module (P01-T04). Verify encryption is on; document the key's resource ID; ensure the key has rotation enabled.
- [ ] **Configure object-storage encryption-at-rest.** Cloud Storage buckets reference the KMS key explicitly (CMEK — customer-managed encryption keys). Pre-existing encryption-at-rest by Cloud Storage is not enough; CMEK is what gives us rotation and BYOK story.
- [ ] **Configure audit-log key separation.** The audit log (P02-T09) is encrypted with a *different* KMS key than the operational data. This means a key compromise on the operational key doesn't expose the audit log; the audit log retains forensic integrity.
- [ ] **Configure Redis cache encryption.** Cache TLS-only at the network level; cache values are themselves encrypted (envelope encryption with a per-tenant data key) for any sensitive data; ephemeral cache for non-sensitive data is OK to be plain.
- [ ] **Implement BYOK pattern.** Document the per-tenant pattern: tenant supplies a KMS key resource reference (e.g., `gcp-kms://projects/.../keyRings/.../cryptoKeys/...`); engine uses Cloud KMS API to encrypt tenant data with that key; rotation honours the tenant's policy. Implementation is a small adapter in `engine/crypto/byok.ts`. For demo phase, BYOK is documented but not exercised against a real tenant key (Shinhan's own KMS); the pattern is in place ready for kickoff.
- [ ] **Configure key rotation cadence.** GCP Cloud KMS supports built-in rotation (configures via Terraform); rotation schedule per environment: 90 days dev, 30 days staging, 7 days production. Verify via `gcloud kms keys describe`. Application code uses envelope encryption so rotation does not require re-encrypting all data.
- [ ] **Author cryptographic-material inventory.** `docs/runbooks/crypto-inventory.md` lists:
  - Every KMS key (resource ID, purpose, rotation cadence, environments).
  - Every data classification using the key (e.g., "operational data: KMS key A; audit log: KMS key B; engagement-A pattern reuse intermediate data: KMS key C").
  - Blast radius if compromised (which data is exposed).
  - Recovery time estimate (how long to re-encrypt all affected data with a new key).
- [ ] **Author key-compromise response runbook.** `docs/runbooks/key-compromise-response.md`: detect (audit-log alert on unusual key access patterns); contain (revoke compromised key version; force rotation); investigate (audit log forensics); recover (re-encrypt affected data with new key version); communicate (notify founder; if customer-data exposed, notify the affected tenant; if regulatory data, notify SBV per applicable timeline).
- [ ] **Configure nightly encryption-drift check.** A CI job that runs nightly: queries every Cloud SQL instance, every Cloud Storage bucket, every secret in Doppler, every audit-log file; verifies each is encrypted with the expected key; alerts on drift.
- [ ] **Configure cert-expiry alerting.** A CI job that runs daily: queries every cert in cert-manager; alerts on certs < 30 days from expiry.
- [ ] **Test key rotation end-to-end.** In staging: trigger a manual rotation; verify all consumers still work; verify old data still decrypts (envelope encryption: data keys remain valid after KEK rotation); verify new data is encrypted with the new KEK version.
- [ ] **Test key-compromise response dry-run.** In staging: simulate a "compromised" key; walk through the runbook; time the steps; capture gaps. Aim for full recovery within 4 hours.
- [ ] **Run a TLS configuration scan.** Tool: `testssl.sh` or Qualys SSL Labs (for public endpoints). Verify TLS 1.3, no weak ciphers, valid certificate chain, HSTS header set.

### Acceptance criteria

- TLS 1.3 enforced at ingress; verified by scan.
- mTLS service-to-service operational; verified by sample traffic with packet capture.
- Database, object storage, audit log, cache all encrypted at rest with KMS-managed keys.
- Audit-log key is separate from operational key.
- BYOK pattern documented and adapter implemented.
- Key rotation operational at the documented cadences.
- Cryptographic inventory published.
- Key-compromise response runbook published and dry-run-tested.
- Nightly drift check operational.
- Cert-expiry alerting operational.

## Alternatives Considered

- **Use TLS 1.2 with strong ciphers (more compatible).** Rejected: TLS 1.3 is the modern standard; the compatibility cost is negligible for our endpoints (modern browsers and tools all support TLS 1.3). Sticking to 1.2 just adds attack surface.
- **Skip mTLS service-to-service; rely on network policy.** Rejected: defence-in-depth — even network-policy-isolated services should authenticate to each other; mTLS is cheap with a service mesh.
- **Use Istio instead of linkerd for mTLS.** Rejected for demo phase: Istio is more powerful but more complex; linkerd's automatic mTLS is sufficient. Reconsider for production track if more service-mesh features are needed.
- **Use cloud-provider-managed encryption keys (no CMEK).** Rejected: provider-managed keys mean we cannot rotate or revoke; key-residency story breaks; BYOK story is impossible.
- **Skip BYOK; tell tenants we use our KMS.** Rejected: some Shinhan-side tenants will require their own KMS for data residency; not supporting it is a commercialisation blocker.
- **Use a single KMS key for everything.** Rejected: separating audit-log from operational reduces blast radius; per-tenant separation is a future-state but conceptually planned.
- **Encrypt at the application layer instead of KMS-at-rest.** Rejected as primary: application-layer crypto is harder to get right; KMS-at-rest is the standard; application-layer is layered on top for the most-sensitive fields (e.g., MFA secrets) only.
- **Skip key rotation; rely on the strong cipher.** Rejected: rotation is what bounds the compromise window; static keys accumulate risk.

## Success Metrics

- **Primary**: All in-transit and at-rest data demonstrably encrypted with documented keys within 14 days of task assignment. Measured by: scan results + cryptographic inventory completeness check.
- **Guardrail**: Zero key-compromise incidents; zero TLS-related findings in nightly scans; zero cert-expiry incidents (no cert allowed to expire). Measured by: scan automation results.

## Scope

### In scope
- TLS 1.3 + mTLS configuration.
- KMS + CMEK for database, object storage, audit log, cache.
- BYOK pattern (documented + adapter).
- Key rotation per environment.
- Cryptographic inventory.
- Key-compromise response runbook.
- Nightly drift check.
- Cert-expiry alerting.
- Dry-run rotation + dry-run compromise.

### Out of scope
- HSM-backed keys (deferred to production track per ADR-SHB-003 cost note).
- Application-layer field-level encryption beyond MFA secrets (deferred unless required).
- Per-tenant key residency in VN-hosted KMS (handled by P10-T04 data residency).
- Encryption for non-Postgres warehouse adapters (covered by warehouse vendor's native encryption).

## Dependencies

- **Upstream**: P01-T01, P01-T02, P01-T03, P01-T04 (KMS module).
- **People**: eng-sec authoring; platform engineer for service mesh; founder ratifying rotation cadence.
- **External**: GCP Cloud KMS; cert-manager; Let's Encrypt; linkerd (or Istio if chosen); testssl.sh / Qualys SSL Labs.
- **Memory references**: `cyberos_data_residency`, `cyberos_ai_compliance`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: linkerd or Istio? Recommendation: linkerd (simpler ops, automatic mTLS, smaller surface area). Reconsider if specific Istio features become needed.
- Q2: For the per-tenant CA in production, do we self-CA or use a public CA? Recommendation: self-CA for internal services; public CA (Let's Encrypt or DigiCert) for endpoints exposed to Shinhan reviewers.
- Q3: For BYOK, which KMS providers do we support out of the box? Recommendation: GCP Cloud KMS (default), AWS KMS (adapter), Vault Transit (for on-prem). Azure Key Vault could be added if a Shinhan-side tenant needs it.
- Q4: Audit-log key — should it be HSM-backed even in staging (cost: ~$1/key/month)? Recommendation: yes — audit-log integrity is high value; the cost is trivial.
- Q5: For envelope encryption, what's the data-key cache TTL? Recommendation: 5 minutes; balances API cost against rotation responsiveness.

## Implementation Notes

- TLS 1.3 cipher list (acceptable): `TLS_AES_256_GCM_SHA384`, `TLS_CHACHA20_POLY1305_SHA256`, `TLS_AES_128_GCM_SHA256`. Reject everything else.
- HSTS header: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`. Apply at ingress.
- mTLS via linkerd is automatic for all pod-to-pod traffic; no application-code changes. The identity is the SPIFFE identity per pod's ServiceAccount.
- Envelope encryption pattern: KEK (Key Encryption Key) lives in KMS; DEK (Data Encryption Key) is generated per data unit, encrypted with KEK, stored alongside the encrypted data. Rotation rotates KEK; existing DEKs continue to decrypt; new data uses new DEK encrypted with new KEK.
- For the audit-log key, restrict access by IAM: only the audit-log writer pod has encrypt permission; only audit-log reader (admin UI) has decrypt permission; nobody else.
- Cert-manager's `Certificate` resources are declarative; rotation is automatic at 2/3 of cert lifetime; alert if rotation fails.
- For the nightly drift check, query each resource and verify the encryption key reference matches the expected one. Alert on any drift, with details.

## Test Plan

- Test 1: TLS scan on staging ingress; verify TLS 1.3 enforced; no weak ciphers; HSTS header.
- Test 2: Service-to-service traffic capture; verify mTLS handshake; verify identity matches expected pod.
- Test 3: Database encryption verification; verify Cloud SQL is using the expected KMS key; verify the key has rotation enabled.
- Test 4: Audit-log key separation; verify the audit-log resource references a different KMS key than operational data.
- Test 5: BYOK pattern; deploy a test tenant with a sample external KMS key; encrypt a sample value; verify decryption uses the external KMS.
- Test 6: Key rotation end-to-end; trigger rotation; verify old data still decrypts; verify new data encrypts with new KEK version.
- Test 7: Cert-expiry alert; mock a cert with 25-day-from-expiry; verify alert fires.
- Test 8: Nightly drift check; manually drift a resource (e.g., create a bucket without CMEK); verify drift is detected.
- Test 9: Key-compromise dry-run; full runbook walk-through; capture timing; aim for < 4 hours.

## Rollback Plan

- A bad TLS configuration is rolled back via Helm rollback or ingress-config revert.
- A bad mTLS configuration is rolled back by disabling the linkerd injection annotation; pods restart without mTLS; in-cluster traffic continues plain. Document this as a degraded state with audit-log entry.
- A bad CMEK configuration that breaks decryption is recovered by re-pointing to the previous key version (keys retain prior versions for grace period).
- A failed key rotation is rolled back by halting rotation and investigating; envelope encryption ensures both old and new versions remain valid during grace period.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| TLS scan results | `docs/audit/tls-scans/{date}.txt` | Eng-sec | 7 years |
| Cryptographic inventory | `docs/runbooks/crypto-inventory.md` | Eng-sec | Continuous |
| Key-compromise runbook | `docs/runbooks/key-compromise-response.md` | Eng-sec | Continuous |
| Cert-expiry alert log | Central observability store | Eng-sec | 7 years |
| Nightly drift-check results | Central observability store | Eng-sec | 7 years |
| KMS key configurations | `infra/terraform/.../kms.tf` | Eng-sec | Continuous |
| Rotation dry-run records | `docs/audit/key-rotation/{date}.md` | Eng-sec | 7 years |
| Compromise dry-run records | `docs/audit/key-compromise-drills/{date}.md` | Founder | 7 years |
| BYOK adapter | `engine/crypto/byok.ts` | Engine tech lead | Continuous |

## Operational Risks

- **KMS API outage.** Mitigation: short-TTL DEK cache; existing pods continue with cached DEKs; new pods may fail. Outage rare but planned for.
- **Cert-manager fails to renew.** Mitigation: 30-day expiry alert; manual cert via `cert-manager` CLI as backup.
- **Service mesh disruption.** Mitigation: linkerd's destruction would break mTLS; in-cluster traffic falls back to plain (with policy still enforcing identity).
- **Key rotation breaks an unsuspected consumer.** Mitigation: dry-run rotation in staging first; envelope encryption ensures old data still decrypts.
- **BYOK key provided by Shinhan-side tenant has unexpected restrictions.** Mitigation: BYOK adapter is generic; document expected API contract; Shinhan-side issues handled at kickoff.

## Definition of Done

- TLS, mTLS, KMS at-rest, BYOK, rotation, inventory, runbook all in place.
- Drift-check + cert-expiry alerting operational.
- Dry-runs (rotation + compromise) completed.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: eng-sec authors and reviews; platform engineer reviews service mesh + cert-manager; `@stephen-cheng` ratifies rotation cadence and key-compromise procedures.
