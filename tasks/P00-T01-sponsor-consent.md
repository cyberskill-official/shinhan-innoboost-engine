---
title: "Secure sponsor consent for Engagement A & B reference reuse"
author: "@stephen-cheng"
department: sales
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: co_authored
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-05-13"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Secure four artefacts of explicit, written, time-bounded sponsor consent — two from Engagement A's executive sponsor, two from Engagement B's executive sponsor — that authorise CyberSkill to (a) cite specific anonymised metrics from each engagement in Shinhan-facing materials, (b) accept Shinhan reference calls under mutual NDA during the Innoboost interview window and PoC kickoff window, (c) demonstrate sanitised flavours of each deployed system live to Shinhan reviewers, and (d) reuse architectural patterns and code primitives from each system inside the Innoboost demo build. Without these consents, three of our submitted-proposal claims (the 18-month and 12-month engagements with specific reduction percentages and the "PDPL audit passed with zero findings" claim) cannot be substantiated when Shinhan reviewers press, and the Phase 2 engine cannot reuse pattern-level intellectual property we already own. This task is a P0 leaf-level dependency that gates Phase 7 (Vibe-Coding Evidence Kit), Phase 11 (Reference One-Pagers), and any pattern-reuse work in Phase 2.

## Problem

All three submitted Shinhan proposals (SS1 Securities, SF9 SVFC, SB5 Bank) lean on the same two production reference engagements as evidence of Shinhan's third evaluation criterion — "Commercial readiness and market traction" — per the Innoboost Briefing Webinar Q&A doc, Section V.4. The Form Answers committed in writing to the following specifics that depend on sponsor consent to substantiate under reviewer pressure:

- Engagement A (enterprise software, Vietnam + ASEAN, 18 months ongoing): "Reporting cycle time reduced ~70% on metrics in scope; zero hallucinated KPI numbers since UAT."
- Engagement A: "management users active weekly across multiple departments."
- Engagement B (financial services / ops platform, Vietnam, 12+ months ongoing): "Manual document-handling effort reduced ~60%; PDPL audit passed with zero findings on the AI-touched workflow."
- Engagement B: "HITL reviewer queue with approval flow and per-decision audit log — exact pattern requested in the SB5 brief."
- Engagement B: "Audit log adopted by Risk team as primary review surface."

The Form Answers also explicitly committed: "reference calls available with sponsor consent post-shortlist." If we are shortlisted (Shinhan announces Top 30 around 21 May), reviewers will request reference calls within hours, not weeks. The Innoboost Q&A confirms reviewers prioritise commercialised solutions: "those at the commercialised stage will have advantages in the capabilities reviewing. Financial traction and deployment evidence are significant advantages." We cannot scramble for sponsor consent at that point — every day of delay reduces our credibility relative to startups whose references answer faster.

