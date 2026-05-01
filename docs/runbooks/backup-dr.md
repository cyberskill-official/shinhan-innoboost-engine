# Backup & Disaster Recovery Runbook — Shinhan Innoboost Engine

> Procedures for automated backups, point-in-time recovery, restore testing, and disaster recovery.

**Owner**: ops + platform eng
**Last updated**: 2026-05-02
**Status**: DRAFT — automated schedules pending GKE provisioning

---

## Backup Strategy

| Data store | Method | Frequency | Retention | RPO | RTO |
|---|---|---|---|---|---|
| **Cloud SQL (Postgres)** | Automated + PITR | Continuous (WAL) + daily full | 30 days | 5 minutes | 30 minutes |
| **Redis** | RDB snapshot | Every 6 hours | 7 days | 6 hours | 10 minutes |
| **GCS (artefacts)** | Versioned bucket | Continuous | 90 days | 0 (versioned) | 5 minutes |
| **Keycloak DB** | Cloud SQL backup (shared) | Same as above | 30 days | 5 minutes | 30 minutes |
| **Config/IaC** | Git | Continuous | Indefinite | 0 (committed) | 5 minutes |

---

## Cloud SQL Point-in-Time Recovery

### Recovery procedure

```bash
# 1. Identify the target recovery time
TARGET_TIME="2026-05-01T18:00:00Z"

# 2. Create a new instance from backup
gcloud sql instances clone shinhan-innoboost-staging \
  shinhan-innoboost-staging-recovered \
  --point-in-time "$TARGET_TIME"

# 3. Verify the recovered data
gcloud sql connect shinhan-innoboost-staging-recovered \
  --user=postgres

# 4. If verified, swap connection strings
# Update Doppler: DATABASE_URL → new instance connection

# 5. Delete old instance after 48h hold period
```

### Automated backup verification

```bash
# Runs monthly via CronJob in ops namespace
# 1. Clone current DB to test instance
# 2. Run integrity checks (pg_dump | pg_restore roundtrip)
# 3. Run sample queries from eval gold-set
# 4. Report results to #shinhan-innoboost-alerts
# 5. Tear down test instance
```

---

## Restore Test Calendar

| Month | Test type | Owner | Verify |
|---|---|---|---|
| May 2026 | Full restore from backup | Platform eng | Data integrity, app connectivity |
| Jun 2026 | PITR to T-1h | Platform eng | Query correctness |
| Jul 2026 | Cross-region restore | Platform eng | RTO measurement |
| Quarterly | Full DR simulation | Ops lead | End-to-end recovery |

---

## Disaster Recovery Scenarios

### Scenario 1: Database corruption

1. **Detect**: Monitoring alert on query errors or data inconsistency
2. **Assess**: Identify the corruption scope (single table vs. full DB)
3. **Recover**: PITR to the last known-good timestamp
4. **Verify**: Run eval gold-set against recovered DB
5. **Notify**: Alert squad via `#shinhan-innoboost-alerts`

### Scenario 2: Cluster failure (GKE)

1. **Detect**: All pods unhealthy; monitoring alerts fire
2. **Assess**: GKE status page; `kubectl get nodes`
3. **Recover**:
   - If single-zone failure: GKE Autopilot auto-heals
   - If full cluster failure: Terraform re-apply to recreate cluster
   - Re-deploy via `helm upgrade` (images are in GHCR, unaffected)
4. **Verify**: Smoke tests pass; Slack notification sent
5. **RTO target**: 30 minutes

### Scenario 3: Region failure

1. **Detect**: GCP region status page
2. **Assess**: Confirm region-wide outage
3. **Recover**:
   - Spin up cluster in backup region (`asia-southeast2` Jakarta)
   - Restore DB from cross-region backup replica
   - Update DNS to point to new region
4. **RTO target**: 2 hours (acceptable for demo phase; production needs < 30min)

### Scenario 4: Ransomware / compromise

1. **Detect**: Security alert; unusual access patterns
2. **Isolate**: Revoke all service account tokens; disable Keycloak realm
3. **Assess**: Identify the blast radius
4. **Recover**: Restore from last known-clean backup (pre-compromise)
5. **Investigate**: Full incident response per `docs/runbooks/incident-response.md`
6. **Notify**: Founder + legal within 1 hour

---

## Backup Encryption

All backups are encrypted:
- Cloud SQL: Google-managed encryption (AES-256) + optional CMEK
- GCS: Server-side encryption with Google-managed keys
- Exported backups: Application-layer encryption before export

---

## Contacts

| Role | Who | When to contact |
|---|---|---|
| Ops lead | @______ | Any backup/restore issue |
| Platform eng | @______ | GKE/Terraform issues |
| Founder | @stephen-cheng | DR scenario escalation |
| GCP support | Case filing | Region failures, SQL issues |
