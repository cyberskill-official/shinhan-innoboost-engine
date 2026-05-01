---
title: "Assemble NDA pack and legal scaffolding"
author: "@cyberskill-legal"
department: operations
status: in_progress
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-05-08"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Pre-execute and pre-stage a complete NDA pack covering every counterparty CyberSkill is likely to transact with during the Shinhan Innoboost lifecycle, plus an internal-team NDA addendum for any squad member joining the project under elevated confidentiality. "Pre-stage" means: drafted, legally reviewed, signature-block-ready, and queued for one-click sending the moment a counterparty confirms an engagement slot. The objective is zero counterparty-side waiting on us for paperwork during the 21–29 May interview window or the 9 June kickoff (if shortlisted). The pack covers six external counterparties — Shinhan Future's Lab Vietnam, GenAI Fund, Shinhan Bank Vietnam, Shinhan Vietnam Finance Company, Shinhan Securities Vietnam, Shinhan Life Vietnam — plus an internal-NDA addendum for the squad. Each rider is bilingual (English controlling, Vietnamese parallel). All artefacts are stored in the legal vault with versioning, hashing, and audit-log discipline.

## Problem

The Innoboost Q&A doc confirms that "IP definitions are clearly spelled out in the contract" — meaning we will receive Shinhan's contract for the PoC, but on our side we need our own NDA on file *before* any unstructured conversation begins. Unstructured conversations during the Innoboost lifecycle include sponsor reference calls, Shinhan-side pre-interview informal chats, deep technical architecture conversations during the interview, and the dozens of Slack/email threads that will spin up during the PoC.

The Q&A also reveals an entity-structure complication: SFL-V operates in physical proximity to multiple Shinhan-VN entities, all under one roof. A single NDA might or might not cover all four entities depending on the precise legal-entity language. We need legal clarity *now*, not in the heat of the interview week. The right approach is one master NDA with SFL-V (the program operator) and separate NDAs with each Shinhan business entity, so that scope is unambiguous regardless of which entity ultimately signs the PoC.

Internal NDAs are a separate, often-neglected dimension. Of CyberSkill's 10-person team (per `cyberskill_company_facts`), not every member will be cleared into the Shinhan project — some continue working on existing engagements (Engagement A, Engagement B, and other clients). For squad members joining the Shinhan project — particularly anyone handling Engagement A's chat-with-data code patterns we plan to reuse (gated by P00-T01 sponsor consent) — we need an internal-NDA addendum that defines the Shinhan-specific confidentiality boundary. The standard employment NDA does not cover the project-specific reciprocal obligations: that the squad member will not disclose Shinhan-supplied data to non-squad CyberSkill members, that Engagement A patterns reused in Shinhan work remain confidential to both customers, and that any code committed to the Shinhan demo monorepo is treated as Shinhan-track IP for the duration.

The Innoboost Q&A also confirms a specific risk pattern: "real customer data cannot be provided" but "Shinhan will provide simulated or masked data." Even masked data carries confidentiality obligations under PDPL because the masking can sometimes be reversed by motivated re-identification (the "Netflix Prize" attack class). The NDA must address masked-data handling explicitly.

ISO 27001 control A.5.20 (relationships with suppliers) and SOC 2 CC9.2 (vendor and business-partner agreements) require evidence of supplier and counterparty agreements. Pre-executing NDAs feeds this evidence chain — Phase 8's compliance dossier (P08-T07) will reference these NDAs as existence-proof of confidentiality controls. Doing this early is cheaper than doing it under audit pressure.

There is also a downstream-trust dimension: at reference calls (per P00-T01), the sponsor's company expects the call to be NDA-protected on both sides. If we have not pre-staged an NDA with the Shinhan reviewer who initiates the call, the call cannot happen — and in the timeline pressure of the interview window, that is a deal-killer.

Finally, a procedural point: the NDAs we send should be readable by a Vietnamese-speaking counsel. Bilingual NDAs (English controlling, Vietnamese parallel) reduce friction. A Korean parallel is also worth considering for Shinhan-HQ-touching documents, but is not mandatory at v1.

## Proposed Solution

