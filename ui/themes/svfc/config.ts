// ui/themes/svfc/config.ts
// P05-T02 — SVFC Theme Configuration

export const SVFC_THEME = {
  bu: 'svfc' as const,
  name: 'Shinhan Vietnam Finance Company',
  shortName: 'SVFC',
  surface: 'SF9',
  logoPath: '/assets/svfc-logo.svg',
  favicon: '/assets/svfc-favicon.ico',

  /** Sample questions shown on landing (MIS-style examples) */
  sampleQuestions: {
    en: [
      'What is the NPL ratio across all branches?',
      'Monthly disbursement trend for the last 12 months',
      'Top 10 branches by loan volume',
      'Total overdue amount by product type',
      'Collections success rate this quarter',
      'How many KYC-flagged customers are there?',
    ],
    vi: [
      'Tỷ lệ nợ xấu toàn hệ thống chi nhánh?',
      'Xu hướng giải ngân hàng tháng 12 tháng gần nhất',
      'Top 10 chi nhánh theo doanh số cho vay',
      'Tổng dư nợ quá hạn theo sản phẩm',
      'Tỷ lệ thu hồi nợ thành công quý này',
      'Có bao nhiêu khách hàng bị cờ KYC?',
    ],
  },

  /** Persona sandbox roles for demo */
  personas: [
    { id: 'mis-lead', label: 'MIS Lead', labelVi: 'Trưởng phòng MIS', role: 'analyst', scope: 'full' },
    { id: 'collections-mgr', label: 'Collections Manager', labelVi: 'Quản lý thu hồi nợ', role: 'operations', scope: 'collections' },
    { id: 'cfo', label: 'CFO', labelVi: 'Giám đốc Tài chính', role: 'executive', scope: 'full-restricted' },
  ],

  /** Dashboard presets */
  dashboards: [
    { id: 'portfolio-overview', title: 'Portfolio Overview', titleVi: 'Tổng quan Danh mục' },
    { id: 'collections-performance', title: 'Collections Performance', titleVi: 'Hiệu quả Thu hồi nợ' },
    { id: 'branch-comparison', title: 'Branch Comparison', titleVi: 'So sánh Chi nhánh' },
  ],
} as const;
