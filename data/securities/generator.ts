// data/securities/generator.ts
// P03-T03 — Securities Synthetic Dataset (SS1)
// Tables: customers, accounts, holdings, trades, portfolios,
//         watchlists, research_notes, market_data

import { FakerVN, HOSE_SYMBOLS, HNX_SYMBOLS } from '../_lib/faker-vn.js';
import type { TableDef, ColumnDef } from '../_lib/loader.js';

const COL = (name: string, pgType: string, opts: Partial<ColumnDef> = {}): ColumnDef => ({
  name, type: pgType, pgType,
  bqType: pgType.replace('SERIAL', 'INT64').replace('TEXT', 'STRING').replace('NUMERIC', 'NUMERIC').replace('DATE', 'DATE').replace('TIMESTAMP', 'TIMESTAMP').replace('BOOLEAN', 'BOOL').replace('INTEGER', 'INT64'),
  sfType: pgType.replace('SERIAL', 'NUMBER').replace('TEXT', 'VARCHAR'),
  nullable: opts.nullable ?? false, primaryKey: opts.primaryKey, sensitivity: opts.sensitivity,
});

const TENANT_ID = 'securities-shinhan';

export const SECURITIES_TABLES: readonly TableDef[] = [
  {
    name: 'customers', schema: 'securities', description: '~20K securities customers',
    rowCount: 20_000,
    columns: [
      COL('id', 'TEXT', { primaryKey: true }),
      COL('full_name', 'TEXT', { sensitivity: 'restricted' }),
      COL('cccd', 'TEXT', { sensitivity: 'regulated' }),
      COL('phone', 'TEXT', { sensitivity: 'restricted' }),
      COL('email', 'TEXT', { sensitivity: 'restricted' }),
      COL('investor_type', 'TEXT'), // individual, institutional, foreign
      COL('risk_profile', 'TEXT'), // conservative, moderate, aggressive
      COL('kyc_verified', 'BOOLEAN'),
      COL('created_at', 'DATE'),
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'accounts', schema: 'securities', description: 'Trading accounts',
    rowCount: 25_000,
    columns: [
      COL('id', 'TEXT', { primaryKey: true }),
      COL('customer_id', 'TEXT'),
      COL('account_type', 'TEXT'), // cash, margin
      COL('margin_ratio_pct', 'NUMERIC', { nullable: true }),
      COL('cash_balance_vnd', 'NUMERIC'),
      COL('buying_power_vnd', 'NUMERIC'),
      COL('status', 'TEXT'),
      COL('opened_at', 'DATE'),
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'holdings', schema: 'securities', description: 'Current stock holdings',
    rowCount: 150_000,
    columns: [
      COL('account_id', 'TEXT'),
      COL('symbol', 'TEXT'),
      COL('exchange', 'TEXT'),
      COL('quantity', 'INTEGER'),
      COL('avg_cost_vnd', 'NUMERIC'),
      COL('market_value_vnd', 'NUMERIC'),
      COL('unrealised_pnl_vnd', 'NUMERIC'),
      COL('as_of_date', 'DATE'),
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'trades', schema: 'securities', description: '~5M trade records (1-min aggregated)',
    rowCount: 5_000_000,
    columns: [
      COL('id', 'TEXT', { primaryKey: true }),
      COL('account_id', 'TEXT'),
      COL('symbol', 'TEXT'),
      COL('exchange', 'TEXT'),
      COL('side', 'TEXT'), // buy, sell
      COL('order_type', 'TEXT'), // LO, MP, ATO, ATC
      COL('quantity', 'INTEGER'),
      COL('price_vnd', 'NUMERIC'),
      COL('amount_vnd', 'NUMERIC'),
      COL('fee_vnd', 'NUMERIC'),
      COL('tax_vnd', 'NUMERIC'),
      COL('traded_at', 'TIMESTAMP'),
      COL('settled_at', 'DATE', { nullable: true }),
      COL('status', 'TEXT'), // filled, partial, cancelled
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'portfolios', schema: 'securities', description: 'Named portfolios',
    rowCount: 5_000,
    columns: [
      COL('id', 'TEXT', { primaryKey: true }),
      COL('customer_id', 'TEXT'),
      COL('name', 'TEXT'),
      COL('strategy', 'TEXT'),
      COL('total_value_vnd', 'NUMERIC'),
      COL('return_pct', 'NUMERIC'),
      COL('benchmark', 'TEXT'),
      COL('created_at', 'DATE'),
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'watchlists', schema: 'securities', description: 'Customer watchlists',
    rowCount: 30_000,
    columns: [
      COL('customer_id', 'TEXT'),
      COL('symbol', 'TEXT'),
      COL('added_at', 'DATE'),
      COL('alert_price_vnd', 'NUMERIC', { nullable: true }),
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'research_notes', schema: 'securities', description: 'Analyst research notes',
    rowCount: 500,
    columns: [
      COL('id', 'TEXT', { primaryKey: true }),
      COL('symbol', 'TEXT'),
      COL('analyst', 'TEXT'),
      COL('rating', 'TEXT'), // buy, hold, sell, outperform, underperform
      COL('target_price_vnd', 'NUMERIC'),
      COL('published_at', 'DATE'),
      COL('summary', 'TEXT', { sensitivity: 'internal' }),
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'market_data', schema: 'securities', description: 'Daily OHLCV (HOSE/HNX, 5yr)',
    rowCount: 62_500, // 50 symbols × 1250 trading days
    columns: [
      COL('symbol', 'TEXT'),
      COL('exchange', 'TEXT'),
      COL('trade_date', 'DATE'),
      COL('open_vnd', 'NUMERIC'),
      COL('high_vnd', 'NUMERIC'),
      COL('low_vnd', 'NUMERIC'),
      COL('close_vnd', 'NUMERIC'),
      COL('volume', 'INTEGER'),
      COL('value_vnd', 'NUMERIC'),
      COL('tenant_id', 'TEXT'),
    ],
  },
];

// ─── Generators ──────────────────────────────────────────

const ORDER_TYPES = ['LO', 'MP', 'ATO', 'ATC'] as const;
const STRATEGIES = ['growth', 'value', 'dividend', 'momentum', 'balanced'] as const;
const RATINGS = ['buy', 'hold', 'sell', 'outperform', 'underperform'] as const;

export function generateSecCustomers(faker: FakerVN, count: number = 20_000): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    rows.push({
      id: faker.uuid(), full_name: faker.fullName(), cccd: faker.cccd(),
      phone: faker.phone(), email: faker.email(),
      investor_type: faker.random.weighted([
        { value: 'individual', weight: 85 },
        { value: 'institutional', weight: 10 },
        { value: 'foreign', weight: 5 },
      ]),
      risk_profile: faker.random.pick(['conservative', 'moderate', 'aggressive']),
      kyc_verified: faker.random.next() > 0.03,
      created_at: faker.dateStr('2019-01-01', '2026-03-31'),
      tenant_id: TENANT_ID,
    });
  }
  return rows;
}

export function generateAccounts(faker: FakerVN, customers: readonly Record<string, unknown>[]): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  for (const customer of customers) {
    // Each customer has 1–2 accounts
    const numAccounts = faker.random.next() < 0.25 ? 2 : 1;
    for (let a = 0; a < numAccounts; a++) {
      const isCash = a === 0;
      rows.push({
        id: faker.uuid(), customer_id: customer['id'],
        account_type: isCash ? 'cash' : 'margin',
        margin_ratio_pct: isCash ? null : faker.random.float(40, 70).toFixed(1),
        cash_balance_vnd: faker.vndAmount(0, 500e6),
        buying_power_vnd: faker.vndAmount(0, 1000e6),
        status: faker.random.next() < 0.95 ? 'active' : 'suspended',
        opened_at: faker.dateStr('2019-01-01', '2026-03-31'),
        tenant_id: TENANT_ID,
      });
    }
  }
  return rows;
}

export function generateMarketData(faker: FakerVN): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  const allSymbols = [...HOSE_SYMBOLS, ...HNX_SYMBOLS];

  for (const symbol of allSymbols) {
    const exchange = HOSE_SYMBOLS.includes(symbol as typeof HOSE_SYMBOLS[number]) ? 'HOSE' : 'HNX';
    let price = faker.stockPrice(10000, 150000);

    // Generate ~1250 trading days (5 years, weekdays only approximated)
    const start = new Date('2021-01-04');
    for (let d = 0; d < 1250; d++) {
      const date = new Date(start.getTime() + d * 86400000 * (7 / 5)); // skip weekends approx
      const dateStr = date.toISOString().slice(0, 10);

      // Random walk
      const change = price * faker.random.float(-0.07, 0.07);
      price = Math.max(1000, Math.round((price + change) / 100) * 100);

      const high = price + Math.round(faker.random.float(0, price * 0.03) / 100) * 100;
      const low = price - Math.round(faker.random.float(0, price * 0.03) / 100) * 100;
      const open = faker.random.int(low, high);
      const volume = faker.random.int(10000, 5000000);

      rows.push({
        symbol, exchange, trade_date: dateStr,
        open_vnd: open, high_vnd: high, low_vnd: Math.max(100, low), close_vnd: price,
        volume, value_vnd: price * volume,
        tenant_id: TENANT_ID,
      });
    }
  }
  return rows;
}

export function generateResearchNotes(faker: FakerVN): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  for (let i = 0; i < 500; i++) {
    const symbol = faker.random.pick([...HOSE_SYMBOLS, ...HNX_SYMBOLS]);
    rows.push({
      id: faker.uuid(), symbol,
      analyst: faker.fullName(),
      rating: faker.random.pick(RATINGS),
      target_price_vnd: faker.stockPrice(15000, 200000),
      published_at: faker.dateStr('2023-01-01', '2026-03-31'),
      summary: `[Synthetic] Analysis of ${symbol} - ${faker.random.pick(STRATEGIES)} outlook`,
      tenant_id: TENANT_ID,
    });
  }
  return rows;
}

export function generateSecuritiesDataset(seed: number = 42) {
  const faker = new FakerVN(seed);
  const customers = generateSecCustomers(faker);
  const accounts = generateAccounts(faker, customers);
  const marketData = generateMarketData(faker);
  const researchNotes = generateResearchNotes(faker);

  return { customers, accounts, market_data: marketData, research_notes: researchNotes, tables: SECURITIES_TABLES, seed };
}