A staged NDA pack consisting of: (1) a CyberSkill-side mutual NDA template adapted from our standard library and customised for the Innoboost engagement; (2) six pre-filled counterparty drafts (SFL-V, GenAI Fund, Shinhan Bank, Shinhan Finance, Shinhan Securities, Shinhan Life); (3) an internal-team NDA addendum for squad members joining the project; (4) a tracking sheet with status (drafted / sent / counter-signed) and audit log entries. All artefacts stored in the legal vault under `legal/ndas/shinhan-innoboost-2026/`, with hash + audit log entries. A weekly review cadence runs from now through PoC end (if selected) or interview week end (if not).

### Subtasks

- [ ] **Pull the canonical CyberSkill mutual NDA template from the legal library.** Confirm with `@{{legal-vn}}` that the template is current, has not been revoked or superseded, and reflects the new VN Cybersecurity Law (1 July 2026) clauses where applicable. If the current template predates the Cybersecurity Law, escalate to legal lead for an updated template before proceeding.
- [ ] **Customise the master template for the Innoboost engagement.** Specifically:
  - Define "Confidential Information" scope to cover: Shinhan-supplied datasets (synthetic and masked); Shinhan-supplied pilot-environment access credentials and SDK keys; technical architecture details disclosed during interviews; Shinhan-side internal roadmap and prioritisation; Shinhan-side organisational structure and reporting relationships disclosed during the engagement; reciprocally, CyberSkill's AI Doctrine; CyberSkill's code-pattern reuse from Engagement A and B (subject to those engagements' own consents per P00-T01); CyberSkill's pricing strategy and commercial-track plans.
  - Define exclusions: information that is publicly available; information independently developed without reference to disclosed Confidential Information; information lawfully received from a third party without breach.
  - Define term: 5 years from the date of disclosure for technical confidentiality, indefinite for trade secrets, with the carve-outs above.
  - Define jurisdiction: Vietnamese law, courts of Ho Chi Minh City. Bilingual document with English controlling.
  - Define remedies: injunctive relief available in addition to damages; specific-performance available for trade-secret breaches.
  - Define data-handling for masked data: even masked data is treated as Confidential Information; squad members do not attempt re-identification; squad members do not export masked data outside the demo perimeter; deletion at end of engagement is mandatory.
  - Define survivability: confidentiality clauses survive termination by either party; return-or-destroy obligations are mutual.
- [ ] **Pre-fill drafts for the six likely counterparties.** Each draft has the entity-specific name, address, registered number, and authorised signatory placeholder. Drafts are saved under `legal/ndas/shinhan-innoboost-2026/draft-{counterparty}.docx`:
  - Shinhan Future's Lab Vietnam (program operator).
  - GenAI Fund (program co-host).
  - Shinhan Bank Vietnam.
  - Shinhan Vietnam Finance Company (SVFC).
  - Shinhan Securities Vietnam.
  - Shinhan Life Vietnam (precautionary, in case scope expands).
- [ ] **Verify the legal-entity name and signature-block pattern for each counterparty.** Pull from public sources (Vietnam business registry, Shinhan public corporate disclosures); confirm via SFL-V relationship if uncertain.
- [ ] **Author the internal-team NDA addendum.** This is a one-page rider on top of the standard CyberSkill employment NDA, with a focused list:
  - Squad member shall not disclose Shinhan-supplied data, credentials, or roadmap fragments to CyberSkill personnel outside the squad.
  - Squad member shall not attempt re-identification of any masked data received from Shinhan.
  - Squad member acknowledges that Engagement A and Engagement B pattern-reuse, where authorised by the corresponding sponsor consent (P00-T01), remains confidential to both engagements.
  - Squad member shall not commit Shinhan-supplied data, credentials, or system prompts to source control, even in private repositories, except in expressly-designated encrypted secrets.
  - Squad member shall not discuss Shinhan engagement specifics on public forums (Twitter, LinkedIn, conferences) without prior founder approval.
  - Confidentiality term: continues for 5 years post-employment or 5 years post-engagement-end, whichever is later.
- [ ] **Identify squad members.** Working from the Phase 0 Project Workspace setup (P00-T06), produce the canonical squad roster. Each member signs the internal addendum *before* they touch any Shinhan-related work — even reading a Shinhan-source document.
- [ ] **Create the tracking sheet** at `legal/ndas/shinhan-innoboost-2026/tracker.md`. Columns: Counterparty, Draft sent (date), Counter-signed (date), Term-end (date), Scope notes, Document hash (SHA-256), Storage path. Auto-generate a Markdown table; review weekly during the engagement window.
- [ ] **Stage the six pre-filled drafts** in the vault with one-click-send readiness. The "send" step is: legal lead emails the counterparty a redline-tracked version of the customised draft with our signature already applied; counterparty reviews, possibly redlines, returns; legal lead reconciles redlines; final version is counter-signed.
- [ ] **Author a 1-page "NDA quick-reference" for the squad.** Audience: every squad member. Content: when to ask legal first; what's covered; what's not; what to do if a counterparty asks for a different NDA template; what to do if a casual conversation drifts into Confidential Information (the answer is: "I'd love to discuss that under our NDA — let me get that in front of you").
- [ ] **Brief the squad on NDA hygiene.** 30-min squad call with the legal lead, walking through the NDA pack, the addendum, and the quick-reference. Mandatory; squad members who do not attend the live session must complete a recorded version + a confirmation acknowledgment.
- [ ] **Set up a weekly review cadence.** Every Friday during the engagement window (now through Demo Day September if selected; otherwise now through end of interview week), legal lead reviews the tracker for: counter-parties waiting for counter-signature, drafts pending response, term-end alarms (none expected during this window).
- [ ] **Audit log discipline.** Every NDA file uploaded to the vault gets an entry in `legal/ndas/shinhan-innoboost-2026/audit.log`: timestamp, file path, SHA-256 hash, uploader handle, reason ("draft sent", "counter-signed received", "version superseded"). Append-only file; never edited.

### Acceptance criteria

- CyberSkill-side mutual NDA template customised for Innoboost is committed to the legal vault.
- Six pre-filled counterparty drafts are staged and ready to send.
- Internal-team NDA addendum is signed by every squad member *before* they touch Shinhan-related materials.
- Tracker sheet exists, is current, and has at least one weekly review entry recorded.
- One-page quick-reference is shared in the project workspace and acknowledged by every squad member.
- Audit log file is being maintained.
- Bilingual EN-VI versions are in place for at least the SFL-V and Shinhan-entity drafts.

## Alternatives Considered

- **Wait for Shinhan/SFL-V to send their NDA and just sign whatever they send.** Rejected because we lose negotiating leverage on reciprocity, and their term may not cover our reference engagements adequately. Mutual NDAs that we draft tend to bake in protections (mutual injunctive relief, mutual return-or-destroy) that vendor-asymmetric NDAs often skip.
- **Use a generic short-form NDA.** Rejected because financial-sector counterparties expect a long-form mutual NDA with explicit categories and term language. Short-form signals we don't take confidentiality seriously and may invite a counterparty-side rewrite.
- **Skip the internal addendum and rely on the standard employment NDA.** Rejected because the standard employment NDA does not specifically bind Engagement-A pattern-reuse boundaries or Shinhan-specific data-handling rules; we need explicit Shinhan-scope language.
- **Single mutual NDA with SFL-V covering the whole engagement (avoid per-entity NDAs).** Rejected because Shinhan's entities are legally separate and their counsel may insist on entity-specific NDAs; pre-staging per-entity drafts means we can satisfy whichever pattern the counterparty's counsel demands without scrambling.
- **English-only NDAs.** Rejected because Vietnamese counterparties' counsel often re-translate, introducing inconsistencies that take days to reconcile. Bilingual EN-VI from inception saves that cycle.
- **Defer the Shinhan Life draft (out of program scope at present).** Rejected because the Innoboost Q&A explicitly leaves room for additional BU involvement; staging the draft now costs 30 minutes and removes a potential bottleneck later.
- **Use a US-jurisdiction NDA (Delaware governing law).** Rejected because the engagement is Vietnam-resident on both sides; Vietnamese law and HCMC courts are the natural choice and reduce conflict-of-laws risk.

## Success Metrics

- **Primary**: All six counterparty NDAs counter-signed within 7 days of each counterparty confirming engagement (target: at least 4 of 6 by 1 June 2026, depending on shortlist outcome).
- **Guardrail**: Zero squad members touching Shinhan-related materials without a signed internal addendum. Measured by: monthly audit of the squad-handle list against the addendum-signature list; any mismatch is a P0 incident.

## Scope

### In scope
- CyberSkill-side mutual NDA template customised for Innoboost (bilingual EN-VI).
- Six pre-filled counterparty drafts.
- Internal-team NDA addendum.
- Tracker sheet, vault structure, weekly review cadence.
- One-page quick-reference for the squad.
- Squad onboarding briefing (live + recorded).
- Audit-log discipline.

### Out of scope
- The PoC SOW (handled in P13-T01).
- A separate Data Processing Agreement, if Shinhan provides masked-but-PDPL-relevant data (handled separately under P08-T01 PDPL workstream).
- Changes to the canonical employment NDA template (out of scope; the addendum sits on top).
- Korean-language parallels (deferred unless a Shinhan HQ counterparty requests).
- Software-vendor NDAs for our own subcontractors (Lambda Labs, Runpod, etc. — handled by ops with their standard click-through agreements).

## Dependencies

- **Templates**: canonical CyberSkill mutual NDA, employment NDA — both from legal library; confirm versions are current.
- **People**: legal lead authors and reviews; founder ratifies template; ops/COO maintains tracker.
- **Memory references**: `cyberskill_company_facts` (legal entity name and address); `feedback_enterprise_voice` (signature framing).
- **Downstream**: gates P00-T01 (sponsor consent benefits from NDA pack ready); P00-T05 (GPU procurement is unaffected); P12 (rehearsal involves real Shinhan contact, requires NDA in place); P13 (kickoff requires PoC SOW which sits on top of the master NDA).
- **No upstream Task ID dependencies.** Leaf task.

## Open Questions

- Q1: Does our current employment NDA include reasonable Shinhan-relevant language already? If yes, the addendum is shorter; if no, escalate to a base-NDA refresh as a separate task.
- Q2: Do any of the six counterparties have a "we only sign our NDA, not yours" policy? Likely yes for at least Shinhan Bank; in that case, we counter-NDA review their template and add must-have clauses (mutual injunctive relief, mutual data-handling) as redlines.
- Q3: Does the legal vault have access controls compatible with the audit-log discipline? Verify with ops that uploads are logged automatically; if not, manual logging is mandatory.
- Q4: For the bilingual EN-VI version, who provides the Vietnamese translation? In-house if a fluent legal-trained translator exists; otherwise vetted external translator with their own NDA.
- Q5: For the squad addendum, does the term continue past employment? Recommendation: yes — confidentiality survives employment; the addendum's 5-year-post-engagement clause is the floor.

## Implementation Notes

- The master template should be one document (bilingual columns or sequential pages, English first). Each per-counterparty draft is a copy with entity placeholders filled. Avoid a "frankenstein" approach where each counterparty gets a different template — keeps redlines easier to reconcile.
- The audit log file (`audit.log`) is plain-text, append-only, line-oriented. Format: `2026-04-29T14:32:00+07:00\tlegal/ndas/.../draft-shinhan-bank.docx\t{sha256}\t@legal-vn\tdraft-sent`. Tab-separated; trivially parseable. This is the same pattern used in P00-T01 for sponsor consent and will be reused for Phase 8 compliance evidence.
- The tracker should be auto-rendered from the audit log if possible (small script, e.g., `legal/ndas/shinhan-innoboost-2026/render-tracker.py`). Reduces drift between the log and the human-readable view.
- For the squad onboarding briefing, record the session and pin the recording in the project workspace. New squad members joining mid-cycle watch the recording before the legal lead grants access to the project repos.
- For NDA review, time-box: legal lead has 24 hours to review a counterparty's redlines; founder has 24 hours to ratify changes that move materially from our master. If either step takes longer, escalate.

## Test Plan

- Test 1: Mock-send a draft to an internal alias (e.g., `legal-test@cyberskill.world`). Verify the document opens correctly in Microsoft Word, Google Docs, and Adobe Acrobat (the three common counterparty tools). Pass criterion: no formatting issues, signature blocks render correctly, bilingual layout intact.
- Test 2: Squad-onboarding dry run. Walk a squad member through the addendum and the quick-reference; ask them three sample questions ("can I tell my friend at another company that we are doing a Shinhan project?", "can I commit a snippet of masked data to a private gist?", "I see a Slack message that mentions the Shinhan-Bank-internal Power BI usage; should I screenshot for our records?"). Pass criterion: the squad member answers each correctly without hesitation.
- Test 3: Audit-log integrity check. Compute SHA-256 of every file in the vault; compare to the log. Pass criterion: every file has a log entry with matching hash.
- Test 4: Bilingual consistency check. Have a Vietnamese-fluent reviewer compare the EN and VI versions of one draft side-by-side; verify no clause appears in one and not the other. Pass criterion: clauses are 1:1.

## Rollback Plan

- An NDA, once signed, is binding for its term. Rollback equals supersession: a new NDA superseding the old, signed by both parties, with explicit termination of the prior. This is rare but documented in the master template.
- If a counterparty's counter-signature reveals an unacceptable redline (e.g., they strike our injunctive-relief clause), founder + legal decide: accept and proceed (if the redline is acceptable in context) or refuse and renegotiate (which may delay the engagement).
- An incorrectly-uploaded NDA file (e.g., wrong version posted to the vault) is corrected by uploading the right version and adding an audit-log entry noting the supersession. The old file is not deleted; vault is append-only for evidentiary integrity.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Master mutual-NDA template (customised) | `legal/ndas/shinhan-innoboost-2026/master-template.docx` | Legal lead | Indefinite |
| Six pre-filled counterparty drafts | `legal/ndas/shinhan-innoboost-2026/draft-{counterparty}.docx` | Legal lead | Indefinite |
| Internal-team NDA addendum | `legal/ndas/shinhan-innoboost-2026/internal-addendum.docx` | Legal lead | Indefinite |
| Counter-signed NDAs (post-execution) | `legal/ndas/shinhan-innoboost-2026/executed/{counterparty}-{date}.pdf` | Legal lead | 7 years |
| Tracker | `legal/ndas/shinhan-innoboost-2026/tracker.md` | Ops | Until program end |
| Audit log | `legal/ndas/shinhan-innoboost-2026/audit.log` | Legal lead | 7 years |
| Squad acknowledgment list | `legal/ndas/shinhan-innoboost-2026/squad-acknowledged.md` | Legal lead | Until program end |
| One-page quick reference | `legal/ndas/shinhan-innoboost-2026/quick-reference.md` | Legal lead | Until program end |
| Squad-onboarding briefing recording | Project workspace | PM | Until program end |

## Operational Risks

- **Counterparty refuses our template, insists on their own.** Mitigation: legal lead reviews counterparty template; the master we drafted gives us a clear must-have list (mutual injunctive relief, mutual return-or-destroy, masked-data handling); we negotiate as redlines.
- **Squad member starts work before signing the addendum.** Mitigation: tooling-level guard — repository-access provisioning is gated on addendum-signed status; legal lead grants access only after addendum signature is logged.
- **A counterparty's name or address changes mid-engagement.** Mitigation: tracker captures the entity at draft-sent date; if it changes, supersede the draft.
- **Vault breach.** Mitigation: vault has access controls; encryption at rest; access audited; physical security of the laptop running this work follows the standard CyberSkill engineering laptop policy.
- **Term-end alarm fires unexpectedly during a live engagement.** Mitigation: the 5-year term plus survival clauses make this a non-issue for the immediate Innoboost engagement, but the tracker has term-end alarm columns to flag well in advance.

## Definition of Done

- Master template customised, bilingual, in vault.
- Six per-counterparty drafts staged.
- Internal-team addendum in vault.
- Squad fully onboarded; addendums signed; signature list current.
- Tracker live; audit log live; weekly cadence scheduled.
- Quick-reference shared and acknowledged.
- This FR's ticket marked Done with links to all artefacts.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted Summary, Problem, Subtasks, Alternatives, Open Questions, Implementation Notes, Test Plan, Rollback Plan, Audit Trail, Operational Risks, Definition of Done. The NDA template language itself is human-authored from the canonical legal library; Claude does not draft binding legal text.
- **Human review**: legal lead authors and reviews NDA pack; `@stephen-cheng` ratifies the customised master template before any draft is sent.
