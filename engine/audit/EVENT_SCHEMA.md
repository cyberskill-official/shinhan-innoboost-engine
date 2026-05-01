# Audit-log event schema

Per P02-T09. Append-only, hash-chained. Postgres primary + WORM mirror.

## Event classes

| Class | Subclass examples |
|---|---|
| `nl_to_sql_run` | `started`, `validated`, `executed`, `refused`, `cached_hit` |
| `auth_event` | `login_success`, `login_failure`, `logout`, `mfa_prompt`, `mfa_pass`, `mfa_fail` |
| `rbac_decision` | `allow`, `deny`, `elevation_granted`, `elevation_revoked` |
| `hitl_action` | `routed`, `assigned`, `approved`, `edit_approved`, `rejected`, `escalated` |
| `consent_event` | `recorded`, `revoked`, `purpose_change` |
| `erasure_event` | `requested`, `executed`, `redacted` |
| `break_glass` | `override_issued`, `override_revoked` |
| `key_compromise` | `detected`, `rotated`, `recovered` |
| `metric_version_bump` | `published`, `superseded` |
| `admin_override` | `issued`, `revoked` |
| `policy_decision` | `pre_gate`, `mid_gate`, `post_gate` |
| `faithfulness_failure` | `mismatch_detected` |

## Required fields

| Field | Type | Description |
|---|---|---|
| `id` | UUIDv7 | Time-ordered for causal ordering |
| `event_class` | enum | One of above |
| `event_subclass` | enum | Per-class subclass |
| `tenant_id` | string | Tenant scope |
| `requester_id` | string \| null | User or `system` |
| `requester_role` | string | RBAC role at the time |
| `timestamp` | ISO 8601 | Event time |
| `payload` | JSON | Event-specific (subject to redaction) |
| `payload_redaction_map` | JSON | Per-field redaction rules |
| `prev_hash` | hex SHA-256 | Hash of previous row |
| `row_hash` | hex SHA-256 | Hash of `prev_hash || canonical(this row)` |

## Hash chain

Trigger `audit_log_hash_chain` runs on INSERT:
- `prev_hash` = `(SELECT row_hash FROM audit_log ORDER BY id DESC LIMIT 1)` (or all-zeros for first row)
- `row_hash` = `SHA256(prev_hash || canonical_serialise(NEW))`

Tampering with any row breaks the chain from that point forward. Nightly integrity check (P02-T09) detects.

## Redaction policy

Per-event-class redaction map specifies which payload fields are masked in normal queries (e.g., `nl_to_sql_run.payload.question_text` may contain PII). Elevated queries (with `audit:read_unredacted`) see full payload.

## See also

- P02-T09 — audit log FR
- `compliance/security/THREAT_MODEL.md` — threats this audit log mitigates
