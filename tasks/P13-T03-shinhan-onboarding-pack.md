---
title: "Author Shinhan-side onboarding pack (tool, HITL, audit-log primer)"
author: "@cyberskill-pm"
department: product
status: draft
priority: p1
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: user_facing
eu_ai_act_risk_class: not_ai
target_release: "2026-10-09"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Author the onboarding pack for Shinhan-side users (their reviewers + admins + executive sponsors): how to use the chat surface; how to perform HITL reviews; how to query audit logs; how to interpret confidence tiers; bilingual (EN + VI + Korean reference for HQ touchpoints). Pack delivered at kickoff (Day 1); supports the first-week ramp-up.

## Problem

Without onboarding pack, Shinhan-side users learn by trial; with it, they're productive Day 1.

## Proposed Solution

An onboarding pack in `references/shinhan-onboarding/`:

1. **Chat surface guide.** How to ask a question; how to interpret an answer + citation + confidence.
2. **HITL reviewer guide.** Inbox; case detail; actions; SLA expectations.
3. **Audit-log query guide.** Common queries; admin UI walkthrough.
4. **Quick-start video.** 5-min walkthrough.
5. **Bilingual.** EN + VI + Korean key terms.

Setup target: 14 days from task assignment after P05-T01..T05 + P06-T02 stable.

### Subtasks

- [ ] **Author chat-surface user guide.**
- [ ] **Author HITL-reviewer guide.**
- [ ] **Author audit-log-query guide.**
- [ ] **Record quick-start video.**
- [ ] **Bilingual + Korean key terms.**
- [ ] **PDF-export.**
- [ ] **Founder spot-check.**

### Acceptance criteria

- All four pack components in place.
- Bilingual.
- Founder spot-check approved.

## Dependencies

- **Upstream**: P05-T01..T05; P06-T02; P02-T09.
- **People**: PM authoring; design lead applying visual; founder ratifying; native-VN reviewer.

## Audit Trail / Artefacts

| Artefact | Location |
|---|---|
| Chat user guide | `references/shinhan-onboarding/CHAT.{en,vi}.pdf` |
| HITL reviewer guide | `references/shinhan-onboarding/HITL.{en,vi}.pdf` |
| Audit-log query guide | `references/shinhan-onboarding/AUDIT.{en,vi}.pdf` |
| Quick-start video | `references/shinhan-onboarding/QUICKSTART.mp4` |

## Definition of Done

- Pack ready for kickoff Day 1.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting).
- **Human review**: PM authors; design lead polishes; founder ratifies; native-VN reviewer.
