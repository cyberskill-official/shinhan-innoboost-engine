---
title: "Configure secrets management and rotation (Doppler / Vault)"
author: "@cyberskill-eng-sec"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: not_ai
target_release: "2026-05-15"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Configure a centralised secrets-management solution for the demo build, supporting laptop / cloud / on-prem deployment shapes equally. Decision: Doppler as the primary secrets backend (hosted, low-friction setup, native CI integration); HashiCorp Vault as the on-prem-deployable secondary backend for any commercialisation deployment that requires Shinhan-side residency. No secrets in repository; no secrets in env files committed; no secrets in container images. Every secret has a rotation cadence, an owner, an audit trail of access events, and a documented blast-radius if compromised. The secrets layer is the structural enforcement of every "we handle credentials properly" claim in the pitch and the compliance dossier.

## Problem

A demo that ships LLM-API keys, database passwords, OAuth client secrets, or signing keys in plaintext anywhere in the source repository or in container images is unshippable to a banking-sector reviewer. The Innoboost Q&A explicitly references "strict State Bank of Vietnam (SBV) regulations" and the Q&A's Section VI flags that production deployment "must be deployed per SBV regulations." Vietnamese banking IT regulation (e.g., Circular 09/2020/TT-NHNN on IT operations) mandates strong access controls and credential management; demonstrating those controls is non-negotiable for commercial-track conversion.

Specific gaps if we shortcut:

- **A leaked Anthropic or OpenAI API key during a demo** is a credibility-destroying moment. Even pre-launch, secret-scanning (P01-T02) catches obvious leaks, but the secrets-management layer is what prevents leaks from happening in the first place.
- **Without a centralised store, secrets fragment across `.env` files on engineer laptops.** Inconsistent values cause "works for me" failures; rotated secrets are forgotten on an old laptop; off-boarding doesn't revoke access.
- **Without rotation, long-lived secrets accumulate access blast-radius.** A leaked Lambda Labs key or GHCR token compromised six months ago is still working today.
- **Without an audit trail, ISO 27001 control A.5.16 (identity management) and SOC 2 CC6.1 (logical access) cannot be evidenced.** Phase 8's compliance dossier needs access logs.
- **Without an on-prem path, the commercial-track story breaks.** Doppler is hosted; Shinhan's commercial deployment may need a fully air-gapped secrets store. Vault on-prem fills that gap; if we don't plan for it now, we'll scramble later.

The secrets layer also has a downstream-multiplier dimension: every Phase 1+ task that needs to talk to anything (LLM APIs, warehouses, OAuth providers, GitHub, Lambda, Doppler itself) needs secrets. A clean secrets layer makes everything else cleaner; a sloppy one means every task reinvents secret-handling badly.

The `shinhanos_data_residency` memory note mandates per-tenant residency for VN tenants. The secrets layer is part of that — VN-tenant secrets must be stored in VN-resident storage in the production deployment. Doppler's data residency may not satisfy this; Vault on VN-hosted infra will. ADR-SHB-002 has already routed model-stack residency; this task does the same for secrets.

The `feedback_p1_scope_preference` memory note biases us richer. For secrets, "richer" means: dual-backend (Doppler primary, Vault secondary) with a unified envelope so any consumer can switch without code changes; rotation cadences set up from day 1; access logs aggregated centrally; emergency-revoke runbook ready before anything is set up. Cheap; high credibility.

## Proposed Solution

A two-layer secrets architecture: (1) Doppler as the primary, hosted secrets backend for the demo phase, with project structure mirroring the monorepo workspaces and environment scoping (development / staging / production-rehearsal); (2) HashiCorp Vault as a secondary, on-prem-deployable backend for any commercialisation deployment that requires Shinhan-side residency. A common envelope abstraction (envelope per workspace; consumers receive secrets via env vars at runtime, never via `.env` files committed) means consumers don't know which backend is serving them. Every secret has metadata (owner, rotation cadence, blast radius, dependent services). All access is logged centrally. A documented emergency-revoke runbook covers every secret category. Setup target: 7 days from task assignment.

### Subtasks

- [ ] **Inventory all secret categories needed for the demo build.** Categories (preliminary; expanded as new services are added):
  - LLM APIs: Anthropic API key (Claude Sonnet 4.6, Opus 4.6 access); fallback OpenAI API key (if needed for embedding-only).
  - Cloud LLM and infra: Lambda Labs API key, Runpod API key.
  - SCM and CI: GitHub Personal Access Token (least privilege); GHCR token; Slack webhook URL; Snyk token; Codecov token.
  - Cloud providers: GCP Workload Identity (preferred, no long-lived secret); fallback GCP service account JSON (if Workload Identity unavailable); AWS IAM role ARNs (similar pattern).
  - Database: Postgres URL with credentials (laptop: dev value; staging: rotated weekly; production: rotated daily).
  - Auth: Keycloak admin password (P01-T06); OIDC client secrets per BU.
  - Secrets-management itself: Doppler service tokens; Vault tokens (where applicable).
  - Sigstore: not really a secret (keyless OIDC) but document anyway.
  - HuggingFace: API token for Qwen weights download (private mirror access).
  - Encryption: KMS key references (not the key itself, which never leaves KMS).
