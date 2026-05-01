---
title: "Implement backups, PITR, restore-test calendar, DR runbook"
author: "@cyberskill-ops"
department: operations
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: not_ai
target_release: "2026-06-05"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Implement a comprehensive backup and disaster-recovery posture for the demo build: Postgres point-in-time recovery (PITR) with 7-day retention; weekly full + daily incremental backups for all stateful systems (Postgres, Redis, audit log, object storage); cross-region backup replication for staging and production; a documented Recovery Time Objective (RTO) of 4 hours and Recovery Point Objective (RPO) of 15 minutes; a calendar of monthly restore-tests where backups are actually used to spin up parallel environments and validated; a DR runbook that any squad member can execute under stress; and an annually-tested full-cluster recovery scenario. Backups are not a feature, they are an insurance policy; this task is the structural enforcement of every "we don't lose data" claim in the pitch and a critical piece of the compliance dossier (P11-T04).

## Problem

Banking-sector reviewers evaluate backup posture rigorously because data loss in financial services is regulator-reportable and reputation-destroying. The Innoboost Q&A's references to SBV regulation and the new Cybersecurity Law (effective 1 July 2026) include explicit data-protection requirements. ISO 27001 controls A.8.13 (information backup) and SOC 2 A1.2 (availability) both demand documented backup procedures and periodic restore-tests.

Specific gaps if we shortcut:

- **Without PITR, recovery from logical corruption (e.g., a bad migration that drops data) requires restoring from yesterday's full backup — losing up to 24 hours of data.** PITR limits the loss to seconds.
- **Without cross-region replication, a regional outage destroys the staging environment.** Cheap to add; transformational when needed.
- **Without restore-tests, "we have backups" is unverified.** Backups that have never been restored are folkloric. The first time we discover a backup is corrupt, we cannot afford it to be the moment we need it.
- **Without an RTO/RPO commitment, we cannot answer "how fast can you recover?" — and that's the question Shinhan reviewers will ask.**
- **Without a DR runbook, recovery becomes ad-hoc; the engineer-on-call invents the procedure under stress.** The worst time to invent a procedure.
- **Without an annually-tested full-cluster recovery, the runbook is theoretical.** Annual drills surface integration gaps that point-restore tests miss.

The `shinhanos_data_residency` memory note mandates per-tenant residency for VN tenants. Backups for VN tenants must therefore reside in VN-hosted storage; cross-region replication respects residency boundaries (replicate within VN regions only).

The `feedback_p1_scope_preference` memory note biases us richer. For backups, "richer" means: PITR + scheduled backups + cross-region replication + monthly restore-tests + DR runbook + annual full-cluster test + tested recovery against a synthetic catastrophic scenario. Each layer is well-known operational practice; together they form an enterprise-grade availability posture.

## Proposed Solution

A multi-layer backup-and-DR posture:

