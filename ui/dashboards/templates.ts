// ui/dashboards/templates.ts
// P05-T02..T04 — Pre-configured Dashboard Templates per BU
// Pin frequently asked questions, schedule digests

export interface DashboardWidget {
  readonly id: string;
  readonly type: 'pinned-question' | 'metric-card' | 'chart' | 'table' | 'alert-feed';
  readonly title: string;
  readonly titleVi: string;
  readonly question?: string;   // For pinned-question type
  readonly refreshInterval?: number;  // Seconds, 0 = manual
  readonly span: 1 | 2 | 3;    // Grid column span
}

export interface DashboardTemplate {
  readonly id: string;
  readonly bu: 'svfc' | 'bank' | 'securities';
  readonly title: string;
  readonly titleVi: string;
  readonly description: string;
  readonly widgets: readonly DashboardWidget[];
  readonly digestSchedule?: {
    readonly frequency: 'daily' | 'weekly' | 'monthly';
    readonly dayOfWeek?: number;  // 0 = Sunday
    readonly timeUtc: string;     // "08:00"
  };
}

// ─── SVFC Dashboards ─────────────────────────────────────

export const SVFC_DASHBOARDS: readonly DashboardTemplate[] = [
  {
    id: 'svfc-portfolio', bu: 'svfc',
    title: 'Portfolio Overview', titleVi: 'Tổng quan Danh mục',
    description: 'Key consumer finance metrics at a glance',
    widgets: [
      { id: 'w1', type: 'metric-card', title: 'Total Outstanding', titleVi: 'Tổng dư nợ', span: 1 },
      { id: 'w2', type: 'metric-card', title: 'NPL Ratio', titleVi: 'Tỷ lệ Nợ xấu', span: 1 },
      { id: 'w3', type: 'metric-card', title: 'Disbursement MTD', titleVi: 'Giải ngân trong tháng', span: 1 },
      { id: 'w4', type: 'chart', title: 'Disbursement Trend', titleVi: 'Xu hướng Giải ngân', span: 2, refreshInterval: 3600 },
      { id: 'w5', type: 'pinned-question', title: 'NPL by Branch', titleVi: 'Nợ xấu theo Chi nhánh', question: 'What is the NPL ratio across all branches?', span: 1 },
      { id: 'w6', type: 'table', title: 'Top 10 Branches', titleVi: 'Top 10 Chi nhánh', span: 3 },
    ],
    digestSchedule: { frequency: 'daily', timeUtc: '01:00' },
  },
  {
    id: 'svfc-collections', bu: 'svfc',
    title: 'Collections Performance', titleVi: 'Hiệu quả Thu hồi nợ',
    description: 'Collections tracking and performance metrics',
    widgets: [
      { id: 'w1', type: 'metric-card', title: 'Recovery Rate', titleVi: 'Tỷ lệ Thu hồi', span: 1 },
      { id: 'w2', type: 'metric-card', title: 'Total Overdue', titleVi: 'Tổng Quá hạn', span: 1 },
      { id: 'w3', type: 'metric-card', title: 'Collectors Active', titleVi: 'Thu hồi viên', span: 1 },
      { id: 'w4', type: 'chart', title: 'Recovery Trend', titleVi: 'Xu hướng Thu hồi', span: 2, refreshInterval: 3600 },
      { id: 'w5', type: 'pinned-question', title: 'Overdue by Product', titleVi: 'Quá hạn theo Sản phẩm', question: 'Total overdue amount by product type', span: 1 },
    ],
  },
];

// ─── Bank Dashboards ─────────────────────────────────────

