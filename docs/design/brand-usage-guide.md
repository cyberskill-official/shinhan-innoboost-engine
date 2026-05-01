# Brand Usage Guide — Shinhan Innoboost 2026

> When to use which theme, what customisation is allowed, and how to extend the design system.

**Last updated**: 2026-05-02
**Owner**: Design lead
**Status**: DRAFT — pending design lead review, Figma library, and founder sign-off

---

## The Three Themes

The demo build uses **one engine, three skins**. Each BU gets a theme variant implemented purely as token overrides on the `@cyberskill/shinhan-themes` base. No theme-specific component implementations exist — if you find yourself writing `if (theme === 'bank')` in a component, you are doing it wrong.

### SVFC Slate (SF9 surface)

- **Use when**: building any surface inside the SVFC / consumer-finance context
- **Primary**: Slate-700 (`#334155`)
- **Accent**: SVFC-orange (`#F26B1A` — sampled from Shinhan Finance brand assets; confirm exact value)
- **Surface tone**: Warm-grey (`#F5F4F0`)
- **Character**: Professional but warm; approachable consumer-finance positioning

### Bank Navy (SB5 surface)

- **Use when**: building any surface inside the Shinhan Bank context
- **Primary**: Shinhan-navy (`#0046FF` — sampled from Shinhan Bank brand book; confirm exact value)
- **Accent**: Shinhan-cyan (`#00B4FF`)
- **Surface tone**: Cool-grey (`#F1F4F8`)
- **Character**: Institutional, trustworthy; reads as complement to Power BI, not replacement

### Securities Charcoal (SS1 surface)

- **Use when**: building any surface inside the Securities / analytical context
- **Primary**: Near-black (`#0F172A`)
- **Accent**: Shinhan-blue (`#1D4ED8`)
- **Surface tone**: High-contrast slate (`#E2E8F0`)
- **Character**: Data-dense, analytical; optimised for chart and number legibility

---

## Token Override Rules

Each theme is defined by exactly **three override tokens**:

| Token | Purpose | Type |
|---|---|---|
| `color-primary` | Primary brand colour; used for headers, active states, primary buttons | Hue shift on base DS |
| `color-accent` | Secondary brand colour; used for links, highlights, secondary actions | Hue shift on base DS |
| `color-surface-tone` | Background surface tint; sets the overall warmth/coolness of the surface | Hue shift on base DS |

**Rules**:
- No theme may introduce a new colour family. All variation is hue-shift on existing semantic tokens.
- Typography, spacing, radii, and motion are inherited unchanged from the Global Design System.
- A theme is colour + brand lockup only.
- Any PR introducing a fourth override token is rejected at code review.

---

## Brand Lockups

Each lockup pairs the CyberSkill logo with a supporting Shinhan suffix:

| Theme | Lockup text |
|---|---|
| SVFC Slate | CyberSkill + Shinhan Vietnam Finance Company |
| Bank Navy | CyberSkill + Shinhan Bank Vietnam |
| Securities Charcoal | CyberSkill + Shinhan Securities Vietnam |

**Style**: Partner-mark, not co-brand. CyberSkill logo is primary; the Shinhan suffix is supporting text in the suffix-typography weight from the DS. No combined marks. No Shinhan logo modifications.

**Logo usage**: Use only Shinhan-supplied or publicly available Shinhan logo assets with clear-space rules respected. If Shinhan logo authorisation is not obtained, fall back to textual entity name only.

---

## What Is NOT Allowed

| ❌ Don't | ✅ Do instead |
|---|---|
| Use Shinhan's brand colours directly for your own components | Use the semantic tokens (`color-primary`, `color-accent`, `color-surface-tone`) |
| Introduce anthropomorphic mascots or GENIE character | Use the line-art illustrations from the illustration kit |
| Use consumer-SaaS visual patterns (bright gradients, playful animations, emoji) | Keep visuals serious-but-warm, financial-sector-appropriate |
| Hard-code colour values in component CSS | Use semantic tokens exclusively |
| Create theme-specific component implementations | Use the shared component set; themes are token overrides only |
| Modify Shinhan logos or combine marks | Use the standard partner-mark lockup |

---

## Illustrations & Empty States

- **Style**: Serious-but-warm, line-art, monochrome (uses active theme's `color-primary`)
- **No mascots**: The GENIE character is ShinhanOS-specific; the Shinhan demo must not include it
- **No consumer-app metaphors**: No paper planes, smiley faces, balloons

Available illustrations:
1. Empty inbox
2. Empty audit log
3. Empty metric registry
4. Refusal: out-of-scope
5. Refusal: sensitive data
6. Refusal: confidence too low

---

## Chart Palette

Six-colour categorical palette, consistent across all three themes:
- Accessible at WCAG 2.2 AA against both light and dark surface tones
- Distinguishable for protanopia and deuteranopia
- Theme variation does NOT affect chart colours — chart legibility is independent of brand framing

---

## If You're Unsure

- **Not sure which BU you're designing for?** Default to a neutral CyberSkill primary. Never guess.
- **Need a new component?** Check if the Global Design System has it first. If not, raise a ticket.
- **Need a new token?** You probably don't — existing semantic tokens cover 95% of cases. If you genuinely need one, raise a ticket against the DS, don't hack.
- **Need to override theme behaviour for a specific component?** Some components (HITL-banner, refusal-state) bypass theme accent and use a fixed semantic warning colour from the base DS. This is intentional and documented in the Engineering Token Reference.

---

## Vietnamese Typography

- **Primary face**: Inter (excellent Vietnamese diacritics support)
- **Test strings** (use these for rendering verification):
  - "Doanh số quý 4 năm 2025 của chi nhánh Quận 1?"
  - "Dư nợ cho vay tiêu dùng tăng 12,3% so với tháng trước."
  - "Kết quả không đủ tin cậy — cần xem xét bởi kiểm soát viên."
- **If any character renders broken or misaligned**: swap to a Vietnamese-fluent alternative and file a bug

---

## External-Voice Reminder

Per `feedback_enterprise_voice`: external materials use the enterprise voice. The "About" surface inside the demo references "CybyerSkill" as a company name, never the founder personally. No founder name, no headcount mentions. Signature block: "CyberSkill Engagement Team."
