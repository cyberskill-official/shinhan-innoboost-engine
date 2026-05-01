# Research Desk — Project Memory

## Domain Focus
Equity research, stock screening, and analysis tools for Shinhan Securities analysts.

## Key Entities
- **Analyst Report**: ticker, target price, rating (buy/hold/sell), thesis, date
- **Screen**: filter criteria across fundamentals and technicals
- **Valuation Model**: DCF, P/E comparison, EV/EBITDA
- **Sector**: VN-Index sector classification

## Data Sources
- Market data: HOSE/HNX real-time (synthetic for demo)
- Financials: quarterly reports, annual filings
- Consensus: aggregated analyst estimates

## Analysis Patterns
- Top-down: macro → sector → stock
- Bottom-up: fundamentals → valuation → thesis
- Technical: moving averages, RSI, MACD, Bollinger

## Available Primitives
- `financial-types.ts`: OHLC, risk metrics, P&L
- `charts/`: Candlestick with overlays, comparison charts
- `tables/`: Screening results, peer comparison
- `sql/`: Parameterised queries against securities dataset

## Sample Commands
- `/screen` — Build stock screener with filters
- `/valuation` — Generate DCF model scaffold
- `/peer-compare` — Compare metrics across peers
