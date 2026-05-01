# SS1 Live-Coding Kit
## P12-T03

---

## Overview

The SS1 (Securities) interview features a **10-minute live-coding segment** where we build a financial tool from scratch using Claude Code + vibe-coding methodology. This kit ensures the live-coding is bulletproof.

---

## 1. Pre-Session Setup

### Environment
```bash
# Open workspace
cd ~/Projects/CyberSkill/vibe-coding-starter-kit

# Verify Claude Code is working
claude --version

# Warm up the session (pre-authenticate)
claude "Hello, confirm you can access the workspace"

# Verify MCP servers are connected
claude "/mcp"
# Expected: db-inspector, schema-validator, cyber-eval connected

# Pre-load the broker-tooling preset
cp presets/broker-tooling/.env.local .env.local
```

### Browser Tabs (pre-opened)
1. Claude Code terminal (full screen)
2. `http://localhost:3000` — CyberSkill UI (Securities theme)
3. `http://localhost:3001` — Grafana dashboards (cost dashboard)

---

## 2. Clipboard Prompts (Copy-Paste Ready)

### Scenario A — Portfolio Summariser (Primary Demo)

**Prompt 1 — Spec**:
```
Build a portfolio summary component that:
1. Fetches top 10 holdings by value from the portfolio_positions table
2. Shows a bar chart of allocation by sector
3. Calculates total portfolio value and daily P&L
4. Displays in the Securities UI shell with charcoal theme
Use the financial-types library for currency formatting (VND).
```

**Prompt 2 — Enhance**:
```
Add a filter dropdown for time period (1D, 1W, 1M, 3M, YTD) 
and a search box for ticker symbols. Make the chart interactive 
with hover tooltips showing exact values.
```

**Prompt 3 — Connect to engine**:
```
Wire this component to the CyberSkill engine API at /api/query. 
Send natural language: "Show portfolio summary for {selected_period}" 
and render the response. Handle loading, error, and empty states.
```

---

### Scenario B — Regulatory Checker (Backup)

**Prompt 1**:
```
Build a regulatory compliance checker that queries the engine with:
"List all positions that exceed 5% of fund NAV" and displays results
in a sortable table with red highlights for violations.
```

---

### Scenario C — Backtest Dashboard (Backup)

**Prompt 1**:
```
Build a backtest dashboard for VN30 index. Query the engine for 
historical daily returns, calculate cumulative return and max 
drawdown, display as a line chart with the benchmark overlay.
```

---

## 3. Timing Guide

| Time | Activity | What to Say |
|---|---|---|
| 0:00 | "Let me show you how we build tools" | "This is our vibe-coding workflow — spec to working tool in minutes" |
| 0:30 | Paste Prompt 1 | "I'm giving Claude a plain-English spec" |
| 1:00 | Claude generates code | "Watch — it's using our financial types library and connecting to the engine" |
| 2:00 | First render appears | "We have a working component in 2 minutes" |
| 2:30 | Paste Prompt 2 | "Now I'll enhance it — still in natural language" |
| 3:30 | Enhanced version renders | "Filters, search, interactive charts — all from 2 sentences" |
| 4:00 | Paste Prompt 3 | "Now connecting to the live engine" |
| 5:00 | Live data appears | "Real data from your portfolio system, through the CyberSkill engine" |
| 5:30 | Show cost dashboard | "That whole build cost 1,200 VND in LLM API calls" |
| 6:00 | Wrap | "This is what your analysts can do — build custom tools in minutes, not weeks" |

---

## 4. Recorded Fallbacks

### Recording Checklist

| Scenario | Recorded | Duration | File | Status |
|---|---|---|---|---|
| Portfolio Summariser | ⬜ | ~6 min | `recordings/portfolio-summariser.mp4` | Pending |
| Regulatory Checker | ⬜ | ~6 min | `recordings/regulatory-checker.mp4` | Pending |
| Backtest Dashboard | ⬜ | ~6 min | `recordings/backtest-dashboard.mp4` | Pending |

### Recording Instructions
```bash
# Use QuickTime Player → New Screen Recording
# Resolution: 1920×1080 (match projector)
# Audio: System audio + microphone
# Script: Follow timing guide above, speak naturally
# Edit: Trim dead time, add subtle captions for key moments
```

### When to Switch to Recording
1. Claude Code fails to start → play recording immediately
2. LLM returns garbage after 2 attempts → "Let me show you a clean run we recorded"
3. Network dies and local stack also fails → recording is the last resort
4. **Never spend more than 30 seconds debugging on stage**

---

## 5. Practice Schedule

| Run | Date | Duration | Focus |
|---|---|---|---|
| Solo practice #1 | [TBD] | 30 min | Full script, no audience |
| Solo practice #2 | [TBD] | 30 min | Time-constrained (strict 6 min) |
| Team rehearsal | [TBD] | 60 min | Full pitch including live-coding |
| Stress test | [TBD] | 30 min | Deliberately break things, test fallbacks |
