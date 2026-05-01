// ui/themes/bank/config.ts
// P05-T03 — Bank HO Theme Configuration

export const BANK_THEME = {
  bu: 'bank' as const,
  name: 'Shinhan Bank Head Office',
  shortName: 'Bank HO',
  surface: 'SB5',
  logoPath: '/assets/bank-logo.svg',
  favicon: '/assets/bank-favicon.ico',

  /** Positions chat as complement to Power BI */
  complementBanner: {
    en: 'This tool complements your existing BI dashboards — ask questions in natural language and get cited, auditable answers.',
    vi: 'Công cụ này bổ trợ cho dashboard BI hiện tại — đặt câu hỏi bằng ngôn ngữ tự nhiên và nhận câu trả lời có trích dẫn, có thể kiểm tra.',
  },

  /** Sample questions geared to HO departments blocked by ICT-Reporting */
  sampleQuestions: {
    en: [
      'Total profit across all branches in 2025',
      'NPL ratio by segment for the latest month',
      'Compare SME vs Retail lending performance',
      'Net FX position for USD/VND today',
      'Top 5 branches by revenue this year',
      'Incident frequency trend — is it improving?',
    ],
    vi: [
      'Tổng lợi nhuận toàn hệ thống 2025',
      'Tỷ lệ nợ xấu theo phân khúc tháng gần nhất',
      'So sánh hiệu quả cho vay SME và Bán lẻ',
      'Trạng thái ngoại hối ròng USD/VND hôm nay',
      'Top 5 chi nhánh doanh thu cao nhất năm nay',
      'Xu hướng sự cố vận hành — có cải thiện không?',
    ],
  },

  personas: [
    { id: 'dept-head', label: 'Department Head', labelVi: 'Trưởng phòng Ban', role: 'manager', scope: 'department' },
    { id: 'risk-officer', label: 'Risk Officer', labelVi: 'Nhân viên Quản lý Rủi ro', role: 'risk', scope: 'restricted' },
    { id: 'ceo', label: 'CEO', labelVi: 'Tổng Giám đốc', role: 'executive', scope: 'full-restricted' },
  ],

  dashboards: [
    { id: 'bank-pnl', title: 'Bank P&L Overview', titleVi: 'Tổng quan Lãi lỗ' },
    { id: 'risk-dashboard', title: 'Risk Dashboard', titleVi: 'Dashboard Rủi ro' },
    { id: 'treasury-positions', title: 'Treasury Positions', titleVi: 'Trạng thái Ngân quỹ' },
  ],

  /** HITL is prominently featured for SB5 */
  hitlConfig: {
    slaMinutes: 30,
    showBannerOnRegulated: true,
    autoRouteRestrictedTier: true,
  },
} as const;
