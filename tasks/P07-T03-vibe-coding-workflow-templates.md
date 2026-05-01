---
title: "Author vibe-coding workflow templates (spec / demo / decision-gate)"
author: "@cyberskill-pm"
department: product
status: draft
priority: p1
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: not_ai
target_release: "2026-08-07"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Author the vibe-coding workflow templates that operationalise the SS1 partnership's discipline: a spec template (problem, success criteria, kill criterion, time-box); a demo template (what to show, what NOT to show, observability hooks); a decision-gate template (graduate / kill / pivot, with rationale); a weekly cadence template (Monday spec → Wednesday checkpoint → Friday demo + decision). Templates ship in the starter kit (P07-T01) and in the workspace conventions doc. The templates are what turn vibe coding from "just hack on stuff" into a discipline that delivers 5× the cadence of internal IT roadmaps.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"each PoC ships with a written kill criterion and graduation criterion, so Securities never invests further in a failed direction" — CyberSkill SS1 form answer
"compress idea-to-test latency for the Securities innovation team from quarters to weeks — at least 5× the cadence of internal IT roadmaps" — CyberSkill SS1 form answer
</untrusted_content>

## Problem

Without templates, "vibe coding" is a buzzword. With templates, it's a system that any engineer can follow — and any reviewer can verify. The SS1 form answer commits explicitly to written kill + graduation criteria; without templates, those criteria aren't structured.

Specific gaps if we shortcut:

- **Without spec template, every PoC starts differently — slow.**
- **Without demo template, demos are inconsistent — reviewers compare apples to oranges.**
- **Without decision-gate template, pivots and kills are ad-hoc — credibility loss.**
- **Without weekly cadence template, teams find their own rhythm — reviewers can't audit the discipline.**

## Proposed Solution

Four templates, shipped in `vibe-coding-starter-kit/templates/` and in the workspace-conventions doc:

1. **Spec template** (`SPEC.md`).
2. **Demo template** (`DEMO.md`).
3. **Decision-gate template** (`DECISION_GATE.md`).
4. **Weekly cadence template** (`WEEKLY.md`).

Setup target: 7 days from task assignment.

### Subtasks

- [ ] **Author SPEC template.** Sections: problem statement; user story; success criteria (specific + measurable); kill criterion (specific + measurable threshold below which we stop); time-box (e.g., 2 weeks); team (who's working); resources required; assumptions; open questions.
- [ ] **Author DEMO template.** Sections: scenario; user story; what to show (specific demonstrations); what NOT to show (avoid scope creep); observability hooks (eval scores, latency, cost); script (verbatim talking points for the 5-minute demo).
- [ ] **Author DECISION_GATE template.** Sections: PoC ID; current state; results vs. success criteria; results vs. kill criterion; recommended action (graduate / kill / pivot); rationale; next steps (if graduate: production-track plan; if kill: lessons learned; if pivot: new spec).
- [ ] **Author WEEKLY template.** Sections: PoC name; week-of; Monday spec status; Wednesday checkpoint findings; Friday demo + decision gate result; risks; next-week plan.
- [ ] **Provide worked examples.** One filled-in example per template — a fictitious portfolio-summariser PoC that passes the gate; a fictitious regulatory-checker PoC that fails the gate; a fictitious backtest PoC that pivots.
- [ ] **Document in starter kit's `WORKFLOW.md`.** Reference templates; describe usage flow.
- [ ] **Document in workspace conventions** (P00-T06 conventions doc): vibe-coding cadence, when to use each template, who reviews.
- [ ] **Verify Vietnamese translation** of templates (for any Shinhan-side engineers who prefer Vietnamese).

### Acceptance criteria

- Four templates authored with documented sections.
- Worked examples per template.
- Starter kit references templates.
- Workspace conventions reference templates.
- Vietnamese translation of templates published.

## Alternatives Considered

- **Single template (combine spec + demo + decision).** Rejected: each phase is distinct; combining loses clarity.
- **Skip worked examples.** Rejected: examples are how engineers learn the templates.
- **Skip Vietnamese translation.** Rejected: SS1 is a partnership; Shinhan-side engineers may prefer Vietnamese.
- **Build a custom tool to enforce templates.** Rejected: markdown templates + PR review is sufficient; custom tool is overkill.

## Success Metrics

- **Primary**: Four templates + four worked examples authored within 7 days.
- **Guardrail**: First PoC executed using the templates completes successfully (passes all template phases).

## Scope

### In scope
- Four templates with documented sections.
- Worked examples.
- Documentation in starter kit and workspace conventions.
- Vietnamese translation.

### Out of scope
- Custom tooling beyond markdown templates.
- Templates for non-vibe-coding workstreams.

## Dependencies

- **Upstream**: P00-T06 (workspace conventions); P07-T01 (starter kit).
- **Downstream**: P07-T02 (scenarios reference templates), P07-T04 (evidence kit references templates).
- **People**: PM authoring; founder reviewing; native-Vietnamese reviewer for translation.

## Open Questions

- Q1: Templates as Markdown or as Notion pages? Recommendation: Markdown in the starter kit (portable, version-controlled); also exported to Notion if customer prefers.
- Q2: Worked examples — fictitious or based on real Engagement A / B work? Recommendation: fictitious (avoids needing sponsor consent for examples).

## Implementation Notes

- Each template is single-file Markdown with placeholders (`{{PROBLEM}}`, `{{TIME_BOX}}`).
- Worked examples are full Markdown files — engineers can diff against the template to see usage.
- Vietnamese translations are parallel files (`SPEC.vi.md`, etc.).

## Test Plan

- Test 1: Each template + example renders correctly in Markdown viewers.
- Test 2: Walk through one PoC from spec to decision gate using templates; verify flow is natural.
- Test 3: Vietnamese translation reviewed by native speaker.

## Rollback Plan

- Bad template structure rolled back via PR; templates versioned.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| SPEC template | `vibe-coding-starter-kit/templates/SPEC.md` | PM | Continuous |
| DEMO template | `templates/DEMO.md` | PM | Continuous |
| DECISION_GATE template | `templates/DECISION_GATE.md` | PM | Continuous |
| WEEKLY template | `templates/WEEKLY.md` | PM | Continuous |
| Worked examples | `templates/examples/` | PM | Continuous |
| Vietnamese translations | `templates/*.vi.md` | PM + native-VN reviewer | Continuous |

## Operational Risks

- **Templates feel bureaucratic.** Mitigation: keep them short (1–2 pages each); examples illustrate brevity.
- **Engineers skip templates under time pressure.** Mitigation: PR review enforces; missing template fields blocks merge.
- **Templates become stale.** Mitigation: quarterly review by PM.

## Definition of Done

- Four templates + four examples + Vietnamese translations.
- Documentation in starter kit and workspace conventions.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR; assists template authoring).
- **Scope**: Claude drafted all sections of this FR; templates themselves authored by PM with Claude assistance.
- **Human review**: PM authors templates; founder reviews; native-Vietnamese reviewer translates.
