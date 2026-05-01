---
title: "Implement PDPL consent ledger and data-minimisation engine"
author: "@cyberskill-eng-sec"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: limited
target_release: "2026-07-03"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Implement the PDPL (Vietnam's Personal Data Protection Law, effective from 1 July 2023, with the Cybersecurity Law extension from 1 July 2026) consent ledger and data-minimisation engine: a per-data-subject consent record with purposes, lawful basis, retention period, and revocation events; a data-minimisation pipeline that ensures every query selects only the columns needed for the requested purpose (no over-fetching); a sensitivity-tier classifier that tags every column at registry time (Public / Internal / Restricted / Regulated); a right-to-erasure handler that purges identifiable data on request while preserving the audit log with redaction markers; and a data-handling audit trail that demonstrates conformance to PDPL and the upcoming Cybersecurity Law obligations. Without PDPL conformance, commercial deployment in Vietnam is impossible; with it, we have a credible compliance posture.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"PDPL audit passed with zero findings on the AI-touched workflow" — CyberSkill Engagement B reference (via SF9/SB5 form answers)
"PDPL-respecting consent" — CyberSkill AI Doctrine v1.0.0 excerpt (referenced in form answers)
"strengthened governance under PDPL and the new Cybersecurity Law (effective 1 July 2026)" — SB5 form answer
</untrusted_content>

## Problem

The Form Answers commit explicitly to PDPL conformance with concrete claims. The Innoboost Q&A flags that the new VN Cybersecurity Law (effective 1 July 2026) sits squarely in our PoC window — making PDPL + Cybersecurity Law conformance non-negotiable for both the demo and any commercialisation.

Specific gaps if we shortcut:

- **Without a consent ledger, lawful-basis evidence is missing.** PDPL Article 11 requires consent for processing personal data; without a ledger, we cannot prove consent was given for each purpose.
- **Without data minimisation, we collect more data than the purpose requires.** PDPL Article 8 (purpose limitation) and Article 9 (data minimisation) explicitly require this.
- **Without sensitivity classification, sensitive columns leak.** Engine queries must know which columns are PII or sensitive; the classifier provides this metadata.
- **Without a right-to-erasure handler, PDPL Article 14 is not satisfied.** Data subjects can request deletion; we must comply.
- **Without audit trail, PDPL audits cannot be demonstrated.** Engagement B claims "PDPL audit passed with zero findings" — we need the same evidence chain in the demo.
- **Without Cybersecurity Law mapping, we are unprepared for the 1 July 2026 effective date.** Banking-sector reviewers will be especially attentive to this.

The `shinhanos_ai_compliance` memory note's 7 primitives include "PDPL consent + minimisation" as a foundational technical primitive; this task is its implementation.

The `feedback_p1_scope_preference` memory note biases us richer. For PDPL, "richer" means: ledger + purpose-binding + retention-policy + erasure handler + sensitivity classifier + audit trail + Cybersecurity-Law mapping + nightly conformance check. Each layer is required by PDPL or its supporting regulation; together they form a comprehensive privacy posture.

## Proposed Solution

A PDPL conformance module in `engine/privacy/`:

1. **Consent ledger.** Per-data-subject record at `engine/privacy/consent-ledger.ts`. Each entry: `{ subject_id, purpose, lawful_basis, given_at, revoked_at, scope }`. Revocation events are timestamped; ledger is append-only.
2. **Sensitivity classifier.** Every column in the metric registry (P02-T01) is classified at registry-load time: Public (e.g., aggregate statistics) / Internal (operational metrics) / Restricted (personal but non-sensitive: name, branch) / Regulated (financial-sensitive: account balance, ID number). Classifier rules are versioned.
3. **Data-minimisation pipeline.** Engine queries (P02-T02) select only the columns needed for the question; the validator (P02-T02) rejects queries that select columns outside the metric's declared scope. PII columns are automatically masked unless the user has explicit elevation (P01-T07 sensitivity elevation).
4. **Right-to-erasure handler.** Data subject submits request via the admin UI (or API); handler identifies the data subject's records across all relevant tables; purges; preserves audit-log entry with redaction marker (the audit log says "data subject X erased on Y for reason Z" without containing X's PII).
5. **Audit trail.** Every consent event, every minimisation decision, every erasure event is logged to the audit log (P02-T09). Audit log is queryable by data-subject ID for "show me everything we know about subject X" requests.
6. **Cybersecurity-Law mapping.** A separate document (`docs/compliance/cybersecurity-law-mapping.md`) walks through each Cybersecurity Law obligation and maps it to a CyberSkill control.

