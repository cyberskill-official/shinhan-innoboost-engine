// data/svfc/generator.ts
// P03-T01 — SVFC Consumer Finance Synthetic Dataset
// Tables: branches, products, customers, loans, payments, risk_scores,
//         collections_actions, marketing_campaigns

import { FakerVN, VN_PROVINCES } from '../_lib/faker-vn.js';
import type { TableDef, ColumnDef } from '../_lib/loader.js';

// ─── Schema Definitions ──────────────────────────────────

const COL = (name: string, pgType: string, opts: Partial<ColumnDef> = {}): ColumnDef => ({
  name, type: pgType, pgType,
  bqType: pgType.replace('SERIAL', 'INT64').replace('TEXT', 'STRING').replace('NUMERIC', 'NUMERIC').replace('DATE', 'DATE').replace('TIMESTAMP', 'TIMESTAMP').replace('BOOLEAN', 'BOOL').replace('INTEGER', 'INT64').replace('JSONB', 'JSON'),
  sfType: pgType.replace('SERIAL', 'NUMBER').replace('TEXT', 'VARCHAR').replace('JSONB', 'VARIANT'),
  nullable: opts.nullable ?? false, primaryKey: opts.primaryKey, sensitivity: opts.sensitivity,
});

export const SVFC_TABLES: readonly TableDef[] = [
  {
    name: 'branches', schema: 'svfc', description: '32 SVFC branches across Vietnam',
    rowCount: 32,
    columns: [
      COL('id', 'SERIAL', { primaryKey: true }),
      COL('branch_code', 'TEXT'),
      COL('branch_name', 'TEXT'),
      COL('province', 'TEXT'),
      COL('region', 'TEXT'),
      COL('opened_at', 'DATE'),
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'products', schema: 'svfc', description: '12 consumer finance products',
    rowCount: 12,
    columns: [
      COL('id', 'SERIAL', { primaryKey: true }),
      COL('product_code', 'TEXT'),
      COL('product_name', 'TEXT'),
      COL('category', 'TEXT'),
      COL('min_amount_vnd', 'NUMERIC'),
      COL('max_amount_vnd', 'NUMERIC'),
      COL('term_months_min', 'INTEGER'),
      COL('term_months_max', 'INTEGER'),
      COL('base_rate_pct', 'NUMERIC'),
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'customers', schema: 'svfc', description: '~50K consumer finance customers',
    rowCount: 50_000,
    columns: [
      COL('id', 'TEXT', { primaryKey: true }),
      COL('full_name', 'TEXT', { sensitivity: 'restricted' }),
      COL('cccd', 'TEXT', { sensitivity: 'regulated' }),
      COL('phone', 'TEXT', { sensitivity: 'restricted' }),
      COL('email', 'TEXT', { sensitivity: 'restricted' }),
      COL('province', 'TEXT'),
      COL('date_of_birth', 'DATE', { sensitivity: 'restricted' }),
      COL('kyc_status', 'TEXT'),
      COL('kyc_flagged', 'BOOLEAN'),
      COL('created_at', 'TIMESTAMP'),
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'loans', schema: 'svfc', description: '~120K loans with NPL ~2.5%',
    rowCount: 120_000,
    columns: [
      COL('id', 'TEXT', { primaryKey: true }),
      COL('customer_id', 'TEXT'),
      COL('product_id', 'INTEGER'),
      COL('branch_id', 'INTEGER'),
      COL('principal_vnd', 'NUMERIC'),
      COL('interest_rate_pct', 'NUMERIC'),
      COL('term_months', 'INTEGER'),
      COL('originated_at', 'DATE'),
      COL('maturity_date', 'DATE'),
      COL('status', 'TEXT'), // active, closed, overdue, written_off, restructured
      COL('dpd', 'INTEGER'), // days past due
      COL('currency', 'TEXT'), // VND, USD (dual-currency edge case)
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'payments', schema: 'svfc', description: '~2M payment records',
    rowCount: 2_000_000,
    columns: [
      COL('id', 'TEXT', { primaryKey: true }),
      COL('loan_id', 'TEXT'),
      COL('payment_date', 'DATE'),
      COL('amount_vnd', 'NUMERIC'),
      COL('principal_portion', 'NUMERIC'),
      COL('interest_portion', 'NUMERIC'),
      COL('payment_method', 'TEXT'),
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'risk_scores', schema: 'svfc', description: 'Daily risk score snapshots (365d)',
    rowCount: 18_250_000, // 50K customers × 365 days
    columns: [
      COL('customer_id', 'TEXT'),
      COL('score_date', 'DATE'),
      COL('risk_score', 'NUMERIC'),
      COL('risk_band', 'TEXT'),
      COL('model_version', 'TEXT'),
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'collections_actions', schema: 'svfc', description: 'Collections actions on overdue loans',
    rowCount: 15_000,
    columns: [
      COL('id', 'TEXT', { primaryKey: true }),
      COL('loan_id', 'TEXT'),
      COL('action_type', 'TEXT'), // call, sms, letter, field_visit, legal
      COL('action_date', 'DATE'),
      COL('outcome', 'TEXT'), // contacted, promise_to_pay, no_answer, escalated
      COL('agent_id', 'TEXT'),
      COL('notes', 'TEXT', { sensitivity: 'internal' }),
      COL('tenant_id', 'TEXT'),
    ],
  },
  {
    name: 'marketing_campaigns', schema: 'svfc', description: 'Marketing campaign performance',
    rowCount: 50,
    columns: [
      COL('id', 'TEXT', { primaryKey: true }),
      COL('campaign_name', 'TEXT'),
      COL('channel', 'TEXT'),
      COL('start_date', 'DATE'),
      COL('end_date', 'DATE'),
      COL('budget_vnd', 'NUMERIC'),
      COL('leads_generated', 'INTEGER'),
      COL('conversions', 'INTEGER'),
      COL('tenant_id', 'TEXT'),
    ],
  },
];

// ─── Data Generators ─────────────────────────────────────

const REGIONS: Record<string, string> = {
  'Hà Nội': 'North', 'TP. Hồ Chí Minh': 'South', 'Đà Nẵng': 'Central',
  'Hải Phòng': 'North', 'Cần Thơ': 'South', 'Bình Dương': 'South',
  'Đồng Nai': 'South', 'Khánh Hòa': 'Central', 'Thanh Hóa': 'North',
  'Nghệ An': 'North', 'Quảng Ninh': 'North', 'Bắc Ninh': 'North',
};

const LOAN_PRODUCTS = [
  { code: 'PL-01', name: 'Vay tiêu dùng cá nhân', cat: 'personal', min: 5e6, max: 200e6, termMin: 6, termMax: 60, rate: 18 },
  { code: 'ML-01', name: 'Vay mua xe máy', cat: 'vehicle', min: 3e6, max: 80e6, termMin: 6, termMax: 36, rate: 22 },
  { code: 'CL-01', name: 'Vay mua ô tô cũ', cat: 'vehicle', min: 50e6, max: 500e6, termMin: 12, termMax: 72, rate: 15 },
  { code: 'HL-01', name: 'Vay mua nhà', cat: 'housing', min: 100e6, max: 3000e6, termMin: 60, termMax: 240, rate: 10 },
  { code: 'CC-01', name: 'Thẻ tín dụng', cat: 'credit_card', min: 5e6, max: 100e6, termMin: 1, termMax: 12, rate: 28 },
  { code: 'ED-01', name: 'Vay du học', cat: 'education', min: 10e6, max: 500e6, termMin: 12, termMax: 60, rate: 12 },
  { code: 'AG-01', name: 'Vay nông nghiệp', cat: 'agriculture', min: 5e6, max: 100e6, termMin: 3, termMax: 36, rate: 14 },
  { code: 'BZ-01', name: 'Vay kinh doanh nhỏ', cat: 'sme', min: 20e6, max: 500e6, termMin: 6, termMax: 60, rate: 16 },
  { code: 'PL-02', name: 'Vay trả góp điện thoại', cat: 'personal', min: 2e6, max: 40e6, termMin: 3, termMax: 18, rate: 25 },
  { code: 'CL-02', name: 'Vay mua ô tô mới', cat: 'vehicle', min: 200e6, max: 2000e6, termMin: 12, termMax: 84, rate: 8 },
  { code: 'OD-01', name: 'Thấu chi', cat: 'overdraft', min: 5e6, max: 50e6, termMin: 1, termMax: 12, rate: 20 },
  { code: 'RF-01', name: 'Vay tái cấp vốn', cat: 'refinance', min: 10e6, max: 300e6, termMin: 6, termMax: 48, rate: 13 },
];

const TENANT_ID = 'svfc-shinhan';

export function generateBranches(faker: FakerVN): Record<string, unknown>[] {
  return VN_PROVINCES.slice(0, 32).map((province, i) => ({
    id: i + 1,
    branch_code: `BR-${String(i + 1).padStart(3, '0')}`,
    branch_name: `Chi nhánh ${province}`,
    province,
    region: REGIONS[province] ?? faker.random.pick(['North', 'Central', 'South']),
    opened_at: faker.dateStr('2015-01-01', '2024-12-31'),
    tenant_id: TENANT_ID,
  }));
}

export function generateProducts(): Record<string, unknown>[] {
  return LOAN_PRODUCTS.map((p, i) => ({
    id: i + 1, product_code: p.code, product_name: p.name, category: p.cat,
    min_amount_vnd: p.min, max_amount_vnd: p.max,
    term_months_min: p.termMin, term_months_max: p.termMax,
    base_rate_pct: p.rate, tenant_id: TENANT_ID,
  }));
}

export function generateCustomers(faker: FakerVN, count: number = 50_000): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const name = faker.fullName();
    const kycFlagged = faker.random.next() < 0.02; // 2% flagged
    rows.push({
      id: faker.uuid(), full_name: name, cccd: faker.cccd(),
      phone: faker.phone(), email: faker.email(name),
      province: faker.province(),
      date_of_birth: faker.dateStr('1960-01-01', '2004-12-31'),
      kyc_status: kycFlagged ? 'flagged' : 'verified',
      kyc_flagged: kycFlagged,
      created_at: faker.dateStr('2018-01-01', '2026-03-31'),
      tenant_id: TENANT_ID,
    });
  }
  return rows;
}

export function generateLoans(
  faker: FakerVN,
  customers: readonly Record<string, unknown>[],
  count: number = 120_000,
): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  const products = LOAN_PRODUCTS;

  for (let i = 0; i < count; i++) {
    const customer = faker.random.pick(customers);
    const product = faker.random.pick(products);
    const principal = faker.vndAmount(product.min, product.max);
    const term = faker.random.int(product.termMin, product.termMax);
    const originDate = faker.dateStr('2021-01-01', '2026-03-31');
    const maturityDate = new Date(new Date(originDate).getTime() + term * 30 * 86400000).toISOString().slice(0, 10);

    // NPL distribution: ~2.5% overdue, ~0.3% written off, ~0.2% restructured
    const statusRoll = faker.random.next();
    let status = 'active';
    let dpd = 0;
    if (statusRoll < 0.60) { status = 'closed'; }
    else if (statusRoll < 0.975) { status = 'active'; }
    else if (statusRoll < 0.995) { status = 'overdue'; dpd = faker.random.int(30, 180); }
    else if (statusRoll < 0.998) { status = 'written_off'; dpd = faker.random.int(180, 365); }
    else { status = 'restructured'; dpd = faker.random.int(0, 90); }

    const currency = faker.random.next() < 0.01 ? 'USD' : 'VND'; // 1% dual-currency

    rows.push({
      id: faker.uuid(), customer_id: customer['id'], product_id: products.indexOf(product) + 1,
      branch_id: faker.random.int(1, 32), principal_vnd: principal,
      interest_rate_pct: product.rate + faker.random.float(-2, 3),
      term_months: term, originated_at: originDate, maturity_date: maturityDate,
      status, dpd, currency, tenant_id: TENANT_ID,
    });
  }
  return rows;
}

export function generateSvfcDataset(seed: number = 42) {
  const faker = new FakerVN(seed);
  const branches = generateBranches(faker);
  const products = generateProducts();
  const customers = generateCustomers(faker);
  const loans = generateLoans(faker, customers);

  return { branches, products, customers, loans, tables: SVFC_TABLES, seed };
}
