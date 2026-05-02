# Phase 05 — UI Shell & Theming: Audit Summary

> **Auditor**: Antigravity Engine Audit  
> **Date**: 2026-05-02  
> **Phase Completion**: 🟡 ~45%  
> **Risk Level**: HIGH (no renderable UI; no Next.js project; zero CSS)  

---

## Aggregate Scorecard

| Task | Status | AC Pass Rate | Tests | LoC | Key Gap |
|------|--------|-------------|-------|-----|---------|
| [P05-T01](P05-T01-shared-chat-surface.md) Shared Chat Surface | 🟢 70% | 10/15 (67%) | 0 | 332 | Not Next.js; no CSS; no streaming |
| [P05-T02](P05-T02-svfc-theme-surface.md) SVFC Theme (SF9) | 🟡 40% | 3/7 (43%) | 0 | 46 | No CSS tokens; no Keycloak; no engine |
| [P05-T03](P05-T03-bank-theme-surface.md) Bank Theme (SB5) | 🟡 40% | 3/8 (38%) | 0 | 57 | No CSS tokens; no engine |
| [P05-T04](P05-T04-securities-theme-surface.md) Securities Theme (SS1) | 🟡 45% | 4/9 (44%) | 0 | 50 | No CSS tokens; ticker autocomplete not built |
| [P05-T05](P05-T05-admin-console.md) Admin Console | 🟡 45% | 10/14 (71%) | 0 | 214 | Types-only; no CRUD; no rendering |

**Totals**: 699 LoC | **0 tests** | 30/53 AC criteria met (57%) | **0 CSS files**

---

## Cross-Task Gap Analysis

### 🔴 Critical: No Renderable UI

The single most important finding across Phase 5: **nothing can be seen on screen**. The components exist as TypeScript interfaces and functions returning plain objects — but there is:

- **No Next.js project** — FR specifies Next.js 15; no `next` in dependencies
- **No JSX/React** — Components return `{}` objects, not `<div>` elements
- **No CSS** — Zero stylesheet files; zero design tokens; zero responsive layout
- **No Storybook** — FR references visual verification against Storybook; none exists

This means the entire Phase 5 is a **type-level specification** rather than a functional UI.

### 🔴 Critical: No Engine Integration

All 3 BU themes (T02–T04) specify engine integration against their respective datasets. None have API endpoint configuration. The chat surface (T01) has no streaming implementation (SSE/WebSocket).

### 🟢 Positive: Strong Type Foundation

What *is* present is high-quality:
- Well-structured TypeScript interfaces for all components
- Complete bilingual locale files (en.json + vi.json, 68 keys each)
- 6 dashboard templates across 3 BUs with widget configs
- Comprehensive admin console type model (6 sections, RBAC, audit chain, security alerts)
- Ticker-aware pattern for Securities differentiator

### 🟡 Important: Authentication Gap

All 3 BU themes define personas. None have:
- Keycloak realm configuration
- Persona-swap UI component
- Auth flow integration

---

## Architecture Assessment

```
Current State:

  ui/
  ├── components/
  │   ├── chat-surface.tsx  ← TypeScript types + plain object returns
  │   └── (no JSX, no CSS)
  ├── admin/
  │   └── console.ts        ← Types + plain object returns
  ├── themes/
  │   ├── svfc/config.ts    ← Config only
  │   ├── bank/config.ts    ← Config only
  │   └── securities/config.ts ← Config only
  ├── dashboards/
  │   └── templates.ts      ← Widget configs
  ├── locales/
  │   ├── en.json           ← Complete ✅
  │   └── vi.json           ← Complete ✅
  └── e2e/                  ← Empty

Target State (to be functional):

  ui/
  ├── app/                  ← Next.js 15 App Router
  │   ├── layout.tsx
  │   ├── page.tsx
  │   ├── [bu]/page.tsx
  │   └── admin/page.tsx
  ├── components/           ← React JSX components
  ├── styles/               ← CSS with design tokens
  ├── lib/                  ← Streaming, auth, API client
  └── e2e/                  ← Playwright tests
```

---

## Remediation Roadmap

### Sprint 1 (Week 1): Foundation
| Item | Effort | Owner | Priority |
|------|--------|-------|----------|
| Scaffold Next.js 15 project (App Router, TypeScript) | 2h | eng-ui | P0 |
| Create design token CSS (colors, typography, spacing per BU) | 8h | design-lead + eng-ui | P0 |
| Convert chat-surface.tsx to JSX React components | 8h | eng-ui | P0 |
| Implement streaming (SSE consumer from engine API) | 6h | eng-ui | P0 |

### Sprint 2 (Week 2): Theme Surfaces
| Item | Effort | Owner | Priority |
|------|--------|-------|----------|
| Implement `data-theme` switching (svfc/bank/securities) | 4h | eng-ui | P0 |
| Build persona-swap UI with Keycloak integration | 8h | eng-ui + eng-sec | P1 |
| Build dashboard grid layout + widget rendering | 8h | eng-ui | P1 |
| Build ticker autocomplete for Securities | 4h | eng-ui | P1 |

### Sprint 3 (Week 3): Admin Console
| Item | Effort | Owner | Priority |
|------|--------|-------|----------|
| Convert admin console to JSX with sidebar layout | 8h | eng-ui | P1 |
| Implement RBAC editor CRUD | 8h | eng-ui | P1 |
| Implement audit log explorer | 6h | eng-ui | P1 |
| Implement alert console | 4h | eng-ui | P1 |

### Sprint 4 (Week 4): Testing & Polish
| Item | Effort | Owner | Priority |
|------|--------|-------|----------|
| Write component tests (rendering, bilingual, a11y) | 8h | eng-ui | P1 |
| Write Playwright e2e tests (chat flow, persona swap) | 8h | eng-ui | P1 |
| WCAG 2.2 AA audit with axe-core | 4h | eng-ui | P2 |
| Responsive testing (mobile/tablet/desktop) | 4h | eng-ui | P2 |

**Total estimated effort**: ~106 engineering hours (≈2.6 engineer-weeks).

---

## Phase Risk Summary

| Risk | Probability | Impact | Overall |
|------|-------------|--------|---------|
| No renderable UI (no Next.js, no CSS, no JSX) | CERTAIN | HIGH | 🔴 CRITICAL |
| No engine integration (streaming, API calls) | CERTAIN | HIGH | 🔴 CRITICAL |
| No authentication (Keycloak, personas) | CERTAIN | HIGH | 🔴 CRITICAL |
| Zero tests | CERTAIN | MEDIUM | 🟡 MODERATE |
| No accessibility verification | CERTAIN | LOW | 🟡 MODERATE |
| Dashboard widgets not renderable | CERTAIN | MEDIUM | 🟡 MODERATE |