Setup target: 21 days from task assignment.

### Subtasks

- [ ] **Author the consent-ledger schema.** Postgres table `consent_ledger`: `subject_id`, `purpose` (enum), `lawful_basis` (enum), `given_at`, `revoked_at` (nullable), `scope` (json), `version`. Indexed on `subject_id` and `purpose` for query performance. Schema documented at `engine/privacy/SCHEMA.md`.
- [ ] **Author the lawful-basis enum.** Per PDPL Article 11: `consent`, `contract_performance`, `legal_obligation`, `vital_interest`, `public_interest`, `legitimate_interest`. Most demo data uses `consent` (Shinhan-supplied masked data with assumed consent) or `contract_performance` (data needed to perform the demo's PoC contract).
- [ ] **Author the purpose enum.** Demo purposes: `chat_query` (answer a user's question); `audit_compliance` (regulatory audit); `service_operation` (system health, observability); `eval_quality` (Phase 4 eval). New purposes require an explicit ADR.
- [ ] **Implement the consent ledger API.** `engine/privacy/consent.ts`: `recordConsent(subject_id, purpose, lawful_basis, scope)`; `revokeConsent(subject_id, purpose)`; `checkConsent(subject_id, purpose) → boolean`; `listConsents(subject_id) → list`. Concurrent-safe; audit-logged.
- [ ] **Author the sensitivity-classifier ruleset.** YAML at `engine/privacy/sensitivity-rules.yaml`. Patterns by column-name regex + by metric-tag. Examples: column names matching `national_id|cccd|cmnd|passport` → Regulated; column names matching `phone|email|address` → Restricted; column names matching `name` → Restricted; columns tagged `aggregate` → Public; columns tagged `operational` → Internal.
- [ ] **Implement the sensitivity classifier.** `engine/privacy/sensitivity-classifier.ts`. At metric registry load (P02-T01), every column is classified. The classification feeds into the metric's `sensitivity` tier (already required by P02-T01 schema; this task automates the suggestion + provides the override mechanism).
- [ ] **Implement data-minimisation pipeline integration.** P02-T02 NL→SQL pipeline's validator rejects queries that select columns outside the metric's declared `source_columns`. The minimisation engine adds: any PII column referenced is automatically masked at query result; un-masking requires explicit elevation (P01-T07).
- [ ] **Implement PII masking.** `engine/privacy/masker.ts`. Per-column-type masking strategies: full-name → "P[****] N[****]"; phone → "+84 *** *** XXX"; email → "u***@d***.com"; ID → "***********{last4}"; balance → "***" (only the metric description, no value, unless elevated).
- [ ] **Implement right-to-erasure handler.** `engine/privacy/erasure.ts`. API: `POST /privacy/erasure-request` with subject identifier; handler identifies all records (tables joined on subject ID); purges (DELETE with audit-log entry); preserves audit-log entry with redaction marker. The redaction marker stores: original entry hash, erasure timestamp, reason, but no original PII.
- [ ] **Implement audit-trail integration.** Every consent event, minimisation decision, erasure event logged to P02-T09 audit log with structured fields.
- [ ] **Author the Cybersecurity-Law mapping document.** `docs/compliance/cybersecurity-law-mapping.md`. Each Cybersecurity Law obligation × the CyberSkill control: data localisation (P10-T04 residency); incident reporting (P08-T08 IR runbook); lawful interception interface (placeholder; clarify with legal); security audit cadence (P08 + P11-T04 dossier).
- [ ] **Author the PDPL conformance document.** `docs/compliance/pdpl-conformance.md`. PDPL Article × CyberSkill control mapping.
- [ ] **Implement nightly conformance check.** A CI job that nightly verifies: every metric has a sensitivity tier; every query through the day was within minimised scope; audit log has consent entries for every querying subject; erasure requests processed within 30 days. Alert on drift.
- [ ] **Implement admin UI surface.** In P05-T05 admin console: consent-ledger browser; sensitivity-tier audit; erasure-request queue; PDPL conformance dashboard.

### Acceptance criteria

- Consent ledger schema + API operational.
- Sensitivity classifier + ruleset operational; metric registry tags reflect classifications.
- Data-minimisation pipeline integration (validator reject + auto-mask) operational.
- Right-to-erasure handler operational; verified by a sample request.
- Audit trail flowing for all privacy events.
- Cybersecurity-Law and PDPL conformance documents published.
- Nightly conformance check operational.
- Admin UI surfaces (backend) operational.

## Alternatives Considered

- **Skip the consent ledger; assume consent for the demo.** Rejected: Form Answers commit to PDPL-respecting consent; banking-sector reviewers will demand the ledger.
- **Use a manual sensitivity tagging process (no classifier).** Rejected: scales poorly; classifier with override is more reliable.
- **Use full anonymisation instead of masking.** Rejected: masking preserves the ability to elevate (with audit) to see the underlying data; full anonymisation forecloses that path.
- **Skip right-to-erasure for the demo (Shinhan provides masked data anyway).** Rejected: PDPL Article 14 is non-negotiable for production; building the handler now costs little and unblocks production track.
- **Lump PDPL with the Cybersecurity Law into a single document.** Rejected: they're distinct regulations with different enforcement bodies; separate documents are clearer.
- **Skip the nightly conformance check.** Rejected: drift will happen; the check is the structural enforcement that drift is detected.
- **Use a third-party consent management platform.** Rejected: in-house implementation is straightforward; vendor lock-in not justified.

## Success Metrics

- **Primary**: All five components (ledger, classifier, minimisation, erasure, audit) operational and verified within 21 days of task assignment.
- **Guardrail**: Zero PDPL-conformance violations in nightly checks during the engagement. Measured by: nightly check results.

## Scope

### In scope
- Consent ledger schema + API.
- Sensitivity classifier + ruleset.
- Data-minimisation pipeline integration.
- PII masking strategies.
- Right-to-erasure handler.
- Audit trail integration.
- PDPL + Cybersecurity Law conformance documents.
- Nightly conformance check.
- Admin UI backend surfaces.

### Out of scope
- GDPR conformance (different jurisdiction; separate task if EU customers in scope).
- Korean PIPA conformance (deferred; relevant only if Shinhan HQ requires).
- Cookie-consent or web-tracking minimisation (no marketing site in this demo's scope).
- Data subject-rights management UI surface for end users (deferred; admin-mediated for v1).
- Encryption-of-PII-at-rest beyond what P01-T08 already provides.

## Dependencies

- **Upstream**: P01-T07 (RBAC), P02-T01 (metric layer), P02-T02 (NL→SQL pipeline integration), P02-T03 (policy layer triggers), P02-T09 (audit log).
- **Downstream**: P05-T05 (admin UI), P08-T01 (PDPL compliance dossier), P11-T04 (compliance dossier index).
- **People**: eng-sec authoring; legal lead reviewing consent + erasure language; engine tech lead reviewing pipeline integration; founder ratifying purposes and lawful bases.
- **Memory references**: `shinhanos_ai_compliance`, `shinhanos_data_residency`, `feedback_p1_scope_preference`, `feedback_enterprise_voice`.

## Open Questions

- Q1: For the demo phase, do we treat Shinhan-supplied masked data as "personal data" under PDPL (since it can theoretically be re-identified)? Recommendation: yes — treat masked data with the same controls as identifiable data. Conservative.
- Q2: For the right-to-erasure handler, can we erase data that is in the audit log? Recommendation: no — audit log is preserved (PDPL allows retention for legal/regulatory purposes); erasure marker replaces the original PII in the entry.
- Q3: For the lawful-basis enum, which basis applies to engine internal logs (e.g., observability metrics that include user IDs)? Recommendation: `legitimate_interest` for internal operational data; document.
- Q4: For the sensitivity classifier, who can override the auto-classification? Recommendation: metric owner + compliance lead must both approve.
- Q5: For the Cybersecurity Law mapping, which obligations are still uncertain (since the law's implementing decrees may evolve)? Recommendation: list known obligations; flag uncertain ones for legal review during the PoC kickoff.

## Implementation Notes

- The consent ledger is append-only; revocation is recorded as a new entry with `revoked_at`, not by deleting the original.
- For data-minimisation, the metric's `source_columns` declaration in P02-T01 YAML is the boundary. Adding a new column requires updating the metric definition (and re-classifying).
- For PII masking, the masker is pure: takes a value + column metadata + user role; returns the masked or unmasked value. No I/O.
- For right-to-erasure, identify-and-purge runs in a transaction; if any step fails, the whole operation rolls back; the user is notified.
- For audit-trail integration, consent events have a high-cardinality dimension (subject_id); index appropriately.
- For the nightly check, query Postgres for: any metric without a sensitivity tier (alert); any query in the last 24h that selected outside minimised scope (alert); any erasure request older than 30 days (alert).

## Test Plan

- Test 1: Consent record + revoke + check; verify the check returns false after revoke.
- Test 2: Sensitivity classifier correctly tags 100 sample column names.
- Test 3: Data-minimisation: query with extra column gets rejected by validator.
- Test 4: PII masking strategies for each type: name, phone, email, ID, balance.
- Test 5: Right-to-erasure: create test data, request erasure, verify purge + audit-log redaction marker.
- Test 6: Audit trail: verify every privacy event lands in the audit log.
- Test 7: Nightly check: verify it catches a deliberately introduced drift.

## Rollback Plan

- A bad classifier rule is rolled back via runtime config.
- A bad consent-ledger schema migration is rolled back via Postgres migration revert.
- A right-to-erasure operation that mistakenly purges live data: data is recovered from PITR (P01-T09); this is the worst-case scenario and we mitigate by 2-eye approval on every erasure.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Consent-ledger schema | `engine/privacy/SCHEMA.md` | Eng-sec | Continuous |
| Sensitivity rules | `engine/privacy/sensitivity-rules.yaml` | Eng-sec | Continuous |
| PDPL conformance doc | `docs/compliance/pdpl-conformance.md` | Compliance lead | Continuous |
| Cybersecurity Law mapping | `docs/compliance/cybersecurity-law-mapping.md` | Compliance lead | Continuous |
| Privacy audit log | P02-T09 audit log | Eng-sec | 7 years |
| Erasure-request records | Subset of audit log | Compliance lead | 7 years |
| Nightly conformance check | Central observability store | Compliance lead | Continuous |

## Operational Risks

- **PDPL-compliance gap discovered post-engagement.** Mitigation: nightly check + compliance review during PoC.
- **Erasure handler purges data that is the basis for an open ticket.** Mitigation: 2-eye approval on every erasure; ticket-system reference check before purge.
- **Sensitivity classifier mistags a column.** Mitigation: metric owner reviews and approves; manual override available with audit.
- **Cybersecurity Law's implementing decree changes during PoC.** Mitigation: legal review on a quarterly cadence; document updates accordingly.

## Definition of Done

- All five components in place.
- Audit trail flowing.
- Conformance documents published.
- Nightly check operational.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
The privacy module operates on customer data classifications and consent records, not on AI-trained models. No AI training is performed in this task; AI is used elsewhere (P02-T02 pipeline) but operates within the boundaries this task enforces.

### Human Oversight
Compliance lead authors and reviews all rules and documents. Erasure requests require 2-eye approval. Sensitivity classifications require metric-owner approval. Audit log is queryable by compliance lead.

### Failure Modes
- Classifier mistags: caught by metric owner review.
- Minimisation gap (a metric inadvertently exposes regulated data): policy layer catches at post-execution; HITL or refusal.
- Erasure failure: rollback via PITR.
- Audit-log write failure: alerts trigger; back-fill from application logs.

## Sales/CS Summary

CyberSkill's PDPL + Cybersecurity Law module is the privacy spine of the demo: every personal-data field is classified by sensitivity; every query is bounded to minimum-necessary data; every consent and revocation is logged; every right-to-erasure request is processed and audited. Banking-sector reviewers will look for evidence of PDPL conformance — we provide it as a structural property of the system, not as a checklist exercise. The new Cybersecurity Law (effective 1 July 2026) is mapped obligation-by-obligation to a CyberSkill control; we are ready when it takes effect.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: eng-sec authors implementation; legal lead reviews PDPL + Cybersecurity Law text; engine tech lead reviews pipeline integration; `@stephen-cheng` ratifies erasure-handler 2-eye approval policy.
