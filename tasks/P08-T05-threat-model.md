---
title: "Author threat model (STRIDE per service + LLM-specific threats)"
author: "@cyberskill-eng-sec"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: limited
target_release: "2026-09-04"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Author the comprehensive threat model: STRIDE (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege) per service in the architecture; plus LLM-specific threats (prompt injection, training-data extraction, model-output exfiltration, adversarial inputs, jailbreaks, RAG-poisoning); per-threat scoring (likelihood × impact); per-threat mitigation reference (CyberSkill task / runbook); residual-risk acceptance for unmitigatable threats. Reviewed quarterly. The threat model is the structural artefact that demonstrates "we know what could go wrong" — banking-sector reviewers expect it as table stakes.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"prompt-injection defence baked in by construction" — CyberSkill SF9 / SB5 form answers
</untrusted_content>

## Problem

A demo without a threat model is a demo without security thinking. Banking reviewers will ask "what's your threat model?" The answer must be a document, not a paragraph.

Specific gaps if we shortcut:

- **Without per-service STRIDE, application-level threats are unmapped.**
- **Without LLM-specific threats, the engine's unique risk surface is uncovered.**
- **Without scoring, all threats look equal.**
- **Without mitigation references, the model is a list, not a system.**
- **Without residual-risk acceptance, leftover risks are denied rather than acknowledged.**

The `shinhanos_ai_compliance` memory note's 7 primitives include "threat modelling" as a foundational practice.

The `feedback_p1_scope_preference` memory note biases us richer. For the threat model, "richer" means: STRIDE per service + LLM-specific surface + Shinhan-specific banking threats + scoring + mitigation references + residual-risk register + quarterly review.

## Proposed Solution

A threat-model document at `compliance/security/THREAT_MODEL.md`:

1. **Architecture diagram** showing every service + data flow.
2. **STRIDE per service** for each: chat surface, engine NL→SQL, HITL queue, admin console, auth, audit log, warehouse adapters, observability.
3. **LLM-specific threats**: prompt injection, training-data extraction, model-output exfiltration, adversarial inputs, jailbreaks, RAG-poisoning, model-vendor compromise.
4. **Shinhan-specific banking threats**: insider threat (privileged user); cross-tenant data leak; regulatory non-compliance.
5. **Per-threat scoring**: likelihood (low/med/high) × impact (low/med/high) → 5-tier risk grade.
6. **Per-threat mitigation**: cross-references CyberSkill tasks (P01-T05..T10, P02-T03..T09, P06, P08, P09).
7. **Residual-risk register** for unmitigatable threats: founder + compliance lead acceptance signature.
8. **Quarterly review.**

Setup target: 21 days from task assignment.

### Subtasks

