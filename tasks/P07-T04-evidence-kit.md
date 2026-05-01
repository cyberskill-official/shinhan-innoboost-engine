---
title: "Compile evidence kit (past cycle artefacts + decision log)"
author: "@cyberskill-pm"
department: product
status: draft
priority: p1
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-08-21"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Compile the SS1 evidence kit — anonymised artefacts from past CyberSkill vibe-coding cycles (subject to P00-T01 sponsor consent) plus a "what we built and what we killed" decision log demonstrating that the vibe-coding workflow is a real system, not a stunt. The kit includes: anonymised one-page spec → demo → decision-gate trails for 6+ past PoCs (3 graduated, 2 killed, 1 pivoted); aggregated cycle-time stats; lessons-learned summary; quotes from past customers (with consent). The kit is the evidence that the SS1 form answer's "5× cadence" claim is grounded in track record, not aspiration.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"two production engagements today (anonymised under NDA; reference calls available with sponsor consent post-shortlist)" — CyberSkill SS1 form answer
"Engagement A: AI-native build with LLM agent layer ... Reporting cycle time reduced ~70%" — CyberSkill SS1 form answer
</untrusted_content>

## Problem

The SS1 form answer commits to track record. Without an evidence kit, "we have done this before" is a claim. With it, the claim is structural — reviewers can see specific past cycles, specific decisions, specific outcomes.

Specific gaps if we shortcut:

- **Without past-cycle artefacts, "we've done this before" is unsubstantiated.**
- **Without a decision log, the discipline (graduated / killed / pivoted) is invisible.**
- **Without aggregated cycle-time stats, the "5× cadence" claim is unbacked.**
- **Without lessons-learned, the system appears static.**
- **Without customer quotes (sponsor-consented), trust signals are absent.**

## Proposed Solution

A kit at `vibe-coding-starter-kit/evidence/` containing:

1. **6+ anonymised PoC trails.** Each is a one-page summary: problem, spec, demo outcome, decision-gate result, outcome 6 months later. Subject to P00-T01 sponsor consent for the engagement they came from.
2. **Decision log.** "Built and graduated"; "Built and killed"; "Pivoted". With dates, brief reasons.
3. **Aggregated cycle-time stats.** Average time from spec to demo; average time from spec to decision; distribution of decisions (graduated / killed / pivoted).
4. **Lessons-learned summary.** Patterns observed across cycles: what triggers a graduate vs. a kill; common pivot reasons.
5. **Customer quotes** (with explicit consent per P00-T01).

Setup target: 14 days from task assignment (gated on P00-T01 sponsor consent).

### Subtasks

- [ ] **Confirm P00-T01 sponsor consent covers evidence-kit usage.** Read each rider's "citation" clause; verify the engagements' patterns and outcomes are within scope.
- [ ] **Anonymise 6+ past cycles.** Pull from Engagement A (4 cycles) and Engagement B (4 cycles); anonymise per the consent's redaction rules.
- [ ] **Author the per-cycle one-pagers.** Each: problem (anonymised); spec excerpt; demo outcome; decision-gate result; 6-month-later outcome; lesson learned.
- [ ] **Compile decision log.** All 6+ cycles in a single table: outcome, date, time-to-decision, lesson.
- [ ] **Compute aggregated cycle-time stats.** Mean / median / p95 of time-to-spec, time-to-demo, time-to-decision. Distribution of outcomes.
- [ ] **Author lessons-learned summary.** 1–2 pages: patterns; what works; what doesn't; how the workflow has evolved.
- [ ] **Compile customer quotes.** From P00-T01 sponsor consent: 2–3 verbatim quotes per engagement with attribution permitted ("a Vietnamese-headquartered enterprise software company"); fall back to no-attribution quotes if consent narrower.
- [ ] **Cross-link from starter kit.** `WORKFLOW.md` references the evidence kit.
- [ ] **Cross-link from pitch deck.** P12-T01 SS1 pitch deck shows aggregated cycle-time stats + 1–2 sample one-pagers.

### Acceptance criteria

- 6+ anonymised one-pagers in place.
- Decision log compiled.
- Aggregated stats computed.
- Lessons-learned summary published.
- Customer quotes (with attribution permission scope) compiled.
- Cross-linked from starter kit + pitch deck.
- Sponsor consent verified for every artefact.

## Alternatives Considered