1. **Postgres PITR** with 7-day retention via Cloud SQL automated backups + write-ahead-log archive.
2. **Scheduled full + incremental backups** for: Postgres (weekly full to Cloud Storage, daily incremental); Redis (daily snapshot to Cloud Storage); audit log (audit log is itself append-only and replicated; daily snapshots to Cloud Storage with WORM); object-storage buckets (versioning + soft-delete + lifecycle to a separate "backup" bucket).
3. **Cross-region replication** for the staging environment (asia-southeast1 ↔ asia-southeast2) and production (TBD per tenant residency).
4. **RTO/RPO targets**: RTO 4 hours; RPO 15 minutes (engine + HITL + UI services); audit-log RPO 0 (synchronous replication; no data loss possible).
5. **Restore-test calendar** with monthly point-restore tests and an annual full-cluster recovery test.
6. **DR runbook** at `docs/runbooks/disaster-recovery.md` walking through every recovery scenario.
7. **DR drills** scheduled and tracked in the project workspace.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Configure Cloud SQL Postgres PITR.** Per P01-T04 IaC: `point_in_time_recovery_enabled: true`, `transaction_log_retention_days: 7`. Verify by initiating a test PITR to a non-production replica.
- [ ] **Configure Cloud SQL automated backups.** Backup schedule: weekly full (Sunday 02:00 UTC), daily incremental (every other day except Sunday). Retention: 30 days. Cross-region storage: enabled where supported.
- [ ] **Configure Postgres WAL archive.** WAL archive to a Cloud Storage bucket; retention 7 days; encryption with audit-log key (P01-T08); restore-test verifies we can point-recover to any point in the last 7 days.
- [ ] **Configure Redis backups.** Daily RDB snapshot via the Redis BGSAVE pattern; snapshot uploaded to Cloud Storage; retention 7 days. Cache is reconstruct-able; backups exist mainly to speed up cold-start, not to preserve unique data.
- [ ] **Configure audit-log backup.** Audit log is append-only and stored with WORM (Write-Once-Read-Many) semantics; backup is a daily snapshot of the WORM-protected store to a separate region's WORM-protected store. Retention: 7 years.
- [ ] **Configure object-storage backup.** Buckets have: versioning enabled; soft-delete with 30-day retention; lifecycle policy that moves objects > 90 days old to a "cold-storage" bucket. Cross-region replication for staging and production buckets.
- [ ] **Define and document RTO/RPO.** Per service, document the target RTO and RPO and the rationale:
  - Engine service: RTO 4 hours, RPO 15 minutes (stateless application; recovery requires Postgres recovery; the RPO is bounded by Postgres PITR).
  - HITL service: RTO 4 hours, RPO 15 minutes (state in Postgres).
  - UI service: RTO 30 minutes, RPO N/A (stateless).
  - Audit log: RTO 1 hour, RPO 0 (synchronous replication; cannot lose data).
  - Auth service (Keycloak): RTO 2 hours, RPO 1 hour (Postgres backend; PITR but with longer practical recovery time).
  - Eval gold-set: RTO 8 hours, RPO 1 day (slowly-changing data; daily snapshot is enough).
- [ ] **Schedule monthly restore-tests.** Calendar entry on the 1st of every month: ops lead spins up a parallel staging environment from yesterday's backup; verifies the engine, HITL, and UI all work; verifies sample queries return expected results; tears down. Time the recovery; record actual vs. target RTO.
- [ ] **Schedule annual full-cluster recovery test.** Once per year, simulate complete loss of the primary cluster: restore from cross-region backup; bring up a new cluster; restore all stateful services; verify end-to-end. Record findings and remediations.
- [ ] **Author the DR runbook.** `docs/runbooks/disaster-recovery.md` covering scenarios:
  - Postgres logical corruption (PITR to before the corruption time).
  - Postgres physical loss (restore from latest full + incremental).
  - Cluster-wide loss (failover to cross-region; bring up new cluster from IaC; restore all stateful services).
  - Audit-log compromise (verify hash chain; restore from independent backup; reconcile).
  - Region-wide outage (failover; document the customer-communication procedure).
  - Each scenario: detection signal; containment steps; recovery steps; verification; post-incident review.
- [ ] **Configure backup-completion monitoring.** Cloud Logging filter that catches backup-job success/failure events; failures alert ops within 5 minutes.
- [ ] **Configure integrity checks.** Daily job: spot-check a random backup's restorability (e.g., extract the backup, verify the SQL is valid, verify the archive is uncorrupted).
- [ ] **Configure restore drills as code.** A script (`infra/dr/restore-test.sh`) that automates the monthly point-restore. Reduces variability; ensures the procedure is reproducible.
- [ ] **Stage a chaos-test bucket.** A dedicated bucket where we periodically delete random objects to verify the recovery story works. Document this in the runbook.

### Acceptance criteria

