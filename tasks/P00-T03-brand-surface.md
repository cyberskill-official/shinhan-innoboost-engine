---
title: "Lock brand surface and three BU theme variants"
author: "@cyberskill-design-lead"
department: design
status: in_progress
priority: p1
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: user_facing
eu_ai_act_risk_class: not_ai
target_release: "2026-05-19"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Lock the visual brand surface for the demo build by extending the CyberSkill Global Design System with three Shinhan-BU-specific theme variants — *SVFC slate* (for SF9), *Bank navy* (for SB5), *Securities charcoal* (for SS1 contextual surfaces) — and producing the design tokens, typography scale, iconography, illustration kit, brand-lockup assets, and chat-specific component library that every Phase 5 UI task consumes. Output is a versioned design-system package `@cyberskill/shinhan-themes@1.0.0` published to internal npm, accompanied by a Storybook deployed to a private URL and a Figma library file with all three themes assembled. Without this lock, each BU surface diverges in PR review, the "one engine, three skins" pitch claim collapses, and the team burns 10–15% of the demo timeline on visual-consistency reconciliation. Founder sign-off is required at v1.0.0.

## Problem

Three submitted proposals (SF9, SB5, SS1) each promise a polished, BU-aware surface. The Form Answers describe positioning that the demo's visual surface must support — for example, the SB5 form answer states the system must read as a *complement* to Power BI, not a replacement; this constrains visual choices toward "professional and trustworthy" rather than "novel and disruptive." The demo-build-plan.md explicitly anticipates this design problem with the phrase "branded enough to look intentional, generic enough to be reusable."

Without a centrally-ratified brand surface, the design work in Phase 5 (P05-T01..T05) will fork across squads in predictable ways: different logo treatments, different empty-state illustrations, different iconography metaphors, different chart palettes, different typography weights for the same kind of content. Each fork adds review-cycle friction; cumulatively, those frictions cost a measurable fraction of the engineering schedule.

Specific Shinhan-context constraints make this harder, not easier:

- **Shinhan's own brand identity** is corporate-blue / serif-leaning / heavily institutional (visible in the Global Innoboost 2026 deck PDF and on Shinhan's public web properties). Our three theme variants must read as *complementary* to Shinhan's identity — we are positioned as a partner *inside* their environment, not as a brand override. This is psychologically different from positioning as a SaaS vendor.
- **Financial-sector reviewers are turned off by anything that screams "consumer SaaS."** Bright colours, playful illustrations, animated mascots, gradient-heavy designs all signal "wrong category." Our themes must read as *enterprise software adjacent to a bank*, not *startup pitching at YC Demo Day*.
- **Vietnamese typographic conventions**: the demo will display Vietnamese-language text alongside English. Some popular Latin-leaning typefaces handle Vietnamese diacritics poorly (broken hooks on `ơ`, misaligned stacked accents on `ế` `ề` `ệ`). Type choices must be Vietnamese-fluent.

The `feedback_enterprise_voice` memory note locks the external-voice rules: external materials must use the enterprise voice with "no founder name, no headcount mentions, CyberSkill Engagement Team as signatory." The brand surface must reflect that voice in its UI copy defaults — the "About" surface inside the demo references "CyberSkill" as a company name, never the founder personally.

The `shinhanos_tech_stack` memory note commits to Tailwind tokens. We must use Tailwind v4 design tokens (CSS-variables-driven), not arbitrary CSS variables, so that the demo theme can be ported into ShinhanOS post-PoC without a CSS rewrite. ADR-SHB-001 reinforces this portability requirement.

The `shinhanos_genie_brain` memory note describes a GENIE company-mascot assistant for *ShinhanOS*, not for the Shinhan demo. The Shinhan demo must not include the GENIE character — it would be off-brand for the financial context. Empty-state illustrations should be serious and warm, line-art style, no anthropomorphic mascots.

There is also a Phase 8 compliance dependency: WCAG 2.2 AA conformance is required for the engine UI per CyberSkill's accessibility commitments and per general financial-sector accessibility expectations (Vietnamese banks operate under inclusive-access expectations even where not strictly regulated). The brand-surface package must ship with verified contrast ratios and screen-reader semantics from the start, not as a retrofit.

## Proposed Solution