- [ ] **Set up Doppler.** Create the Doppler project `shinhan-innoboost-engine`; configs `dev`, `staging`, `prod-rehearsal`, `prod-shinhan-poc` (placeholder, locked). Per-config access controls scoped to the relevant team members. Doppler service tokens generated for: GitHub Actions (read-only at the relevant config); local development (read-only at `dev`); operators (read-write at relevant config with 2-eye approval).
- [ ] **Map secrets into Doppler configs.** Each secret has: name (uppercase snake case); value; description; owner (squad handle); rotation cadence (`immediate`, `weekly`, `monthly`, `quarterly`, or `non-rotating`); blast-radius note ("if leaked, ..."); dependent services (which workspaces reference this).
- [ ] **Author secrets manifest.** `docs/runbooks/secrets-manifest.md`: a non-secret reference list — name, owner, rotation cadence, blast-radius — for every secret. The actual values live in Doppler. The manifest is in source control, the values are not.
- [ ] **Set up rotation schedules.** For rotatable secrets:
  - Anthropic / OpenAI / Lambda / Runpod API keys: monthly rotation; rotation handled by ops lead.
  - GitHub PATs: 90-day rotation (GitHub default); replaced by GitHub Apps where possible (no PAT needed).
  - Database credentials: weekly rotation in staging, daily in production (managed by Postgres + a rotation worker; consumers re-fetch via Doppler).
  - OIDC client secrets: quarterly.
  - Slack webhook: rotate on team change events.
  - Auto-rotate where supported (Vault has native rotators for many backends; Doppler triggers a webhook on rotation).
- [ ] **Configure GitHub Actions consumption.** GitHub Actions workflows (P01-T02) consume secrets via Doppler's GitHub Action `dopplerhq/cli-action`, not via `secrets.GITHUB_TOKEN`-based secret-injection (except for GitHub-native secrets like `GITHUB_TOKEN` itself). This means a single source of truth for non-GitHub secrets.
- [ ] **Configure local-dev consumption.** Engineers run `doppler run -- pnpm dev` instead of `pnpm dev`. Doppler injects secrets from the `dev` config at runtime; engineers don't see secret values directly. `.env` files are git-ignored; if anyone commits one, secret-scan in P01-T02 catches it.
- [ ] **Configure staging-cluster consumption.** Staging Kubernetes pulls secrets from Doppler via the Kubernetes operator (`doppler-kubernetes-operator`). Pods receive secrets as env vars at startup; rotation triggers rolling restart.
- [ ] **Plan on-prem path with Vault.** Document the migration plan from Doppler to Vault for any Shinhan commercial deployment requiring on-prem secrets:
  - Vault deployed on-prem (Helm chart in P01-T04).
  - Same envelope (Kubernetes secrets sourced from Vault via `vault-secrets-operator`).
  - Same secret names; only the backend changes.
  - Document a 1-day migration runbook.
- [ ] **Author the emergency-revoke runbook.** `docs/runbooks/secret-revocation.md` with per-category procedures:
  - Anthropic key leaked: rotate via Anthropic console (instructions linked); update Doppler; trigger redeploy; audit log entry; if exposure was significant, notify Anthropic for additional log review.
  - GitHub PAT leaked: revoke via GitHub UI; rotate in Doppler; check git history for exposure window.
  - Database credentials leaked: rotate immediately; audit access logs for unauthorised queries during exposure window.
  - Etc., for every category.
- [ ] **Implement audit-log aggregation.** Doppler's audit log + GitHub's audit log + cloud-provider IAM logs all flow into a central observability store (P09-T01). Query patterns documented for: "who accessed secret X in the last 7 days?"; "how many failed authentications this week?"; "any access from unusual IP ranges?".
- [ ] **Implement secret-leak detection beyond P01-T02.** Augment with periodic scans of public GitHub commits and Pastebin (low-cost services like GitGuardian or self-hosted truffleHog with an extensive ruleset). Alert if any secret-shape from our manifest appears in any public location.
- [ ] **Configure 2-eye operations for sensitive actions.** Production-config edits require two-person approval (ops lead + founder, or eng-sec + founder); audit-logged. Doppler supports this via team controls.
- [ ] **Run a rotation drill.** Manually rotate one secret (start with a low-risk one — Codecov token); verify all consumers pick up the new value within 10 minutes; document the actual time taken.
- [ ] **Run a leak-response drill.** Simulate a leaked Anthropic key: walk through the runbook, time each step, identify gaps. Aim for full revocation within 30 minutes.

