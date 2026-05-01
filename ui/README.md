# ui/

Next.js 15 + React 19 application. Three BU surfaces (SVFC / Bank / Securities) on a shared chat foundation, plus the admin console.

## Sub-modules

| Path | Purpose | Anchor FR |
|---|---|---|
| `components/` | Shared chat UI components (citation pill, trust drawer, confidence badge, HITL banner, refusal states) | P05-T01 |
| `themes/svfc/` | SVFC slate theme | P05-T02 |
| `themes/bank/` | Bank navy theme | P05-T03 |
| `themes/securities/` | Securities charcoal theme | P05-T04 |
| `admin/` | Admin console + HITL reviewer console | P05-T05, P06-T02 |
| `dashboards/` | Pre-configured dashboard templates per BU | P05-T02..T04 |
| `locales/` | English + Vietnamese UI strings | P05-T01 |
| `e2e/` | Playwright end-to-end tests | P05-T01 |

## Quickstart

```bash
pnpm --filter @cyberskill/shinhan-ui dev
# Visit http://localhost:3000
```

## Status

Stub. Implementation gated on P00-T03 (brand surface) + engine APIs ready.
