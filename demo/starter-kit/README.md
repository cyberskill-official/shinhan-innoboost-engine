// demo/starter-kit/README.md
// P07-T01 — Starter-Kit Repo Configuration

# 🚀 CyberSkill Vibe-Coding Starter Kit

Pre-configured Claude Code workspace for rapid financial-app prototyping.
SS1 wants velocity, not polish. Spec → demo in days, not quarters.

## What's Included

### Claude Code Workspace
- Project memory (`.claude/memory.md`) with domain context
- Slash commands for common operations
- MCP integrations (warehouse, Figma, Linear)
- Evals scaffold

### Primitive Library
- **Chart components**: candlestick, line, bar, area, heatmap
- **Table components**: sortable, filterable, exportable, paginated
- **RBAC helpers**: role check, permission gate, scope filter
- **Audit-log decorators**: auto-log mutations, hash-chain entries
- **SQL helpers**: parameterised queries, injection guard, explain plan
- **Financial-domain types**: VND money, OHLC, position deltas, P&L

### Starter Brains (Presets)
1. **Vanilla** — Empty workspace, all primitives available
2. **Broker Tooling** — Trade execution, order management, portfolio tracking
3. **Research Desk** — Analyst notes, stock screening, backtesting

## Quickstart

```bash
# Clone and start
git clone <starter-kit-url>
cd starter-kit

# Choose a preset
cp presets/broker-tooling/.claude . -r
# or
cp presets/research-desk/.claude . -r

# Start coding
claude-code .
```

## Directory Structure

```
starter-kit/
├── .claude/
│   ├── memory.md          # Domain context
│   └── commands/          # Slash commands
├── primitives/
│   ├── charts/
│   ├── tables/
│   ├── rbac/
│   ├── audit/
│   ├── sql/
│   └── financial-types/
├── presets/
│   ├── vanilla/
│   ├── broker-tooling/
│   └── research-desk/
├── evals/
│   └── scaffold.ts
└── mcps/
    ├── warehouse.json
    ├── figma.json
    └── linear.json
```
