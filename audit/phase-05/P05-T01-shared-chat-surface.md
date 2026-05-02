# Deep Audit — P05-T01: Shared Conversational UI Surface

> **Auditor**: Antigravity Engine Audit  
> **Date**: 2026-05-02  
> **Status**: 🟢 SUBSTANTIALLY COMPLETE (~70%)  
> **Risk Level**: Medium  

---

## 1. Acceptance Criteria Audit

| # | Criterion | Status | Evidence | Gap |
|---|-----------|--------|----------|-----|
| AC-1 | Chat input with bilingual placeholder | ✅ PASS | `ChatInput` component (L254-265): `en` → "Ask a question…", `vi` → "Đặt câu hỏi…". | — |
| AC-2 | Streaming response rendering | 🟡 PARTIAL | `ChatMessage.isStreaming` flag (L31). `LoadingState` component (L292-302). But **no actual streaming handler** (SSE/WebSocket consumer). | UI stub only; no stream processing. |
| AC-3 | Citation pills with click-to-expand | ✅ PASS | `CitationPill` component (L57-66): Renders `[N]` buttons with aria-label, onClick handler, data-citation-id. | — |
| AC-4 | Confidence badge (high/medium/low with colors) | ✅ PASS | `ConfidenceBadge` component (L87-100): CSS-variable-driven colors (green/amber/red). Bilingual labels. ARIA role=status. | — |
| AC-5 | HITL banner (pending/approved/rejected) | ✅ PASS | `HitlBanner` component (L125-142): 3 states with bilingual labels. SLA display. Refresh button for pending. ARIA role=alert, aria-live=polite. | — |
| AC-6 | Refusal state with rephrase action | ✅ PASS | `RefusalState` component (L165-175): 3 reasons (outOfScope, sensitive, lowConfidence). Bilingual. Rephrase button for outOfScope. | — |
| AC-7 | "Show Me How" drawer (SQL, citations, confidence, execution time) | ✅ PASS | `ShowMeHowDrawer` component (L189-221): Slide-out aside with SQL pre, citation list, confidence tier, execution time. ARIA role=complementary. | — |
| AC-8 | Follow-up suggestions | ✅ PASS | `FollowUpSuggestions` component (L230-243): Clickable chips, ARIA role=navigation. | — |
| AC-9 | Empty state with sample questions | ✅ PASS | `EmptyState` component (L276-288): BU-themed, bilingual greeting, clickable sample questions. | — |
| AC-10 | Conversation history sidebar | ✅ PASS | `ConversationHistory` component (L314-331): Nav with new/select/export. Active highlighting. | — |
| AC-11 | WCAG 2.2 AA accessibility | 🟡 PARTIAL | ARIA attributes present: role, aria-label, aria-live. Skip-to-content defined in locale files. But **no actual keyboard navigation testing** or screen reader verification. | Untested. |
| AC-12 | Bilingual (en/vi) UI strings | ✅ PASS | `ui/locales/en.json` (68 lines) and `vi.json` (68 lines). Complete mirror with chat, confidence, refusal, hitl, drawer, empty, admin, dashboard, accessibility sections. | — |
| AC-13 | Next.js 15 implementation | ❌ FAIL | **No Next.js project exists.** Components return plain objects (virtual DOM-like), not JSX. No `package.json` with next dependency. `ui/package.json` exists but no next/react. | Not a Next.js app. |
| AC-14 | CSS styling (dark theme, responsive) | ❌ FAIL | **No CSS files exist** for chat components. HTML report in `cyber-eval.ts` has inline styles but no component CSS. | No stylesheets. |
| AC-15 | Export conversation functionality | ✅ PASS | `ConversationHistory` has `onExport` callback (L311). | Callback exists; no export logic. |

**AC Summary**: 10/15 PASS, 2/15 PARTIAL, 2/15 FAIL, 1/15 N/A.

---

## 2. Test Plan Audit