- Cloud SQL PITR enabled; WAL archive operational; verified by a test PITR.
- All scheduled backups (weekly full + daily incremental) run; verified by inspecting backup history for at least one full cycle.
- Cross-region replication operational for staging.
- Audit-log backup operational with WORM; verified.
- Object-storage versioning + soft-delete + cross-region replication operational.
- RTO/RPO documented per service.
- Monthly restore-test calendar in place; first restore-test executed and recorded.
- Annual full-cluster recovery test scheduled.
- DR runbook published and dry-run-tested for each major scenario.
- Backup-completion monitoring operational; tested with a deliberate failure injection.
- Integrity checks operational.

## Alternatives Considered

- **Use Cloud SQL's default backup only (no WAL archive).** Rejected: default backup is daily; PITR requires WAL archive to give us 15-minute RPO.
- **Store backups in the same region as primary.** Rejected: regional outage destroys both. Cross-region is cheap insurance.
- **Skip Redis backups.** Rejected as primary: cache is reconstruct-able but cold-start without the cache produces a noticeable performance regression; backups speed cold-start. However, Redis backup is lower priority — would skip if budget tight.
- **Skip restore-tests; trust that Cloud SQL backups work.** Rejected: untested backups are folkloric. The first time we discover a backup is corrupt, we cannot afford it to be the moment we need it.
- **Skip cross-region replication; bet on regional reliability.** Rejected: cross-region cost is small; the insurance value is large.
- **Make RTO/RPO targets aspirational rather than measured.** Rejected: untested targets are meaningless. Monthly restore-tests measure actual RTO; documented gap-to-target drives improvement.
- **Skip annual full-cluster test; rely on monthly point-restores.** Rejected: full-cluster scenarios surface integration gaps that point-restores miss. Annual cadence is the floor.

## Success Metrics

- **Primary**: First successful monthly restore-test completed within 30 days of task assignment, with documented timing meeting or beating RTO target. Measured by: restore-test record file.
- **Guardrail**: Zero unrecovered backup failures during the engagement; zero RTO breaches in restore-tests. Measured by: backup-monitoring + restore-test records.

## Scope

### In scope
- Postgres PITR + scheduled backups.
- Redis snapshots.
- Audit-log backup with WORM.
- Object-storage versioning + soft-delete + cross-region.
- RTO/RPO documentation per service.
- Monthly restore-test calendar + annual full-cluster recovery test.
- DR runbook.
- Backup-completion monitoring.
- Integrity-check job.
- Restore-test automation script.

### Out of scope
- Customer-data backups for the production-shinhan-poc environment (handled at kickoff; placeholders here).
- Backup encryption (already covered by P01-T08).
- Geo-redundant backups outside VN regions for VN-tenant data (would violate residency; stay within VN regions).
- Application-level data validation post-restore beyond smoke tests (handled by Phase 4 eval-harness in a different context).

## Dependencies

- **Upstream**: P01-T01, P01-T02, P01-T04 (Cloud SQL + buckets + KMS), P01-T08 (encryption), P02-T09 (audit log).
- **People**: ops lead authoring; eng-sec reviewing; founder ratifying RTO/RPO commitments.
- **External**: Cloud SQL, Cloud Storage, KMS.
- **Memory references**: `shinhanos_data_residency`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: For Postgres PITR retention — 7 days enough or do we want 14? Recommendation: 7 days for staging (cost); production should be 14+. Document.
- Q2: For audit-log retention, is 7 years enough or do specific Shinhan regulations require longer? Recommendation: 7 years is the standard floor; verify against SBV / Cybersecurity Law specifics.
- Q3: For monthly restore-tests, do we test against staging or a separate "DR-test" environment? Recommendation: separate DR-test environment to avoid disrupting staging.
- Q4: For annual full-cluster recovery, do we tear down the actual primary or simulate by spinning up a parallel? Recommendation: parallel for the demo phase; for production track, schedule a real failover during a planned maintenance window.
- Q5: For cross-region replication, which two GCP regions for staging? Recommendation: `asia-southeast1` (Singapore) primary, `asia-east1` (Taiwan) secondary. Both are non-VN; for production-VN tenants, primary in VN, secondary in another VN region or VN-hosted IDC mirror.

