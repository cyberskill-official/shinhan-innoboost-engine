---
title: "Implement structured logging shipping to OpenSearch / Loki"
author: "@cyberskill-eng"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: not_ai
target_release: "2026-08-28"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Implement structured (JSON) logging across every workspace shipping logs to a central observability store: OpenSearch (cloud + on-prem) primary, Grafana Loki as a lightweight alternative. Each log entry includes: timestamp; level; service name; request ID (for cross-service tracing); tenant ID; user ID; structured fields (no string interpolation); PII redaction at the field level. Log retention 30 days hot, 1 year warm, 7 years cold (audit-tier logs). The structured log is the substrate every other observability surface (P09-T02 metrics, P09-T03 tracing, P09-T05 cost) consumes.

## Problem

Without structured logging, every observability follow-on is hampered. Free-text logs are unparseable; non-JSON logs cannot be queried; PII in logs becomes a data-protection violation; logs without retention policy bloat or vanish. Banking-sector reviewers expect operational evidence; structured logs are how it's surfaced.

Specific gaps if we shortcut:

- **Without JSON, queries are regex archaeology.**
- **Without request-ID, multi-service incident investigation is impossible.**
- **Without PII redaction, logs become a P02-T07 PDPL violation surface.**
- **Without retention tiers, costs balloon or audit-tier loses visibility.**

The `shinhanos_ai_compliance` memory note's 7 primitives include observability; this task is the foundation.

The `feedback_p1_scope_preference` memory note biases us richer. For logging, "richer" means: structured + request-tracing + PII-redaction + retention-tiered + query-friendly + cost-aware.

## Proposed Solution

A logging library + observability backend:

1. **Logging library** in `engine/observability/logger.ts` (and equivalents per workspace). Outputs JSON; per-call structured fields; PII-redaction map per field-name pattern.
2. **OpenSearch primary** as the central store; Helm-deployed in cloud + on-prem.
3. **Loki as alternative** for lightweight on-prem deployments.
4. **Retention tiers**: hot 30 days (OpenSearch primary index); warm 1 year (warm tier); cold 7 years (Cloud Storage Object Lock for audit-tier logs).
5. **Request-ID propagation** across services via OpenTelemetry-compatible headers.
6. **Audit-tier integration**: P02-T09 audit log writes to a dedicated index with WORM mirror.
7. **Search + alert** via OpenSearch query DSL or Grafana.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Author logging schema.** Documented at `docs/observability/LOG_SCHEMA.md`. Required fields per entry: `timestamp` (ISO 8601), `level` (debug/info/warn/error/fatal), `service`, `request_id`, `tenant_id`, `user_id` (or null for system), `event` (short identifier), `fields` (structured payload). PII redaction map.
- [ ] **Implement logger library.** TypeScript: `engine/observability/logger.ts`. Wraps pino or similar; auto-injects request-ID from async context; auto-redacts per the redaction map.
- [ ] **Integrate logger into every workspace.** engine, hitl, ui, eval, data — all use the same library.
- [ ] **Configure OpenSearch.** Helm chart (P01-T04); 3-node cluster for staging; per-tenant index naming.
- [ ] **Configure Loki for lightweight on-prem.** Alternative for resource-constrained deployments.
- [ ] **Configure log shipping.** Vector or Fluent Bit forwarders; per-service pod sidecars; ship to OpenSearch or Loki.
- [ ] **Configure retention tiers.** OpenSearch ILM (Index Lifecycle Management); hot → warm → cold per documented schedule.
- [ ] **Implement request-ID propagation.** OpenTelemetry headers (`traceparent`); generated at ingress; propagated through service calls.
- [ ] **Implement PII-redaction.** Field-name patterns matched per `engine/privacy/sensitivity-rules.yaml` (P02-T07); auto-redact on log emission.
- [ ] **Configure audit-tier integration.** P02-T09 audit log entries → dedicated index; WORM mirror per P02-T09 spec.
- [ ] **Configure access control.** OpenSearch role-based; admin sees all; reviewer sees own actions; engineer sees engine logs only.
- [ ] **Author log-query runbook.** `docs/runbooks/log-query.md`: how to investigate by request-ID; common query patterns.
- [ ] **Test exhaustively.**