- [ ] **Author architecture diagram.** All services + data flows + trust boundaries; rendered as Mermaid or SVG; embedded in the document.
- [ ] **Per-service STRIDE.** For each of the ~10 services: enumerate threats in each of 6 STRIDE categories.
- [ ] **LLM-specific threats** (per OWASP LLM Top 10): LLM01 prompt injection; LLM02 insecure output handling; LLM03 training data poisoning (less applicable as we don't train); LLM04 model DoS; LLM05 supply chain; LLM06 sensitive info disclosure; LLM07 insecure plugin design; LLM08 excessive agency; LLM09 overreliance; LLM10 model theft. Per-threat: applicability, severity, mitigation.
- [ ] **Banking-specific threats**: insider threat by privileged role (admin; reviewer; founder); cross-tenant data leak via misconfigured query; regulatory-non-compliance via missed obligation; reputational threat via public incident.
- [ ] **Per-threat scoring**: likelihood × impact; 5-tier (Critical / High / Medium / Low / Informational).
- [ ] **Per-threat mitigation**: each threat references one or more CyberSkill controls.
- [ ] **Residual-risk register**: threats not fully mitigatable; founder + compliance lead sign acceptance.
- [ ] **Schedule quarterly review**: aligned cadence with other compliance tasks.
- [ ] **Brief the squad**: 60-min threat-modelling primer; review the document.
- [ ] **Cross-reference with P11-T04 dossier.**
- [ ] **Re-review on architecture changes**: any new service or data flow triggers a delta review of the threat model.

### Acceptance criteria

- Architecture diagram + STRIDE per service + LLM threats + banking threats all in place.
- Scoring + mitigation references documented.
- Residual-risk register signed.
- Quarterly review scheduled.
- Squad briefed.
- Architecture-change review trigger documented.

## Alternatives Considered

- **Skip threat model; rely on individual security controls.** Rejected: integrated thinking matters; banking reviewers want the document.
- **Use a commercial threat-modelling tool (e.g., IriusRisk).** Rejected for v1: cost; markdown is sufficient. Reconsider for production track.
- **STRIDE only; skip LLM-specific threats.** Rejected: engine's primary risk surface is LLM; can't skip.
- **Skip residual-risk register.** Rejected: explicit acceptance of unmitigatable risks is more credible than pretending all risks are mitigated.

## Success Metrics

- **Primary**: Threat model published within 21 days with full STRIDE + LLM coverage.
- **Guardrail**: Quarterly review on schedule; new threats added as they emerge.

## Scope

### In scope
- Architecture diagram + STRIDE per service + LLM threats + banking threats + scoring + mitigation + residual-risk register + quarterly review.

### Out of scope
- Penetration testing (P08-T06).
- Incident response (P08-T08).
- Specific exploit research.

## Dependencies

- **Upstream**: P01-T04 (architecture); P02-T01..T09 (engine services); P02-T06 (prompt-injection defence — provides mitigation references); P05-T01..T05 (UI services); P06 (HITL services); P09 (observability).
- **Downstream**: P08-T06 (pen-test scope informed by threat model); P08-T07 (vendor questionnaires reference threats); P11-T04 (compliance dossier).
- **People**: eng-sec authoring; engine tech lead reviewing engine threats; design lead reviewing UI threats; compliance lead reviewing residual risks; founder ratifying acceptance.

## Open Questions

- Q1: For threat scoring, use CVSS or simple 5-tier? Recommendation: simple 5-tier for clarity; CVSS for individual CVEs as needed.
- Q2: For residual-risk acceptance, who signs? Recommendation: founder + compliance lead jointly.
- Q3: For LLM-specific threats, which OWASP version? Recommendation: latest OWASP LLM Top 10 (2025); reviewed quarterly as OWASP updates.

## Implementation Notes

- Architecture diagram rendered as Mermaid in the document (lives in source control; renders in any Markdown viewer).
- Per-service STRIDE in tabular form (Service | Spoofing | Tampering | Repudiation | Information Disclosure | DoS | Elevation).
- Threats numbered (T-001, T-002...) for cross-reference.
- Quarterly review aligned with PDPL/Cybersecurity/SBV/ISO reviews.

## Test Plan

- Test 1: Architecture diagram matches reality (every service + data flow shown).
- Test 2: Coverage check — each service has STRIDE entries.
- Test 3: LLM-specific threats: every OWASP LLM Top 10 item addressed.
- Test 4: Mitigation references resolve to real tasks.
- Test 5: Residual-risk register signed by both required parties.
- Test 6: Squad briefing comprehension.

## Rollback Plan

- Threat model is a living document; revert via PR.
- Residual-risk acceptance can be revoked by founder; affected operations paused pending mitigation.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Threat model document | `compliance/security/THREAT_MODEL.md` | Eng-sec + compliance lead | Continuous |
| Architecture diagram | Embedded in document | Eng-sec | Continuous |
| Residual-risk register | `compliance/security/RESIDUAL_RISK.md` | Founder + compliance lead | 7 years |
| Quarterly review records | `docs/audit/threat-model-reviews/{date}.md` | Eng-sec | 7 years |
| Squad briefing record | Project workspace | PM | Until program end |

## Operational Risks

- **New threat class emerges (e.g., novel LLM jailbreak technique).** Mitigation: quarterly review + ad-hoc updates; OWASP LLM Top 10 updates trigger re-review.
- **Architecture change without threat-model update.** Mitigation: PR template includes "threat-model impact" checkbox; CODEOWNERS routes architectural PRs to eng-sec.
- **Residual-risk acceptance becomes stale.** Mitigation: quarterly re-sign.
- **Threat model treated as one-shot document.** Mitigation: trigger discipline; quarterly rhythm.

## Definition of Done

- Document published; quarterly review scheduled; squad briefed; cross-references in place.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Threat model itself is human-authored; no AI training. Threats include AI-specific risks; mitigations reference AI-specific controls (P02-T06).

### Human Oversight
Eng-sec + compliance lead author; founder ratifies; quarterly review.

### Failure Modes
- Threat missed: caught by review or post-incident.
- Mitigation reference broken: PR fix.
- Residual risk realised: incident response per P08-T08.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR; assists threat enumeration).
- **Scope**: Claude drafted all sections of this FR.
- **Human review**: eng-sec authors threat model; engine tech lead + design lead review per-service threats; compliance lead reviews residual risk; founder ratifies acceptance.