A versioned design-system package `@cyberskill/shinhan-themes@1.0.0` published to internal npm, containing five things: (1) a base theme that inherits cleanly from `@cyberskill/global-design-system` and adds chat-specific components; (2) three BU theme variants implemented purely as token overrides on the base — no theme-specific component implementations; (3) component-state matrices for chat-specific components (chat-bubble, citation-pill, confidence-tier-badge, HITL-banner, refusal-state, "show me how" drawer, eval-score-badge); (4) a Storybook deployed to a private CyberSkill URL with all components × all themes × all states for stakeholder review; (5) a Figma library file with the three themes assembled and three example screen compositions (chat answer surface, HITL reviewer console, admin audit explorer). Founder sign-off required at v1.0.0.

### Subtasks

- [ ] **Audit the Global Design System for chat-specific gaps.** Walk the existing component library, identify what is missing for the demo: chat bubble (user / assistant variants); citation-pill (numeric / textual / source-document variants); confidence-tier-badge (Low / Medium / High); HITL-banner (pending review / approved-with-edit / rejected); refusal-state (out-of-scope / sensitive-data / confidence-too-low); "show me how" drawer (collapsible, contains SQL + lineage + freshness); eval-score-badge (for the admin console showing 96.3% type values); query-cost meter; latency indicator; data-card link.
- [ ] **Author each missing component in Figma against the existing DS tokens.** No new tokens introduced at this stage; rely on the base DS's `color-surface`, `color-primary`, `color-accent`, `color-neutral-*`, `radius-*`, `space-*`, `font-*`, `motion-*`. If a component genuinely needs a token the DS doesn't have, raise a separate ticket against the DS — do not hack.
- [ ] **Define the three BU theme variants as token overrides.** Constraints to enforce in code review:
  - No theme may introduce a new colour family. All colour variation is *hue-shift* on the existing semantic tokens.
  - Typography, spacing, radii, motion are all inherited unchanged. A theme is colour + brand lockup only. This constraint is what makes the "one engine, three skins" claim genuine.
  - Each theme has exactly three override tokens: `color-primary`, `color-accent`, `color-surface-tone`. Anything beyond that is rejected at PR review.
