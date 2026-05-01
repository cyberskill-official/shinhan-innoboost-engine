# hitl/

Human-in-the-loop reviewer queue. The SB5 wedge.

## Sub-modules

| Path | Purpose | Anchor FR |
|---|---|---|
| `triage/` | Triage rules engine — confidence + sensitivity + novelty | P06-T01 |
| `triage/rules/` | Seed routing rules (YAML) | P06-T01 |
| `calibration/` | Quarterly calibration reporting | P06-T03 |
| `notifications/` | Email + in-app + Shinhan webhook | P06-T05 |

## Related (in other workspaces)

- Reviewer console UI lives in `ui/admin/hitl/` (P06-T02)
- Reviewer-feedback → engine loop lives in `engine/feedback/` (P06-T04 + P04-T05)

## Quickstart

```bash
pnpm --filter @cyberskill/shinhan-hitl dev
```

## Status

Stub. Implementation gated on P02-T03 (policy layer) + P02-T05 (confidence) + P02-T07 (sensitivity).