There is also a deeper, downstream-architectural reason for this task being P0: the Phase 2 engine work (P02-T01 metric layer, P02-T02 NL→SQL pipeline, P02-T05 confidence-tier scoring, P02-T06 prompt-injection defence) plans to *reuse sanitised patterns from Engagement A's chat-with-data implementation*. That reuse requires explicit pattern-reuse approval beyond the standard MSA. The MSA's typical work-product clause assigns specific deliverables to the customer; pattern-level re-use (the *shape* of a metric layer, not the customer's metrics) is normally retained by CyberSkill, but explicit confirmation removes the ambiguity that a financially-motivated customer counsel would otherwise exploit if relations sour. Locking this now, while the customer relationship is healthy, costs nothing; locking it after the relationship has friction is impossible.

The `feedback_enterprise_voice` memory note further constrains: external materials must use the enterprise voice with "no founder name, no headcount mentions, CyberSkill Engagement Team as signatory." Sponsor consent must be drafted *to* the CyberSkill Engagement Team (not to Stephen personally) for consistency with the external voice — this is a small but consequential framing point that affects how the rider reads.

The Innoboost Q&A also signals (Section V.3) that reviewer composition runs through three tiers: BU experts, BU Directors, then General Director / CEO. Reference calls likely happen at the BU Director tier, after BU experts have already scored proposals. We must be ready to provide credible references within 48 hours of any reviewer request to avoid being deprioritised.

There is also a Phase 8 compliance dependency: ISO 27001 control A.5.20 (relationships with suppliers) and SOC 2 CC9.2 (vendor and business-partner agreements) both require evidence of consent and confidentiality boundaries with reference customers. Pre-executing consent feeds the evidence chain that Phase 8's compliance dossier will reference.

## Proposed Solution

A signed consent rider, executed once per engagement (so two riders total), specifying four authorised reuse modes with explicit time windows and explicit redaction scopes. Each rider is a four-page-max document drafted from the CyberSkill standard "Reference & Marketing Reuse Rider" template (legal library version 2.3 or later — confirm not superseded), customised per engagement, and counter-signed by the executive sponsor (typically a CIO, COO, or Head of Operations at the customer side). Riders are stored in the legal vault under `legal/consents/shinhan-innoboost-2026/{engagement}-{sponsor}-{date}.pdf` with audit-log entries (who uploaded, hash, retention period). Sponsors are briefed on what to expect and reserve calendar slots in advance so reference calls can happen within 48 hours of any Shinhan request.

### Subtasks

- [ ] Identify the executive sponsor at Engagement A. Read the latest MSA renewal document to confirm the named exec; verify the named exec is still in role (LinkedIn check, customer email signature check, account-owner confirmation). Document who the sponsor is in the legal vault.
- [ ] Identify the executive sponsor at Engagement B by the same process.
- [ ] Confirm the canonical "Reference & Marketing Reuse Rider" template is still version 2.3+ and current. If a newer version exists, use it. If older, confirm with `@{{legal-vn}}` it has not been deprecated and is still aligned with VN Cybersecurity Law (1 Jul 2026).
- [ ] Customise the rider for Engagement A. Specifically:
  - List exact metrics authorised for citation: the ~70% reporting-cycle-time reduction, the "zero hallucinated KPI numbers since UAT" claim, the "management users active weekly across multiple departments" claim. Each metric has a permitted phrasing block; CyberSkill commits to using only those phrasings in Shinhan-facing materials.
  - Define redaction scope: customer name redacted to "a Vietnamese-headquartered enterprise software company operating across ASEAN"; no industry vertical specifics that would deanonymise; no metric values beyond what is explicitly listed; no system prompts that reveal internal IP.
  - Define pattern-reuse scope: the architectural shape of the chat-with-data system (semantic metric layer, NL→SQL, confidence tiers, citation engine) is acknowledged as CyberSkill IP and may be reused in the Innoboost demo; specific metric definitions, customer schemas, and customer-supplied prompts are not reused.
  - Define time window: from rider execution through 30 September 2027 (covers Demo Day September 2026 plus 12 months for any commercial-track Shinhan follow-on).
  - Define termination: 90-day written notice from sponsor; CyberSkill commits to remove citations from active materials within 90 days; published-prior materials (e.g., Demo Day deck slides) remain as historical record.
- [ ] Customise the rider for Engagement B by the same process. Engagement B specifics:
  - Citation metrics: ~60% manual document-handling reduction; "PDPL audit passed with zero findings on the AI-touched workflow"; "HITL reviewer queue with approval flow and per-decision audit log"; "Audit log adopted by Risk team as primary review surface."
  - Redaction: "a Vietnamese financial services / operations platform"; no entity name; no specific document types; no specific risk officer titles.
  - Pattern reuse: HITL reviewer-queue pattern (the SB5 wedge) is most strategic; explicitly listed.
- [ ] Schedule a 30-minute call with each sponsor to walk through the rider. Account owner attends; founder attends if sponsor is C-level. These are not email-and-sign moments — discuss the specific phrasings, capture sponsor concerns, iterate before signature.
- [ ] During the sponsor call, brief the sponsor on what may happen on a reference call: who the caller will be (likely SFL-V Innovation Program lead, possibly a Shinhan BU Director), what they will likely ask (does CyberSkill deliver what they promise; was the engagement smooth; would you re-hire; any red flags), how long the call will be (typically 30 min), and that the sponsor controls what they say beyond the authorised metrics.
- [ ] Provide the sponsor with a one-page reference-call talking-points document. Optional but offered; do not pressure use.
- [ ] Capture sponsor feedback, iterate the rider once if requested. Maximum two iterations before escalating to the founder.
- [ ] Counter-sign and store the executed riders in the legal vault. File naming: `legal/consents/shinhan-innoboost-2026/{engagement-letter}-{sponsor-lastname}-{YYYYMMDD}.pdf`. Hash the file (SHA-256) and log the hash, the upload time, and the uploader to `legal/consents/shinhan-innoboost-2026/audit.log`.
- [ ] Reserve at least two 30-min slots per sponsor in their calendars for reference-call windows. Recommended: 25–29 May (for shortlist phase if we are Top 30) and 1–9 June (for kickoff phase if we are Top 5–8). Use a hold-with-release pattern — calendar invites that the sponsor can decline without penalty if no Shinhan call materialises.
- [ ] Update the central reference-call schedule doc at `tasks/P11-T01-reference-onepagers.md` (once authored) with sponsor availability windows.
- [ ] If either sponsor declines: escalate to founder same day. Trigger fallback plan immediately:
  - Document the declined consent and the reason (if shared) in the audit log.
  - Convene a 30-minute working session: founder + sales lead + legal lead, decide whether to (1) substitute a different reference if one is available, (2) remove the specific claims that depended on the declined sponsor from upcoming Shinhan-facing materials, or (3) escalate at the relationship level (could the founder personally re-approach the sponsor with a softer scope).
  - If the decision is (2), produce a redline of the affected materials (Shinhan pitch deck, FAQ doc, P11 reference one-pagers) within 48 hours.
  - In all cases, do not bluff: never cite a sponsor without consent, even under pressure during the interview.
- [ ] Brief the squad on what is and is not authorised to say about each engagement. One-page internal doc at `tasks/_engagement-citation-rules.md`. Mandatory reading for anyone fielding Shinhan-side questions.
- [ ] Capture the rider executions and call schedules in the project tracker (Linear / ClickUp), linked from this FR's ticket.

### Acceptance criteria

- Two consent riders are signed, counter-signed, and stored in the legal vault with hash + audit-log entry.
- Each rider explicitly authorises citation, reference calls, sanitised demonstration, and pattern reuse, with phrasings, redaction scope, time window, and termination clauses.
- Each sponsor has reserved at least two 30-minute reference-call slots in the 25 May – 9 June window.
- Account owner has briefed each sponsor on what reviewers may ask and provided talking-points documents.
- Squad-facing one-page citation rules document is published and acknowledged by every squad member fielding Shinhan-side questions.
- Fallback plan is documented and the trigger conditions are explicit, even if not invoked.

## Alternatives Considered

- **Use only public statements about Engagement A & B.** Rejected because public statements are too thin to substantiate the specific percentages already committed in the Form Answers. Removing those specifics from the pitch reduces our score on Shinhan's "Commercial readiness" criterion (the third of three top criteria per the Innoboost Q&A). The pitch is already submitted; retreating from claims now also signals weakness.
- **Use a different reference customer.** Rejected because we have no other production engagement that matches the chat-with-data + HITL pattern Shinhan is buying. Inventing or stretching another reference would be misrepresentation. Engagements C, D, and E in the CyberSkill portfolio are either too early-stage or in adjacent verticals (logistics, hospitality) that don't translate credibly to a banking context.
- **Skip consent and rely on "anonymised" framing alone.** Rejected because anonymised reference talks still expose the sponsor to reputational risk; doing this without consent damages the commercial relationship and is probably a breach of the existing MSA's confidentiality clauses (CyberSkill standard MSA, clause 9.3 "Marketing References — opt-in").
- **Push consent only at the moment of shortlist confirmation.** Rejected because the gap between shortlist (around 21 May) and reference-call urgency (within 48 hours of reviewer request) is too narrow. Sponsors are busy executives; expecting to secure consent + brief + scheduled slot inside 48 hours is fragile.
- **Verbal consent over a call, captured by meeting note.** Rejected because financial-sector reviewers may demand evidence of consent. Verbal consent doesn't satisfy ISO 27001 A.5.20 evidentiary requirements. Written consent is the only artefact that survives counsel-level scrutiny.
- **Blanket consent for all future programs (rather than Innoboost-specific).** Rejected because sponsors will resist a broader scope; Innoboost-specific is psychologically easier to grant. We can pursue a broader rider in a separate, future, post-Innoboost task — possibly as part of marketing's case-study workstream.
- **Have the founder ask informally rather than route through the legal/sales pair.** Rejected because the rider must be a formal document, not a handshake. Informal asks can produce verbal consent; verbal consent is not auditable.

## Success Metrics

- **Primary**: Two executed consent riders, both signed and stored within 14 days of this task being assigned. Measured by: presence of two PDFs in the legal vault, both with audit-log entries showing counter-signature timestamps.
- **Guardrail**: Zero sponsor-side complaints, rider revocations, or relationship-friction events between rider signature and Demo Day in September 2026. Measured by: account-owner monthly check-in note in the project tracker; if any negative signal is logged, this task is reopened.

## Scope

### In scope
- Consent-rider drafting, customisation per sponsor, execution, and storage for Engagement A and Engagement B.
- Sponsor briefing call and reference-call slot reservation.
- One-page reference-call talking points (offered to sponsors, not mandated).
- One-page squad-facing citation rules document.
- Updates to legal vault, audit log, and tracker.
- Fallback plan trigger procedure if either sponsor declines.

### Out of scope
- New customer-reference acquisition (covered separately by a sales workstream if fallback triggers, not by this task).
- Public case-study production, blog posts, conference talks (covered by P11-T01 once consent is locked, and by a separate marketing workstream beyond Innoboost).
- Marketing-ops tracking of which Shinhan stakeholder requested which reference (covered by sales CRM workflow).
- Renegotiation of the underlying MSA with either customer (out of scope; rider is a non-binding addendum, not an MSA amendment).
- Engagement C, D, E reference work (deferred to a separate task in a future cycle).

## Dependencies

- **Legal**: access to the CyberSkill legal library; specifically the "Reference & Marketing Reuse Rider" template v2.3 or later. Confirm with `@{{legal-vn}}` it remains canonical and aligned with VN Cybersecurity Law (effective 1 July 2026).
- **Sales**: account-owner input on each sponsor's likely concerns, communication style, and current relationship temperature. Without this, the sponsor call will land badly.
- **Founder**: availability for the sponsor call if the sponsor is C-level (likely for Engagement B; possibly for Engagement A).
- **Memory**: `feedback_enterprise_voice` (rider must address CyberSkill Engagement Team, not founder personally); `cyberskill_company_facts` (legal entity name and signature block).
- **No upstream Task ID dependencies** — this is a true leaf task.
- **Downstream**: gates P02 pattern-reuse work, P07-T04 (vibe-coding evidence kit), P11-T01 (reference one-pagers), P11-T05 (past-incident transparency log).

## Open Questions

- Q1: Who at CyberSkill counter-signs on our side — founder, COO, legal lead? Default: legal lead countersigns, founder ratifies in audit log.
- Q2: Do either sponsor's organisations require the rider to be reviewed by their own counsel? If yes, expected turnaround time? Ask during the sponsor call; bake into the timeline.
- Q3: For pattern reuse, do we need to identify each pattern by name (semantic metric layer; NL→SQL pipeline; confidence-tier engine; citation engine; HITL queue) or generic phrasing? Recommend named — more defensible.
- Q4: For Vietnamese-language sponsors who prefer Vietnamese counterparts, do we need a parallel Vietnamese translation? Default: provide bilingual EN-VI rider with the English version controlling in case of conflict.
- Q5: If the sponsor is no longer at the customer (e.g., promoted out, departed), do we approach the new exec or escalate to the customer's COO? Default: approach the new exec; if they decline, escalate.
- Q6: What happens if Shinhan asks to speak to a customer that we did not include in our reference list (e.g., they Google our portfolio and find Engagement C)? Out of scope for this task, but worth flagging — handle in the FAQ doc (P12-T04).

## Implementation Notes

- The consent rider is an addendum, not an amendment, to the existing MSA. Keep it short (four pages max). Long riders signal we are over-reaching.
- The rider should be drafted *to* the customer's legal entity, signed by their authorised rep, and counter-signed by CyberSkill's legal entity. Use the legal entity name from `cyberskill_company_facts`: "CYBERSKILL SOFTWARE SOLUTIONS CONSULTANCY AND DEVELOPMENT JOINT STOCK COMPANY".
- Hash storage: SHA-256 of the executed PDF, logged in `legal/consents/shinhan-innoboost-2026/audit.log` in the format `{timestamp}\t{file}\t{sha256}\t{uploader}`. This is the audit-evidence pattern Phase 8 (compliance) will reference.
- For the talking-points document, do not script answers. The sponsor knows their own engagement better than we do; we provide context (who is calling, what their goals are, what we have already said publicly), not a script.
- For the squad-facing citation rules document, include verbatim "do not say" examples — the most common slip is naming the customer accidentally during a Shinhan call. Concrete don't-say examples are more effective than abstract rules.

## Test Plan

- Test 1: Read each executed rider and verify all required clauses are present (citation, reference call, sanitised demonstration, pattern reuse, time window, termination, signatures, dates). Reviewer: legal lead. Pass criterion: all clauses present and signatures dated.
- Test 2: Compute SHA-256 hash of each executed PDF and verify it matches the audit-log entry. Reviewer: any squad member with vault access. Pass criterion: hashes match.
- Test 3: Schedule a dry-run reference call with one sponsor (15 min, low-pressure) where the founder asks the sample questions a Shinhan reviewer might ask. Reviewer: account owner observes. Pass criterion: sponsor answers naturally; talking-points doc proved useful, not constraining.
- Test 4: Random spot-check on the squad. Ask three squad members "what specific metric can you cite from Engagement A in front of Shinhan?" and verify their answer matches the authorised phrasings exactly. Pass criterion: all three give matching, authorised answers.

## Rollback Plan

- If a rider is signed and later needs to be revoked (e.g., relationship sours, sponsor demands withdrawal, customer counsel raises objection), the rider's termination clause provides 90-day notice and CyberSkill removes citations from active materials within 90 days. Notify Shinhan in the same window if relevant.
- If pattern-reuse approval is revoked specifically (a narrower revocation), CyberSkill must audit the demo build for any code or design that traces back to the engagement and refactor or remove. Phase 2 work should be defensively documented so this audit is mechanical, not heroic.
- The fallback plan if either sponsor declines from the start is documented under Subtasks above.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Engagement A executed rider PDF | `legal/consents/shinhan-innoboost-2026/A-{sponsor}-{date}.pdf` | Legal lead | 7 years |
| Engagement B executed rider PDF | `legal/consents/shinhan-innoboost-2026/B-{sponsor}-{date}.pdf` | Legal lead | 7 years |
| Audit log | `legal/consents/shinhan-innoboost-2026/audit.log` | Legal lead | 7 years |
| Talking-points one-pager (per sponsor) | `legal/consents/shinhan-innoboost-2026/talking-points-{A,B}.pdf` | Account owner | Until rider end |
| Squad citation rules | `tasks/_engagement-citation-rules.md` | Founder | Until program end |
| Reference-call schedule | `tasks/_reference-call-schedule.md` | Account owner | Until program end |
| Rider review meeting minutes | `tasks/P00-T01-meeting-notes.md` | Legal lead | Until rider end |

## Operational Risks

- **Sponsor declines.** Mitigation: fallback plan above; pre-identify a backup approach.
- **Sponsor delays response.** Mitigation: rider drafting and slot reservation are the long poles; start within 48 hours of task assignment. Founder escalates if no response in 7 days.
- **Sponsor consents but with modifications that gut the value (e.g., refuses pattern-reuse).** Mitigation: prioritise citation + reference call over pattern reuse; pattern reuse can be substituted by clean-room rebuild in Phase 2 if necessary, at higher engineering cost.
- **Rider becomes public somehow (leaked, FOIA-style request).** Mitigation: redaction scope inside the rider itself protects the most sensitive details; vault-access controls limit who has the unredacted version.
- **Sponsor's company changes ownership / merges / dissolves during the rider window.** Mitigation: rider has a successor-in-interest clause; if the customer entity itself dissolves, the consent transfers to the legal successor; if no successor, consent terminates and we revert to public-statement-only mode.

## Definition of Done

- Both riders executed and stored.
- Audit log entries committed.
- Both sponsors have at least two reserved reference-call slots in the 25 May – 9 June window.
- Talking-points one-pagers delivered to both sponsors (offered, even if declined).
- Squad citation rules document published and acknowledged by all squad members.
- This FR's ticket marked Done in the project tracker with links to all artefacts above.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted Summary, Problem, Proposed Solution narrative, Subtasks, Alternatives Considered, Open Questions, Implementation Notes, Test Plan, Rollback Plan, Audit Trail, Operational Risks, and Definition of Done. The rider template itself is human-authored from the canonical legal library, not AI-drafted.
- **Human review**: `@{{legal-vn}}` to ratify rider language and confirm template version; `@stephen-cheng` to ratify sponsor outreach plan and approve any deviations from default phrasings; account owners to brief sponsors with no AI mediation in the actual sponsor conversation.
