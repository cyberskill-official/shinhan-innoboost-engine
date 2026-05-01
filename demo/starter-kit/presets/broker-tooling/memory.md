# Broker Tooling — Project Memory

## Domain Focus
Trade execution, order management, and portfolio tracking for Shinhan Securities Vietnam.

## Key Entities
- **Order**: symbol, side (buy/sell), type (market/limit/ATC), quantity, price, status
- **Trade**: executed order with fill price, commission, settlement date (T+2)
- **Portfolio**: collection of positions with P&L tracking
- **Watchlist**: user-curated stock symbols with alerts

## Business Rules
- Lot size: 100 shares (HOSE), 100 shares (HNX)
- Price step: 100 VND (HOSE ≥ 50k), 50 VND (HOSE 10k-49.9k), 10 VND (HOSE < 10k)
- Ceiling/Floor: ±7% (HOSE), ±10% (HNX), ±15% (UPCOM)
- T+2 settlement cycle
- Foreign ownership limits per stock

## Available Primitives
- `financial-types.ts`: VND money, OHLC, position deltas, P&L
- `charts/`: Candlestick, line, area charts
- `tables/`: Sortable order book, trade blotter
- `rbac/`: Role-based trade permissions

## Sample Commands
- `/new-order` — Scaffold order entry form
- `/portfolio-view` — Generate portfolio dashboard
- `/backtest` — Run strategy backtest against synthetic data