### Acceptance criteria

- Logging library shipped and integrated across all workspaces.
- OpenSearch + Loki operational.
- Retention tiers configured; verified by ILM check.
- Request-ID propagation verified across services.
- PII redaction verified.
- Audit-tier integration with P02-T09 working.
- Access control enforced.
- Runbook published.

## Alternatives Considered

- **Datadog / Splunk.** Rejected: vendor cost; data-residency concerns; OpenSearch is open + capable.
- **Plain text logs.** Rejected: unqueryable.
- **No central store; per-pod logs.** Rejected: incident investigation requires aggregation.
- **Single retention tier.** Rejected: cost balloons or audit-tier loses; tiered is correct.

## Success Metrics

- **Primary**: Structured logging shipped within 14 days; cross-service request-ID propagation verified.
- **Guardrail**: Zero PII-in-logs incidents during the engagement.

## Scope

### In scope
- Logger library + per-workspace integration.
- OpenSearch + Loki backends.
- Retention tiers + ILM.
- Request-ID propagation.
- PII redaction.
- Audit-tier integration.
- Access control.
- Runbook.

### Out of scope
- Metrics (P09-T02).
- Tracing (P09-T03).
- Alerting (P09-T04).
- Cost dashboard (P09-T05).

## Dependencies

- **Upstream**: P01-T04 (IaC for OpenSearch); P02-T07 (PII rules); P02-T09 (audit-tier sink); P01-T08 (encryption-at-rest for logs).
- **Downstream**: P09-T02..T05 (everything else in observability).
- **People**: engineer authoring; eng-sec reviewing PII redaction.

## Open Questions

- Q1: OpenSearch vs Elasticsearch — which? Recommendation: OpenSearch (Apache 2.0; AWS-friendly).
- Q2: Per-tenant index or shared with tenant_id field? Recommendation: shared with tenant_id (operational simplicity); RBAC at query layer.
- Q3: Forwarder — Vector or Fluent Bit? Recommendation: Vector (better config; rust-native; lower overhead).

## Implementation Notes

- Logger emits stdout; Kubernetes captures; Vector forwards to OpenSearch.
- PII redaction at logger emission (not at forwarder) so the redacted form is what hits the wire.
- Request-ID from OpenTelemetry context; if not present, generated at ingress.
- ILM rolls 30-day hot → 1-year warm → 7-year cold (Cloud Storage with Object Lock for audit-tier).

## Test Plan

- Test 1: Sample log entry — verify structure + required fields.
- Test 2: Cross-service request — verify request-ID flows through chat → engine → warehouse.
- Test 3: PII redaction — log a sample PII value; verify redaction.
- Test 4: Retention — verify ILM policy active; sample old entry rolls to warm.
- Test 5: Access control — viewer cannot see engineer-tier logs.
- Test 6: Audit-tier integration — P02-T09 entry lands in dedicated index.

## Rollback Plan

- Bad logger config rolled back via PR.
- Bad ILM policy adjusted at OpenSearch.
- Lost logs during outage are unrecoverable; mitigation is multiple log sinks for critical paths.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Logger library | `engine/observability/logger.ts` | Engineer | Continuous |
| Log schema | `docs/observability/LOG_SCHEMA.md` | Engineer | Continuous |
| OpenSearch config | `infra/helm/opensearch/values.yaml` | Eng-sec | Continuous |
| ILM policy | `infra/observability/ilm-policy.json` | Eng-sec | Continuous |
| Log-query runbook | `docs/runbooks/log-query.md` | Engineer | Continuous |
| Audit-tier index | OpenSearch `audit-*` indices | Eng-sec | 7 years |

## Operational Risks

- **OpenSearch cluster failure.** Mitigation: HA cluster; alerts; emergency local-disk fallback.
- **Log volume blows budget.** Mitigation: retention tiers; debug-level off in production; sampling.
- **PII leaks into logs.** Mitigation: redaction at logger; per-PR review.
- **Forwarder back-pressure.** Mitigation: bounded buffer; alerts on drop.

## Definition of Done

- Logging shipped across workspaces.
- Backends operational.
- Retention + access + redaction verified.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: engineer authors implementation; eng-sec reviews PII redaction.
