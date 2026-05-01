---
title: "Build append-only hash-chained audit log with WORM export"
author: "@cyberskill-eng-sec"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: minimal
target_release: "2026-07-10"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Build an append-only, hash-chained audit log that captures every consequential event in the demo build: every NL→SQL pipeline run (question, retrieved metric, generated SQL, validator verdict, policy verdict, executed SQL, result hash, narrative, citations, confidence tier, requester, tenant, timestamp); every authentication event; every authorisation decision; every HITL action; every consent event; every erasure event; every break-glass override; every key-compromise response. Hash-chained so any retroactive tampering is detectable; append-only at the storage level (Postgres with INSERT-only roles + WORM mirror in Cloud Storage Object Lock). 7-year retention. Queryable by admin UI (P05-T05); exportable to SIEM. The audit log is the single most important compliance artefact; without it, every "auditable" claim collapses.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"audit log adopted by Risk team as primary review surface" — CyberSkill Engagement B reference (via form answers)
"per-decision audit log" — SB5 form answer
"audited answer in seconds" — SF9 form answer
</untrusted_content>

## Problem

The Form Answers commit explicitly to comprehensive audit logging across multiple references. Every Phase 2 component (P02-T01..T08), every Phase 1 security component (P01-T06..T10), every Phase 6 HITL action, every Phase 8 compliance check feeds the audit log. Without it, the demo's compliance posture is decorative.

Specific gaps if we shortcut:

- **Without append-only, an attacker who compromises the engine can rewrite history.** Hash-chaining detects the rewrite even after the fact.
- **Without hash-chaining, integrity of the log is unprovable.** Auditors will not accept a log that could have been edited.
- **Without WORM (Write-Once-Read-Many) export, regulators cannot rely on the log as evidence.** The audit log's primary mirror is in Postgres for query speed; the WORM copy in Cloud Storage Object Lock is the regulatory artefact.
- **Without 7-year retention, financial-sector reviewers will flag the gap.** Vietnamese banking regulation typically expects 7+ years of audit retention.
- **Without query and SIEM-export capability, the log is write-only — useful for evidence, useless for ongoing security operations.**
- **Without integrity verification, log corruption goes undetected.** Nightly verification of the hash chain is the structural enforcement.

The `cyberos_ai_compliance` memory note's 7 primitives include "audit log" as a foundational primitive; this task is its implementation.

The `feedback_p1_scope_preference` memory note biases us richer. For the audit log, "richer" means: append-only storage + hash-chaining + WORM export + 7-year retention + admin query UI + SIEM export + nightly integrity check + per-event-class redaction policy. Each layer is well-trodden; together they form an enterprise-grade audit posture.

## Proposed Solution

A multi-layer audit-log architecture:

