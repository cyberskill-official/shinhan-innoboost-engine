---
title: "Build shared conversational UI surface (chat + citations + tiers)"
author: "@cyberskill-design-lead"
department: design
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: user_facing
eu_ai_act_risk_class: limited
target_release: "2026-07-17"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Build the shared conversational UI surface that all three BU themes (P05-T02 SVFC, P05-T03 Bank, P05-T04 Securities) inherit from: a chat input + streaming answer view; per-claim citation pills with the trust drawer (P02-T04); confidence-tier badges (P02-T05); "show me how" expandable drawer revealing SQL + lineage + freshness; HITL banner on regulated questions; refusal states (out-of-scope / sensitive / confidence-too-low); loading + empty + error states; history panel (per-user, searchable, exportable); follow-up suggestions; deep-link sharing of question + answer; pinned dashboard panel; full keyboard navigation; WCAG 2.2 AA accessibility; Vietnamese + English internationalisation; mobile-responsive (iPad-first). The surface is the single most-visible artefact of the entire build; it is what reviewers see first.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"ask in natural language and get an audited answer in seconds" — CyberSkill SF9 form answer
"every answer carries a confidence tier and a citation" — CyberSkill SF9 form answer
"Power BI stays in place; we supplement it with a conversational layer" — CyberSkill SB5 form answer
</untrusted_content>

## Problem

The Form Answers commit explicitly to a polished conversational surface across all three BUs. The surface is what Shinhan reviewers click first; if it feels janky, half-built, or untrustworthy, every backend correctness claim becomes irrelevant.

Specific gaps if we shortcut:

- **Without polished chat UX, the demo feels like a prototype.** Loading spinners, jagged streaming, missing error states all signal "not ready".
- **Without citation pills + trust drawer, the citation engine (P02-T04) is invisible.** Citations must be visually obvious and frictionless to expand.
- **Without confidence-tier badges, P02-T05 is invisible to users.**
- **Without HITL banner on regulated questions, the SB5 wedge is hidden.**
- **Without history + sharing + dashboard panels, the surface feels like a one-shot tool, not a daily-driver.**
- **Without accessibility, banking-sector reviewers will flag it.**
- **Without Vietnamese rendering verified, P00-T03's bilingual investment is wasted.**
- **Without mobile responsiveness, an MD on iPad in the boardroom can't use it.**

The `shinhanos_genie_brain` memory note clarifies: GENIE is for ShinhanOS, not for the Shinhan demo. The surface must NOT feature GENIE or any anthropomorphic mascot.

The `feedback_enterprise_voice` memory note locks the external voice. The surface's copy reflects "CyberSkill" as a company, never the founder personally.

The `feedback_p1_scope_preference` memory note biases us richer. For the chat surface, "richer" means: every documented affordance shipped at v1.0; not "we'll add history later"; not "accessibility is a nice-to-have". Each ship-feature is required for credibility.

## Proposed Solution

A Next.js 15 + React 19 application in `ui/` consuming the brand-surface package (P00-T03) and the engine API (P02-T01..T09). Surface components: chat input, streaming answer view, citation pill, trust drawer, confidence-tier badge, "show me how" drawer, HITL banner, refusal states, loading/empty/error states, history panel, dashboard panel, share-link surface, follow-up suggestions. Setup target: 21 days from task assignment.

### Subtasks