## Implementation Notes

- Cloud SQL PITR uses the WAL archive in Cloud Storage. The bucket must have the same KMS key access; Service Account permissions matter.
- For the monthly restore-test, automate via a script that: (1) provisions a fresh Cloud SQL instance from yesterday's backup; (2) runs the engine smoke-test against it; (3) tears down. Total cost: ~$2 per restore-test.
- For the annual full-cluster test, cost is higher (~$50-100 in cloud spend) but worth it.
- For backup-completion monitoring, use Cloud Logging's metric-filter-based alerts. Alert payload includes the failed job ID for easy investigation.
- For integrity checks, do not validate every backup (too expensive); spot-check 5% randomly. Failure of any spot-check triggers full validation.
- For the DR runbook, include screenshots and exact commands; under stress, generic instructions become unusable.
- For cross-region replication of object storage, ensure the destination bucket has the same encryption key (or a region-local KMS key in the destination region with replication-aware IAM).

## Test Plan

- Test 1: Postgres PITR — corrupt a row in staging, capture timestamp, perform PITR to before the corruption; verify the row is restored.
- Test 2: Backup completeness — query backup-history; verify the expected count of weekly + incremental backups exists for the past 30 days.
- Test 3: Audit-log restore — restore audit log from the daily snapshot to a parallel store; verify hash-chain integrity is preserved.
- Test 4: Object-storage soft-delete — delete an object; restore from soft-delete; verify the version count is correct.
- Test 5: Backup-failure alerting — manually fail a backup job; verify alert fires within 5 minutes.
- Test 6: Restore-test automation — execute the script; verify it provisions, smoke-tests, and tears down correctly.
- Test 7: Full-cluster scenario (annual) — execute the end-to-end recovery; capture timing.

## Rollback Plan

- This task is operational, not application-code; rollback isn't a typical concern. Bad backup configurations are corrected in IaC and re-applied.
- A failed restore-test indicates a real issue; do not consider the test "rolled back" — investigate and fix.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Backup configuration (IaC) | `infra/terraform/.../backup.tf` | Ops | Continuous |
| RTO/RPO doc | `docs/runbooks/rto-rpo.md` | Ops | Continuous |
| DR runbook | `docs/runbooks/disaster-recovery.md` | Ops | Continuous |
| Monthly restore-test records | `docs/audit/restore-tests/{date}.md` | Ops | 7 years |
| Annual full-cluster test record | `docs/audit/dr-annual/{year}.md` | Founder | 7 years |
| Backup-completion logs | Central observability store | Ops | 1 year |
| Integrity-check logs | Central observability store | Ops | 1 year |
| Restore-test automation script | `infra/dr/restore-test.sh` | Ops | Continuous |

## Operational Risks

- **Backup-job stops running silently.** Mitigation: backup-completion monitoring; alert on absence.
- **Cross-region replication lags.** Mitigation: monitoring of replication lag; alert on lag > 1 hour.
- **Restore-test spins up cost beyond budget.** Mitigation: tear-down automation; cost cap.
- **WORM audit-log bucket prevents legitimate operations (e.g., GDPR deletion).** Mitigation: WORM is for the *backup* of the audit log; the live audit log can support deletion of personal data per regulation, but the backup is preserved with a redaction marker.
- **Annual full-cluster test reveals a fundamental gap.** Mitigation: that's the *value* of the test; remediate the gap.

## Definition of Done

- All backups configured and running.
- Cross-region replication operational.
- RTO/RPO documented.
- DR runbook published.
- Monthly restore-test calendar in place; first test completed.
- Annual full-cluster test scheduled.
- Backup-completion monitoring + integrity checks operational.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: ops lead authors and reviews; eng-sec reviews encryption and audit-log backup; `@stephen-cheng` ratifies RTO/RPO commitments.