1. **Application-side write API.** `engine/audit/writer.ts` with strongly-typed event classes (NLToSQLRun, AuthEvent, RBACDecision, HITLAction, ConsentEvent, ErasureEvent, BreakGlass, etc.). Writers append; never edit.
2. **Postgres primary.** `audit_log` table; INSERT-only role; trigger-enforced immutability. Hash-chained: each row has a `prev_hash` (the hash of the previous row) and `row_hash` (the hash of this row's contents + prev_hash). Tampering with any row breaks the chain from that point forward.
3. **WORM mirror.** Daily snapshot of the previous day's rows to Cloud Storage with Object Lock retention 7 years; encrypted with the audit-log KMS key (P01-T08 separation).
4. **Query API.** Admin UI (P05-T05) calls; supports filters by event class, tenant, requester, time range, and free-text on serialisable fields.
5. **SIEM export.** Nightly export to a customer-side SIEM (or our internal SIEM if the customer doesn't have one). Format: JSON-lines with the canonical event schema.
6. **Integrity check.** Nightly hash-chain verification; alert on any break.
7. **Redaction policy.** Per-event-class, what fields are redacted in normal queries (PII fields are masked unless the querier has elevated access).

Setup target: 21 days from task assignment.

### Subtasks

- [ ] **Author the canonical event schema.** Each event class has: `id` (UUID-v7 for ordering); `event_class`; `event_subclass`; `tenant_id`; `requester_id`; `requester_role`; `timestamp`; `payload` (event-specific JSON); `payload_redaction_map` (which fields to redact in normal queries); `prev_hash`; `row_hash`. Documented at `engine/audit/EVENT_SCHEMA.md`.
- [ ] **Define event classes.** NLToSQLRun, AuthEvent, RBACDecision, HITLAction, ConsentEvent, ErasureEvent, BreakGlass, KeyCompromise, MetricVersionBump, AdminOverride, PolicyDecision, FaithfulnessFailure. Each class has its own subclass enum and payload schema.
- [ ] **Implement Postgres primary.** Table `audit_log` with columns matching the schema; row-level INSERT-only role; trigger that prevents UPDATE / DELETE.
- [ ] **Implement hash chaining.** Trigger on INSERT computes `prev_hash` from the most-recent row; computes `row_hash` from `(prev_hash || canonical_serialised_row)`; both stored.
- [ ] **Implement application-side writer.** `engine/audit/writer.ts`. Type-safe per-event-class methods. Async (fire-and-forget with bounded buffer); blocking only when the buffer is full.
- [ ] **Implement WORM mirror.** Daily Cloud Run job: extract yesterday's rows from Postgres; serialise to JSON-lines; upload to Cloud Storage bucket with Object Lock retention 7 years; encrypted with the audit-log KMS key.
- [ ] **Implement query API.** REST + gRPC: `GET /audit?tenant=X&class=Y&from=Z&to=W`; pagination; cursor-based for deep pagination. Authorisation: only admins can query; cross-tenant queries denied.
- [ ] **Implement admin UI surface (backend).** Per P05-T05; query builder; export to CSV / JSONL.
- [ ] **Implement SIEM export.** Nightly job; format JSON-lines; ship to customer-configured SIEM endpoint or our internal store. Retry on failure; alert on persistent failure.
- [ ] **Implement nightly integrity check.** Verify hash chain by recomputing each row's hash and comparing; alert on any mismatch with the row IDs of break.
- [ ] **Implement redaction policy.** For each event class, document which payload fields are redacted in normal queries (e.g., `NLToSQLRun.question_text` may contain PII — redacted unless the querier has `audit:read_unredacted` capability).
- [ ] **Implement performance tuning.** Indexes on `tenant_id`, `requester_id`, `event_class`, `timestamp`; partition by month; cold-storage move at 30 days.
- [ ] **Implement back-pressure handling.** If the audit-log writer is overwhelmed, buffer fills; once buffer full, alert + drop with a "self-monitoring" log entry that records the drop. Never block the user-facing response.
- [ ] **Test exhaustively.** > 100 tests covering: write integrity; hash chain correctness; tampering detection; query correctness; SIEM export; redaction; back-pressure.

### Acceptance criteria

- Postgres primary operational; hash-chained; INSERT-only enforced.
- Application writer API operational; type-safe.
- WORM mirror operational; verified by Object Lock retention check.
- Query API operational; tested with sample queries.
- Admin UI backend operational.
- SIEM export operational.
- Nightly integrity check operational; tested with deliberate tampering.
- Redaction policy operational.
- Performance: write p99 < 50ms; query p95 < 500ms.
- Test suite > 100 tests, > 90% coverage.

## Alternatives Considered

- **Use a managed audit-log service (e.g., GCP Audit Logs).** Rejected: lacks the application-level event types we need; vendor-locked.
- **Use an immutable database (e.g., QLDB).** Rejected: AWS-locked; Postgres + WORM mirror is sufficient and portable.
- **Skip hash chaining; trust the database.** Rejected: regulators expect tamper-evidence; hash chain is cheap.
- **Synchronous writes to WORM on every event.** Rejected: too slow; daily mirror is sufficient for 7-year regulatory retention; 24-hour gap is acceptable.
- **Store audit log in the same Postgres as operational data.** Rejected: separate database (with separate KMS key per P01-T08); blast-radius separation.
- **Skip the nightly integrity check.** Rejected: defence-in-depth; trivial cost; high signal value.
- **Skip SIEM export; let customers query our API.** Rejected: customers expect SIEM; export is the standard.

## Success Metrics

- **Primary**: Audit log captures every event class with verified hash-chain integrity within 21 days. Measured by: integrity check + sample query.
- **Guardrail**: Zero audit-log gaps (missing events) during the engagement; zero tamper events. Measured by: nightly integrity check + cross-check with application logs for completeness.

## Scope

### In scope
- Event schema + classes.
- Postgres primary with hash chain + INSERT-only.
- WORM mirror.
- Application writer API.
- Query API + admin UI backend.
- SIEM export.
- Nightly integrity check.
- Redaction policy.
- Performance + back-pressure handling.
- Test suite.

### Out of scope
- Audit-log analytics (out of scope; just storage + query).
- Compliance-specific reporting (handled in P11-T04 dossier).
- Real-time audit-log streaming to customer SIEM (deferred unless needed).
- Audit-log search beyond the standard filters (deferred).

## Dependencies

- **Upstream**: P01-T01, P01-T04 (Postgres + Cloud Storage), P01-T08 (KMS audit-log key).
- **Downstream**: every Phase 1+ task that writes events; P05-T05 admin UI; P11-T04 compliance dossier.
- **People**: eng-sec authoring; engine tech lead reviewing writer API; ops reviewing WORM mirror.
- **Memory references**: `cyberos_ai_compliance`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: Hash function — SHA-256 or BLAKE3? Recommendation: SHA-256 (universally accepted, regulatory-friendly).
- Q2: WORM-mirror retention — 7 years floor; do specific Shinhan regulations require longer? Recommendation: 7 years; verify with legal.
- Q3: Cold-storage move — at 30 days or 90? Recommendation: 30 days; query rate drops sharply after that.
- Q4: SIEM format — JSON-lines or CEF (Common Event Format)? Recommendation: JSON-lines for flexibility; CEF as a future option.
- Q5: For redaction, who defines the redaction map per event class? Recommendation: eng-sec + compliance lead; reviewed quarterly.

## Implementation Notes

- Hash chain breaks if a row is deleted or modified; the chain stays correct only if INSERT is the only mutation.
- For performance, the trigger that computes hashes can be optimised by caching the previous row's hash in a separate sequence-tracker table.
- For WORM mirror, Cloud Storage Object Lock is the GCP equivalent of S3 Object Lock; verify retention is set correctly per object.
- For SIEM export, the customer-configured endpoint is in their DPA / NDA; default to our internal store if no endpoint configured.
- For redaction, the redaction map specifies field-paths within the payload (e.g., `payload.question_text` is redacted; `payload.metric_id` is not). Application of the map happens at query time, not write time — preserving the original for elevated queries.
- For performance, partition by month with constraint exclusion; cold-storage move at 30 days uses Postgres logical replication or pg_dump-based.

## Test Plan

- Test 1: Write event; verify it appears in audit log with correct hash.
- Test 2: Tamper test — manually edit a row's payload (bypassing the trigger); run integrity check; verify break detected.
- Test 3: Query test — query by tenant + class + time range; verify correct rows returned; verify cross-tenant query denied.
- Test 4: Redaction test — non-elevated user queries; verify PII fields are masked; elevated user queries; verify full payload.
- Test 5: WORM verification — verify Object Lock retention is 7 years on a sample object.
- Test 6: SIEM export — verify export file format; verify all yesterday's events are present.
- Test 7: Integrity check — full hash-chain verification on a sample dataset; verify it completes in reasonable time.
- Test 8: Performance — write p99 < 50ms under load; query p95 < 500ms.
- Test 9: Back-pressure — saturate the writer buffer; verify drops are recorded; user-facing path not blocked.

## Rollback Plan

- A bad event-schema change is rolled back via PR revert + redeploy; old rows remain valid.
- A bad WORM-mirror config (e.g., wrong retention) is corrected; old objects retain whatever retention was set at upload.
- A failed integrity check is investigated; if a real tamper, treat as a P0 incident.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Event schema | `engine/audit/EVENT_SCHEMA.md` | Eng-sec | Continuous |
| Audit log primary | Postgres `audit_log` table | Eng-sec | 7 years |
| WORM mirror | Cloud Storage with Object Lock | Eng-sec | 7 years |
| SIEM export | Customer SIEM endpoint or internal store | Eng-sec | Per retention policy |
| Integrity check results | `docs/audit/integrity-checks/{date}.md` | Eng-sec | 7 years |
| Redaction map | `engine/audit/redaction-map.yaml` | Eng-sec + compliance lead | Continuous |
| Performance metrics | Central observability store | Engine tech lead | Continuous |

## Operational Risks

- **Buffer overflow under sustained load.** Mitigation: bounded buffer; alert on near-full; back-pressure with self-monitoring entry.
- **WORM-mirror upload failure.** Mitigation: retry with backoff; alert on persistent failure; daily reconciliation.
- **Integrity check finds a break.** Mitigation: immediate investigation; treat as P0; potential security incident.
- **Query performance degrades as log grows.** Mitigation: partition by month; cold-storage move; index tuning; consider archival to a separate query store.
- **Redaction policy mistake exposes PII.** Mitigation: redaction map reviewed quarterly; automated test verifies redaction for each event class.

## Definition of Done

- All five components in place.
- Performance budget met.
- Integrity verified.
- Redaction policy operational.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
The audit log captures system-generated events; payloads may include user-supplied content (e.g., the question text in NLToSQLRun events). Redaction policy ensures PII is not exposed in normal queries.

### Human Oversight
Eng-sec authors and reviews. Compliance lead approves redaction policy. Admin UI gives elevated users (compliance, founder) the ability to audit. Nightly integrity check is the structural enforcement.

### Failure Modes
- Writer down: events lost (mitigated by buffer + alert; in worst case, application-log fallback).
- WORM mirror failure: events not archived; nightly retry; manual archival if persistent.
- Integrity break: P0 incident; investigation.
- Redaction policy bug: PII exposed in queries; periodic test catches.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: eng-sec authors implementation; compliance lead reviews redaction policy; engine tech lead reviews writer API.