### Acceptance criteria

- Doppler project created with four configs; access controls applied.
- All identified secrets stored in Doppler with metadata (owner, rotation, blast-radius).
- Secrets manifest published in source control (non-secret reference list).
- GitHub Actions workflows consume secrets via Doppler integration; verified by sample workflow run.
- Local-dev consumption pattern documented; engineers can `doppler run -- pnpm dev`.
- Staging-cluster consumption operational via doppler-kubernetes-operator; verified by pod env-var inspection.
- Vault on-prem migration plan documented in `docs/runbooks/vault-migration.md`.
- Emergency-revoke runbook published with per-category procedures.
- Rotation drill completed; results recorded.
- Leak-response drill completed; results recorded.

## Alternatives Considered

- **AWS Secrets Manager / GCP Secret Manager.** Rejected as primary: cloud-vendor-locked. Useful as a backend for cloud-tenant deployments; not the right primary for a multi-cloud + on-prem story.
- **Pure Vault from day 1.** Rejected: Vault has higher ops complexity; for the demo phase, Doppler is faster to set up. Vault is on the migration path for commercialisation.
- **HashiCorp Boundary instead of Vault.** Rejected: Boundary is for access management, not secrets; complementary, not substitutable. Could be added in the production track if needed.
- **Just use GitHub secrets + .env files.** Rejected: GitHub secrets are workspace-bound to GitHub Actions; .env files violate the no-secrets-in-repo principle the moment they're accidentally committed. Hybrid is brittle.
- **Bitwarden / 1Password Teams for secrets.** Rejected: those are designed for human-readable passwords, not machine-consumed API keys. The integration story for CI is weaker.
- **Roll our own (encrypted YAML files in repo with age-based decryption).** Rejected: rolling-your-own crypto is the standard anti-pattern; tooling (Doppler, Vault) is mature and audited.
- **SOPS / Mozilla SOPS as the primary.** Rejected: SOPS is great for IaC secrets and CI-time decryption; it's not as good as Doppler for runtime secret distribution to a Kubernetes cluster. Could complement (e.g., use SOPS for IaC config; Doppler for runtime).

## Success Metrics

- **Primary**: All identified secrets stored in Doppler within 7 days of task assignment; verified by a manifest-vs-Doppler diff (zero diffs).
- **Guardrail**: Zero secrets detected in source control by GitHub's native secret-scanning + TruffleHog (P01-T02) for the duration of the engagement. Measured by: P01-T02 secret-scan job results.

## Scope

### In scope
- Doppler project + configs + access controls.
- Secrets inventory and manifest.
- Rotation schedules.
- GitHub Actions, local-dev, and staging-cluster consumption integration.
- Vault on-prem migration plan.
- Emergency-revoke runbook.
- Audit-log aggregation.
- Rotation and leak-response drills.

### Out of scope
- Vault on-prem actual deployment (handled in production-track, post-PoC).
- Hardware Security Modules (HSMs) — overkill for the demo phase; consider for production track if Shinhan requires.
- Per-tenant secret residency (handled by P10-T04 once we have multi-tenancy; out of scope for the demo single-tenant rehearsal).

## Dependencies