- **Skip the evidence kit; rely on Form Answer claims.** Rejected: claims without evidence are weak.
- **Use real engagement data without anonymisation.** Rejected: violates consent and confidentiality.
- **Generate synthetic evidence (fake PoC trails).** Rejected: misrepresentation; if discovered, catastrophic.
- **Skip aggregated stats.** Rejected: stats are the most-quotable evidence.

## Success Metrics

- **Primary**: 6+ one-pagers + decision log + stats + lessons + quotes within 14 days (after P00-T01 consent).
- **Guardrail**: Zero consent violations (every artefact stays within sponsor-authorised scope).

## Scope

### In scope
- 6+ anonymised PoC one-pagers.
- Decision log + aggregated stats + lessons summary + customer quotes.
- Cross-linking.

### Out of scope
- Customer-reference call infrastructure (P11-T01).
- New PoC cycles (this task is retrospective).
- Public marketing material (separate workstream).

## Dependencies

- **Upstream**: P00-T01 (sponsor consent); past Engagement A + B project history.
- **Downstream**: P07-T01 (starter kit cross-links), P12-T01 (pitch deck uses), P11-T01 (reference materials).
- **People**: PM authoring; sales lead reviewing customer-quote attribution; founder ratifying.

## Open Questions

- Q1: For "what we killed" cycles, do we name the customer they came from? Recommendation: no — kill-cycles are sensitive; anonymise even within the consent.
- Q2: For aggregated stats, do we include data from CyberSkill internal projects (not customer-facing)? Recommendation: no — keep evidence customer-grounded.
- Q3: Customer quotes — short (1 sentence) or longer (1 paragraph)? Recommendation: 1–2 sentences each; multiple per engagement.

## Implementation Notes

- Anonymisation: strip customer names, specific metric values, system-prompt text; replace with generic placeholders matching consent rider wording.
- Decision log: tabular; each row is one cycle; sortable.
- Aggregated stats: derived from project tracker history (Linear / ClickUp); computed once at kit assembly time.
- Customer quotes: stored with the consent rider that authorised them; cross-referenced.

## Test Plan

- Test 1: Each one-pager passes anonymisation review (no specific entity references).
- Test 2: Aggregated stats match underlying project tracker data within tolerance.
- Test 3: Customer quotes match consent rider's authorised list.
- Test 4: Cross-links work in starter kit and pitch deck.

## Rollback Plan

- A consent revocation triggers immediate removal of affected artefacts.
- A bad anonymisation (consent violation discovered) triggers immediate redaction + sponsor notification.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Per-cycle one-pagers | `vibe-coding-starter-kit/evidence/cycles/` | PM | Until consent end |
| Decision log | `evidence/DECISION_LOG.md` | PM | Until consent end |
| Aggregated stats | `evidence/STATS.md` | PM | Until consent end |
| Lessons-learned | `evidence/LESSONS.md` | PM | Until consent end |
| Customer quotes | `evidence/QUOTES.md` | Sales lead | Until consent end |
| Consent cross-reference log | `evidence/CONSENT_REFS.md` | Legal lead | 7 years |

## Operational Risks

- **Consent revoked mid-engagement.** Mitigation: artefacts versioned; revoked artefacts removed from active kit; historical retention per consent rider.
- **Anonymisation insufficient (entity inferable).** Mitigation: legal lead spot-check; sponsor pre-review optional.
- **Stats misinterpreted (e.g., readers expect commercial-track timing not PoC timing).** Mitigation: clear context labelling.

## Definition of Done

- All artefacts in place.
- Cross-links live.
- Sponsor consent verified.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Past customer engagements (subject to P00-T01 consent). All data anonymised. No real customer data leaves the consent boundary.

### Human Oversight
Sales lead reviews customer-quote scope; legal lead reviews anonymisation; founder ratifies.

### Failure Modes
- Consent breach: immediate removal + sponsor notification.
- Stat error: corrected; decision log retains correct version.

## Sales/CS Summary

CyberSkill's vibe-coding evidence kit shows that the SS1 partnership's "5× cadence" claim is grounded in track record. Six+ anonymised PoC cycles from past engagements — three graduated to production, two killed with structured rationale, one pivoted — plus aggregated cycle-time stats, lessons learned, and quotes from past customers (with their consent). When a Shinhan Securities reviewer asks "have you actually done this?" we don't say "yes"; we hand them the kit.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR; assists summary writing).
- **Scope**: Claude drafted all sections of this FR.
- **Human review**: PM authors anonymised content; sales lead reviews quote scope; legal lead reviews anonymisation; founder ratifies.
