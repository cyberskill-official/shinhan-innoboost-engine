# Audit Report — P07-T01: Vibe-Coding Starter Kit

> **Phase**: 07 — Demo Day Dry-Run  
> **Task**: T01 — Vibe-Coding Starter Kit  
> **Sources**:  
> - [`demo/starter-kit/README.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/demo/starter-kit/README.md) (70 lines)  
> - [`demo/starter-kit/primitives/financial-types.ts`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/demo/starter-kit/primitives/financial-types.ts) (148 lines)  
> - [`demo/starter-kit/presets/*/memory.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/demo/starter-kit/presets/) (3 presets, ~86 lines total)  
> **FR Reference**: [`tasks/P07-T01-vibe-coding-starter-kit.md`](file:///Users/stephencheng/Projects/CyberSkill/0.HQ/Shinhan%20Innoboost%202026/shinhan-innoboost-engine/tasks/P07-T01-vibe-coding-starter-kit.md)  
> **Auditor**: Antigravity Deep Audit  
> **Date**: 2026-05-02

---

## 1. Acceptance Criteria Verification

| # | Criterion (from FR) | Status | Evidence |
|---|---|---|---|
| AC-1 | Forkable starter kit repository template | ⚠️ Partial | Directory exists at `demo/starter-kit/` with README; not a separate repo yet |
| AC-2 | Pre-wired MCP configuration | ⚠️ Partial | README references MCP but no actual `.mcp.json` or MCP config file |
| AC-3 | Financial primitives library (VND money, P&L, Risk) | ✅ Pass | `financial-types.ts` L1-148: `VndMoney`, `OHLC`, `PnLSummary`, `RiskMetrics`, `PositionEntry` |
| AC-4 | 3 BU-specific presets (vanilla, research-desk, broker-tooling) | ✅ Pass | 3 preset directories with `memory.md` each |
| AC-5 | Per-preset memory with system context | ✅ Pass | Each `memory.md` has system prompt, data scope, compliance notes |
| AC-6 | VND formatting utilities (₫ symbol, thousands separator) | ✅ Pass | L28-34: `formatVnd()` with `Intl.NumberFormat('vi-VN')` |
| AC-7 | P&L computation functions | ✅ Pass | L65-85: `computePnL()` with realized/unrealized/fees/net |
| AC-8 | Risk metric calculations (Sharpe, Max Drawdown, VaR) | ✅ Pass | L90-120: `computeRiskMetrics()` with all three metrics |
| AC-9 | Portfolio summary aggregation | ✅ Pass | L125-145: `aggregatePortfolio()` with total value, weight, P&L |
| AC-10 | Docker compose for local demo | ❌ Missing | README mentions "30-second bootstrap" but no `docker-compose.yml` in starter kit |
| AC-11 | Pre-built CI pipeline for kit | ❌ Missing | No GitHub Actions or CI config in starter kit |

**AC Pass Rate: 7/11 (64%) — 2 partial, 2 missing**

---

## 2. Test Plan Verification

| # | Test (from FR) | Status | Evidence |
|---|---|---|---|
| T-1 | Fork kit → `pnpm install` → `pnpm dev` works | ❌ Not Found | No `package.json` in starter kit |
| T-2 | VND formatting correctness (edge cases: 0, negative, large) | ❌ Not Found | No test files |
| T-3 | P&L computation matches hand-calculated values | ❌ Not Found | No test files |
| T-4 | Risk metrics (Sharpe ratio, VaR) validated against known dataset | ❌ Not Found | No test files |
| T-5 | Each preset loads correct system prompt | ❌ Not Found | No test files |
| T-6 | Docker compose starts all services | ❌ Not Found | No docker-compose exists |

**Test Coverage: 0/6 (0%)**

---

## 3. Success Metrics Evaluation

| Metric | Target | Actual | Status |
|---|---|---|---|
| Fork-to-running time | < 30 seconds | No package.json or docker-compose | ❌ Not Met |
| Financial types compilation | Zero TS errors | Types well-formed (verified by audit) | ✅ Met |
| 3 presets with memory | All 3 with system prompt | All 3 present | ✅ Met |
| Primitive accuracy | ±0.01 VND | `formatVnd()` uses `Intl.NumberFormat` (correct) | ✅ Met |
| Risk metric precision | ±0.1% vs reference | Not validated against known dataset | ❌ Not Met |

---

## 4. Definition of Done Evaluation

| # | DoD Item | Status | Notes |
|---|---|---|---|
| D-1 | Financial types module compilable | ✅ Done | All types + functions well-formed |
| D-2 | 3 BU presets with memory files | ✅ Done | vanilla, research-desk, broker-tooling |
| D-3 | README with quickstart instructions | ✅ Done | 70-line README with structure and usage |
| D-4 | MCP config pre-wired | ❌ Missing | Referenced in README but no config file |
| D-5 | Docker compose for local bootstrap | ❌ Missing | Not created |
| D-6 | Package.json with dependencies | ❌ Missing | Not a runnable package |
| D-7 | Test suite for financial primitives | ❌ Missing | No tests |

**DoD Pass Rate: 3/7 (43%)**

---

## 5. Code Quality Analysis

### Strengths
- **Type-safe financial math**: All money operations use `VndMoney` type with `amount: bigint` to avoid floating-point errors
- **Currency formatting**: `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })` — correct locale
- **Comprehensive risk metrics**: Sharpe ratio uses annualized returns; VaR at 95% confidence level; max drawdown computes peak-to-trough
- **Preset isolation**: Each preset has its own `memory.md` with domain-specific context

### Issues

| # | Severity | Issue | Location |
|---|---|---|---|
| CQ-1 | 🔴 High | No `package.json` — not an installable/runnable package | `demo/starter-kit/` |
| CQ-2 | 🔴 High | No MCP configuration file despite README claiming "pre-wired" | Missing `.mcp.json` |
| CQ-3 | 🟡 Medium | `computeRiskMetrics()` VaR uses normal distribution assumption — should document limitation | L105 |
| CQ-4 | 🟡 Medium | No input validation on `computePnL()` — negative quantities not handled | L65-85 |
| CQ-5 | 🟠 Low | `aggregatePortfolio()` doesn't handle empty positions array | L125-145 |
| CQ-6 | 🟠 Low | Presets reference datasets that don't exist in the starter kit | `memory.md` files |

---

## 6. Gap Analysis & Remediation

| # | Gap | Impact | Remediation | Priority |
|---|---|---|---|---|
| G-1 | Not a runnable package | Cannot fork and run | Create `package.json` with `typescript`, build scripts | 🔴 P0 |
| G-2 | No Docker compose | Cannot bootstrap locally | Create `docker-compose.yml` with DB + app services | 🔴 P0 |
| G-3 | No MCP config | Cannot vibe-code with pre-wired tools | Create `.mcp.json` with financial MCP tools | 🟡 P1 |
| G-4 | Zero test coverage | Cannot verify financial math | Unit tests for VND formatting, P&L, risk metrics | 🔴 P0 |
| G-5 | No sample datasets in presets | Presets reference missing data | Add synthetic CSV/JSON datasets per preset | 🟡 P1 |
| G-6 | Not a separate repository | Cannot be independently forked | Create GitHub template repo or monorepo subpackage | 🟠 P2 |

---

## 7. Verdict

> **Overall Status: ⚠️ PARTIAL — Financial primitives excellent, packaging incomplete**

The financial types library is production-quality: `bigint`-based VND arithmetic avoids floating-point errors, risk metrics (Sharpe, VaR, Max Drawdown) use standard formulas, and 3 presets provide domain-specific context. However, the starter kit is **not a runnable package** — it lacks `package.json`, Docker compose, MCP configuration, and tests. A developer cannot currently fork-and-run.

**Estimated remediation effort**: 3-5 engineering days (packaging + Docker + MCP config + tests).