- **Upstream**: P01-T01 (monorepo skeleton); P01-T02 (CI/CD) for the secret-consumption integration; ADR-SHB-001 + ADR-SHB-003 (P00-T02).
- **People**: eng-sec authoring; ops lead for rotation procedures and account setup; founder for sign-off on emergency-revoke procedures.
- **External**: Doppler account (paid tier required for SAML / advanced audit features); HashiCorp Vault (open source; for the migration plan); cloud-provider IAM integration (GCP Workload Identity primarily).
- **Memory references**: `shinhanos_data_residency`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: Doppler tier — Team ($) or Enterprise ($$). Recommendation: Team for the demo phase; Enterprise if SAML SSO becomes mandatory or audit retention beyond 30 days is required.
- Q2: Should we set up GitHub Apps to replace PATs entirely, even for Renovate / Dependabot? Recommendation: yes where supported; PATs as fallback only.
- Q3: For the database-credential rotation, how do we hand the new credential to running pods without dropping connections? Recommendation: pgbouncer in front of Postgres holds the connection pool; rotation triggers pgbouncer reload, not pod restart.
- Q4: For the audit-log aggregation, do we ship Doppler audit logs to our central observability store via webhook or polling? Recommendation: webhook (real-time; no polling latency).
- Q5: Should we encrypt secrets-at-rest in Doppler with our own key (BYOK)? Recommendation: not in demo phase (Doppler's default encryption is sufficient); document as future-state for production track.

## Implementation Notes

- Doppler service tokens have scope (read / read-write); always issue read-only tokens to GitHub Actions and local-dev. Read-write only for the rotation worker.
- Local-dev token is per-engineer, not shared; if an engineer leaves, their token is revoked immediately.
- For Kubernetes integration via `doppler-kubernetes-operator`, the operator reads Doppler tokens from a Kubernetes Secret (chicken-and-egg). That bootstrap secret is the only one stored directly in the cluster; everything else flows through Doppler. The bootstrap secret is rotated quarterly and managed by the platform team.
- For Vault on-prem migration, the same envelope (workspace → consumer reads `process.env.X`) means application code is unchanged; only the operator changes from `doppler-kubernetes-operator` to `vault-secrets-operator`.
- The emergency-revoke runbook should include screenshots / API examples for each secret-vendor's revocation flow. When the actual emergency happens, the engineer running the runbook is stressed and should not be reading docs from scratch.
- For rotation drills, automate the drill: script that initiates the rotation, polls for consumer pickup, reports timing.
- For leak-response drills, run quarterly. Track the median revocation time over time; aim to drive down.

## Test Plan

- Test 1: Local-dev — `doppler run -- node -e 'console.log(process.env.ANTHROPIC_API_KEY)'` returns the key from the `dev` config.
- Test 2: GitHub Actions — a sample workflow that calls Anthropic API succeeds with the key from Doppler.
- Test 3: Staging cluster — a sample pod has the expected secrets as env vars; verified by `kubectl exec` (allowed in staging only).
- Test 4: Rotation — manually rotate the Codecov token in Doppler; verify within 10 minutes that the next workflow run uses the new value.
- Test 5: Leak-response drill — simulate a leaked Anthropic key; walk through the runbook; time the steps; verify revocation completes within 30 minutes.
- Test 6: 2-eye operations — attempt to edit a production-config secret with one approver; verify it fails. Two approvers required.
- Test 7: Audit log query — verify Doppler audit log entries flow to the central observability store within 60 seconds.
- Test 8: Negative test — try to push a `.env` file with a secret to the repo; verify P01-T02 secret-scan blocks it.

## Rollback Plan

- A bad secret value (e.g., a typo) is rolled back by editing in Doppler; consumers re-fetch on next start or are restarted.
- A bad Doppler-consumption integration is rolled back by reverting the integration commit; secrets remain available via the previous mechanism (which should be `secrets.X` in GitHub Actions for the prior period).
- Doppler outage: cached secret values in pods continue working until restart; new pod starts may fail. Mitigation: emergency fallback to `secrets.X`-style GitHub secrets if Doppler is down for more than 30 minutes.
- Vault migration rollback: Vault and Doppler can run in parallel during cutover; consumer envelope abstracts which backend is serving. If Vault has issues, point envelope back at Doppler.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Doppler project + configs | Doppler workspace | Eng-sec | Until program end |
| Secrets manifest (non-secret reference) | `docs/runbooks/secrets-manifest.md` | Eng-sec | Continuous |
| Emergency-revoke runbook | `docs/runbooks/secret-revocation.md` | Eng-sec | Continuous |
| Vault migration plan | `docs/runbooks/vault-migration.md` | Eng-sec | Continuous |
| Rotation drill records | `docs/audit/rotation-drills/{date}.md` | Eng-sec | 7 years |
| Leak-response drill records | `docs/audit/leak-response-drills/{date}.md` | Eng-sec | 7 years |
| Doppler audit log | Doppler + central observability store | Eng-sec | 7 years |
| 2-eye operations log | Central observability store | Eng-sec | 7 years |

## Operational Risks

- **Doppler outage.** Mitigation: cached values continue working; emergency fallback to GitHub secrets documented; Doppler's status page subscribed for alerts.
- **Engineer leaves with active local-dev token.** Mitigation: per-engineer tokens; revocation on offboarding is a checklist item.
- **Insider misuse (e.g., engineer with read access exfiltrates secrets).** Mitigation: audit-log; access scoped to least-privilege; rotation cadence shrinks blast radius.
- **Doppler vendor lock-in.** Mitigation: dual-backend story (Vault on-prem); migration runbook; envelope abstraction means consumer code is portable.
- **Rotation drill exposes a flaky consumer (e.g., a service that doesn't pick up new secrets without restart).** Mitigation: this is the value of running the drill; fix the consumer before it bites in production.

## Definition of Done

- Doppler operational; all secrets stored; manifest published.
- Consumption integrations working (CI, local-dev, staging cluster).
- Vault migration plan documented.
- Emergency-revoke runbook published.
- Rotation and leak-response drills completed.
- Audit logs flowing to central observability store.
- 2-eye operations verified.
- This FR's ticket marked Done with links to artefacts.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections of this FR.
- **Human review**: eng-sec authors and reviews secrets architecture; ops lead ratifies rotation procedures; `@stephen-cheng` ratifies emergency-revoke procedures and 2-eye operations rules.
