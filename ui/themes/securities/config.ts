// ui/themes/securities/config.ts
// P05-T04 — Securities Theme Configuration

export const SECURITIES_THEME = {
  bu: 'securities' as const,
  name: 'Shinhan Securities Vietnam',
  shortName: 'Securities',
  surface: 'SS1',
  logoPath: '/assets/securities-logo.svg',
  favicon: '/assets/securities-favicon.ico',

  /** Ticker-aware: type "$VNM" → contextual portfolio drilldown */
  tickerPattern: /\$([A-Z]{2,4})/g,
  enableTickerAutocomplete: true,

  sampleQuestions: {
    en: [
      'What is the closing price of $VNM today?',
      'Compare $VCB vs $TCB performance this year',
      'Total trading volume on HOSE today',
      'Top 10 most traded stocks this week',
      'What is FPT\'s 52-week high?',
      'Buy vs sell ratio for today',
    ],
    vi: [
      'Giá đóng cửa $VNM hôm nay?',
      'So sánh hiệu suất $VCB và $TCB năm nay',
      'Tổng khối lượng giao dịch sàn HOSE hôm nay',
      'Top 10 cổ phiếu giao dịch nhiều nhất tuần',
      'Giá cao nhất 52 tuần của FPT?',
      'Tỷ lệ mua/bán hôm nay',
    ],
  },

  /** Market data strip symbols */
  marketStripSymbols: ['VNM', 'VCB', 'VHM', 'HPG', 'FPT', 'MWG', 'TCB', 'MBB', 'ACB', 'VPB'],

  personas: [
    { id: 'trader', label: 'Trader', labelVi: 'Nhân viên Giao dịch', role: 'trader', scope: 'trades' },
    { id: 'analyst', label: 'Research Analyst', labelVi: 'Chuyên viên Phân tích', role: 'analyst', scope: 'research' },
    { id: 'portfolio-mgr', label: 'Portfolio Manager', labelVi: 'Quản lý Danh mục', role: 'manager', scope: 'full' },
  ],

  dashboards: [
    { id: 'market-overview', title: 'Market Overview', titleVi: 'Tổng quan Thị trường' },
    { id: 'portfolio-tracker', title: 'Portfolio Tracker', titleVi: 'Theo dõi Danh mục' },
    { id: 'trading-activity', title: 'Trading Activity', titleVi: 'Hoạt động Giao dịch' },
  ],
} as const;