- [ ] **Define SVFC slate (SF9 surface).** Primary slate-700 (`#334155`), accent SVFC-orange sampled and confirmed from Shinhan Finance brand assets (`#F26B1A` approximate; sample exact value from authoritative source), surface tone warm-grey (`#F5F4F0` approximate). Justification: SVFC is a consumer-finance brand; warm tones convey approachability while slate primary keeps it professional.
- [ ] **Define Bank navy (SB5 surface).** Primary Shinhan-navy sampled from Shinhan Bank brand book (`#0046FF` approximate; confirm from authoritative source), accent Shinhan-cyan (`#00B4FF` approximate), surface tone cool-grey (`#F1F4F8` approximate). Justification: Shinhan Bank's own identity leans heavily into navy + cyan; cool surface reinforces the institutional read.
- [ ] **Define Securities charcoal (SS1 surface).** Primary near-black (`#0F172A`), accent Shinhan-blue (`#1D4ED8`), surface tone high-contrast slate (`#E2E8F0`). Justification: Securities is a more analytical / data-heavy context; charcoal + high-contrast slate optimises for chart and number legibility.
- [ ] **Produce three brand lockups.** Each lockup pairs the CyberSkill logo with a small "+ Shinhan Bank Vietnam" / "+ Shinhan Vietnam Finance Company" / "+ Shinhan Securities Vietnam" suffix. The style is *partner-mark*, not co-brand: CyberSkill logo is primary, the Shinhan suffix is supporting text in the suffix-typography weight from the DS. No combined marks; no Shinhan logo modifications. Use only Shinhan-supplied or publicly-available Shinhan logo assets, with placement that respects Shinhan brand-guideline clear-space rules.
- [ ] **Produce empty-state and refusal-state illustrations.** Style: serious-but-warm, line-art, monochrome (uses the active theme's `color-primary` only), financial-services-appropriate. Do NOT include: anthropomorphic mascots; consumer-app metaphors (paper planes, smiley faces, balloons); GENIE character (per `shinhanos_genie_brain` memory). Six illustrations total: empty inbox, empty audit log, empty metric registry, refusal (out-of-scope), refusal (sensitive data), refusal (confidence too low).
- [ ] **Define chart palette.** Six-colour categorical, accessible at WCAG 2.2 AA contrast against both light and dark surface tones, distinguishable for protanopia and deuteranopia (run through Stark or Sim Daltonism). Same palette across all three themes — theme variation does not affect chart colour, since chart legibility is independent of brand framing.
- [ ] **Build Storybook with every component × every theme × every state.** Required states: default, hover, focus-visible, active, disabled, loading, error, success, with-data, empty, max-content. Storybook deploys to a private URL behind CyberSkill SSO; the URL is shared in the project workspace.
- [ ] **Build the Figma library file.** Filename `Shinhan Innoboost — Theme System v1.0.0`. Pages: (1) Foundations — colour, type, space, motion. (2) Components — every chat-specific component with auto-layout. (3) Themes — three theme variants applied to a representative screen composition. (4) Compositions — three example screens fully assembled per theme: chat answer surface (the user-facing demo surface), HITL reviewer console (for SB5), admin audit explorer (for the compliance pitch). Share permissions: squad has edit, founder has view, no external sharing.
- [ ] **Verify Vietnamese typographic fluency.** Render the chat-bubble component with sample Vietnamese strings (tones / diacritics / stacked accents): "Doanh số quý 4 năm 2025 của chi nhánh Quận 1?", "Dư nợ cho vay tiêu dùng tăng 12,3% so với tháng trước.", "Kết quả không đủ tin cậy — cần xem xét bởi kiểm soát viên." If any character renders broken or misaligned, swap typography to a Vietnamese-fluent face (e.g., Inter has good Vietnamese support; some mono faces do not).
- [ ] **Run accessibility audit.** axe-core run in Storybook CI against every component × every theme × every state. Verify zero violations vs. the base DS baseline.
- [ ] **Run colour-vision audit.** Sim Daltonism over the three themes for protanopia, deuteranopia, tritanopia. Verify chart palette and theme primary/accent remain distinguishable; if not, adjust.
- [ ] **Publish `@cyberskill/shinhan-themes@1.0.0` to internal npm.** Tag the release commit. Generate an auto-changelog from conventional commits.
- [ ] **Author the Brand Usage Guide.** One page for the design team: when to use which theme, what is allowed customisation, what is not, how to extend the system.
- [ ] **Author the Engineering Token Reference.** One page for the engineering team: how to import a theme, how to switch themes at runtime, how to extend with a new component, how to consume the chat-specific components.
- [ ] **Schedule a 30-min review with founder.** Walk through Storybook, Figma, sample Vietnamese rendering, and the three theme-variant screen compositions. Iterate once if needed; lock at 1.0.0 with founder signature.

### Acceptance criteria

- Three theme variants compile against the same component set with zero theme-specific component overrides. (Verified by grep: `theme === 'X'` conditionals in component source must equal zero.)
- Storybook URL accessible to the squad behind CyberSkill SSO; all components × all states × all themes render correctly.
- Figma library file shared with the squad; three example screen compositions present per theme.
- npm package `@cyberskill/shinhan-themes@1.0.0` published to internal registry.
- Vietnamese rendering verified across the three themes with no broken diacritics.
- WCAG 2.2 AA contrast verified on every component × every theme via axe-core CI run.
- Colour-vision check passed for protanopia, deuteranopia, tritanopia.
- Brand Usage Guide and Engineering Token Reference both shared in project workspace.
- Founder sign-off recorded.

## Alternatives Considered

- **Skip themes entirely; ship one neutral design across all three BUs.** Rejected: three submissions claimed BU-aware surfaces; under-delivering on visible polish reduces the "production-ready" framing without saving meaningful engineering time, since the underlying components are the same either way.
- **Build three separate design systems, one per BU.** Rejected: guarantees inconsistency, triples maintenance, contradicts the "one engine, three skins" pitch claim, and burns design-team capacity that should go into the chat-specific component additions.
- **Use Shinhan's design tokens directly (sample their public site CSS).** Rejected: copyright risk; presumptuous (we are a vendor inside their environment, not their design team); creates re-skin cost if Shinhan refreshes their brand mid-PoC; leaves us with no fallback if Shinhan's brand evolves.
- **Use a third-party financial-services design system (e.g., Carbon, Atlassian, Lightning).** Rejected: licensing and visual-recognition risk (Lightning especially is Salesforce-coded; Carbon is IBM-coded). Shinhan reviewers will recognise these and read it as us not having our own design language.
- **Defer the design work; ship Tailwind-only utility classes for the demo.** Rejected: Phase 12 rehearsal cannot polish a UI that lacks a coherent system; the time saved deferring is paid back triple in rehearsal-week panic. Also contradicts `feedback_p1_scope_preference` (lean richer when in doubt).
- **Build only one theme (the SVFC slate, since SF9 is our highest-confidence pitch) and skip the other two.** Rejected: doesn't materially save time once the base is built; gives reviewers a less impressive demonstration of the "one engine, three skins" credibility signal.
- **Use a fully custom typeface designed for the demo.** Rejected: typeface design takes months; off-the-shelf Vietnamese-fluent typefaces (Inter, Be Vietnam Pro, Source Sans 3) are sufficient and well-tested.

## Success Metrics

- **Primary**: Three themes shipped at v1.0.0 with zero theme-specific component overrides. Measured by: grep of the component source for theme conditionals; target zero.
- **Guardrail**: Zero accessibility regressions vs. the Global Design System baseline. Measured by: axe-core run in Storybook CI; WCAG violation count must equal the base DS violation count (which is currently zero per CyberSkill DS commitments).

## Scope

### In scope
- Three BU theme variants on top of the existing Global Design System.
- Chat-specific component additions (chat-bubble, citation-pill, confidence-tier-badge, HITL-banner, refusal-state, "show me how" drawer, eval-score-badge, query-cost meter, latency indicator, data-card link).
- Brand lockups for the three BUs.
- Empty/refusal-state illustrations (six total).
- Chart palette specification.
- Storybook deployment behind SSO.
- Figma library file with three example screen compositions per theme.
- Vietnamese-fluency verification.
- Accessibility and colour-vision audits.
- npm publication.
- Brand Usage Guide and Engineering Token Reference one-pagers.

### Out of scope
- Re-designing the Global Design System base layer (out-of-scope; raise a separate ticket if the base needs work).
- Vietnamese / Korean copy localisation of UI strings (handled in P05 surface tasks).
- Marketing-site visual design.
- Animations beyond existing motion tokens.
- A theme for Shinhan Life (out of submission scope; no surface needed).
- A theme for the SS1 vibe-coding *engagement model* — SS1's contextual data demos use the Securities theme, but the live-coding interview itself uses the engineer's own IDE and the standard CyberSkill GitHub UI.
- Mobile-first surface design (the demo target is desktop / iPad; mobile-responsive, not mobile-first).

## Dependencies

- **Upstream**: `@cyberskill/global-design-system` available at current stable; ADR-SHB-001 (P00-T02) ratified to confirm portability requirement.
- **Templates and tools**: Storybook v8, Tailwind v4 token system, Figma library workflow, axe-core, Sim Daltonism (or Stark plug-in), internal npm registry.
- **People**: design lead authoring; engineer co-authoring component implementations; founder ratifying.
- **External**: Shinhan brand asset access (logos and brand-guideline clear-space rules; obtain from public sources or via SFL-V if available).
- **Memory references**: `feedback_enterprise_voice`, `cyberskill_company_facts`, `shinhanos_genie_brain` (specifically: do not include GENIE).
- **Downstream**: gates P05-T01..T05 (UI shells), P12-T01 (pitch decks), P11-T03 (architecture diagrams use the same visual language).

## Open Questions

- Q1: Do we have authorisation to use the official Shinhan logos in our brand lockups? If not, fall back to using the textual entity name as the supporting label. Confirm via SFL-V relationship.
- Q2: Should the demo support a dark mode? Recommendation: ship light only at v1.0.0; dark mode is v1.1 if interview feedback demands it.
- Q3: Should the demo support reduced-motion mode? Recommendation: yes; motion tokens already include reduced-motion variants; ensure the chat-bubble streaming animation respects `prefers-reduced-motion`.
- Q4: Korean-language text — do we need to support it on the demo surfaces? Recommendation: not at v1.0.0; English + Vietnamese is enough for the interview phase. Korean would only matter if Shinhan HQ reviewers join, which is unlikely for the interview.
- Q5: For the Figma file's example screen compositions, which sample data populates them? Use the synthetic datasets from P03-T01..T03 once authored; placeholder data acceptable for v0.9.
- Q6: For Vietnamese typography, which exact face? Default recommendation: Inter (excellent Vietnamese support, free, widely loaded). Confirm with design lead.

## Implementation Notes

- All three theme variants should be implemented as Tailwind v4 `@theme` blocks. Each theme is a CSS file: `themes/svfc.css`, `themes/bank.css`, `themes/securities.css`. The chat surface picks a theme by setting `data-theme="svfc"` on the root element. This pattern matches the broader ShinhanOS approach and keeps the port to ShinhanOS mechanical.
- Components that need theme-aware logic (e.g., a chart that needs to invert text colour over a coloured background) use semantic tokens (`color-on-primary`, `color-on-surface`), not raw colour values. This is the only way to keep components theme-agnostic.
- The "no theme-specific component overrides" constraint is enforced in code review and via a lint rule: any component file that contains the substring `theme ===` or `theme==` fails CI.
- Storybook should include a `Theme` toolbar control that lets reviewers swap themes live. This is also useful for the Phase 12 rehearsals — the same Storybook becomes a "show our design language" surface during the interview.
- For the Figma file, use Figma Variables for the three theme tokens. Avoid duplicate component sets per theme.
- For the Brand Usage Guide, use specific examples — not abstract rules. Examples like "Use Bank navy for any surface inside Shinhan Bank's perimeter; if you are not sure which BU you are designing for, default to a neutral CyberSkill primary, never to a guess."

## Test Plan

- Test 1 (visual regression): Snapshot every Storybook story across three themes after publication; on every subsequent CI run, snapshot again and compare. Allowed delta: zero pixels in default state, < 0.5% in animated states.
- Test 2 (accessibility): axe-core run over the full Storybook on every PR; CI fails on any WCAG 2.2 AA violation.
- Test 3 (Vietnamese rendering): Visual snapshot of every component populated with the standard Vietnamese test string. Manual review by a Vietnamese-fluent squad member; pass criterion: zero broken diacritics, zero misaligned stacked accents.
- Test 4 (colour-vision): Sim Daltonism / Stark over the three themes for protanopia, deuteranopia, tritanopia. Pass criterion: theme primary, theme accent, and chart palette remain distinguishable from each other in all three vision modes.
- Test 5 (port-readiness): Manually create a Tailwind v4 project that imports `@cyberskill/global-design-system` and `@cyberskill/shinhan-themes`. Verify all three themes apply via `data-theme` swap with no JS-side intervention. Pass criterion: themes work in a third-party project with no monkey-patching.

## Rollback Plan

- Themes are versioned via npm. Rolling back to v0.x is a `pnpm install` away.
- A theme-level bug (e.g., contrast regression discovered late) is fixed by a v1.0.1 patch release; if a major issue is found, ship v1.1 with a deprecation note on v1.0.
- If a theme is rejected by Shinhan during the interview ("we don't want to be associated with this colour"), the runtime `data-theme` attribute lets us swap themes for the demo session without a code change.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| `@cyberskill/shinhan-themes@1.0.0` package | Internal npm | Design lead | Until superseded |
| Storybook deployment | Private CyberSkill subdomain | Design lead | Continuous |
| Figma library file | Figma workspace | Design lead | Continuous |
| Brand Usage Guide | `docs/design/brand-usage-guide.md` | Design lead | Continuous |
| Engineering Token Reference | `docs/design/engineering-token-reference.md` | Engine tech lead | Continuous |
| Founder sign-off | Project workspace | Founder | Indefinite |

## Operational Risks

- **Shinhan logo usage refused.** Mitigation: textual fallback labels; the partner-mark suffix becomes "Shinhan Bank Vietnam" without the logo. The demo still reads as Shinhan-context-aware.
- **Vietnamese rendering surprise on a downstream BU's Korean Windows IME.** Mitigation: rendering tests in CI on Linux + macOS + Windows with VN locale.
- **Chart palette fails colour-vision audit late.** Mitigation: build the palette early using a colour-vision-aware tool; allow one revision cycle without blocking the v1.0.0 milestone.
- **Storybook deployment behind SSO breaks for a Shinhan reviewer who lacks SSO access.** Mitigation: add a public-read Storybook subset (just the chat-surface composition) for interview-day, behind a one-time-token.
- **Theme swap behaves unexpectedly on the HITL banner (e.g., critical alerts must read as warning regardless of theme).** Mitigation: certain components (HITL-banner, refusal-state) bypass theme accent and use a fixed semantic warning colour from the base DS — this is documented in the Engineering Token Reference.

## Definition of Done

- npm package published at v1.0.0.
- Storybook live, accessible, all components × all states × all themes verified.
- Figma library shared, three compositions per theme.
- Vietnamese rendering verified.
- Accessibility and colour-vision audits passed.
- Two one-pagers shared.
- Founder sign-off recorded.
- Theme implementation guide cross-linked from the project tracker and from `tasks/INDEX.md`.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted Summary, Problem, Subtasks, Alternatives, Open Questions, Implementation Notes, Test Plan, Rollback Plan, Audit Trail, Operational Risks, Definition of Done. The actual brand surface, theme variants, illustrations, and Figma compositions are human-authored by the design lead.
- **Human review**: design lead authors and reviews all visual outputs; `@stephen-cheng` ratifies at v1.0.0.