- [ ] **Set up the Next.js application.** App router; React 19; Tailwind v4; consume `@cyberskill/shinhan-themes` (P00-T03). The same Next app serves all three BU themes; theme is selected by URL slug or by authenticated user's BU.
- [ ] **Implement chat input.** Multi-line input with submit button; supports Enter to submit, Shift+Enter for newline; placeholder localised; max length 8000 chars (matches sanitiser cap from P02-T06).
- [ ] **Implement streaming answer view.** Server-sent events from engine; tokens stream as they arrive; citation pills inserted inline as the citation engine (P02-T04) emits them; final flourish on completion.
- [ ] **Implement citation pill component.** Visual: small rounded pill containing the citation ID; clicking opens the trust drawer.
- [ ] **Implement trust drawer.** Side-panel; shows SQL (syntax-highlighted, scrollable), source row (table view), metric definition link, lineage diagram (rendered via Mermaid or similar), freshness, confidence breakdown, copy-citation button, open-in-admin button.
- [ ] **Implement confidence-tier badge.** Visual: pill-style badge — green for High, amber for Medium, red for Low. Hover reveals the breakdown.
- [ ] **Implement "show me how" drawer.** Distinct from trust drawer; collapsible at the bottom of the answer; shows the entire SQL, the metric used, the prompt-injection-defence trace.
- [ ] **Implement HITL banner.** When the policy layer (P02-T03) routes a question to HITL, the banner replaces the answer area: "Your question requires reviewer approval. Reviewer SLA: 30 minutes. Reference: {hitl-id}." User receives a notification when the reviewer responds.
- [ ] **Implement refusal states.** Three: out-of-scope ("This question doesn't match our supported metrics. Try rephrasing..."); sensitive-data ("Your role doesn't permit this question. Request elevation if needed."); confidence-too-low ("I'm not confident enough to answer; this has been routed to a reviewer."). Each refusal includes the citation ID linking to the audit log.
- [ ] **Implement loading / empty / error states.** Loading: skeleton with placeholder pills; empty: "Try asking..."; error: "Something went wrong. Reference: {error-id}. Please retry or contact support."
- [ ] **Implement history panel.** Side panel listing the user's past questions; searchable (free-text); each entry deep-links to the original answer.
- [ ] **Implement dashboard panel.** User can pin frequently asked questions; pinned questions display as cards with the latest answer + freshness; refreshable on demand.
- [ ] **Implement share-link surface.** Copy a deep-link to a question + answer + citations; RBAC-respecting (only authorised users can resolve the link).
- [ ] **Implement follow-up suggestions.** After an answer, the engine returns 3 suggested follow-up questions; surface as clickable chips.
- [ ] **Implement accessibility.** WCAG 2.2 AA: semantic HTML, ARIA where needed, keyboard navigation, focus-visible, screen-reader-tested, contrast verified (P00-T03 brand surface ensures contrast).
- [ ] **Implement i18n.** English + Vietnamese; all UI strings extracted to locale files; RTL support deferred (not needed for English/Vietnamese).
- [ ] **Implement mobile responsive.** iPad-first (1024×768 portrait/landscape); desktop secondary; phone (smaller than 768px) gets a simplified layout.
- [ ] **Implement reduced-motion.** `prefers-reduced-motion` respected; streaming animation degrades to non-animated for users with motion sensitivity.
- [ ] **Implement dark mode (optional).** Per Open Question Q2 in P00-T03 — defer to v1.1 unless time permits.
- [ ] **Test exhaustively.** Visual regression (Storybook + Chromatic or similar); accessibility (axe-core CI); E2E tests (Playwright) for happy path and refusal paths.

### Acceptance criteria

- Chat surface deployed in staging.
- All documented affordances functional.
- Brand-surface integration verified for all three themes.
- Accessibility audit passes (WCAG 2.2 AA).
- Vietnamese rendering verified.
- Mobile responsive verified on iPad.
- E2E tests for happy + refusal paths pass.
- Visual regression baseline captured.

## Alternatives Considered

- **Use a third-party chat-UI library (e.g., Vercel AI SDK).** Rejected: tied to a vendor; we have specific affordances (citation pills, trust drawer, HITL banner) that aren't standard; building our own gives us control.
- **Skip dashboard panel.** Rejected: pinned questions are a daily-driver feature; without them the surface feels one-shot.
- **Skip mobile responsive; desktop only.** Rejected: iPad is a real surface; banking executives use it.
- **Skip i18n; English only.** Rejected: bilingual fluency is a credibility signal; Form Answers commit to Vietnamese.
- **Skip share-link.** Rejected: collaboration is a daily-driver pattern; without sharing, the surface feels personal-only.

## Success Metrics

- **Primary**: All affordances shipped at v1.0 within 21 days of task assignment.
- **Guardrail**: Lighthouse accessibility score ≥ 95; performance score ≥ 80 on the chat surface.

## Scope

### In scope
- Chat input + streaming answer + citations + tiers + trust drawer + show-me-how + HITL banner + refusal states + loading/empty/error.
- History + dashboard + share-link + follow-up suggestions.
- Accessibility, i18n, mobile-responsive, reduced-motion.
- E2E + visual-regression + accessibility tests.

### Out of scope
- Per-BU theme variants (P05-T02..T04 build on this base).
- Admin console (P05-T05).
- HITL reviewer console (P06-T02).
- Multi-turn conversation state (deferred to v1.1).
- Voice input (deferred).
- Dark mode (deferred unless time permits).
- Marketing-site copy (separate workstream).

## Dependencies

