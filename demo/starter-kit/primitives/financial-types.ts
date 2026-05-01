// demo/starter-kit/primitives/financial-types.ts
// P07-T01 — Financial Domain Types for vibe-coding primitives

// ─── VND Money ───────────────────────────────────────────

/** Immutable VND money type. All amounts in đồng (no decimals). */
export interface VndMoney {
  readonly amount: bigint;
  readonly currency: 'VND';
}

export function vnd(amount: number | bigint): VndMoney {
  return { amount: BigInt(amount), currency: 'VND' };
}

export function addVnd(a: VndMoney, b: VndMoney): VndMoney {
  return { amount: a.amount + b.amount, currency: 'VND' };
}

export function subtractVnd(a: VndMoney, b: VndMoney): VndMoney {
  return { amount: a.amount - b.amount, currency: 'VND' };
}

export function formatVnd(money: VndMoney): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(money.amount));
}

// ─── OHLC (Candlestick Data) ─────────────────────────────

export interface OHLC {
  readonly date: string;       // ISO date
  readonly symbol: string;
  readonly open: number;       // VND
  readonly high: number;
  readonly low: number;
  readonly close: number;
  readonly volume: number;
  readonly value: number;      // Trading value in VND
}

export function ohlcChange(candle: OHLC): { absolute: number; percent: number; direction: 'up' | 'down' | 'flat' } {
  const absolute = candle.close - candle.open;
  const percent = candle.open > 0 ? (absolute / candle.open) * 100 : 0;
  const direction = absolute > 0 ? 'up' : absolute < 0 ? 'down' : 'flat';
  return { absolute, percent, direction };
}

// ─── Position Deltas ─────────────────────────────────────

export interface Position {
  readonly symbol: string;
  readonly quantity: number;
  readonly avgCost: number;     // VND per share
  readonly currentPrice: number;
  readonly side: 'long' | 'short';
}

export interface PositionDelta {
  readonly symbol: string;
  readonly unrealisedPnl: VndMoney;
  readonly unrealisedPnlPct: number;
  readonly marketValue: VndMoney;
  readonly costBasis: VndMoney;
}

export function computePositionDelta(position: Position): PositionDelta {
  const costBasis = position.avgCost * position.quantity;
  const marketValue = position.currentPrice * position.quantity;
  const unrealisedPnl = position.side === 'long'
    ? marketValue - costBasis
    : costBasis - marketValue;
  const unrealisedPnlPct = costBasis > 0 ? (unrealisedPnl / costBasis) * 100 : 0;

  return {
    symbol: position.symbol,
    unrealisedPnl: vnd(unrealisedPnl),
    unrealisedPnlPct,
    marketValue: vnd(marketValue),
    costBasis: vnd(costBasis),
  };
}

// ─── P&L ─────────────────────────────────────────────────

export interface PnlEntry {
  readonly period: string;        // "2025-Q4", "2025-12"
  readonly bu: string;
  readonly revenue: VndMoney;
  readonly cost: VndMoney;
  readonly profit: VndMoney;
  readonly margin: number;        // 0-100%
}

export function computeProfit(revenue: VndMoney, cost: VndMoney): VndMoney {
  return subtractVnd(revenue, cost);
}

export function computeMargin(revenue: VndMoney, profit: VndMoney): number {
  const rev = Number(revenue.amount);
  return rev > 0 ? (Number(profit.amount) / rev) * 100 : 0;
}

// ─── Trading Hours (HOSE / HNX) ─────────────────────────

export const TRADING_SESSIONS = {
  HOSE: {
    morning: { open: '09:00', close: '11:30' },
    afternoon: { open: '13:00', close: '14:45' },
    atc: { open: '14:30', close: '14:45' },      // ATC session
  },
  HNX: {
    morning: { open: '09:00', close: '11:30' },
    afternoon: { open: '13:00', close: '15:00' },
    putThrough: { open: '09:00', close: '15:00' }, // Negotiation
  },
} as const;

export function isTradingHours(exchange: 'HOSE' | 'HNX', time: Date): boolean {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const t = hours * 60 + minutes;

  const sessions = TRADING_SESSIONS[exchange];
  const [mOpen, mClose] = [toMinutes(sessions.morning.open), toMinutes(sessions.morning.close)];
  const [aOpen, aClose] = [toMinutes(sessions.afternoon.open), toMinutes(sessions.afternoon.close)];

  return (t >= mOpen && t <= mClose) || (t >= aOpen && t <= aClose);
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h! * 60 + m!;
}

// ─── Risk Metrics ────────────────────────────────────────

export interface RiskMetrics {
  readonly portfolioVar: VndMoney;       // Value at Risk (95% 1-day)
  readonly sharpeRatio: number;
  readonly maxDrawdown: number;          // 0-100%
  readonly beta: number;
  readonly concentrationRisk: number;    // Herfindahl index
}