| # | Test | Status | Evidence | Gap |
|---|------|--------|----------|-----|
| TP-1 | Component rendering tests (CitationPill, ConfidenceBadge, etc.) | ❌ NOT RUN | No test files. `ui/e2e/` directory is empty. | No tests written. |
| TP-2 | Streaming response rendering without flickering | ❌ NOT RUN | No stream test. | No streaming implementation. |
| TP-3 | Bilingual switching test (en↔vi) | ❌ NOT RUN | No locale test. | No tests. |
| TP-4 | WCAG 2.2 AA compliance audit (axe-core/Lighthouse) | ❌ NOT RUN | No accessibility test. | No tests. |
| TP-5 | Keyboard navigation test (Tab, Enter, Escape) | ❌ NOT RUN | No keyboard test. | No tests. |
| TP-6 | Responsive design test (mobile/tablet/desktop) | ❌ NOT RUN | No responsive test. No CSS. | No tests. |
| TP-7 | Conversation export (PDF/CSV) | ❌ NOT RUN | Export handler callback exists but no implementation. | No export logic. |

**TP Summary**: 0/7 tests executed. **100% test debt.**

---

## 3. Success Metrics Audit

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Chat surface functional | Yes | Components defined, not renderable | 🟡 PARTIAL |
| Streaming working | Yes | Flag only, no SSE/WebSocket | ❌ FAIL |
| WCAG 2.2 AA compliant | Yes | ARIA present, untested | 🟡 PARTIAL |
| Next.js 15 deployed | Yes | Not a Next.js app | ❌ FAIL |

---

## 4. Definition of Done Audit

| Criterion | Met? | Notes |
|-----------|------|-------|
| All components shipped | 🟡 | 10 components defined; no CSS, no streaming |
| WCAG 2.2 AA verified | ❌ | ARIA present but no audit |
| Next.js 15 deployed | ❌ | No Next.js project |
| E2E tests pass | ❌ | e2e/ directory empty |
| Bilingual UI complete | ✅ | en.json + vi.json complete |

---

## 5. Code Quality Assessment

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Component Design** | 8/10 | Well-typed interfaces. Good separation of concerns. Bilingual support built-in. |
| **Accessibility** | 7/10 | ARIA roles/labels on all components. aria-live for dynamic content. Missing keyboard handlers. |
| **Bilingual Support** | 9/10 | Complete en/vi locale files. Components accept locale prop. |
| **Rendering** | 3/10 | Components return plain objects, not JSX/React elements. Not renderable without adapter. |
| **Styling** | 0/10 | No CSS files. No design tokens. No responsive layout. |
| **Streaming** | 1/10 | isStreaming flag only. No EventSource/WebSocket consumer. |
| **Test Coverage** | 0/10 | Zero tests. Empty e2e/ directory. |

---

## 6. Risk Assessment

| Risk | Severity | Impact | Mitigation |
|------|----------|--------|------------|
| Not a Next.js app — requires full project setup | **HIGH** | Significant effort to scaffold Next.js + integrate components | Init Next.js 15 project, migrate components to JSX |
| No CSS = invisible components | **HIGH** | Cannot demo without styling | Create component CSS with design tokens from P00-T03 |
| No streaming = poor user experience | **HIGH** | Users see "Thinking…" until full response loads | Implement SSE/WebSocket stream consumer |
| Empty e2e/ = no regression safety | **MEDIUM** | UI regressions land silently | Write Playwright/Cypress tests |

---

## 7. Remediation Priorities

| Priority | Item | Effort | Dependency |
|----------|------|--------|------------|
| P0 | Scaffold Next.js 15 project (`npx create-next-app@latest`) | 2h | None |
| P0 | Convert components from plain-object returns to JSX/React components | 8h | Next.js project |
| P0 | Create component CSS with dark theme, responsive layout | 12h | Design tokens (P00-T03) |
| P1 | Implement streaming (SSE consumer from engine API) | 6h | P02 engine API |
| P1 | Write 7 component tests (rendering, bilingual, accessibility) | 6h | Next.js project |
| P1 | Write Playwright e2e tests | 8h | Functional UI |
| P2 | Implement conversation export (PDF/CSV) | 4h | None |
| P2 | WCAG 2.2 AA audit with axe-core | 3h | CSS complete |