export const BANK_DASHBOARDS: readonly DashboardTemplate[] = [
  {
    id: 'bank-pnl', bu: 'bank',
    title: 'Bank P&L Overview', titleVi: 'Tổng quan Lãi lỗ',
    description: 'Branch-level profit and loss tracking',
    widgets: [
      { id: 'w1', type: 'metric-card', title: 'Total Profit', titleVi: 'Tổng Lợi nhuận', span: 1 },
      { id: 'w2', type: 'metric-card', title: 'NIM', titleVi: 'Biên lãi ròng', span: 1 },
      { id: 'w3', type: 'metric-card', title: 'CIR', titleVi: 'Tỷ lệ Chi phí/Thu nhập', span: 1 },
      { id: 'w4', type: 'chart', title: 'Monthly Profit Trend', titleVi: 'Xu hướng Lợi nhuận', span: 2 },
      { id: 'w5', type: 'table', title: 'Top Branches', titleVi: 'Chi nhánh Hàng đầu', span: 1 },
      { id: 'w6', type: 'alert-feed', title: 'Recent Incidents', titleVi: 'Sự cố Gần đây', span: 3 },
    ],
    digestSchedule: { frequency: 'weekly', dayOfWeek: 1, timeUtc: '01:00' },
  },
  {
    id: 'bank-risk', bu: 'bank',
    title: 'Risk Dashboard', titleVi: 'Dashboard Rủi ro',
    description: 'Credit, market, and operational risk overview',
    widgets: [
      { id: 'w1', type: 'metric-card', title: 'NPL Ratio', titleVi: 'Tỷ lệ Nợ xấu', span: 1 },
      { id: 'w2', type: 'metric-card', title: 'FX Exposure', titleVi: 'Rủi ro Ngoại hối', span: 1 },
      { id: 'w3', type: 'metric-card', title: 'Open Incidents', titleVi: 'Sự cố Mở', span: 1 },
      { id: 'w4', type: 'chart', title: 'NPL Segment Comparison', titleVi: 'So sánh Nợ xấu', span: 2 },
      { id: 'w5', type: 'pinned-question', title: 'Collateral Coverage', titleVi: 'Tỷ lệ Tài sản đảm bảo', question: 'Collateral coverage by segment?', span: 1 },
    ],
  },
];

// ─── Securities Dashboards ───────────────────────────────

export const SECURITIES_DASHBOARDS: readonly DashboardTemplate[] = [
  {
    id: 'sec-market', bu: 'securities',
    title: 'Market Overview', titleVi: 'Tổng quan Thị trường',
    description: 'Live market data and trading activity',
    widgets: [
      { id: 'w1', type: 'metric-card', title: 'HOSE Volume', titleVi: 'Khối lượng HOSE', span: 1, refreshInterval: 60 },
      { id: 'w2', type: 'metric-card', title: 'HNX Volume', titleVi: 'Khối lượng HNX', span: 1, refreshInterval: 60 },
      { id: 'w3', type: 'metric-card', title: 'Active Accounts', titleVi: 'Tài khoản Hoạt động', span: 1 },
      { id: 'w4', type: 'chart', title: 'Monthly Trading Value', titleVi: 'Giá trị Giao dịch', span: 2 },
      { id: 'w5', type: 'table', title: 'Top 10 Stocks', titleVi: 'Top 10 Cổ phiếu', span: 1, refreshInterval: 300 },
    ],
    digestSchedule: { frequency: 'daily', timeUtc: '09:00' },
  },
  {
    id: 'sec-portfolio', bu: 'securities',
    title: 'Portfolio Tracker', titleVi: 'Theo dõi Danh mục',
    description: 'Portfolio performance and strategy analysis',
    widgets: [
      { id: 'w1', type: 'metric-card', title: 'Total AUM', titleVi: 'Tổng Tài sản Quản lý', span: 1 },
      { id: 'w2', type: 'metric-card', title: 'Unrealised P&L', titleVi: 'Lãi/Lỗ Chưa thực hiện', span: 1 },
      { id: 'w3', type: 'metric-card', title: 'Buy/Sell Ratio', titleVi: 'Tỷ lệ Mua/Bán', span: 1 },
      { id: 'w4', type: 'chart', title: 'Return by Strategy', titleVi: 'Lợi nhuận theo Chiến lược', span: 3 },
    ],
  },
];
