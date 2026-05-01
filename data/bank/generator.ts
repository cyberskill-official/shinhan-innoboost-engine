// data/bank/generator.ts
// P03-T02 — Bank HO Department Synthetic Dataset (SB5)
// Tables: branch_pnl, deposit_balances, forex_positions, lending_book,
//         treasury_positions, ops_incidents, customer_complaints

import { FakerVN, VN_PROVINCES } from '../_lib/faker-vn.js';
import type { TableDef, ColumnDef } from '../_lib/loader.js';

const COL = (name: string, pgType: string, opts: Partial<ColumnDef> = {}): ColumnDef => ({
  name, type: pgType, pgType,
  bqType: pgType.replace('SERIAL', 'INT64').replace('TEXT', 'STRING').replace('NUMERIC', 'NUMERIC').replace('DATE', 'DATE').replace('TIMESTAMP', 'TIMESTAMP').replace('BOOLEAN', 'BOOL').replace('INTEGER', 'INT64'),
  sfType: pgType.replace('SERIAL', 'NUMBER').replace('TEXT', 'VARCHAR'),
  nullable: opts.nullable ?? false, primaryKey: opts.primaryKey, sensitivity: opts.sensitivity,
});

const TENANT_ID = 'bank-shinhan';

export const BANK_TABLES: readonly TableDef[] = [
  {
    name: 'branch_pnl', schema: 'bank', description: 'Monthly P&L per branch (5yr × 60 branches)',
    rowCount: 3_600, // 60 branches × 60 months
    columns: [
      COL('branch_id', 'INTEGER'), COL('branch_name', 'TEXT'), COL('month', 'DATE'),
      COL('revenue_vnd', 'NUMERIC'), COL('cost_vnd', 'NUMERIC'), COL('profit_vnd', 'NUMERIC'),
      COL('nim_pct', 'NUMERIC'), COL('cost_income_ratio', 'NUMERIC'),
      COL('sensitivity', 'TEXT'), // public / internal / restricted
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'deposit_balances', schema: 'bank', description: 'Daily deposit balance (2yr × product × branch)',
    rowCount: 2_190_000, // ~60 branches × 5 products × 730 days
    columns: [
      COL('branch_id', 'INTEGER'), COL('product_type', 'TEXT'), COL('balance_date', 'DATE'),
      COL('balance_vnd', 'NUMERIC'), COL('account_count', 'INTEGER'),
      COL('avg_balance_vnd', 'NUMERIC'), COL('tenor_bucket', 'TEXT'),
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'forex_positions', schema: 'bank', description: 'Daily FX positions',
    rowCount: 7_300, // ~10 pairs × 730 days
    columns: [
      COL('position_date', 'DATE'), COL('currency_pair', 'TEXT'),
      COL('long_amount', 'NUMERIC'), COL('short_amount', 'NUMERIC'),
      COL('net_position', 'NUMERIC'), COL('mtm_pnl_vnd', 'NUMERIC'),
      COL('sensitivity', 'TEXT', { sensitivity: 'restricted' }),
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'lending_book', schema: 'bank', description: 'Monthly lending book snapshot',
    rowCount: 3_600, // 60 branches × 60 months
    columns: [
      COL('branch_id', 'INTEGER'), COL('month', 'DATE'), COL('segment', 'TEXT'),
      COL('outstanding_vnd', 'NUMERIC'), COL('disbursement_vnd', 'NUMERIC'),
      COL('npl_vnd', 'NUMERIC'), COL('npl_ratio_pct', 'NUMERIC'),
      COL('provision_vnd', 'NUMERIC'), COL('collateral_coverage_pct', 'NUMERIC'),
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'treasury_positions', schema: 'bank', description: 'Daily treasury/bond positions',
    rowCount: 14_600, // ~20 instruments × 730 days
    columns: [
      COL('position_date', 'DATE'), COL('instrument_type', 'TEXT'),
      COL('instrument_name', 'TEXT'), COL('face_value_vnd', 'NUMERIC'),
      COL('market_value_vnd', 'NUMERIC'), COL('yield_pct', 'NUMERIC'),
      COL('duration_years', 'NUMERIC'), COL('maturity_date', 'DATE'),
      COL('sensitivity', 'TEXT', { sensitivity: 'restricted' }),
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'ops_incidents', schema: 'bank', description: 'Operational incidents',
    rowCount: 2_400,
    columns: [
      COL('id', 'TEXT', { primaryKey: true }), COL('incident_date', 'TIMESTAMP'),
      COL('branch_id', 'INTEGER'), COL('category', 'TEXT'),
      COL('severity', 'TEXT'), COL('description', 'TEXT', { sensitivity: 'internal' }),
      COL('resolution_hours', 'NUMERIC'), COL('financial_impact_vnd', 'NUMERIC'),
      COL('status', 'TEXT'), COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'customer_complaints', schema: 'bank', description: 'Customer complaints log',
    rowCount: 8_000,
    columns: [
      COL('id', 'TEXT', { primaryKey: true }), COL('complaint_date', 'DATE'),
      COL('branch_id', 'INTEGER'), COL('category', 'TEXT'),
      COL('channel', 'TEXT'), COL('priority', 'TEXT'),
      COL('resolution_days', 'INTEGER'), COL('satisfied', 'BOOLEAN'),
      COL('tenant_id', 'TEXT'),
    ],
  },
];

// ─── Generators ──────────────────────────────────────────

const SEGMENTS = ['Retail', 'SME', 'Corporate', 'Interbank'] as const;
const DEPOSIT_PRODUCTS = ['CASA', 'Term 3M', 'Term 6M', 'Term 12M', 'Term 24M'] as const;
const FX_PAIRS = ['USD/VND', 'EUR/VND', 'JPY/VND', 'KRW/VND', 'GBP/VND', 'SGD/VND', 'CNY/VND', 'THB/VND', 'AUD/VND', 'CHF/VND'] as const;
const INSTRUMENTS = ['Gov Bond 3Y', 'Gov Bond 5Y', 'Gov Bond 10Y', 'Corp Bond A', 'Corp Bond BBB', 'T-Bill 91D', 'T-Bill 182D', 'T-Bill 364D', 'MBS Pool A', 'MBS Pool B', 'Repo ON', 'Repo 1W', 'CD 3M', 'CD 6M', 'Swap IRS 1Y', 'Swap IRS 3Y', 'Swap IRS 5Y', 'FRN AAA', 'SBV Bill', 'VN30 Futures'] as const;
const INCIDENT_CATS = ['system_outage', 'fraud_attempt', 'data_breach', 'process_failure', 'vendor_issue', 'compliance_gap'] as const;
const COMPLAINT_CATS = ['service_quality', 'wait_time', 'fee_dispute', 'product_issue', 'digital_banking', 'fraud_report'] as const;
const SENSITIVITY_MIX = [
  { value: 'public', weight: 50 },
  { value: 'internal', weight: 35 },
  { value: 'restricted', weight: 15 },
] as const;

export function generateBranchPnl(faker: FakerVN): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  const branches = VN_PROVINCES.slice(0, 60).concat(
    Array.from({ length: 28 }, (_, i) => `PGD-${i + 33}`),
  );

  for (let b = 0; b < 60; b++) {
    const branchName = b < 32 ? `CN ${branches[b]}` : branches[b];
    for (let m = 0; m < 60; m++) {
      const year = 2021 + Math.floor(m / 12);
      const month = (m % 12) + 1;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;
      const revenue = faker.vndAmount(2e9, 20e9);
      const cost = faker.vndAmount(1e9, revenue * 0.7);
      rows.push({
        branch_id: b + 1, branch_name: branchName, month: dateStr,
        revenue_vnd: revenue, cost_vnd: cost, profit_vnd: revenue - cost,
        nim_pct: faker.random.float(2.0, 5.5).toFixed(2),
        cost_income_ratio: (cost / revenue * 100).toFixed(1),
        sensitivity: faker.random.weighted(SENSITIVITY_MIX),
        tenant_id: TENANT_ID,
      });
    }
  }
  return rows;
}

export function generateForexPositions(faker: FakerVN): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  const start = new Date('2024-01-01');
  for (let d = 0; d < 730; d++) {
    const date = new Date(start.getTime() + d * 86400000).toISOString().slice(0, 10);
    for (const pair of FX_PAIRS) {
      const long = faker.vndAmount(10e9, 500e9);
      const short = faker.vndAmount(10e9, 500e9);
      rows.push({
        position_date: date, currency_pair: pair,
        long_amount: long, short_amount: short, net_position: long - short,
        mtm_pnl_vnd: faker.vndAmount(-5e9, 5e9),
        sensitivity: faker.random.weighted(SENSITIVITY_MIX),
        tenant_id: TENANT_ID,
      });
    }
  }
  return rows;
}

export function generateOpsIncidents(faker: FakerVN): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  for (let i = 0; i < 2400; i++) {
    const severity = faker.random.weighted([
      { value: 'critical', weight: 5 }, { value: 'high', weight: 15 },
      { value: 'medium', weight: 40 }, { value: 'low', weight: 40 },
    ]);
    rows.push({
      id: faker.uuid(), incident_date: faker.dateStr('2021-01-01', '2026-03-31'),
      branch_id: faker.random.int(1, 60), category: faker.random.pick(INCIDENT_CATS),
      severity, description: `[Synthetic] ${severity} incident at branch`,
      resolution_hours: faker.random.float(0.5, severity === 'critical' ? 72 : 24).toFixed(1),
      financial_impact_vnd: severity === 'critical' ? faker.vndAmount(100e6, 5e9) : faker.vndAmount(0, 100e6),
      status: faker.random.pick(['resolved', 'resolved', 'resolved', 'open', 'investigating']),
      tenant_id: TENANT_ID,
    });
  }
  return rows;
}

export function generateCustomerComplaints(faker: FakerVN): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  for (let i = 0; i < 8000; i++) {
    rows.push({
      id: faker.uuid(), complaint_date: faker.dateStr('2021-01-01', '2026-03-31'),
      branch_id: faker.random.int(1, 60), category: faker.random.pick(COMPLAINT_CATS),
      channel: faker.random.pick(['hotline', 'branch', 'email', 'app', 'social_media']),
      priority: faker.random.pick(['high', 'medium', 'low']),
      resolution_days: faker.random.int(1, 30),
      satisfied: faker.random.next() > 0.25,
      tenant_id: TENANT_ID,
    });
  }
  return rows;
}

export function generateBankDataset(seed: number = 42) {
  const faker = new FakerVN(seed);
  return {
    branch_pnl: generateBranchPnl(faker),
    forex_positions: generateForexPositions(faker),
    ops_incidents: generateOpsIncidents(faker),
    customer_complaints: generateCustomerComplaints(faker),
    tables: BANK_TABLES,
    seed,
  };
}
