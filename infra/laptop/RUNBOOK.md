# Laptop deployment runbook

Per P10-T01.

## Prerequisites

- Docker Desktop 4.x (macOS or Linux).
- 16 GB RAM minimum; 32 GB recommended for full offline mode.
- 30 GB free disk (engine images + model weights).

## First-time setup

```bash
cd infra/laptop

# Online mode (uses Anthropic API)
docker compose up

# Offline mode (uses local Qwen-7B; requires extra disk + RAM)
docker compose --profile offline up
```

## Smoke test

```bash
# Engine health
curl http://localhost:4000/health

# Sample question via UI
open http://localhost:3000
```

Pre-seeded personas:
- SVFC: `mis-lead@svfc.demo` (analyst), `collections-mgr@svfc.demo` (analyst-scoped), `cfo@svfc.demo` (admin)
- Bank: `ho-analyst@bank.demo`, `branch-mgr@bank.demo`, `risk-officer@bank.demo`
- Securities: `eq-analyst@securities.demo`, `broker-ops@securities.demo`, `securities-lead@securities.demo`

Password: `localdev` (development only; never use this pattern in production).

## Common errors

| Error | Cause | Fix |
|---|---|---|
| `Cannot connect to Docker daemon` | Docker Desktop not running | Start Docker Desktop |
| `Port 5432 already in use` | Local Postgres running | Stop it: `brew services stop postgresql` |
| `OOM during qwen-inference startup` | Insufficient RAM | Skip offline profile; use Anthropic API |

## Tear-down

```bash
docker compose down -v  # -v removes volumes (resets state)
```

## See also

- `DEMO_SCRIPT.md` — what to demonstrate during the laptop fallback
- P10-T01 — laptop deployment FR