- **Upstream**: P00-T03 (brand surface); P01-T06 (auth); P02-T01..T09 (engine API).
- **Downstream**: P05-T02..T04 (theme variants), P12-T01 (pitch decks reference).
- **People**: design lead authoring; engineer co-authoring; eng-llm reviewing streaming integration; eng-sec reviewing citation cross-tenant denial.
- **Memory references**: `shinhanos_genie_brain` (no GENIE), `feedback_enterprise_voice`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: Streaming protocol — SSE or WebSocket? Recommendation: SSE for simplicity; WS only if multi-direction needed.
- Q2: Lineage diagram in trust drawer — Mermaid or hand-rolled SVG? Recommendation: Mermaid (per existing CyberSkill pattern).
- Q3: Dashboard panel pinned-question count limit? Recommendation: 12 per user; configurable.
- Q4: For mobile responsive, do we ship a phone-app PWA? Recommendation: not at v1; web-responsive is enough.

## Implementation Notes

- Use React Server Components for non-interactive parts; Client Components for chat input and streaming.
- Streaming: SSE with proper EventSource handling; reconnect on transient errors.
- Citation pill renders inline within the streaming answer; positioning handled by the citation tokens in the narrative.
- Trust drawer is a `<dialog>` element with backdrop; closes on Escape or backdrop click.
- For i18n, use `next-intl` or similar; locale files at `ui/locales/{en,vi}.json`.
- For mobile responsive, design at iPad portrait first; expand to landscape and desktop.

## Test Plan

- Test 1: E2E happy path — login, ask a question, see answer with citations, click citation, see trust drawer.
- Test 2: E2E refusal paths — out-of-scope, sensitive-data, confidence-too-low; verify each surface.
- Test 3: Accessibility — axe-core full sweep; manual screen-reader test; manual keyboard navigation.
- Test 4: Visual regression — Storybook + Chromatic (or visual-tests in Playwright).
- Test 5: Performance — Lighthouse score ≥ 80.
- Test 6: Vietnamese rendering — sample VN strings render correctly across all components.
- Test 7: Mobile — iPad portrait + landscape verified; phone layout works.

## Rollback Plan

- A bad UI release is rolled back via Helm rollback of the UI image; users see previous version.
- A bad streaming change can be feature-flagged off; falls back to non-streaming.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| UI source | `ui/` | Design lead | Continuous |
| Storybook | Internal subdomain | Design lead | Continuous |
| Visual regression baseline | CI artefacts | Design lead | Per CI retention |
| Accessibility audit results | CI artefacts | Design lead | 1 year |
| E2E test suite | `ui/e2e/` | Engineer | Continuous |

## Operational Risks

- **Streaming connection drops.** Mitigation: SSE auto-reconnect; user sees a loading state on reconnect.
- **Trust drawer slow to load on cold cache.** Mitigation: pre-fetch citations on hover before click.
- **Mobile breakpoints hide critical content.** Mitigation: iPad-first design; explicit phone simplification.
- **Vietnamese diacritics break under specific fonts.** Mitigation: P00-T03 verified; CI check on rendering.

## Definition of Done

- Surface deployed; all affordances live.
- Tests passing; accessibility verified.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
The chat surface displays answers produced by the engine; no AI training in this task. Streaming token-by-token from the LLM; citations are post-resolution from the engine's citation store.

### Human Oversight
Users are the human oversight; HITL banner triggers human review; refusal states explain why the AI declined; trust drawer makes the AI's reasoning auditable.

### Failure Modes
- Engine error: error state with reference ID for support.
- Streaming connection drop: auto-reconnect; if persistent, fail with retry button.
- Citation resolver failure: pill remains clickable; on click, error message.
- Trust drawer fails to render: fallback to plain-text view.
- HITL banner shown but reviewer never responds: SLA breach alert; user notified to follow up.

## Sales/CS Summary

CyberSkill's chat surface is what every Shinhan business user touches daily: ask a question in plain Vietnamese or English, watch an answer stream in with every number cited back to its source, and see at a glance whether the answer is trustworthy (High / Medium / Low confidence). Citations expand into a side-panel that reveals exactly where the number came from, when it was last updated, and how confident we are. Sensitive questions route automatically to a human reviewer; the user sees a clear explanation. The surface works on iPad in the boardroom, on a desktop in the office, and respects accessibility standards out of the box.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: design lead authors and reviews; engineer co-authors implementation; eng-llm reviews streaming integration; eng-sec reviews citation authorisation; native-Vietnamese reviewer verifies translations.
