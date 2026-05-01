# Engineering Token Reference — Shinhan Themes

> How to import a theme, switch themes at runtime, extend with new components, and consume the chat-specific component library.

**Last updated**: 2026-05-02
**Owner**: Engine tech lead
**Status**: DRAFT — pending `@cyberskill/shinhan-themes@1.0.0` npm publication

---

## Quick Start

```bash
# Install the theme package
pnpm add @cyberskill/shinhan-themes@1.0.0

# Import base + theme in your root CSS
@import '@cyberskill/shinhan-themes/base.css';
@import '@cyberskill/shinhan-themes/themes/bank.css';  # or svfc.css, securities.css
```

```html
<!-- Set the active theme on the root element -->
<html data-theme="bank">
  <!-- All components inherit the theme automatically -->
</html>
```

---

## Theme Files

| File | Contents |
|---|---|
| `base.css` | Global Design System base + chat-specific component tokens |
| `themes/svfc.css` | SVFC Slate token overrides (`color-primary`, `color-accent`, `color-surface-tone`) |
| `themes/bank.css` | Bank Navy token overrides |
| `themes/securities.css` | Securities Charcoal token overrides |

Each theme file is a Tailwind v4 `@theme` block that overrides exactly three tokens. Example:

```css
/* themes/bank.css */
@theme {
  --color-primary: #0046FF;
  --color-accent: #00B4FF;
  --color-surface-tone: #F1F4F8;
}
```

---

## Runtime Theme Switching

Switch themes at runtime by updating the `data-theme` attribute on the root element:

```typescript
// Switch to SVFC theme
document.documentElement.setAttribute('data-theme', 'svfc');

// Switch to Bank theme
document.documentElement.setAttribute('data-theme', 'bank');

// Switch to Securities theme
document.documentElement.setAttribute('data-theme', 'securities');
```

**No JS-side intervention needed.** CSS custom properties cascade automatically. Components that use semantic tokens respond to theme changes without re-rendering.

---

## Semantic Token Reference

### Colour Tokens (theme-variant)

| Token | Purpose | SVFC Slate | Bank Navy | Securities Charcoal |
|---|---|---|---|---|
| `--color-primary` | Headers, active states, primary buttons | `#334155` | `#0046FF` | `#0F172A` |
| `--color-accent` | Links, highlights, secondary actions | `#F26B1A` | `#00B4FF` | `#1D4ED8` |
| `--color-surface-tone` | Background surface tint | `#F5F4F0` | `#F1F4F8` | `#E2E8F0` |

### Derived Colour Tokens (auto-calculated from theme tokens)

| Token | Purpose |
|---|---|
| `--color-on-primary` | Text colour over `color-primary` backgrounds |
| `--color-on-surface` | Text colour over `color-surface-tone` backgrounds |
| `--color-on-accent` | Text colour over `color-accent` backgrounds |
| `--color-surface-elevated` | Cards, modals, drawers (slightly lighter than surface-tone) |
| `--color-border` | Borders and dividers |

### Fixed Semantic Tokens (NOT theme-variant)

These tokens bypass theme overrides for a reason — they carry UI meaning that must be consistent regardless of brand framing:

| Token | Purpose | Value |
|---|---|---|
| `--color-warning` | HITL-banner pending, SLA warnings | `#D97706` (amber) |
| `--color-error` | Refusal states, validation errors | `#DC2626` (red) |
| `--color-success` | Approved states, positive confirmations | `#059669` (green) |
| `--color-info` | Informational notices, citations | `#2563EB` (blue) |

---

## Chat-Specific Components

These components are added on top of the Global Design System for the demo:

| Component | Variants | States |
|---|---|---|
| `ChatBubble` | user, assistant | default, streaming, error |
| `CitationPill` | numeric, textual, source-document | default, hover, expanded |
| `ConfidenceTierBadge` | low, medium, high | default |
| `HITLBanner` | pending-review, approved-with-edit, rejected | default, actionable |
| `RefusalState` | out-of-scope, sensitive-data, confidence-too-low | default |
| `ShowMeHowDrawer` | — | collapsed, expanded |
| `EvalScoreBadge` | — | default |
| `QueryCostMeter` | — | default, warning, exceeded |
| `LatencyIndicator` | — | fast, normal, slow |
| `DataCardLink` | — | default, hover |

### Usage

```tsx
import { ChatBubble, CitationPill, ConfidenceTierBadge } from '@cyberskill/shinhan-themes/components';

<ChatBubble variant="assistant" streaming={true}>
  Revenue increased by <CitationPill type="numeric" sourceId="sql-1">12.3%</CitationPill> 
  compared to the previous quarter.
  <ConfidenceTierBadge tier="high" />
</ChatBubble>
```

---

## Extending with New Components

1. **Check the Global Design System first.** Don't duplicate.
2. **Use only semantic tokens** — never hard-code colour values.
3. **No theme conditionals.** If you write `theme === 'bank'`, your component is wrong. Use semantic tokens and let the CSS cascade handle theme differences.
4. **CI enforcement**: any component file containing `theme ===` or `theme==` fails CI lint.

### Example: Adding a New Component

```tsx
// ✅ Correct — uses semantic tokens
const styles = {
  background: 'var(--color-surface-elevated)',
  color: 'var(--color-on-surface)',
  borderColor: 'var(--color-border)',
  accentColor: 'var(--color-accent)',
};

// ❌ Wrong — hard-codes theme values
const styles = {
  background: theme === 'bank' ? '#F1F4F8' : '#F5F4F0',
};
```

---

## Storybook

The Storybook deployment at `[PRIVATE_URL]` includes:
- Every component × every theme × every state
- `Theme` toolbar control for live theme switching
- Vietnamese test string rendering verification
- Accessibility (axe-core) audit results per component

---

## Port to ShinhanOS

Per ADR-SHB-001, the theme package is portable to ShinhanOS:
- Tailwind v4 `@theme` blocks match ShinhanOS's token architecture
- `data-theme` attribute pattern is ShinhanOS-compatible
- No `@shinhanos/*` imports — clean separation

The port is a `pnpm install` + `data-theme` attribute wire-up. No component rewrite required.
